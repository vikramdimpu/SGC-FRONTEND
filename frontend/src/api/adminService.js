import apiClient from './apiClient';

export const adminService = {
  // Student operations
  getAllStudents: async (params = {}) => {
    const response = await apiClient.get('/admin/students', { params });
    return response.data;
  },

  getStudentById: async (id) => {
    const response = await apiClient.get(`/admin/students/${id}`);
    return response.data;
  },

  registerStudent: async (studentData) => {
    const response = await apiClient.post('/admin/students', studentData);
    return response.data;
  },

  updateStudent: async (id, studentData) => {
    const response = await apiClient.put(`/admin/students/${id}`, studentData);
    return response.data;
  },

  toggleStatus: async (id) => {
    const response = await apiClient.patch(`/admin/students/${id}/status`);
    return response.data;
  },

  resetPassword: async (id, newPassword) => {
    const response = await apiClient.post(`/admin/students/${id}/reset-password`, { newPassword });
    return response.data;
  },

  getStudentAcademicReport: async (id) => {
    const response = await apiClient.get(`/admin/students/${id}/results`);
    return response.data;
  },

  // Subject operations
  getAllSubjects: async () => {
    const response = await apiClient.get('/admin/subjects');
    return response.data;
  },

  getSubjectsByBranchAndSemester: async (branch, semester) => {
    const response = await apiClient.get('/admin/subjects/filter', {
      params: { branch, semester },
    });
    return response.data;
  },

  createSubject: async (subjectData) => {
    const response = await apiClient.post('/admin/subjects', subjectData);
    return response.data;
  },

  // Marks & Publishing operations
  enterMarks: async (marksData) => {
    const response = await apiClient.post('/admin/marks', marksData);
    return response.data;
  },

  uploadBulkCsv: async (csvText) => {
    const response = await apiClient.post('/admin/marks/bulk-csv', { csv: csvText });
    return response.data;
  },

  publishSemester: async (semester) => {
    const response = await apiClient.post('/admin/results/publish', null, {
      params: { semester },
    });
    return response.data;
  },

  publishStudentSemester: async (studentId, semester) => {
    const response = await apiClient.post(`/admin/students/${studentId}/publish-semester/${semester}`);
    return response.data;
  },
};

export default adminService;
