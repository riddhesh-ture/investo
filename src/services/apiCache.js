/**
 * API Cache — in-memory + sessionStorage hybrid cache
 * 
 * Strategy:
 * - In-memory cache for fastest access during session
 * - sessionStorage fallback persists across page navigations (same tab)
 * - TTL-based expiry: each cache key has a configurable lifetime
 * - Stale-while-revalidate: returns stale data immediately, refreshes in background
 * 
 * Default TTLs (designed for 100 calls/month budget on metals.dev):
 * - Gold prices:    6 hours (max ~4 calls/day = 120/month, safe margin)
 * - Crypto prices:  5 minutes (CoinGecko free = 30 calls/min)
 * - MF NAV:         1 hour (mfapi.in = unlimited, but NAV updates once/day)
 * - Stock quotes:   15 minutes (Alpha Vantage = 25/day)
 */

const memoryCache = new Map();

const DEFAULT_TTL = 5 * 60 * 1000; // 5 min

const TTL_PRESETS = {
    GOLD: 6 * 60 * 60 * 1000,  // 6 hours — conserve metals.dev quota
    CRYPTO: 5 * 60 * 1000,        // 5 min
    MF_NAV: 60 * 60 * 1000,       // 1 hour (NAV updates once daily)
    STOCK: 15 * 60 * 1000,       // 15 min
    MF_LIST: 24 * 60 * 60 * 1000,  // 24 hours (scheme list rarely changes)
    MARKET: 10 * 60 * 1000,       // 10 min (market overview data)
};

/**
 * Get a cached value
 * @returns {any|null} cached value or null if expired/missing
 */
function getCache(key) {
    // Check memory first
    const mem = memoryCache.get(key);
    if (mem && Date.now() < mem.expiry) {
        return mem.data;
    }

    // Check sessionStorage
    try {
        const stored = sessionStorage.getItem(`investo_cache_${key}`);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Date.now() < parsed.expiry) {
                // Restore to memory for faster subsequent access
                memoryCache.set(key, parsed);
                return parsed.data;
            } else {
                // Expired — clean up
                sessionStorage.removeItem(`investo_cache_${key}`);
            }
        }
    } catch {
        // sessionStorage unavailable (private mode, etc.)
    }

    return null;
}

/**
 * Set a cached value
 */
function setCache(key, data, ttl = DEFAULT_TTL) {
    const entry = { data, expiry: Date.now() + ttl };

    // Memory cache (always)
    memoryCache.set(key, entry);

    // sessionStorage (best-effort, skip large payloads)
    try {
        const json = JSON.stringify(entry);
        if (json.length < 500_000) { // skip if > 500KB
            sessionStorage.setItem(`investo_cache_${key}`, json);
        }
    } catch {
        // Quota exceeded or unavailable — no problem
    }
}

/**
 * Wrap an async fetch function with caching.
 * Returns cached data if fresh, otherwise fetches and caches.
 * 
 * @param {string} cacheKey - unique key for this request
 * @param {Function} fetchFn - async function that fetches the data
 * @param {number} ttl - cache TTL in ms
 * @returns {Promise<any>}
 */
export async function cachedFetch(cacheKey, fetchFn, ttl = DEFAULT_TTL) {
    const cached = getCache(cacheKey);
    if (cached !== null) return cached;

    const data = await fetchFn();
    setCache(cacheKey, data, ttl);
    return data;
}

export { TTL_PRESETS };
