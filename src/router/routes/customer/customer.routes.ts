import type { RouteRecordRaw } from 'vue-router';

export const CustomerRoute: RouteRecordRaw[] = [
  {
    path: '/customer/item-arrived',
    name: 'customer-item-arrived',
    component: () => import('@/presentation/views/customer/ItemArrivedPage.vue'),
    // หน้านี้เปิดสาธารณะ — ใช้ customerToken + notificationToken จาก URL query แทน JWT
    meta: { requiresAuth: false },
  },
  {
    path: '/customer/message',
    name: 'customer-message',
    component: () => import('@/presentation/views/customer/MessagePage.vue'),
    meta: { requiresAuth: false },
  },
];

// /customer/item-arrived?customerToken=xxx&notificationToken=xxx
