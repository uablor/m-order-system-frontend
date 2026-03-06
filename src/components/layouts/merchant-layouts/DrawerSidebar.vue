<template>
  <div class="drawer-sidebar">
    <div class="logo">
      <img src="/images/store_likeA.avif" alt="Store Logo" class="logo-img" />
      <span class="logo-text">store</span>
    </div>

    <a-menu 
      v-model:selectedKeys="selectedKeys" 
      mode="inline" 
      @click="handleMenuClick"
      class="custom-menu"
    >
      <a-menu-item v-for="item in menuItems" :key="item.key">
        <component :is="item.icon" />
        <span>{{ item.label }}</span>
      </a-menu-item>
    </a-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { getMenuItems } from './menuItem';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

/** ดึง menu key จาก path — หน้า detail (orders/123, arrivals/456) ให้ parent menu ยัง active */
function getMenuKeyFromPath(path: string): string {
  const segments = path.split('/').filter(Boolean);
  if (segments[0] === 'merchant' && segments[1]) return segments[1];
  return segments[segments.length - 1] || 'dashboard';
}

const selectedKeys = ref<string[]>([getMenuKeyFromPath(route.path)]);
const menuItems = computed(() => {
  const items = getMenuItems(t);
  return items.map(item => ({
    ...item,
    label: typeof item.label === 'string' && item.label.includes('menus.merchant') 
      ? item.label.split('.').pop()!.replace(/([A-Z])/g, ' $1').trim()
      : item.label
  }));
});

watch(() => route.path, (newPath) => {
  selectedKeys.value = [getMenuKeyFromPath(newPath)];
});

const handleMenuClick = (info: any) => {
  const menuItem = menuItems.value.find((m) => m.key === info.key);
  if (menuItem) router.push(menuItem.path);
  // ไม่ปิด drawer เมื่อ navigate — ปิดได้แค่กดปุ่มปิดเท่านั้น
};
</script>

<style scoped>
.drawer-sidebar { 
  height: 100%; 
  background: #ffffff;
  border-right: 1px solid #e8e8e8;
  box-shadow: 2px 0 8px rgba(0,0,0,0.06);
}
.logo { 
  height: 64px; 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  margin: 16px; 
}

.logo:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: scale(1.02);
}

.logo-img { 
  height: 48px; 
  width: auto; 
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.logo-text {
  margin-left: 12px !important;
  font-size: 24px;
  font-weight: 700;
  color: #ff6b35;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.logo:hover .logo-text {
  color: #ff8c42;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

:deep(.ant-menu) { 
  background: #ffffff;
  border: none;
  padding: 0 12px;
}
:deep(.custom-menu .ant-menu-item) { 
  margin: 6px 0 !important; 
  border-radius: 12px !important; 
  height: 50px; 
  line-height: 50px;
  color: #595959;
  font-weight: 500;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
}
:deep(.custom-menu .ant-menu-item::before) {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(24, 144, 255, 0.1), transparent);
  transition: left 0.5s ease;
}
:deep(.custom-menu .ant-menu-item:hover::before) {
  left: 100%;
}
:deep(.custom-menu .ant-menu-item:hover) { 
  background-color: #f0f5ff !important; 
  color: #1890ff !important;
  border-color: #d6e4ff;
  transform: translateX(8px) scale(1.02);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}
:deep(.custom-menu .ant-menu-item-selected) { 
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%) !important; 
  color: #ffffff !important;
  border-color: #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
  font-weight: 600;
  transform: translateX(4px);
}
:deep(.custom-menu .ant-menu-item-selected:hover) {
  background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%) !important;
  color: #ffffff !important;
  transform: translateX(8px) scale(1.03);
  box-shadow: 0 6px 20px rgba(24, 144, 255, 0.5), 0 0 20px rgba(24, 144, 255, 0.2);
}
:deep(.custom-menu .ant-menu-item-selected:hover .anticon) {
  color: #ffffff !important;
  transform: scale(1.1) rotate(5deg);
}
:deep(.custom-menu .ant-menu-item .anticon) {
  font-size: 18px;
  margin-right: 12px;
  transition: all 0.3s ease;
}
:deep(.custom-menu .ant-menu-item:hover .anticon) {
  transform: scale(1.1) rotate(5deg);
}
</style>

