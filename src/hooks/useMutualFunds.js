import { useState, useEffect, useCallback } from 'react';
import * as mfApi from '../services/mfApi';

/**
 * Custom hook for fetching and managing mutual fund data
 * @returns {Object} Mutual fund state and functions
 */
export const useMutualFunds = () => {
  const [allFunds, setAllFunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch all mutual funds
  const fetchAllFunds = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await mfApi.getAllMutualFunds();
      setAllFunds(data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching mutual funds:', err);
      setError(err.message || 'Failed to fetch mutual funds');
      setAllFunds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchAllFunds();
  }, [fetchAllFunds]);

  // Search mutual funds
  const searchFunds = useCallback(async (query, limit = 10) => {
    try {
      return await mfApi.searchMutualFunds(query, limit);
    } catch (err) {
      console.error('Error searching mutual funds:', err);
      throw err;
    }
  }, []);

  // Get fund details
  const getFundDetails = useCallback(async (schemeCode) => {
    try {
      return await mfApi.getMutualFundDetails(schemeCode);
    } catch (err) {
      console.error('Error fetching fund details:', err);
      throw err;
    }
  }, []);

  // Get NAV history
  const getNAVHistory = useCallback(async (schemeCode, limit = 100) => {
    try {
      return await mfApi.getNAVHistory(schemeCode, limit);
    } catch (err) {
      console.error('Error fetching NAV history:', err);
      throw err;
    }
  }, []);

  // Refresh data
  const refresh = useCallback(() => {
    fetchAllFunds();
  }, [fetchAllFunds]);

  // Clear cache
  const clearCache = useCallback(() => {
    mfApi.clearMFCache();
    setLastUpdated(null);
  }, []);

  return {
    allFunds,
    loading,
    error,
    lastUpdated,
    searchFunds,
    getFundDetails,
    getNAVHistory,
    refresh,
    clearCache,
  };
};

export default useMutualFunds;
