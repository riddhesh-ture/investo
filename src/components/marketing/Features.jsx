import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import PieChartRoundedIcon from '@mui/icons-material/PieChartRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';

const features = [
  {
    icon: <AccountBalanceWalletRoundedIcon />,
    title: 'Multi-Asset Portfolio',
    description:
      'Track mutual funds, Indian & US stocks, crypto, gold, debt, and real estate — all in one unified dashboard with live NAV data.',
  },
  {
    icon: <TrendingUpRoundedIcon />,
    title: 'XIRR & Deep Returns',
    description:
      'Go beyond simple returns. Calculate true annualized XIRR across irregular cashflows, SIPs, and multiple transactions per holding.',
  },
  {
    icon: <PieChartRoundedIcon />,
    title: 'Asset Allocation Analysis',
    description:
      'Visualize your portfolio breakdown by asset class, market cap, sector, and geography with interactive charts.',
  },
  {
    icon: <CompareArrowsRoundedIcon />,
    title: 'Fund Comparison',
    description:
      'Compare any two mutual funds side-by-side with normalized percentage charts, returns tables, and risk metrics.',
  },
  {
    icon: <AnalyticsRoundedIcon />,
    title: 'Risk Metrics',
    description:
      'Volatility, Sharpe ratio, max drawdown, and 52-week high/low — institutional-grade risk analysis for every asset.',
  },
  {
    icon: <ShowChartRoundedIcon />,
    title: 'Market Overview',
    description:
      'Stay informed with market indices, sector heatmaps, crypto rankings, and gold prices — curated research at a glance.',
  },
];

export default function Features() {
  return (
    <Container id="features" sx={{ py: { xs: 8, sm: 16 } }}>
      <Box sx={{ width: { sm: '100%', md: '60%' }, mb: { xs: 4, sm: 6 } }}>
        <Typography
          component="h2"
          variant="h4"
          gutterBottom
          sx={{ color: 'text.primary', fontWeight: 700 }}
        >
          Everything you need for smart investing
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: 'text.secondary' }}
        >
          From portfolio tracking to deep analytics — built for investors who want clarity,
          not complexity. All powered by free real-time data APIs.
        </Typography>
      </Box>
      <Grid container spacing={3}>
        {features.map((item, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              variant="outlined"
              sx={{
                p: 3,
                height: '100%',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <Stack spacing={1.5}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                  }}
                >
                  {item.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  {item.description}
                </Typography>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
