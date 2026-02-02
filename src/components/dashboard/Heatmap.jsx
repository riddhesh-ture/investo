// TradingViewWidget.jsx
import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget() {
  const container = useRef();

  useEffect(
    () => {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = `
        {
          "dataSource": "SENSEX",
          "blockSize": "market_cap_basic",
          "blockColor": "change",
          "grouping": "sector",
          "locale": "en",
          "symbolUrl": "",
          "colorTheme": "dark",
          "exchanges": [],
          "hasTopBar": false,
          "isDataSetEnabled": false,
          "isZoomEnabled": true,
          "hasSymbolTooltip": true,
          "isMonoSize": false,
          "width": "100%",
          "height": "100%"
        }`;
      
      const currentContainer = container.current;
      currentContainer.appendChild(script);

      return () => {
        if (currentContainer) {
          currentContainer.innerHTML = ''; // Clears the widget on unmount
        }
      };
    },
    []
  );

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright"><a href="https://www.tradingview.com/heatmap/stock/" rel="noopener nofollow" target="_blank"><span className="blue-text">Stock Heatmap</span></a><span className="trademark"> by TradingView</span></div>
    </div>
  );
}

export default memo(TradingViewWidget);

