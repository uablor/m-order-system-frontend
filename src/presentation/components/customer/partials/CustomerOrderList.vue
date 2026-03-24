<template>
  <div class="order-list-panel">
    <!-- Greeting -->
    <div class="greeting-section">
      <div class="greeting-row">
        <div class="greeting-text">{{ $t('customer.greeting') }} {{ props.orders[0]?.customerName }}</div>
        <span class="status-badge" :class="statusClass(props.orders[0]?.paymentStatus)">● {{ getStatusText(props.orders[0]?.paymentStatus || '') }}</span>
      </div>
      <div class="greeting-sub">{{ $t('customer.greetingSub') }}</div>
    </div>

    <!-- Currency Buttons + Balance Card -->
    <div v-if="summaryItems.length > 0" class="currency-buttons-wrap">
      <a-button
        v-for="(item, idx) in summaryItems"
        :key="currencyButtonKey(item, idx)"
        type="text"
        size="small"
        class="currency-btn"
        :class="{ 'currency-btn--active': selectedCurrencyIndex === idx }"
        @click="selectedCurrencyIndex = idx"
      >
        {{ getCurrencyButtonLabel(item) }}
      </a-button>
    </div>
    <div class="balance-card">
      <div class="balance-bg-icon"><ShoppingOutlined /></div>
      <!-- <div class="balance-label">{{ $t('customer.balanceLabel') }}</div>
      <div class="balance-amount">{{ formatBalance(summary.totalDue) }}</div> -->
      <div class="balance-label">{{ $t('customer.totalProducts') }}</div>
      <div class="balance-amount">{{ formatBalance(summary.totalProducts) }}</div> 
      
      <div class="balance-breakdown">
        <div class="breakdown-item">
          <div class="breakdown-label">{{ $t('customer.paid') }}</div>
          <div class="breakdown-val">{{ formatBalance(summary.paid) }}</div>
        </div>
        <!-- <div class="breakdown-item">
          <div class="breakdown-label">{{ $t('customer.paid') }}</div>
          <div class="breakdown-val">{{ formatBalance(summary.paid) }}</div>
        </div> -->
      </div>
    </div>

    <!-- Section Header -->
    <div class="section-header">
      <div class="section-title">
        <span class="section-icon"><InboxOutlined /></span>
        <span class="section-name">{{ $t('customer.sectionTitle') }}</span>
      </div>
      <div class="section-actions">
        <a-button
          type="text"
          size="small"
          class="filter-btn"
          @click="filterVisible = true"
        >
          <SearchOutlined class="filter-icon" />
          {{ $t('customer.filterSearch') }}
        </a-button>
        <span class="section-count">{{ sectionCountText }}</span>
      </div>
    </div>

    <!-- Filter Modal: search order code อยู่ด้านบน -->
    <a-modal
      v-model:open="filterVisible"
      :title="$t('customer.filterTitle')"
      :footer="null"
      wrap-class-name="filter-modal-wrap"
      :style="{ top: '20px' }"
      :mask-style="{ background: 'transparent' }"
      :mask-closable="false"
      @cancel="handleModalClose"
    >
      <div class="filter-form filter-form--search-only">
        <div class="filter-search-row">
          <a-input
            v-model:value="filterForm.orderCode"
            :placeholder="$t('customer.filterOrderCodePlaceholder')"
            allow-clear
            size="large"
            class="filter-search-input"
            @press-enter="handleApplyFilter"
          />
          <a-button type="primary" size="large" @click="handleApplyFilter">
            <SearchOutlined />
            {{ $t('customer.filterSearch') }}
          </a-button>
        </div>
      </div>
    </a-modal>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <a-spin size="large" />
      <div class="loading-text">{{ $t('customer.loadingOrders') }}</div>
    </div>

    <!-- Error -->
    <div v-else-if="errorMsg" class="error-state">
      <div class="error-text">{{ errorMsg }}</div>
    </div>

    <!-- Order List -->
    <div v-else class="list-and-pagination">
      <div class="product-list-scroll">
        <div class="product-list">
          <div
            v-for="order in orders"
            :key="order.id"
            class="product-card"
            :class="{ 'product-card--active': selectedOrderId === order.id }"
            @click="$emit('select', order)"
          >
            <div class="product-img-wrap">
              <div class="product-img-placeholder"><ShoppingOutlined /></div>
            </div>
            <div class="product-info">
              <div class="product-top-row">
                <span class="product-sku">{{ $t('customer.orderLabel') }} #{{ getOrderDisplayCode(order) }}</span>
                <span class="product-date">{{ formatDate(order.createdAt) }}</span>
              </div>
              <!-- <div class="product-name">
                {{ getOrderTitle(order) }}jjj
              </div> -->
              <div class="product-bottom-row">
                <span class="product-price">{{ formatOrderAmount(order.remainingAmount, order.customerOrderItems?.[0]?.exchangeRateSell?.baseCurrency || null) }}</span>
                <span class="product-status" :class="statusClass(displayPaymentStatus(order))">
                  {{ $t(`customer.paymentStatus.${displayPaymentStatus(order)}`) }}
                </span>
              </div>
            </div>
            <RightOutlined class="card-arrow" />
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="orders.length === 0" class="empty-state">
          <InboxOutlined class="empty-icon" />
          <div class="empty-text">{{ $t('customer.emptyText') }}</div>
        </div>
      </div>

      <!-- Pagination: แสดงเฉพาะเมื่อมีหลายหน้า (ซ่อนเมื่อ filter order code) -->
      <div v-if="orders.length > 0 && paginationData.totalPages > 1" class="pagination-wrap">
        <div class="pagination-row">
          <a-select
            v-model:value="localLimit"
            size="small"
            class="limit-select"
            @change="handleLimitChange"
          >
            <a-select-option v-for="opt in limitOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </a-select-option>
          </a-select>
          <a-pagination
            v-if="paginationData.totalPages > 1 && paginationData.total > 0"
            :current="paginationData.page"
            :total="paginationData.total"
            :page-size="paginationData.limit"
            :show-size-changer="false"
            size="small"
            show-less-items
            @change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ShoppingOutlined, InboxOutlined, RightOutlined, SearchOutlined } from '@ant-design/icons-vue';
import type { CustomerOrder, CustomerOrderSummaryItem } from '@/infrastructure/repositories/customer-order.repository';
import { formatDate } from '@/shared/utils/date.utils';
import type { BackendPagination } from '@/shared/types/backend-response.types';

const defaultPagination: BackendPagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

import type { CustomerOrderFilters } from '@/infrastructure/repositories/customer-order.repository';

const props = withDefaults(
  defineProps<{
    orders: CustomerOrder[];
    summary: CustomerOrderSummaryItem[];
    pagination?: BackendPagination;
    filters?: CustomerOrderFilters;
    selectedOrderId: number | null;
    loading: boolean;
    errorMsg: string;
    customerFirstName: string;
  }>(),
  {
    pagination: () =>
      ({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      }) as BackendPagination,
  }
);

const paginationData = computed(() => props.pagination ?? defaultPagination);

const sectionCountText = computed(() => {
  const p = paginationData.value;
  if (p.total <= 0 || p.totalPages <= 1) return `${props.orders.length} ${t('customer.items')}`;
  const start = (p.page - 1) * p.limit + 1;
  const end = Math.min(p.page * p.limit, p.total);
  return `${start}-${end} / ${p.total} ${t('customer.items')}`;
});

const limitOptions = computed(() => [
  { value: 10, label: `10 ${t('customer.perPage')}` },
  { value: 20, label: `20 ${t('customer.perPage')}` },
  { value: 50, label: `50 ${t('customer.perPage')}` },
  { value: 100, label: `100 ${t('customer.perPage')}` },
]);

const localLimit = ref(10);

watch(
  () => paginationData.value.limit,
  (v) => { localLimit.value = v; },
  { immediate: true }
);

const handlePageChange = (newPage: number) => {
  emit('page-change', newPage);
};

const handleLimitChange = (newLimit: number) => {
  emit('page-change', 1, newLimit);
};

const emit = defineEmits<{
  (e: 'select', order: CustomerOrder): void;
  (e: 'page-change', page: number, limit?: number): void;
  (e: 'filter-change', filters: CustomerOrderFilters): void;
}>();

const filterVisible = ref(false);
const filterForm = ref<CustomerOrderFilters>({
  orderCode: '',
  paymentStatus: undefined,
  startDate: undefined,
  endDate: undefined,
});

watch(
  () => props.filters,
  (f) => {
    filterForm.value = {
      orderCode: f?.orderCode ?? '',
      paymentStatus: f?.paymentStatus,
      startDate: f?.startDate,
      endDate: f?.endDate,
    };
  },
  { immediate: true }
);

const handleApplyFilter = () => {
  const f = filterForm.value;
  const searchVal = f.orderCode?.trim() || '';
  emit('filter-change', {
    orderCode: searchVal || undefined,
  });
  // ไม่ปิด modal — รอให้ user กดปุ่ม close
};

const handleModalClose = () => {
  filterVisible.value = false;
  emit('filter-change', { orderCode: undefined });
};

const openFilterModal = () => {
  filterVisible.value = true;
};

defineExpose({ openFilterModal });

const { t } = useI18n();

/** รายการ summary จาก API (แต่ละสกุลเงิน) */
const summaryItems = computed(() => props.summary ?? []);

/** index ของสกุลเงินที่เลือก (default: LAK target ถ้ามี ไม่งั้น item แรก) */
const selectedCurrencyIndex = ref(0);

/** ตั้งค่า default เมื่อ summary โหลด — เลือก LAK target ก่อน ถ้าไม่มีใช้ item แรก */
watch(
  summaryItems,
  (items) => {
    if (items.length === 0) return;
    const lakTargetIdx = items.findIndex((x: any) => x.targetCurrency === 'LAK');
    selectedCurrencyIndex.value = lakTargetIdx >= 0 ? lakTargetIdx : 0;
  },
  { immediate: true }
);

const currencyButtonKey = (item: CustomerOrderSummaryItem, idx: number) =>
  `${item.baseCurrency ?? ''}-${item.targetCurrency ?? ''}-${idx}`;

const getCurrencyButtonLabel = (item: CustomerOrderSummaryItem) => {
  const code = item.baseCurrency ?? item.targetCurrency ?? '';
  return item.targetCurrency ? `${code} (${t('customer.currencyAll')})` : code;
};

/** summary ที่เลือก — ใช้ข้อมูลของสกุลเงินที่กดปุ่ม */
const summary = computed(() => {
  const items = summaryItems.value;
  const idx = selectedCurrencyIndex.value;
  const item = items[idx] ?? items[0];
  if (!item) return { totalDue: 0, totalProducts: 0, paid: 0 };
  return {
    totalDue: Number(item.totalUnpaid ?? 0),
    totalProducts: Number(item.totalAll ?? 0),
    paid: Number(item.totalPaid ?? 0),
  };
});

const displayCurrency = computed(() => {
  const items = summaryItems.value;
  const idx = selectedCurrencyIndex.value;
  const item = items[idx] ?? items[0];
  if (!item) return null;
  return (item as any).baseCurrency ?? (item as any).targetCurrency ?? null;
});

const currencySymbol = (code: string | null) => {
  if (!code) return '₭';
  const map: Record<string, string> = { LAK: '₭', THB: '฿', USD: '$', USDT: 'USDT' };
  return map[code] ?? code;
};

const formatAmount = (val: number) =>
  val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const formatBalance = (val: number) => {
  const sym = currencySymbol(displayCurrency.value);
  return `${formatAmount(val)} ${sym}`;
};

const formatOrderAmount = (amountStr: string, targetCurrency: string | null) => {
  const val = parseFloat(amountStr) || 0;
  const sym = currencySymbol(targetCurrency);
  return `${formatAmount(val)} ${sym}`;
};

const getOrderDisplayCode = (order: CustomerOrder): string => {
  if (order.orderCode) return order.orderCode;
  return String(order.id);
};

const getOrderTitle = (order: CustomerOrder): string => {
  const first = order.customerOrderItems?.[0];
  if (first?.productName) return first.productName;
  return `${t('customer.orderLabel')} #${getOrderDisplayCode(order)}`;
};

/** สถานะที่แสดง: ถ้ามี payment รอตรวจสอบ ให้แสดง PENDING_VERIFICATION */
const displayPaymentStatus = (order: CustomerOrder): string => {
  if (order.hasPendingPayment) return 'PENDING_VERIFICATION';
  return order.paymentStatus;
};

const statusClass = (status: string | undefined) => {
  if (!status) return 'status-pending';
  if (status === 'PAID') return 'status-ready';
  if (status === 'PARTIAL') return 'status-waiting';
  if (status === 'PENDING_VERIFICATION') return 'status-waiting';
  return 'status-pending';
};

const getStatusText = (status: string | undefined) => {
  if (!status) return t('customer.paymentStatus.UNPAID');
  return t(`customer.paymentStatus.${status}`);
};
</script>

<style scoped>
.order-list-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.greeting-section { padding: 20px 20px 0; }
.greeting-row {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 8px; margin-bottom: 6px;
}
.greeting-text { font-size: clamp(18px, 5vw, 22px); font-weight: 800; color: #0f172a; line-height: 1.3; }
.status-badge {
  font-size: 11px; font-weight: 700; border-radius: 999px;
  padding: 4px 12px; white-space: nowrap; flex-shrink: 0; margin-top: 3px;
}
.status-badge.pending { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
.greeting-sub { font-size: 13px; color: #64748b; }

.currency-buttons-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 20px 0;
}
.currency-btn {
  font-size: 12px !important;
  font-weight: 600 !important;
  border-radius: 10px !important;
  /* padding: 6px 14px !important; */
  color: #64748b !important;
  background: #f1f5f9 !important;
  border: 1px solid #e2e8f0 !important;
}
.currency-btn:hover {
  color: #1d4ed8 !important;
  background: #eff6ff !important;
  border-color: #93c5fd !important;
}
.currency-btn--active {
  color: #fff !important;
  background: #1d4ed8 !important;
  border-color: #1d4ed8 !important;
}

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

.section-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 20px 8px;
}
.section-title { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; color: #0f172a; }
.section-icon { font-size: 18px; color: #1d4ed8; }
.section-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.filter-btn {
  display: inline-flex !important;
  align-items: center !important;
  gap: 4px !important;
  font-size: 12px !important;
  color: #1d4ed8 !important;
  padding: 4px 10px !important;
}
.filter-btn:hover { color: #2563eb !important; background: #eff6ff !important; }
.filter-icon { font-size: 14px; }
.section-count { font-size: 12px; color: #94a3b8; background: #f1f5f9; border-radius: 999px; padding: 2px 10px; }

/* Filter Modal - แสดงด้านบน (ใช้ global เพราะ modal teleport ไป body) */
.filter-form { display: flex; flex-direction: column; gap: 16px; padding: 8px 0; }
.filter-form--search-only .filter-search-row {
  display: flex;
  gap: 12px;
  align-items: center;
}
.filter-form--search-only .filter-search-input { flex: 1; min-width: 0; }
.filter-field { display: flex; flex-direction: column; gap: 6px; }
.filter-label { font-size: 13px; font-weight: 600; color: #334155; }
.filter-input { width: 100% !important; }
.filter-date { width: 100% !important; }

.loading-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px 20px; }
.loading-text { font-size: 14px; color: #64748b; }
.error-state { padding: 24px 20px; }
.error-text { font-size: 13px; color: #ef4444; background: #fef2f2; border-radius: 10px; padding: 12px 16px; }

.list-and-pagination {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.product-list-scroll {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 12px;
  /* border: 1px solid rgb(36, 79, 179); */

  margin-bottom: 80px;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}
.product-list-scroll::-webkit-scrollbar { width: 4px; }
.product-list-scroll::-webkit-scrollbar-track { background: transparent; }
.product-list-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

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
  overflow: hidden; flex-shrink: 0; background: #eff6ff;
}
.product-img-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 26px; color: #93c5fd;
}
.card-arrow { color: #cbd5e1; font-size: 12px; flex-shrink: 0; margin-left: auto; }

.product-info { flex: 1; min-width: 0; }
.product-top-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
.product-sku { font-size: 11px; font-weight: 700; color: #1d4ed8; }
.product-date { font-size: 11px; color: #94a3b8; }
.product-name {
  font-size: 13px; font-weight: 600; color: #1e293b; line-height: 1.4;
  margin-bottom: 7px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.product-bottom-row { display: flex; justify-content: space-between; align-items: center; }
.product-price { font-size: 16px; font-weight: 800; color: #1d4ed8; }
.product-status { font-size: 11px; font-weight: 700; border-radius: 999px; padding: 2px 9px; display: inline-block; text-align: center; }
.status-ready { background: #dcfce7; color: #15803d; }
.status-pending { background: #fef3c7; color: #b45309; }
.status-waiting { background: #e0e7ff; color: #3730a3; }

.empty-state { text-align: center; padding: 48px 20px; color: #94a3b8; }
.empty-icon { font-size: 48px; margin-bottom: 12px; display: block; }
.empty-text { font-size: 14px; }

.pagination-wrap {
  flex-shrink: 0;
  padding: 12px 20px 16px;
  background: #f5f7fa;
  border-top: 1px solid #e2e8f0;
}
.pagination-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}
.limit-select {
  width: 90px;
}
.pagination-wrap :deep(.ant-pagination) {
  font-size: 12px;
}
.pagination-wrap :deep(.ant-pagination-item) {
  min-width: 28px;
  height: 28px;
  line-height: 26px;
}
</style>

<style>
/* Filter Modal - แสดงด้านบน (global เพราะ modal teleport ไป body) */
.filter-modal-wrap .ant-modal {
  padding-bottom: 0;
  top: 20px !important;
}
.filter-modal-wrap .ant-modal-content {
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}
</style>
