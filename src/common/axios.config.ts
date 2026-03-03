import axios from 'axios';
import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import router from '@/router';
import { deleteCookie } from '@/shared/utils/cookie';
import { useAuthStore } from '@/store/auth.store';

const envBaseUrl = (import.meta.env.VITE_API_BASE_URL).trim();

const api: AxiosInstance = axios.create({
  baseURL: envBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const ACCESS_TOKEN_COOKIE_KEY = 'access_token';

/**
 * Request Interceptor
 * อ่าน token จาก Pinia store โดยตรง (น่าเชื่อถือที่สุด)
 * เรียก useAuthStore() ใน callback ไม่ใช่ตอน module init
 * จึงไม่มี circular dependency และ Pinia พร้อมใช้งานแล้วตอนนี้
 */
api.interceptors.request.use(
  (config) => {
    try {
      const authStore = useAuthStore();
      const token = (authStore.token || '').trim().replace(/^Bearer\s+/i, '');
      if (token && token !== 'undefined' && token !== 'null') {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Pinia ยังไม่ mount (กรณี SSR หรือ test เท่านั้น)
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRedirectingToLogin = false;

// Response Interceptor — จัดการ 401
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401 && !isRedirectingToLogin) {
        isRedirectingToLogin = true;
        try {
          useAuthStore().clearAuth();
        } catch { /* ignore */ }
        deleteCookie(ACCESS_TOKEN_COOKIE_KEY);
        try { localStorage.removeItem(ACCESS_TOKEN_COOKIE_KEY); } catch { /* ignore */ }
        try { localStorage.removeItem('app-layout'); } catch { /* ignore */ }

        router.push({ name: 'login' }).finally(() => {
          setTimeout(() => { isRedirectingToLogin = false; }, 3000);
        });
      }
    } else if (error.request) {
      console.error('Network error — server not reachable.');
    } else {
      console.error('Unexpected error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
