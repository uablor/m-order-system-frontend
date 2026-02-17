import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../store/auth.store';

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: () => import('../views/auth/LoginPage.vue'), meta: { skipAuth: true } },
  { path: '/register', name: 'register', component: () => import('../views/auth/RegisterPage.vue'), meta: { skipAuth: true } },
  { path: '/dashboard', redirect: '/super-admin/dashboard' },

  // SuperAdmin
  { path: '/super-admin/dashboard', name: 'super-admin-dashboard', component: () => import('../presentation/views/super-admin/DashboardPage.vue'), meta: { requiresAuth: true } },
  { path: '/super-admin/merchants', name: 'super-admin-merchants', component: () => import('../presentation/views/super-admin/MerchantsPage.vue'), meta: { requiresAuth: true } },
  { path: '/super-admin/reports', name: 'super-admin-reports', component: () => import('../presentation/views/super-admin/ReportsPage.vue'), meta: { requiresAuth: true } },
  { path: '/super-admin/notifications', name: 'super-admin-notifications', component: () => import('../presentation/views/super-admin/NotificationsPage.vue'), meta: { requiresAuth: true } },
  { path: '/super-admin/settings', name: 'super-admin-settings', component: () => import('../presentation/views/super-admin/SettingsPage.vue'), meta: { requiresAuth: true } },

  // Merchant
  { path: '/merchant/dashboard', name: 'merchant-dashboard', component: () => import('../presentation/views/merchant/DashboardPage.vue'), meta: { requiresAuth: true } },
  { path: '/merchant/customers', name: 'merchant-customers', component: () => import('../presentation/views/merchant/CustomersPage.vue'), meta: { requiresAuth: true } },
  { path: '/merchant/stock-order', name: 'merchant-stock-order', component: () => import('../presentation/views/merchant/StockOrderPage.vue'), meta: { requiresAuth: true } },
  { path: '/merchant/item-arrived', name: 'merchant-item-arrived', component: () => import('../presentation/views/merchant/ItemArrivedPage.vue'), meta: { requiresAuth: true } },
  { path: '/merchant/notify-arrival', name: 'merchant-notify-arrival', component: () => import('../presentation/views/merchant/NotifyArrivalPage.vue'), meta: { requiresAuth: true } },
  { path: '/merchant/payment', name: 'merchant-payment', component: () => import('../presentation/views/merchant/PaymentPage.vue'), meta: { requiresAuth: true } },
  { path: '/merchant/reports', name: 'merchant-reports', component: () => import('../presentation/views/merchant/ReportsPage.vue'), meta: { requiresAuth: true } },

  // Customer
  { path: '/customer/item-arrived', name: 'customer-item-arrived', component: () => import('../presentation/views/customer/ItemArrivedPage.vue'), meta: { requiresAuth: true } },
  { path: '/customer/message', name: 'customer-message', component: () => import('../presentation/views/customer/MessagePage.vue'), meta: { requiresAuth: true } },

  // 404
  { path: '/:pathMatch(.*)*', name: 'not-found', redirect: '/not-found' },
  { path: '/not-found', name: 'not-found-page', component: () => import('../components/ui/NotFound.vue'), meta: { skipAuth: true } },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

const LAYOUT_KEY = 'app-layout';

router.beforeEach((to, _from, next) => {
  const isAuthenticated = localStorage.getItem('access_token');
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.meta.skipAuth && isAuthenticated) {
    const layout = localStorage.getItem(LAYOUT_KEY) || 'superAdmin';
    const defaultRoute = layout === 'merchant' ? '/merchant/dashboard' : layout === 'customer' ? '/customer/item-arrived' : '/super-admin/dashboard';
    next(defaultRoute);
  } else if (to.meta.requiresAuth && isAuthenticated) {
    // Sync layout from route so header switcher shows correct value
    const authStore = useAuthStore();
    if (to.path.startsWith('/super-admin')) {
      authStore.setLayout('superAdmin');
    } else if (to.path.startsWith('/merchant')) {
      authStore.setLayout('merchant');
    } else if (to.path.startsWith('/customer')) {
      authStore.setLayout('customer');
    }
    next();
  } else {
    next();
  }
});

export default router;
