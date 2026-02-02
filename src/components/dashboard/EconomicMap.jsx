import React, { useEffect, memo } from 'react';
import Box from '@mui/material/Box';

function EconomicMap() {
  useEffect(() => {
    // Check if script already exists to prevent multiple injections
    if (!document.getElementById('tradingview-economic-map-script')) {
      const script = document.createElement("script");
      script.id = 'tradingview-economic-map-script';
      script.src = "https://widgets.tradingview-widget.com/w/en/tv-economic-map.js";
      script.type = "module";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <Box
      sx={{
        width: '100%',
        height: '500px', // THIS IS REQUIRED: The widget needs an explicit parent height
        bgcolor: 'background.paper',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden'
      }}
    >
      <tv-economic-map 
        metric="intr" 
        style={{ width: '100%', height: '100%' }}
      ></tv-economic-map>
    </Box>
  );
}

export default memo(EconomicMap);