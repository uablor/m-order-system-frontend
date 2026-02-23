<template>
  <a-layout-header class="header">
    <div class="header-left">
      <a-button
        v-if="showTriggerButton"
        type="text"
        class="header-interactive-btn trigger-btn"
        @click="$emit('toggle-sidebar')"
      >
        <MenuFoldOutlined v-if="!collapsed" />
        <MenuUnfoldOutlined v-else />
      </a-button>

      <h3 v-if="showPageTitle" class="page-title">{{ pageTitle }}</h3>

      <!-- Super Admin: move sidebar menus into header (no overflow "...") -->
      <div v-if="isSuperAdminRoute && !isMobile" class="sa-nav-wrap">
        <a-button
          v-for="item in superAdminMenuItems"
          :key="item.key"
          type="text"
          class="sa-nav-btn"
          :class="{ active: item.key === superAdminSelectedKey }"
          @click="goSuperAdmin(item.path)"
        >
          <component :is="item.icon" />
          <span class="sa-nav-label">{{ item.label }}</span>
        </a-button>
      </div>
    </div>

    <div class="header-right">
      
      <a-space :size="5">
       
        <!-- Language Switcher -->
        <a-dropdown>
          <a-button type="text" class="header-interactive-btn lang-btn">
            <GlobalOutlined />
            <span class="lang-text">{{ currentLocale.toUpperCase() }}</span>
          </a-button>
          <template #overlay>
            <a-menu @click="handleLanguageChange">
              <a-menu-item key="en"><span>🇬🇧 English</span></a-menu-item>
              <a-menu-item key="la"><span>🇹🇭 ພາສາລາວ</span></a-menu-item>
              <a-menu-item key="th"><span>🇱🇦 ภาษาไทย</span></a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>

        <!-- Notifications -->
        <div v-if="showNotifications" class="notification-wrap">
          <a-badge :count="5" :offset="[-2, 6]">
            <a-button type="text" class="header-interactive-btn icon-btn">
              <BellOutlined />
            </a-button>
          </a-badge>
        </div>

         <!-- User Profile -->
         <a-dropdown v-if="showUserDropdown">
          <a-button type="text" class="header-interactive-btn user-btn">
            <a-avatar :size="25" style="background-color: #1890ff">
              <template #icon><UserOutlined /></template>
            </a-avatar>
            <span class="username">{{ username }}</span>
            <!-- <DownOutlined /> -->
          </a-button>
          <template #overlay>
            <a-menu @click="handleUserMenuClick">
              <a-menu-item key="profile"><UserOutlined /><span>Profile</span></a-menu-item>
             <!-- <a-menu-item key="settings"><SettingOutlined /><span>Settings</span></a-menu-item>  -->
              <a-menu-divider />
              <a-menu-item key="logout">
                <LogoutOutlined /><span>{{ $t('dashboard.logout') }}</span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </a-space>
    </div>

    <!-- Super Admin mobile drawer menu -->
    <a-drawer
      v-if="isSuperAdminRoute && isMobile"
      placement="left"
      :open="superAdminDrawerOpen"
      :width="280"
      :closable="false"
      :body-style="{ padding: '0' }"
      @close="closeSuperAdminDrawer"
    >
      <div class="sa-drawer-head">
        <div class="sa-drawer-title">{{ $t('menus.superAdmin.settings') }}</div>
      </div>
      <a-menu :selected-keys="[superAdminSelectedKey]" mode="inline" @click="handleSuperAdminDrawerClick">
        <a-menu-item v-for="item in superAdminMenuItems" :key="item.key">
          <component :is="item.icon" />
          <span>{{ item.label }}</span>
        </a-menu-item>
      </a-menu>
    </a-drawer>

    <!-- Profile modal -->
    <ProfileModal :open="profileModalOpen" @close="profileModalOpen = false" />
  </a-layout-header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  MenuFoldOutlined, MenuUnfoldOutlined, GlobalOutlined, BellOutlined,
  UserOutlined, LogoutOutlined,
} from '@ant-design/icons-vue';
import { useAuthStore } from '../../../store/auth.store';
import { message } from 'ant-design-vue';
import { useAuth } from '@/shared/composables/useAuth';
import ProfileModal from './ProfileModal.vue';
import { useIsMobile } from '@/shared/composables/useIsMobile';
import { getMenuItems } from '@/components/layouts/superAdmin-layouts/menuItem';

const props = defineProps<{
  collapsed: boolean;
  pageTitle: string;
}>();

const emit = defineEmits<{ (e: 'toggle-sidebar'): void }>();

const router = useRouter();
const route = useRoute();
const { locale } = useI18n();
const authStore = useAuthStore();
useAuth();
const { isMobile } = useIsMobile();

const currentLocale = computed(() => locale.value);
const username = computed(() => authStore.user?.fullName || authStore.user?.email || 'Admin');
const isSuperAdminRoute = computed(() => route.path.startsWith('/super-admin'));

const { t } = useI18n();
const superAdminMenuItems = computed(() => getMenuItems(t));
const superAdminSelectedKey = computed(() => route.path.split('/')[2] || 'dashboard');

const goSuperAdmin = (path: string) => {
  router.push(path);
};

const superAdminDrawerOpen = computed(() => isSuperAdminRoute.value && isMobile.value && !props.collapsed);

const emitToggleSidebar = () => emit('toggle-sidebar');

const closeSuperAdminDrawer = () => {
  if (!superAdminDrawerOpen.value) return;
  emitToggleSidebar();
};

const handleSuperAdminDrawerClick = async (info: any) => {
  const item = superAdminMenuItems.value.find((m) => m.key === info.key);
  if (!item) return;
  await router.push(item.path);
  closeSuperAdminDrawer();
};

const showTriggerButton = computed(() => {
  // merchant/customer ยังใช้ปุ่มนี้เปิด sidebar/drawer ได้ตามเดิม
  if (!isSuperAdminRoute.value) return true;
  // superadmin: ใช้ปุ่มนี้เปิด drawer เมนูด้านข้าง (mobile)
  return isMobile.value;
});

const showPageTitle = computed(() => {
  // superadmin desktop มีเมนูอยู่แล้ว ไม่ต้องซ้ำ pageTitle และช่วยเพิ่มพื้นที่ไม่ให้เมนูยุบเป็น "..."
  if (isSuperAdminRoute.value && !isMobile.value) return false;
  return true;
});

const handleLanguageChange = ({ key }: { key: string }) => {
  locale.value = key;
  localStorage.setItem('app-locale', key);
  message.success('Language changed');
};

const handleLogout = async () => {
  // ล็อกเอาท์ฝั่ง UI: เคลียร์ token/user แล้วเด้งไปหน้า login
  authStore.clearAuth();
  message.success('Logged out');
  router.push('/login');
};

const profileModalOpen = ref(false);

const handleUserMenuClick = async ({ key }: { key: string }) => {
  if (key === 'profile') {
    profileModalOpen.value = true;
    return;
  }
  if (key === 'logout') {
    await handleLogout();
  }
};

const showNotifications = computed(() => {
  return true;
});

const showUserDropdown = computed(() => {
  return true;
});
</script>

<style scoped>
.header { background: #fff; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 8px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 10; }
.header-left { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1; flex-wrap: wrap; row-gap: 6px; }
.page-title { margin: 0; font-size: 18px; font-weight: 600; color: #262626; }
.header-interactive-btn { cursor: pointer; border: none !important; outline: none !important; box-shadow: none !important; }
.header-interactive-btn:hover, .header-interactive-btn:focus { background: rgba(24,144,255,0.12) !important; }
.lang-btn { display: flex; align-items: center; gap: 8px; }
.notification-wrap { display: inline-flex; margin-bottom: 22px; }
.user-btn { display: flex; align-items: center; gap: 8px; }
.username { font-size: 14px; font-weight: 500; color: #262626; }
.sa-nav-wrap { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.sa-nav-btn {
  height: 40px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;

}
.sa-nav-btn.active {
  background: rgba(24, 144, 255, 0.12) !important;
  color: #1677ff;
  font-weight: 700;
}
.sa-nav-label { white-space: nowrap; }
.sa-drawer-head { padding: 12px 16px; border-bottom: 1px solid rgba(148,163,184,0.25); }
.sa-drawer-title { font-weight: 700; color: #0f172a; }
@media (max-width: 768px) { .page-title, .username, .lang-text { display: none; } }
</style>
