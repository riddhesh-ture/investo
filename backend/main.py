from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from typing import Optional

from config import CORS_ORIGINS, DEBUG, ENVIRONMENT
from utils import format_response, format_error_response
from services.stock_service import search_stocks, get_stock_details, get_stock_quote
from services.chart_service import get_historical_data, get_intraday_data, get_multiple_symbols_data

# Setup logging
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Investo Finance API",
    description="Google Finance Clone - Stock and Crypto Data API",
    version="1.0.0",
    debug=DEBUG
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content=format_error_response(str(exc), 400)
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content=format_error_response("Internal server error", 500)
    )


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "environment": ENVIRONMENT,
        "service": "Investo Finance API"
    }


# Root endpoint
@app.get("/")
async def root():
    """API information endpoint"""
    return {
        "name": "Investo Finance API",
        "version": "1.0.0",
        "description": "Google Finance Clone - Stock and Crypto Data API",
        "endpoints": {
            "health": "/health",
            "search": "/api/search",
            "chart": "/api/chart/{symbol}",
            "stock": "/api/stock/{symbol}",
            "quote": "/api/quote/{symbol}",
            "docs": "/docs"
        }
    }


# Search endpoint
@app.get("/api/search")
async def search(q: str = Query(..., min_length=1), limit: int = Query(10, ge=1, le=50)):
    """
    Search for stocks and cryptocurrencies.
    
    Query Parameters:
    - q: Search query (required)
    - limit: Maximum results to return (default: 10, max: 50)
    """
    try:
        result = search_stocks(q, limit)
        return format_response(result, "Search completed successfully")
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Chart data endpoint
@app.get("/api/chart/{symbol}")
async def get_chart(
    symbol: str,
    range: str = Query("1mo", regex="^(1d|5d|1mo|6mo|1y|5y)$"),
    interval: Optional[str] = Query(None, regex="^(1m|5m|15m|1h|1d)$")
):
    """
    Get historical price data for a stock.
    
    Path Parameters:
    - symbol: Stock ticker symbol (e.g., AAPL, ^NSEI)
    
    Query Parameters:
    - range: Time range (1d, 5d, 1mo, 6mo, 1y, 5y) - default: 1mo
    - interval: Data interval (1m, 5m, 15m, 1h, 1d) - optional
    """
    try:
        result = get_historical_data(symbol, range, interval or "1d")
        return format_response(result, "Chart data retrieved successfully")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Chart error for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Intraday data endpoint
@app.get("/api/intraday/{symbol}")
async def get_intraday(
    symbol: str,
    interval: str = Query("5m", regex="^(1m|5m|15m|1h)$")
):
    """
    Get intraday price data for a stock.
    
    Path Parameters:
    - symbol: Stock ticker symbol
    
    Query Parameters:
    - interval: Data interval (1m, 5m, 15m, 1h) - default: 5m
    """
    try:
        result = get_intraday_data(symbol, interval)
        return format_response(result, "Intraday data retrieved successfully")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Intraday error for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Stock details endpoint
@app.get("/api/stock/{symbol}")
async def get_stock(symbol: str):
    """
    Get detailed information about a stock.
    
    Path Parameters:
    - symbol: Stock ticker symbol
    """
    try:
        result = get_stock_details(symbol)
        return format_response(result, "Stock details retrieved successfully")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Stock details error for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Quote endpoint (real-time, no caching)
@app.get("/api/quote/{symbol}")
async def get_quote(symbol: str):
    """
    Get current quote for a stock (real-time, no caching).
    
    Path Parameters:
    - symbol: Stock ticker symbol
    """
    try:
        result = get_stock_quote(symbol)
        return format_response(result, "Quote retrieved successfully")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Quote error for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Multiple symbols endpoint
@app.get("/api/compare")
async def compare_symbols(
    symbols: str = Query(..., description="Comma-separated list of symbols"),
    range: str = Query("1mo", regex="^(1d|5d|1mo|6mo|1y|5y)$")
):
    """
    Get historical data for multiple symbols for comparison.
    
    Query Parameters:
    - symbols: Comma-separated list of symbols (required)
    - range: Time range (default: 1mo)
    """
    try:
        symbol_list = [s.strip().upper() for s in symbols.split(",")]
        result = get_multiple_symbols_data(symbol_list, range)
        return format_response(result, "Comparison data retrieved successfully")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Compare error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
