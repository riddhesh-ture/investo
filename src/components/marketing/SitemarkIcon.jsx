import Typography from '@mui/material/Typography';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import Stack from '@mui/material/Stack';

export default function SitemarkIcon() {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mr: 2 }}>
      <ShowChartRoundedIcon sx={{ color: 'primary.main', fontSize: 24 }} />
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 800,
          letterSpacing: '-0.02em',
          fontSize: '1.1rem',
          background: 'linear-gradient(135deg, hsl(210, 98%, 48%), hsl(130, 60%, 45%))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Investo
      </Typography>
    </Stack>
  );
}
