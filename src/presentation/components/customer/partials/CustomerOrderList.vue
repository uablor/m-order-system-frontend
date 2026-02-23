<template>
  <div class="order-list-panel">
    <!-- Greeting -->
    <div class="greeting-section">
      <div class="greeting-row">
        <div class="greeting-text">{{ $t('customer.greeting') }} {{ customerFirstName }}</div>
        <span class="status-badge pending">● {{ $t('customer.statusPending') }}</span>
      </div>
      <div class="greeting-sub">{{ $t('customer.greetingSub') }}</div>
    </div>

    <!-- Balance Card -->
    <div class="balance-card">
      <div class="balance-bg-icon"><ShoppingOutlined /></div>
      <div class="balance-label">{{ $t('customer.balanceLabel') }}</div>
      <div class="balance-amount">{{ formatAmount(summary.totalDue) }} ₭</div>
      <div class="balance-breakdown">
        <div class="breakdown-item">
          <div class="breakdown-label">{{ $t('customer.totalProducts') }}</div>
          <div class="breakdown-val">{{ formatAmount(summary.totalProducts) }} ₭</div>
        </div>
        <div class="breakdown-item">
          <div class="breakdown-label">{{ $t('customer.paid') }}</div>
          <div class="breakdown-val">{{ formatAmount(summary.paid) }} ₭</div>
        </div>
      </div>
    </div>

    <!-- Section Header -->
    <div class="section-header">
      <div class="section-title">
        <span class="section-icon"><InboxOutlined /></span>
        <span class="section-name">{{ $t('customer.sectionTitle') }}</span>
      </div>
      <span class="section-count">{{ orders.length }} {{ $t('customer.items') }}</span>
    </div>

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
    <div v-else class="product-list-scroll">
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
              <span class="product-sku">{{ $t('customer.orderLabel') }} #{{ order.id }}</span>
              <span class="product-date">{{ formatDate(order.createdAt) }}</span>
            </div>
            <div class="product-name">
              {{ getOrderTitle(order) }}
            </div>
            <div class="product-bottom-row">
              <span class="product-price">{{ formatAmount(parseFloat(order.remainingAmount)) }} ₭</span>
              <span class="product-status" :class="statusClass(order.paymentStatus)">
                {{ $t(`customer.paymentStatus.${order.paymentStatus}`) }}
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ShoppingOutlined, InboxOutlined, RightOutlined } from '@ant-design/icons-vue';
import type { CustomerOrder } from '@/infrastructure/repositories/customer-order.repository';
import dayjs from 'dayjs';

const props = defineProps<{
  orders: CustomerOrder[];
  selectedOrderId: number | null;
  loading: boolean;
  errorMsg: string;
  customerFirstName: string;
}>();

defineEmits<{
  (e: 'select', order: CustomerOrder): void;
}>();

const { t } = useI18n();

const summary = computed(() => {
  return props.orders.reduce(
    (acc, o) => {
      acc.totalDue += parseFloat(o.remainingAmount) || 0;
      acc.totalProducts += parseFloat(o.totalSellingAmountLak) || 0;
      acc.paid += parseFloat(o.totalPaid) || 0;
      return acc;
    },
    { totalDue: 0, totalProducts: 0, paid: 0 },
  );
});

const formatAmount = (val: number) =>
  val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const formatDate = (dt: string) => dayjs(dt).format('DD/MM/YYYY');

const getOrderTitle = (order: CustomerOrder): string => {
  const first = order.customerOrderItems?.[0];
  if (first?.productName) return first.productName;
  return `${t('customer.orderLabel')} #${order.id}`;
};

const statusClass = (status: string) => {
  if (status === 'PAID') return 'status-ready';
  if (status === 'PARTIAL') return 'status-waiting';
  return 'status-pending';
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
.section-count { font-size: 12px; color: #94a3b8; background: #f1f5f9; border-radius: 999px; padding: 2px 10px; }

.loading-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px 20px; }
.loading-text { font-size: 14px; color: #64748b; }
.error-state { padding: 24px 20px; }
.error-text { font-size: 13px; color: #ef4444; background: #fef2f2; border-radius: 10px; padding: 12px 16px; }

.product-list-scroll {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 16px;
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
.product-status { font-size: 11px; font-weight: 700; border-radius: 999px; padding: 2px 9px; }
.status-ready { background: #dcfce7; color: #15803d; }
.status-pending { background: #fef3c7; color: #b45309; }
.status-waiting { background: #e0e7ff; color: #3730a3; }

.empty-state { text-align: center; padding: 48px 20px; color: #94a3b8; }
.empty-icon { font-size: 48px; margin-bottom: 12px; display: block; }
.empty-text { font-size: 14px; }
</style>
