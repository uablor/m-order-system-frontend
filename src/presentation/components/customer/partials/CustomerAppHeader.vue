<template>
  <div class="app-header">
    <div class="store-info">
      <div class="store-avatar">💎</div>
      <div class="store-text">
        <div class="store-name">{{ storeName }}</div>
        <div class="store-type">{{ $t('customer.premiumStore') }}</div>
      </div>
    </div>
    <div class="header-actions">
      <a-dropdown placement="bottomRight" :trigger="['click']">
        <button class="icon-btn lang-btn" :title="currentLangLabel">
          <GlobalOutlined />
          <span class="lang-label">{{ currentLangLabel }}</span>
        </button>
        <template #overlay>
          <a-menu class="lang-menu" @click="(info: { key: string }) => switchLang(info.key)">
            <a-menu-item key="en" :class="{ 'lang-active': currentLocale === 'en' }">
              🇬🇧 English
            </a-menu-item>
            <a-menu-item key="th" :class="{ 'lang-active': currentLocale === 'th' }">
              🇹🇭 ภาษาไทย
            </a-menu-item>
            <a-menu-item key="la" :class="{ 'lang-active': currentLocale === 'la' }">
              🇱🇦 ພາສາລາວ
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
      <button class="icon-btn" title="PDF">
        <FileTextOutlined />
      </button>
      <div class="user-avatar">{{ customerInitial }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { GlobalOutlined, FileTextOutlined } from '@ant-design/icons-vue';

const props = defineProps<{
  storeName: string;
  customerInitial: string;
}>();

const { locale } = useI18n();

const currentLocale = computed(() => locale.value);
const langMap: Record<string, string> = { en: 'EN', th: 'TH', la: 'LA' };
const currentLangLabel = computed(() => langMap[locale.value] || 'LA');

const switchLang = (lang: string) => {
  locale.value = lang;
  localStorage.setItem('app-locale', lang);
};
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 14px;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
  position: sticky;
  top: 0;
  z-index: 10;
}
.store-info { display: flex; align-items: center; gap: 10px; }
.store-avatar {
  width: 42px; height: 42px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; flex-shrink: 0;
}
.store-name { font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.2; }
.store-type { font-size: 10px; font-weight: 600; color: #64748b; letter-spacing: 0.08em; margin-top: 1px; }
.header-actions { display: flex; align-items: center; gap: 8px; }
.icon-btn {
  background: #f1f5f9; border: none; cursor: pointer;
  height: 36px; padding: 0 10px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  gap: 5px; font-size: 15px; color: #475569;
  transition: background 0.15s;
}
.icon-btn:hover { background: #e2e8f0; }
.lang-label { font-size: 12px; font-weight: 700; color: #374151; letter-spacing: 0.04em; }
.user-avatar {
  width: 36px; height: 36px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700; color: #fff; flex-shrink: 0;
}
:deep(.lang-menu .ant-dropdown-menu-item) { font-size: 13px; padding: 8px 16px; }
:deep(.lang-menu .lang-active) { background: #eff6ff; color: #1d4ed8; font-weight: 700; }
</style>
