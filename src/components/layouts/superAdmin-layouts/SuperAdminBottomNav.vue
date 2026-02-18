<template>
  <div class="sa-bottom-nav">
    <div class="nav-shell">
      <a-tooltip
        :title="$t('menus.superAdmin.users')"
        placement="top"
        color="#1677ff"
        overlay-class-name="sa-bottom-tooltip"
      >
        <button
          class="nav-item"
          :class="{ active: activeKey === 'users' }"
          :aria-label="$t('menus.superAdmin.users')"
          @click="go('/super-admin/users')"
        >
          <UserOutlined class="nav-ico" />
          <span class="sr-only">{{ $t('menus.superAdmin.users') }}</span>
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

    <a-modal
      :open="profileOpen"
      title="Profile"
      :confirm-loading="profileLoading"
      :cancel-text="$t('common.cancel')"
      @ok="profileOpen = false"
      @cancel="profileOpen = false"
      width="620px"
    >
      <a-descriptions bordered :column="1">
        <a-descriptions-item label="Name">{{ authStore.user?.fullName || '-' }}</a-descriptions-item>
        <a-descriptions-item label="Email">{{ authStore.user?.email || '-' }}</a-descriptions-item>
        <a-descriptions-item label="Role">{{ authStore.user?.roleName || '-' }}</a-descriptions-item>
        <a-descriptions-item label="User ID">{{ authStore.user?.id ?? '-' }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IdcardOutlined, SettingOutlined, ShopOutlined, UserOutlined } from '@ant-design/icons-vue';
import { useAuth } from '@/shared/composables/useAuth';
import { useAuthStore } from '@/store/auth.store';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { getMe } = useAuth();

const activeKey = computed(() => route.path.split('/')[2] || 'merchants');

const go = async (path: string) => {
  if (route.path === path) return;
  await router.push(path);
};

const profileOpen = ref(false);
const profileLoading = ref(false);
const openProfile = async () => {
  profileOpen.value = true;
  profileLoading.value = true;
  try {
    await getMe();
  } finally {
    profileLoading.value = false;
  }
};
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
  gap: 8px;
  padding: 10px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.14);
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.nav-item {
  border: 0;
  background: transparent;
  padding: 12px 8px;
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

.nav-item:active {
  transform: scale(0.98);
}

.nav-ico {
  font-size: 22px;
}

.nav-item.active {
  background: rgba(24, 144, 255, 0.12);
  color: #1677ff;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* tooltip style: blue bg + white text */
:global(.sa-bottom-tooltip .ant-tooltip-inner) {
  color: #fff;
  font-weight: 700;
}
</style>

