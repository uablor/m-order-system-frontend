<template>
  <div class="m-dashboard">
    <a-spin :spinning="loading && !error">
      <!-- Error State -->
      <div v-if="error" class="error-state">
        <a-result
          status="warning"
          title="Some Data Failed to Load"
          :sub-title="error"
        >
          <template #extra>
            <a-button type="primary" @click="fetchWithTimeout()">
              Try Again
            </a-button>
          </template>
        </a-result>
      </div>
      
      <!-- Dashboard Content -->
      <template v-else>
      <div class="page-header !mt-5">
        <div class="page-titlek">{{ $t('merchant.dashboard.sectionOrderStats') }}</div>
        <div class="page-subtitle">{{ $t('merchant.dashboard.sectionOrderStatsDesc') }}</div>
      </div>
      <!-- Row 1: Summary Stat Cards -->
      <a-row :gutter="[16, 16]" class="stats-row">
        <a-col :xs="12" :sm="8" :md="8" :lg="4">
          <div class="stat-card stat-purple">
            <div class="stat-icon"><ShoppingCartOutlined /></div>
            <div class="stat-body">
              <a-tooltip :overlay-class-name="'blue-tooltip'">
                <template #title>{{ dashboard?.summary.totalOrders ?? 0 }}</template>
                <div class="stat-value num-truncate">{{ fmt(dashboard?.summary.totalOrders ?? 0) }}</div>
              </a-tooltip>
              <div class="stat-label">{{ $t('merchant.dashboard.totalOrders') }}</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="12" :sm="8" :md="8" :lg="4">
          <div class="stat-card stat-green">
            <div class="stat-icon"><CheckCircleOutlined /></div>
            <div class="stat-body">
              <a-tooltip :overlay-class-name="'blue-tooltip'">
                <template #title>{{ dashboard?.summary.totalPaidOrders ?? 0 }}</template>
                <div class="stat-value num-truncate">{{ fmt(dashboard?.summary.totalPaidOrders ?? 0) }}</div>
              </a-tooltip>
              <div class="stat-label">{{ $t('merchant.dashboard.totalPaidOrders') }}</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="12" :sm="8" :md="8" :lg="4">
          <div class="stat-card stat-blue">
            <div class="stat-icon"><TeamOutlined /></div>
            <div class="stat-body">
              <a-tooltip :overlay-class-name="'blue-tooltip'">
                <template #title>{{ dashboard?.summary.totalCustomers ?? 0 }}</template>
                <div class="stat-value num-truncate">{{ fmt(dashboard?.summary.totalCustomers ?? 0) }}</div>
              </a-tooltip>
              <div class="stat-label">{{ $t('merchant.dashboard.totalCustomers') }}</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="12" :sm="8" :md="8" :lg="4">
          <div class="stat-card stat-teal">
            <div class="stat-icon"><InboxOutlined /></div>
            <div class="stat-body">
              <a-tooltip :overlay-class-name="'blue-tooltip'">
                <template #title>{{ dashboard?.summary.totalArrivals ?? 0 }}</template>
                <div class="stat-value num-truncate">{{ fmt(dashboard?.summary.totalArrivals ?? 0) }}</div>
              </a-tooltip>
              <div class="stat-label">{{ $t('merchant.dashboard.totalArrivals') }}</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="12" :sm="8" :md="8" :lg="4">
          <div class="stat-card stat-orange">
            <div class="stat-icon"><AppstoreOutlined /></div>
            <div class="stat-body">
              <a-tooltip :overlay-class-name="'blue-tooltip'">
                <template #title>{{ dashboard?.summary.totalOrderItems ?? 0 }}</template>
                <div class="stat-value num-truncate">{{ fmt(dashboard?.summary.totalOrderItems ?? 0) }}</div>
              </a-tooltip>
              <div class="stat-label">{{ $t('merchant.dashboard.totalOrderItems') }}</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="12" :sm="8" :md="8" :lg="4">
          <div class="stat-card stat-indigo">
            <div class="stat-icon"><UserOutlined /></div>
            <div class="stat-body">
              <a-tooltip :overlay-class-name="'blue-tooltip'">
                <template #title>{{ dashboard?.summary.totalUsers ?? 0 }}</template>
                <div class="stat-value num-truncate">{{ fmt(dashboard?.summary.totalUsers ?? 0) }}</div>
              </a-tooltip>
              <div class="stat-label">{{ $t('merchant.dashboard.totalUsers') }}</div>
            </div>
          </div>
        </a-col>
      </a-row>
      <div class="page-header !mt-5">
        <div class="page-titlek">{{ $t('merchant.dashboard.sectionFinancialOverview') }}</div>
        <div class="page-subtitle">{{ $t('merchant.dashboard.sectionPriceByCurrencyDesc') }}</div>
      </div> 
      <!-- Row 2a: Price by Currency (non-LAK) — grid 3, placeholders when empty -->
      <a-row :gutter="[16, 16]" class="stats-row">
        <a-col :xs="24" :sm="8" :md="8" v-for="(currency, i) in displayNonLakCurrencies" :key="currency ? (currency.baseCurrency || currency.targetCurrency || 'unknown') : `placeholder-${i}`">
          <a-card :bordered="false" class="panel-card currency-card" :class="currency ? `currency-${(currency.baseCurrency || currency.targetCurrency || 'unknown').toLowerCase()}` : 'currency-placeholder'">
            <div class="currency-header">
              <span>{{ $t('merchant.dashboard.currency') }}</span>
              <span class="currency-badge" :class="currency ? `badge-${(currency.baseCurrency || currency.targetCurrency || 'unknown').toLowerCase()}` : 'badge-placeholder'">{{ currency ? (currency.baseCurrency || currency.targetCurrency || 'Unknown') : '—' }}</span>
              <!-- <span class="currency-title">{{ currency ? $t('merchant.dashboard.priceInCurrency', { currency: currency.baseCurrency || currency.targetCurrency || 'Unknown' }) : $t('merchant.dashboard.noData') }}</span> -->
            </div>
            <div class="currency-rows">
              <div class="currency-row">
                <span class="c-label">{{ $t('merchant.dashboard.totalPrice') }}</span>
                <span class="c-val">{{ currency ? fmtCurrency(parseCurrencyString(currency.totalAll)) : fmtCurrency(0) }}</span>
              </div>
              <div class="currency-row">
                <span class="c-label">{{ $t('merchant.dashboard.pricePaid') }}</span>
                <span class="c-val text-green">{{ currency ? fmtCurrency(parseCurrencyString(currency.totalPaid)) : fmtCurrency(0) }}</span>
              </div>
              <div class="currency-row">
                <span class="c-label">{{ $t('merchant.dashboard.priceUnpaid') }}</span>
                <span class="c-val text-red">{{ currency ? fmtCurrency(parseCurrencyString(currency.totalUnpaid)) : fmtCurrency(0) }}</span>
              </div>
              <!-- <div class="currency-divider" />
              <div class="currency-row">
                <span class="c-label">{{ $t('merchant.dashboard.totalInLak') }}</span>
                <span class="c-val text-blue">{{ currency ? fmtCurrency(currency.totalAllConverted) : fmtCurrency(0) }}</span>
              </div> -->
            </div>
          </a-card>
        </a-col>
      </a-row>

      <!-- Row 2b: LAK card — full width, always render, placeholder when empty -->
      <a-row :gutter="[16, 16]" class="stats-row">
        <a-col :xs="24">
          <a-card :bordered="false" class="panel-card currency-card currency-card--full currency-lak" :class="{ 'currency-placeholder': !displaySummaryLakCurrency }">
            <div class="currency-header">
              <span>{{ $t('merchant.dashboard.currency') }}</span>
              <span class="currency-badge" :class="displaySummaryLakCurrency ? 'badge-lak' : 'badge-placeholder'">{{ displaySummaryLakCurrency ? (displaySummaryLakCurrency.baseCurrency || displaySummaryLakCurrency.targetCurrency || 'LAK') : 'LAK' }}</span>
             
            </div>
            <div class="lak-summary-rows">
              <div class="currency-row">
                <span class="c-label">{{ $t('merchant.dashboard.totalPrice') }}</span>
                <a-tooltip v-if="displaySummaryLakCurrency" :overlay-class-name="'blue-tooltip'">
                  <template #title>{{ fmtCurrency(parseCurrencyString(displaySummaryLakCurrency.totalAll)) }}</template>
                  <span class="c-val num-truncate">{{ fmtCurrency(parseCurrencyString(displaySummaryLakCurrency.totalAll)) }}</span>
                </a-tooltip>
                <span v-else class="c-val">{{ fmtCurrency(0) }}</span>
              </div>
              <div class="currency-row">
                <span class="c-label">{{ $t('merchant.dashboard.pricePaid') }}</span>
                <a-tooltip v-if="displaySummaryLakCurrency" :overlay-class-name="'blue-tooltip'">
                  <template #title>{{ fmtCurrency(parseCurrencyString(displaySummaryLakCurrency.totalPaid)) }}</template>
                  <span class="c-val text-green num-truncate">{{ fmtCurrency(parseCurrencyString(displaySummaryLakCurrency.totalPaid)) }}</span>
                </a-tooltip>
                <span v-else class="c-val text-green">{{ fmtCurrency(0) }}</span>
              </div>
              <div class="currency-row">
                <span class="c-label">{{ $t('merchant.dashboard.priceUnpaid') }}</span>
                <a-tooltip v-if="displaySummaryLakCurrency" :overlay-class-name="'blue-tooltip'">
                  <template #title>{{ fmtCurrency(parseCurrencyString(displaySummaryLakCurrency.totalUnpaid)) }}</template>
                  <span class="c-val text-red num-truncate">{{ fmtCurrency(parseCurrencyString(displaySummaryLakCurrency.totalUnpaid)) }}</span>
                </a-tooltip>
                <span v-else class="c-val text-red">{{ fmtCurrency(0) }}</span>
              </div>
<<<<<<< HEAD
              <!-- <div class="currency-divider" />
              <div class="currency-row">
                <span class="c-label">{{ $t('merchant.dashboard.totalInLak') }}</span>
                <a-tooltip v-if="displayLakCurrency" :overlay-class-name="'blue-tooltip'">
                  <template #title>{{ fmtCurrency(parseCurrencyString(displayLakCurrency.totalAllConverted)) }}</template>
                  <span class="c-val text-blue num-truncate">{{ fmtCompact(parseCurrencyString(displayLakCurrency.totalAllConverted)) }}</span>
                </a-tooltip>
                <span v-else class="c-val text-blue">{{ fmtCurrency(0) }}</span>
              </div> -->
=======
>>>>>>> c214074dfe4b091661e4b92864f28127721703ab
            </div>
          </a-card>
        </a-col>
      </a-row>
      <!-- Chart: Revenue by Month (จาก API price-currency-summary-by-date) -->
      <a-row :gutter="[16, 16]" class="stats-row" style="margin-top: 24px;">
        <a-col :xs="24">
          <PriceCurrencyChart />
        </a-col>
      </a-row>

      <div class="page-header !mt-5">
        <div class="page-titlek">{{ $t('merchant.dashboard.sectionTopCustomersAndOrderItems') }}</div>
        <div class="page-subtitle">{{ $t('merchant.dashboard.sectionTopCustomersAndOrderItemsDesc') }}</div>
      </div>
      <!-- Row 4: Top Customers (left) + Latest Order Items (right) -->
      <a-row :gutter="[16, 16]" class="stats-row two-cards-row">
        <a-col :xs="24" :sm="12" :lg="12">
          <a-card :bordered="false" class="panel-card panel-card--equal">
            <div class="panel-title">
              <TrophyOutlined style="margin-right: 8px; color: #f59e0b;" />
              {{ $t('merchant.dashboard.topCustomers') }}
            </div>
            <div v-if="dashboard?.topCustomers?.customers?.length" class="customers-grid">
              <div v-for="customer in dashboard.topCustomers.customers.filter(c => c?.customerId)" :key="customer.customerId" class="customer-item">
                <div class="customer-rank">#{{ customer.rank || 0 }}</div>
                <div class="customer-info">
                  <div class="customer-name">{{ customer.customerName || 'Unknown Customer' }}</div>
                  <div class="customer-email">{{ customer.customerEmail || 'No email' }}</div>
                </div>
                <div class="customer-stats">
                  <div class="customer-amount text-green">{{ fmtCurrency(customer.totalBuyAmountLak || 0) }} LAK</div>
                  <div class="customer-orders">{{ customer.orderCount || 0 }} {{ $t('merchant.dashboard.orders') }}</div>
                </div>
              </div>
            </div>
            <div v-else class="no-data">
              <a-empty :description="$t('merchant.dashboard.noTopCustomers')" />
            </div>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="12">
          <a-card :bordered="false" class="panel-card panel-card--equal">
            <div class="panel-title">
              <AppstoreOutlined style="margin-right: 8px; color: #8b5cf6;" />
              {{ $t('merchant.dashboard.latestOrderItems') }}
            </div>
            <div v-if="latestOrderItemsLoading" class="no-data">
              <a-spin size="large" />
            </div>
            <div v-else-if="latestOrderItems?.length" class="order-items-grid">
              <RouterLink
                v-for="item in latestOrderItems"
                :key="item.id"
                :to="{ name: 'merchant-order-detail', params: { id: item.orderId } }"
                class="order-item-link"
              >
                <div class="order-item-card">
                  <div class="order-item-product">
                    <div class="order-item-name">{{ item.productName || '—' }}</div>
                    <div class="order-item-meta">
                      {{ item.variant ? `${item.variant} • ` : '' }}{{ $t('merchant.dashboard.qty') }}: {{ item.quantity }}
                    </div>
                  </div>
                  <div class="order-item-cost">
                    <div class="order-item-final text-green">{{ fmtCurrency(Number(item.finalCost)) }} LAK</div>
                    <div class="order-item-order">#{{ item.orderId }}</div>
                  </div>
                </div>
              </RouterLink>
            </div>
            <div v-else class="no-data">
              <a-empty :description="$t('merchant.dashboard.noLatestOrderItems')" />
            </div>
          </a-card>
        </a-col>
      </a-row>
      </template>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import {
  ShoppingCartOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  InboxOutlined,
  AppstoreOutlined,
  UserOutlined,
  TrophyOutlined,
} from '@ant-design/icons-vue';
import { useMerchantDashboard } from '../../../composables/merchant/useMerchantDashboard';
import { orderItemRepository } from '@/infrastructure/repositories/order-item.repository';
import type { OrderItem } from '@/domain/entities/user.entity';
import PriceCurrencyChart from './PriceCurrencyChart.vue';

const { loading, dashboard, fetchDashboard } = useMerchantDashboard();
const error = ref<string | null>(null);
const latestOrderItems = ref<OrderItem[]>([]);
const latestOrderItemsLoading = ref(false);

/* แยก LAK กับสกุลเงินอื่น — LAK แสดง full width ด้านล่าง */
const allCurrencies = computed(() =>
  (dashboard.value?.priceCurrencySummary ?? []).filter((c) => c?.baseCurrency || c?.targetCurrency)
);
const nonLakCurrencies = computed(() =>
  allCurrencies.value.filter((c) => {
    const curr = (c.baseCurrency || c.targetCurrency || '').toUpperCase();
    return curr !== 'LAK';
  })
);
const lakCurrencyTarget = computed(() => {
  const found = allCurrencies.value.find((c) => (c.targetCurrency || '').toUpperCase() === 'LAK');
  console.log('All currencies:', allCurrencies.value);
  console.log('Found LAK currency:', found);
  return found;
});
/* Financial Summary: stable grid 3 — เสมอ 3 cards (เติม placeholder ถ้ามีน้อยกว่า 3) */
const displayNonLakCurrencies = computed(() => {
  const list = nonLakCurrencies.value;
  if (list.length >= 3) return list;
  const placeholders = Array(Math.max(0, 3 - list.length)).fill(null);
  return [...list, ...placeholders] as (typeof list[0] | null)[];
});
const displaySummaryLakCurrency = computed(() => lakCurrencyTarget.value ?? null);
const safeFetchDashboard = async () => {
  error.value = null;
  try {
    console.log('Fetching dashboard data...');
    const result = await fetchDashboard();
    console.log('Dashboard fetch result:', result);
    if (!result) {
      error.value = 'Failed to fetch dashboard data';
    }
  } catch (err) {
    console.error('Dashboard fetch error:', err);
    error.value = err instanceof Error ? err.message : 'Unknown error occurred';
  }
};

// Add a timeout to prevent infinite loading
const loadingTimeout = ref<number | null>(null);

const fetchWithTimeout = async () => {
  // Clear any existing timeout
  if (loadingTimeout.value) {
    clearTimeout(loadingTimeout.value);
  }
  
  // Set a timeout to stop loading after 10 seconds
  loadingTimeout.value = window.setTimeout(() => {
    console.log('Dashboard loading timeout reached');
    error.value = 'Loading timeout - Please check your connection';
  }, 10000);
  
  await safeFetchDashboard();
  
  // Clear timeout when done
  if (loadingTimeout.value) {
    clearTimeout(loadingTimeout.value);
    loadingTimeout.value = null;
  }
};

async function fetchLatestOrderItems() {
  latestOrderItemsLoading.value = true;
  try {
    const res = await orderItemRepository.getListByMerchant({ page: 1, limit: 5 });
    latestOrderItems.value = res?.results ?? [];
  } catch {
    latestOrderItems.value = [];
  } finally {
    latestOrderItemsLoading.value = false;
  }
}

onMounted(() => {
  fetchWithTimeout();
  fetchLatestOrderItems();
});

function fmt(val: number | undefined): string {
  return (val ?? 0).toLocaleString();
}

function fmtCurrency(val: number | undefined): string {
  if (val == null) return '0';
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val);
}

<<<<<<< HEAD
function parseCurrencyString(val: string | number): number {
  if (typeof val === 'number') return val;
  if (!val || val === '') return 0;
  // Remove commas and convert to number
  return parseFloat(val.replace(/,/g, ''));
}

/* ใช้เมื่อ uncomment Financial Summary section
function getTotalRevenue(): number {
  if (!dashboard.value?.priceCurrencySummary?.length) return 0;
  return dashboard.value.priceCurrencySummary.reduce((sum, currency) => {
    if (!currency?.totalAllConverted) return sum;
    return sum + currency.totalAllConverted;
  }, 0);
}
function getTotalPaid(): number {
  if (!dashboard.value?.priceCurrencySummary?.length) return 0;
  return dashboard.value.priceCurrencySummary.reduce((sum, currency) => {
    if (!currency?.totalPaidConverted) return sum;
    return sum + currency.totalPaidConverted;
  }, 0);
}
function getTotalUnpaid(): number {
  if (!dashboard.value?.priceCurrencySummary?.length) return 0;
  return dashboard.value.priceCurrencySummary.reduce((sum, currency) => {
    if (!currency?.totalUnpaidConverted) return sum;
    return sum + currency.totalUnpaidConverted;
  }, 0);
}
function getTotalInLak(): number { return getTotalRevenue(); }
*/
=======
>>>>>>> c214074dfe4b091661e4b92864f28127721703ab
</script>

<style scoped>
.m-dashboard { padding: 0; }

.page-header { margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 600; color: #0f172a; line-height: 1.25; }
.page-titlek { font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.25; }
.page-subtitle { font-size: 13px; color: #64748b; margin-top: 2px; }

.error-state {
  padding: 40px 20px;
  text-align: center;
}

.stats-row { margin-bottom: 4px; }

/* ===== Stat Cards ===== */
.stat-card {
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04);
  background: #fff;
  transition: transform 200ms ease, box-shadow 200ms ease;
  height: 100%;
}
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(15,23,42,0.10); }
.stat-icon {
  width: 40px; height: 40px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.stat-purple .stat-icon { background: rgba(139,92,246,0.12); color: #8b5cf6; }
.stat-blue .stat-icon   { background: rgba(59,130,246,0.12);  color: #3b82f6; }
.stat-green .stat-icon  { background: rgba(34,197,94,0.12);   color: #22c55e; }
.stat-teal .stat-icon   { background: rgba(20,184,166,0.12);  color: #14b8a6; }
.stat-orange .stat-icon { background: rgba(245,158,11,0.12);  color: #f59e0b; }
.stat-indigo .stat-icon { background: rgba(99,102,241,0.12);  color: #6366f1; }

.stat-body { flex: 1; min-width: 0; }
.stat-value { font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.2; }
.stat-label { font-size: 12px; color: #64748b; margin-top: 2px; }

/* ===== Panel Card ===== */
.panel-card {
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04);
}
.panel-card--equal { height: 100%; }
@media (min-width: 768px) {
  .panel-card--equal { min-height: 280px; }
}
.two-cards-row .ant-col { display: flex; }
.two-cards-row .ant-col .panel-card { flex: 1; }
.panel-title { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 16px; }

/* ===== Currency Cards ===== */
.currency-card { height: 100%; }
.currency-card--full { height: auto; }
.currency-card--full .currency-header { margin-bottom: 16px; }
.currency-header {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 14px; padding-bottom: 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
}
.currency-badge {
  padding: 2px 10px; border-radius: 999px;
  font-size: 12px; font-weight: 800; letter-spacing: 0.5px;
  background: rgba(59, 130, 246, 0.12); color: #3b82f6;
}
.badge-thb { background: rgba(245, 158, 11, 0.12); color: #f59e0b; }
.badge-lak { background: rgba(34, 197, 94, 0.12); color: #22c55e; }
.badge-usdt { background: rgba(59, 130, 246, 0.12); color: #3b82f6; }
.badge-placeholder { background: rgba(148, 163, 184, 0.2); color: #94a3b8; }
.currency-placeholder .currency-title { color: #94a3b8; }
.currency-title { font-size: 14px; font-weight: 700; color: #0f172a; }
.currency-rows { display: flex; flex-direction: column; gap: 10px; }
.lak-summary-rows { display: flex; flex-direction: column; gap: 10px; }
.currency-row { display: flex; justify-content: space-between; align-items: center; }
.currency-divider {
  height: 1px;
  background: rgba(148, 163, 184, 0.15);
  margin: 8px 0;
}
.c-label { font-size: 12px; color: #64748b; }
.c-val { font-size: 14px; font-weight: 700; color: #0f172a; }

/* ===== Top Customers ===== */
.customers-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.customer-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}
.customer-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}
.customer-rank {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}
.customer-info {
  flex: 1;
  min-width: 0;
}
.customer-name {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 2px;
}
.customer-email {
  font-size: 12px;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.customer-stats {
  text-align: right;
  flex-shrink: 0;
}
.customer-amount {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 2px;
}
.customer-orders {
  font-size: 11px;
  color: #64748b;
}

.no-data {
  text-align: center;
  padding: 40px 20px;
}

/* ===== Latest Order Items ===== */
.order-items-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.order-item-link {
  text-decoration: none;
  color: inherit;
}
.order-item-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}
.order-item-link:hover .order-item-card {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}
.order-item-product {
  flex: 1;
  min-width: 0;
}
.order-item-name {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 2px;
}
.order-item-meta {
  font-size: 12px;
  color: #64748b;
}
.order-item-cost {
  text-align: right;
  flex-shrink: 0;
}
.order-item-final {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 2px;
}
.order-item-order {
  font-size: 11px;
  color: #64748b;
}

/* ===== Financial Grid ===== */
.fin-item { text-align: center; padding: 10px 6px; }
.fin-label { font-size: 11px; color: #94a3b8; margin-bottom: 4px; font-weight: 600; letter-spacing: 0.2px; }
.fin-value { font-size: 17px; font-weight: 700; color: #0f172a; cursor: pointer; }

/* Colors */
.text-green  { color: #22c55e !important; }
.text-blue   { color: #3b82f6 !important; }
.text-red    { color: #ef4444 !important; }
.text-orange { color: #f59e0b !important; }

.num-truncate {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== Responsive ===== */
/* Galaxy Tab S7 (768px - 1024px) */
@media (min-width: 768px) and (max-width: 1024px) {
  .page-title { font-size: 18px; }
  .page-subtitle { font-size: 12px; }
  .stat-value { font-size: 18px; }
  .stat-label { font-size: 11px; }
  .currency-title { font-size: 13px; }
  .c-val { font-size: 13px; }
  .c-label { font-size: 11px; }
  .customer-name { font-size: 13px; }
  .customer-email { font-size: 11px; }
  .customer-amount { font-size: 14px; }
  .fin-value { font-size: 14px; }
  .fin-label { font-size: 10px; }
  
  /* Adjust grid for tablet */
  .stats-row .ant-col {
    margin-bottom: 12px;
  }
}

/* Mobile < 768px */
@media (max-width: 767px) {
  .page-title { font-size: 16px; }
  .page-subtitle { display: none; }
  .stat-card { padding: 12px; gap: 10px; }
  .stat-icon { width: 34px; height: 34px; font-size: 15px; }
  .stat-value { font-size: 18px; }
  .stat-label { font-size: 11px; }
  
  /* Currency cards mobile */
  .currency-header {
    margin-bottom: 12px;
    padding-bottom: 10px;
  }
  .currency-title { font-size: 13px; }
  .currency-badge { font-size: 11px; padding: 1px 8px; }
  .c-val { font-size: 13px; }
  .c-label { font-size: 11px; }
  
  /* Financial grid mobile */
  .fin-value { font-size: 13px; }
  .fin-label { font-size: 10px; }
  .fin-item { padding: 8px 4px; }
  
  /* Top customers mobile */
  .customer-item {
    padding: 12px;
    gap: 12px;
  }
  .customer-rank {
    width: 36px;
    height: 36px;
    font-size: 13px;
  }
  .customer-name { font-size: 13px; }
  .customer-email { font-size: 11px; }
  .customer-amount { font-size: 14px; }
  .customer-orders { font-size: 10px; }
  
  /* Latest order items mobile */
  .order-item-card { padding: 12px; gap: 12px; }
  .order-item-name { font-size: 13px; }
  .order-item-meta { font-size: 11px; }
  .order-item-final { font-size: 14px; }
  
  /* Error state mobile */
  .error-state {
    padding: 20px 16px;
  }
}
</style>

<style>
.blue-tooltip .ant-tooltip-inner {
  background: #1d4ed8 !important;
  color: #fff !important;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 12px;
  max-width: 320px;
  word-break: break-word;
}
.blue-tooltip .ant-tooltip-arrow::before {
  background: #1d4ed8 !important;
}
</style>
