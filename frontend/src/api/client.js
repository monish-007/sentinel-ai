import axios from 'axios';

// BEST PRACTICE: Use environment variable for production API URL
// Fallback to '/api' for local development (which Vite will proxy)
let rawBaseURL = import.meta.env.VITE_API_URL || '/api';

// DEFENSIVE FIX: If the user mistakenly set their VITE_API_URL to end in /chat or with a trailing slash, strip it out.
// This prevents errors like "Cannot POST /api/chat/chat".
if (rawBaseURL.endsWith('/chat')) {
  rawBaseURL = rawBaseURL.replace(/\/chat$/, '');
}
if (rawBaseURL.endsWith('/')) {
  rawBaseURL = rawBaseURL.slice(0, -1);
}

const baseURL = rawBaseURL;

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
