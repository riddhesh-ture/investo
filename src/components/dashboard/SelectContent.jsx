import * as React from 'react';
import MuiAvatar from '@mui/material/Avatar';
import MuiListItemAvatar from '@mui/material/ListItemAvatar';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Select, { selectClasses } from '@mui/material/Select';
import { styled } from '@mui/material/styles';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';

const Avatar = styled(MuiAvatar)(({ theme }) => ({
  width: 28,
  height: 28,
  backgroundColor: (theme.vars || theme).palette.background.paper,
  color: (theme.vars || theme).palette.text.secondary,
  border: `1px solid ${(theme.vars || theme).palette.divider}`,
}));

const ListItemAvatar = styled(MuiListItemAvatar)({
  minWidth: 0,
  marginRight: 12,
});

export default function SelectContent() {
  return (
    <Select
      labelId="app-select"
      id="app-simple-select"
      value="investo"
      displayEmpty
      inputProps={{ 'aria-label': 'Investo' }}
      fullWidth
      sx={{
        maxHeight: 56,
        width: 215,
        '&.MuiList-root': {
          p: '8px',
        },
        [`& .${selectClasses.select}`]: {
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          pl: 1,
        },
      }}
    >
      <MenuItem value="investo">
        <ListItemAvatar>
          <Avatar alt="Investo">
            <TrendingUpRoundedIcon sx={{ fontSize: '1rem' }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary="Investo"
          secondary="MF Tracker"
        />
      </MenuItem>
    </Select>
  );
}
