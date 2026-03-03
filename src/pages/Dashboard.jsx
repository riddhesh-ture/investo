import * as React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import CurrencyBitcoinRoundedIcon from '@mui/icons-material/CurrencyBitcoinRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useNavigate } from 'react-router-dom';
import { fetchTopCryptos, fetchGoldPrice } from '../services/marketApi';
import { cachedFetch, TTL_PRESETS } from '../services/apiCache';
import Copyright from '../internals/components/Copyright';

// Quick action cards
const quickActions = [
  {
    title: 'Screener',
    description: 'Search MFs, stocks & crypto',
    icon: <SearchRoundedIcon />,
    path: '/home/screener',
    color: 'primary',
  },
  {
    title: 'Compare Funds',
    description: 'Side-by-side mutual fund analysis',
    icon: <CompareArrowsRoundedIcon />,
    path: '/home/compare',
    color: 'info',
  },
  {
    title: 'Portfolio',
    description: 'Track investments & P&L',
    icon: <AccountBalanceWalletRoundedIcon />,
    path: '/home/portfolio',
    color: 'success',
  },
  {
    title: 'Market',
    description: 'Sectors, crypto & MF categories',
    icon: <ShowChartRoundedIcon />,
    path: '/home/market',
    color: 'warning',
  },
  {
    title: 'Analytics',
    description: 'Deep portfolio insights & risk',
    icon: <AnalyticsRoundedIcon />,
    path: '/home/analytics',
    color: 'secondary',
  },
];

function fmt(val) {
  if (val >= 1e7) return '₹' + (val / 1e7).toFixed(2) + ' Cr';
  if (val >= 1e5) return '₹' + (val / 1e5).toFixed(2) + ' L';
  return '₹' + (val || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [topCryptos, setTopCryptos] = React.useState([]);
  const [goldPrice, setGoldPrice] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    Promise.all([
      fetchTopCryptos(6, 'inr').catch(() => []),
      fetchGoldPrice('INR').catch(() => null),
    ]).then(([cryptos, gold]) => {
      if (active) {
        setTopCryptos(cryptos);
        setGoldPrice(gold);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Welcome Hero */}
      <Card
        sx={(theme) => ({
          mb: 3,
          p: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.background.paper} 100%)`,
          border: '1px solid',
          borderColor: 'divider',
        })}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          Welcome to Investo 👋
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
          Your multi-asset wealth analytics platform — MFs, Stocks, Crypto, Gold & more.
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            size="small"
            startIcon={<SearchRoundedIcon />}
            onClick={() => navigate('/home/screener')}
            sx={{ textTransform: 'none' }}
          >
            Search Assets
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AccountBalanceWalletRoundedIcon />}
            onClick={() => navigate('/home/portfolio')}
            sx={{ textTransform: 'none' }}
          >
            Portfolio
          </Button>
        </Stack>
      </Card>

      {/* Quick Actions */}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {quickActions.map((action) => (
          <Grid key={action.title} size={{ xs: 6, sm: 4, md: 2.4 }}>
            <Card
              variant="outlined"
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                height: '100%',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 },
              }}
              onClick={() => navigate(action.path)}
            >
              <CardContent sx={{ py: 1.5 }}>
                <Box sx={{ color: `${action.color}.main`, mb: 0.5 }}>{action.icon}</Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {action.title}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {action.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* Trending Section */}
      <Grid container spacing={3}>
        {/* Gold Price */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                🥇 Gold Price
              </Typography>
              <Chip size="small" label="Live" color="warning" sx={{ fontSize: '0.65rem' }} />
            </Stack>
            {loading ? (
              <Skeleton variant="text" width="60%" height={40} />
            ) : goldPrice && goldPrice.pricePerGram > 0 ? (
              <>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  ₹{goldPrice.pricePerGram.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  per gram · Source: {goldPrice.source}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2">
                  ₹{goldPrice.pricePerOunce?.toLocaleString('en-IN', { maximumFractionDigits: 0 })} / oz
                </Typography>
              </>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Configure API keys for gold data
              </Typography>
            )}
          </Card>
        </Grid>

        {/* Top Crypto */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CurrencyBitcoinRoundedIcon color="warning" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Top Crypto
                </Typography>
              </Stack>
              <Button
                size="small"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={() => navigate('/home/market')}
                sx={{ textTransform: 'none' }}
              >
                View All
              </Button>
            </Stack>

            {loading ? (
              <Grid container spacing={1}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Grid key={i} size={{ xs: 6, sm: 4 }}>
                    <Skeleton variant="rounded" height={60} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container spacing={1}>
                {topCryptos.map((coin) => {
                  const change = coin.price_change_percentage_24h_in_currency || coin.price_change_percentage_24h || 0;
                  const isUp = change >= 0;
                  return (
                    <Grid key={coin.id} size={{ xs: 6, sm: 4 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ p: 1, borderRadius: 1, bgcolor: 'action.hover' }}
                      >
                        <Box component="img" src={coin.image} alt={coin.name}
                          sx={{ width: 20, height: 20, borderRadius: '50%' }} />
                        <Box sx={{ flex: 1, overflow: 'hidden' }}>
                          <Typography variant="caption" sx={{ fontWeight: 600 }} noWrap>
                            {coin.symbol?.toUpperCase()}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.65rem' }}>
                            {fmt(coin.current_price)}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={`${isUp ? '+' : ''}${change.toFixed(1)}%`}
                          color={isUp ? 'success' : 'error'}
                          sx={{ fontSize: '0.6rem', height: 20 }}
                        />
                      </Stack>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Card>
        </Grid>
      </Grid>

      <Copyright sx={{ my: 4 }} />
    </Box>
  );
}
