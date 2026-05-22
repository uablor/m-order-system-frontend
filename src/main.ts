import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Antd from 'ant-design-vue';
import App from './App.vue';
import router from './router';
import { i18n } from './localization/i18n.config';
import { useAuthStore } from './store/auth.store';
import { authRepository } from './infrastructure/repositories/auth.repository';
import { extractSingleResult } from './shared/types/backend-response.types';

import 'ant-design-vue/dist/reset.css';
import './style.css';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(i18n);
app.use(Antd);

app.mount('#app');

// Fetch user profile on app initialization if authenticated
const authStore = useAuthStore();
if (authStore.isAuthenticated) {
  authRepository.me()
    .then(response => {
      const profile = extractSingleResult(response);
      if (profile) {
        authStore.setUser({
          id: profile.userId,
          email: profile.email,
          fullName: profile.fullName,
          roleId: profile.roleId,
          roleName: profile.roleName,
          isActive: profile.isActive,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
          lastLogin: profile.lastLogin,
        } as any);
      }
    })
    .catch(() => {
      // If fetching profile fails, clear auth and redirect to login
      authStore.clearAuth();
      router.push('/login');
    });
}
