// API Configuration for different environments

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const MF_API_BASE_URL = 'https://api.mfapi.in/mf';

export const config = {
  // Backend API
  stockApi: {
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  },
  
  // Mutual Funds API
  mfApi: {
    baseURL: MF_API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  },
};

export default config;
