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
  CircularProgress,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ErrorBoundary from '../components/ErrorBoundary';
import HeaderSkeleton from '../components/skeletons/HeaderSkeleton';
import ChartSkeleton from '../components/skeletons/ChartSkeleton';
import StatisticsSkeleton from '../components/skeletons/StatisticsSkeleton';
import * as stockApi from '../services/stockApi';
import * as chartUtils from '../utils/chartUtils';

/**
 * Stock Detail Page
 * Displays detailed information about a stock with interactive charts
 */
export default function StockDetail() {
  const { symbol } = useParams();
  const [stockDetails, setStockDetails] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [selectedRange, setSelectedRange] = useState('1mo');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const timeframes = ['1d', '5d', '1mo', '6mo', '1y', '5y'];

  // Fetch stock details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const details = await stockApi.getStockDetails(symbol);
        setStockDetails(details);
      } catch (err) {
        console.error('Error fetching stock details:', err);
        setError(err.message || 'Failed to fetch stock details');
      }
    };

    fetchDetails();
  }, [symbol]);

  // Fetch chart data
  useEffect(() => {
    const fetchChart = async () => {
      try {
        const data = await stockApi.getChartData(symbol, selectedRange);
        setChartData(data);
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError(err.message || 'Failed to fetch chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchChart();
  }, [symbol, selectedRange]);

  if (error && !stockDetails) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const priceChange = stockDetails
    ? chartUtils.calculatePriceChange(
        stockDetails.currentPrice,
        stockDetails.previousClose
      )
    : null;

  const changeColor = priceChange ? chartUtils.getChangeColor(parseFloat(priceChange.change)) : '#6b7280';

  return (
    <ErrorBoundary>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header Section */}
        {loading && !stockDetails ? (
          <HeaderSkeleton />
        ) : (
          <Box sx={{ mb: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                  {stockDetails?.name || symbol}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {symbol}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={3} alignItems="baseline" sx={{ mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {chartUtils.formatPrice(stockDetails?.currentPrice || 0, stockDetails?.currency)}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: changeColor,
                  fontWeight: 500,
                }}
              >
                {priceChange && (
                  <>
                    {chartUtils.formatPrice(parseFloat(priceChange.change), stockDetails?.currency)} (
                    {chartUtils.formatPercentage(parseFloat(priceChange.changePercent))})
                  </>
                )}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={3}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Previous Close
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {chartUtils.formatPrice(stockDetails?.previousClose || 0, stockDetails?.currency)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Open
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {chartUtils.formatPrice(stockDetails?.open || 0, stockDetails?.currency)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Day Range
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {chartUtils.formatPrice(stockDetails?.dayLow || 0, stockDetails?.currency)} -{' '}
                  {chartUtils.formatPrice(stockDetails?.dayHigh || 0, stockDetails?.currency)}
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}

        {/* Chart Section */}
        <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider' }}>
          {loading ? (
            <ChartSkeleton />
          ) : chartData && chartData.data && chartData.data.length > 0 ? (
            <Box>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartUtils.transformChartData(chartData.data)}>
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
                    formatter={(value) => chartUtils.formatPrice(value, stockDetails?.currency)}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return chartUtils.formatDate(date);
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke={changeColor}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>

              {/* Timeframe Buttons */}
              <Stack direction="row" spacing={1} sx={{ mt: 3, justifyContent: 'center' }}>
                {timeframes.map((range) => (
                  <Button
                    key={range}
                    variant={selectedRange === range ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setSelectedRange(range)}
                  >
                    {chartUtils.getTimeframeLabel(range)}
                  </Button>
                ))}
              </Stack>
            </Box>
          ) : (
            <Alert severity="warning">No chart data available</Alert>
          )}
        </Paper>

        {/* Statistics Section */}
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Key Statistics
        </Typography>

        {loading && !stockDetails ? (
          <StatisticsSkeleton />
        ) : (
          <Grid container spacing={2}>
            {[
              { label: '52 Week High', value: stockDetails?.fiftyTwoWeekHigh },
              { label: '52 Week Low', value: stockDetails?.fiftyTwoWeekLow },
              { label: 'Market Cap', value: stockDetails?.marketCap, format: 'marketCap' },
              { label: 'Volume', value: stockDetails?.volume, format: 'volume' },
              { label: 'P/E Ratio', value: stockDetails?.peRatio, format: 'number' },
              { label: 'Dividend Yield', value: stockDetails?.dividendYield, format: 'percentage' },
            ].map((stat, index) => (
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
                    {stat.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {stat.value
                      ? stat.format === 'marketCap'
                        ? chartUtils.formatMarketCap(stat.value)
                        : stat.format === 'volume'
                        ? chartUtils.formatVolume(stat.value)
                        : stat.format === 'percentage'
                        ? chartUtils.formatPercentage(stat.value)
                        : chartUtils.formatPrice(stat.value, stockDetails?.currency)
                      : 'N/A'}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </ErrorBoundary>
  );
}
