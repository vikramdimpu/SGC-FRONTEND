import apiClient from './apiClient';

export const studentService = {
  // Fetch current authenticated student's full academic transcript (CGPA, SGPA, published marks)
  getMyAcademicReport: async () => {
    const response = await apiClient.get('/student/me');
    return response.data;
  },
};

export default studentService;
