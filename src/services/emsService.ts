import axios from 'axios';
import Cookie from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance with interceptor for auth
const emsApi = axios.create({
    baseURL: API_URL,
});

// Add auth token to all requests
emsApi.interceptors.request.use((config) => {
    const token = Cookie.get('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const emsService = {
    // Students
    getStudentProfile: async (id: number) => {
        const response = await emsApi.get(`/ems/students/${id}`);
        return response.data;
    },

    getCurrentProfile: async () => {
        const response = await emsApi.get(`/ems/students/me`);
        return response.data;
    },

    // Enrollments & Progress
    getEnrollments: async (studentId: number) => {
        const response = await emsApi.get(`/ems/enrollments?student_id=${studentId}`);
        return response.data;
    },

    // Courses
    getCourses: async () => {
        const response = await emsApi.get(`/ems/courses`);
        return response.data;
    },

    getCourseDetails: async (id: number) => {
        const response = await emsApi.get(`/ems/courses/${id}`);
        return response.data;
    },

    // Attendance
    getAttendance: async (studentId: number) => {
        const response = await emsApi.get(`/ems/attendance?student_id=${studentId}`);
        return response.data;
    },

    // Quizzes & Assignments
    getQuizzes: async (courseId: number) => {
        const response = await emsApi.get(`/ems/quizzes?course_id=${courseId}`);
        return response.data;
    },

    // 🛡️ ADMIN METHODS (For Company Admin / Tutors)
    createCourse: async (data: any) => {
        const response = await emsApi.post('/ems/courses', data);
        return response.data;
    },

    updateCourse: async (id: number, data: any) => {
        const response = await emsApi.put(`/ems/courses/${id}`, data);
        return response.data;
    },

    deleteCourse: async (id: number) => {
        const response = await emsApi.delete(`/ems/courses/${id}`);
        return response.data;
    },

    getBatches: async () => {
        const response = await emsApi.get('/ems/batches');
        return response.data;
    },

    createBatch: async (data: any) => {
        const response = await emsApi.post('/ems/batches', data);
        return response.data;
    },

    getAllStudents: async () => {
        const response = await emsApi.get('/ems/students');
        return response.data;
    },

    createStudent: async (data: any) => {
        const response = await emsApi.post('/ems/students', data);
        return response.data;
    },
};
