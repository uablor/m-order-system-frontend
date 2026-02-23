import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { LayoutType } from '../shared/constants/layout';
import type { AuthPayload, User } from '@/domain/entities/user.entity';
import { decodeJwt } from '@/shared/utils/decodeJwt';
import { deleteCookie, getCookie, setCookie } from '@/shared/utils/cookie';

const LAYOUT_KEY = 'app-layout';
const ACCESS_TOKEN_COOKIE_KEY = 'access_token';
const ACCESS_TOKEN_COOKIE_MAX_AGE_SEC = 7 * 24 * 60 * 60;

/** อ่าน token จากทุก storage ที่เป็นไปได้ (cookie → localStorage) */
function readInitialToken(): string {
  const fromCookie = getCookie(ACCESS_TOKEN_COOKIE_KEY).trim();
  if (fromCookie && fromCookie !== 'undefined' && fromCookie !== 'null') return fromCookie;
  try {
    const fromLs = (localStorage.getItem(ACCESS_TOKEN_COOKIE_KEY) || '').trim();
    if (fromLs && fromLs !== 'undefined' && fromLs !== 'null') return fromLs;
  } catch { /* ignore */ }
  return '';
}

export const useAuthStore = defineStore('authStore', () => {
  const token = ref(readInitialToken());
  const user = ref<User | null>(null);
  const currentLayout = ref<LayoutType>((localStorage.getItem(LAYOUT_KEY) as LayoutType) || 'superAdmin');

  const isAuthenticated = computed(() => {
    if (!token.value) return false;
    // ตรวจสอบ expiry ของ JWT ไม่ให้ผ่าน guard ด้วย token ที่ expired
    const payload = decodeJwt(token.value);
    if (!payload) return false;
    if (payload.exp && Date.now() / 1000 > payload.exp) return false;
    return true;
  });

  const authPayload = computed<AuthPayload | null>(() => {
    return decodeJwt(token.value);
  });

  const roleName = computed(() => authPayload.value?.roleName || '');

  const setToken = (newToken: string) => {
    const normalizedToken = (newToken || '').trim().replace(/^Bearer\s+/i, '');
    token.value = normalizedToken;
    // เก็บทั้ง cookie และ localStorage เพื่อความน่าเชื่อถือสูงสุด
    setCookie(ACCESS_TOKEN_COOKIE_KEY, normalizedToken, {
      maxAgeSeconds: ACCESS_TOKEN_COOKIE_MAX_AGE_SEC,
      secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
      sameSite: 'Lax',
    });
    try { localStorage.setItem(ACCESS_TOKEN_COOKIE_KEY, normalizedToken); } catch { /* ignore */ }
  };

  const setUser = (newUser: User) => {
    user.value = newUser;
  };

  const setLayout = (layout: LayoutType) => {
    currentLayout.value = layout;
    localStorage.setItem(LAYOUT_KEY, layout);
  };

  const clearAuth = () => {
    token.value = '';
    user.value = null;
    deleteCookie(ACCESS_TOKEN_COOKIE_KEY);
    try { localStorage.removeItem(ACCESS_TOKEN_COOKIE_KEY); } catch { /* ignore */ }
    try { localStorage.removeItem(LAYOUT_KEY); } catch { /* ignore */ }
  };

  return {
    token,
    user,
    currentLayout,
    isAuthenticated,
    authPayload,
    roleName,
    setToken,
    setUser,
    setLayout,
    clearAuth,
  };
});
