import yfinance as yf
import logging
from typing import List, Dict, Optional
from utils import cache_with_ttl, validate_ticker, format_ohlcv_data
from config import CACHE_TTL_SEARCH, CACHE_TTL_STOCK_DETAILS

logger = logging.getLogger(__name__)

# Common stock tickers for search suggestions
COMMON_TICKERS = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com Inc.',
    'TSLA': 'Tesla Inc.',
    'META': 'Meta Platforms Inc.',
    'NVDA': 'NVIDIA Corporation',
    'JPM': 'JPMorgan Chase & Co.',
    'V': 'Visa Inc.',
    'WMT': 'Walmart Inc.',
    'RELIANCE.NS': 'Reliance Industries',
    'TCS.NS': 'Tata Consultancy Services',
    'INFY.NS': 'Infosys Limited',
    'HDFC.NS': 'HDFC Bank Limited',
    'ICICIBANK.NS': 'ICICI Bank Limited',
    'SBIN.NS': 'State Bank of India',
    'BAJAJFINSV.NS': 'Bajaj Finserv Limited',
    'MARUTI.NS': 'Maruti Suzuki India Limited',
    'WIPRO.NS': 'Wipro Limited',
    'HCLTECH.NS': 'HCL Technologies Limited',
    '^NSEI': 'NIFTY 50',
    '^BSESN': 'BSE SENSEX',
    'BTC-USD': 'Bitcoin',
    'ETH-USD': 'Ethereum',
}


@cache_with_ttl(CACHE_TTL_SEARCH)
def search_stocks(query: str, limit: int = 10) -> Dict:
    """
    Search for stocks by query string.
    Returns matching tickers from common list.
    """
    if not query or len(query.strip()) == 0:
        return {
            "results": [],
            "query": query,
            "count": 0
        }
    
    query_upper = query.upper().strip()
    results = []
    
    # Search in common tickers
    for ticker, name in COMMON_TICKERS.items():
        if query_upper in ticker or query_upper in name.upper():
            results.append({
                "symbol": ticker,
                "name": name,
                "type": "stock" if not ticker.startswith('^') else "index",
                "exchange": "NSE" if ".NS" in ticker else "BSE" if ".BO" in ticker else "NASDAQ",
                "currency": "INR" if ".NS" in ticker or ".BO" in ticker else "USD"
            })
            
            if len(results) >= limit:
                break
    
    return {
        "results": results,
        "query": query,
        "count": len(results)
    }


@cache_with_ttl(CACHE_TTL_STOCK_DETAILS)
def get_stock_details(symbol: str) -> Dict:
    """
    Get detailed information about a stock.
    """
    if not validate_ticker(symbol):
        raise ValueError(f"Invalid ticker symbol: {symbol}")
    
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        # Extract key information
        details = {
            "symbol": symbol,
            "name": info.get('longName', symbol),
            "currency": info.get('currency', 'USD'),
            "currentPrice": info.get('currentPrice', 0),
            "previousClose": info.get('previousClose', 0),
            "open": info.get('open', 0),
            "dayHigh": info.get('dayHigh', 0),
            "dayLow": info.get('dayLow', 0),
            "fiftyTwoWeekHigh": info.get('fiftyTwoWeekHigh', 0),
            "fiftyTwoWeekLow": info.get('fiftyTwoWeekLow', 0),
            "volume": info.get('volume', 0),
            "marketCap": info.get('marketCap', 0),
            "peRatio": info.get('trailingPE', 0),
            "dividendYield": info.get('dividendYield', 0),
            "beta": info.get('beta', 0),
            "fiftyDayAverage": info.get('fiftyDayAverage', 0),
            "twoHundredDayAverage": info.get('twoHundredDayAverage', 0),
        }
        
        return details
    
    except Exception as e:
        logger.error(f"Error fetching stock details for {symbol}: {str(e)}")
        raise


def get_stock_quote(symbol: str) -> Dict:
    """
    Get current quote for a stock (no caching for real-time data).
    """
    if not validate_ticker(symbol):
        raise ValueError(f"Invalid ticker symbol: {symbol}")
    
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        return {
            "symbol": symbol,
            "price": info.get('currentPrice', 0),
            "change": info.get('currentPrice', 0) - info.get('previousClose', 0),
            "changePercent": ((info.get('currentPrice', 0) - info.get('previousClose', 0)) / info.get('previousClose', 1)) * 100,
            "timestamp": info.get('lastTradeTime', None)
        }
    
    except Exception as e:
        logger.error(f"Error fetching stock quote for {symbol}: {str(e)}")
        raise
