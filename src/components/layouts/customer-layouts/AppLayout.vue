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
      :width="240"
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
  if (val) collapsed.value = true;
});

const contentMarginRight = computed(() => {
  if (isMobile.value) return '0px';
  return collapsed.value ? '80px' : '220px';
});

const pageTitle = computed(() => {
  const key = route.path.split('/').pop() || 'item-arrived';
  const map: Record<string, string> = { 'item-arrived': 'itemArrived', 'message': 'messageToMerchant' };
  return t(`menus.customer.${map[key] || key}`) || t('menus.customer.itemArrived');
});

const toggleSidebar = () => { collapsed.value = !collapsed.value; };
</script>

<style scoped>
.app-layout { min-height: 100vh; }
.content { margin: 24px 16px; padding: 24px; min-height: calc(100vh - 64px - 70px - 48px); background: #fff; border-radius: 8px; }
.content-wrapper { max-width: 1400px; margin: 0 auto; }
@media (max-width: 768px) { .content { margin: 16px 8px; padding: 16px; } }
</style>
