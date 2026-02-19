<template>
  <div class="customer-root">

    <!-- ========== DESKTOP: two-column grid ========== -->
    <div class="desktop-layout">

      <!-- LEFT PANEL: header + list -->
      <div class="left-panel">

        <!-- App Header -->
        <div class="app-header">
          <div class="store-info">
            <div class="store-avatar">💎</div>
            <div class="store-text">
              <div class="store-name">{{ storeName }}</div>
              <div class="store-type">{{ $t('customer.premiumStore') }}</div>
            </div>
          </div>
          <div class="header-actions">
            <!-- Language switcher -->
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

        <!-- Greeting -->
        <div class="greeting-section">
          <div class="greeting-row">
            <div class="greeting-text">{{ $t('customer.greeting') }} {{ customerName }}</div>
            <span class="status-badge pending">● {{ $t('customer.statusPending') }}</span>
          </div>
          <div class="greeting-sub">{{ $t('customer.greetingSub') }}</div>
        </div>

        <!-- Balance Card -->
        <div class="balance-card">
          <div class="balance-bg-icon"><ShoppingOutlined /></div>
          <div class="balance-label">{{ $t('customer.balanceLabel') }}</div>
          <div class="balance-amount">฿{{ formatAmount(summary.totalDue) }}</div>
          <div class="balance-breakdown">
            <div class="breakdown-item">
              <div class="breakdown-label">{{ $t('customer.totalProducts') }}</div>
              <div class="breakdown-val">฿{{ formatAmount(summary.totalProducts) }}</div>
            </div>
            <div class="breakdown-item">
              <div class="breakdown-label">{{ $t('customer.paid') }}</div>
              <div class="breakdown-val">฿{{ formatAmount(summary.paid) }}</div>
            </div>
          </div>
        </div>

        <!-- Products Section Header -->
        <div class="section-header">
          <div class="section-title">
            <span class="section-icon"><InboxOutlined /></span>
            <span class="section-name">{{ $t('customer.sectionTitle') }}</span>
          </div>
          <span class="section-count">{{ products.length }} {{ $t('customer.items') }}</span>
        </div>

        <!-- Product List — scroll only here -->
        <div class="product-list-scroll">
          <div class="product-list">
            <div
              v-for="item in products"
              :key="item.id"
              class="product-card"
              :class="{ 'product-card--active': selectedProduct?.id === item.id }"
              @click="openDetail(item)"
            >
              <div class="product-img-wrap">
                <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" class="product-img" />
                <div v-else class="product-img-placeholder"><ShoppingOutlined /></div>
              </div>
              <div class="product-info">
                <div class="product-top-row">
                  <span class="product-sku">SKU:{{ item.sku }}</span>
                  <span class="product-date">{{ item.date }}</span>
                </div>
                <div class="product-name">{{ item.name }}</div>
                <div class="product-bottom-row">
                  <span class="product-price">฿{{ formatAmount(item.price) }}</span>
                  <span class="product-status" :class="item.statusClass">{{ item.statusLabel }}</span>
                </div>
              </div>
              <ChevronRightOutlined class="card-arrow" />
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="products.length === 0" class="empty-state">
            <InboxOutlined class="empty-icon" />
            <div class="empty-text">{{ $t('customer.emptyText') }}</div>
          </div>
        </div>
      </div>

      <!-- RIGHT PANEL: desktop detail or placeholder (desktop only) -->
      <div class="right-panel">
        <!-- Placeholder when nothing selected (desktop only) -->
        <Transition name="fade">
          <div v-if="!selectedProduct" class="detail-placeholder">
            <div class="placeholder-icon"><InboxOutlined /></div>
            <div class="placeholder-text">{{ $t('customer.sectionTitle') }}</div>
            <div class="placeholder-hint">{{ $t('customer.greetingSub') }}</div>
          </div>
        </Transition>

        <!-- Detail Panel — desktop inline only -->
        <Transition name="fade">
          <div v-if="selectedProduct && !isMobile" class="detail-panel">
            <div class="detail-scroll">
              <div class="detail-product-row">
                <div class="detail-img-wrap">
                  <img v-if="selectedProduct.imageUrl" :src="selectedProduct.imageUrl" :alt="selectedProduct.name" class="detail-img" />
                  <div v-else class="detail-img-placeholder"><ShoppingOutlined /></div>
                </div>
                <div class="detail-product-info">
                  <div class="detail-sku">SKU: {{ selectedProduct.sku }}</div>
                  <div class="detail-name">{{ selectedProduct.name }}</div>
                  <div class="detail-arrived-badge">
                    <CheckCircleFilled class="arrived-icon" />
                    <span>{{ $t('customer.detail.arrived') }}</span>
                    <span class="arrived-date">{{ selectedProduct.date }}</span>
                  </div>
                </div>
              </div>
              <div class="detail-total-row">
                <span class="detail-total-label">{{ $t('customer.detail.totalDue') }}</span>
                <span class="detail-total-amount">฿{{ formatAmount(selectedProduct.price) }}</span>
              </div>
              <div class="detail-section">
                <div class="detail-section-header">
                  <MessageOutlined class="section-icon-sm" />
                  <span>{{ $t('customer.detail.messageTitle') }}</span>
                </div>
                <a-textarea
                  v-model:value="message"
                  :placeholder="$t('customer.detail.messagePlaceholder')"
                  :rows="4"
                  class="message-textarea"
                />
              </div>
              <div class="detail-section">
                <div class="detail-section-header">
                  <CreditCardOutlined class="section-icon-sm" />
                  <span>{{ $t('customer.detail.uploadTitle') }}</span>
                </div>
                <div
                  class="upload-zone"
                  :class="{ 'upload-zone--active': isDragging, 'upload-zone--has-file': slipFile }"
                  @click="triggerFileInput"
                  @dragover.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="handleDrop"
                >
                  <input ref="fileInputRef" type="file" accept="image/jpeg,image/png" class="hidden-input" @change="handleFileChange" />
                  <template v-if="!slipFile">
                    <div class="upload-icon-wrap"><CloudUploadOutlined class="upload-icon" /></div>
                    <div class="upload-text">{{ $t('customer.detail.uploadText') }}</div>
                    <div class="upload-hint">{{ $t('customer.detail.uploadHint') }}</div>
                  </template>
                  <template v-else>
                    <div class="upload-preview">
                      <img :src="slipPreview" alt="slip" class="slip-preview-img" />
                      <div class="slip-filename">{{ slipFile.name }}</div>
                      <a-button size="small" danger @click.stop="removeSlip">{{ $t('customer.detail.removeSlip') }}</a-button>
                    </div>
                  </template>
                </div>
              </div>
              <a-button type="primary" class="submit-btn-inline" :loading="submitting" @click="handleSubmit">
                {{ $t('customer.detail.submitBtn') }}
                <ArrowRightOutlined />
              </a-button>
              <div style="height: 24px" />
            </div>
          </div>
        </Transition>
      </div>

    </div><!-- end desktop-layout -->

    <!-- MOBILE DETAIL PANEL: teleported to body to escape display:none right-panel -->
    <Teleport to="body">
      <Transition name="slide-in">
        <div v-if="selectedProduct && isMobile" class="detail-panel detail-panel--mobile">
          <div class="detail-header">
            <button class="back-btn" @click="closeDetail">
              <ArrowLeftOutlined />
            </button>
            <div class="detail-title">{{ $t('customer.detail.title') }}</div>
            <button class="more-btn"><EllipsisOutlined /></button>
          </div>
          <div class="detail-scroll">
            <div class="detail-product-row">
              <div class="detail-img-wrap">
                <img v-if="selectedProduct.imageUrl" :src="selectedProduct.imageUrl" :alt="selectedProduct.name" class="detail-img" />
                <div v-else class="detail-img-placeholder"><ShoppingOutlined /></div>
              </div>
              <div class="detail-product-info">
                <div class="detail-sku">SKU: {{ selectedProduct.sku }}</div>
                <div class="detail-name">{{ selectedProduct.name }}</div>
                <div class="detail-arrived-badge">
                  <CheckCircleFilled class="arrived-icon" />
                  <span>{{ $t('customer.detail.arrived') }}</span>
                  <span class="arrived-date">{{ selectedProduct.date }}</span>
                </div>
              </div>
            </div>
            <div class="detail-total-row">
              <span class="detail-total-label">{{ $t('customer.detail.totalDue') }}</span>
              <span class="detail-total-amount">฿{{ formatAmount(selectedProduct.price) }}</span>
            </div>
            <div class="detail-section">
              <div class="detail-section-header">
                <MessageOutlined class="section-icon-sm" />
                <span>{{ $t('customer.detail.messageTitle') }}</span>
              </div>
              <a-textarea
                v-model:value="message"
                :placeholder="$t('customer.detail.messagePlaceholder')"
                :rows="4"
                class="message-textarea"
              />
            </div>
            <div class="detail-section">
              <div class="detail-section-header">
                <CreditCardOutlined class="section-icon-sm" />
                <span>{{ $t('customer.detail.uploadTitle') }}</span>
              </div>
              <div
                class="upload-zone"
                :class="{ 'upload-zone--active': isDragging, 'upload-zone--has-file': slipFile }"
                @click="triggerFileInput"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
              >
                <input ref="mobileFileInputRef" type="file" accept="image/jpeg,image/png" class="hidden-input" @change="handleFileChange" />
                <template v-if="!slipFile">
                  <div class="upload-icon-wrap"><CloudUploadOutlined class="upload-icon" /></div>
                  <div class="upload-text">{{ $t('customer.detail.uploadText') }}</div>
                  <div class="upload-hint">{{ $t('customer.detail.uploadHint') }}</div>
                </template>
                <template v-else>
                  <div class="upload-preview">
                    <img :src="slipPreview" alt="slip" class="slip-preview-img" />
                    <div class="slip-filename">{{ slipFile.name }}</div>
                    <a-button size="small" danger @click.stop="removeSlip">{{ $t('customer.detail.removeSlip') }}</a-button>
                  </div>
                </template>
              </div>
            </div>
            <a-button type="primary" class="submit-btn-inline" :loading="submitting" @click="handleSubmit">
              {{ $t('customer.detail.submitBtn') }}
              <ArrowRightOutlined />
            </a-button>
            <div style="height: 24px" />
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/store/auth.store';
import { storeToRefs } from 'pinia';
import { message as antMessage } from 'ant-design-vue';
import { useIsMobile } from '@/shared/composables/useIsMobile';
import {
  FileTextOutlined,
  ShoppingOutlined,
  InboxOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  EllipsisOutlined,
  CheckCircleFilled,
  MessageOutlined,
  CreditCardOutlined,
  CloudUploadOutlined,
  GlobalOutlined,
  // @ts-ignore — Ant icons v3 naming
} from '@ant-design/icons-vue';
import { RightOutlined as ChevronRightOutlined } from '@ant-design/icons-vue';

interface ProductItem {
  id: number;
  sku: string;
  name: string;
  price: number;
  date: string;
  statusLabel: string;
  statusClass: string;
  imageUrl?: string;
}

const { t, locale } = useI18n();
const { isMobile } = useIsMobile();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

/* --- Language switcher --- */
const currentLocale = computed(() => locale.value);

const langMap: Record<string, string> = { en: 'EN', th: 'TH', la: 'LA' };
const currentLangLabel = computed(() => langMap[locale.value] || 'LA');

const switchLang = (lang: string) => {
  locale.value = lang;
  localStorage.setItem('app-locale', lang);
};

/* --- User info --- */
const customerName = computed(() => {
  const full = user.value?.fullName || '';
  return full.split(' ')[0] || t('customer.guest');
});
const customerInitial = computed(() => (user.value?.fullName || 'C').charAt(0).toUpperCase());

/* --- Store / mock data --- */
const storeName = ref('Luxe Boutique');
const summary = ref({ totalDue: 10000, totalProducts: 15000, paid: 5000 });

const products = ref<ProductItem[]>([
  { id: 1, sku: 'SHOE-2024-BL', name: 'รองเท้าส้นสูงคอลเลกชั่นฤดูใบไม้ร่วง', price: 4500, date: '24 ต.ค. 2566', statusLabel: 'พร้อมส่ง', statusClass: 'status-ready' },
  { id: 2, sku: 'BAG-V2-BEG', name: 'กระเป๋าถือหนังแท้ทรง Minimal', price: 5500, date: '23 ต.ค. 2566', statusLabel: 'พร้อมส่ง', statusClass: 'status-ready' },
  { id: 3, sku: 'BAG-V2-BEG', name: 'กระเป๋าถือหนังแท้ทรง Minimal', price: 5500, date: '23 ต.ค. 2566', statusLabel: 'พร้อมส่ง', statusClass: 'status-ready' },
  { id: 4, sku: 'BAG-V2-BEG', name: 'กระเป๋าถือหนังแท้ทรง Minimal', price: 5500, date: '23 ต.ค. 2566', statusLabel: 'พร้อมส่ง', statusClass: 'status-ready' },
  { id: 5, sku: 'BAG-V2-BEG', name: 'กระเป๋าถือหนังแท้ทรง Minimal', price: 5500, date: '23 ต.ค. 2566', statusLabel: 'พร้อมส่ง', statusClass: 'status-ready' },
  { id: 6, sku: 'BAG-V2-BEG', name: 'กระเป๋าถือหนังแท้ทรง Minimal', price: 5500, date: '23 ต.ค. 2566', statusLabel: 'พร้อมส่ง', statusClass: 'status-ready' },
  { id: 7, sku: 'BAG-V2-BEG', name: 'กระเป๋าถือหนังแท้ทรง Minimal', price: 5500, date: '23 ต.ค. 2566', statusLabel: 'พร้อมส่ง', statusClass: 'status-ready' },
  { id: 8, sku: 'BAG-V2-BEG', name: 'กระเป๋าถือหนังแท้ทรง Minimal', price: 5500, date: '23 ต.ค. 2566', statusLabel: 'พร้อมส่ง', statusClass: 'status-ready' },
  { id: 9, sku: 'BAG-V2-BEG', name: 'กระเป๋าถือหนังแท้ทรง Minimal', price: 5500, date: '23 ต.ค. 2566', statusLabel: 'พร้อมส่ง', statusClass: 'status-ready' },
  { id: 10, sku: 'BAG-V2-BEG', name: 'กระเป๋าถือหนังแท้ทรง Minimal', price: 5500, date: '23 ต.ค. 2566', statusLabel: 'พร้อมส่ง', statusClass: 'status-ready' },
  { id: 11, sku: 'BAG-V2-BEG', name: 'กระเป๋าถือหนังแท้ทรง Minimal', price: 5500, date: '23 ต.ค. 2566', statusLabel: 'พร้อมส่ง', statusClass: 'status-ready' },
  { id: 12, sku: 'BAG-V2-BEG', name: 'กระเป๋าถือหนังแท้ทรง Minimal', price: 5500, date: '23 ต.ค. 2566', statusLabel: 'พร้อมส่ง', statusClass: 'status-ready' },
]);

/* --- State --- */
const selectedProduct = ref<ProductItem | null>(null);
const message = ref('');
const slipFile = ref<File | null>(null);
const slipPreview = ref('');
const isDragging = ref(false);
const submitting = ref(false);
const fileInputRef = ref<HTMLInputElement>();
const mobileFileInputRef = ref<HTMLInputElement>();

/* --- Auto-select first product on mount (desktop) --- */
onMounted(() => {
  const first = products.value[0];
  if (!isMobile.value && first) {
    openDetail(first);
  }
});

/* --- Helpers --- */
const formatAmount = (val: number) =>
  val.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const openDetail = (item: ProductItem) => {
  selectedProduct.value = item;
  message.value = '';
  slipFile.value = null;
  slipPreview.value = '';
};

const closeDetail = () => { selectedProduct.value = null; };

const triggerFileInput = () => {
  if (isMobile.value) {
    mobileFileInputRef.value?.click();
  } else {
    fileInputRef.value?.click();
  }
};

const setFile = (file: File) => {
  if (!file.type.match(/image\/(jpeg|png)/)) {
    antMessage.error(t('customer.toast.fileTypeError'));
    return;
  }
  slipFile.value = file;
  slipPreview.value = URL.createObjectURL(file);
};

const handleFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) setFile(file);
};

const handleDrop = (e: DragEvent) => {
  isDragging.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) setFile(file);
};

const removeSlip = () => {
  slipFile.value = null;
  slipPreview.value = '';
  if (fileInputRef.value) fileInputRef.value.value = '';
  if (mobileFileInputRef.value) mobileFileInputRef.value.value = '';
};

const handleSubmit = async () => {
  if (!slipFile.value) { antMessage.warning(t('customer.toast.uploadRequired')); return; }
  submitting.value = true;
  await new Promise((r) => setTimeout(r, 1200));
  submitting.value = false;
  antMessage.success(t('customer.toast.submitSuccess'));
  closeDetail();
};
</script>

<style scoped>
/* ===== Root ===== */
.customer-root {
  min-height: 100vh;
  background: #f0f4f8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* ===== DESKTOP TWO-COLUMN LAYOUT ===== */
.desktop-layout {
  display: grid;
  grid-template-columns: 1fr;   /* mobile: single column */
  width: 100%;
  min-height: 100vh;
}

@media (min-width: 768px) {
  .desktop-layout {
    grid-template-columns: 380px 1fr;
    width: 100%;
    height: 100vh;           /* full viewport height */
    overflow: hidden;        /* each panel handles own scroll */
  }
}

@media (min-width: 1200px) {
  .desktop-layout {
    grid-template-columns: 440px 1fr;
  }
}

/* ===== LEFT PANEL ===== */
.left-panel {
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e2e8f0;
  /* mobile: natural height, no overflow lock */
}

@media (min-width: 768px) {
  .left-panel {
    height: 100vh;
    overflow: hidden;          /* panel itself does NOT scroll */
  }
}

/* ===== RIGHT PANEL ===== */
.right-panel {
  background: #f8fafc;
  position: relative;
  overflow: hidden;
  display: none; /* hidden on mobile — mobile uses full-screen detail */
}

@media (min-width: 768px) {
  .right-panel {
    display: block;
    height: 100vh;
    overflow-y: auto;
  }
}

/* Placeholder */
.detail-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
  color: #94a3b8;
}
.placeholder-icon { font-size: 56px; margin-bottom: 16px; opacity: 0.35; }
.placeholder-text { font-size: 17px; font-weight: 700; color: #64748b; margin-bottom: 6px; }
.placeholder-hint { font-size: 13px; color: #94a3b8; max-width: 240px; }

/* ===== APP HEADER ===== */
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
  gap: 5px;
  font-size: 15px; color: #475569;
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

/* ===== GREETING ===== */
.greeting-section { padding: 20px 20px 0; }
.greeting-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.greeting-text { font-size: clamp(18px, 5vw, 22px); font-weight: 800; color: #0f172a; line-height: 1.3; }
.status-badge {
  font-size: 11px; font-weight: 700; border-radius: 999px;
  padding: 4px 12px; white-space: nowrap; flex-shrink: 0; margin-top: 3px;
}
.status-badge.pending { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
.greeting-sub { font-size: 13px; color: #64748b; }

/* ===== BALANCE CARD ===== */
.balance-card {
  margin: 16px 20px;
  background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 60%, #6366f1 100%);
  border-radius: 20px;
  padding: 22px 22px 18px;
  color: #fff;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(29, 78, 216, 0.35);
}
.balance-bg-icon {
  position: absolute; right: 16px; bottom: 8px;
  font-size: 72px; opacity: 0.1; color: #fff; pointer-events: none;
}
.balance-label { font-size: 13px; opacity: 0.85; margin-bottom: 6px; }
.balance-amount { font-size: clamp(26px, 6vw, 34px); font-weight: 800; letter-spacing: -0.02em; margin-bottom: 18px; }
.balance-breakdown { display: flex; gap: 36px; flex-wrap: wrap; }
.breakdown-label { font-size: 11px; opacity: 0.75; margin-bottom: 3px; }
.breakdown-val { font-size: 16px; font-weight: 700; }

/* ===== SECTION HEADER ===== */
.section-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 20px 8px;
}
.section-title { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; color: #0f172a; }
.section-icon { font-size: 18px; color: #1d4ed8; }
.section-count { font-size: 12px; color: #94a3b8; background: #f1f5f9; border-radius: 999px; padding: 2px 10px; }

/* ===== PRODUCT LIST SCROLL WRAPPER ===== */
.product-list-scroll {
  /* mobile: natural flow */
  padding-bottom: 32px;
}

@media (min-width: 768px) {
  .product-list-scroll {
    flex: 1;                    /* takes remaining height after header/balance */
    overflow-y: auto;           /* only this section scrolls */
    padding-bottom: 16px;
    /* custom scrollbar */
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 transparent;
  }
  .product-list-scroll::-webkit-scrollbar { width: 4px; }
  .product-list-scroll::-webkit-scrollbar-track { background: transparent; }
  .product-list-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
}

/* ===== PRODUCT LIST ===== */
.product-list { padding: 0 14px; display: flex; flex-direction: column; gap: 10px; }
.product-card {
  background: #fff;
  border-radius: 16px;
  padding: 14px 12px 14px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 4px 12px rgba(15, 23, 42, 0.04);
  border: 1.5px solid transparent;
  transition: box-shadow 0.18s, transform 0.15s, border-color 0.18s;
  -webkit-tap-highlight-color: transparent;
}
.product-card:hover { box-shadow: 0 4px 16px rgba(29, 78, 216, 0.12); border-color: #c7d2fe; }
.product-card:active { transform: scale(0.98); }
.product-card--active { border-color: #3b82f6 !important; box-shadow: 0 4px 16px rgba(29, 78, 216, 0.18) !important; }

.product-img-wrap {
  width: 68px; height: 68px; border-radius: 12px;
  overflow: hidden; flex-shrink: 0; background: #f8e8e0;
}
.product-img { width: 100%; height: 100%; object-fit: cover; }
.product-img-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 26px; color: #cbd5e1;
}
.card-arrow { color: #cbd5e1; font-size: 12px; flex-shrink: 0; margin-left: auto; }

.product-info { flex: 1; min-width: 0; }
.product-top-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
.product-sku { font-size: 11px; font-weight: 700; color: #1d4ed8; }
.product-date { font-size: 11px; color: #94a3b8; }
.product-name { font-size: 13px; font-weight: 600; color: #1e293b; line-height: 1.4; margin-bottom: 7px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.product-bottom-row { display: flex; justify-content: space-between; align-items: center; }
.product-price { font-size: 16px; font-weight: 800; color: #1d4ed8; }
.product-status { font-size: 11px; font-weight: 700; border-radius: 999px; padding: 2px 9px; }
.status-ready { background: #dcfce7; color: #15803d; }
.status-pending { background: #fef3c7; color: #b45309; }
.status-waiting { background: #e0e7ff; color: #3730a3; }

/* Empty */
.empty-state { text-align: center; padding: 48px 20px; color: #94a3b8; }
.empty-icon { font-size: 48px; margin-bottom: 12px; display: block; }
.empty-text { font-size: 14px; }

/* ===== DETAIL PANEL ===== */
/* Default: desktop inline panel — scrolls naturally in right-panel */
.detail-panel {
  background: #f5f7fa;
  min-height: 100%;
  padding-bottom: 32px;
}

/* Mobile: full-screen overlay */
.detail-panel--mobile {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: #f5f7fa;
  height: 100dvh;
  display: flex;
  flex-direction: column;
}

/* Detail Header */
.detail-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 16px 12px;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}
.back-btn, .more-btn {
  background: none; border: none; cursor: pointer;
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; color: #374151;
  transition: background 0.15s;
}
.back-btn:hover, .more-btn:hover { background: #f1f5f9; }
.detail-title { font-size: 16px; font-weight: 700; color: #0f172a; }

/* Desktop: scroll naturally. Mobile: fill+scroll inside fixed panel */
.detail-scroll { padding: 16px; }
.detail-panel--mobile .detail-scroll { flex: 1; overflow-y: auto; }

/* Product row in detail */
.detail-product-row {
  background: #fff; border-radius: 16px; padding: 16px;
  display: flex; align-items: flex-start; gap: 14px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}
.detail-img-wrap {
  width: 80px; height: 80px;
  border-radius: 12px; overflow: hidden;
  flex-shrink: 0; background: #f1f5f9;
}
.detail-img { width: 100%; height: 100%; object-fit: cover; }
.detail-img-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 32px; color: #cbd5e1;
}
.detail-product-info { flex: 1; min-width: 0; }
.detail-sku { font-size: 11px; font-weight: 700; color: #1d4ed8; margin-bottom: 4px; }
.detail-name { font-size: 14px; font-weight: 700; color: #0f172a; line-height: 1.4; margin-bottom: 10px; }
.detail-arrived-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: #e0f2fe; color: #0369a1;
  border-radius: 999px; padding: 4px 12px 4px 8px;
  font-size: 12px; font-weight: 600;
}
.arrived-icon { color: #0ea5e9; }
.arrived-date { color: #475569; font-weight: 400; margin-left: 4px; font-size: 11px; }

/* Total row */
.detail-total-row {
  background: #fff; border-radius: 14px; padding: 14px 18px;
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 14px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}
.detail-total-label { font-size: 14px; color: #64748b; font-weight: 500; }
.detail-total-amount { font-size: 22px; font-weight: 800; color: #1d4ed8; }

/* Sections */
.detail-section {
  background: #fff; border-radius: 16px; padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}
.detail-section-header {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 700; color: #1e293b;
  margin-bottom: 12px;
}
.section-icon-sm { font-size: 16px; color: #475569; }
.message-textarea { border-radius: 10px !important; border-color: #e2e8f0 !important; font-size: 14px; resize: none; }

/* Upload zone */
.upload-zone {
  border: 2px dashed #cbd5e1; border-radius: 14px; padding: 28px 16px;
  text-align: center; cursor: pointer;
  transition: border-color 0.18s, background 0.18s;
  background: #f8fafc;
}
.upload-zone:hover, .upload-zone--active { border-color: #3b82f6; background: #eff6ff; }
.upload-zone--has-file { border-color: #22c55e; background: #f0fdf4; }
.upload-icon-wrap {
  width: 56px; height: 56px;
  background: linear-gradient(135deg, #dbeafe, #e0e7ff);
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 12px;
}
.upload-icon { font-size: 26px; color: #3b82f6; }
.upload-text { font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 4px; }
.upload-hint { font-size: 12px; color: #94a3b8; }
.hidden-input { display: none; }
.upload-preview { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.slip-preview-img { width: 100px; height: 100px; object-fit: cover; border-radius: 10px; border: 2px solid #bbf7d0; }
.slip-filename { font-size: 12px; color: #475569; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Submit button inline (below upload section) */
.submit-btn-inline {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  width: 100% !important;
  height: 52px !important;
  border-radius: 14px !important;
  font-size: 15px !important;
  font-weight: 700 !important;
  background: linear-gradient(90deg, #1d4ed8, #3b82f6) !important;
  border: none !important;
  box-shadow: 0 4px 20px rgba(29, 78, 216, 0.35) !important;
  margin-top: 12px;
}
.submit-btn-inline:hover { opacity: 0.92 !important; }

/* Mobile sticky submit (wraps the inline button at bottom of screen) */
.detail-panel--mobile .submit-btn-inline {
  /* on mobile inside the flex column it just flows with content */
}

/* ===== LANGUAGE MENU ===== */
:deep(.lang-menu .ant-dropdown-menu-item) { font-size: 13px; padding: 8px 16px; }
:deep(.lang-menu .lang-active) { background: #eff6ff; color: #1d4ed8; font-weight: 700; }

/* ===== TRANSITIONS ===== */
/* Slide (mobile full-screen) */
.slide-in-enter-active { transition: transform 0.28s cubic-bezier(0.34, 1.1, 0.64, 1); }
.slide-in-leave-active { transition: transform 0.22s ease-in; }
.slide-in-enter-from, .slide-in-leave-to { transform: translateX(100%); }

/* Fade (desktop panel) */
.fade-enter-active { transition: opacity 0.22s ease, transform 0.22s ease; }
.fade-leave-active { transition: opacity 0.16s ease; }
.fade-enter-from { opacity: 0; transform: translateY(10px); }
.fade-leave-to { opacity: 0; }
</style>
