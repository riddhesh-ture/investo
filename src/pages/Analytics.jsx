import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { useAuth } from '../context/AuthContext';
import {
    getTransactions,
    getManualAssets,
    aggregateHoldings,
    buildXIRRCashflows,
} from '../services/transactionService';
import { getLatestPrice } from '../services/marketApi';
import {
    calculateXIRR,
    computeAllocation,
    ASSET_TYPE_LABELS,
    ASSET_TYPE_COLORS,
} from '../utils/finMetrics';

function fmt(val) {
    return '₹' + (val || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function fmtPct(val) {
    return (val >= 0 ? '+' : '') + (val || 0).toFixed(1) + '%';
}

// ─── Asset Breakdown Card ────────────────────────────────────
function AssetBreakdownCard({ allocation }) {
    if (!allocation.length) return null;

    const pieData = allocation.map((a, i) => ({
        id: i,
        value: a.value,
        label: ASSET_TYPE_LABELS[a.assetType] || a.assetType,
        color: ASSET_TYPE_COLORS[a.assetType] || 'hsl(0,0%,50%)',
    }));

    return (
        <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                📊 Asset Class Breakdown
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <PieChart
                    series={[{
                        data: pieData,
                        innerRadius: 55,
                        outerRadius: 100,
                        paddingAngle: 2,
                        cornerRadius: 4,
                    }]}
                    width={320}
                    height={220}
                    slotProps={{ legend: { hidden: true } }}
                />
            </Box>
            <Stack spacing={1}>
                {allocation.map((a) => (
                    <Stack key={a.assetType} direction="row" alignItems="center" spacing={1}>
                        <Box sx={{
                            width: 12, height: 12, borderRadius: '50%',
                            bgcolor: ASSET_TYPE_COLORS[a.assetType] || 'grey',
                            flexShrink: 0,
                        }} />
                        <Typography variant="body2" sx={{ flex: 1 }}>
                            {ASSET_TYPE_LABELS[a.assetType] || a.assetType}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {a.percentage.toFixed(1)}%
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 80, textAlign: 'right' }}>
                            {fmt(a.value)}
                        </Typography>
                    </Stack>
                ))}
            </Stack>
        </Card>
    );
}

// ─── Geographic Split ────────────────────────────────────────
function GeographicCard({ holdings, manualAssets }) {
    const geo = { India: 0, US: 0, Global: 0 };

    for (const h of holdings) {
        if (['MUTUAL_FUND', 'STOCK_IN', 'GOLD'].includes(h.assetType)) {
            geo.India += h.currentValue || 0;
        } else if (h.assetType === 'STOCK_US') {
            geo.US += h.currentValue || 0;
        } else {
            geo.Global += h.currentValue || 0;
        }
    }
    for (const m of manualAssets) {
        geo.India += m.currentValue || 0;
    }

    const total = Object.values(geo).reduce((s, v) => s + v, 0);
    if (total === 0) return null;

    const geoData = [
        { region: 'India 🇮🇳', value: geo.India, pct: (geo.India / total) * 100, color: 'hsl(30, 80%, 55%)' },
        { region: 'US 🇺🇸', value: geo.US, pct: (geo.US / total) * 100, color: 'hsl(210, 90%, 50%)' },
        { region: 'Global 🌍', value: geo.Global, pct: (geo.Global / total) * 100, color: 'hsl(130, 55%, 45%)' },
    ].filter((g) => g.value > 0);

    return (
        <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                🌍 Geographic Split
            </Typography>
            <Stack spacing={1.5}>
                {geoData.map((g) => (
                    <Box key={g.region}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{g.region}</Typography>
                            <Typography variant="body2">{g.pct.toFixed(1)}% · {fmt(g.value)}</Typography>
                        </Stack>
                        <LinearProgress
                            variant="determinate"
                            value={g.pct}
                            sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: 'action.hover',
                                '& .MuiLinearProgress-bar': { bgcolor: g.color, borderRadius: 4 },
                            }}
                        />
                    </Box>
                ))}
            </Stack>
        </Card>
    );
}

// ─── Returns Waterfall ───────────────────────────────────────
function ReturnsWaterfallCard({ holdings }) {
    if (!holdings.length) return null;

    // Sort by absolute P&L contribution
    const sorted = [...holdings]
        .filter((h) => h.pnl !== 0)
        .sort((a, b) => b.pnl - a.pnl);

    const top = sorted.slice(0, 8);

    return (
        <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                📈 P&L Contribution
            </Typography>
            {top.length > 0 ? (
                <BarChart
                    layout="horizontal"
                    yAxis={[{
                        scaleType: 'band',
                        data: top.map((h) => h.symbolName?.slice(0, 20) || h.symbol),
                    }]}
                    series={[{
                        data: top.map((h) => h.pnl),
                        color: 'hsl(210, 98%, 48%)',
                    }]}
                    width={420}
                    height={280}
                    margin={{ left: 120 }}
                    slotProps={{ legend: { hidden: true } }}
                />
            ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Add transactions to see P&L waterfall
                </Typography>
            )}
        </Card>
    );
}

// ─── Holdings Risk Card ──────────────────────────────────────
function RiskCard({ holdings }) {
    const totalValue = holdings.reduce((s, h) => s + (h.currentValue || 0), 0);
    if (totalValue === 0) return null;

    // Concentration risk — top holding %
    const sorted = [...holdings].sort((a, b) => (b.currentValue || 0) - (a.currentValue || 0));
    const topHolding = sorted[0];
    const topPct = topHolding ? ((topHolding.currentValue || 0) / totalValue) * 100 : 0;
    const top3Pct = sorted.slice(0, 3).reduce((s, h) => s + ((h.currentValue || 0) / totalValue) * 100, 0);

    // Diversification score (simplified)
    const uniqueTypes = new Set(holdings.map((h) => h.assetType)).size;
    const diverseScore = Math.min(100, uniqueTypes * 20);

    return (
        <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                🛡️ Portfolio Risk
            </Typography>
            <Stack spacing={2}>
                <Box>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">Top Holding Concentration</Typography>
                        <Chip size="small" label={`${topPct.toFixed(1)}%`}
                            color={topPct > 40 ? 'error' : topPct > 25 ? 'warning' : 'success'} />
                    </Stack>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {topHolding?.symbolName || '—'}
                    </Typography>
                </Box>
                <Box>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">Top 3 Concentration</Typography>
                        <Chip size="small" label={`${top3Pct.toFixed(1)}%`}
                            color={top3Pct > 70 ? 'error' : top3Pct > 50 ? 'warning' : 'success'} />
                    </Stack>
                </Box>
                <Box>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">Diversification Score</Typography>
                        <Chip size="small" label={`${diverseScore}/100`}
                            color={diverseScore >= 60 ? 'success' : diverseScore >= 40 ? 'warning' : 'error'} />
                    </Stack>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {uniqueTypes} asset class{uniqueTypes !== 1 ? 'es' : ''}
                    </Typography>
                </Box>
                <Box>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">Total Holdings</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{holdings.length}</Typography>
                    </Stack>
                </Box>
            </Stack>
        </Card>
    );
}

// ─── XIRR Ranking Card ──────────────────────────────────────
function XIRRRankingCard({ holdings }) {
    const sorted = [...holdings].filter((h) => h.xirr !== 0).sort((a, b) => b.xirr - a.xirr);
    if (!sorted.length) return null;

    return (
        <Card variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                🏆 XIRR Rankings
            </Typography>
            <Stack spacing={1}>
                {sorted.slice(0, 10).map((h, i) => (
                    <Stack key={`${h.assetType}:${h.symbol}`} direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2" sx={{
                            fontWeight: 700,
                            width: 24,
                            color: i < 3 ? 'primary.main' : 'text.secondary',
                        }}>
                            #{i + 1}
                        </Typography>
                        <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }} noWrap>
                            {h.symbolName || h.symbol}
                        </Typography>
                        <Chip
                            size="small"
                            label={ASSET_TYPE_LABELS[h.assetType] || h.assetType}
                            variant="outlined"
                            sx={{ fontSize: '0.65rem' }}
                        />
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 700,
                                color: h.xirr >= 0 ? 'success.main' : 'error.main',
                                minWidth: 60,
                                textAlign: 'right',
                            }}
                        >
                            {fmtPct(h.xirr * 100)}
                        </Typography>
                    </Stack>
                ))}
            </Stack>
        </Card>
    );
}

// ─── Main Component ──────────────────────────────────────────
export default function Analytics() {
    const { user } = useAuth();
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [holdings, setHoldings] = React.useState([]);
    const [manualAssets, setManualAssets] = React.useState([]);
    const [allocation, setAllocation] = React.useState([]);

    React.useEffect(() => {
        if (!user) { setLoading(false); return; }

        (async () => {
            try {
                const [txs, manuals] = await Promise.all([
                    getTransactions(user.uid),
                    getManualAssets(user.uid),
                ]);
                setManualAssets(manuals);

                const agg = aggregateHoldings(txs);

                // Enrich with prices
                const enriched = await Promise.all(
                    agg.map(async (h) => {
                        try {
                            const currentPrice = await getLatestPrice(h.assetType, h.symbol);
                            const currentValue = h.totalUnits * currentPrice;
                            const pnl = currentValue - h.totalInvested;
                            const pnlPct = h.totalInvested > 0 ? (pnl / h.totalInvested) * 100 : 0;
                            const cashflows = buildXIRRCashflows(h.transactions, currentValue);
                            const xirr = calculateXIRR(cashflows);
                            return { ...h, currentPrice, currentValue, pnl, pnlPct, xirr };
                        } catch {
                            return { ...h, currentPrice: 0, currentValue: 0, pnl: -h.totalInvested, pnlPct: -100, xirr: 0 };
                        }
                    })
                );

                setHoldings(enriched);

                const allHoldings = [
                    ...enriched.map((h) => ({ assetType: h.assetType, currentValue: h.currentValue })),
                    ...manuals.map((m) => ({ assetType: m.assetType, currentValue: m.currentValue || 0 })),
                ];
                setAllocation(computeAllocation(allHoldings));

            } catch (err) {
                setError(err.message || 'Failed to load analytics');
            } finally {
                setLoading(false);
            }
        })();
    }, [user]);

    if (!user) {
        return (
            <Box sx={{ px: 3, py: 6, textAlign: 'center' }}>
                <AnalyticsRoundedIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Sign in to see analytics</Typography>
            </Box>
        );
    }

    const isEmpty = holdings.length === 0 && manualAssets.length === 0;

    return (
        <Box sx={{ px: { xs: 2, md: 3 }, py: 3, maxWidth: 1200, mx: 'auto' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                <AnalyticsRoundedIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    Analytics
                </Typography>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : isEmpty ? (
                <Card variant="outlined" sx={{ p: 6, textAlign: 'center' }}>
                    <AccountBalanceWalletRoundedIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>No data yet</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Add transactions in your Portfolio to see deep analytics here.
                    </Typography>
                </Card>
            ) : (
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 5 }}>
                        <AssetBreakdownCard allocation={allocation} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 7 }}>
                        <ReturnsWaterfallCard holdings={holdings} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <GeographicCard holdings={holdings} manualAssets={manualAssets} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <RiskCard holdings={holdings} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <XIRRRankingCard holdings={holdings} />
                    </Grid>
                </Grid>
            )}
        </Box>
    );
}
