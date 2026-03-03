import { useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Breadcrumbs, { breadcrumbsClasses } from '@mui/material/Breadcrumbs';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  [`& .${breadcrumbsClasses.separator}`]: {
    color: (theme.vars || theme).palette.action.disabled,
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: 'center',
  },
}));

const routeLabels = {
  '/home': 'Dashboard',
  '/home/screener': 'Screener',
  '/home/compare': 'Compare',
  '/home/portfolio': 'Portfolio',
};

export default function NavbarBreadcrumbs() {
  const location = useLocation();

  // Find the current page name
  let currentPage = 'Dashboard';
  for (const [path, label] of Object.entries(routeLabels)) {
    if (location.pathname.startsWith(path) && path !== '/home') {
      currentPage = label;
      break;
    }
  }
  if (location.pathname === '/home') {
    currentPage = 'Dashboard';
  }

  // Check for fund detail page
  if (location.pathname.startsWith('/home/fund/')) {
    currentPage = 'Fund Details';
  }

  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
    >
      <Typography variant="body1">Investo</Typography>
      <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600 }}>
        {currentPage}
      </Typography>
    </StyledBreadcrumbs>
  );
}
