import functools
import time
from typing import Any, Callable, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class CacheWithTTL:
    """Simple cache with TTL (Time To Live) support"""
    
    def __init__(self, ttl_seconds: int):
        self.ttl_seconds = ttl_seconds
        self.cache = {}
        self.timestamps = {}
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache if not expired"""
        if key not in self.cache:
            return None
        
        if time.time() - self.timestamps[key] > self.ttl_seconds:
            del self.cache[key]
            del self.timestamps[key]
            return None
        
        return self.cache[key]
    
    def set(self, key: str, value: Any) -> None:
        """Set value in cache with current timestamp"""
        self.cache[key] = value
        self.timestamps[key] = time.time()
    
    def clear(self) -> None:
        """Clear all cache"""
        self.cache.clear()
        self.timestamps.clear()


def cache_with_ttl(ttl_seconds: int):
    """Decorator for caching function results with TTL"""
    cache = CacheWithTTL(ttl_seconds)
    
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Create cache key from function name and arguments
            cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            
            # Try to get from cache
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                logger.debug(f"Cache hit for {func.__name__}")
                return cached_result
            
            # Call function and cache result
            logger.debug(f"Cache miss for {func.__name__}, calling function")
            result = func(*args, **kwargs)
            cache.set(cache_key, result)
            return result
        
        return wrapper
    return decorator


def format_response(data: Any, message: str = "Success", status_code: int = 200) -> dict:
    """Format API response"""
    return {
        "status": "success" if status_code < 400 else "error",
        "message": message,
        "data": data,
        "timestamp": datetime.utcnow().isoformat()
    }


def format_error_response(error: str, status_code: int = 400) -> dict:
    """Format error response"""
    return {
        "status": "error",
        "message": error,
        "data": None,
        "timestamp": datetime.utcnow().isoformat()
    }


def validate_ticker(ticker: str) -> bool:
    """Validate ticker symbol format"""
    if not ticker or not isinstance(ticker, str):
        return False
    
    # Basic validation: alphanumeric and some special chars
    ticker = ticker.strip().upper()
    return len(ticker) > 0 and len(ticker) <= 10


def validate_range(range_str: str) -> bool:
    """Validate chart range parameter"""
    valid_ranges = ['1d', '5d', '1mo', '6mo', '1y', '5y']
    return range_str in valid_ranges


def validate_interval(interval_str: str) -> bool:
    """Validate chart interval parameter"""
    valid_intervals = ['1m', '5m', '15m', '1h', '1d']
    return interval_str in valid_intervals


def range_to_period(range_str: str) -> tuple[str, str]:
    """Convert range string to yfinance period and interval"""
    mapping = {
        '1d': ('1d', '1m'),
        '5d': ('5d', '5m'),
        '1mo': ('1mo', '1d'),
        '6mo': ('6mo', '1d'),
        '1y': ('1y', '1d'),
        '5y': ('5y', '1d'),
    }
    return mapping.get(range_str, ('1mo', '1d'))


def format_ohlcv_data(df) -> list:
    """Format OHLCV data from yfinance for API response"""
    if df is None or df.empty:
        return []
    
    data = []
    for index, row in df.iterrows():
        data.append({
            "date": index.isoformat() if hasattr(index, 'isoformat') else str(index),
            "open": float(row.get('Open', 0)) if 'Open' in row else None,
            "high": float(row.get('High', 0)) if 'High' in row else None,
            "low": float(row.get('Low', 0)) if 'Low' in row else None,
            "close": float(row.get('Close', 0)) if 'Close' in row else None,
            "volume": int(row.get('Volume', 0)) if 'Volume' in row else None,
            "adjClose": float(row.get('Adj Close', 0)) if 'Adj Close' in row else None,
        })
    
    return data
