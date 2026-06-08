import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
    id: string;
    email: string;
    display_name: string;
    first_name?: string;
    last_name?: string;
    role: {
        name: string;
        level: number;
    };
    user_roles?: any[];
    company_id?: string | null;
    branch_id?: string | number | null;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            setUser: (user) => set({ user, isAuthenticated: !!user }),
            logout: () => set({ user: null, isAuthenticated: false }),
        }),
        {
            name: "durkkas-auth-storage",
        }
    )
);
