import { useLocation, useNavigate } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';

const mainListItems = [
  { text: 'Dashboard', icon: <DashboardRoundedIcon />, path: '/home' },
  { text: 'Screener', icon: <SearchRoundedIcon />, path: '/home/screener' },
  { text: 'Compare', icon: <CompareArrowsRoundedIcon />, path: '/home/compare' },
  { text: 'Portfolio', icon: <AccountBalanceWalletRoundedIcon />, path: '/home/portfolio' },
  { text: 'Market', icon: <ShowChartRoundedIcon />, path: '/home/market' },
  { text: 'Analytics', icon: <AnalyticsRoundedIcon />, path: '/home/analytics' },
];

const secondaryListItems = [
  { text: 'About', icon: <InfoRoundedIcon />, path: '#' },
  { text: 'Feedback', icon: <HelpRoundedIcon />, path: '#' },
];

export default function MenuContent() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => {
          const isSelected =
            item.path === '/home'
              ? location.pathname === '/home'
              : location.pathname.startsWith(item.path);
          return (
            <ListItem key={index} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton onClick={() => item.path !== '#' && navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
