import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Autocomplete,
  Box,
  TextField,
  CircularProgress,
  Typography,
  Paper,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useSearchCache } from '../../hooks/useSearchCache';
import { useMutualFunds } from '../../hooks/useMutualFunds';
import * as stockApi from '../../services/stockApi';

/**
 * Unified search component for stocks and mutual funds
 * Provides real-time search with debouncing and grouped results
 */
export default function UnifiedSearch() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);

  // Stock search with caching
  const {
    results: stockResults,
    loading: stockLoading,
    debouncedSearch: debouncedStockSearch,
  } = useSearchCache(stockApi.searchStocks);

  // Mutual funds
  const { searchFunds, loading: mfLoading } = useMutualFunds();
  const [mfResults, setMfResults] = useState([]);

  // Combined loading state
  const loading = stockLoading || mfLoading;

  // Search mutual funds
  const searchMutualFunds = useCallback(
    async (query) => {
      try {
        const results = await searchFunds(query, 10);
        setMfResults(results.results || []);
      } catch (error) {
        console.error('MF search error:', error);
        setMfResults([]);
      }
    },
    [searchFunds]
  );

  // Handle input change with debouncing
  const handleInputChange = useCallback(
    (event, value) => {
      setInputValue(value);

      if (value && value.trim().length > 0) {
        debouncedStockSearch(value);
        searchMutualFunds(value);
      } else {
        setMfResults([]);
      }
    },
    [debouncedStockSearch, searchMutualFunds]
  );

  // Group results by type
  const groupedOptions = useMemo(() => {
    const groups = [];

    // Add stocks group
    if (stockResults && stockResults.results && stockResults.results.length > 0) {
      groups.push({
        title: 'Stocks',
        options: stockResults.results.map((stock) => ({
          ...stock,
          id: `stock_${stock.symbol}`,
          type: 'stock',
        })),
      });
    }

    // Add mutual funds group
    if (mfResults && mfResults.length > 0) {
      groups.push({
        title: 'Mutual Funds',
        options: mfResults.map((mf) => ({
          ...mf,
          id: `mf_${mf.schemeCode}`,
          type: 'mutual_fund',
        })),
      });
    }

    return groups;
  }, [stockResults, mfResults]);

  // Flatten options for autocomplete
  const options = useMemo(() => {
    return groupedOptions.flatMap((group) => group.options);
  }, [groupedOptions]);

  // Handle selection
  const handleSelect = useCallback(
    (event, value) => {
      if (value) {
        if (value.type === 'stock') {
          navigate(`/home/stock/${value.symbol}`);
        } else if (value.type === 'mutual_fund') {
          navigate(`/home/mf/${value.schemeCode}`);
        }
        setInputValue('');
        setMfResults([]);
      }
    },
    [navigate]
  );

  // Render option with grouping
  const renderOption = (props, option) => {
    return (
      <Box component="li" {...props} key={option.id}>
        <Box sx={{ width: '100%' }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {option.type === 'stock' ? option.name : option.schemeName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {option.type === 'stock'
              ? `${option.symbol} • ${option.exchange}`
              : `${option.schemeCode} • ${option.category}`}
          </Typography>
        </Box>
      </Box>
    );
  };

  // Render group header
  const renderGroup = (params) => [
    <Box
      key={params.key}
      sx={{
        position: 'sticky',
        top: 0,
        p: 1,
        bgcolor: 'background.paper',
        fontWeight: 600,
        fontSize: '0.875rem',
        color: 'text.secondary',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      {params.group}
    </Box>,
    params.children,
  ];

  return (
    <Autocomplete
      freeSolo
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={handleSelect}
      options={options}
      loading={loading}
      groupBy={(option) => {
        const group = groupedOptions.find((g) =>
          g.options.some((o) => o.id === option.id)
        );
        return group?.title || '';
      }}
      getOptionLabel={(option) => {
        if (typeof option === 'string') return option;
        return option.type === 'stock' ? option.symbol : option.schemeCode;
      }}
      renderOption={renderOption}
      renderGroup={renderGroup}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search stocks, funds..."
          size="small"
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          sx={{
            width: { xs: '100%', sm: 300, md: 400 },
            '& .MuiOutlinedInput-root': {
              borderRadius: 1,
            },
          }}
        />
      )}
      PaperComponent={(props) => (
        <Paper
          {...props}
          sx={{
            '& .MuiAutocomplete-listbox': {
              maxHeight: '400px',
            },
          }}
        />
      )}
      noOptionsText={
        inputValue && !loading ? 'No results found' : 'Start typing to search'
      }
      isOptionEqualToValue={(option, value) => option.id === value.id}
    />
  );
}
