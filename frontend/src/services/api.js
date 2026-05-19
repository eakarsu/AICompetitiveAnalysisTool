import axios from 'axios';
const BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4802/api';
const api = axios.create({ baseURL: BASE });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default api;
