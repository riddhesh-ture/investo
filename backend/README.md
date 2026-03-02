# Investo Finance API - Backend

A FastAPI-based microservice for fetching stock, cryptocurrency, and financial market data using yfinance.

## Features

- Real-time stock and cryptocurrency data
- Historical price data with multiple timeframes
- Search functionality for stocks and indices
- Aggressive caching to prevent rate limiting
- CORS-enabled for frontend integration
- Comprehensive error handling
- Swagger UI documentation

## Setup

### Prerequisites

- Python 3.8+
- pip

### Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Run the server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Health Check
- **GET** `/health` - Check API health status

### Search
- **GET** `/api/search?q={query}&limit={limit}` - Search for stocks
  - Query Parameters:
    - `q` (required): Search query
    - `limit` (optional, default: 10): Max results

### Chart Data
- **GET** `/api/chart/{symbol}?range={range}&interval={interval}` - Get historical price data
  - Path Parameters:
    - `symbol`: Stock ticker (e.g., AAPL, ^NSEI)
  - Query Parameters:
    - `range` (default: 1mo): 1d, 5d, 1mo, 6mo, 1y, 5y
    - `interval` (optional): 1m, 5m, 15m, 1h, 1d

### Stock Details
- **GET** `/api/stock/{symbol}` - Get detailed stock information
  - Path Parameters:
    - `symbol`: Stock ticker

### Quote
- **GET** `/api/quote/{symbol}` - Get current stock quote (real-time, no caching)
  - Path Parameters:
    - `symbol`: Stock ticker

### Intraday Data
- **GET** `/api/intraday/{symbol}?interval={interval}` - Get intraday price data
  - Path Parameters:
    - `symbol`: Stock ticker
  - Query Parameters:
    - `interval` (default: 5m): 1m, 5m, 15m, 1h

### Compare Multiple Symbols
- **GET** `/api/compare?symbols={symbols}&range={range}` - Compare multiple stocks
  - Query Parameters:
    - `symbols` (required): Comma-separated list of symbols
    - `range` (default: 1mo): Time range

## Response Format

All successful responses follow this format:
```json
{
  "status": "success",
  "message": "Description of the response",
  "data": {
    // Actual data
  },
  "timestamp": "2024-02-01T12:00:00"
}
```

Error responses:
```json
{
  "status": "error",
  "message": "Error description",
  "data": null,
  "timestamp": "2024-02-01T12:00:00"
}
```

## Caching Strategy

The API implements aggressive caching to prevent rate limiting:

- **Search Results**: 1 hour TTL
- **Chart Data (Intraday)**: 30 minutes TTL
- **Chart Data (Daily)**: 1 hour TTL
- **Stock Details**: 15 minutes TTL
- **Quotes**: No caching (real-time)

Cache TTL can be configured via environment variables.

## Example Requests

### Search for Apple stock
```bash
curl "http://localhost:8000/api/search?q=AAPL&limit=5"
```

### Get 1-month chart data for Apple
```bash
curl "http://localhost:8000/api/chart/AAPL?range=1mo"
```

### Get stock details
```bash
curl "http://localhost:8000/api/stock/AAPL"
```

### Get current quote
```bash
curl "http://localhost:8000/api/quote/AAPL"
```

### Compare multiple stocks
```bash
curl "http://localhost:8000/api/compare?symbols=AAPL,MSFT,GOOGL&range=6mo"
```

## Documentation

Interactive API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Testing

Run tests with:
```bash
pytest
```

## Deployment

### Docker

Build and run with Docker:
```bash
docker build -t investo-api .
docker run -p 8000:8000 investo-api
```

### Environment Variables for Production

Set these environment variables in production:
- `ENVIRONMENT=production`
- `DEBUG=False`
- `CORS_ORIGINS=https://yourdomain.com`
- `LOG_LEVEL=WARNING`

## Troubleshooting

### Rate Limiting
If you encounter rate limiting errors from yfinance:
- Increase cache TTL values in `.env`
- Implement request queuing
- Consider using alternative data sources

### CORS Errors
Ensure your frontend URL is in `CORS_ORIGINS` environment variable.

### No Data Found
Some tickers may not be available in yfinance. Try:
- Using the correct ticker format (e.g., RELIANCE.NS for NSE stocks)
- Checking if the ticker is valid on the exchange

## License

MIT
