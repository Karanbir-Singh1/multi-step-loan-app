import api from './axios.js';

export const getTasks = (params) => api.get('/tasks', { params });
export const createTask = (payload) => api.post('/tasks', payload);
export const updateTask = (id, payload) => api.put(`/tasks/${id}`, payload);
export const updateTaskStatus = (id, status) => api.patch(`/tasks/${id}/status`, { status });
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const getTaskSummary = () => api.get('/tasks/stats/summary');
