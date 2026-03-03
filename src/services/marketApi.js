/**
 * Multi-Asset Market Data API Service
 * Adapters for Indian MFs, Indian Stocks, US Stocks, Crypto, and Gold
 * All API calls are cached to conserve rate limits.
 */
import { cachedFetch, TTL_PRESETS } from './apiCache';

// ─── Indian Mutual Funds (mfapi.in — unlimited) ─────────────

export async function fetchMFSchemes() {
    return cachedFetch('mf_schemes_list', async () => {
        const res = await fetch('https://api.mfapi.in/mf');
        if (!res.ok) throw new Error('Failed to fetch MF schemes');
        const schemes = await res.json();
        return schemes.sort((a, b) =>
            (a.schemeName || '').localeCompare(b.schemeName || '')
        );
    }, TTL_PRESETS.MF_LIST);
}

export async function fetchMFHistory(schemeCode) {
    return cachedFetch(`mf_history_${schemeCode}`, async () => {
        const res = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
        if (!res.ok) throw new Error(`Failed to fetch MF data for ${schemeCode}`);
        const data = await res.json();
        return {
            meta: data.meta,
            history: (data.data || []).map((d) => ({
                date: parseMFDate(d.date),
                price: parseFloat(d.nav),
            })).filter((d) => !isNaN(d.price)),
        };
    }, TTL_PRESETS.MF_NAV);
}

function parseMFDate(dateStr) {
    const [dd, mm, yyyy] = dateStr.split('-');
    return new Date(`${yyyy}-${mm}-${dd}`);
}

// ─── Indian Stocks (NSE/BSE via Yahoo Finance proxy) ─────────
const INDIA_STOCK_API = 'https://indian-stock-market-api.onrender.com';

export async function searchIndianStocks(query) {
    return cachedFetch(`indian_stock_search_${query}`, async () => {
        try {
            const res = await fetch(`${INDIA_STOCK_API}/search?query=${encodeURIComponent(query)}`);
            if (!res.ok) return [];
            return res.json();
        } catch {
            return [];
        }
    }, TTL_PRESETS.STOCK);
}

export async function fetchIndianStockQuote(symbol) {
    return cachedFetch(`indian_stock_quote_${symbol}`, async () => {
        const res = await fetch(`${INDIA_STOCK_API}/stock/${encodeURIComponent(symbol)}`);
        if (!res.ok) throw new Error(`Failed to fetch stock data for ${symbol}`);
        return res.json();
    }, TTL_PRESETS.STOCK);
}

export async function fetchIndianStockHistory(symbol, period = '1y') {
    return cachedFetch(`indian_stock_hist_${symbol}_${period}`, async () => {
        try {
            const res = await fetch(
                `${INDIA_STOCK_API}/stock/${encodeURIComponent(symbol)}/history?period=${period}`
            );
            if (!res.ok) throw new Error(`Failed to fetch stock history for ${symbol}`);
            const data = await res.json();
            return normalizeStockHistory(data);
        } catch {
            return [];
        }
    }, TTL_PRESETS.STOCK);
}

function normalizeStockHistory(data) {
    if (Array.isArray(data)) {
        return data.map((d) => ({
            date: new Date(d.date || d.timestamp || d.Date),
            price: parseFloat(d.close || d.Close || d.price),
        })).filter((d) => !isNaN(d.price));
    }
    if (data.timestamp && data.close) {
        return data.timestamp.map((ts, i) => ({
            date: new Date(ts * 1000),
            price: parseFloat(data.close[i]),
        })).filter((d) => !isNaN(d.price));
    }
    return [];
}

// ─── US Stocks (Alpha Vantage — 25 calls/day) ───────────────
function getAlphaVantageKey() {
    return import.meta.env.VITE_ALPHAVANTAGE_KEY || '';
}

export async function fetchUSStockQuote(symbol) {
    return cachedFetch(`us_stock_quote_${symbol}`, async () => {
        const apiKey = getAlphaVantageKey();
        if (!apiKey) throw new Error('Alpha Vantage API key not configured.');
        const res = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`
        );
        if (!res.ok) throw new Error(`Failed to fetch US stock quote for ${symbol}`);
        const data = await res.json();
        if (data['Note'] || data['Information']) {
            throw new Error('Alpha Vantage rate limit reached. Try again in a minute.');
        }
        const quote = data['Global Quote'] || {};
        return {
            symbol: quote['01. symbol'] || symbol,
            price: parseFloat(quote['05. price']) || 0,
            change: parseFloat(quote['09. change']) || 0,
            changePercent: quote['10. change percent'] || '0%',
            previousClose: parseFloat(quote['08. previous close']) || 0,
        };
    }, TTL_PRESETS.STOCK);
}

export async function fetchUSStockHistory(symbol, outputSize = 'compact') {
    return cachedFetch(`us_stock_hist_${symbol}_${outputSize}`, async () => {
        const apiKey = getAlphaVantageKey();
        if (!apiKey) throw new Error('Alpha Vantage API key not configured.');
        const res = await fetch(
            `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(symbol)}&outputsize=${outputSize}&apikey=${apiKey}`
        );
        if (!res.ok) throw new Error(`Failed to fetch US stock history for ${symbol}`);
        const data = await res.json();
        if (data['Note'] || data['Information']) {
            throw new Error('Alpha Vantage rate limit reached. Try again in a minute.');
        }
        const timeSeries = data['Time Series (Daily)'] || {};
        return Object.entries(timeSeries)
            .map(([dateStr, values]) => ({
                date: new Date(dateStr),
                price: parseFloat(values['4. close']),
            }))
            .filter((d) => !isNaN(d.price))
            .sort((a, b) => a.date - b.date);
    }, TTL_PRESETS.STOCK);
}

export async function searchUSStocks(query) {
    return cachedFetch(`us_stock_search_${query}`, async () => {
        const apiKey = getAlphaVantageKey();
        if (!apiKey) return [];
        try {
            const res = await fetch(
                `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${apiKey}`
            );
            if (!res.ok) return [];
            const data = await res.json();
            return (data.bestMatches || []).map((m) => ({
                symbol: m['1. symbol'],
                name: m['2. name'],
                type: m['3. type'],
                region: m['4. region'],
                currency: m['8. currency'],
            }));
        } catch {
            return [];
        }
    }, TTL_PRESETS.STOCK);
}

// ─── Crypto (CoinGecko v3 — 30 calls/min) ───────────────────
function getCoinGeckoKey() {
    return import.meta.env.VITE_COINGECKO_KEY || '';
}

function coinGeckoHeaders() {
    const key = getCoinGeckoKey();
    return key ? { 'x-cg-demo-api-key': key } : {};
}

export async function searchCrypto(query) {
    return cachedFetch(`crypto_search_${query}`, async () => {
        try {
            const res = await fetch(
                `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`,
                { headers: coinGeckoHeaders() }
            );
            if (!res.ok) return [];
            const data = await res.json();
            return (data.coins || []).map((c) => ({
                id: c.id,
                symbol: c.symbol,
                name: c.name,
                thumb: c.thumb,
                marketCapRank: c.market_cap_rank,
            }));
        } catch {
            return [];
        }
    }, TTL_PRESETS.CRYPTO);
}

export async function fetchCryptoPrice(coinId, currency = 'inr') {
    return cachedFetch(`crypto_price_${coinId}_${currency}`, async () => {
        const res = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${currency}&include_24hr_change=true&include_market_cap=true`,
            { headers: coinGeckoHeaders() }
        );
        if (!res.ok) throw new Error(`Failed to fetch crypto price for ${coinId}`);
        const data = await res.json();
        const coinData = data[coinId] || {};
        return {
            price: coinData[currency] || 0,
            change24h: coinData[`${currency}_24h_change`] || 0,
            marketCap: coinData[`${currency}_market_cap`] || 0,
        };
    }, TTL_PRESETS.CRYPTO);
}

export async function fetchCryptoHistory(coinId, days = 365, currency = 'inr') {
    return cachedFetch(`crypto_hist_${coinId}_${days}_${currency}`, async () => {
        const res = await fetch(
            `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}`,
            { headers: coinGeckoHeaders() }
        );
        if (!res.ok) throw new Error(`Failed to fetch crypto history for ${coinId}`);
        const data = await res.json();
        return (data.prices || []).map(([timestamp, price]) => ({
            date: new Date(timestamp),
            price,
        }));
    }, TTL_PRESETS.MARKET);
}

export async function fetchTopCryptos(limit = 10, currency = 'inr') {
    return cachedFetch(`top_cryptos_${limit}_${currency}`, async () => {
        const res = await fetch(
            `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h,7d,30d`,
            { headers: coinGeckoHeaders() }
        );
        if (!res.ok) throw new Error('Failed to fetch top cryptos');
        return res.json();
    }, TTL_PRESETS.MARKET);
}

// ─── Gold (metals.dev — 100 calls/month, cached 6h) ─────────
function getMetalsDevKey() {
    return import.meta.env.VITE_METALS_DEV_KEY || '';
}

export async function fetchGoldPrice(currency = 'INR') {
    return cachedFetch(`gold_price_${currency}`, async () => {
        const apiKey = getMetalsDevKey();

        // Primary: metals.dev (real gold spot price)
        if (apiKey) {
            try {
                const res = await fetch(
                    `https://api.metals.dev/v1/metal/spot?api_key=${apiKey}&metal=gold&currency=${currency}`,
                    { headers: { Accept: 'application/json' } }
                );
                if (res.ok) {
                    const data = await res.json();
                    // Response: { rate_per_unit: X, unit: "toz" }
                    const pricePerOunce = data.rate || data.rate_per_unit || 0;
                    const pricePerGram = pricePerOunce / 31.1035;
                    return { pricePerGram, pricePerOunce, currency, source: 'metals.dev' };
                }
            } catch {
                // Fall through to PAXG fallback
            }
        }

        // Fallback: CoinGecko PAXG (1 PAXG ≈ 1 troy oz gold)
        try {
            const data = await fetchCryptoPrice('pax-gold', currency.toLowerCase());
            const pricePerOunce = data.price || 0;
            const pricePerGram = pricePerOunce / 31.1035;
            return { pricePerGram, pricePerOunce, currency, source: 'coingecko-paxg' };
        } catch {
            return { pricePerGram: 0, pricePerOunce: 0, currency, source: 'error' };
        }
    }, TTL_PRESETS.GOLD); // 6 hours — max ~4 calls/day = ~120/month
}

export async function fetchGoldHistory(days = 365) {
    return cachedFetch(`gold_history_${days}`, async () => {
        // Use CoinGecko PAXG for historical (metals.dev timeseries costs more calls)
        try {
            const history = await fetchCryptoHistory('pax-gold', days, 'inr');
            return history.map((d) => ({
                date: d.date,
                price: d.price / 31.1035,
            }));
        } catch {
            return [];
        }
    }, TTL_PRESETS.GOLD);
}

// ─── Unified helpers ────────────────────────────────────────

/**
 * Get the latest price for any asset (all calls are cached)
 */
export async function getLatestPrice(assetType, symbol) {
    switch (assetType) {
        case 'MUTUAL_FUND': {
            const data = await fetchMFHistory(symbol);
            return data.history[0]?.price || 0;
        }
        case 'STOCK_IN': {
            const quote = await fetchIndianStockQuote(symbol);
            return quote.currentPrice || quote.regularMarketPrice || 0;
        }
        case 'STOCK_US': {
            const quote = await fetchUSStockQuote(symbol);
            return quote.price || 0;
        }
        case 'CRYPTO': {
            const price = await fetchCryptoPrice(symbol);
            return price.price || 0;
        }
        case 'GOLD': {
            const gold = await fetchGoldPrice();
            return gold.pricePerGram || 0;
        }
        default:
            return 0;
    }
}
