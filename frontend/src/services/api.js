/**
 * Axios API configuration
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Configure axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token (if implemented)
api.interceptors.request.use(
  (config) => {
    // Add API key or token if needed
    // config.headers['X-API-Key'] = process.env.REACT_APP_API_KEY;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          console.error('Bad request:', data);
          break;
        case 401:
          console.error('Unauthorized - redirecting to login');
          // Redirect to login if auth is implemented
          break;
        case 403:
          console.error('Forbidden - insufficient permissions');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error:', data);
          break;
        default:
          console.error('API Error:', data);
      }
      
      throw new Error(data.detail || data.message || 'An error occurred');
    } else if (error.request) {
      // Request was made but no response
      console.error('No response from server');
      throw new Error('Unable to connect to server. Please check your connection.');
    } else {
      // Something else happened
      console.error('Request error:', error.message);
      throw error;
    }
  }
);

export default api;