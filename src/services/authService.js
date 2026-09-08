import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/users/register', userData);
    return response.data.data;
  },

  async login(credentials) {
    const response = await api.post('/users/login', credentials);
    return response.data.data;
  },

  async getCurrentUser() {
    const response = await api.get('/users/me');
    return response.data.data;
  },

  async logout() {
    const response = await api.post('/users/logout');
    return response.data;
  },

  // Admin only - register instructor
  async registerInstructor(userData) {
    const response = await api.post('/users/register-instructor', userData);
    return response.data;
  }
};
