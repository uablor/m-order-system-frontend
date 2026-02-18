import type { RouteRecordRaw } from 'vue-router';

export const MiscRoute: RouteRecordRaw[] = [
  {
    path: '/forbidden',
    name: 'forbidden',
    component: () => import('@/components/ui/Forbidden.vue'),
    meta: { skipAuth: true },
  },
  // 404
  { path: '/:pathMatch(.*)*', name: 'not-found', redirect: '/not-found' },
  {
    path: '/not-found',
    name: 'not-found-page',
    component: () => import('@/components/ui/NotFound.vue'),
    meta: { skipAuth: true },
  },
];

