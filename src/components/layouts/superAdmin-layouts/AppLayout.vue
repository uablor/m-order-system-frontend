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
  </a-layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import HeaderWithLayoutSwitcher from '../shared/HeaderWithLayoutSwitcher.vue';
import FooterLayout from '../shared/FooterLayout.vue';
import { useIsMobile } from '../../../shared/composables/useIsMobile';

const collapsed = ref(false);
const route = useRoute();
const { t } = useI18n();
const { isMobile } = useIsMobile();

watch(isMobile, (val) => {
  if (val) collapsed.value = true;
});

const pathToMenuKey: Record<string, string> = {
  dashboard: 'dashboard',
  merchants: 'merchantManagement',
  users: 'users',
  settings: 'settings',
};

const pageTitle = computed(() => {
  const parts = route.path.split('/');
  const pathKey = parts[2] || 'dashboard';
  const menuKey = pathToMenuKey[pathKey] || pathKey;
  return t(`menus.superAdmin.${menuKey}`) || t('menus.superAdmin.dashboard');
});

const toggleSidebar = () => { collapsed.value = !collapsed.value; };
</script>

<style scoped>
.app-layout { min-height: 100vh; }

.content {
  margin: 5px 10px;
  padding: 24px;
  min-height: calc(100vh - 64px - 70px - 48px);
  background: #fff;
  border-radius: 8px;
}

.content-wrapper {
  width: 100%;
  max-width: none;
  margin: 0;
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1024px) {
  .content { margin: 8px 10px; padding: 16px; }
}

/* Mobile */
@media (max-width: 767px) {
  .content { margin: 0; padding: 12px; border-radius: 0; }
}
</style>
