import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('foodsentry-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401 && localStorage.getItem('foodsentry-token')) {
    localStorage.removeItem('foodsentry-token');
    window.dispatchEvent(new Event('foodsentry:unauthorized'));
  }
  return Promise.reject(error);
});

export function getErrorMessage(error) {
  if (!error.response) return 'Could not reach FoodSentry. Check your connection and try again.';
  return error.response.data?.message || 'Something went wrong. Please try again.';
}

export default api;
