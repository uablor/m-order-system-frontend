import type { RouteRecordRaw } from 'vue-router';

export const MerchantRoute: RouteRecordRaw[] = [
  {
    path: '/merchant/dashboard',
    name: 'merchant-dashboard',
    component: () => import('@/presentation/views/merchant/dashboard/DashboardPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/merchant/customers',
    name: 'merchant-customers',
    component: () => import('@/presentation/views/merchant/customers/CustomersPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/merchant/customers/create',
    name: 'merchant-customers-create',
    component: () => import('@/presentation/views/merchant/customers/CustomerCreatePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/merchant/customers/:id/edit',
    name: 'merchant-customers-edit',
    component: () => import('@/presentation/views/merchant/customers/CustomerEditPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/merchant/stock-order',
    name: 'merchant-stock-order',
    component: () => import('@/presentation/views/merchant/stockOrders/StockOrderPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/merchant/notifications',
    name: 'merchant-notifications',
    component: () => import('@/presentation/views/merchant/notifications/NotificationsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/merchant/payment',
    name: 'merchant-payment',
    component: () => import('@/presentation/views/merchant/payments/PaymentPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/merchant/exchange-rates',
    name: 'merchant-exchange-rates',
    component: () => import('@/presentation/views/merchant/exchangerate/ExchangeRatePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/merchant/reports',
    name: 'merchant-reports',
    component: () => import('@/presentation/views/merchant/reports/ReportsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/merchant/orders',
    name: 'merchant-orders',
    component: () => import('@/presentation/views/merchant/orders/OrdersPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/merchant/orders/:id',
    name: 'merchant-order-detail',
    component: () => import('@/presentation/views/merchant/orders/OrderDetailPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/merchant/team',
    name: 'merchant-team',
    component: () => import('@/presentation/views/merchant/manageUser/MerchantUsersPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/merchant/arrivals',
    name: 'merchant-arrivals',
    component: () => import('@/presentation/views/merchant/arrivals/ArrivalsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/merchant/arrivals/:id',
    name: 'merchant-arrival-detail',
    component: () => import('@/presentation/views/merchant/arrivals/ArrivalDetailPage.vue'),
    meta: { requiresAuth: true },
  },
];
