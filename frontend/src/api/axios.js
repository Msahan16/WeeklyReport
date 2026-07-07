import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// Add token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  const requestUrl = config.url || '';
  const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');
  if (token && !isAuthRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;