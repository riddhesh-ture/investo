# Investo API Documentation

Complete API reference for the Investo Google Finance Clone backend.

## Base URL

```
http://localhost:8000/api
```

## Authentication

Currently, the API does not require authentication. This will be added in future versions.

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "status": "success",
  "message": "Description of the response",
  "data": {
    // Actual response data
  },
  "timestamp": "2024-02-01T12:00:00"
}
```

### Error Response

```json
{
  "status": "error",
  "message": "Error description",
  "data": null,
  "timestamp": "2024-02-01T12:00:00"
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

## Endpoints

### Health Check

Check if the API is running.

**Request:**
```
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "environment": "development",
  "service": "Investo Finance API"
}
```

---

### Search Stocks

Search for stocks and cryptocurrencies by query.

**Request:**
```
GET /api/search?q={query}&limit={limit}
```

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| q | string | Yes | - | Search query (e.g., "AAPL", "Apple") |
| limit | integer | No | 10 | Maximum results to return (1-50) |

**Example:**
```bash
curl "http://localhost:8000/api/search?q=AAPL&limit=5"
```

**Response:**
```json
{
  "status": "success",
  "message": "Search completed successfully",
  "data": {
    "results": [
      {
        "symbol": "AAPL",
        "name": "Apple Inc.",
        "type": "stock",
        "exchange": "NASDAQ",
        "currency": "USD"
      },
      {
        "symbol": "AAPL.L",
        "name": "Apple Inc. (London)",
        "type": "stock",
        "exchange": "LSE",
        "currency": "GBP"
      }
    ],
    "query": "AAPL",
    "count": 2
  },
  "timestamp": "2024-02-01T12:00:00"
}
```

---

### Get Chart Data

Get historical price data for a stock with multiple timeframes.

**Request:**
```
GET /api/chart/{symbol}?range={range}&interval={interval}
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| symbol | string | Yes | Stock ticker symbol (e.g., "AAPL", "^NSEI") |

**Query Parameters:**

| Parameter | Type | Required | Default | Options |
|-----------|------|----------|---------|---------|
| range | string | No | 1mo | 1d, 5d, 1mo, 6mo, 1y, 5y |
| interval | string | No | 1d | 1m, 5m, 15m, 1h, 1d |

**Example:**
```bash
curl "http://localhost:8000/api/chart/AAPL?range=1mo&interval=1d"
```

**Response:**
```json
{
  "status": "success",
  "message": "Chart data retrieved successfully",
  "data": {
    "symbol": "AAPL",
    "range": "1mo",
    "interval": "1d",
    "data": [
      {
        "date": "2024-01-01T00:00:00Z",
        "open": 150.5,
        "high": 152.3,
        "low": 149.8,
        "close": 151.2,
        "volume": 50000000,
        "adjClose": 151.2
      },
      {
        "date": "2024-01-02T00:00:00Z",
        "open": 151.2,
        "high": 153.1,
        "low": 150.9,
        "close": 152.8,
        "volume": 45000000,
        "adjClose": 152.8
      }
    ],
    "meta": {
      "currency": "USD",
      "regularMarketPrice": 152.8,
      "previousClose": 150.8
    }
  },
  "timestamp": "2024-02-01T12:00:00"
}
```

---

### Get Stock Details

Get detailed information about a stock.

**Request:**
```
GET /api/stock/{symbol}
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| symbol | string | Yes | Stock ticker symbol |

**Example:**
```bash
curl "http://localhost:8000/api/stock/AAPL"
```

**Response:**
```json
{
  "status": "success",
  "message": "Stock details retrieved successfully",
  "data": {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "currency": "USD",
    "currentPrice": 152.8,
    "previousClose": 150.8,
    "open": 151.2,
    "dayHigh": 153.5,
    "dayLow": 150.9,
    "fiftyTwoWeekHigh": 199.62,
    "fiftyTwoWeekLow": 124.17,
    "volume": 45000000,
    "marketCap": 2400000000000,
    "peRatio": 28.5,
    "dividendYield": 0.0045,
    "beta": 1.2,
    "fiftyDayAverage": 155.3,
    "twoHundredDayAverage": 160.5
  },
  "timestamp": "2024-02-01T12:00:00"
}
```

---

### Get Current Quote

Get real-time stock quote (no caching).

**Request:**
```
GET /api/quote/{symbol}
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| symbol | string | Yes | Stock ticker symbol |

**Example:**
```bash
curl "http://localhost:8000/api/quote/AAPL"
```

**Response:**
```json
{
  "status": "success",
  "message": "Quote retrieved successfully",
  "data": {
    "symbol": "AAPL",
    "price": 152.8,
    "change": 2.0,
    "changePercent": 1.32,
    "timestamp": "2024-02-01T12:00:00"
  },
  "timestamp": "2024-02-01T12:00:00"
}
```

---

### Get Intraday Data

Get intraday price data for a stock (1 day with specified interval).

**Request:**
```
GET /api/intraday/{symbol}?interval={interval}
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| symbol | string | Yes | Stock ticker symbol |

**Query Parameters:**

| Parameter | Type | Required | Default | Options |
|-----------|------|----------|---------|---------|
| interval | string | No | 5m | 1m, 5m, 15m, 1h |

**Example:**
```bash
curl "http://localhost:8000/api/intraday/AAPL?interval=5m"
```

**Response:**
```json
{
  "status": "success",
  "message": "Intraday data retrieved successfully",
  "data": {
    "symbol": "AAPL",
    "range": "1d",
    "interval": "5m",
    "data": [
      {
        "date": "2024-02-01T09:30:00Z",
        "open": 150.5,
        "high": 150.8,
        "low": 150.2,
        "close": 150.6,
        "volume": 1000000,
        "adjClose": 150.6
      }
    ],
    "meta": {
      "currency": "USD",
      "regularMarketPrice": 150.6,
      "previousClose": 150.8,
      "dataPoints": 78
    }
  },
  "timestamp": "2024-02-01T12:00:00"
}
```

---

### Compare Multiple Stocks

Get historical data for multiple stocks for comparison.

**Request:**
```
GET /api/compare?symbols={symbols}&range={range}
```

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| symbols | string | Yes | - | Comma-separated list of symbols (e.g., "AAPL,MSFT,GOOGL") |
| range | string | No | 1mo | 1d, 5d, 1mo, 6mo, 1y, 5y |

**Example:**
```bash
curl "http://localhost:8000/api/compare?symbols=AAPL,MSFT,GOOGL&range=6mo"
```

**Response:**
```json
{
  "status": "success",
  "message": "Comparison data retrieved successfully",
  "data": {
    "range": "6mo",
    "interval": "1d",
    "symbols": {
      "AAPL": {
        "data": [
          {
            "date": "2023-08-01T00:00:00Z",
            "open": 170.5,
            "high": 172.3,
            "low": 169.8,
            "close": 171.2,
            "volume": 50000000,
            "adjClose": 171.2
          }
        ],
        "meta": {
          "currency": "USD",
          "regularMarketPrice": 171.2,
          "previousClose": 170.8
        }
      },
      "MSFT": {
        "data": [
          {
            "date": "2023-08-01T00:00:00Z",
            "open": 330.5,
            "high": 332.3,
            "low": 329.8,
            "close": 331.2,
            "volume": 25000000,
            "adjClose": 331.2
          }
        ],
        "meta": {
          "currency": "USD",
          "regularMarketPrice": 331.2,
          "previousClose": 330.8
        }
      }
    },
    "count": 2
  },
  "timestamp": "2024-02-01T12:00:00"
}
```

---

## Error Handling

### Invalid Query Parameter

**Request:**
```bash
curl "http://localhost:8000/api/search?q="
```

**Response:**
```json
{
  "status": "error",
  "message": "ensure this value has at least 1 characters",
  "data": null,
  "timestamp": "2024-02-01T12:00:00"
}
```

### Invalid Stock Symbol

**Request:**
```bash
curl "http://localhost:8000/api/stock/INVALID123"
```

**Response:**
```json
{
  "status": "error",
  "message": "No data found for symbol: INVALID123",
  "data": null,
  "timestamp": "2024-02-01T12:00:00"
}
```

### Invalid Range Parameter

**Request:**
```bash
curl "http://localhost:8000/api/chart/AAPL?range=invalid"
```

**Response:**
```json
{
  "status": "error",
  "message": "Invalid range: invalid",
  "data": null,
  "timestamp": "2024-02-01T12:00:00"
}
```

---

## Caching

The API implements aggressive caching to prevent rate limiting:

| Endpoint | Cache TTL | Notes |
|----------|-----------|-------|
| /api/search | 1 hour | Search results cached |
| /api/chart | 30 min (intraday) / 1 hour (daily) | Based on range parameter |
| /api/stock | 15 minutes | Stock details cached |
| /api/quote | No cache | Real-time data |
| /api/intraday | 30 minutes | Intraday data cached |
| /api/compare | 1 hour | Comparison data cached |

Cache TTL can be configured via environment variables in `backend/.env`.

---

## Rate Limiting

Currently, there is no rate limiting implemented. This will be added in future versions.

Recommended limits:
- 100 requests per minute per IP
- 1000 requests per hour per IP

---

## Supported Symbols

### US Stocks
- AAPL, MSFT, GOOGL, AMZN, TSLA, META, NVDA, JPM, V, WMT

### Indian Stocks (NSE)
- RELIANCE.NS, TCS.NS, INFY.NS, HDFC.NS, ICICIBANK.NS, SBIN.NS, BAJAJFINSV.NS, MARUTI.NS, WIPRO.NS, HCLTECH.NS

### Indices
- ^NSEI (NIFTY 50)
- ^BSESN (BSE SENSEX)

### Cryptocurrencies
- BTC-USD (Bitcoin)
- ETH-USD (Ethereum)

---

## Frontend Integration

### Using Axios

```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 30000,
});

// Search stocks
const searchStocks = async (query) => {
  const response = await apiClient.get('/search', {
    params: { q: query, limit: 10 }
  });
  return response.data.data;
};

// Get chart data
const getChartData = async (symbol, range = '1mo') => {
  const response = await apiClient.get(`/chart/${symbol}`, {
    params: { range }
  });
  return response.data.data;
};
```

---

## Testing with cURL

### Search
```bash
curl -X GET "http://localhost:8000/api/search?q=AAPL&limit=5"
```

### Chart Data
```bash
curl -X GET "http://localhost:8000/api/chart/AAPL?range=1mo&interval=1d"
```

### Stock Details
```bash
curl -X GET "http://localhost:8000/api/stock/AAPL"
```

### Quote
```bash
curl -X GET "http://localhost:8000/api/quote/AAPL"
```

### Intraday
```bash
curl -X GET "http://localhost:8000/api/intraday/AAPL?interval=5m"
```

### Compare
```bash
curl -X GET "http://localhost:8000/api/compare?symbols=AAPL,MSFT,GOOGL&range=6mo"
```

---

## Interactive API Documentation

Visit `http://localhost:8000/docs` for interactive Swagger UI documentation where you can test all endpoints directly.

---

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Stock search endpoint
- Chart data endpoint
- Stock details endpoint
- Quote endpoint
- Intraday data endpoint
- Compare multiple stocks endpoint

### Future Versions
- Authentication and user accounts
- Watchlist management
- Portfolio tracking
- Price alerts
- Advanced charting
- Technical indicators
- News integration
- WebSocket for real-time updates

---

## Support

For API issues or questions:

1. Check the [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
2. Check the [SETUP.md](./SETUP.md) for setup instructions
3. Visit the interactive docs at `http://localhost:8000/docs`
4. Create an issue on GitHub with details

---

## License

MIT
