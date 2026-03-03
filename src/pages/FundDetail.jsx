import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Avatar from '@mui/material/Avatar';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Tooltip from '@mui/material/Tooltip';
import { LineChart } from '@mui/x-charts/LineChart';
import { fetchSchemeDetails } from '../services/mfApi';
import {
    processNavData,
    filterByPeriod,
    downsample,
    absoluteReturn,
    calculateReturns,
    calculateVolatility,
    calculateSharpeRatio,
    calculateMaxDrawdown,
    getHighLow,
    getAmcShortName,
    getAmcColor,
} from '../utils/finMetrics';
import Header from '../components/dashboard/Header';

const periodOptions = ['1M', '3M', '6M', '1Y', '3Y', '5Y', 'ALL'];

function MetricCard({ title, value, subtitle, tooltip, color, icon }) {
    return (
        <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                    {icon}
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                        {title}
                    </Typography>
                    {tooltip && (
                        <Tooltip title={tooltip} arrow>
                            <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled', cursor: 'help' }} />
                        </Tooltip>
                    )}
                </Stack>
                <Typography variant="h5" sx={{ fontWeight: 700, color: color || 'text.primary' }}>
                    {value}
                </Typography>
                {subtitle && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {subtitle}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}

export default function FundDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [period, setPeriod] = React.useState('1Y');

    React.useEffect(() => {
        let active = true;
        setLoading(true);
        setError('');
        fetchSchemeDetails(id)
            .then((res) => {
                if (active) {
                    setData(res);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (active) {
                    setError('Failed to load fund details.');
                    setLoading(false);
                }
            });
        return () => { active = false; };
    }, [id]);

    if (loading) {
        return (
            <React.Fragment>
                <Header />
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                    <CircularProgress />
                </Box>
            </React.Fragment>
        );
    }

    if (error) {
        return (
            <React.Fragment>
                <Header />
                <Alert severity="error">{error}</Alert>
            </React.Fragment>
        );
    }

    if (!data || !data.data || data.data.length === 0) {
        return (
            <React.Fragment>
                <Header />
                <Alert severity="warning">No data available for this fund.</Alert>
            </React.Fragment>
        );
    }

    const meta = data.meta || {};
    const allNavData = processNavData(data.data);
    const filteredNav = filterByPeriod(allNavData, period);
    const chartData = downsample(filteredNav);

    const latestNav = allNavData.length > 0 ? allNavData[allNavData.length - 1].nav : 0;
    const firstNav = filteredNav.length > 0 ? filteredNav[0].nav : latestNav;
    const change = latestNav - firstNav;
    const changePct = absoluteReturn(firstNav, latestNav);
    const isUp = change >= 0;

    // Calculate all metrics
    const returns = calculateReturns(allNavData);
    const volatility1Y = calculateVolatility(filterByPeriod(allNavData, '1Y'));
    const volatilityAll = calculateVolatility(allNavData);
    const sharpeRatio = calculateSharpeRatio(allNavData);
    const maxDrawdown = calculateMaxDrawdown(allNavData);
    const highLow52W = getHighLow(filterByPeriod(allNavData, '1Y'));
    const highLowAll = getHighLow(allNavData);

    const amcShort = getAmcShortName(meta.fund_house);
    const amcColor = getAmcColor(meta.fund_house);

    return (
        <React.Fragment>
            <Header />
            <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
                <Button
                    startIcon={<ArrowBackRoundedIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ mb: 2 }}
                >
                    Back
                </Button>

                {/* Fund Header */}
                <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 3 }}>
                    <Avatar
                        sx={{
                            width: 48,
                            height: 48,
                            bgcolor: amcColor,
                            fontSize: '1rem',
                            fontWeight: 700,
                            mt: 0.5,
                        }}
                    >
                        {amcShort}
                    </Avatar>
                    <Box>
                        <Typography component="h2" variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {meta.scheme_name || `Fund ${id}`}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {meta.fund_house || ''}
                            </Typography>
                            {meta.scheme_category && (
                                <Chip label={meta.scheme_category} size="small" variant="outlined" />
                            )}
                            {meta.scheme_type && (
                                <Chip label={meta.scheme_type} size="small" variant="outlined" />
                            )}
                            <Chip label={`#${id}`} size="small" sx={{ fontFamily: 'monospace' }} />
                        </Stack>
                    </Box>
                </Stack>

                {/* Key Metrics Row */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <MetricCard
                            title="Latest NAV"
                            value={`₹${latestNav.toFixed(2)}`}
                            subtitle={allNavData.length > 0 ? allNavData[allNavData.length - 1].date.toLocaleDateString('en-IN') : ''}
                            icon={<ShowChartRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <MetricCard
                            title={`Change (${period})`}
                            value={`${isUp ? '+' : ''}${change.toFixed(2)}`}
                            subtitle={changePct !== null ? `${isUp ? '+' : ''}${changePct.toFixed(2)}%` : ''}
                            color={isUp ? 'success.main' : 'error.main'}
                            icon={isUp
                                ? <TrendingUpRoundedIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                : <TrendingDownRoundedIcon sx={{ fontSize: 16, color: 'error.main' }} />
                            }
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <MetricCard
                            title="52W High"
                            value={highLow52W.high?.nav ? `₹${highLow52W.high.nav.toFixed(2)}` : 'N/A'}
                            subtitle={highLow52W.high?.date ? highLow52W.high.date.toLocaleDateString('en-IN') : ''}
                            color="success.main"
                            icon={<TrendingUpRoundedIcon sx={{ fontSize: 16, color: 'success.main' }} />}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <MetricCard
                            title="52W Low"
                            value={highLow52W.low?.nav ? `₹${highLow52W.low.nav.toFixed(2)}` : 'N/A'}
                            subtitle={highLow52W.low?.date ? highLow52W.low.date.toLocaleDateString('en-IN') : ''}
                            color="error.main"
                            icon={<TrendingDownRoundedIcon sx={{ fontSize: 16, color: 'error.main' }} />}
                        />
                    </Grid>
                </Grid>

                {/* NAV Chart */}
                <Card variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            NAV History
                        </Typography>
                        <ToggleButtonGroup
                            value={period}
                            exclusive
                            onChange={(_, val) => val && setPeriod(val)}
                            size="small"
                        >
                            {periodOptions.map((p) => (
                                <ToggleButton key={p} value={p} sx={{ px: 1.5 }}>
                                    {p}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Stack>
                    {chartData.length > 1 ? (
                        <LineChart
                            height={400}
                            series={[
                                {
                                    data: chartData.map((d) => d.nav),
                                    label: 'NAV (₹)',
                                    color: isUp ? 'hsl(120, 44%, 53%)' : 'hsl(0, 90%, 40%)',
                                    showMark: false,
                                    area: true,
                                },
                            ]}
                            xAxis={[
                                {
                                    data: chartData.map((d) => d.date),
                                    scaleType: 'time',
                                    valueFormatter: (date) =>
                                        date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
                                },
                            ]}
                            sx={{
                                '& .MuiAreaElement-root': {
                                    opacity: 0.15,
                                },
                            }}
                        />
                    ) : (
                        <Typography sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                            Not enough data points to display chart.
                        </Typography>
                    )}
                </Card>

                {/* Returns Table + Risk Metrics side by side */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {/* Returns Table */}
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                    Returns
                                </Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Period</TableCell>
                                                <TableCell align="right">Absolute Return</TableCell>
                                                <TableCell align="right">CAGR</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {['1W', '1M', '3M', '6M', '1Y', '2Y', '3Y', '5Y'].map((p) => {
                                                const r = returns[p];
                                                if (!r) return (
                                                    <TableRow key={p}>
                                                        <TableCell>{p}</TableCell>
                                                        <TableCell align="right" sx={{ color: 'text.disabled' }}>—</TableCell>
                                                        <TableCell align="right" sx={{ color: 'text.disabled' }}>—</TableCell>
                                                    </TableRow>
                                                );
                                                const isPositive = r.absoluteReturn >= 0;
                                                return (
                                                    <TableRow key={p} hover>
                                                        <TableCell sx={{ fontWeight: 500 }}>{p}</TableCell>
                                                        <TableCell align="right">
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    color: isPositive ? 'success.main' : 'error.main',
                                                                    fontWeight: 500,
                                                                }}
                                                            >
                                                                {isPositive ? '+' : ''}{r.absoluteReturn.toFixed(2)}%
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {r.cagr !== null ? (
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        color: r.cagr >= 0 ? 'success.main' : 'error.main',
                                                                        fontWeight: 500,
                                                                    }}
                                                                >
                                                                    {r.cagr >= 0 ? '+' : ''}{r.cagr.toFixed(2)}%
                                                                </Typography>
                                                            ) : (
                                                                <Typography variant="body2" sx={{ color: 'text.disabled' }}>—</Typography>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Risk Metrics */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                    Risk Metrics
                                </Typography>
                                <Stack spacing={2}>
                                    <Box>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Stack direction="row" spacing={0.5} alignItems="center">
                                                <Typography variant="body2">Volatility (1Y)</Typography>
                                                <Tooltip title="Annualized standard deviation of daily returns over the past year. Higher = more risky." arrow>
                                                    <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                                </Tooltip>
                                            </Stack>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {volatility1Y !== null ? `${volatility1Y.toFixed(2)}%` : 'N/A'}
                                            </Typography>
                                        </Stack>
                                        <Divider sx={{ mt: 1 }} />
                                    </Box>
                                    <Box>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Stack direction="row" spacing={0.5} alignItems="center">
                                                <Typography variant="body2">Sharpe Ratio</Typography>
                                                <Tooltip title="Risk-adjusted return. Higher is better. Assumes 7% risk-free rate (India 10Y Govt Bond)." arrow>
                                                    <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                                </Tooltip>
                                            </Stack>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: sharpeRatio !== null
                                                        ? sharpeRatio > 1 ? 'success.main' : sharpeRatio > 0 ? 'warning.main' : 'error.main'
                                                        : 'text.primary',
                                                }}
                                            >
                                                {sharpeRatio !== null ? sharpeRatio.toFixed(2) : 'N/A'}
                                            </Typography>
                                        </Stack>
                                        <Divider sx={{ mt: 1 }} />
                                    </Box>
                                    <Box>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Stack direction="row" spacing={0.5} alignItems="center">
                                                <Typography variant="body2">Max Drawdown</Typography>
                                                <Tooltip title="Maximum peak-to-trough decline in NAV. Measures worst-case loss." arrow>
                                                    <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                                </Tooltip>
                                            </Stack>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                                                {maxDrawdown !== null ? `-${maxDrawdown.toFixed(2)}%` : 'N/A'}
                                            </Typography>
                                        </Stack>
                                        <Divider sx={{ mt: 1 }} />
                                    </Box>
                                    <Box>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="body2">All-Time High</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                                {highLowAll.high?.nav ? `₹${highLowAll.high.nav.toFixed(2)}` : 'N/A'}
                                            </Typography>
                                        </Stack>
                                        <Divider sx={{ mt: 1 }} />
                                    </Box>
                                    <Box>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="body2">All-Time Low</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                                                {highLowAll.low?.nav ? `₹${highLowAll.low.nav.toFixed(2)}` : 'N/A'}
                                            </Typography>
                                        </Stack>
                                        <Divider sx={{ mt: 1 }} />
                                    </Box>
                                    <Box>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="body2">Volatility (All-Time)</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {volatilityAll !== null ? `${volatilityAll.toFixed(2)}%` : 'N/A'}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Fund Info */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                            Fund Information
                        </Typography>
                        <Grid container spacing={2}>
                            {[
                                { label: 'Scheme Code', value: id },
                                { label: 'Fund House', value: meta.fund_house || 'N/A' },
                                { label: 'Scheme Category', value: meta.scheme_category || 'N/A' },
                                { label: 'Scheme Type', value: meta.scheme_type || 'N/A' },
                                { label: 'Data Points', value: allNavData.length.toLocaleString() },
                                {
                                    label: 'Data Range', value: allNavData.length > 0
                                        ? `${allNavData[0].date.toLocaleDateString('en-IN')} — ${allNavData[allNavData.length - 1].date.toLocaleDateString('en-IN')}`
                                        : 'N/A'
                                },
                            ].map((item) => (
                                <Grid key={item.label} size={{ xs: 6, md: 4 }}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {item.label}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {item.value}
                                    </Typography>
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </Card>

                {/* Coming Soon: Holdings, Alpha/Beta */}
                <Card variant="outlined" sx={{ mb: 3, opacity: 0.7 }}>
                    <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                            <BarChartRoundedIcon sx={{ color: 'text.secondary' }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                Holdings & Advanced Metrics
                            </Typography>
                            <Chip label="Coming Soon" size="small" color="info" />
                        </Stack>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Portfolio holdings, sector allocation, Alpha, Beta, Treynor ratio, and other advanced
                            analytics require additional data sources and will be available in a future update.
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        </React.Fragment>
    );
}
