import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import MuiLink from '@mui/material/Link';

const API_KEYS = [
    {
        id: 'investo_alphavantage_key',
        label: 'Alpha Vantage API Key',
        description: 'Required for US stock data. Free tier: 25 calls/day.',
        signupUrl: 'https://www.alphavantage.co/support/#api-key',
        testEndpoint: 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min&apikey=',
        provider: 'Alpha Vantage',
    },
    {
        id: 'investo_coingecko_key',
        label: 'CoinGecko API Key',
        description: 'For crypto data. Free Demo tier: 30 calls/min, 10K/month.',
        signupUrl: 'https://www.coingecko.com/en/api/pricing',
        testEndpoint: 'https://api.coingecko.com/api/v3/ping',
        provider: 'CoinGecko',
    },
    {
        id: 'investo_metal_key',
        label: 'Metals API Key',
        description: 'For gold/silver prices. Optional — uses PAXG proxy if not set.',
        signupUrl: 'https://metals-api.com/',
        testEndpoint: null,
        provider: 'Metals-API',
    },
];

function ApiKeyCard({ config }) {
    const [value, setValue] = React.useState('');
    const [showKey, setShowKey] = React.useState(false);
    const [saved, setSaved] = React.useState(false);
    const [testing, setTesting] = React.useState(false);
    const [testResult, setTestResult] = React.useState(null);

    React.useEffect(() => {
        const stored = localStorage.getItem(config.id) || '';
        setValue(stored);
    }, [config.id]);

    const handleSave = () => {
        if (value.trim()) {
            localStorage.setItem(config.id, value.trim());
        } else {
            localStorage.removeItem(config.id);
        }
        setSaved(true);
        setTestResult(null);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleClear = () => {
        localStorage.removeItem(config.id);
        setValue('');
        setTestResult(null);
    };

    const handleTest = async () => {
        if (!config.testEndpoint || !value.trim()) return;
        setTesting(true);
        setTestResult(null);
        try {
            let url = config.testEndpoint;
            if (config.id === 'investo_alphavantage_key') {
                url += value.trim();
            }
            const headers = {};
            if (config.id === 'investo_coingecko_key') {
                headers['x-cg-demo-api-key'] = value.trim();
            }
            const res = await fetch(url, { headers });
            if (res.ok) {
                const data = await res.json();
                if (data['Note'] || data['Information']) {
                    setTestResult({ ok: false, msg: 'Rate limited — key works but try again later' });
                } else {
                    setTestResult({ ok: true, msg: 'Connection successful!' });
                }
            } else {
                setTestResult({ ok: false, msg: `HTTP ${res.status} — check your API key` });
            }
        } catch (err) {
            setTestResult({ ok: false, msg: 'Connection failed — check your key' });
        } finally {
            setTesting(false);
        }
    };

    const isConfigured = !!localStorage.getItem(config.id);

    return (
        <Card variant="outlined" sx={{ transition: 'all 0.2s', '&:hover': { boxShadow: 2 } }}>
            <CardContent>
                <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                {config.label}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {config.description}
                            </Typography>
                        </Box>
                        <Chip
                            size="small"
                            label={isConfigured ? 'Configured' : 'Not set'}
                            color={isConfigured ? 'success' : 'default'}
                            variant={isConfigured ? 'filled' : 'outlined'}
                            icon={isConfigured ? <CheckCircleIcon /> : undefined}
                        />
                    </Stack>

                    <TextField
                        size="small"
                        fullWidth
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={`Enter your ${config.provider} API key`}
                        type={showKey ? 'text' : 'password'}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => setShowKey(!showKey)}
                                        edge="end"
                                    >
                                        {showKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handleSave}
                            disabled={!value.trim()}
                            sx={{ textTransform: 'none' }}
                        >
                            {saved ? '✓ Saved!' : 'Save Key'}
                        </Button>
                        {config.testEndpoint && (
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleTest}
                                disabled={!value.trim() || testing}
                                sx={{ textTransform: 'none' }}
                            >
                                {testing ? 'Testing...' : 'Test Connection'}
                            </Button>
                        )}
                        <Button
                            size="small"
                            color="error"
                            onClick={handleClear}
                            disabled={!value.trim()}
                            sx={{ textTransform: 'none' }}
                        >
                            Clear
                        </Button>
                        <Box sx={{ flexGrow: 1 }} />
                        <MuiLink
                            href={config.signupUrl}
                            target="_blank"
                            rel="noopener"
                            variant="body2"
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                        >
                            Get free key <OpenInNewIcon sx={{ fontSize: 14 }} />
                        </MuiLink>
                    </Stack>

                    {testResult && (
                        <Alert
                            severity={testResult.ok ? 'success' : 'error'}
                            icon={testResult.ok ? <CheckCircleIcon /> : <ErrorIcon />}
                        >
                            {testResult.msg}
                        </Alert>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}

export default function Settings() {
    return (
        <Box sx={{ px: { xs: 2, md: 3 }, py: 3, maxWidth: 800, mx: 'auto' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                <SettingsRoundedIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    Settings
                </Typography>
            </Stack>

            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                Configure API keys for multi-asset data. Keys are stored locally in your browser
                and never sent to our servers.
            </Typography>

            <Stack spacing={2} sx={{ mb: 4 }}>
                {API_KEYS.map((config) => (
                    <ApiKeyCard key={config.id} config={config} />
                ))}
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Data Sources
            </Typography>
            <Card variant="outlined">
                <CardContent>
                    <Stack spacing={1.5}>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>Indian Mutual Funds</Typography>
                            <Chip size="small" label="No key needed" color="success" variant="outlined" />
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>Indian Stocks (NSE/BSE)</Typography>
                            <Chip size="small" label="No key needed" color="success" variant="outlined" />
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>US Stocks</Typography>
                            <Chip size="small" label="Alpha Vantage key" color="info" variant="outlined" />
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>Cryptocurrency</Typography>
                            <Chip size="small" label="CoinGecko key" color="info" variant="outlined" />
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>Gold & Silver</Typography>
                            <Chip size="small" label="Optional" color="default" variant="outlined" />
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>Debt / Real Estate / Cash</Typography>
                            <Chip size="small" label="Manual entry" color="default" variant="outlined" />
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}
