import axios from 'axios';

// Get base URL from env
// Should be set to: https://seven-apparel.onrender.com (without /api)
// Or: https://seven-apparel.onrender.com/api (with /api)
const BASE_URL = import.meta.env.VITE_API_URL || '';

// Determine API URL - handle cases where /api may or may not be included
let API_URL: string;
if (!BASE_URL) {
  // Development: use Vite proxy
  API_URL = '/api';
} else if (BASE_URL.endsWith('/api')) {
  // Already has /api
  API_URL = BASE_URL;
} else {
  // Add /api
  API_URL = `${BASE_URL.replace(/\/$/, '')}/api`;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
