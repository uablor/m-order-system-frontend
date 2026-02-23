import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { AxiosError } from 'axios';
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
  /** ข้อความ error สำหรับแสดงใน login form inline */
  const loginError = ref<string | null>(null);

  /**
   * Login
   */
  const login = async (credentials: LoginDto) => {
    loading.value = true;
    loginError.value = null;
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
          await router.push({ name: 'super-admin-dashboard' });
        } else if (role === 'admin_merchant' || role === 'employee_merchant') {
          authStore.setLayout('merchant');
          await router.push({ name: 'merchant-dashboard' });
        } else if (role === 'customer') {
          authStore.setLayout('customer');
          await router.push({ name: 'customer-item-arrived' });
        } else {
          authStore.setLayout('superAdmin');
          await router.push({ name: 'super-admin-dashboard' });
        }

        message.success(t('login.success'));
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const status = error.response.status;
        const data = error.response.data as { message?: string | string[] };
        const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;

        if (status === 401 || status === 400) {
          /* รหัสผ่านหรืออีเมลผิด — แสดง inline ใน form */
          loginError.value = msg || t('login.invalidCredentials');
        } else {
          /* error อื่น — toast ตามปกติ */
          handleApiError(error, t);
        }
      } else {
        handleApiError(error, t);
      }
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

  const clearLoginError = () => { loginError.value = null; };

  return {
    loading: computed(() => loading.value),
    loginError: computed(() => loginError.value),
    clearLoginError,
    token,
    user,
    isAuthenticated,
    roleName,
    login,
    logout,
    getMe,
  };
}
