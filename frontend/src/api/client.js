import axios from 'axios';

// BEST PRACTICE: Use environment variable for production API URL
// Fallback to '/api' for local development (which Vite will proxy)
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error.response?.data || { error: error.message };
  }
);

export default api;
