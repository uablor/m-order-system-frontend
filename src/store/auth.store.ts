import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { LayoutType } from '../shared/constants/layout';

const LAYOUT_KEY = 'app-layout';

export const useAuthStore = defineStore('authStore', () => {
  const token = ref(localStorage.getItem('access_token') || '');
  const user = ref<any>(null);
  const currentLayout = ref<LayoutType>((localStorage.getItem(LAYOUT_KEY) as LayoutType) || 'superAdmin');

  const isAuthenticated = computed(() => !!token.value);

  const setLayout = (layout: LayoutType) => {
    currentLayout.value = layout;
    localStorage.setItem(LAYOUT_KEY, layout);
  };

  const login = (username: string, password: string) => {
    console.log('Login attempt:', { username, password });
    // Simulate login - replace with actual API call
    const mockToken = 'mock-token-' + Date.now();
    token.value = mockToken;
    localStorage.setItem('access_token', mockToken);
    user.value = { username };
  };
  
  const register = (email: string, username: string, password: string) => {
    console.log('Register attempt:', { email, username, password });
    // Simulate registration - replace with actual API call
    const mockToken = 'mock-token-' + Date.now();
    token.value = mockToken;
    localStorage.setItem('access_token', mockToken);
    user.value = { email, username };
  };
  
  const logout = () => {
    token.value = '';
    user.value = null;
    localStorage.removeItem('access_token');
  };
  
  return {
    token,
    user,
    currentLayout,
    isAuthenticated,
    setLayout,
    login,
    register,
    logout,
  };
});
