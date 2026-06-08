import { create } from 'zustand';
import { emsService } from '@/services/emsService';

interface StudentProfile {
    id: number;
    student_code: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    status: string;
}

interface Enrollment {
    id: number;
    course_id: number;
    course_name: string;
    enrollment_status: string;
    completion_percentage: number;
    total_lessons: number;
    lessons_completed: number;
}

interface EmsState {
    profile: StudentProfile | null;
    enrollments: Enrollment[];
    loading: boolean;
    error: string | null;

    fetchProfile: () => Promise<any>;
    fetchEnrollments: (studentId: number) => Promise<void>;
}

export const useEmsStore = create<EmsState>((set) => ({
    profile: null,
    enrollments: [],
    loading: false,
    error: null,

    fetchProfile: async () => {
        set({ loading: true, error: null });
        try {
            const response = await emsService.getCurrentProfile();
            set({ profile: response.data, loading: false });
            return response.data;
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    fetchEnrollments: async (studentId: number) => {
        set({ loading: true, error: null });
        try {
            const response = await emsService.getEnrollments(studentId);
            // Map nested courses object to flat structure
            const flattenedEnrollments = response.data.map((enr: any) => ({
                ...enr,
                course_name: enr.courses?.course_name || 'Unknown Course',
                thumbnail_url: enr.courses?.thumbnail_url,
            }));
            set({ enrollments: flattenedEnrollments, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },
}));
