import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import CloudOffRoundedIcon from '@mui/icons-material/CloudOffRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';

const items = [
  {
    icon: <DataObjectRoundedIcon />,
    title: 'Free & open data',
    description:
      'Powered by free APIs — mfapi.in, CoinGecko, Alpha Vantage. No paid subscriptions, no hidden costs.',
  },
  {
    icon: <SecurityRoundedIcon />,
    title: 'Your data stays yours',
    description:
      'Firebase authentication keeps your portfolio private. API keys are stored locally, never on our servers.',
  },
  {
    icon: <SpeedRoundedIcon />,
    title: 'Blazing fast',
    description:
      'Built with Vite + React 19. Sub-second page loads with optimized data fetching and smart caching.',
  },
  {
    icon: <CloudOffRoundedIcon />,
    title: 'No backend required',
    description:
      'Pure client-side architecture. Your browser talks directly to data APIs — zero server maintenance.',
  },
  {
    icon: <DevicesRoundedIcon />,
    title: 'Responsive everywhere',
    description:
      'Material UI ensures a polished experience on desktop, tablet, and mobile with automatic dark mode.',
  },
  {
    icon: <CodeRoundedIcon />,
    title: 'Built for extensibility',
    description:
      'Modular architecture makes it easy to add new asset classes, data sources, or analytics modules.',
  },
];

export default function Highlights() {
  return (
    <Box
      id="highlights"
      sx={(theme) => ({
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        color: 'white',
        bgcolor: 'grey.900',
        ...theme.applyStyles('dark', {
          bgcolor: 'grey.950',
        }),
      })}
    >
      <Container
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 3, sm: 6 },
        }}
      >
        <Box
          sx={{
            width: { sm: '100%', md: '60%' },
            textAlign: { sm: 'left', md: 'center' },
          }}
        >
          <Typography component="h2" variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Why Investo?
          </Typography>
          <Typography variant="body1" sx={{ color: 'grey.400' }}>
            Built by investors, for investors. No bloat, no lock-in — just the tools you need
            to understand and grow your wealth across every asset class.
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {items.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Stack
                direction="column"
                component={Card}
                spacing={1}
                useFlexGap
                sx={{
                  color: 'inherit',
                  p: 3,
                  height: '100%',
                  borderColor: 'hsla(220, 25%, 25%, 0.3)',
                  backgroundColor: 'grey.800',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'grey.700',
                  },
                }}
              >
                <Box sx={{ opacity: '60%' }}>{item.icon}</Box>
                <div>
                  <Typography gutterBottom sx={{ fontWeight: 'medium' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.400' }}>
                    {item.description}
                  </Typography>
                </div>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
