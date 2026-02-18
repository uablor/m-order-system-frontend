import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/store/auth.store';
import { authRepository } from '@/infrastructure/repositories/auth.repository';
import type { LoginDto } from '@/application/dto/auth.dto';
import { handleApiError } from '@/shared/utils/error';
import { storeToRefs } from 'pinia';

export function useAuth() {
  const authStore = useAuthStore();
  const { token, user, isAuthenticated, roleName } = storeToRefs(authStore);
  const router = useRouter();
  const { t } = useI18n();
  const loading = ref(false);

  /**
   * Login
   */
  const login = async (credentials: LoginDto) => {
    loading.value = true;
    try {
      const response = await authRepository.login(credentials);
      if (response?.access_token) {
        // Set token และ user (ถ้ามี)
        authStore.setToken(response.access_token);
        if (response.user) {
          // แปลง shape ให้ตรงกับ User entity ของ frontend
          authStore.setUser({
            id: response.user.userId,
            email: response.user.email,
            fullName: response.user.fullName,
            roleId: response.user.roleId,
            roleName: response.user.roleName,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: null,
          } as any);
        }

        // Redirect ตาม role (backend ใช้ role เป็นตัวพิมพ์เล็ก: superadmin, admin, admin_merchant, employee_merchant)
        // ใช้ role จาก JWT payload เป็นหลัก เพื่อความชัวร์
        const role = authStore.roleName?.toLowerCase?.() || '';

        if (role === 'superadmin' || role === 'admin') {
          authStore.setLayout('superAdmin');
          await router.push({ name: 'super-admin-merchants' });
        } else if (role === 'admin_merchant' || role === 'employee_merchant') {
          authStore.setLayout('merchant');
          await router.push({ name: 'merchant-dashboard' });
        } else if (role === 'customer') {
          authStore.setLayout('customer');
          await router.push({ name: 'customer-item-arrived' });
        } else {
          // fallback ถ้าไม่รู้ role ให้เข้าฝั่ง super admin ไว้ก่อน (กัน user ค้างหน้า login)
          authStore.setLayout('superAdmin');
          await router.push({ name: 'super-admin-merchants' });
        }

        message.success(t('login.success'));
      }
    } catch (error) {
      handleApiError(error, t);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    loading.value = true;
    try {
      await authRepository.logout();
      authStore.clearAuth();
      await router.push({ name: 'login' });
      message.success(t('logout.success'));
    } catch (error) {
      handleApiError(error, t);
      // Force logout anyway
      authStore.clearAuth();
      await router.push({ name: 'login' });
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get current user
   */
  const getMe = async () => {
    if (!isAuthenticated.value) return;
    
    loading.value = true;
    try {
      const response = await authRepository.me();
      const profile = response?.results?.[0];
      if (profile) {
        authStore.setUser({
          id: profile.userId,
          email: profile.email,
          fullName: profile.fullName,
          roleId: profile.roleId,
          roleName: profile.roleName,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLogin: null,
        } as any);
      }
    } catch (error) {
      handleApiError(error, t);
      authStore.clearAuth();
      await router.push({ name: 'login' });
    } finally {
      loading.value = false;
    }
  };

  return {
    loading: computed(() => loading.value),
    token,
    user,
    isAuthenticated,
    roleName,
    login,
    logout,
    getMe,
  };
}
