import api from './axios.js';

export const getUsers = () => api.get('/users');
