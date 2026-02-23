<template>
  <!-- Product info row -->
  <div class="detail-product-row">
    <div class="detail-img-wrap">
      <div class="detail-img-placeholder"><ShoppingOutlined /></div>
    </div>
    <div class="detail-product-info">
      <div class="detail-sku">{{ $t('customer.orderLabel') }} #{{ order.id }}</div>
      <div class="detail-name">{{ getOrderTitle(order) }}</div>
      <div class="detail-arrived-badge">
        <CheckCircleFilled class="arrived-icon" />
        <span>{{ $t('customer.detail.arrived') }}</span>
        <span class="arrived-date">{{ formatDate(order.createdAt) }}</span>
      </div>
    </div>
  </div>

  <!-- Items breakdown -->
  <div v-if="order.customerOrderItems?.length" class="items-section">
    <div class="items-header">
      <ShoppingCartOutlined class="section-icon-sm" />
      <span>{{ $t('customer.detail.itemsTitle') }}</span>
    </div>
    <div class="items-list">
      <div v-for="item in order.customerOrderItems" :key="item.id" class="item-row">
        <div class="item-name">{{ item.productName }}</div>
        <div class="item-right">
          <span class="item-qty">x{{ item.quantity }}</span>
          <span class="item-price">{{ formatAmount(parseFloat(item.sellingTotalLak)) }} ₭</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Total due -->
  <div class="detail-total-row">
    <span class="detail-total-label">{{ $t('customer.detail.totalDue') }}</span>
    <span class="detail-total-amount">{{ formatAmount(parseFloat(order.remainingAmount)) }} ₭</span>
  </div>

  <!-- Payment status -->
  <div class="detail-status-row">
    <span class="detail-status-label">{{ $t('customer.detail.paymentStatus') }}</span>
    <span class="detail-status-badge" :class="statusClass(order.paymentStatus)">
      {{ $t(`customer.paymentStatus.${order.paymentStatus}`) }}
    </span>
  </div>

  <!-- Message -->
  <div class="detail-section">
    <div class="detail-section-header">
      <MessageOutlined class="section-icon-sm" />
      <span>{{ $t('customer.detail.messageTitle') }}</span>
    </div>
    <a-textarea
      :value="message"
      :placeholder="$t('customer.detail.messagePlaceholder')"
      :rows="4"
      class="message-textarea"
      @update:value="$emit('update:message', $event)"
    />
  </div>

  <!-- Upload slip -->
  <div class="detail-section">
    <div class="detail-section-header">
      <CreditCardOutlined class="section-icon-sm" />
      <span>{{ $t('customer.detail.uploadTitle') }}</span>
    </div>
    <div
      class="upload-zone"
      :class="{ 'upload-zone--active': isDragging, 'upload-zone--has-file': slipFile }"
      @click="$emit('triggerFile', fileInputRef)"
      @dragover.prevent="$emit('dragOver')"
      @dragleave.prevent="$emit('dragLeave')"
      @drop.prevent="$emit('drop', $event)"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept="image/jpeg,image/png"
        class="hidden-input"
        @change="$emit('fileChange', $event)"
      />
      <template v-if="!slipFile">
        <div class="upload-icon-wrap"><CloudUploadOutlined class="upload-icon" /></div>
        <div class="upload-text">{{ $t('customer.detail.uploadText') }}</div>
        <div class="upload-hint">{{ $t('customer.detail.uploadHint') }}</div>
        <div class="upload-note">{{ $t('customer.detail.uploadNote') }}</div>
      </template>
      <template v-else>
        <div class="upload-preview">
          <img :src="slipPreview" alt="slip" class="slip-preview-img" />
          <div class="slip-filename">{{ slipFile.name }}</div>
          <div class="upload-note-file">{{ $t('customer.detail.uploadNote') }}</div>
          <a-button size="small" danger @click.stop="$emit('removeSlip')">
            {{ $t('customer.detail.removeSlip') }}
          </a-button>
        </div>
      </template>
    </div>
  </div>

  <a-button
    type="primary"
    class="submit-btn-inline"
    :loading="submitting"
    @click="$emit('submit')"
  >
    {{ $t('customer.detail.submitBtn') }}
    <ArrowRightOutlined />
  </a-button>
  <div style="height: 24px" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  ShoppingOutlined,
  CheckCircleFilled,
  MessageOutlined,
  CreditCardOutlined,
  CloudUploadOutlined,
  ArrowRightOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import type { CustomerOrder } from '@/infrastructure/repositories/customer-order.repository';

const props = defineProps<{
  order: CustomerOrder;
  message: string;
  slipFile: File | null;
  slipPreview: string;
  isDragging: boolean;
  submitting: boolean;
  isMobile: boolean;
}>();

defineEmits<{
  (e: 'update:message', val: string): void;
  (e: 'triggerFile', el: HTMLInputElement | null): void;
  (e: 'fileChange', ev: Event): void;
  (e: 'drop', ev: DragEvent): void;
  (e: 'dragOver'): void;
  (e: 'dragLeave'): void;
  (e: 'removeSlip'): void;
  (e: 'submit'): void;
}>();

const { t } = useI18n();
const fileInputRef = ref<HTMLInputElement | null>(null);

const formatAmount = (val: number) =>
  val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const formatDate = (dt: string) => dayjs(dt).format('DD/MM/YYYY');

const getOrderTitle = (order: CustomerOrder): string => {
  const first = order.customerOrderItems?.[0];
  if (first?.productName) {
    const extra = order.customerOrderItems.length > 1
      ? ` +${order.customerOrderItems.length - 1} ${t('customer.moreItems')}`
      : '';
    return first.productName + extra;
  }
  return `${t('customer.orderLabel')} #${order.id}`;
};

const statusClass = (status: string) => {
  if (status === 'PAID') return 'badge-paid';
  if (status === 'PARTIAL') return 'badge-partial';
  return 'badge-unpaid';
};
</script>

<style scoped>
.detail-product-row {
  background: #fff; border-radius: 16px; padding: 16px;
  display: flex; align-items: flex-start; gap: 14px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}
.detail-img-wrap {
  width: 80px; height: 80px;
  border-radius: 12px; overflow: hidden;
  flex-shrink: 0; background: #eff6ff;
}
.detail-img-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 32px; color: #93c5fd;
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

/* Items breakdown */
.items-section {
  background: #fff; border-radius: 14px; padding: 14px 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}
.items-header {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 700; color: #1e293b;
  margin-bottom: 10px;
}
.section-icon-sm { font-size: 15px; color: #475569; }
.items-list { display: flex; flex-direction: column; gap: 8px; }
.item-row { display: flex; justify-content: space-between; align-items: center; }
.item-name { font-size: 13px; color: #334155; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.item-qty { font-size: 12px; color: #94a3b8; }
.item-price { font-size: 13px; font-weight: 700; color: #1d4ed8; }

/* Total row */
.detail-total-row {
  background: #fff; border-radius: 14px; padding: 14px 18px;
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}
.detail-total-label { font-size: 14px; color: #64748b; font-weight: 500; }
.detail-total-amount { font-size: 22px; font-weight: 800; color: #1d4ed8; }

/* Status row */
.detail-status-row {
  background: #fff; border-radius: 14px; padding: 12px 18px;
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}
.detail-status-label { font-size: 13px; color: #64748b; }
.detail-status-badge { font-size: 12px; font-weight: 700; border-radius: 999px; padding: 3px 12px; }
.badge-paid { background: #dcfce7; color: #15803d; }
.badge-partial { background: #e0e7ff; color: #3730a3; }
.badge-unpaid { background: #fef3c7; color: #b45309; }

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
.upload-note { font-size: 11px; color: #94a3b8; margin-top: 6px; font-style: italic; }
.upload-note-file { font-size: 11px; color: #94a3b8; font-style: italic; margin-bottom: 6px; }
.hidden-input { display: none; }
.upload-preview { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.slip-preview-img { width: 100px; height: 100px; object-fit: cover; border-radius: 10px; border: 2px solid #bbf7d0; }
.slip-filename { font-size: 12px; color: #475569; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

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
</style>
