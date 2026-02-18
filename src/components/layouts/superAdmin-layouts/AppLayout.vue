<template>
  <a-layout class="app-layout">
    <a-layout :style="{ marginRight: '0px' }">
      <HeaderWithLayoutSwitcher
        :collapsed="collapsed"
        :page-title="pageTitle"
        @toggle-sidebar="toggleSidebar"
      />
      <a-layout-content class="content">
        <div class="content-wrapper">
          <slot />
        </div>
      </a-layout-content>
      <FooterLayout />
    </a-layout>

    <!-- Super Admin mobile bottom navigation -->
    <SuperAdminBottomNav v-if="isMobile" />
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import HeaderWithLayoutSwitcher from '../shared/HeaderWithLayoutSwitcher.vue';
import FooterLayout from '../shared/FooterLayout.vue';
import { useIsMobile } from '../../../shared/composables/useIsMobile';
import SuperAdminBottomNav from './SuperAdminBottomNav.vue';

const collapsed = ref(false);
const route = useRoute();
const { t } = useI18n();
const { isMobile } = useIsMobile();

watch(isMobile, (val) => {
  // superadmin: ใช้ collapsed เป็นสถานะเปิด/ปิด "เมนูใน header (mobile drawer)"
  if (val) collapsed.value = true; // drawer closed by default
});

const pathToMenuKey: Record<string, string> = {
  merchants: 'merchantManagement',
  users: 'users',
  settings: 'settings',
};
const pageTitle = computed(() => {
  const parts = route.path.split('/');
  const pathKey = parts[2] || 'merchants';
  const menuKey = pathToMenuKey[pathKey] || pathKey;
  return t(`menus.superAdmin.${menuKey}`) || t('menus.superAdmin.merchantManagement');
});

const toggleSidebar = () => { collapsed.value = !collapsed.value; };
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.content {
  margin: 24px 16px;
  padding: 24px;
  min-height: calc(100vh - 64px - 70px - 48px);
  background: #fff;
  border-radius: 8px;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .content {
    margin: 16px 8px;
    padding: 16px;
    padding-bottom: 96px; /* กันโดน bottom nav บัง */
  }
}
</style>
