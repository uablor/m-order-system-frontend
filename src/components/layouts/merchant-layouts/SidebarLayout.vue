<template>
  <a-layout-sider
    v-model:collapsed="collapsed"
    :trigger="null"
    collapsible
    :width="250"
    class="sidebar"
    :style="{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0 }"
  >
    <div class="logo">
      <img v-if="!collapsed" src="/logo.svg" alt="Logo" class="logo-img" />
      <img v-else src="/logo-small.svg" alt="Logo" class="logo-img-small" />
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
  </a-layout-sider>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { getMenuItems } from './menuItem';

const props = defineProps<{ collapsed: boolean }>();
const emit = defineEmits<{ (e: 'update:collapsed', value: boolean): void }>();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const collapsed = computed({ get: () => props.collapsed, set: (val) => emit('update:collapsed', val) });

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

const handleMenuClick = (item: any) => {
  const menuItem = menuItems.value.find((m) => m.key === item.key);
  if (menuItem) router.push(menuItem.path);
};
</script>

<style scoped>
.sidebar { 
  background: #ffffff;
  border-right: 1px solid #e8e8e8;
  box-shadow: 2px 0 8px rgba(0,0,0,0.06);
}
.logo { 
  height: 64px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
  margin: 16px; 
  border-radius: 16px; 
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  animation: logoPulse 2s ease-in-out;
}
@keyframes logoPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
.logo:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}
.logo-img { 
  height: 40px; 
  width: auto; 
  filter: brightness(0) invert(1);
}
.logo-img-small { 
  height: 32px; 
  width: auto; 
  filter: brightness(0) invert(1);
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
