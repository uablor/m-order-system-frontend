import type { RouteRecordRaw } from 'vue-router';

export const MerchantRoute: RouteRecordRaw[] = [
  {
    path: '/merchant/dashboard',
    name: 'merchant-dashboard',
    component: () => import('@/presentation/views/merchant/DashboardPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/merchant/customers',
    name: 'merchant-customers',
    component: () => import('@/presentation/views/merchant/CustomersPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/merchant/customers/create',
    name: 'merchant-customers-create',
    component: () => import('@/presentation/views/merchant/CustomerCreatePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/merchant/customers/:id/edit',
    name: 'merchant-customers-edit',
    component: () => import('@/presentation/views/merchant/CustomerEditPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/merchant/stock-order',
    name: 'merchant-stock-order',
    component: () => import('@/presentation/views/merchant/StockOrderPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/merchant/item-arrived',
    name: 'merchant-item-arrived',
    component: () => import('@/presentation/views/merchant/ItemArrivedPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/merchant/notify-arrival',
    name: 'merchant-notify-arrival',
    component: () => import('@/presentation/views/merchant/NotifyArrivalPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/merchant/payment',
    name: 'merchant-payment',
    component: () => import('@/presentation/views/merchant/PaymentPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/merchant/exchange-rates',
    name: 'merchant-exchange-rates',
    component: () => import('@/presentation/views/merchant/ExchangeRatePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/merchant/reports',
    name: 'merchant-reports',
    component: () => import('@/presentation/views/merchant/ReportsPage.vue'),
    meta: { requiresAuth: true },
  },
];

