import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { LayoutType } from '../shared/constants/layout';
import type { AuthPayload, User } from '@/domain/entities/user.entity';
import { decodeJwt } from '@/shared/utils/decodeJwt';
import { deleteCookie, getCookie, setCookie } from '@/shared/utils/cookie';

const LAYOUT_KEY = 'app-layout';
const ACCESS_TOKEN_COOKIE_KEY = 'access_token';
const ACCESS_TOKEN_COOKIE_MAX_AGE_SEC = 7 * 24 * 60 * 60;

export const useAuthStore = defineStore('authStore', () => {
  const token = ref(getCookie(ACCESS_TOKEN_COOKIE_KEY) || '');
  const user = ref<User | null>(null);
  const currentLayout = ref<LayoutType>((localStorage.getItem(LAYOUT_KEY) as LayoutType) || 'superAdmin');

  const isAuthenticated = computed(() => !!token.value);

  const authPayload = computed<AuthPayload | null>(() => {
    return decodeJwt(token.value);
  });

  const roleName = computed(() => authPayload.value?.roleName || '');

  const setToken = (newToken: string) => {
    const normalizedToken = (newToken || '').trim().replace(/^Bearer\s+/i, '');
    token.value = normalizedToken;
    setCookie(ACCESS_TOKEN_COOKIE_KEY, normalizedToken, {
      maxAgeSeconds: ACCESS_TOKEN_COOKIE_MAX_AGE_SEC,
      secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
      sameSite: 'Lax',
    });
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
    localStorage.removeItem(LAYOUT_KEY);
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
