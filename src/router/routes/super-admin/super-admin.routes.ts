import type { RouteRecordRaw } from 'vue-router';

export const SuperAdminRoute: RouteRecordRaw[] = [
  {
    path: '/super-admin',
    component: () => import('@/presentation/views/super-admin/SuperAdminRouteLayout.vue'),
    meta: { requiresAuth: true, roles: ['superadmin'] },
    children: [
      {
        path: '',
        redirect: { name: 'super-admin-merchants' },
      },
      {
        path: 'users',
        name: 'super-admin-users',
        component: () => import('@/presentation/views/super-admin/UsersPage.vue'),
      },
      {
        path: 'users/create-merchant',
        name: 'super-admin-users-create-merchant',
        component: () => import('@/presentation/views/super-admin/UserMerchantCreatePage.vue'),
      },
      {
        path: 'merchants',
        name: 'super-admin-merchants',
        component: () => import('@/presentation/views/super-admin/MerchantsPage.vue'),
      },
      {
        path: 'merchants/create',
        name: 'super-admin-merchants-create',
        component: () => import('@/presentation/views/super-admin/MerchantCreatePage.vue'),
      },
      {
        path: 'merchants/:id/edit',
        name: 'super-admin-merchants-edit',
        component: () => import('@/presentation/views/super-admin/MerchantEditPage.vue'),
      },
      {
        path: 'settings',
        name: 'super-admin-settings',
        component: () => import('@/presentation/components/super-admin/SettingsContent.vue'),
      },
    ],
  },
];

