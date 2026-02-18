import { useAuthStore } from '@/store/auth.store';
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';

/**
 * Guard สำหรับตรวจสอบการ login ก่อนเข้าหน้า (route)
 * - ถ้าไปหน้า login/register แต่ login แล้ว → เด้งไป dashboard ตาม role
 * - ถ้าไปหน้าที่ต้อง auth แต่ยังไม่ login → เด้งไป login
 * - ถ้า login แล้ว → sync layout ตาม prefix ของ path
 */
export function authGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore();
  const isAuthenticated = !!authStore.token;
  const roleName = (authStore.roleName || '').toLowerCase();
  const allowedRoles = Array.isArray(to.meta.roles)
    ? (to.meta.roles as string[]).map((r) => String(r).toLowerCase())
    : null;
  const isAuthEntryRoute = to.name === 'login' || to.name === 'register';

  // redirect อัตโนมัติเฉพาะหน้า auth entry (login/register) เท่านั้น
  // เพื่อกัน redirect loop กับหน้า skipAuth อื่น ๆ เช่น forbidden/not-found
  if (isAuthEntryRoute && isAuthenticated) {
    if (roleName === 'superadmin') {
      authStore.setLayout('superAdmin');
      return next({ name: 'super-admin-dashboard' });
    }

    if (roleName === 'admin_merchant' || roleName === 'employee_merchant') {
      authStore.setLayout('merchant');
      return next({ name: 'merchant-dashboard' });
    }

    if (roleName === 'customer') {
      authStore.setLayout('customer');
      return next({ name: 'customer-item-arrived' });
    }

    // role ไม่รู้จักหรือไม่รองรับ -> ไปหน้า forbidden
    return next({ name: 'forbidden' });
  }

  // ถ้ายังไม่ login และไปหน้าที่ต้อง auth -> redirect ไป login
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'login' });
  }

  // Authorization: ถ้า route กำหนด roles ไว้ ต้องตรงกับ role ใน token
  if (to.meta.requiresAuth && isAuthenticated && allowedRoles && allowedRoles.length > 0) {
    const hasPermission = allowedRoles.includes(roleName);
    if (!hasPermission) {
      return next({ name: 'forbidden' });
    }
  }

  // ถ้า login แล้วและไปหน้าที่ต้อง auth -> sync layout
  if (to.meta.requiresAuth && isAuthenticated) {
    if (to.path.startsWith('/super-admin')) {
      authStore.setLayout('superAdmin');
    } else if (to.path.startsWith('/merchant')) {
      authStore.setLayout('merchant');
    } else if (to.path.startsWith('/customer')) {
      authStore.setLayout('customer');
    }
  }

  return next();
}

