import dayjs from 'dayjs';

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {string} format - dayjs format string
 * @returns {string} Formatted date
 */
export const formatDate = (date, format = 'MMM DD, YYYY') => {
  return dayjs(date).format(format);
};

/**
 * Format price with currency
 * @param {number} price - Price value
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted price
 */
export const formatPrice = (price, currency = 'USD') => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(price);
};

/**
 * Format percentage change
 * @param {number} change - Change value
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (change, decimals = 2) => {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(decimals)}%`;
};

/**
 * Get color for price change (green for positive, red for negative)
 * @param {number} change - Change value
 * @returns {string} Color code
 */
export const getChangeColor = (change) => {
  if (change > 0) return '#22c55e'; // green
  if (change < 0) return '#ef4444'; // red
  return '#6b7280'; // gray
};

/**
 * Format volume with K, M, B suffixes
 * @param {number} volume - Volume value
 * @returns {string} Formatted volume
 */
export const formatVolume = (volume) => {
  if (volume >= 1e9) {
    return (volume / 1e9).toFixed(2) + 'B';
  }
  if (volume >= 1e6) {
    return (volume / 1e6).toFixed(2) + 'M';
  }
  if (volume >= 1e3) {
    return (volume / 1e3).toFixed(2) + 'K';
  }
  return volume.toString();
};

/**
 * Format market cap with K, M, B suffixes
 * @param {number} marketCap - Market cap value
 * @returns {string} Formatted market cap
 */
export const formatMarketCap = (marketCap) => {
  return formatVolume(marketCap);
};

/**
 * Transform OHLCV data for charting
 * @param {Array} data - Raw OHLCV data
 * @returns {Array} Transformed data for charts
 */
export const transformChartData = (data) => {
  if (!data || !Array.isArray(data)) return [];

  return data.map((item) => ({
    date: new Date(item.date).getTime(),
    dateStr: formatDate(item.date, 'MMM DD'),
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
    volume: item.volume,
    adjClose: item.adjClose,
  }));
};

/**
 * Calculate price change and percentage
 * @param {number} currentPrice - Current price
 * @param {number} previousPrice - Previous price
 * @returns {Object} Change and percentage
 */
export const calculatePriceChange = (currentPrice, previousPrice) => {
  const change = currentPrice - previousPrice;
  const changePercent = (change / previousPrice) * 100;

  return {
    change: change.toFixed(2),
    changePercent: changePercent.toFixed(2),
    isPositive: change >= 0,
  };
};

/**
 * Get timeframe label
 * @param {string} range - Range string (1d, 5d, 1mo, etc.)
 * @returns {string} Human-readable label
 */
export const getTimeframeLabel = (range) => {
  const labels = {
    '1d': '1 Day',
    '5d': '5 Days',
    '1mo': '1 Month',
    '6mo': '6 Months',
    '1y': '1 Year',
    '5y': '5 Years',
  };
  return labels[range] || range;
};

/**
 * Format tooltip data for charts
 * @param {Object} data - Data point
 * @returns {Object} Formatted tooltip data
 */
export const formatTooltipData = (data) => {
  if (!data) return null;

  return {
    date: formatDate(data.date, 'MMM DD, YYYY'),
    open: formatPrice(data.open),
    high: formatPrice(data.high),
    low: formatPrice(data.low),
    close: formatPrice(data.close),
    volume: formatVolume(data.volume),
  };
};

/**
 * Calculate moving average
 * @param {Array} data - Data points
 * @param {number} period - Period for moving average
 * @returns {Array} Moving average values
 */
export const calculateMovingAverage = (data, period = 20) => {
  if (!data || data.length < period) return [];

  const ma = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data
      .slice(i - period + 1, i + 1)
      .reduce((acc, item) => acc + item.close, 0);
    ma.push(sum / period);
  }
  return ma;
};

/**
 * Get price range from data
 * @param {Array} data - Data points
 * @returns {Object} Min and max prices
 */
export const getPriceRange = (data) => {
  if (!data || data.length === 0) {
    return { min: 0, max: 0 };
  }

  const prices = data.map((item) => item.close);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
};

/**
 * Format NAV data for mutual fund charts
 * @param {Array} navData - NAV history data
 * @returns {Array} Formatted data
 */
export const formatNAVData = (navData) => {
  if (!navData || !Array.isArray(navData)) return [];

  return navData.map((item) => ({
    date: new Date(item.date).getTime(),
    dateStr: formatDate(item.date, 'MMM DD'),
    nav: item.nav,
  }));
};

export default {
  formatDate,
  formatPrice,
  formatPercentage,
  getChangeColor,
  formatVolume,
  formatMarketCap,
  transformChartData,
  calculatePriceChange,
  getTimeframeLabel,
  formatTooltipData,
  calculateMovingAverage,
  getPriceRange,
  formatNAVData,
};
