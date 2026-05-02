import api from './axios.js';

export const getProjects = (params) => api.get('/projects', { params });
export const createProject = (payload) => api.post('/projects', payload);
export const updateProject = (id, payload) => api.put(`/projects/${id}`, payload);
export const deleteProject = (id) => api.delete(`/projects/${id}`);
export const addMember = (projectId, userId) => api.post(`/projects/${projectId}/members`, { userId });
export const removeMember = (projectId, userId) => api.delete(`/projects/${projectId}/members/${userId}`);
