import api from './api';

export const quizService = {
  // Get all quizzes for a specific course
  getQuizzesByCourse: (courseId) => api.get(`/quizzes/course/${courseId}`),

  // Get a specific quiz with its questions
  getQuizById: (quizId) => api.get(`/quizzes/${quizId}`),

  // Create a new quiz
  createQuiz: (data) => api.post('/quizzes', data),

  // Update an existing quiz
  updateQuiz: (quizId, data) => api.put(`/quizzes/${quizId}`, data),

  // Delete a quiz
  deleteQuiz: (quizId) => api.delete(`/quizzes/${quizId}`),

  // Submit a quiz attempt
  submitQuiz: (quizId, answers) => api.post(`/quizzes/${quizId}/submit`, { answers }),

  // Get my past attempts for a quiz
  getMyAttempts: (quizId) => api.get(`/quizzes/${quizId}/attempts`),

  // Instructors: get all attempts for a quiz
  getQuizAttempts: (quizId) => api.get(`/quizzes/${quizId}/all-attempts`)
};
