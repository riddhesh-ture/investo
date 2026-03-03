/**
 * Transaction Service — Firestore-based portfolio CRUD
 * Manages user transactions and manual asset entries
 */
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Transactions CRUD ──────────────────────────────────────

/**
 * Add a new transaction
 */
export async function addTransaction(userId, transaction) {
    if (!db) throw new Error('Firebase not configured');
    const colRef = collection(db, 'user_transactions');
    const docData = {
        userId,
        assetType: transaction.assetType,
        symbol: transaction.symbol,
        symbolName: transaction.symbolName || '',
        transactionDate: transaction.transactionDate,
        amount: parseFloat(transaction.amount),
        units: transaction.units ? parseFloat(transaction.units) : null,
        transactionType: transaction.transactionType, // BUY, SELL, SIP_BUY, DIVIDEND
        notes: transaction.notes || '',
        createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(colRef, docData);
    return { id: docRef.id, ...docData };
}

/**
 * Get all transactions for a user
 */
export async function getTransactions(userId) {
    if (!db) return [];
    const colRef = collection(db, 'user_transactions');
    const q = query(
        colRef,
        where('userId', '==', userId),
        orderBy('transactionDate', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Get transactions filtered by asset type
 */
export async function getTransactionsByType(userId, assetType) {
    if (!db) return [];
    const colRef = collection(db, 'user_transactions');
    const q = query(
        colRef,
        where('userId', '==', userId),
        where('assetType', '==', assetType),
        orderBy('transactionDate', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(transactionId) {
    if (!db) throw new Error('Firebase not configured');
    await deleteDoc(doc(db, 'user_transactions', transactionId));
}

// ─── Manual Assets CRUD ─────────────────────────────────────

/**
 * Add/update a manual asset (debt, real estate, cash, etc.)
 */
export async function addManualAsset(userId, asset) {
    if (!db) throw new Error('Firebase not configured');
    const colRef = collection(db, 'user_manual_assets');
    const docData = {
        userId,
        assetType: asset.assetType,
        assetName: asset.assetName,
        currentValue: parseFloat(asset.currentValue),
        investedValue: asset.investedValue ? parseFloat(asset.investedValue) : null,
        notes: asset.notes || '',
        lastUpdated: new Date().toISOString(),
        createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(colRef, docData);
    return { id: docRef.id, ...docData };
}

/**
 * Get all manual assets for a user
 */
export async function getManualAssets(userId) {
    if (!db) return [];
    const colRef = collection(db, 'user_manual_assets');
    const q = query(colRef, where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Delete a manual asset
 */
export async function deleteManualAsset(assetId) {
    if (!db) throw new Error('Firebase not configured');
    await deleteDoc(doc(db, 'user_manual_assets', assetId));
}

// ─── Portfolio Aggregation ──────────────────────────────────

/**
 * Aggregate transactions into holdings.
 * Groups by (assetType, symbol) and calculates:
 * - totalUnits, totalInvested, avgBuyPrice
 */
export function aggregateHoldings(transactions) {
    const holdingsMap = {};

    for (const tx of transactions) {
        const key = `${tx.assetType}:${tx.symbol}`;
        if (!holdingsMap[key]) {
            holdingsMap[key] = {
                assetType: tx.assetType,
                symbol: tx.symbol,
                symbolName: tx.symbolName || tx.symbol,
                totalUnits: 0,
                totalInvested: 0,
                transactions: [],
            };
        }

        const h = holdingsMap[key];
        h.transactions.push(tx);

        if (tx.transactionType === 'BUY' || tx.transactionType === 'SIP_BUY') {
            h.totalUnits += tx.units || 0;
            h.totalInvested += tx.amount || 0;
        } else if (tx.transactionType === 'SELL') {
            h.totalUnits -= tx.units || 0;
            h.totalInvested -= tx.amount || 0;
        }
        // DIVIDEND doesn't affect units or invested amount
    }

    return Object.values(holdingsMap)
        .filter((h) => h.totalUnits > 0 || h.assetType === 'GOLD')
        .map((h) => ({
            ...h,
            avgBuyPrice: h.totalUnits > 0 ? h.totalInvested / h.totalUnits : 0,
        }));
}

/**
 * Build XIRR cashflow array for a holding's transactions.
 * @param {Array} transactions - sorted by date
 * @param {number} currentValue - current market value
 * @returns {Array<{amount: number, date: Date}>}
 */
export function buildXIRRCashflows(transactions, currentValue) {
    const cashflows = transactions
        .filter((tx) => tx.transactionType !== 'DIVIDEND')
        .map((tx) => ({
            date: tx.transactionDate instanceof Date
                ? tx.transactionDate
                : new Date(tx.transactionDate),
            amount: (tx.transactionType === 'BUY' || tx.transactionType === 'SIP_BUY')
                ? -Math.abs(tx.amount)
                : Math.abs(tx.amount),
        }));

    // Add current value as final positive cashflow (today)
    if (currentValue > 0) {
        cashflows.push({ date: new Date(), amount: currentValue });
    }

    return cashflows.sort((a, b) => a.date - b.date);
}
