<template>
  <div class="sa-bottom-nav">
    <div class="nav-shell">
      <a-tooltip
        :title="$t('menus.superAdmin.dashboard')"
        placement="top"
        color="#1677ff"
        overlay-class-name="sa-bottom-tooltip"
      >
        <button
          class="nav-item"
          :class="{ active: activeKey === 'dashboard' }"
          :aria-label="$t('menus.superAdmin.dashboard')"
          @click="go('/super-admin/dashboard')"
        >
          <DashboardOutlined class="nav-ico" />
          <span class="sr-only">{{ $t('menus.superAdmin.dashboard') }}</span>
        </button>
      </a-tooltip>

      <a-tooltip
        :title="$t('menus.superAdmin.merchantManagement')"
        placement="top"
        color="#1677ff"
        overlay-class-name="sa-bottom-tooltip"
      >
        <button
          class="nav-item"
          :class="{ active: activeKey === 'merchants' }"
          :aria-label="$t('menus.superAdmin.merchantManagement')"
          @click="go('/super-admin/merchants')"
        >
          <ShopOutlined class="nav-ico" />
          <span class="sr-only">{{ $t('menus.superAdmin.merchantManagement') }}</span>
        </button>
      </a-tooltip>

      <a-tooltip
        :title="$t('menus.superAdmin.settings')"
        placement="top"
        color="#1677ff"
        overlay-class-name="sa-bottom-tooltip"
      >
        <button
          class="nav-item"
          :class="{ active: activeKey === 'settings' }"
          :aria-label="$t('menus.superAdmin.settings')"
          @click="go('/super-admin/settings')"
        >
          <SettingOutlined class="nav-ico" />
          <span class="sr-only">{{ $t('menus.superAdmin.settings') }}</span>
        </button>
      </a-tooltip>

      <a-tooltip title="Profile" placement="top" color="#1677ff" overlay-class-name="sa-bottom-tooltip">
        <button class="nav-item" aria-label="Profile" @click="openProfile">
          <IdcardOutlined class="nav-ico" />
          <span class="sr-only">Profile</span>
        </button>
      </a-tooltip>
    </div>

    <ProfileModal :open="profileOpen" @close="profileOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  DashboardOutlined,
  ShopOutlined,
  SettingOutlined,
  IdcardOutlined,
} from '@ant-design/icons-vue';
import ProfileModal from '../shared/ProfileModal.vue';

const route = useRoute();
const router = useRouter();

const activeKey = computed(() => route.path.split('/')[2] || 'dashboard');

const go = async (path: string) => {
  if (route.path === path) return;
  await router.push(path);
};

const profileOpen = ref(false);
const openProfile = () => { profileOpen.value = true; };
</script>

<style scoped>
.sa-bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
  background: linear-gradient(to top, rgba(248, 250, 252, 0.98), rgba(248, 250, 252, 0.72));
  backdrop-filter: blur(10px);
}

.nav-shell {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  padding: 8px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.14);
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.nav-item {
  border: 0;
  background: transparent;
  padding: 10px 4px;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  cursor: pointer;
  color: #0f172a;
  transition: background 0.15s ease, transform 0.15s ease, color 0.15s ease;
}

.nav-item:active { transform: scale(0.98); }
.nav-ico { font-size: 20px; }
.nav-item.active { background: rgba(24, 144, 255, 0.12); color: #1677ff; }

.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

:global(.sa-bottom-tooltip .ant-tooltip-inner) {
  color: #fff;
  font-weight: 700;
}
</style>
