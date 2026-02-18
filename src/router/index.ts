import { createRouter, createWebHistory } from 'vue-router';
import { authGuard } from './guards/auth.guard';
import { AuthRoute } from './routes/auth/auth.routes';
import { SuperAdminRoute } from './routes/super-admin/super-admin.routes';
import { MerchantRoute } from './routes/merchant/merchant.routes';
import { CustomerRoute } from './routes/customer/customer.routes';
import { MiscRoute } from './routes/misc/misc.routes';

const routes = [
  ...AuthRoute,
  ...SuperAdminRoute,
  ...MerchantRoute,
  ...CustomerRoute,
  ...MiscRoute,
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(authGuard);

export default router;
