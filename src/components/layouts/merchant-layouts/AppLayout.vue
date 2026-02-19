<template>
  <a-layout class="app-layout">
    <a-layout :style="{ marginRight: contentMarginRight, transition: 'margin-right 0.2s' }">
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
    <SidebarLayout
      v-if="!isMobile"
      :collapsed="collapsed"
      @update:collapsed="collapsed = $event"
    />

    <a-drawer
      v-else
      placement="right"
      :open="!collapsed"
      :width="260"
      :closable="false"
      :body-style="{ padding: '0', background: '#001529' }"
      @close="collapsed = true"
    >
      <DrawerSidebar @navigate="collapsed = true" />
    </a-drawer>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import SidebarLayout from './SidebarLayout.vue';
import DrawerSidebar from './DrawerSidebar.vue';
import HeaderWithLayoutSwitcher from '../shared/HeaderWithLayoutSwitcher.vue';
import FooterLayout from '../shared/FooterLayout.vue';
import { useIsMobile } from '../../../shared/composables/useIsMobile';

const collapsed = ref(false);
const route = useRoute();
const { t } = useI18n();
const { isMobile } = useIsMobile();

watch(isMobile, (val) => {
  if (val) collapsed.value = true; // drawer closed by default
});

const contentMarginRight = computed(() => {
  if (isMobile.value) return '0px';
  return collapsed.value ? '80px' : '250px';
});

const pathToMenuKey: Record<string, string> = {
  dashboard: 'dashboard',
  customers: 'customerManagement',
  'stock-order': 'stockOrder',
  'item-arrived': 'itemArrived',
  'notify-arrival': 'notifyArrival',
  payment: 'payment',
  'exchange-rates': 'exchangeRates',
  reports: 'reports',
};
const pageTitle = computed(() => {
  const pathKey = route.path.split('/').pop() || 'dashboard';
  const menuKey = pathToMenuKey[pathKey] || pathKey;
  return t(`menus.merchant.${menuKey}`) || t('menus.merchant.dashboard');
});

const toggleSidebar = () => { collapsed.value = !collapsed.value; };
</script>

<style scoped>
.app-layout { min-height: 100vh; }
.content { margin: 5px 10px;  min-height: calc(100vh - 64px - 70px - 48px); background: #fff; border-radius: 8px; padding: 10px 15px; }
.content-wrapper { max-width: 1400px; margin: 0 auto; }
@media (max-width: 768px) { .content { margin: 16px 8px; padding: 16px; } }
</style>
