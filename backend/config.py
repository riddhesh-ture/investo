import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Environment
ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

# CORS Configuration
CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000').split(',')

# Cache Configuration (in seconds)
CACHE_TTL_SEARCH = int(os.getenv('CACHE_TTL_SEARCH', 3600))
CACHE_TTL_CHART_INTRADAY = int(os.getenv('CACHE_TTL_CHART_INTRADAY', 1800))
CACHE_TTL_CHART_DAILY = int(os.getenv('CACHE_TTL_CHART_DAILY', 3600))
CACHE_TTL_STOCK_DETAILS = int(os.getenv('CACHE_TTL_STOCK_DETAILS', 900))

# API Configuration
API_RATE_LIMIT = int(os.getenv('API_RATE_LIMIT', 100))
API_TIMEOUT = int(os.getenv('API_TIMEOUT', 30))

# Logging Configuration
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)
