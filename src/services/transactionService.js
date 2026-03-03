/**
 * Transaction Service — Supabase-based portfolio CRUD
 * 
 * Tables required in Supabase:
 * 
 * user_transactions:
 *   id (uuid, pk, default gen_random_uuid())
 *   user_id (text, not null)
 *   asset_type (text, not null)  -- MUTUAL_FUND, STOCK_IN, STOCK_US, CRYPTO, GOLD
 *   symbol (text, not null)
 *   symbol_name (text)
 *   transaction_date (date, not null)
 *   amount (numeric, not null)
 *   units (numeric)
 *   transaction_type (text, not null) -- BUY, SELL, SIP_BUY, DIVIDEND
 *   notes (text)
 *   created_at (timestamptz, default now())
 *
 * user_manual_assets:
 *   id (uuid, pk, default gen_random_uuid())
 *   user_id (text, not null)
 *   asset_type (text, not null)  -- DEBT, REAL_ESTATE, CASH, etc.
 *   asset_name (text, not null)
 *   current_value (numeric)
 *   invested_value (numeric)
 *   notes (text)
 *   last_updated (timestamptz, default now())
 *   created_at (timestamptz, default now())
 *
 * market_data_cache:
 *   id (uuid, pk, default gen_random_uuid())
 *   cache_key (text, unique, not null)
 *   data (jsonb, not null)
 *   expires_at (timestamptz, not null)
 *   created_at (timestamptz, default now())
 */
import { supabase } from './supabase';
import { cachedFetch, TTL_PRESETS } from './apiCache';

// ─── Supabase Data Cache ────────────────────────────────────
// 3rd-tier cache: client cache → sessionStorage → Supabase table
// This prevents exhausting Supabase row reads by wrapping queries with client cache

async function cachedSupabaseQuery(cacheKey, queryFn, ttlMs = 5 * 60 * 1000) {
    return cachedFetch(cacheKey, queryFn, ttlMs);
}

// ─── Transactions CRUD ──────────────────────────────────────

/**
 * Add a new transaction
 */
export async function addTransaction(userId, transaction) {
    const { data, error } = await supabase
        .from('user_transactions')
        .insert({
            user_id: userId,
            asset_type: transaction.assetType,
            symbol: transaction.symbol,
            symbol_name: transaction.symbolName || '',
            transaction_date: transaction.transactionDate,
            amount: parseFloat(transaction.amount),
            units: transaction.units ? parseFloat(transaction.units) : null,
            transaction_type: transaction.transactionType,
            notes: transaction.notes || '',
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return mapTransaction(data);
}

/**
 * Get all transactions for a user (cached 2 min client-side)
 */
export async function getTransactions(userId) {
    return cachedSupabaseQuery(`supa_txns_${userId}`, async () => {
        const { data, error } = await supabase
            .from('user_transactions')
            .select('*')
            .eq('user_id', userId)
            .order('transaction_date', { ascending: false });

        if (error) throw new Error(error.message);
        return (data || []).map(mapTransaction);
    }, 2 * 60 * 1000); // 2 min cache
}

/**
 * Get transactions filtered by asset type
 */
export async function getTransactionsByType(userId, assetType) {
    return cachedSupabaseQuery(`supa_txns_${userId}_${assetType}`, async () => {
        const { data, error } = await supabase
            .from('user_transactions')
            .select('*')
            .eq('user_id', userId)
            .eq('asset_type', assetType)
            .order('transaction_date', { ascending: false });

        if (error) throw new Error(error.message);
        return (data || []).map(mapTransaction);
    }, 2 * 60 * 1000);
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(transactionId) {
    const { error } = await supabase
        .from('user_transactions')
        .delete()
        .eq('id', transactionId);

    if (error) throw new Error(error.message);
}

// ─── Manual Assets CRUD ─────────────────────────────────────

/**
 * Add a manual asset (debt, real estate, cash, etc.)
 */
export async function addManualAsset(userId, asset) {
    const { data, error } = await supabase
        .from('user_manual_assets')
        .insert({
            user_id: userId,
            asset_type: asset.assetType,
            asset_name: asset.assetName,
            current_value: parseFloat(asset.currentValue),
            invested_value: asset.investedValue ? parseFloat(asset.investedValue) : null,
            notes: asset.notes || '',
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return mapManualAsset(data);
}

/**
 * Get all manual assets for a user (cached 2 min)
 */
export async function getManualAssets(userId) {
    return cachedSupabaseQuery(`supa_manuals_${userId}`, async () => {
        const { data, error } = await supabase
            .from('user_manual_assets')
            .select('*')
            .eq('user_id', userId);

        if (error) throw new Error(error.message);
        return (data || []).map(mapManualAsset);
    }, 2 * 60 * 1000);
}

/**
 * Delete a manual asset
 */
export async function deleteManualAsset(assetId) {
    const { error } = await supabase
        .from('user_manual_assets')
        .delete()
        .eq('id', assetId);

    if (error) throw new Error(error.message);
}

// ─── Row Mappers (snake_case → camelCase) ────────────────────

function mapTransaction(row) {
    return {
        id: row.id,
        userId: row.user_id,
        assetType: row.asset_type,
        symbol: row.symbol,
        symbolName: row.symbol_name,
        transactionDate: row.transaction_date,
        amount: parseFloat(row.amount),
        units: row.units ? parseFloat(row.units) : null,
        transactionType: row.transaction_type,
        notes: row.notes,
        createdAt: row.created_at,
    };
}

function mapManualAsset(row) {
    return {
        id: row.id,
        userId: row.user_id,
        assetType: row.asset_type,
        assetName: row.asset_name,
        currentValue: parseFloat(row.current_value || 0),
        investedValue: row.invested_value ? parseFloat(row.invested_value) : null,
        notes: row.notes,
        lastUpdated: row.last_updated,
        createdAt: row.created_at,
    };
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

    if (currentValue > 0) {
        cashflows.push({ date: new Date(), amount: currentValue });
    }

    return cashflows.sort((a, b) => a.date - b.date);
}
