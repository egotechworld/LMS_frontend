import api from './api';

export const progressService = {
  // Student: get full progress for a course
  async getCourseProgress(courseId) {
    const response = await api.get(`/progress/${courseId}`);
    return response.data.data;
  },

  // Student: mark a lesson as completed
  async markLessonComplete(lessonId) {
    const response = await api.post('/progress/complete', { lessonId });
    return response.data;
  },

  // Instructor: get all students progress for a course
  async getStudentProgressByCourse(courseId) {
    const response = await api.get(`/progress/course/${courseId}/students`);
    return response.data.data;
  },

  // Instructor: get students who haven't submitted an assignment
  async getStudentsWithoutSubmission(assignmentId) {
    const response = await api.get(`/progress/assignment/${assignmentId}/missing`);
    return response.data.data;
  },
};
