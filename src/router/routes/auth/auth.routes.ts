import type { RouteRecordRaw } from 'vue-router';

export const AuthRoute: RouteRecordRaw[] = [
  { path: '/', redirect: '/login' },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginPage.vue'),
    meta: { skipAuth: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterPage.vue'),
    meta: { skipAuth: true },
  },
  { path: '/dashboard', redirect: '/super-admin/dashboard' },
];

