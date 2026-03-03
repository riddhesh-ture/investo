import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CurrencyBitcoinRoundedIcon from '@mui/icons-material/CurrencyBitcoinRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import Alert from '@mui/material/Alert';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import {
    fetchMFSchemes,
    searchCrypto,
    fetchCryptoPrice,
    fetchTopCryptos,
    searchIndianStocks,
    searchUSStocks,
} from '../services/marketApi';
import { fuzzyMatch, getAmcShortName, getAmcColor } from '../utils/finMetrics';

const TABS = [
    { label: 'Mutual Funds', icon: <AccountBalanceRoundedIcon fontSize="small" /> },
    { label: 'Stocks', icon: <ShowChartRoundedIcon fontSize="small" /> },
    { label: 'Crypto', icon: <CurrencyBitcoinRoundedIcon fontSize="small" /> },
];

// ─── MF helpers ──────────────────────────────────────────────
function extractAmc(schemeName) {
    if (!schemeName) return '';
    const amcPatterns = [
        'SBI', 'HDFC', 'ICICI Prudential', 'Axis', 'Kotak', 'Nippon India',
        'Aditya Birla Sun Life', 'UTI', 'Tata', 'DSP', 'Mirae Asset',
        'Franklin Templeton', 'Invesco', 'Motilal Oswal', 'PGIM India',
        'Canara Robeco', 'Bandhan', 'Edelweiss', 'HSBC', 'L&T',
        'Sundaram', 'Baroda BNP Paribas', 'JM Financial', 'Quantum',
        'PPFAS', 'Parag Parikh', 'Mahindra Manulife', 'Union',
        'Bank of India', 'LIC', 'ITI', 'Quant', 'IDBI', 'Navi',
        'Groww', 'Zerodha', 'WhiteOak', 'Samco', 'Trust',
        'Reliance', 'IDFC', 'BNP Paribas', 'Principal',
    ];
    const nameLower = schemeName.toLowerCase();
    for (const amc of amcPatterns) {
        if (nameLower.startsWith(amc.toLowerCase())) return amc;
    }
    return schemeName.split(/\s+/).slice(0, 2).join(' ');
}

const mfColumns = [
    {
        field: 'schemeName',
        headerName: 'Fund Name',
        flex: 1,
        minWidth: 400,
        renderCell: (params) => {
            const amc = extractAmc(params.value);
            return (
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 0.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: getAmcColor(amc), fontSize: '0.75rem', fontWeight: 600 }}>
                        {getAmcShortName(amc)}
                    </Avatar>
                    <Box sx={{ overflow: 'hidden' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {params.value}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{amc}</Typography>
                    </Box>
                </Stack>
            );
        },
    },
    {
        field: 'schemeCode',
        headerName: 'Code',
        width: 120,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => (
            <Chip label={params.value} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }} />
        ),
    },
];

// ─── MF Tab ──────────────────────────────────────────────────
function MFTab({ search }) {
    const [schemes, setSchemes] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const navigate = useNavigate();

    React.useEffect(() => {
        fetchMFSchemes()
            .then(setSchemes)
            .catch(() => setError('Failed to load mutual fund data.'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = React.useMemo(() => {
        if (!search.trim()) return schemes;
        return schemes.filter((s) =>
            fuzzyMatch(s.schemeName, search) || String(s.schemeCode).includes(search)
        );
    }, [search, schemes]);

    return (
        <>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {search && (
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                    {filtered.length.toLocaleString()} funds found
                </Typography>
            )}
            <Box sx={{ height: 540, width: '100%' }}>
                <DataGrid
                    rows={filtered}
                    columns={mfColumns}
                    getRowId={(row) => row.schemeCode}
                    loading={loading}
                    onRowClick={(params) => navigate(`/home/fund/${params.row.schemeCode}`)}
                    rowHeight={56}
                    pageSizeOptions={[25, 50, 100]}
                    initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                    sx={{ cursor: 'pointer', '& .MuiDataGrid-row:hover': { backgroundColor: 'action.hover' } }}
                    disableRowSelectionOnClick
                />
            </Box>
        </>
    );
}

// ─── Stock Tab ───────────────────────────────────────────────
function StockTab({ search }) {
    const [results, setResults] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        if (search.length < 2) { setResults([]); return; }
        setLoading(true);
        const timer = setTimeout(async () => {
            const [indian, us] = await Promise.all([
                searchIndianStocks(search),
                searchUSStocks(search),
            ]);
            const combined = [
                ...(indian || []).map((s) => ({
                    id: s.symbol || s.ticker || s.name,
                    name: s.name || s.companyName || s.symbol,
                    symbol: s.symbol || s.ticker,
                    market: 'India',
                    type: 'NSE/BSE',
                })),
                ...(us || []).map((s) => ({
                    id: `US_${s.symbol}`,
                    name: s.name,
                    symbol: s.symbol,
                    market: s.region || 'US',
                    type: s.type || 'Equity',
                    currency: s.currency,
                })),
            ];
            setResults(combined);
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    if (!search || search.length < 2) {
        return (
            <Box sx={{ py: 6, textAlign: 'center' }}>
                <ShowChartRoundedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Search for stocks</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Type at least 2 characters — e.g. "RELIANCE", "INFY", "AAPL", "TSLA"
                </Typography>
            </Box>
        );
    }

    return (
        <>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                {loading ? 'Searching...' : `${results.length} stocks found`}
            </Typography>
            <Grid container spacing={2}>
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Grid key={i} size={{ xs: 12, sm: 6 }}>
                            <Skeleton variant="rounded" height={80} />
                        </Grid>
                    ))
                ) : results.length > 0 ? (
                    results.map((stock) => (
                        <Grid key={stock.id} size={{ xs: 12, sm: 6 }}>
                            <Card
                                variant="outlined"
                                sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { boxShadow: 2, transform: 'translateY(-1px)' } }}
                            >
                                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {stock.name}
                                            </Typography>
                                            <Stack direction="row" spacing={0.5} alignItems="center">
                                                <Chip
                                                    size="small"
                                                    label={stock.symbol}
                                                    sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                                                    variant="outlined"
                                                />
                                                <Chip
                                                    size="small"
                                                    label={stock.market}
                                                    color={stock.market === 'India' ? 'success' : 'info'}
                                                    sx={{ fontSize: '0.65rem' }}
                                                />
                                            </Stack>
                                        </Box>
                                        <ShowChartRoundedIcon sx={{ color: 'text.secondary' }} />
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Grid size={12}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
                            No stocks found for "{search}"
                        </Typography>
                    </Grid>
                )}
            </Grid>
        </>
    );
}

// ─── Crypto Tab ──────────────────────────────────────────────
function CryptoTab({ search }) {
    const [results, setResults] = React.useState([]);
    const [topCoins, setTopCoins] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [initialLoading, setInitialLoading] = React.useState(true);

    // Load top coins on mount
    React.useEffect(() => {
        fetchTopCryptos(20, 'inr')
            .then(setTopCoins)
            .catch(() => { })
            .finally(() => setInitialLoading(false));
    }, []);

    // Search
    React.useEffect(() => {
        if (!search || search.length < 2) { setResults([]); return; }
        setLoading(true);
        const timer = setTimeout(() => {
            searchCrypto(search)
                .then(setResults)
                .catch(() => setResults([]))
                .finally(() => setLoading(false));
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const displayList = search && search.length >= 2 ? results : [];
    const showTop = !search || search.length < 2;

    return (
        <>
            {showTop ? (
                <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                        🔥 Top 20 by Market Cap
                    </Typography>
                    <Grid container spacing={1.5}>
                        {initialLoading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <Grid key={i} size={{ xs: 6, sm: 3 }}>
                                    <Skeleton variant="rounded" height={80} />
                                </Grid>
                            ))
                        ) : (
                            topCoins.map((coin) => (
                                <Grid key={coin.id} size={{ xs: 6, sm: 3 }}>
                                    <Card
                                        variant="outlined"
                                        sx={{ transition: 'all 0.2s', '&:hover': { boxShadow: 2, transform: 'translateY(-1px)' } }}
                                    >
                                        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Box component="img" src={coin.image} alt={coin.name}
                                                    sx={{ width: 24, height: 24, borderRadius: '50%' }} />
                                                <Box sx={{ overflow: 'hidden', flex: 1 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }} noWrap>
                                                        {coin.name}
                                                    </Typography>
                                                    <Stack direction="row" justifyContent="space-between">
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase' }}>
                                                            {coin.symbol}
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                fontWeight: 600,
                                                                color: (coin.price_change_percentage_24h_in_currency || 0) >= 0 ? 'success.main' : 'error.main',
                                                            }}
                                                        >
                                                            {(coin.price_change_percentage_24h_in_currency || 0) >= 0 ? '+' : ''}
                                                            {(coin.price_change_percentage_24h_in_currency || 0).toFixed(1)}%
                                                        </Typography>
                                                    </Stack>
                                                </Box>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))
                        )}
                    </Grid>
                </>
            ) : (
                <>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                        {loading ? 'Searching...' : `${displayList.length} results`}
                    </Typography>
                    <Grid container spacing={1.5}>
                        {displayList.map((coin) => (
                            <Grid key={coin.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                <Card
                                    variant="outlined"
                                    sx={{ transition: 'all 0.2s', '&:hover': { boxShadow: 2, transform: 'translateY(-1px)' } }}
                                >
                                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <Box component="img" src={coin.thumb} alt={coin.name}
                                                sx={{ width: 32, height: 32, borderRadius: '50%' }} />
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{coin.name}</Typography>
                                                <Stack direction="row" spacing={0.5}>
                                                    <Chip size="small" label={coin.symbol?.toUpperCase()} variant="outlined"
                                                        sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }} />
                                                    {coin.marketCapRank && (
                                                        <Chip size="small" label={`#${coin.marketCapRank}`} color="primary" sx={{ fontSize: '0.65rem' }} />
                                                    )}
                                                </Stack>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                        {!loading && displayList.length === 0 && (
                            <Grid size={12}>
                                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
                                    No crypto found for "{search}"
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </>
            )}
        </>
    );
}

// ─── Main Screener ───────────────────────────────────────────
export default function Screener() {
    const [tabIndex, setTabIndex] = React.useState(0);
    const [search, setSearch] = React.useState('');

    const placeholders = [
        'Search funds — "icici large cap", "sbi bluechip", "hdfc mid"...',
        'Search stocks — "RELIANCE", "INFY", "AAPL", "TSLA"...',
        'Search crypto — "bitcoin", "ethereum", "solana"...',
    ];

    return (
        <Box sx={{ px: { xs: 2, md: 3 }, py: 3, maxWidth: 1200, mx: 'auto' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <SearchRoundedIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                <Typography variant="h4" sx={{ fontWeight: 800 }}>Screener</Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Search across mutual funds, Indian & US stocks, and cryptocurrencies.
            </Typography>

            <Tabs
                value={tabIndex}
                onChange={(_, v) => { setTabIndex(v); setSearch(''); }}
                sx={{ mb: 2 }}
            >
                {TABS.map((tab, i) => (
                    <Tab key={i} label={tab.label} icon={tab.icon} iconPosition="start"
                        sx={{ textTransform: 'none', fontWeight: 600, minHeight: 48 }} />
                ))}
            </Tabs>

            <TextField
                placeholder={placeholders[tabIndex]}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
                slotProps={{
                    input: {
                        startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment>,
                    },
                }}
            />

            {tabIndex === 0 && <MFTab search={search} />}
            {tabIndex === 1 && <StockTab search={search} />}
            {tabIndex === 2 && <CryptoTab search={search} />}
        </Box>
    );
}
