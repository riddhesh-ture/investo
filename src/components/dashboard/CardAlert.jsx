import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import { useNavigate } from 'react-router-dom';

export default function CardAlert() {
  const navigate = useNavigate();

  return (
    <Card variant="outlined" sx={{ m: 1.5, flexShrink: 0 }}>
      <CardContent>
        <TrendingUpRoundedIcon fontSize="small" />
        <Typography gutterBottom sx={{ fontWeight: 600 }}>
          Compare Funds
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Compare two mutual funds side-by-side to make better investment decisions.
        </Typography>
        <Button
          variant="contained"
          size="small"
          fullWidth
          onClick={() => navigate('/home/compare')}
        >
          Go to Compare
        </Button>
      </CardContent>
    </Card>
  );
}
