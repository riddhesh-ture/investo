/**
 * Financial metrics calculation utilities.
 * All based on historical NAV data from api.mfapi.in.
 */

/**
 * Parse date string from API format (dd-mm-yyyy) to Date object.
 */
export function parseNavDate(dateStr) {
    const [dd, mm, yyyy] = dateStr.split('-');
    return new Date(`${yyyy}-${mm}-${dd}`);
}

/**
 * Process raw API NAV data into sorted chronological array.
 */
export function processNavData(rawData) {
    if (!rawData || !Array.isArray(rawData)) return [];
    return rawData
        .map((d) => ({ date: parseNavDate(d.date), nav: parseFloat(d.nav) }))
        .filter((d) => !isNaN(d.nav) && d.date instanceof Date && !isNaN(d.date))
        .sort((a, b) => a.date - b.date);
}

/**
 * Filter NAV data by period.
 */
export function filterByPeriod(navData, period) {
    const periodDays = {
        '1M': 30,
        '3M': 90,
        '6M': 180,
        '1Y': 365,
        '3Y': 365 * 3,
        '5Y': 365 * 5,
        ALL: Infinity,
    };
    const days = periodDays[period] || 365;
    if (days === Infinity) return navData;
    const cutoff = new Date(Date.now() - days * 86400000);
    return navData.filter((d) => d.date >= cutoff);
}

/**
 * Downsample data array to maxPoints for chart performance.
 */
export function downsample(arr, maxPoints = 300) {
    if (arr.length <= maxPoints) return arr;
    const step = Math.ceil(arr.length / maxPoints);
    return arr.filter((_, i) => i % step === 0);
}

/**
 * Calculate absolute return between two NAV values.
 */
export function absoluteReturn(startNav, endNav) {
    if (!startNav || startNav === 0) return null;
    return ((endNav - startNav) / startNav) * 100;
}

/**
 * Calculate CAGR (Compound Annual Growth Rate).
 * @param {number} startNav - Starting NAV
 * @param {number} endNav - Ending NAV
 * @param {number} years - Number of years
 */
export function calculateCAGR(startNav, endNav, years) {
    if (!startNav || startNav === 0 || !years || years === 0) return null;
    return (Math.pow(endNav / startNav, 1 / years) - 1) * 100;
}

/**
 * Calculate all period returns from NAV data.
 */
export function calculateReturns(navData) {
    if (!navData || navData.length < 2) return {};
    const latest = navData[navData.length - 1];
    const now = latest.date;

    const findNavAtDaysAgo = (days) => {
        const target = new Date(now.getTime() - days * 86400000);
        // Find closest data point to the target date
        let closest = navData[0];
        let minDiff = Math.abs(navData[0].date - target);
        for (const d of navData) {
            const diff = Math.abs(d.date - target);
            if (diff < minDiff) {
                minDiff = diff;
                closest = d;
            }
        }
        // Only return if within 15 days of target
        if (minDiff > 15 * 86400000) return null;
        return closest;
    };

    const periods = {
        '1W': 7,
        '1M': 30,
        '3M': 90,
        '6M': 180,
        '1Y': 365,
        '2Y': 730,
        '3Y': 365 * 3,
        '5Y': 365 * 5,
    };

    const returns = {};
    for (const [label, days] of Object.entries(periods)) {
        const pastNav = findNavAtDaysAgo(days);
        if (pastNav) {
            const ret = absoluteReturn(pastNav.nav, latest.nav);
            const years = days / 365;
            returns[label] = {
                absoluteReturn: ret,
                cagr: years >= 1 ? calculateCAGR(pastNav.nav, latest.nav, years) : null,
                startNav: pastNav.nav,
                startDate: pastNav.date,
            };
        }
    }
    return returns;
}

/**
 * Calculate annualized volatility (standard deviation of daily returns × √252).
 */
export function calculateVolatility(navData) {
    if (!navData || navData.length < 30) return null;

    // Calculate daily returns
    const dailyReturns = [];
    for (let i = 1; i < navData.length; i++) {
        const ret = (navData[i].nav - navData[i - 1].nav) / navData[i - 1].nav;
        dailyReturns.push(ret);
    }

    const mean = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const variance =
        dailyReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) /
        (dailyReturns.length - 1);
    const dailyStdDev = Math.sqrt(variance);

    // Annualize: daily std dev × √252 (trading days)
    return dailyStdDev * Math.sqrt(252) * 100;
}

/**
 * Calculate Sharpe Ratio.
 * Uses Indian 10Y govt bond rate (~7%) as risk-free rate.
 */
export function calculateSharpeRatio(navData, riskFreeRate = 7) {
    if (!navData || navData.length < 252) return null;

    // Use last 1 year of data
    const oneYearData = navData.slice(-252);
    const startNav = oneYearData[0].nav;
    const endNav = oneYearData[oneYearData.length - 1].nav;
    const annualReturn = ((endNav - startNav) / startNav) * 100;

    const volatility = calculateVolatility(oneYearData);
    if (!volatility || volatility === 0) return null;

    return (annualReturn - riskFreeRate) / volatility;
}

/**
 * Calculate max drawdown from peak.
 */
export function calculateMaxDrawdown(navData) {
    if (!navData || navData.length < 2) return null;

    let peak = navData[0].nav;
    let maxDrawdown = 0;

    for (const d of navData) {
        if (d.nav > peak) peak = d.nav;
        const drawdown = ((peak - d.nav) / peak) * 100;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }

    return maxDrawdown;
}

/**
 * Get high and low NAV for a given period.
 */
export function getHighLow(navData) {
    if (!navData || navData.length === 0) return { high: null, low: null };

    let high = { nav: -Infinity, date: null };
    let low = { nav: Infinity, date: null };

    for (const d of navData) {
        if (d.nav > high.nav) high = { nav: d.nav, date: d.date };
        if (d.nav < low.nav) low = { nav: d.nav, date: d.date };
    }

    return { high, low };
}

/**
 * Convert NAV data to percentage returns from the start (for comparison charts).
 */
export function toPercentageReturns(navData) {
    if (!navData || navData.length === 0) return [];
    const baseNav = navData[0].nav;
    if (baseNav === 0) return [];
    return navData.map((d) => ({
        date: d.date,
        value: ((d.nav - baseNav) / baseNav) * 100,
    }));
}

/**
 * Extract AMC (fund house) short name from full fund house name.
 */
export function getAmcShortName(fundHouse) {
    if (!fundHouse) return '??';
    const cleanName = fundHouse
        .replace(/Mutual Fund$/i, '')
        .replace(/Asset Management (Company|Co\.?)/i, '')
        .replace(/(Ltd\.?|Limited|Pvt\.?|Private)/gi, '')
        .trim();

    const words = cleanName.split(/\s+/).filter(Boolean);
    if (words.length === 0) return '??';
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Get a deterministic color for a fund house name (for avatars).
 */
export function getAmcColor(name) {
    if (!name) return 'hsl(210, 50%, 45%)';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 55%, 45%)`;
}

/**
 * Tokenized fuzzy search — matches when ALL search words appear in the target.
 * "icici large" matches "ICICI Prudential Large Cap Fund - Growth"
 */
export function fuzzyMatch(target, query) {
    if (!query || !target) return false;
    const targetLower = target.toLowerCase();
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return words.every((word) => targetLower.includes(word));
}

// ─── XIRR Calculation (Newton-Raphson) ──────────────────────

/**
 * Calculate XIRR for a series of cashflows.
 * @param {Array<{amount: number, date: Date}>} cashflows
 *   - Negative amounts = investments (money out)
 *   - Positive amounts = redemptions or current value (money in)
 * @param {number} guess - Initial guess for rate (default 0.1 = 10%)
 * @returns {number} Annualized return rate (e.g., 0.12 = 12%)
 */
export function calculateXIRR(cashflows, guess = 0.1) {
    if (!cashflows || cashflows.length < 2) return 0;

    const dates = cashflows.map((cf) => cf.date);
    const amounts = cashflows.map((cf) => cf.amount);
    const d0 = dates[0];

    // Year fraction from first date
    const yearFrac = (d) => (d - d0) / (365.25 * 24 * 60 * 60 * 1000);

    // NPV function
    const npv = (rate) => {
        return amounts.reduce((sum, amt, i) => {
            return sum + amt / Math.pow(1 + rate, yearFrac(dates[i]));
        }, 0);
    };

    // Derivative of NPV
    const dnpv = (rate) => {
        return amounts.reduce((sum, amt, i) => {
            const yf = yearFrac(dates[i]);
            return sum - yf * amt / Math.pow(1 + rate, yf + 1);
        }, 0);
    };

    // Newton-Raphson iterations
    let rate = guess;
    for (let i = 0; i < 100; i++) {
        const nv = npv(rate);
        const dnv = dnpv(rate);
        if (Math.abs(dnv) < 1e-10) break;
        const newRate = rate - nv / dnv;
        if (Math.abs(newRate - rate) < 1e-8) return newRate;
        rate = newRate;
        // Guard against divergence
        if (rate < -0.999) rate = -0.999;
        if (rate > 10) rate = 10;
    }
    return rate;
}

/**
 * Compute portfolio allocation percentages.
 * @param {Array<{assetType: string, currentValue: number}>} holdings
 * @returns {Array<{assetType: string, value: number, percentage: number}>}
 */
export function computeAllocation(holdings) {
    const totalValue = holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
    if (totalValue === 0) return [];

    const grouped = {};
    for (const h of holdings) {
        const type = h.assetType || 'OTHER';
        if (!grouped[type]) grouped[type] = 0;
        grouped[type] += h.currentValue || 0;
    }

    return Object.entries(grouped)
        .map(([assetType, value]) => ({
            assetType,
            value,
            percentage: (value / totalValue) * 100,
        }))
        .sort((a, b) => b.value - a.value);
}

/**
 * Asset type labels for display
 */
export const ASSET_TYPE_LABELS = {
    MUTUAL_FUND: 'Mutual Funds',
    STOCK_IN: 'Indian Stocks',
    STOCK_US: 'US Stocks',
    CRYPTO: 'Crypto',
    GOLD: 'Gold',
    DEBT: 'Debt',
    REAL_ESTATE: 'Real Estate',
    CASH: 'Cash',
    OTHER: 'Other',
};

export const ASSET_TYPE_COLORS = {
    MUTUAL_FUND: 'hsl(210, 98%, 48%)',
    STOCK_IN: 'hsl(130, 60%, 45%)',
    STOCK_US: 'hsl(260, 60%, 55%)',
    CRYPTO: 'hsl(40, 95%, 55%)',
    GOLD: 'hsl(50, 80%, 50%)',
    DEBT: 'hsl(180, 50%, 45%)',
    REAL_ESTATE: 'hsl(15, 85%, 55%)',
    CASH: 'hsl(0, 0%, 55%)',
    OTHER: 'hsl(0, 0%, 40%)',
};
