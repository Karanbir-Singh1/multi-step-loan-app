import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== '/api' ? import.meta.env.VITE_API_URL : 'https://team-task-manager-production-7a37.up.railway.app/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ttm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (config.params) {
    config.params = Object.fromEntries(
      Object.entries(config.params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
    );
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ttm_token');
      localStorage.removeItem('ttm_user');
    }
    return Promise.reject(error);
  }
);

export default api;
