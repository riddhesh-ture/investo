import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import { LineChart } from '@mui/x-charts/LineChart';
import { fetchAllSchemes, fetchSchemeDetails } from '../services/mfApi';
import {
    processNavData,
    filterByPeriod,
    downsample,
    toPercentageReturns,
    calculateReturns,
    calculateVolatility,
    calculateSharpeRatio,
    calculateMaxDrawdown,
    getHighLow,
    fuzzyMatch,
    getAmcShortName,
    getAmcColor,
} from '../utils/finMetrics';
import Header from '../components/dashboard/Header';

const periodOptions = ['1M', '3M', '6M', '1Y', '3Y', '5Y', 'ALL'];

function formatPct(val) {
    if (val === null || val === undefined) return '—';
    const sign = val >= 0 ? '+' : '';
    return `${sign}${val.toFixed(2)}%`;
}

function ColoredValue({ value, suffix = '%' }) {
    if (value === null || value === undefined) {
        return <Typography variant="body2" sx={{ color: 'text.disabled' }}>—</Typography>;
    }
    const isPositive = value >= 0;
    return (
        <Typography
            variant="body2"
            sx={{
                fontWeight: 600,
                color: isPositive ? 'success.main' : 'error.main',
            }}
        >
            {isPositive ? '+' : ''}{value.toFixed(2)}{suffix}
        </Typography>
    );
}

export default function Compare() {
    const [schemes, setSchemes] = React.useState([]);
    const [schemesLoading, setSchemesLoading] = React.useState(true);
    const [fund1, setFund1] = React.useState(null);
    const [fund2, setFund2] = React.useState(null);
    const [fund1Raw, setFund1Raw] = React.useState(null);
    const [fund2Raw, setFund2Raw] = React.useState(null);
    const [loading1, setLoading1] = React.useState(false);
    const [loading2, setLoading2] = React.useState(false);
    const [error, setError] = React.useState('');
    const [period, setPeriod] = React.useState('1Y');

    React.useEffect(() => {
        fetchAllSchemes()
            .then(setSchemes)
            .catch(() => setError('Failed to load scheme list'))
            .finally(() => setSchemesLoading(false));
    }, []);

    React.useEffect(() => {
        if (!fund1) { setFund1Raw(null); return; }
        setLoading1(true);
        fetchSchemeDetails(fund1.schemeCode)
            .then(setFund1Raw)
            .catch(() => setError('Failed to load fund 1 data'))
            .finally(() => setLoading1(false));
    }, [fund1]);

    React.useEffect(() => {
        if (!fund2) { setFund2Raw(null); return; }
        setLoading2(true);
        fetchSchemeDetails(fund2.schemeCode)
            .then(setFund2Raw)
            .catch(() => setError('Failed to load fund 2 data'))
            .finally(() => setLoading2(false));
    }, [fund2]);

    // Process data
    const allNav1 = processNavData(fund1Raw?.data);
    const allNav2 = processNavData(fund2Raw?.data);
    const nav1 = filterByPeriod(allNav1, period);
    const nav2 = filterByPeriod(allNav2, period);

    // Percentage returns for comparison chart
    const pct1 = toPercentageReturns(nav1);
    const pct2 = toPercentageReturns(nav2);
    const chart1 = downsample(pct1, 200);
    const chart2 = downsample(pct2, 200);

    // Calculate metrics for both funds
    const returns1 = calculateReturns(allNav1);
    const returns2 = calculateReturns(allNav2);
    const vol1 = calculateVolatility(filterByPeriod(allNav1, '1Y'));
    const vol2 = calculateVolatility(filterByPeriod(allNav2, '1Y'));
    const sharpe1 = calculateSharpeRatio(allNav1);
    const sharpe2 = calculateSharpeRatio(allNav2);
    const dd1 = calculateMaxDrawdown(allNav1);
    const dd2 = calculateMaxDrawdown(allNav2);
    const hl1 = getHighLow(filterByPeriod(allNav1, '1Y'));
    const hl2 = getHighLow(filterByPeriod(allNav2, '1Y'));

    const fund1Label = fund1?.schemeName?.substring(0, 35) || 'Fund 1';
    const fund2Label = fund2?.schemeName?.substring(0, 35) || 'Fund 2';

    // Build chart series
    const series = [];
    if (chart1.length > 1) {
        series.push({
            data: chart1.map((d) => d.value),
            label: fund1Label,
            color: 'hsl(210, 98%, 48%)',
            showMark: false,
        });
    }
    if (chart2.length > 1) {
        series.push({
            data: chart2.map((d) => d.value),
            label: fund2Label,
            color: 'hsl(130, 60%, 45%)',
            showMark: false,
        });
    }

    const longerChart = chart1.length >= chart2.length ? chart1 : chart2;

    const hasBothFunds = fund1Raw && fund2Raw;

    // Comparison table rows
    const comparisonRows = [
        {
            metric: '1M Return',
            v1: returns1['1M']?.absoluteReturn,
            v2: returns2['1M']?.absoluteReturn,
            type: 'pct',
        },
        {
            metric: '3M Return',
            v1: returns1['3M']?.absoluteReturn,
            v2: returns2['3M']?.absoluteReturn,
            type: 'pct',
        },
        {
            metric: '6M Return',
            v1: returns1['6M']?.absoluteReturn,
            v2: returns2['6M']?.absoluteReturn,
            type: 'pct',
        },
        {
            metric: '1Y Return',
            v1: returns1['1Y']?.absoluteReturn,
            v2: returns2['1Y']?.absoluteReturn,
            type: 'pct',
        },
        {
            metric: '3Y CAGR',
            v1: returns1['3Y']?.cagr,
            v2: returns2['3Y']?.cagr,
            type: 'pct',
        },
        {
            metric: '5Y CAGR',
            v1: returns1['5Y']?.cagr,
            v2: returns2['5Y']?.cagr,
            type: 'pct',
        },
        {
            metric: 'Volatility (1Y)',
            v1: vol1,
            v2: vol2,
            type: 'risk',
            lowerBetter: true,
        },
        {
            metric: 'Sharpe Ratio',
            v1: sharpe1,
            v2: sharpe2,
            type: 'num',
        },
        {
            metric: 'Max Drawdown',
            v1: dd1 !== null ? -dd1 : null,
            v2: dd2 !== null ? -dd2 : null,
            type: 'pct',
        },
        {
            metric: '52W High',
            v1: hl1.high?.nav,
            v2: hl2.high?.nav,
            type: 'nav',
        },
        {
            metric: '52W Low',
            v1: hl1.low?.nav,
            v2: hl2.low?.nav,
            type: 'nav',
        },
    ];

    function renderValue(val, type, otherVal, lowerBetter = false) {
        if (val === null || val === undefined) {
            return <Typography variant="body2" sx={{ color: 'text.disabled' }}>—</Typography>;
        }
        const isBetter = otherVal !== null && otherVal !== undefined
            ? (lowerBetter ? val < otherVal : val > otherVal)
            : false;

        if (type === 'nav') {
            return (
                <Typography variant="body2" sx={{ fontWeight: isBetter ? 700 : 400 }}>
                    ₹{val.toFixed(2)}
                </Typography>
            );
        }
        if (type === 'num') {
            return (
                <Typography variant="body2" sx={{ fontWeight: isBetter ? 700 : 400, color: isBetter ? 'success.main' : 'text.primary' }}>
                    {val.toFixed(2)}
                </Typography>
            );
        }
        if (type === 'risk') {
            return (
                <Typography variant="body2" sx={{ fontWeight: isBetter ? 700 : 400, color: isBetter ? 'success.main' : 'text.primary' }}>
                    {val.toFixed(2)}%
                </Typography>
            );
        }
        // pct
        return <ColoredValue value={val} />;
    }

    return (
        <React.Fragment>
            <Header />
            <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
                <Typography component="h2" variant="h6" sx={{ mb: 1 }}>
                    Fund Comparison
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                    Select two mutual funds to compare their performance, returns, and risk metrics.
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Autocomplete
                            id="compare-fund-1"
                            options={schemes}
                            getOptionLabel={(opt) => opt.schemeName}
                            value={fund1}
                            onChange={(_, val) => setFund1(val)}
                            loading={schemesLoading}
                            renderOption={(props, option) => {
                                const { key, ...otherProps } = props;
                                const amc = getAmcShortName(option.schemeName);
                                const color = getAmcColor(option.schemeName);
                                return (
                                    <li key={key} {...otherProps}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Avatar sx={{ width: 24, height: 24, bgcolor: color, fontSize: '0.6rem' }}>
                                                {amc}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2">{option.schemeName}</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                    ({option.schemeCode})
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </li>
                                );
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Fund 1"
                                    placeholder="Search fund..."
                                    size="small"
                                    slotProps={{
                                        input: {
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {schemesLoading || loading1 ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        },
                                    }}
                                />
                            )}
                            filterOptions={(options, { inputValue }) => {
                                if (!inputValue) return options.slice(0, 50);
                                return options
                                    .filter((o) => fuzzyMatch(o.schemeName, inputValue) || String(o.schemeCode).includes(inputValue))
                                    .slice(0, 50);
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Autocomplete
                            id="compare-fund-2"
                            options={schemes}
                            getOptionLabel={(opt) => opt.schemeName}
                            value={fund2}
                            onChange={(_, val) => setFund2(val)}
                            loading={schemesLoading}
                            renderOption={(props, option) => {
                                const { key, ...otherProps } = props;
                                const amc = getAmcShortName(option.schemeName);
                                const color = getAmcColor(option.schemeName);
                                return (
                                    <li key={key} {...otherProps}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Avatar sx={{ width: 24, height: 24, bgcolor: color, fontSize: '0.6rem' }}>
                                                {amc}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2">{option.schemeName}</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                    ({option.schemeCode})
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </li>
                                );
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Fund 2"
                                    placeholder="Search fund..."
                                    size="small"
                                    slotProps={{
                                        input: {
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {schemesLoading || loading2 ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        },
                                    }}
                                />
                            )}
                            filterOptions={(options, { inputValue }) => {
                                if (!inputValue) return options.slice(0, 50);
                                return options
                                    .filter((o) => fuzzyMatch(o.schemeName, inputValue) || String(o.schemeCode).includes(inputValue))
                                    .slice(0, 50);
                            }}
                        />
                    </Grid>
                </Grid>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {/* Percentage-Based Comparison Chart */}
                <Card variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                Returns Comparison (%)
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Percentage returns from start of selected period — normalized for fair comparison
                            </Typography>
                        </Box>
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

                    {(loading1 || loading2) && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress />
                        </Box>
                    )}

                    {!loading1 && !loading2 && series.length > 0 && longerChart.length > 1 ? (
                        <LineChart
                            height={450}
                            series={series}
                            xAxis={[
                                {
                                    data: longerChart.map((d) => d.date),
                                    scaleType: 'time',
                                    valueFormatter: (date) =>
                                        date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
                                },
                            ]}
                            yAxis={[
                                {
                                    valueFormatter: (v) => `${v.toFixed(1)}%`,
                                },
                            ]}
                        />
                    ) : !loading1 && !loading2 ? (
                        <Typography sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                            Select two funds above to see their comparison chart.
                        </Typography>
                    ) : null}
                </Card>

                {/* Metrics Comparison Table */}
                {hasBothFunds && !loading1 && !loading2 && (
                    <Card variant="outlined" sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                Metrics Comparison
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600 }}>Metric</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600, color: 'hsl(210, 98%, 48%)' }}>
                                                {fund1Label}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600, color: 'hsl(130, 60%, 45%)' }}>
                                                {fund2Label}
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600 }}>Winner</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {comparisonRows.map((row) => {
                                            let winner = null;
                                            if (row.v1 !== null && row.v1 !== undefined && row.v2 !== null && row.v2 !== undefined) {
                                                if (row.lowerBetter) {
                                                    winner = row.v1 < row.v2 ? 1 : row.v2 < row.v1 ? 2 : null;
                                                } else {
                                                    winner = row.v1 > row.v2 ? 1 : row.v2 > row.v1 ? 2 : null;
                                                }
                                            }
                                            return (
                                                <TableRow key={row.metric} hover>
                                                    <TableCell sx={{ fontWeight: 500 }}>{row.metric}</TableCell>
                                                    <TableCell align="right">
                                                        {renderValue(row.v1, row.type, row.v2, row.lowerBetter)}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {renderValue(row.v2, row.type, row.v1, row.lowerBetter)}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {winner === 1 && <Chip label="Fund 1" size="small" color="primary" variant="outlined" />}
                                                        {winner === 2 && <Chip label="Fund 2" size="small" color="success" variant="outlined" />}
                                                        {winner === null && <Typography variant="caption" sx={{ color: 'text.disabled' }}>—</Typography>}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                )}
            </Box>
        </React.Fragment>
    );
}
