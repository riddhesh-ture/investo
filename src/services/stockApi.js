import axios from 'axios';
import { config } from './config';

// Create axios instance for stock API
const apiClient = axios.create(config.stockApi);

// Request interceptor for logging
apiClient.interceptors.request.use(
  (request) => {
    console.log('Starting Request:', request);
    return request;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('Response:', response);
    return response;
  },
  (error) => {
    console.error('Response Error:', error);
    
    // Format error message
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    
    return Promise.reject({
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data,
    });
  }
);

/**
 * Search for stocks by query
 * @param {string} query - Search query
 * @param {number} limit - Maximum results to return
 * @returns {Promise} Search results
 */
export const searchStocks = async (query, limit = 10) => {
  try {
    const response = await apiClient.get('/search', {
      params: {
        q: query,
        limit: Math.min(limit, 50), // Cap at 50
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

/**
 * Get chart data for a stock
 * @param {string} symbol - Stock ticker symbol
 * @param {string} range - Time range (1d, 5d, 1mo, 6mo, 1y, 5y)
 * @param {string} interval - Data interval (1m, 5m, 15m, 1h, 1d)
 * @returns {Promise} Chart data
 */
export const getChartData = async (symbol, range = '1mo', interval = '1d') => {
  try {
    const response = await apiClient.get(`/chart/${symbol}`, {
      params: {
        range,
        interval,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Chart data error:', error);
    throw error;
  }
};

/**
 * Get intraday data for a stock
 * @param {string} symbol - Stock ticker symbol
 * @param {string} interval - Data interval (1m, 5m, 15m, 1h)
 * @returns {Promise} Intraday data
 */
export const getIntradayData = async (symbol, interval = '5m') => {
  try {
    const response = await apiClient.get(`/intraday/${symbol}`, {
      params: {
        interval,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Intraday data error:', error);
    throw error;
  }
};

/**
 * Get detailed stock information
 * @param {string} symbol - Stock ticker symbol
 * @returns {Promise} Stock details
 */
export const getStockDetails = async (symbol) => {
  try {
    const response = await apiClient.get(`/stock/${symbol}`);
    return response.data.data;
  } catch (error) {
    console.error('Stock details error:', error);
    throw error;
  }
};

/**
 * Get current stock quote (real-time, no caching)
 * @param {string} symbol - Stock ticker symbol
 * @returns {Promise} Current quote
 */
export const getStockQuote = async (symbol) => {
  try {
    const response = await apiClient.get(`/quote/${symbol}`);
    return response.data.data;
  } catch (error) {
    console.error('Quote error:', error);
    throw error;
  }
};

/**
 * Compare multiple stocks
 * @param {string[]} symbols - Array of stock symbols
 * @param {string} range - Time range
 * @returns {Promise} Comparison data
 */
export const compareStocks = async (symbols, range = '1mo') => {
  try {
    const response = await apiClient.get('/compare', {
      params: {
        symbols: symbols.join(','),
        range,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Compare error:', error);
    throw error;
  }
};

export default {
  searchStocks,
  getChartData,
  getIntradayData,
  getStockDetails,
  getStockQuote,
  compareStocks,
};
