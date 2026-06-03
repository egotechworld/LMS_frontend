import api from './api';

export const enrollmentService = {
  async enrollInCourse(courseId) {
    const response = await api.post('/enrollments', { courseId });
    return response.data;
  },

  async getMyEnrollments() {
    const response = await api.get('/enrollments/my-enrollments');
    return response.data;
  },

  async getCourseEnrollments(courseId) {
    const response = await api.get(`/enrollments/course/${courseId}`);
    return response.data;
  },

  async unenrollFromCourse(courseId) {
    const response = await api.delete(`/enrollments/course/${courseId}`);
    return response.data;
  }
};
