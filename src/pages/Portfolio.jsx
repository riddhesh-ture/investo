import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import PieChartRoundedIcon from '@mui/icons-material/PieChartRounded';
import { PieChart } from '@mui/x-charts/PieChart';
import { useAuth } from '../context/AuthContext';
import {
  addTransaction,
  getTransactions,
  deleteTransaction,
  addManualAsset,
  getManualAssets,
  deleteManualAsset,
  aggregateHoldings,
  buildXIRRCashflows,
} from '../services/transactionService';
import { getLatestPrice, fetchMFSchemes, searchCrypto } from '../services/marketApi';
import {
  calculateXIRR,
  computeAllocation,
  ASSET_TYPE_LABELS,
  ASSET_TYPE_COLORS,
} from '../utils/finMetrics';

const ASSET_TYPES = [
  { value: 'MUTUAL_FUND', label: 'Mutual Fund' },
  { value: 'STOCK_IN', label: 'Indian Stock' },
  { value: 'STOCK_US', label: 'US Stock' },
  { value: 'CRYPTO', label: 'Crypto' },
  { value: 'GOLD', label: 'Gold' },
  { value: 'DEBT', label: 'Debt' },
  { value: 'REAL_ESTATE', label: 'Real Estate' },
  { value: 'CASH', label: 'Cash' },
];

const TX_TYPES = ['BUY', 'SELL', 'SIP_BUY', 'DIVIDEND'];
const TABS = ['ALL', 'MUTUAL_FUND', 'STOCK_IN', 'STOCK_US', 'CRYPTO', 'GOLD', 'OTHER'];
const TAB_LABELS = ['All', 'Mutual Funds', 'Indian Stocks', 'US Stocks', 'Crypto', 'Gold', 'Other'];

function fmt(val) {
  return '₹' + (val || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function fmtPct(val) {
  return (val >= 0 ? '+' : '') + (val || 0).toFixed(2) + '%';
}

// ─── Net Worth Hero ──────────────────────────────────────────
function NetWorthHero({ totalValue, totalInvested, xirr }) {
  const pnl = totalValue - totalInvested;
  const pnlPct = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;
  const isProfit = pnl >= 0;

  return (
    <Card
      sx={(theme) => ({
        p: 3,
        mb: 3,
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.background.paper} 100%)`,
        border: '1px solid',
        borderColor: 'divider',
      })}
    >
      <Grid container spacing={3} alignItems="center">
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1 }}>
            Net Worth
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            {fmt(totalValue)}
          </Typography>
        </Grid>
        <Grid size={{ xs: 6, md: 2.5 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            Invested
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {fmt(totalInvested)}
          </Typography>
        </Grid>
        <Grid size={{ xs: 6, md: 2.5 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            Total P&L
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: isProfit ? 'success.main' : 'error.main' }}
            >
              {fmt(Math.abs(pnl))}
            </Typography>
            <Chip
              size="small"
              label={fmtPct(pnlPct)}
              color={isProfit ? 'success' : 'error'}
              icon={isProfit ? <TrendingUpRoundedIcon /> : <TrendingDownRoundedIcon />}
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            Portfolio XIRR
          </Typography>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: xirr >= 0 ? 'success.main' : 'error.main' }}
          >
            {fmtPct(xirr * 100)}
          </Typography>
        </Grid>
      </Grid>
    </Card>
  );
}

// ─── Allocation Card ─────────────────────────────────────────
function AllocationCard({ allocation }) {
  if (!allocation.length) return null;

  const pieData = allocation.map((a, i) => ({
    id: i,
    value: a.percentage,
    label: ASSET_TYPE_LABELS[a.assetType] || a.assetType,
    color: ASSET_TYPE_COLORS[a.assetType] || 'hsl(0,0%,50%)',
  }));

  return (
    <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <PieChartRoundedIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Asset Allocation
        </Typography>
      </Stack>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <PieChart
          series={[{
            data: pieData,
            innerRadius: 50,
            outerRadius: 90,
            paddingAngle: 2,
            cornerRadius: 4,
          }]}
          width={280}
          height={200}
          slotProps={{ legend: { hidden: true } }}
        />
      </Box>
      <Stack spacing={0.5}>
        {allocation.map((a) => (
          <Stack key={a.assetType} direction="row" alignItems="center" spacing={1}>
            <Box sx={{
              width: 10, height: 10, borderRadius: '50%',
              bgcolor: ASSET_TYPE_COLORS[a.assetType] || 'grey',
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

// ─── Add Transaction Dialog ──────────────────────────────────
function AddTransactionDialog({ open, onClose, onAdd, userId }) {
  const [assetType, setAssetType] = React.useState('MUTUAL_FUND');
  const [txType, setTxType] = React.useState('BUY');
  const [symbol, setSymbol] = React.useState('');
  const [symbolName, setSymbolName] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [units, setUnits] = React.useState('');
  const [txDate, setTxDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  // MF scheme search
  const [mfSchemes, setMfSchemes] = React.useState([]);
  const [mfLoading, setMfLoading] = React.useState(false);
  const [selectedMF, setSelectedMF] = React.useState(null);

  // Crypto search
  const [cryptoResults, setCryptoResults] = React.useState([]);
  const [cryptoQuery, setCryptoQuery] = React.useState('');
  const [selectedCrypto, setSelectedCrypto] = React.useState(null);

  const isManual = ['DEBT', 'REAL_ESTATE', 'CASH'].includes(assetType);

  React.useEffect(() => {
    if (assetType === 'MUTUAL_FUND' && mfSchemes.length === 0) {
      setMfLoading(true);
      fetchMFSchemes()
        .then(setMfSchemes)
        .catch(() => { })
        .finally(() => setMfLoading(false));
    }
  }, [assetType]);

  React.useEffect(() => {
    if (assetType === 'CRYPTO' && cryptoQuery.length >= 2) {
      const timer = setTimeout(() => {
        searchCrypto(cryptoQuery).then(setCryptoResults).catch(() => { });
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [cryptoQuery, assetType]);

  const handleSubmit = async () => {
    setError('');
    setSaving(true);
    try {
      if (isManual) {
        // Manual asset entry
        await addManualAsset(userId, {
          assetType,
          assetName: symbolName || assetType,
          currentValue: parseFloat(amount),
          investedValue: parseFloat(units) || null,
          notes,
        });
      } else {
        // Transaction entry
        const sym = assetType === 'MUTUAL_FUND' ? selectedMF?.schemeCode
          : assetType === 'CRYPTO' ? selectedCrypto?.id
            : symbol;
        const name = assetType === 'MUTUAL_FUND' ? selectedMF?.schemeName
          : assetType === 'CRYPTO' ? selectedCrypto?.name
            : symbolName || symbol;

        if (!sym) { setError('Please select or enter a symbol'); setSaving(false); return; }
        if (!amount) { setError('Please enter an amount'); setSaving(false); return; }

        await addTransaction(userId, {
          assetType,
          symbol: String(sym),
          symbolName: name,
          transactionDate: txDate,
          amount: parseFloat(amount),
          units: units ? parseFloat(units) : null,
          transactionType: txType,
          notes,
        });
      }
      onAdd();
      resetForm();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSymbol(''); setSymbolName(''); setAmount(''); setUnits(''); setNotes('');
    setSelectedMF(null); setSelectedCrypto(null); setCryptoQuery('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isManual ? 'Add Manual Asset' : 'Add Transaction'}
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

        <FormControl size="small" fullWidth>
          <InputLabel>Asset Type</InputLabel>
          <Select value={assetType} label="Asset Type" onChange={(e) => { setAssetType(e.target.value); resetForm(); }}>
            {ASSET_TYPES.map((at) => (
              <MenuItem key={at.value} value={at.value}>{at.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {!isManual && (
          <FormControl size="small" fullWidth>
            <InputLabel>Transaction Type</InputLabel>
            <Select value={txType} label="Transaction Type" onChange={(e) => setTxType(e.target.value)}>
              {TX_TYPES.map((t) => <MenuItem key={t} value={t}>{t.replace('_', ' ')}</MenuItem>)}
            </Select>
          </FormControl>
        )}

        {/* Symbol input - varies by type */}
        {assetType === 'MUTUAL_FUND' && (
          <Autocomplete
            options={mfSchemes}
            getOptionLabel={(opt) => `${opt.schemeCode} — ${opt.schemeName}`}
            value={selectedMF}
            onChange={(_, val) => setSelectedMF(val)}
            loading={mfLoading}
            renderInput={(params) => <TextField {...params} label="Search Fund" size="small" />}
            filterOptions={(options, { inputValue }) => {
              const q = inputValue.toLowerCase();
              return options.filter((o) =>
                o.schemeName.toLowerCase().includes(q) || String(o.schemeCode).includes(q)
              ).slice(0, 50);
            }}
          />
        )}

        {assetType === 'CRYPTO' && (
          <Autocomplete
            options={cryptoResults}
            getOptionLabel={(opt) => `${opt.name} (${opt.symbol?.toUpperCase()})`}
            value={selectedCrypto}
            onChange={(_, val) => setSelectedCrypto(val)}
            inputValue={cryptoQuery}
            onInputChange={(_, val) => setCryptoQuery(val)}
            renderInput={(params) => <TextField {...params} label="Search Crypto" size="small" />}
            noOptionsText={cryptoQuery.length < 2 ? 'Type to search...' : 'No results'}
          />
        )}

        {(assetType === 'STOCK_IN' || assetType === 'STOCK_US') && (
          <>
            <TextField
              label={assetType === 'STOCK_IN' ? 'Symbol (e.g. RELIANCE.NS)' : 'Ticker (e.g. AAPL)'}
              size="small" fullWidth value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            />
            <TextField label="Company Name" size="small" fullWidth value={symbolName}
              onChange={(e) => setSymbolName(e.target.value)}
            />
          </>
        )}

        {assetType === 'GOLD' && (
          <TextField label="Description (e.g. 24K Gold, SGB)" size="small" fullWidth
            value={symbolName} onChange={(e) => setSymbolName(e.target.value)}
          />
        )}

        {isManual && (
          <TextField label="Asset Name" size="small" fullWidth value={symbolName}
            onChange={(e) => setSymbolName(e.target.value)}
          />
        )}

        {!isManual && (
          <TextField label="Date" type="date" size="small" fullWidth
            value={txDate} onChange={(e) => setTxDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        )}

        <Stack direction="row" spacing={2}>
          <TextField
            label={isManual ? 'Current Value (₹)' : 'Amount (₹)'}
            type="number" size="small" fullWidth value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <TextField
            label={isManual ? 'Invested Value (₹)' : (assetType === 'GOLD' ? 'Grams' : 'Units')}
            type="number" size="small" fullWidth value={units}
            onChange={(e) => setUnits(e.target.value)}
          />
        </Stack>

        <TextField label="Notes (optional)" size="small" fullWidth value={notes}
          onChange={(e) => setNotes(e.target.value)} multiline rows={2}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {saving ? <CircularProgress size={20} /> : (isManual ? 'Add Asset' : 'Add Transaction')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function Portfolio() {
  const { user } = useAuth();
  const [transactions, setTransactions] = React.useState([]);
  const [manualAssets, setManualAssets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [enriching, setEnriching] = React.useState(false);
  const [error, setError] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [tabIndex, setTabIndex] = React.useState(0);

  // Enriched data
  const [holdings, setHoldings] = React.useState([]);
  const [totalValue, setTotalValue] = React.useState(0);
  const [totalInvested, setTotalInvested] = React.useState(0);
  const [portfolioXIRR, setPortfolioXIRR] = React.useState(0);
  const [allocation, setAllocation] = React.useState([]);

  const loadData = React.useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const [txs, manuals] = await Promise.all([
        getTransactions(user.uid),
        getManualAssets(user.uid),
      ]);
      setTransactions(txs);
      setManualAssets(manuals);

      // Aggregate holdings from transactions
      const agg = aggregateHoldings(txs);

      // Enrich with current prices
      setEnriching(true);
      const enriched = await Promise.all(
        agg.map(async (h) => {
          try {
            const currentPrice = await getLatestPrice(h.assetType, h.symbol);
            const currentValue = h.totalUnits * currentPrice;
            const pnl = currentValue - h.totalInvested;
            const pnlPct = h.totalInvested > 0 ? (pnl / h.totalInvested) * 100 : 0;

            // XIRR per holding
            const cashflows = buildXIRRCashflows(h.transactions, currentValue);
            const xirr = calculateXIRR(cashflows);

            return {
              ...h,
              currentPrice,
              currentValue,
              pnl,
              pnlPct,
              xirr,
            };
          } catch {
            return {
              ...h,
              currentPrice: 0,
              currentValue: 0,
              pnl: 0 - h.totalInvested,
              pnlPct: -100,
              xirr: 0,
            };
          }
        })
      );
      setHoldings(enriched);
      setEnriching(false);

      // Calculate totals including manual assets
      const txTotalValue = enriched.reduce((s, h) => s + h.currentValue, 0);
      const txTotalInvested = enriched.reduce((s, h) => s + h.totalInvested, 0);
      const manualValue = manuals.reduce((s, m) => s + (m.currentValue || 0), 0);
      const manualInvested = manuals.reduce((s, m) => s + (m.investedValue || 0), 0);

      setTotalValue(txTotalValue + manualValue);
      setTotalInvested(txTotalInvested + manualInvested);

      // Portfolio XIRR (across all holdings)
      const allCashflows = enriched.flatMap((h) => buildXIRRCashflows(h.transactions, h.currentValue));
      if (allCashflows.length >= 2) {
        setPortfolioXIRR(calculateXIRR(allCashflows));
      }

      // Allocation
      const allHoldings = [
        ...enriched.map((h) => ({ assetType: h.assetType, currentValue: h.currentValue })),
        ...manuals.map((m) => ({ assetType: m.assetType, currentValue: m.currentValue || 0 })),
      ];
      setAllocation(computeAllocation(allHoldings));

    } catch (err) {
      setError('Failed to load portfolio. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteTx = async (id) => {
    try {
      await deleteTransaction(id);
      loadData();
    } catch (err) {
      setError('Failed to delete: ' + err.message);
    }
  };

  const handleDeleteManual = async (id) => {
    try {
      await deleteManualAsset(id);
      loadData();
    } catch (err) {
      setError('Failed to delete: ' + err.message);
    }
  };

  // Filter holdings by tab
  const selectedTab = TABS[tabIndex];
  const otherTypes = new Set(['DEBT', 'REAL_ESTATE', 'CASH']);
  const filteredHoldings = selectedTab === 'ALL'
    ? holdings
    : selectedTab === 'OTHER'
      ? holdings.filter((h) => otherTypes.has(h.assetType))
      : holdings.filter((h) => h.assetType === selectedTab);

  const filteredManuals = selectedTab === 'ALL'
    ? manualAssets
    : selectedTab === 'OTHER'
      ? manualAssets
      : manualAssets.filter((m) => m.assetType === selectedTab);

  const isEmpty = holdings.length === 0 && manualAssets.length === 0;

  if (!user) {
    return (
      <Box sx={{ px: 3, py: 6, textAlign: 'center' }}>
        <AccountBalanceWalletRoundedIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>Sign in to track your portfolio</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Create an account to start tracking your investments across all asset classes.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: 3, maxWidth: 1200, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <AccountBalanceWalletRoundedIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Portfolio
          </Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Add Transaction
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : isEmpty ? (
        <Card variant="outlined" sx={{ p: 6, textAlign: 'center' }}>
          <AccountBalanceWalletRoundedIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
            Your portfolio is empty
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            Add your first investment — mutual funds, stocks, crypto, gold, or manual assets.
          </Typography>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogOpen(true)} size="large">
            Add Your First Transaction
          </Button>
        </Card>
      ) : (
        <>
          {enriching && <LinearProgress sx={{ mb: 1, borderRadius: 1 }} />}

          <NetWorthHero
            totalValue={totalValue}
            totalInvested={totalInvested}
            xirr={portfolioXIRR}
          />

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <AllocationCard allocation={allocation} />
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Quick Stats
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Holdings</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{holdings.length + manualAssets.length}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Transactions</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{transactions.length}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Asset Classes</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{allocation.length}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Best Performer</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {holdings.sort((a, b) => b.pnlPct - a.pnlPct)[0]?.symbolName || '—'}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 2 }} />

          {/* Holdings tabs */}
          <Tabs
            value={tabIndex}
            onChange={(_, v) => setTabIndex(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 2 }}
          >
            {TAB_LABELS.map((label) => (
              <Tab key={label} label={label} sx={{ textTransform: 'none', fontWeight: 600 }} />
            ))}
          </Tabs>

          {/* Holdings table */}
          {filteredHoldings.length > 0 && (
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Units</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Invested</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Current</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>P&L</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>XIRR</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>⋮</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHoldings.map((h) => {
                    const isProfit = h.pnl >= 0;
                    return (
                      <TableRow key={`${h.assetType}:${h.symbol}`} hover>
                        <TableCell>
                          <Stack>
                            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                              {h.symbolName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {ASSET_TYPE_LABELS[h.assetType] || h.assetType}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">{h.totalUnits?.toFixed(3)}</TableCell>
                        <TableCell align="right">{fmt(h.totalInvested)}</TableCell>
                        <TableCell align="right">{fmt(h.currentValue)}</TableCell>
                        <TableCell align="right">
                          <Chip
                            size="small"
                            variant="outlined"
                            label={fmtPct(h.pnlPct)}
                            color={isProfit ? 'success' : 'error'}
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: h.xirr >= 0 ? 'success.main' : 'error.main',
                            }}
                          >
                            {fmtPct(h.xirr * 100)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              // Delete all transactions for this holding
                              h.transactions.forEach((tx) => handleDeleteTx(tx.id));
                            }}
                          >
                            <DeleteRoundedIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Manual assets */}
          {filteredManuals.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, mt: 2, color: 'text.secondary' }}>
                Manual Assets
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Invested</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Current</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>⋮</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredManuals.map((m) => (
                      <TableRow key={m.id} hover>
                        <TableCell>{m.assetName}</TableCell>
                        <TableCell>
                          <Chip size="small" variant="outlined"
                            label={ASSET_TYPE_LABELS[m.assetType] || m.assetType} />
                        </TableCell>
                        <TableCell align="right">{fmt(m.investedValue)}</TableCell>
                        <TableCell align="right">{fmt(m.currentValue)}</TableCell>
                        <TableCell align="center">
                          <IconButton size="small" color="error" onClick={() => handleDeleteManual(m.id)}>
                            <DeleteRoundedIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </>
      )}

      <AddTransactionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={loadData}
        userId={user?.uid}
      />
    </Box>
  );
}