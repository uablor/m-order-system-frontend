<template>
  <a-layout class="app-layout">
    <!-- Desktop only (> 1024px): fixed sidebar that can expand/collapse -->
    <SidebarLayout
      v-if="isDesktop"
      :collapsed="collapsed"
      @update:collapsed="collapsed = $event"
    />

    <!-- Mobile + Tablet: drawer ที่ปิดได้เมื่อคลิก overlay หรือปุ่ม -->
    <a-drawer
      v-if="!isDesktop"
      placement="left"
      :open="!collapsed"
      :width="280"
      :closable="false"
      :body-style="{ padding: '0', overflow: 'auto', height: '100vh' }"
      :z-index="1000"
      class="mobile-drawer"
      @close="closeMobileDrawer"
    >
      <DrawerSidebar />
    </a-drawer>

    <!-- Content area: push margin on desktop when sidebar is fixed -->
    <a-layout :style="{ marginLeft: contentMarginLeft, transition: 'margin-left 0.2s' }">
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
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import SidebarLayout from './SidebarLayout.vue';
import DrawerSidebar from './DrawerSidebar.vue';
import HeaderWithLayoutSwitcher from '../shared/HeaderWithLayoutSwitcher.vue';
import FooterLayout from '../shared/FooterLayout.vue';
import { useIsMobile } from '../../../shared/composables/useIsMobile';

const STORAGE_KEY = 'merchant-sidebar-collapsed';

/** อ่านสถานะ sidebar จาก localStorage (true=collapsed, false=expanded) */
function getStoredCollapsed(): boolean | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'true') return true;
    if (v === 'false') return false;
    return null;
  } catch {
    return null;
  }
}

/** บันทึกสถานะ sidebar ลง localStorage */
function setStoredCollapsed(value: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    /* ignore */
  }
}

const route = useRoute();
const { t } = useI18n();
const { isDesktop } = useIsMobile();

// Desktop: โหลดจาก localStorage | Mobile/Tablet: เสมอปิด (collapsed=true)
const collapsed = ref(
  isDesktop.value ? (getStoredCollapsed() ?? false) : true
);

// บันทึกลง localStorage เฉพาะเมื่อเป็น desktop (ไม่ให้ mobile overwrite ค่า desktop)
watch(collapsed, (val) => {
  if (isDesktop.value) setStoredCollapsed(val);
}, { immediate: true });

// เมื่อเปลี่ยนขนาดหน้าจอ
watch(isDesktop, (val) => {
  if (val) {
    // เปลี่ยนเป็น desktop → โหลดค่าที่เก็บไว้
    collapsed.value = getStoredCollapsed() ?? false;
  } else {
    // เปลี่ยนเป็น mobile/tablet → ปิด drawer เสมอ
    collapsed.value = true;
  }
});

/** ปิด drawer บน mobile/tablet (เมื่อคลิก overlay หรือปุ่ม) */
const closeMobileDrawer = () => {
  collapsed.value = true;
};

// บน mobile/tablet: ปิด drawer เมื่อเปลี่ยน route (หลังคลิกเมนู)
watch(() => route.path, () => {
  if (!isDesktop.value) collapsed.value = true;
});

// Desktop: margin-left follows collapsed state
// Tablet / Mobile: 0 (drawer is overlay, doesn't push content)
const contentMarginLeft = computed(() => {
  if (!isDesktop.value) return '0px';
  return collapsed.value ? '80px' : '250px';
});

const pathToMenuKey: Record<string, string> = {
  dashboard: 'dashboard',
  customers: 'customerManagement',
  'stock-order': 'stockOrder',
  orders: 'orders',
  arrivals: 'arrivals',
  team: 'teamMembers',
  notifications: 'notifications',
  payment: 'payment',
  'exchange-rates': 'exchangeRates',
  reports: 'reports',
};

const pageTitle = computed(() => {
  const segments = route.path.split('/').filter(Boolean);
  if (segments.length >= 3 && /^\d+$/.test(segments[segments.length - 1] ?? '')) {
    const parentKey = segments[segments.length - 2] ?? '';
    const menuKey = pathToMenuKey[parentKey] || parentKey;
    const base = t(`menus.merchant.${menuKey}`);
    return base ? `${base} — ${t('common.detail')}` : t('menus.merchant.dashboard');
  }
  const pathKey = segments[segments.length - 1] ?? 'dashboard';
  const menuKey = pathToMenuKey[pathKey] || pathKey;
  const translated = t(`menus.merchant.${menuKey}`);
  return /^menus\./.test(translated) ? t('menus.merchant.dashboard') : translated;
});

const toggleSidebar = () => { collapsed.value = !collapsed.value; };
</script>

<style scoped>
.app-layout { 
  min-height: 100vh;
  background: #f5f7fa;
}

.mobile-drawer :deep(.ant-drawer-body) {
  padding: 0;
}

.content {
  margin: 5px 10px;
  min-height: calc(100vh - 64px - 70px - 48px);
  background: #fff;
  border-radius: 12px;
  padding: 10px 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: all 0.3s ease;
}

.content-wrapper { max-width: 1400px; margin: 0 auto; }

/* Tablet */
@media (min-width: 768px) and (max-width: 1024px) {
  .content { margin: 8px 10px; padding: 12px 14px; }
}

/* Mobile */
@media (max-width: 767px) {
  .content { margin: 8px 6px; padding: 12px; }
}
</style>
