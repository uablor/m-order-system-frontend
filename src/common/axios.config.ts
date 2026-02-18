import axios from 'axios';
import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import router from '@/router';
import { deleteCookie, getCookie } from '@/shared/utils/cookie';

const envBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
const isLocalBackendUrl =
  envBaseUrl === 'http://localhost:4000' ||
  envBaseUrl === 'http://127.0.0.1:4000';

const defaultBaseUrl =
  // โหมด dev ถ้าชี้ local backend ให้ผ่าน Vite proxy เพื่อตัด preflight/CORS
  (import.meta.env.DEV && (!envBaseUrl || isLocalBackendUrl))
    ? '/api'
    : (envBaseUrl || 'http://localhost:4000');

const api: AxiosInstance = axios.create({
  baseURL: defaultBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const ACCESS_TOKEN_COOKIE_KEY = 'access_token';

// Request Interceptor - เพิ่ม token
api.interceptors.request.use(
  (config) => {
    const rawToken = getCookie(ACCESS_TOKEN_COOKIE_KEY).trim();
    const token =
      rawToken && rawToken !== 'undefined' && rawToken !== 'null'
        ? rawToken.replace(/^Bearer\s+/i, '')
        : '';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - จัดการ error
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      // ใช้ axios.isAxiosError เพื่อเช็กแบบ runtime (หลีกเลี่ยงการใช้ type เป็น value)
      if (axios.isAxiosError(error) && error.response) {
        if (status === 401) {
          deleteCookie(ACCESS_TOKEN_COOKIE_KEY);
          localStorage.removeItem('app-layout');
          router.push({ name: 'login' });
        }
      }
    } else if (error.request) {
      console.error('❌ Network error — server not reachable.');
    } else {
      console.error('Unexpected error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
