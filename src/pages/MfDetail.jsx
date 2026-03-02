import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ErrorBoundary from '../components/ErrorBoundary';
import HeaderSkeleton from '../components/skeletons/HeaderSkeleton';
import ChartSkeleton from '../components/skeletons/ChartSkeleton';
import StatisticsSkeleton from '../components/skeletons/StatisticsSkeleton';
import * as mfApi from '../services/mfApi';
import * as chartUtils from '../utils/chartUtils';

/**
 * Mutual Fund Detail Page
 * Displays detailed information about a mutual fund with NAV charts
 */
export default function MfDetail() {
  const { schemeCode } = useParams();
  const [fundDetails, setFundDetails] = useState(null);
  const [navHistory, setNavHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch fund details and NAV history
  useEffect(() => {
    const fetchFundData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch fund details
        const details = await mfApi.getMutualFundDetails(schemeCode);
        setFundDetails(details);

        // Fetch NAV history
        const navData = await mfApi.getNAVHistory(schemeCode, 100);
        setNavHistory(navData);
      } catch (err) {
        console.error('Error fetching fund data:', err);
        setError(err.message || 'Failed to fetch fund data');
      } finally {
        setLoading(false);
      }
    };

    fetchFundData();
  }, [schemeCode]);

  if (error && !fundDetails) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // Calculate NAV change
  const navChange = navHistory && navHistory.navData && navHistory.navData.length > 1
    ? {
        current: navHistory.navData[navHistory.navData.length - 1].nav,
        previous: navHistory.navData[navHistory.navData.length - 2].nav,
      }
    : null;

  const navChangeValue = navChange ? navChange.current - navChange.previous : 0;
  const navChangePercent = navChange ? (navChangeValue / navChange.previous) * 100 : 0;
  const changeColor = navChangeValue >= 0 ? '#22c55e' : '#ef4444';

  return (
    <ErrorBoundary>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header Section */}
        {loading && !fundDetails ? (
          <HeaderSkeleton />
        ) : (
          <Box sx={{ mb: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                  {fundDetails?.meta?.schemeName || schemeCode}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Scheme Code: {schemeCode}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={3} alignItems="baseline" sx={{ mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {navChange ? chartUtils.formatPrice(navChange.current, 'INR') : 'N/A'}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: changeColor,
                  fontWeight: 500,
                }}
              >
                {navChange && (
                  <>
                    {chartUtils.formatPrice(navChangeValue, 'INR')} (
                    {chartUtils.formatPercentage(navChangePercent)})
                  </>
                )}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={3}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Fund Type
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {fundDetails?.meta?.schemeType || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Category
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {fundDetails?.meta?.schemeCategory || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {navHistory && navHistory.navData && navHistory.navData.length > 0
                    ? chartUtils.formatDate(navHistory.navData[navHistory.navData.length - 1].date)
                    : 'N/A'}
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}

        {/* Chart Section */}
        <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider' }}>
          {loading ? (
            <ChartSkeleton />
          ) : navHistory && navHistory.navData && navHistory.navData.length > 0 ? (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                NAV History
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartUtils.formatNAVData(navHistory.navData)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="dateStr"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    domain="dataMin"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) => chartUtils.formatPrice(value, 'INR')}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return chartUtils.formatDate(date);
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="nav"
                    stroke={changeColor}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Alert severity="warning">No NAV data available</Alert>
          )}
        </Paper>

        {/* Fund Information Section */}
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Fund Information
        </Typography>

        {loading && !fundDetails ? (
          <StatisticsSkeleton />
        ) : (
          <Grid container spacing={2}>
            {[
              { label: 'Scheme Name', value: fundDetails?.meta?.schemeName },
              { label: 'Scheme Type', value: fundDetails?.meta?.schemeType },
              { label: 'Category', value: fundDetails?.meta?.schemeCategory },
              { label: 'Fund Manager', value: fundDetails?.meta?.fundManager || 'N/A' },
              { label: 'Launch Date', value: fundDetails?.meta?.launchDate || 'N/A' },
              { label: 'Data Points', value: navHistory?.count || 0 },
            ].map((info, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    {info.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {info.value || 'N/A'}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Additional Info */}
        {navHistory && navHistory.navData && navHistory.navData.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Performance Metrics
            </Typography>
            <Grid container spacing={2}>
              {[
                {
                  label: 'Current NAV',
                  value: chartUtils.formatPrice(navHistory.navData[navHistory.navData.length - 1].nav, 'INR'),
                },
                {
                  label: 'Highest NAV (Last 100 Days)',
                  value: chartUtils.formatPrice(
                    Math.max(...navHistory.navData.map((d) => d.nav)),
                    'INR'
                  ),
                },
                {
                  label: 'Lowest NAV (Last 100 Days)',
                  value: chartUtils.formatPrice(
                    Math.min(...navHistory.navData.map((d) => d.nav)),
                    'INR'
                  ),
                },
                {
                  label: 'Average NAV (Last 100 Days)',
                  value: chartUtils.formatPrice(
                    navHistory.navData.reduce((sum, d) => sum + d.nav, 0) / navHistory.navData.length,
                    'INR'
                  ),
                },
              ].map((metric, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      {metric.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {metric.value}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </ErrorBoundary>
  );
}
