import api from './api';

export const paymentService = {
  async createCheckoutSession(courseId) {
    const response = await api.post('/payment/create-session', { courseId });
    return response.data;
  },

  async demoCheckout(courseId) {
    const response = await api.post('/payment/demo-checkout', { courseId });
    return response.data;
  },

  async getPurchaseHistory() {
    const response = await api.get('/payment/history');
    return response.data;
  },

  async getAllTransactions(params = { page: 1, limit: 20 }) {
    const response = await api.get('/payment/transactions', { params });
    return response.data;
  },

  async getRevenueStats() {
    const response = await api.get('/payment/revenue');
    return response.data;
  }
};
