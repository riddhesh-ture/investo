# Investo - Development Setup Guide

This guide will help you set up the Investo Google Finance Clone for local development.

## Prerequisites

- **Node.js**: v18+ (for frontend)
- **Python**: 3.8+ (for backend)
- **npm**: v9+ (comes with Node.js)
- **pip**: Python package manager
- **Git**: For version control

## Project Structure

```
investo/
├── backend/          # Python FastAPI backend
├── src/              # React frontend
├── package.json      # Frontend dependencies
└── vite.config.js    # Vite configuration
```

## Frontend Setup

### 1. Install Dependencies

```bash
cd /path/to/investo
npm install
```

This installs all frontend dependencies including:
- React 19.2.0
- Material UI 7.3.7
- Axios
- React Router
- Recharts
- dayjs

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:8000/api
```

### 3. Start Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### 5. Preview Production Build

```bash
npm run preview
```

## Backend Setup

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

**On macOS/Linux:**
```bash
source venv/bin/activate
```

**On Windows:**
```bash
venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- FastAPI 0.104.1
- Uvicorn 0.24.0
- yfinance 0.2.32
- Pydantic 2.5.0
- python-dotenv 1.0.0
- aiohttp 3.9.1
- pytest 7.4.3

### 3. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# backend/.env
ENVIRONMENT=development
DEBUG=True
LOG_LEVEL=INFO

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Cache Configuration (in seconds)
CACHE_TTL_SEARCH=3600
CACHE_TTL_CHART_INTRADAY=1800
CACHE_TTL_CHART_DAILY=3600
CACHE_TTL_STOCK_DETAILS=900

# API Configuration
API_RATE_LIMIT=100
API_TIMEOUT=30
```

### 4. Start Backend Server

```bash
python main.py
```

The backend will be available at `http://localhost:8000`

Access the interactive API documentation at `http://localhost:8000/docs`

### 5. Run Backend Tests

```bash
pytest
```

## Full Stack Development

To run both frontend and backend simultaneously:

### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python main.py
```

### Terminal 2 - Frontend
```bash
npm run dev
```

Now you can access the application at `http://localhost:5173`

## Common Development Tasks

### Adding a New Frontend Dependency

```bash
npm install package-name
```

### Adding a New Backend Dependency

```bash
cd backend
source venv/bin/activate
pip install package-name
pip freeze > requirements.txt
```

### Running Linting

```bash
npm run lint
```

### Formatting Code

The project uses ESLint for code quality. Fix issues with:

```bash
npm run lint -- --fix
```

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:

1. Ensure backend is running on `http://localhost:8000`
2. Check that `CORS_ORIGINS` in `backend/.env` includes `http://localhost:5173`
3. Restart the backend server

### Port Already in Use

**Frontend (Port 5173):**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5173   # Windows
```

**Backend (Port 8000):**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :8000   # Windows
```

### yfinance Rate Limiting

If you encounter rate limiting from yfinance:

1. Increase cache TTL values in `backend/.env`
2. Add delays between requests
3. Consider using a proxy or alternative data source

### Module Not Found Errors

**Frontend:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Backend:**
```bash
cd backend
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## API Testing

### Using cURL

```bash
# Search for stocks
curl "http://localhost:8000/api/search?q=AAPL&limit=5"

# Get chart data
curl "http://localhost:8000/api/chart/AAPL?range=1mo"

# Get stock details
curl "http://localhost:8000/api/stock/AAPL"

# Get current quote
curl "http://localhost:8000/api/quote/AAPL"
```

### Using Swagger UI

Visit `http://localhost:8000/docs` for interactive API documentation.

## Database Setup (Future)

When database support is added:

```bash
# Create database
python -m alembic upgrade head

# Run migrations
python -m alembic revision --autogenerate -m "description"
python -m alembic upgrade head
```

## Docker Setup (Optional)

### Build Docker Image

```bash
docker build -t investo-api -f backend/Dockerfile .
```

### Run Docker Container

```bash
docker run -p 8000:8000 investo-api
```

### Docker Compose

```bash
docker-compose up
```

## Git Workflow

### Create Feature Branch

```bash
git checkout -b feature/feature-name
```

### Make Changes and Commit

```bash
git add .
git commit -m 'feat: description of changes'
```

### Push to Remote

```bash
git push origin feature/feature-name
```

### Create Pull Request

```bash
gh pr create --title "Feature Title" --body "Description"
```

## Performance Optimization

### Frontend

1. **Code Splitting**: Routes are automatically code-split by Vite
2. **Image Optimization**: Use SVG for icons
3. **Bundle Analysis**: `npm run build` shows bundle size
4. **Lazy Loading**: Use React.lazy() for components

### Backend

1. **Caching**: Configured with TTL for different endpoints
2. **Async Operations**: FastAPI handles async requests
3. **Database Indexing**: (When database is added)
4. **Query Optimization**: Use efficient queries

## Debugging

### Frontend Debugging

1. Open browser DevTools (F12)
2. Use React DevTools extension
3. Check Network tab for API calls
4. Use Console for logs

### Backend Debugging

1. Add print statements or use logging
2. Use FastAPI's built-in debugging
3. Check logs in terminal
4. Use Python debugger: `import pdb; pdb.set_trace()`

## Environment Variables Reference

### Frontend (.env.local)

| Variable | Default | Description |
|----------|---------|-------------|
| VITE_API_BASE_URL | http://localhost:8000/api | Backend API base URL |

### Backend (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| ENVIRONMENT | development | Environment (development/production) |
| DEBUG | True | Enable debug mode |
| LOG_LEVEL | INFO | Logging level |
| CORS_ORIGINS | http://localhost:5173 | Allowed CORS origins |
| CACHE_TTL_SEARCH | 3600 | Search cache TTL (seconds) |
| CACHE_TTL_CHART_INTRADAY | 1800 | Intraday chart cache TTL |
| CACHE_TTL_CHART_DAILY | 3600 | Daily chart cache TTL |
| CACHE_TTL_STOCK_DETAILS | 900 | Stock details cache TTL |
| API_RATE_LIMIT | 100 | API rate limit |
| API_TIMEOUT | 30 | API timeout (seconds) |

## Next Steps

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
2. Read [API.md](./API.md) for API documentation
3. Check [backend/README.md](./backend/README.md) for backend details
4. Start developing!

## Support

For issues or questions:

1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include error messages and steps to reproduce
4. Provide environment information (OS, Node version, Python version)

## Resources

- [React Documentation](https://react.dev/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Material UI Documentation](https://mui.com/)
- [Vite Documentation](https://vitejs.dev/)
- [yfinance Documentation](https://yfinance.readthedocs.io/)
