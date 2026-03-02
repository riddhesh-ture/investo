import { config } from './config';

const MF_API_BASE_URL = config.mfApi.baseURL;
const CACHE_KEY_PREFIX = 'mf_cache_';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Get cached data if available and not expired
 * @param {string} key - Cache key
 * @returns {any|null} Cached data or null
 */
const getCachedData = (key) => {
  try {
    const cached = localStorage.getItem(CACHE_KEY_PREFIX + key);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    
    // Check if cache is expired
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY_PREFIX + key);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Cache retrieval error:', error);
    return null;
  }
};

/**
 * Set data in cache
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 */
const setCachedData = (key, data) => {
  try {
    localStorage.setItem(
      CACHE_KEY_PREFIX + key,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.error('Cache storage error:', error);
  }
};

/**
 * Fetch data from API with error handling
 * @param {string} url - API URL
 * @returns {Promise} Response data
 */
const fetchData = async (url) => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: config.mfApi.headers,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw {
      status: error.response?.status || 500,
      message: error.message || 'Failed to fetch data',
    };
  }
};

/**
 * Get all mutual funds
 * @returns {Promise} List of all mutual funds
 */
export const getAllMutualFunds = async () => {
  try {
    // Check cache first
    const cached = getCachedData('all_funds');
    if (cached) {
      console.log('Returning cached mutual funds list');
      return cached;
    }
    
    // Fetch from API
    const data = await fetchData(`${MF_API_BASE_URL}`);
    
    // Cache the result
    setCachedData('all_funds', data);
    
    return data;
  } catch (error) {
    console.error('Get all mutual funds error:', error);
    throw error;
  }
};

/**
 * Get mutual fund details by scheme code
 * @param {string} schemeCode - Mutual fund scheme code
 * @returns {Promise} Fund details with NAV history
 */
export const getMutualFundDetails = async (schemeCode) => {
  try {
    if (!schemeCode) {
      throw new Error('Scheme code is required');
    }
    
    // Check cache first
    const cached = getCachedData(`fund_${schemeCode}`);
    if (cached) {
      console.log(`Returning cached data for scheme ${schemeCode}`);
      return cached;
    }
    
    // Fetch from API
    const data = await fetchData(`${MF_API_BASE_URL}/${schemeCode}`);
    
    // Cache the result
    setCachedData(`fund_${schemeCode}`, data);
    
    return data;
  } catch (error) {
    console.error(`Get mutual fund details error for ${schemeCode}:`, error);
    throw error;
  }
};

/**
 * Search mutual funds by name or code
 * @param {string} query - Search query
 * @param {number} limit - Maximum results
 * @returns {Promise} Search results
 */
export const searchMutualFunds = async (query, limit = 10) => {
  try {
    if (!query || query.trim().length === 0) {
      return {
        results: [],
        query,
        count: 0,
      };
    }
    
    // Get all funds (cached)
    const allFunds = await getAllMutualFunds();
    
    if (!allFunds || !Array.isArray(allFunds)) {
      return {
        results: [],
        query,
        count: 0,
      };
    }
    
    // Search in the list
    const queryLower = query.toLowerCase();
    const results = allFunds
      .filter((fund) => {
        const schemeName = (fund.schemeName || '').toLowerCase();
        const schemeCode = (fund.schemeCode || '').toLowerCase();
        
        return schemeName.includes(queryLower) || schemeCode.includes(queryLower);
      })
      .slice(0, limit)
      .map((fund) => ({
        schemeCode: fund.schemeCode,
        schemeName: fund.schemeName,
        type: 'mutual_fund',
        category: fund.schemeCategory || 'Unknown',
      }));
    
    return {
      results,
      query,
      count: results.length,
    };
  } catch (error) {
    console.error('Search mutual funds error:', error);
    throw error;
  }
};

/**
 * Get NAV history for a mutual fund
 * @param {string} schemeCode - Mutual fund scheme code
 * @param {number} limit - Maximum data points to return
 * @returns {Promise} NAV history
 */
export const getNAVHistory = async (schemeCode, limit = 100) => {
  try {
    const fundDetails = await getMutualFundDetails(schemeCode);
    
    if (!fundDetails || !fundDetails.data) {
      throw new Error('No NAV data found');
    }
    
    // Format NAV data
    const navData = fundDetails.data
      .slice(0, limit)
      .map((entry) => ({
        date: entry.date,
        nav: parseFloat(entry.nav),
      }))
      .reverse(); // Reverse to get chronological order
    
    return {
      schemeCode,
      schemeName: fundDetails.meta?.schemeName || '',
      navData,
      count: navData.length,
    };
  } catch (error) {
    console.error(`Get NAV history error for ${schemeCode}:`, error);
    throw error;
  }
};

/**
 * Clear all cached mutual fund data
 */
export const clearMFCache = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    console.log('Mutual fund cache cleared');
  } catch (error) {
    console.error('Cache clear error:', error);
  }
};

export default {
  getAllMutualFunds,
  getMutualFundDetails,
  searchMutualFunds,
  getNAVHistory,
  clearMFCache,
};
