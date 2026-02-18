<template>
  <div class="drawer-sidebar">
    <div class="logo">
      <img src="/logo.svg" alt="Logo" class="logo-img" />
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
.logo { height: 64px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.08); margin: 12px; border-radius: 12px; }
.logo-img { height: 40px; width: auto; }
:deep(.ant-menu-dark) { background: #001529; }
:deep(.ant-menu-item) { margin: 4px 8px !important; border-radius: 10px !important; height: 48px; line-height: 48px; }
:deep(.ant-menu-item-selected) { background-color: #1890ff !important; }
</style>

