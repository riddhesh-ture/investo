import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import CurrencyBitcoinRoundedIcon from '@mui/icons-material/CurrencyBitcoinRounded';
import { fetchTopCryptos } from '../services/marketApi';

// ─── Curated MF category benchmarks ─────────────────────────
const MF_CATEGORIES = [
  { name: 'Large Cap', schemeCode: '120503', color: 'hsl(210, 98%, 48%)' },
  { name: 'Mid Cap', schemeCode: '120505', color: 'hsl(260, 60%, 55%)' },
  { name: 'Small Cap', schemeCode: '120516', color: 'hsl(15, 85%, 55%)' },
  { name: 'ELSS (Tax)', schemeCode: '120503', color: 'hsl(130, 60%, 45%)' },
  { name: 'Flexi Cap', schemeCode: '118989', color: 'hsl(40, 95%, 55%)' },
  { name: 'Liquid', schemeCode: '119062', color: 'hsl(180, 50%, 45%)' },
];

// Sector indices via curated funds
const SECTORS = [
  { name: 'IT', color: 'hsl(210, 80%, 50%)', indicator: '📊' },
  { name: 'Banking', color: 'hsl(130, 60%, 42%)', indicator: '🏦' },
  { name: 'Pharma', color: 'hsl(0, 70%, 50%)', indicator: '💊' },
  { name: 'FMCG', color: 'hsl(40, 90%, 50%)', indicator: '🛒' },
  { name: 'Auto', color: 'hsl(260, 50%, 50%)', indicator: '🚗' },
  { name: 'Energy', color: 'hsl(15, 80%, 50%)', indicator: '⚡' },
  { name: 'Metal', color: 'hsl(0, 0%, 50%)', indicator: '⛏️' },
  { name: 'Realty', color: 'hsl(180, 40%, 45%)', indicator: '🏠' },
];

function formatCurrency(value) {
  if (value >= 1e12) return `₹${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `₹${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(1)}Cr`;
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(1)}L`;
  return `₹${value.toLocaleString('en-IN')}`;
}

function ChangeChip({ value }) {
  const isPositive = value >= 0;
  return (
    <Chip
      size="small"
      icon={isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
      label={`${isPositive ? '+' : ''}${value?.toFixed(2)}%`}
      sx={{
        fontWeight: 600,
        bgcolor: isPositive ? 'success.main' : 'error.main',
        color: 'white',
        '& .MuiChip-icon': { color: 'white' },
      }}
    />
  );
}

function MFCategoryCard({ name, color }) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const cat = MF_CATEGORIES.find((c) => c.name === name);
    if (!cat) { setLoading(false); return; }

    fetch(`https://api.mfapi.in/mf/${cat.schemeCode}`)
      .then((r) => r.json())
      .then((d) => {
        const navs = (d.data || []).map((n) => ({
          date: n.date,
          nav: parseFloat(n.nav),
        })).filter((n) => !isNaN(n.nav));

        if (navs.length < 2) { setLoading(false); return; }

        const latest = navs[0].nav;
        const prev = navs[1]?.nav || latest;
        const dayChange = ((latest - prev) / prev) * 100;

        // 1Y return
        const oneYearAgo = navs.length > 250 ? navs[250] : navs[navs.length - 1];
        const return1Y = ((latest - oneYearAgo.nav) / oneYearAgo.nav) * 100;

        setData({
          schemeName: d.meta?.scheme_name || name,
          nav: latest,
          dayChange,
          return1Y,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [name]);

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        borderLeft: `4px solid ${color}`,
        transition: 'all 0.2s',
        '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' },
      }}
    >
      <CardContent>
        {loading ? (
          <Stack spacing={1}>
            <Skeleton width="60%" />
            <Skeleton width="40%" />
            <Skeleton width="80%" />
          </Stack>
        ) : data ? (
          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {name}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              ₹{data.nav.toFixed(2)}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <ChangeChip value={data.dayChange} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                1D
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: data.return1Y >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
              1Y: {data.return1Y >= 0 ? '+' : ''}{data.return1Y.toFixed(1)}%
            </Typography>
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Data unavailable
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function SectorHeatmapCard() {
  return (
    <Card variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        🏢 Sector Pulse
      </Typography>
      <Grid container spacing={1}>
        {SECTORS.map((sector) => {
          // Generate a mock change for visual demo (will be replaced by real data)
          const change = (Math.random() * 6 - 2).toFixed(1);
          const isPositive = change >= 0;
          return (
            <Grid key={sector.name} size={{ xs: 6, sm: 3 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  textAlign: 'center',
                  bgcolor: isPositive
                    ? 'rgba(46, 125, 50, 0.08)'
                    : 'rgba(211, 47, 47, 0.08)',
                  border: '1px solid',
                  borderColor: isPositive
                    ? 'rgba(46, 125, 50, 0.2)'
                    : 'rgba(211, 47, 47, 0.2)',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'scale(1.02)' },
                }}
              >
                <Typography variant="body2" sx={{ fontSize: '1.2rem' }}>
                  {sector.indicator}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                  {sector.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: isPositive ? 'success.main' : 'error.main',
                  }}
                >
                  {isPositive ? '+' : ''}{change}%
                </Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Card>
  );
}

export default function Market() {
  const [cryptos, setCryptos] = React.useState([]);
  const [cryptoLoading, setCryptoLoading] = React.useState(true);

  React.useEffect(() => {
    fetchTopCryptos(10, 'inr')
      .then(setCryptos)
      .catch(() => { })
      .finally(() => setCryptoLoading(false));
  }, []);

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Page Header */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <ShowChartRoundedIcon sx={{ color: 'primary.main', fontSize: 32 }} />
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Market Overview
        </Typography>
      </Stack>

      {/* MF Category Returns */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        📈 Mutual Fund Categories
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {MF_CATEGORIES.map((cat) => (
          <Grid key={cat.name} size={{ xs: 12, sm: 6, md: 4 }}>
            <MFCategoryCard name={cat.name} color={cat.color} />
          </Grid>
        ))}
      </Grid>

      {/* Sector Heatmap */}
      <Box sx={{ mb: 4 }}>
        <SectorHeatmapCard />
      </Box>

      {/* Top Cryptos */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        <CurrencyBitcoinRoundedIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'hsl(40, 95%, 55%)' }} />
        Top Cryptocurrencies
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Coin</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Price (INR)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>24h</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>7d</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Market Cap</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cryptoLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}><Skeleton /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : cryptos.length > 0 ? (
              cryptos.map((coin, idx) => (
                <TableRow
                  key={coin.id}
                  sx={{
                    transition: 'background 0.2s',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box
                        component="img"
                        src={coin.image}
                        alt={coin.name}
                        sx={{ width: 24, height: 24, borderRadius: '50%' }}
                      />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {coin.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase' }}>
                          {coin.symbol}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    ₹{coin.current_price?.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: coin.price_change_percentage_24h_in_currency >= 0 ? 'success.main' : 'error.main',
                      }}
                    >
                      {coin.price_change_percentage_24h_in_currency >= 0 ? '+' : ''}
                      {coin.price_change_percentage_24h_in_currency?.toFixed(2)}%
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: coin.price_change_percentage_7d_in_currency >= 0 ? 'success.main' : 'error.main',
                      }}
                    >
                      {coin.price_change_percentage_7d_in_currency >= 0 ? '+' : ''}
                      {coin.price_change_percentage_7d_in_currency?.toFixed(2)}%
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(coin.market_cap || 0)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>
                    No crypto data available. Add a CoinGecko API key in Settings.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
