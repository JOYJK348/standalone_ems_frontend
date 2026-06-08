import axios from 'axios';
import Cookies from 'js-cookie';

const getBaseUrl = () => {
    // 1. Priority: Environment Variable (Must be set in Vercel)
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

    // 2. Client-side handling
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        // Development / Local Network
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('10.') || hostname.startsWith('192.')) {
            return `http://${hostname}:3000/api`;
        }

        // Production fallback: Assuming API is on same domain or specific subdomain
        // For Vercel projects, you should ideally set NEXT_PUBLIC_API_URL
        return '/api';
    }

    // 3. Server-side fallback (Local)
    return 'http://127.0.0.1:3000/api';
};

const API_URL = getBaseUrl();

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
    },
    withCredentials: true,
});

// 🌐 Professional Public IP Detection with Location (lazy, non-blocking)
let cachedClientIp: string | null = null;
let cachedLocation: string | null = null;
let ipDetectionPromise: Promise<void> | null = null;

const detectClientIp = async (): Promise<void> => {
    if (typeof window === 'undefined') return;
    if (cachedClientIp) return;

    const providers = [
        'https://api.ipify.org?format=json',
        'https://ipapi.co/json/',
        'https://ipinfo.io/json?token=free'
    ];

    for (const url of providers) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!res.ok) continue;

            const data = await res.json();
            const ip = data.ip || data.query;

            if (ip) {
                cachedClientIp = ip;
                const city = data.city || '';
                const country = data.country || data.country_name || '';
                cachedLocation = city && country ? `${city}, ${country}` : (country || '');
                return;
            }
        } catch {
            // Silently try next provider
        }
    }
};

api.interceptors.request.use((config) => {
    const token = Cookies.get('access_token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    const companyId = Cookies.get('x-company-id');
    const branchId = Cookies.get('x-branch-id');
    const userRoleLevel = Number(Cookies.get('user_role_level') || 0);
    const isPlatformAdmin = userRoleLevel >= 5;

    if (!isPlatformAdmin) {
        if (companyId) config.headers['x-company-id'] = companyId;
        if (branchId) config.headers['x-branch-id'] = branchId;
    } else if (companyId || branchId) {
        Cookies.remove('x-company-id', { path: '/' });
        Cookies.remove('x-branch-id', { path: '/' });
    }

    if (cachedClientIp) {
        config.headers['x-Agaran-client-ip'] = cachedClientIp;
    } else if (!ipDetectionPromise) {
        ipDetectionPromise = detectClientIp();
    }

    if (typeof window !== 'undefined') {
        let fingerprint = localStorage.getItem('Agaran_fingerprint');
        if (!fingerprint) {
            fingerprint = `dk_${Math.random().toString(36).substring(2, 15)}_${Date.now().toString(36)}`;
            localStorage.setItem('Agaran_fingerprint', fingerprint);
        }
        config.headers['x-device-fingerprint'] = fingerprint;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && error.response?.data?.error?.code === 'SESSION_EXPIRED') {
            Cookies.remove('access_token', { path: '/' });
            Cookies.remove('refresh_token', { path: '/' });
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
