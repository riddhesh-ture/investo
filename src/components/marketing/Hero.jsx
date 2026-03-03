import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import CurrencyBitcoinRoundedIcon from '@mui/icons-material/CurrencyBitcoinRounded';
import PieChartRoundedIcon from '@mui/icons-material/PieChartRounded';

const GlowChip = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 16px',
  borderRadius: 20,
  fontSize: '0.85rem',
  fontWeight: 600,
  color: theme.palette.primary.main,
  backgroundColor: theme.vars
    ? `rgba(${theme.vars.palette.primary.mainChannel} / 0.08)`
    : `${theme.palette.primary.main}14`,
  border: '1px solid',
  borderColor: theme.vars
    ? `rgba(${theme.vars.palette.primary.mainChannel} / 0.2)`
    : `${theme.palette.primary.main}33`,
}));

const AssetIcon = styled(Box)(({ theme }) => ({
  width: 56,
  height: 56,
  borderRadius: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.vars
    ? `rgba(${theme.vars.palette.primary.mainChannel} / 0.06)`
    : `${theme.palette.primary.main}0F`,
  border: '1px solid',
  borderColor: theme.palette.divider,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px ${theme.vars
      ? `rgba(${theme.vars.palette.primary.mainChannel} / 0.15)`
      : `${theme.palette.primary.main}26`
      }`,
  },
}));

const assetClasses = [
  { icon: <ShowChartRoundedIcon />, label: 'Stocks', color: 'hsl(210, 98%, 48%)' },
  { icon: <AccountBalanceRoundedIcon />, label: 'Mutual Funds', color: 'hsl(130, 60%, 45%)' },
  { icon: <CurrencyBitcoinRoundedIcon />, label: 'Crypto', color: 'hsl(40, 95%, 55%)' },
  { icon: <PieChartRoundedIcon />, label: 'Gold & More', color: 'hsl(15, 85%, 55%)' },
];

export default function Hero() {
  return (
    <Box
      id="hero"
      sx={(theme) => ({
        width: '100%',
        backgroundRepeat: 'no-repeat',
        backgroundImage:
          'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 90%), transparent)',
        ...theme.applyStyles('dark', {
          backgroundImage:
            'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)',
        }),
      })}
    >
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: { xs: 14, sm: 20 },
          pb: { xs: 8, sm: 12 },
        }}
      >
        <Stack
          spacing={3}
          useFlexGap
          sx={{ alignItems: 'center', width: { xs: '100%', sm: '80%', md: '65%' } }}
        >
          <GlowChip>✦ Your wealth, one dashboard</GlowChip>

          <Typography
            variant="h1"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontSize: 'clamp(2.5rem, 8vw, 3.5rem)',
              fontWeight: 800,
              textAlign: 'center',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}
          >
            Track every asset.
            <Typography
              component="span"
              variant="h1"
              sx={(theme) => ({
                fontSize: 'inherit',
                fontWeight: 'inherit',
                letterSpacing: 'inherit',
                background: 'linear-gradient(135deg, hsl(210, 98%, 48%) 0%, hsl(130, 60%, 45%) 50%, hsl(40, 95%, 55%) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                ...theme.applyStyles('dark', {
                  background: 'linear-gradient(135deg, hsl(210, 100%, 65%) 0%, hsl(130, 70%, 55%) 50%, hsl(40, 100%, 65%) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }),
              })}
            >
              Analyse deeper.
            </Typography>
          </Typography>

          <Typography
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              fontSize: { xs: '1rem', sm: '1.15rem' },
              maxWidth: 540,
              lineHeight: 1.7,
            }}
          >
            Stocks, mutual funds, crypto, gold, real estate — all in one place.
            Deep analytics with XIRR, sector breakdowns, and portfolio intelligence.
            Built for investors who think long-term.
          </Typography>

          {/* Asset class icons */}
          <Stack
            direction="row"
            spacing={2}
            sx={{ justifyContent: 'center', mt: 1 }}
          >
            {assetClasses.map(({ icon, label, color }) => (
              <Stack key={label} alignItems="center" spacing={0.5}>
                <AssetIcon sx={{ '& svg': { color, fontSize: 28 } }}>
                  {icon}
                </AssetIcon>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  {label}
                </Typography>
              </Stack>
            ))}
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            useFlexGap
            sx={{ pt: 2, width: { xs: '100%', sm: 'auto' } }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={Link}
              to="/signup"
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              Get Started — It's Free
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              component={Link}
              to="/home"
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              Explore Dashboard
            </Button>
          </Stack>

          <Typography
            variant="caption"
            sx={{ color: 'text.disabled', textAlign: 'center', mt: 1 }}
          >
            No credit card required · Free forever for personal use
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
