import api from './api';

export const assignmentService = {
  // ── Assignments ──────────────────────────────────────────────────────────
  async getAssignmentsByCourse(courseId) {
    const response = await api.get(`/assignments/course/${courseId}`);
    return response.data;
  },

  async getAssignment(id) {
    const response = await api.get(`/assignments/${id}`);
    return response.data;
  },

  async createAssignment(formData) {
    const response = await api.post('/assignments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async updateAssignment(id, formData) {
    const response = await api.put(`/assignments/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async deleteAssignment(id) {
    const response = await api.delete(`/assignments/${id}`);
    return response.data;
  },

  // ── Submissions ──────────────────────────────────────────────────────────
  async submitAssignment(formData) {
    const response = await api.post('/assignments/submissions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getMySubmissions() {
    const response = await api.get('/assignments/submissions/my');
    return response.data;
  },

  async getSubmissionsByAssignment(assignmentId) {
    const response = await api.get(`/assignments/submissions/${assignmentId}`);
    return response.data;
  },

  // ── Grades ───────────────────────────────────────────────────────────────
  async gradeSubmission({ submissionId, mark, feedback }) {
    const response = await api.post('/assignments/grades', { submissionId, mark, feedback });
    return response.data;
  },

  async getGrade(submissionId) {
    const response = await api.get(`/assignments/grades/${submissionId}`);
    return response.data;
  },
};
