<template>
  <a-layout-header class="header">
    <a-space :size="4">
      <div class="header-left">
        <h3 class="page-title">{{ pageTitle }}</h3>
      </div>
    </a-space>

    <div class="header-right">
      <a-space :size="16">
        <!-- Language Switcher -->
        <a-dropdown>
          <a-button type="text" class="header-interactive-btn lang-btn">
            <GlobalOutlined />
            <span class="lang-text">{{ currentLocale.toUpperCase() }}</span>
          </a-button>
          <template #overlay>
            <a-menu @click="handleLanguageChange">
              <a-menu-item key="en">
                <span>English</span>
              </a-menu-item>
              <a-menu-item key="la">
                <span>ພາສາລາວ</span>
              </a-menu-item>
              <a-menu-item key="th">
                <span>ภาษาไทย</span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>

        <!-- Notifications: badge inside bell icon, near its head -->
        <div class="notification-wrap">
          <a-badge :count="5" :offset="[-2, 6]" class="notification-badge">
            <a-button type="text" class="header-interactive-btn icon-btn">
              <BellOutlined />
            </a-button>
          </a-badge>
        </div>

        <!-- User Profile -->
      

           <a-dropdown>
             <a-button type="text" class="header-interactive-btn user-btn">
               <a-avatar :size="32" style="background-color: #1890ff">
                 <template #icon>
                   <UserOutlined />
                 </template>
               </a-avatar>
               <span class="username">{{ username }}</span>
            
             </a-button>
             <template #overlay>
               <a-menu>
                 <a-menu-item key="profile">
                   <UserOutlined />
                   <span>Profile</span>
                 </a-menu-item>
                 <a-menu-item key="settings">
                   <SettingOutlined />
                   <span>Settings</span>
                 </a-menu-item>
                 <a-menu-divider />
                 <a-menu-item key="logout" @click="handleLogout">
                   <LogoutOutlined />
                   <span>{{ $t('dashboard.logout') }}</span>
                 </a-menu-item>
               </a-menu>
             </template>
           </a-dropdown>
         
           <a-button
             type="text"
             class="header-interactive-btn trigger-btn"
             @click="$emit('toggle-sidebar')"
           >
             <MenuFoldOutlined v-if="!collapsed" />
             <MenuUnfoldOutlined v-else />
           </a-button>
          </a-space>
    </div>
  </a-layout-header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  GlobalOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons-vue';
import { useAuthStore } from '../../../store/auth.store';
import { message } from 'ant-design-vue';

defineProps<{
  collapsed: boolean;
}>();

defineEmits<{
  (e: 'toggle-sidebar'): void;
}>();

const router = useRouter();
const route = useRoute();
const { locale, t } = useI18n();
const authStore = useAuthStore();

const currentLocale = computed(() => locale.value);
const username = computed(() => authStore.user?.username || 'Admin');
const pageTitle = computed(() => {
  const path = route.path.split('/')[1] || 'dashboard';
  return t(`dashboard.menu.${path}`) || t('dashboard.title');
});

const handleLanguageChange = ({ key }: { key: string }) => {
  locale.value = key;
  localStorage.setItem('app-locale', key);
  message.success('Language changed successfully');
};

const handleLogout = () => {
  authStore.logout();
  message.success('Logged out successfully');
  router.push('/login');
};
</script>

<style scoped>
.header {
  background: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.trigger-btn {
  font-size: 18px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.header-right {
  display: flex;
  align-items: center;
}

/* Interactive buttons: no border, blue opacity background on hover/active, cursor pointer */
.header-interactive-btn {
  cursor: pointer;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

.header-interactive-btn:hover,
.header-interactive-btn:focus {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: rgba(24, 144, 255, 0.12) !important;
}

.header-interactive-btn:active {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: rgba(24, 144, 255, 0.2) !important;
}

/* When dropdown is open (clicked) - same blue opacity, no border */
.header-interactive-btn[aria-expanded="true"] {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: rgba(24, 144, 255, 0.12) !important;
}

.icon-btn,
.lang-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.lang-btn {
  gap: 8px;
  width: auto;
  padding-left: 12px;
  padding-right: 12px;
}

.lang-text {
  font-size: 14px;
  font-weight: 500;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 12px;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

/* Notification: badge inside the bell icon, near its head (top) */
.notification-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.notification-wrap :deep(.ant-badge) {
  display: inline-flex;
}

.notification-wrap :deep(.ant-badge .ant-badge-count) {
  top: 4px;
  right: 2px;
  min-width: 16px;
  height: 16px;
  line-height: 16px;
  font-size: 10px;
  border-radius: 8px;
  transform: none;
}

@media (max-width: 768px) {
  .page-title,
  .username,
  .lang-text {
    display: none;
  }
}
</style>
