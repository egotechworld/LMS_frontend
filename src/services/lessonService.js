import api from './api';

export const lessonService = {
  async getCourseLessons(courseId) {
    const response = await api.get(`/lessons/course/${courseId}`);
    return response.data;
  },

  async createLesson(courseId, lessonData) {
    // lessonData could be FormData for media uploads
    const response = await api.post(`/lessons/course/${courseId}`, lessonData, {
      headers: {
        'Content-Type': lessonData instanceof FormData ? 'multipart/form-data' : 'application/json',
      },
    });
    return response.data;
  },

  async updateLesson(lessonId, lessonData) {
    const response = await api.put(`/lessons/${lessonId}`, lessonData, {
      headers: {
        'Content-Type': lessonData instanceof FormData ? 'multipart/form-data' : 'application/json',
      },
    });
    return response.data;
  },

  async deleteLesson(lessonId) {
    const response = await api.delete(`/lessons/${lessonId}`);
    return response.data;
  }
};
