<template>
  <a-layout-header class="header">
    <div class="header-left">
      <h3 class="page-title">{{ pageTitle }}</h3>
    </div>

    <div class="header-right">
      <a-space :size="16">
        <!-- Layout Selector -->
        <a-dropdown>
          <a-button type="text" class="header-interactive-btn layout-btn">
            <AppstoreOutlined />
            <span class="layout-text">{{ $t(LAYOUT_LABELS[currentLayout]) }}</span>
            <DownOutlined />
          </a-button>
          <template #overlay>
            <a-menu @click="handleLayoutChange">
              <a-menu-item key="superAdmin">
                <span>{{ $t('layout.superAdmin') }}</span>
              </a-menu-item>
              <a-menu-item key="merchant">
                <span>{{ $t('layout.merchant') }}</span>
              </a-menu-item>
              <a-menu-item key="customer">
                <span>{{ $t('layout.customer') }}</span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>

        <!-- Language Switcher -->
        <a-dropdown>
          <a-button type="text" class="header-interactive-btn lang-btn">
            <GlobalOutlined />
            <span class="lang-text">{{ currentLocale.toUpperCase() }}</span>
          </a-button>
          <template #overlay>
            <a-menu @click="handleLanguageChange">
              <a-menu-item key="en"><span>English</span></a-menu-item>
              <a-menu-item key="la"><span>ພາສາລາວ</span></a-menu-item>
              <a-menu-item key="th"><span>ภาษาไทย</span></a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>

        <!-- Notifications -->
        <div class="notification-wrap">
          <a-badge :count="5" :offset="[-2, 6]">
            <a-button type="text" class="header-interactive-btn icon-btn">
              <BellOutlined />
            </a-button>
          </a-badge>
        </div>

        <!-- User Profile -->
        <a-dropdown>
          <a-button type="text" class="header-interactive-btn user-btn">
            <a-avatar :size="32" style="background-color: #1890ff">
              <template #icon><UserOutlined /></template>
            </a-avatar>
            <span class="username">{{ username }}</span>
            <DownOutlined />
          </a-button>
          <template #overlay>
            <a-menu>
              <a-menu-item key="profile"><UserOutlined /><span>Profile</span></a-menu-item>
              <a-menu-item key="settings"><SettingOutlined /><span>Settings</span></a-menu-item>
              <a-menu-divider />
              <a-menu-item key="logout" @click="handleLogout">
                <LogoutOutlined /><span>{{ $t('dashboard.logout') }}</span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>

        <a-button type="text" class="header-interactive-btn trigger-btn" @click="$emit('toggle-sidebar')">
          <MenuFoldOutlined v-if="!collapsed" />
          <MenuUnfoldOutlined v-else />
        </a-button>
      </a-space>
    </div>
  </a-layout-header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  MenuFoldOutlined, MenuUnfoldOutlined, GlobalOutlined, BellOutlined,
  UserOutlined, SettingOutlined, LogoutOutlined, DownOutlined, AppstoreOutlined,
} from '@ant-design/icons-vue';
import { useAuthStore } from '../../../store/auth.store';
import { LAYOUT_LABELS } from '../../../shared/constants/layout';
import type { LayoutType } from '../../../shared/constants/layout';
import { message } from 'ant-design-vue';

const props = defineProps<{
  collapsed: boolean;
  pageTitle: string;
  currentLayout: LayoutType;
}>();

defineEmits<{ (e: 'toggle-sidebar'): void }>();

const router = useRouter();
const { locale } = useI18n();
const authStore = useAuthStore();

const currentLocale = computed(() => locale.value);
const username = computed(() => authStore.user?.username || 'Admin');

const handleLayoutChange = ({ key }: { key: string }) => {
  authStore.setLayout(key as LayoutType);
  const routes: Record<LayoutType, string> = {
    superAdmin: '/super-admin/dashboard',
    merchant: '/merchant/dashboard',
    customer: '/customer/item-arrived',
  };
  router.push(routes[key as LayoutType]);
};

const handleLanguageChange = ({ key }: { key: string }) => {
  locale.value = key;
  localStorage.setItem('app-locale', key);
  message.success('Language changed');
};

const handleLogout = () => {
  authStore.logout();
  message.success('Logged out');
  router.push('/login');
};
</script>

<style scoped>
.header { background: #fff; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 8px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 10; }
.page-title { margin: 0; font-size: 18px; font-weight: 600; color: #262626; }
.header-interactive-btn { cursor: pointer; border: none !important; outline: none !important; box-shadow: none !important; }
.header-interactive-btn:hover, .header-interactive-btn:focus { background: rgba(24,144,255,0.12) !important; }
.layout-btn, .lang-btn { display: flex; align-items: center; gap: 8px; }
.notification-wrap { display: inline-flex; }
.user-btn { display: flex; align-items: center; gap: 8px; }
.username { font-size: 14px; font-weight: 500; color: #262626; }
@media (max-width: 768px) { .page-title, .username, .lang-text, .layout-text { display: none; } }
</style>
