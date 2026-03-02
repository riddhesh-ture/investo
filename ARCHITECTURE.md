# Investo Google Finance Clone - Architecture

## System Overview

Investo is a full-stack financial data application that provides real-time stock, cryptocurrency, and mutual fund information with interactive charts and search capabilities. The architecture follows a hybrid approach with a Python FastAPI backend for stocks/crypto data and direct frontend calls to the mfapi.in API for Indian mutual funds.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React + Vite)                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Pages: Dashboard, Market, Portfolio, StockDetail, MfDetail  │
│  │  Components: UnifiedSearch, Charts, Skeletons, ErrorBoundary │
│  │  Services: stockApi.js, mfApi.js                             │
│  │  Hooks: useSearchCache, useMutualFunds                        │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
    ┌──────────────────────┐    ┌──────────────────────┐
    │  Backend API         │    │  External APIs       │
    │  (FastAPI)           │    │                      │
    │  Port: 8000          │    │  mfapi.in            │
    │                      │    │  yfinance            │
    │  Endpoints:          │    │                      │
    │  - /api/search       │    │  (Direct calls from  │
    │  - /api/chart        │    │   frontend)          │
    │  - /api/stock        │    │                      │
    │  - /api/quote        │    │                      │
    │  - /api/intraday     │    │                      │
    │  - /api/compare      │    │                      │
    └──────────────────────┘    └──────────────────────┘
            │
            ▼
    ┌──────────────────────┐
    │  Data Sources        │
    │                      │
    │  - yfinance          │
    │  - mfapi.in          │
    └──────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 19.2.0 with Vite
- **UI Library**: Material UI (MUI) 7.3.7
- **Routing**: React Router 7.13.0
- **HTTP Client**: Axios
- **Charts**: Recharts (with MUI X Charts available)
- **Date Handling**: dayjs 1.11.19
- **State Management**: React Hooks (useState, useEffect, useMemo, useCallback)

### Backend
- **Framework**: FastAPI 0.104.1
- **Server**: Uvicorn 0.24.0
- **Data Source**: yfinance 0.2.32
- **Validation**: Pydantic 2.5.0
- **Environment**: python-dotenv 1.0.0
- **Async HTTP**: aiohttp 3.9.1

## Project Structure

```
investo/
├── backend/                          # Python FastAPI backend
│   ├── main.py                       # FastAPI application entry point
│   ├── config.py                     # Configuration management
│   ├── utils.py                      # Utility functions and caching
│   ├── requirements.txt               # Python dependencies
│   ├── .env.example                  # Environment variables template
│   ├── .gitignore                    # Git ignore rules
│   ├── README.md                     # Backend documentation
│   ├── services/
│   │   ├── __init__.py
│   │   ├── stock_service.py          # Stock search and details
│   │   └── chart_service.py          # Historical price data
│   └── tests/                        # Backend tests
│
├── src/                              # React frontend
│   ├── main.jsx                      # Entry point
│   ├── App.jsx                       # Main app component with routes
│   ├── pages/
│   │   ├── Dashboard.jsx             # Dashboard page
│   │   ├── Market.jsx                # Market overview page
│   │   ├── Portfolio.jsx             # Portfolio page
│   │   ├── StockDetail.jsx           # Stock detail page
│   │   ├── MfDetail.jsx              # Mutual fund detail page
│   │   ├── MarketingPage.jsx         # Marketing/landing page
│   │   ├── SignInSide.jsx            # Sign in page
│   │   └── SignUp.jsx                # Sign up page
│   │
│   ├── components/
│   │   ├── ErrorBoundary.jsx         # Error boundary wrapper
│   │   ├── dashboard/
│   │   │   ├── AppNavbar.jsx         # Navigation bar with search
│   │   │   ├── UnifiedSearch.jsx     # Unified search component
│   │   │   ├── SideMenu.jsx          # Side menu
│   │   │   └── ... (other dashboard components)
│   │   ├── skeletons/
│   │   │   ├── ChartSkeleton.jsx     # Chart loading skeleton
│   │   │   ├── StatisticsSkeleton.jsx # Stats loading skeleton
│   │   │   └── HeaderSkeleton.jsx    # Header loading skeleton
│   │   └── ... (other components)
│   │
│   ├── services/
│   │   ├── config.js                 # API configuration
│   │   ├── stockApi.js               # Stock API service
│   │   └── mfApi.js                  # Mutual fund API service
│   │
│   ├── hooks/
│   │   ├── useSearchCache.js         # Search caching hook
│   │   └── useMutualFunds.js         # Mutual funds hook
│   │
│   ├── utils/
│   │   └── chartUtils.js             # Chart formatting utilities
│   │
│   ├── layouts/
│   │   └── MainLayout.jsx            # Main layout wrapper
│   │
│   ├── shared-theme/
│   │   ├── AppTheme.jsx              # Theme provider
│   │   └── ... (theme components)
│   │
│   └── theme/
│       └── customizations/           # MUI customizations
│
├── package.json                      # Frontend dependencies
├── vite.config.js                    # Vite configuration
├── eslint.config.js                  # ESLint configuration
├── ARCHITECTURE.md                   # This file
├── SETUP.md                          # Setup instructions
├── API.md                            # API documentation
└── README.md                         # Project README
```

## Data Flow

### Stock Search Flow
1. User types in UnifiedSearch component
2. Input is debounced (300ms)
3. Frontend calls `stockApi.searchStocks(query)`
4. Axios sends GET request to `/api/search?q={query}`
5. Backend searches in predefined stock list
6. Results are cached (1 hour TTL)
7. Results displayed in grouped autocomplete

### Stock Detail Flow
1. User selects stock from search or navigates to `/home/stock/{symbol}`
2. StockDetail page loads
3. Fetches stock details via `stockApi.getStockDetails(symbol)`
4. Fetches chart data via `stockApi.getChartData(symbol, range)`
5. Backend queries yfinance for data
6. Data is cached based on range (30min for intraday, 1hr for daily)
7. Charts render with Recharts
8. User can change timeframe, triggering new data fetch

### Mutual Fund Flow
1. User searches for mutual fund in UnifiedSearch
2. Frontend calls `mfApi.searchMutualFunds(query)`
3. Fetches all MF list from mfapi.in (cached 24 hours)
4. Searches locally in the list
5. User selects MF, navigates to `/home/mf/{schemeCode}`
6. MfDetail page fetches NAV history via `mfApi.getNAVHistory(schemeCode)`
7. NAV data displayed in chart
8. Performance metrics calculated from NAV history

## Caching Strategy

### Backend Caching (Python)
- **Search Results**: 1 hour TTL
- **Chart Data (Intraday)**: 30 minutes TTL
- **Chart Data (Daily)**: 1 hour TTL
- **Stock Details**: 15 minutes TTL
- **Quotes**: No caching (real-time)

Implementation uses custom `CacheWithTTL` class with decorator pattern.

### Frontend Caching
- **Search Results**: In-memory cache with 5 minutes TTL
- **Recent Searches**: localStorage (10 items)
- **Mutual Funds List**: localStorage (24 hours TTL)
- **Mutual Fund Details**: localStorage (24 hours TTL)

## API Endpoints

### Stock API (Backend)
- `GET /health` - Health check
- `GET /api/search?q={query}&limit={limit}` - Search stocks
- `GET /api/chart/{symbol}?range={range}&interval={interval}` - Chart data
- `GET /api/stock/{symbol}` - Stock details
- `GET /api/quote/{symbol}` - Current quote (no caching)
- `GET /api/intraday/{symbol}?interval={interval}` - Intraday data
- `GET /api/compare?symbols={symbols}&range={range}` - Compare multiple stocks

### Mutual Fund API (External)
- `GET https://api.mfapi.in/mf` - All mutual funds
- `GET https://api.mfapi.in/mf/{schemeCode}` - Fund details with NAV history

## Error Handling

### Frontend
- **Error Boundary**: Catches React component errors
- **Try-Catch**: API calls wrapped in try-catch
- **User Feedback**: Alert components for errors
- **Fallback UI**: Skeleton loaders during loading states

### Backend
- **Global Exception Handlers**: Catch all exceptions
- **Validation**: Pydantic models validate inputs
- **Logging**: All errors logged with context
- **HTTP Status Codes**: Appropriate status codes returned

## Performance Optimizations

1. **Caching**: Multi-layer caching (backend + frontend)
2. **Debouncing**: Search input debounced to reduce API calls
3. **Lazy Loading**: Components loaded on demand
4. **Memoization**: useCallback and useMemo for expensive operations
5. **Code Splitting**: Route-based code splitting with React Router
6. **Image Optimization**: SVG icons instead of raster images
7. **Bundle Size**: Tree-shaking and minification via Vite

## Security Considerations

1. **CORS**: Configured on backend for frontend domain
2. **Input Validation**: All inputs validated on backend
3. **Environment Variables**: Sensitive config in .env files
4. **Error Messages**: Generic error messages to users, detailed logs server-side
5. **Rate Limiting**: Can be implemented via API gateway
6. **HTTPS**: Required in production

## Deployment Architecture

### Frontend Deployment
- Build: `npm run build` → Vite produces optimized bundle
- Hosting: Vercel, Netlify, or any static host
- Environment: API_BASE_URL configured via env variables

### Backend Deployment
- Containerization: Docker image with Python 3.9+
- Server: Uvicorn with gunicorn in production
- Hosting: Heroku, Railway, Render, or any Python host
- Environment: All config via environment variables

## Monitoring & Logging

### Frontend
- Console logs for development
- Error tracking can be integrated (Sentry, etc.)

### Backend
- Structured logging with timestamps
- Request/response logging
- Error logging with stack traces
- Can integrate with monitoring services (DataDog, New Relic, etc.)

## Future Enhancements

1. **Real-time Updates**: WebSocket for live price updates
2. **User Accounts**: Authentication and portfolio management
3. **Alerts**: Price alerts and notifications
4. **Advanced Charts**: Candlestick charts, technical indicators
5. **Comparison**: Side-by-side stock comparison
6. **News Integration**: Financial news feed
7. **Mobile App**: React Native version
8. **API Rate Limiting**: Implement rate limiting
9. **Database**: Store user data and historical data
10. **Machine Learning**: Price predictions and recommendations

## Development Workflow

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes following code standards
3. Test locally
4. Commit with conventional commits: `git commit -m 'feat: description'`
5. Push to remote: `git push origin feature/feature-name`
6. Create pull request
7. Code review and CI/CD checks
8. Merge to main

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Material UI Documentation](https://mui.com/)
- [yfinance Documentation](https://yfinance.readthedocs.io/)
- [mfapi.in Documentation](https://mfapi.in/)
