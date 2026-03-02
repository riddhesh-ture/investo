import yfinance as yf
import logging
from typing import Dict, Optional
from utils import (
    cache_with_ttl, 
    validate_ticker, 
    validate_range, 
    validate_interval,
    range_to_period,
    format_ohlcv_data
)
from config import CACHE_TTL_CHART_INTRADAY, CACHE_TTL_CHART_DAILY

logger = logging.getLogger(__name__)


@cache_with_ttl(CACHE_TTL_CHART_DAILY)
def get_historical_data(symbol: str, range_str: str = '1mo', interval: str = '1d') -> Dict:
    """
    Get historical price data for a stock.
    
    Args:
        symbol: Stock ticker symbol
        range_str: Time range (1d, 5d, 1mo, 6mo, 1y, 5y)
        interval: Data interval (1m, 5m, 15m, 1h, 1d)
    
    Returns:
        Dictionary with OHLCV data and metadata
    """
    if not validate_ticker(symbol):
        raise ValueError(f"Invalid ticker symbol: {symbol}")
    
    if not validate_range(range_str):
        raise ValueError(f"Invalid range: {range_str}")
    
    if interval and not validate_interval(interval):
        raise ValueError(f"Invalid interval: {interval}")
    
    try:
        # Get period and interval from range
        period, default_interval = range_to_period(range_str)
        
        # Use provided interval or default
        use_interval = interval if interval else default_interval
        
        # Fetch data from yfinance
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period, interval=use_interval)
        
        if hist.empty:
            raise ValueError(f"No data found for symbol: {symbol}")
        
        # Get current info
        info = ticker.info
        
        # Format response
        return {
            "symbol": symbol,
            "range": range_str,
            "interval": use_interval,
            "data": format_ohlcv_data(hist),
            "meta": {
                "currency": info.get('currency', 'USD'),
                "regularMarketPrice": info.get('currentPrice', 0),
                "previousClose": info.get('previousClose', 0),
                "dataPoints": len(hist)
            }
        }
    
    except Exception as e:
        logger.error(f"Error fetching historical data for {symbol}: {str(e)}")
        raise


def get_intraday_data(symbol: str, interval: str = '5m') -> Dict:
    """
    Get intraday data for a stock (1 day with specified interval).
    Uses shorter cache TTL for real-time updates.
    """
    if not validate_ticker(symbol):
        raise ValueError(f"Invalid ticker symbol: {symbol}")
    
    if not validate_interval(interval):
        raise ValueError(f"Invalid interval: {interval}")
    
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period='1d', interval=interval)
        
        if hist.empty:
            raise ValueError(f"No intraday data found for symbol: {symbol}")
        
        info = ticker.info
        
        return {
            "symbol": symbol,
            "range": "1d",
            "interval": interval,
            "data": format_ohlcv_data(hist),
            "meta": {
                "currency": info.get('currency', 'USD'),
                "regularMarketPrice": info.get('currentPrice', 0),
                "previousClose": info.get('previousClose', 0),
                "dataPoints": len(hist)
            }
        }
    
    except Exception as e:
        logger.error(f"Error fetching intraday data for {symbol}: {str(e)}")
        raise


def get_multiple_symbols_data(symbols: list, range_str: str = '1mo') -> Dict:
    """
    Get historical data for multiple symbols at once.
    Useful for comparison charts.
    """
    if not symbols or not isinstance(symbols, list):
        raise ValueError("Invalid symbols list")
    
    if not validate_range(range_str):
        raise ValueError(f"Invalid range: {range_str}")
    
    period, interval = range_to_period(range_str)
    results = {}
    
    for symbol in symbols:
        try:
            if not validate_ticker(symbol):
                logger.warning(f"Skipping invalid ticker: {symbol}")
                continue
            
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=period, interval=interval)
            
            if not hist.empty:
                info = ticker.info
                results[symbol] = {
                    "data": format_ohlcv_data(hist),
                    "meta": {
                        "currency": info.get('currency', 'USD'),
                        "regularMarketPrice": info.get('currentPrice', 0),
                        "previousClose": info.get('previousClose', 0),
                    }
                }
        
        except Exception as e:
            logger.error(f"Error fetching data for {symbol}: {str(e)}")
            continue
    
    return {
        "range": range_str,
        "interval": interval,
        "symbols": results,
        "count": len(results)
    }
