<template>
  <!-- Product info row -->
  <div class="detail-product-row">
    <div class="detail-img-wrap">
      <div class="detail-img-placeholder"><ShoppingOutlined /></div>
    </div>
    <div class="detail-product-info">
      <div class="detail-sku">{{ $t('customer.orderLabel') }} #{{ order.orderCode || order.id }}</div>
      <div class="detail-name">{{ getOrderTitle(order) }}</div>
      <div class="detail-arrived-badge">
        <CheckCircleFilled class="arrived-icon" />
        <span>{{ $t('customer.detail.arrived') }}</span>
        <span class="arrived-date">{{ formatDate(order.createdAt) }}</span>
      </div>
    </div>
  </div>

  <!-- Items breakdown: table layout with column headers -->
  <div v-if="order.customerOrderItems?.length" class="items-section">
    <div class="items-header">
      <ShoppingCartOutlined class="section-icon-sm" />
      <span>{{ $t('customer.detail.itemsTitle') }}</span>
    </div>
    <div class="items-table-wrap">
      <div class="items-table-header">
        <div class="col-product">{{ $t('customer.detail.colProductName') }}</div>
        <div class="col-variant">{{ $t('customer.detail.colVariant') }}</div>
        <div class="col-qty">{{ $t('customer.detail.colQuantity') }}</div>
        <div class="col-price">{{ $t('customer.detail.colTotalPrice') }}</div>
      </div>
      <div class="items-table-body">
        <div v-for="item in order.customerOrderItems" :key="item.id" class="items-table-row">
          <div class="col-product" :data-label="$t('customer.detail.colProductName')">{{ item.productName }}</div>
          <div class="col-variant" :data-label="$t('customer.detail.colVariant')">{{ item.variant || '—' }}</div>
          <div class="col-qty" :data-label="$t('customer.detail.colQuantity')">{{ item.quantity }}</div>
          <div class="col-price" :data-label="$t('customer.detail.colTotalPrice')">{{ formatItemPrice(item) }}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Total due -->
  <div class="detail-total-row">
    <span class="detail-total-label">{{ $t('customer.detail.totalDue') }}</span>
    <span class="detail-total-amount">{{ formatTotalDue(order) }}</span>
  </div>

  <!-- Payment status -->
  <div class="detail-status-row">
    <span class="detail-status-label">{{ $t('customer.detail.paymentStatus') }}</span>
    <span class="detail-status-badge" :class="statusClass(displayPaymentStatus)">
      {{ $t(`customer.paymentStatus.${displayPaymentStatus}`) }}
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

  <!-- Upload slip (only when can submit) -->
  <div v-if="canSubmit" class="detail-section">
    <div class="detail-section-header">
      <CreditCardOutlined class="section-icon-sm" />
      <span>{{ $t('customer.detail.uploadTitle') }}</span>
    </div>
    <div
      class="upload-zone"
      :class="{ 'upload-zone--active': isDragging, 'upload-zone--has-file': slipFile }"
      @dragover.prevent="$emit('dragOver')"
      @dragleave.prevent="$emit('dragLeave')"
      @drop.prevent="$emit('drop', $event)"
    >
      <!-- Input overlay: คลิกตรงไหนก็เปิด file picker ได้ (แก้ปัญหา mobile ที่ display:none ไม่ทำงาน) -->
      <input
        ref="fileInputRef"
        type="file"
        accept="image/jpeg,image/png"
        class="file-input-overlay"
        :class="{ 'file-input-overlay--disabled': !!slipFile }"
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
          <a-button size="small" danger @click.stop="handleRemoveSlip">
            {{ $t('customer.detail.removeSlip') }}
          </a-button>
        </div>
      </template>
    </div>
  </div>

  <template v-if="canSubmit">
    <a-button
      type="primary"
      class="submit-btn-inline"
      :loading="submitting"
      @click="$emit('submit')"
    >
      {{ $t('customer.detail.submitBtn') }}
      <ArrowRightOutlined />
    </a-button>
  </template>
  <template v-else>
    <div class="payment-status-message">
      {{ paymentStatusMessage }}
    </div>
  </template>
  <div style="height: 24px" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
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
import { formatDate } from '@/shared/utils/date.utils';
import type { CustomerOrder } from '@/infrastructure/repositories/customer-order.repository';

const props = defineProps<{
  order: CustomerOrder;
  message: string;
  slipFile: File | null;
  slipPreview: string;
  isDragging: boolean;
  submitting: boolean;
  canSubmit: boolean;
  isMobile: boolean;
}>();

const currencySymbol = (code: string | null) => {
  if (!code) return '₭';
  const map: Record<string, string> = { LAK: '₭', THB: '฿', USD: '$', USDT: 'USDT' };
  return map[code] ?? code;
};

const formatItemPrice = (item: { sellingTotal: string; targetCurrencySellingTotal: string | null }) => {
  const amount = item.targetCurrencySellingTotal != null
    ? parseFloat(item.targetCurrencySellingTotal)
    : parseFloat(item.sellingTotal);
  const sym = currencySymbol(props.order.targetCurrency);
  return `${formatAmount(amount)} ${sym}`;
};

const formatTotalDue = (o: CustomerOrder) => {
  const amount = o.targetCurrencyRemainingAmount != null
    ? parseFloat(o.targetCurrencyRemainingAmount)
    : parseFloat(o.remainingAmount);
  const sym = currencySymbol(o.targetCurrency);
  return `${formatAmount(amount)} ${sym}`;
};

/** สถานะที่แสดง: ถ้ามี payment รอตรวจสอบ ให้แสดง PENDING_VERIFICATION แทน UNPAID/PARTIAL */
const displayPaymentStatus = computed(() => {
  const o = props.order;
  if (o.hasPendingPayment) return 'PENDING_VERIFICATION';
  return o.paymentStatus;
});

const paymentStatusMessage = computed(() => {
  const o = props.order;
  if (o.paymentStatus === 'PAID' || parseFloat(o.remainingAmount) <= 0) {
    return t('customer.detail.paymentComplete');
  }
  if (o.hasPendingPayment) {
    return t('customer.detail.paymentPending');
  }
  return '';
});

const { t } = useI18n();
const fileInputRef = ref<HTMLInputElement | null>(null);
const emit = defineEmits<{
  (e: 'update:message', val: string): void;
  (e: 'fileChange', ev: Event): void;
  (e: 'drop', ev: DragEvent): void;
  (e: 'dragOver'): void;
  (e: 'dragLeave'): void;
  (e: 'removeSlip'): void;
  (e: 'submit'): void;
}>();

const handleRemoveSlip = () => {
  if (fileInputRef.value) fileInputRef.value.value = '';
  emit('removeSlip');
};

const formatAmount = (val: number) =>
  val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const getOrderTitle = (order: CustomerOrder): string => {
  const first = order.customerOrderItems?.[0];
  if (first?.productName) {
    const extra = order.customerOrderItems.length > 1
      ? ` +${order.customerOrderItems.length - 1} ${t('customer.moreItems')}`
      : '';
    return first.productName + extra;
  }
  return `${t('customer.orderLabel')} #${order.orderCode || order.id}`;
};

const statusClass = (status: string) => {
  if (status === 'PAID') return 'badge-paid';
  if (status === 'PARTIAL') return 'badge-partial';
  if (status === 'PENDING_VERIFICATION') return 'badge-pending';
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

/* Items table layout */
.items-table-wrap {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e2e8f0;
}
.items-table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 80px 1fr;
  gap: 12px;
  padding: 12px 16px;
  background: #f8fafc;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
}
.items-table-body {
  display: flex;
  flex-direction: column;
}
.items-table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 80px 1fr;
  gap: 12px;
  padding: 12px 16px;
  font-size: 13px;
  color: #334155;
  border-top: 1px dashed #e2e8f0;
  align-items: center;
}
.items-table-row .col-product { font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.items-table-row .col-variant { color: #64748b; font-size: 12px; }
.items-table-row .col-qty { color: #64748b; text-align: left; }
.items-table-row .col-price { font-weight: 700; color: #1d4ed8; text-align: left; }

/* Mobile: card layout พร้อม label ในแต่ละ cell */
@media (max-width: 576px) {
  .items-table-header {
    display: none;
  }
  .items-table-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 14px 16px;
    border-top: 1px solid #e2e8f0;
    align-items: stretch;
  }
  .items-table-row .col-product,
  .items-table-row .col-variant,
  .items-table-row .col-qty,
  .items-table-row .col-price {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    text-align: left;
  }
  .items-table-row .col-product::before,
  .items-table-row .col-variant::before,
  .items-table-row .col-qty::before,
  .items-table-row .col-price::before {
    content: attr(data-label);
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }
  .items-table-row .col-product { font-weight: 600; white-space: normal; }
  .items-table-row .col-variant,
  .items-table-row .col-qty { color: #64748b; font-size: 12px; }
  .items-table-row .col-price { font-weight: 700; color: #1d4ed8; }
}

.payment-status-message {
  margin-top: 12px;
  padding: 14px 18px;
  background: #f0fdf4;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  color: #15803d;
  text-align: center;
}

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
.badge-pending { background: #e0e7ff; color: #4338ca; }
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
  position: relative;
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
/* Overlay แทน display:none เพื่อให้ file picker ทำงานบน mobile (iOS Safari ฯลฯ) */
.file-input-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
}
.file-input-overlay--disabled {
  pointer-events: none;
  cursor: default;
}
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
