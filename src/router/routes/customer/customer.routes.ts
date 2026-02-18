import type { RouteRecordRaw } from 'vue-router';

export const CustomerRoute: RouteRecordRaw[] = [
  {
    path: '/customer/item-arrived',
    name: 'customer-item-arrived',
    component: () => import('@/presentation/views/customer/ItemArrivedPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/customer/message',
    name: 'customer-message',
    component: () => import('@/presentation/views/customer/MessagePage.vue'),
    meta: { requiresAuth: true },
  },
];

