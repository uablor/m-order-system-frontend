<template>
  <div class="drawer-sidebar">
    <div class="logo">
      <img src="/images/store_likeA.avif" alt="Store Logo" class="logo-img" />
      <span class="logo-text">store</span>
    </div>

    <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline" @click="handleMenuClick">
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

const emit = defineEmits<{ (e: 'navigate'): void }>();

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const getSuperAdminKey = (path: string) => {
  const parts = path.split('/');
  // /super-admin/<key>/...
  return parts[2] || 'dashboard';
};

const selectedKeys = ref<string[]>([getSuperAdminKey(route.path)]);
const menuItems = computed(() => getMenuItems(t));

watch(() => route.path, (newPath) => {
  selectedKeys.value = [getSuperAdminKey(newPath)];
});

const handleMenuClick = (info: any) => {
  const menuItem = menuItems.value.find((m) => m.key === info.key);
  if (menuItem) router.push(menuItem.path);
  emit('navigate');
};
</script>

<style scoped>
.drawer-sidebar { height: 100%; }
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
  margin: 12px; 
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
:deep(.ant-menu-dark) { background: #001529; }
:deep(.ant-menu-item) { margin: 4px 8px !important; border-radius: 10px !important; height: 48px; line-height: 48px; }
:deep(.ant-menu-item-selected) { background-color: #1890ff !important; }
</style>

