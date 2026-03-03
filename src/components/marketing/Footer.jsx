import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/X';
import SitemarkIcon from './SitemarkIcon';

export default function Footer() {
  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: { xs: 4, sm: 8 },
        py: { xs: 8, sm: 10 },
        textAlign: { sm: 'center', md: 'left' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          width: '100%',
          justifyContent: 'space-between',
          gap: 4,
        }}
      >
        <Box sx={{ maxWidth: 340 }}>
          <SitemarkIcon />
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
            Multi-asset wealth analytics for the modern investor.
            Track, analyse, and grow your portfolio across every asset class.
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            Product
          </Typography>
          <Link color="text.secondary" variant="body2" href="#features">
            Features
          </Link>
          <Link color="text.secondary" variant="body2" href="#highlights">
            Why Investo?
          </Link>
          <Link color="text.secondary" variant="body2" href="#faq">
            FAQ
          </Link>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            Data Sources
          </Typography>
          <Link color="text.secondary" variant="body2" href="https://www.mfapi.in" target="_blank">
            mfapi.in
          </Link>
          <Link color="text.secondary" variant="body2" href="https://www.coingecko.com" target="_blank">
            CoinGecko
          </Link>
          <Link color="text.secondary" variant="body2" href="https://www.alphavantage.co" target="_blank">
            Alpha Vantage
          </Link>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pt: { xs: 4, sm: 8 },
          width: '100%',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          © {new Date().getFullYear()} Investo · Built with ❤️ for investors
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ color: 'text.secondary' }}
        >
          <IconButton
            color="inherit"
            size="small"
            href="https://github.com"
            aria-label="GitHub"
          >
            <GitHubIcon />
          </IconButton>
          <IconButton
            color="inherit"
            size="small"
            href="https://x.com"
            aria-label="X"
          >
            <TwitterIcon />
          </IconButton>
        </Stack>
      </Box>
    </Container>
  );
}
