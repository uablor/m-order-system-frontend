<template>
  <a-layout-sider
    v-model:collapsed="collapsed"
    :trigger="null"
    collapsible
    :width="250"
    class="sidebar"
    :style="{
      overflow: 'auto',
      height: '100vh',
      position: 'fixed',
      right: 0,
      top: 0,
      bottom: 0,
    }"
  >
    <div class="logo">
      <img v-if="!collapsed" src="/images/store_likeA.avif" alt="Store Logo" class="logo-img" />
      <img v-else src="/images/store_likeA.avif" alt="Store Logo" class="logo-img-small" />
    </div>

    <a-menu
      v-model:selectedKeys="selectedKeys"
      theme="dark"
      mode="inline"
      @click="handleMenuClick"
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

const props = defineProps<{
  collapsed: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:collapsed', value: boolean): void;
}>();

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const collapsed = computed({
  get: () => props.collapsed,
  set: (val) => emit('update:collapsed', val),
});

const getSuperAdminKey = (path: string) => {
  const parts = path.split('/');
  return parts[2] || 'dashboard';
};

const selectedKeys = ref<string[]>([getSuperAdminKey(route.path)]);
const menuItems = computed(() => getMenuItems(t));

watch(
  () => route.path,
  (newPath) => {
    selectedKeys.value = [getSuperAdminKey(newPath)];
  }
);

const handleMenuClick = (item: any) => {
  const menuItem = menuItems.value.find((m) => m.key === item.key);
  if (menuItem) {
    router.push(menuItem.path);
  }
};
</script>

<style scoped>
.sidebar {
  background: #001529;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
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

.logo-img-small {
  height: 36px;
  width: auto;
  border-radius: 6px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

:deep(.ant-menu-dark) {
  background: #001529;
}

:deep(.ant-menu-item) {
  margin: 4px 8px !important;
  border-radius: 8px !important;
  height: 48px;
  line-height: 48px;
}

:deep(.ant-menu-item-selected) {
  background-color: #1890ff !important;
}

:deep(.ant-menu-item:hover) {
  background-color: rgba(24, 144, 255, 0.2) !important;
}
</style>
