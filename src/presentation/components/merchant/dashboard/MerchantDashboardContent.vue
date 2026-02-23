<template>
  <div class="m-dashboard">
    <div class="page-header">
      <div class="page-title">{{ $t('merchant.dashboard.title') }}</div>
      <div class="page-subtitle">{{ $t('merchant.dashboard.subtitle') }}</div>
    </div>

    <a-spin :spinning="loading">
      <!-- Row 1: Stat Cards -->
      <a-row :gutter="[16, 16]" class="stats-row">
        <a-col :xs="24" :sm="12" :md="6">
          <div class="stat-card stat-purple">
            <div class="stat-icon"><ShoppingCartOutlined /></div>
            <div class="stat-body">
              <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ dashboard?.totalOrders ?? 0 }}</template><div class="stat-value num-truncate">{{ truncNum(dashboard?.totalOrders ?? 0) }}</div></a-tooltip>
              <div class="stat-label">{{ $t('merchant.dashboard.totalOrders') }}</div>
              <div class="stat-sub">{{ dashboard?.totalOrdersThisMonth ?? 0 }} {{ $t('merchant.dashboard.ordersThisMonth') }}</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <div class="stat-card stat-blue">
            <div class="stat-icon"><TeamOutlined /></div>
            <div class="stat-body">
              <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ dashboard?.totalCustomers ?? 0 }}</template><div class="stat-value num-truncate">{{ truncNum(dashboard?.totalCustomers ?? 0) }}</div></a-tooltip>
              <div class="stat-label">{{ $t('merchant.dashboard.totalCustomers') }}</div>
              <div class="stat-sub">{{ $t('merchant.dashboard.customersDesc') }}</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <div class="stat-card stat-green">
            <div class="stat-icon"><CheckCircleOutlined /></div>
            <div class="stat-body">
              <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ dashboard?.totalArrivals ?? 0 }}</template><div class="stat-value num-truncate">{{ truncNum(dashboard?.totalArrivals ?? 0) }}</div></a-tooltip>
              <div class="stat-label">{{ $t('merchant.dashboard.totalArrivals') }}</div>
              <div class="stat-sub">{{ $t('merchant.dashboard.arrivalsDesc') }}</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6">
          <div class="stat-card stat-orange">
            <div class="stat-icon"><WalletOutlined /></div>
            <div class="stat-body">
              <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatCurrency(Number(dashboard?.totalOutstandingAmountLak ?? 0)) }}</template><div class="stat-value num-truncate">{{ truncNum(Number(dashboard?.totalOutstandingAmountLak ?? 0)) }}</div></a-tooltip>
              <div class="stat-label">{{ $t('merchant.dashboard.outstandingBalance') }}</div>
              <div class="stat-sub">{{ $t('merchant.dashboard.outstandingDesc') }}</div>
            </div>
          </div>
        </a-col>
      </a-row>

      <!-- Row 2: Payment Status + Arrival Status -->
      <a-row :gutter="[16, 16]" class="stats-row status-equal-row">
        <a-col :xs="24" :md="12">
          <a-card :bordered="false" class="panel-card">
            <div class="panel-title">{{ $t('merchant.dashboard.paymentStatus') }}</div>
            <div class="status-bars">
              <div class="bar-item">
                <span class="bar-label">{{ $t('merchant.dashboard.unpaid') }}</span>
                <a-progress :percent="paymentPercent('UNPAID')" :stroke-color="'#ef4444'" :show-info="false" size="small" />
                <span class="bar-count">{{ dashboard?.ordersByPaymentStatus?.UNPAID ?? 0 }}</span>
              </div>
              <div class="bar-item">
                <span class="bar-label">{{ $t('merchant.dashboard.partial') }}</span>
                <a-progress :percent="paymentPercent('PARTIAL')" :stroke-color="'#f59e0b'" :show-info="false" size="small" />
                <span class="bar-count">{{ dashboard?.ordersByPaymentStatus?.PARTIAL ?? 0 }}</span>
              </div>
              <div class="bar-item">
                <span class="bar-label">{{ $t('merchant.dashboard.paid') }}</span>
                <a-progress :percent="paymentPercent('PAID')" :stroke-color="'#22c55e'" :show-info="false" size="small" />
                <span class="bar-count">{{ dashboard?.ordersByPaymentStatus?.PAID ?? 0 }}</span>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :xs="24" :md="12">
          <a-card :bordered="false" class="panel-card">
            <div class="panel-title">{{ $t('merchant.dashboard.arrivalStatus') }}</div>
            <div class="status-bars">
              <div class="bar-item">
                <span class="bar-label">{{ $t('merchant.dashboard.notArrived') }}</span>
                <a-progress :percent="arrivalPercent('NOT_ARRIVED')" :stroke-color="'#f59e0b'" :show-info="false" size="small" />
                <span class="bar-count">{{ dashboard?.ordersByArrivalStatus?.NOT_ARRIVED ?? 0 }}</span>
              </div>
              <div class="bar-item">
                <span class="bar-label">{{ $t('merchant.dashboard.arrived') }}</span>
                <a-progress :percent="arrivalPercent('ARRIVED')" :stroke-color="'#22c55e'" :show-info="false" size="small" />
                <span class="bar-count">{{ dashboard?.ordersByArrivalStatus?.ARRIVED ?? 0 }}</span>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <!-- Row 3: Financial Overview -->
      <a-row :gutter="[16, 16]" class="stats-row">
        <a-col :xs="24">
          <a-card :bordered="false" class="panel-card">
            <div class="panel-title">{{ $t('merchant.dashboard.financialOverview') }}</div>
            <a-row :gutter="[16, 12]">
              <a-col :xs="12" :sm="8" :md="4">
                <div class="fin-item">
                  <div class="fin-label">{{ $t('merchant.dashboard.totalFinalCost') }}</div>
                  <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatCurrency(Number(dashboard?.totalFinalCostLak ?? 0)) }}</template><div class="fin-value num-truncate">{{ truncNum(Number(dashboard?.totalFinalCostLak ?? 0)) }}</div></a-tooltip>
                </div>
              </a-col>
              <a-col :xs="12" :sm="8" :md="4">
                <div class="fin-item">
                  <div class="fin-label">{{ $t('merchant.dashboard.totalRevenueLAK') }}</div>
                  <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatCurrency(Number(dashboard?.totalRevenueLak ?? 0)) }}</template><div class="fin-value text-green num-truncate">{{ truncNum(Number(dashboard?.totalRevenueLak ?? 0)) }}</div></a-tooltip>
                </div>
              </a-col>
              <a-col :xs="12" :sm="8" :md="4">
                <div class="fin-item">
                  <div class="fin-label">{{ $t('merchant.dashboard.totalRevenueTHB') }}</div>
                  <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatCurrency(Number(dashboard?.totalRevenueThb ?? 0)) }}</template><div class="fin-value text-green num-truncate">{{ truncNum(Number(dashboard?.totalRevenueThb ?? 0)) }}</div></a-tooltip>
                </div>
              </a-col>
              <a-col :xs="12" :sm="8" :md="4">
                <div class="fin-item">
                  <div class="fin-label">{{ $t('merchant.dashboard.totalProfitLAK') }}</div>
                  <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatCurrency(Number(dashboard?.totalProfitLak ?? 0)) }}</template><div class="fin-value text-blue num-truncate">{{ truncNum(Number(dashboard?.totalProfitLak ?? 0)) }}</div></a-tooltip>
                </div>
              </a-col>
              <a-col :xs="12" :sm="8" :md="4">
                <div class="fin-item">
                  <div class="fin-label">{{ $t('merchant.dashboard.totalProfitTHB') }}</div>
                  <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatCurrency(Number(dashboard?.totalProfitThb ?? 0)) }}</template><div class="fin-value text-blue num-truncate">{{ truncNum(Number(dashboard?.totalProfitThb ?? 0)) }}</div></a-tooltip>
                </div>
              </a-col>
              <a-col :xs="12" :sm="8" :md="4">
                <div class="fin-item">
                  <div class="fin-label">{{ $t('merchant.dashboard.totalOutstanding') }}</div>
                  <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatCurrency(Number(dashboard?.totalOutstandingAmountLak ?? 0)) }}</template><div class="fin-value text-red num-truncate">{{ truncNum(Number(dashboard?.totalOutstandingAmountLak ?? 0)) }}</div></a-tooltip>
                </div>
              </a-col>
            </a-row>
          </a-card>
        </a-col>
      </a-row>

      <!-- Row 4: Annual Report Chart -->
      <a-row :gutter="[16, 16]" class="stats-row">
        <a-col :xs="24">
          <a-card :bordered="false" class="panel-card">
            <div class="panel-header-row">
              <div class="panel-title">{{ $t('merchant.dashboard.annualReport') }}</div>
              <div class="chart-controls">
                <div class="chart-legend">
                  <span class="legend-item">
                    <span class="legend-dot" style="background:#6366f1"></span>
                    <span class="legend-text">{{ $t('merchant.dashboard.orders') }}</span>
                  </span>
                  <span class="legend-item">
                    <span class="legend-dot" style="background:#22c55e"></span>
                    <span class="legend-text">{{ $t('merchant.dashboard.totalRevenueLAK') }}</span>
                  </span>
                  <span class="legend-item">
                    <span class="legend-dot" style="background:#3b82f6"></span>
                    <span class="legend-text">{{ $t('merchant.dashboard.totalProfitLAK') }}</span>
                  </span>
                </div>
                <a-input-number
                  :value="selectedYear"
                  :min="2020"
                  :max="currentYear + 1"
                  :controls="true"
                  class="year-input"
                  @change="onYearInputChange"
                  @pressEnter="onYearInputEnter"
                />
              </div>
            </div>

            <div class="chart-legend-mobile">
              <span class="legend-item">
                <span class="legend-dot" style="background:#6366f1"></span>
                <span class="legend-text">{{ $t('merchant.dashboard.orders') }}</span>
              </span>
              <span class="legend-item">
                <span class="legend-dot" style="background:#22c55e"></span>
                <span class="legend-text">{{ $t('merchant.dashboard.totalRevenueLAK') }}</span>
              </span>
              <span class="legend-item">
                <span class="legend-dot" style="background:#3b82f6"></span>
                <span class="legend-text">{{ $t('merchant.dashboard.totalProfitLAK') }}</span>
              </span>
            </div>

            <div v-if="chartMonths.length" class="chart-area" @touchend="hideTooltip">
              <div class="chart-scroll">
                <svg
                  :viewBox="`0 0 ${svgW} ${svgH}`"
                  :style="{ width: svgW + 'px', minWidth: '100%' }"
                  :height="svgH"
                  class="bar-chart-svg"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <line
                    v-for="(gl, gi) in gridLines"
                    :key="'gl-' + gi"
                    :x1="cPadL"
                    :y1="gl.y"
                    :x2="svgW - cPadR"
                    :y2="gl.y"
                    stroke="#f1f5f9"
                    stroke-width="1"
                  />
                  <text
                    v-for="(gl, gi) in gridLines"
                    :key="'gt-' + gi"
                    :x="cPadL - 6"
                    :y="gl.y + 4"
                    text-anchor="end"
                    class="chart-axis-label"
                  >{{ gl.label }}</text>

                  <g v-for="(m, i) in chartMonths" :key="m.month">
                    <rect
                      :x="gx(i)"
                      :y="by(m.orderCount, maxOrders)"
                      :width="bw"
                      :height="bh(m.orderCount, maxOrders)"
                      rx="3" ry="3"
                      fill="#6366f1"
                      class="chart-bar"
                      @mouseenter="onBarEnter($event, m)"
                      @mousemove="onBarMove($event)"
                      @mouseleave="hideTooltip"
                      @touchstart.passive="onBarTouch($event, m)"
                    />
                    <rect
                      :x="gx(i) + bw + bg"
                      :y="by(Number(m.revenueLak), maxRevenue)"
                      :width="bw"
                      :height="bh(Number(m.revenueLak), maxRevenue)"
                      rx="3" ry="3"
                      fill="#22c55e"
                      class="chart-bar"
                      @mouseenter="onBarEnter($event, m)"
                      @mousemove="onBarMove($event)"
                      @mouseleave="hideTooltip"
                      @touchstart.passive="onBarTouch($event, m)"
                    />
                    <rect
                      :x="gx(i) + (bw + bg) * 2"
                      :y="by(Number(m.profitLak), maxRevenue)"
                      :width="bw"
                      :height="bh(Number(m.profitLak), maxRevenue)"
                      rx="3" ry="3"
                      fill="#3b82f6"
                      class="chart-bar"
                      @mouseenter="onBarEnter($event, m)"
                      @mousemove="onBarMove($event)"
                      @mouseleave="hideTooltip"
                      @touchstart.passive="onBarTouch($event, m)"
                    />

                    <text
                      v-if="!isMobile"
                      :x="gx(i) + bw / 2"
                      :y="by(m.orderCount, maxOrders) - 4"
                      text-anchor="middle"
                      class="bar-val-label"
                      fill="#6366f1"
                    >{{ m.orderCount }}</text>

                    <text
                      :x="gx(i) + gw / 2"
                      :y="svgH - 6"
                      text-anchor="middle"
                      class="chart-month-label"
                    >{{ isMobile ? String(m.month) : shortMonthName(m.monthName) }}</text>
                  </g>
                </svg>
              </div>

              <Teleport to="body">
                <div
                  v-if="tt.show"
                  class="chart-tooltip"
                  :style="ttStyle"
                >
                  <div class="tooltip-title">{{ tt.monthName }}</div>
                  <div class="tooltip-row">
                    <span class="tooltip-dot" style="background:#6366f1"></span>
                    {{ $t('merchant.dashboard.orders') }}: <strong>{{ tt.orders }}</strong>
                  </div>
                  <div class="tooltip-row">
                    <span class="tooltip-dot" style="background:#22c55e"></span>
                    {{ $t('merchant.dashboard.totalRevenueLAK') }}: <strong>{{ tt.revenue }}</strong>
                  </div>
                  <div class="tooltip-row">
                    <span class="tooltip-dot" style="background:#3b82f6"></span>
                    {{ $t('merchant.dashboard.totalProfitLAK') }}: <strong>{{ tt.profit }}</strong>
                  </div>
                </div>
              </Teleport>
            </div>
            <a-empty v-else :description="$t('merchant.dashboard.noData')" />
          </a-card>
        </a-col>
      </a-row>

      <!-- Row 5: Latest Orders -->
      <a-row :gutter="[16, 16]" class="stats-row">
        <a-col :xs="24">
          <a-card :bordered="false" class="panel-card">
            <div class="panel-header-row">
              <div class="panel-title">{{ $t('merchant.dashboard.latestOrders.title') }}</div>
              <a class="view-all-link" @click="goOrders">{{ $t('merchant.dashboard.latestOrders.viewAll') }}</a>
            </div>

            <a-empty v-if="!loading && latestOrders.length === 0" :description="$t('merchant.dashboard.latestOrders.noOrders')" class="py-6" />

            <!-- Desktop table -->
            <a-table
              v-else-if="!isMobile"
              :columns="latestColumns"
              :data-source="mappedOrders"
              :pagination="false"
              row-key="id"
              size="middle"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'customer'">
                  <div class="order-cell">
                    <a-avatar :style="{ backgroundColor: record.avatarColor, flexShrink: 0 }">{{ record.avatarText }}</a-avatar>
                    <div>
                      <div class="font-medium text-slate-900">{{ record.customerName }}</div>
                      <div class="text-slate-500 text-xs">{{ record.orderCode }}</div>
                    </div>
                  </div>
                </template>
                <template v-else-if="column.key === 'status'">
                  <a-tag :color="record.statusColor" class="status-tag">{{ record.statusText }}</a-tag>
                </template>
                <template v-else-if="column.key === 'total'">
                  <div class="font-semibold text-slate-900">{{ formatCurrency(record.totalAmount) }}</div>
                </template>
              </template>
            </a-table>

            <!-- Mobile card list -->
            <div v-else class="latest-mobile">
              <div v-for="o in mappedOrders" :key="o.id" class="mobile-order-card">
                <div class="mobile-order-top">
                  <a-avatar size="small" :style="{ backgroundColor: o.avatarColor }">{{ o.avatarText }}</a-avatar>
                  <div class="mobile-order-info">
                    <div class="mobile-order-code">#{{ o.orderCode }}</div>
                    <div class="mobile-order-customer">{{ o.customerName }}</div>
                  </div>
                  <a-tag :color="o.statusColor" class="status-tag">{{ o.statusText }}</a-tag>
                </div>
                <div class="mobile-order-bottom">
                  <span class="mobile-order-label">{{ $t('merchant.dashboard.table.total') }}</span>
                  <span class="mobile-order-amount">{{ formatCurrency(o.totalAmount) }}</span>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  ShoppingCartOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  WalletOutlined,
} from '@ant-design/icons-vue';
import { useMerchantDashboard } from '../../../composables/merchant/useMerchantDashboard';

const router = useRouter();
const { t } = useI18n();
const {
  loading,
  dashboard,
  annualReport,
  selectedYear,
  latestOrders,
  fetchDashboard,
  fetchAnnualReport,
  changeYear,
} = useMerchantDashboard();

const currentYear = new Date().getFullYear();

const windowWidth = ref(window.innerWidth);
const isMobile = computed(() => windowWidth.value < 768);
function onResize() { windowWidth.value = window.innerWidth; }
onMounted(() => window.addEventListener('resize', onResize));
onUnmounted(() => window.removeEventListener('resize', onResize));

onMounted(async () => {
  await Promise.allSettled([fetchDashboard(), fetchAnnualReport()]);
});

const totalPayment = computed(() => {
  const s = dashboard.value?.ordersByPaymentStatus;
  if (!s) return 1;
  return (s.UNPAID + s.PARTIAL + s.PAID) || 1;
});
const paymentPercent = (key: 'UNPAID' | 'PARTIAL' | 'PAID') => {
  const val = dashboard.value?.ordersByPaymentStatus?.[key] ?? 0;
  return Math.round((val / totalPayment.value) * 100);
};
const totalArrival = computed(() => {
  const s = dashboard.value?.ordersByArrivalStatus;
  if (!s) return 1;
  return (s.NOT_ARRIVED + s.ARRIVED) || 1;
});
const arrivalPercent = (key: 'NOT_ARRIVED' | 'ARRIVED') => {
  const val = dashboard.value?.ordersByArrivalStatus?.[key] ?? 0;
  return Math.round((val / totalArrival.value) * 100);
};

function formatCurrency(value?: number) {
  if (value == null) return '0';
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);
}
const truncNum = (val: string | number, maxLen = 12) => {
  const formatted = Number(val || 0).toLocaleString();
  return formatted.length > maxLen ? formatted.slice(0, maxLen) + '…' : formatted;
};

function onYearInputChange(val: number | null) {
  if (val && val >= 2000 && val <= currentYear + 5) changeYear(val);
}
function onYearInputEnter(e: KeyboardEvent) {
  const target = e.target as HTMLInputElement;
  const val = Number(target.value);
  if (val && val >= 2000 && val <= currentYear + 5) changeYear(val);
}

const chartMonths = computed(() => annualReport.value?.months ?? []);

const cPadL = computed(() => isMobile.value ? 44 : 66);
const cPadR = computed(() => isMobile.value ? 8 : 16);
const cPadTop = 16;
const cPadBot = 28;
const bw = computed(() => isMobile.value ? 8 : 14);
const bg = computed(() => isMobile.value ? 2 : 4);
const gg = computed(() => isMobile.value ? 10 : 24);
const gw = computed(() => bw.value * 3 + bg.value * 2);
const innerH = computed(() => isMobile.value ? 160 : 220);
const svgH = computed(() => innerH.value + cPadTop + cPadBot);

const svgW = computed(() => {
  const n = chartMonths.value.length || 1;
  const w = cPadL.value + cPadR.value + n * gw.value + (n - 1) * gg.value + 16;
  const minW = isMobile.value ? windowWidth.value - 64 : 600;
  return Math.max(w, minW);
});

const maxOrders = computed(() => Math.max(1, ...chartMonths.value.map(m => m.orderCount ?? 0)));
const maxRevenue = computed(() => Math.max(1, ...chartMonths.value.map(m => Math.max(Number(m.revenueLak ?? 0), Number(m.profitLak ?? 0)))));

const gx = (i: number) => cPadL.value + i * (gw.value + gg.value);
const by = (val: number, max: number) => {
  const pct = Math.min(val / (max || 1), 1);
  return cPadTop + innerH.value * (1 - pct);
};
const bh = (val: number, max: number) => {
  const pct = Math.min(val / (max || 1), 1);
  return Math.max(innerH.value * pct, 2);
};

const gridLines = computed(() => {
  const steps = isMobile.value ? 4 : 5;
  const lines: { y: number; label: string }[] = [];
  for (let i = 0; i <= steps; i++) {
    const pct = i / steps;
    lines.push({
      y: cPadTop + innerH.value * pct,
      label: formatCompact(maxRevenue.value * (1 - pct)),
    });
  }
  return lines;
});

function formatCompact(val: number): string {
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + 'M';
  if (val >= 1_000) return (val / 1_000).toFixed(0) + 'K';
  return Math.round(val).toString();
}

function shortMonthName(name: string): string {
  if (!name) return '';
  return name.length > 3 ? name.slice(0, 3) : name;
}

const tt = reactive({
  show: false,
  pageX: 0,
  pageY: 0,
  monthName: '',
  orders: '',
  revenue: '',
  profit: '',
});

const ttStyle = computed(() => ({
  position: 'fixed' as const,
  left: `${tt.pageX + 14}px`,
  top: `${tt.pageY - 14}px`,
  transform: 'translateY(-100%)',
  zIndex: 9999,
}));

function fillTt(m: any) {
  tt.monthName = m.monthName;
  tt.orders = String(m.orderCount ?? 0);
  tt.revenue = formatCurrency(Number(m.revenueLak ?? 0));
  tt.profit = formatCurrency(Number(m.profitLak ?? 0));
}

function onBarEnter(e: MouseEvent, m: any) {
  tt.show = true;
  tt.pageX = e.pageX;
  tt.pageY = e.pageY;
  fillTt(m);
}
function onBarMove(e: MouseEvent) {
  tt.pageX = e.pageX;
  tt.pageY = e.pageY;
}
function onBarTouch(e: TouchEvent, m: any) {
  const touch = e.touches[0];
  if (!touch) return;
  tt.show = true;
  tt.pageX = touch.pageX;
  tt.pageY = touch.pageY;
  fillTt(m);
}
function hideTooltip() { tt.show = false; }

const AVATAR_COLORS = ['#2563eb', '#f97316', '#a855f7', '#10b981', '#ef4444'];

const latestColumns = computed(() => ([
  { title: t('merchant.dashboard.table.orderCode'), key: 'customer' },
  { title: t('merchant.dashboard.table.status'), key: 'status', align: 'center' as const, width: 140 },
  { title: t('merchant.dashboard.table.total'), key: 'total', align: 'right' as const, width: 160 },
]));

const mappedOrders = computed(() => latestOrders.value.map((o, idx) => {
  const isArrived = o.arrivalStatus === 'ARRIVED';
  const name = o.customerName || t('merchant.dashboard.latestOrders.unknownCustomer');
  const initials = name.trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase();
  return {
    id: String(o.id),
    orderCode: o.orderCode,
    customerName: name,
    totalAmount: Number(o.totalAmount),
    statusText: isArrived ? t('merchant.dashboard.status.arrived') : t('merchant.dashboard.status.notArrived'),
    statusColor: isArrived ? 'green' : 'blue',
    avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
    avatarText: initials || 'C',
  };
}));

const goOrders = () => { router.push('/merchant/stock-order'); };
</script>

<style scoped>
.m-dashboard { padding: 0; }

.page-header { margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 600; color: #0f172a; line-height: 1.25; }
.page-subtitle { font-size: 13px; color: #64748b; margin-top: 2px; }

.stats-row { margin-bottom: 4px; }

.stat-card {
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  box-shadow: 0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04);
  background: #fff;
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(15,23,42,0.10); }
.stat-icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.stat-purple .stat-icon { background: rgba(139,92,246,0.12); color: #8b5cf6; }
.stat-blue .stat-icon   { background: rgba(59,130,246,0.12);  color: #3b82f6; }
.stat-green .stat-icon  { background: rgba(34,197,94,0.12);   color: #22c55e; }
.stat-orange .stat-icon { background: rgba(245,158,11,0.12);  color: #f59e0b; }

.stat-body { flex: 1; min-width: 0; }
.stat-value { font-size: 26px; font-weight: 700; color: #0f172a; line-height: 1.2; }
.stat-label { font-size: 13px; color: #64748b; margin-top: 2px; }
.stat-sub   { font-size: 12px; color: #94a3b8; margin-top: 2px; }

.panel-card {
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04);
}
.panel-title { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 16px; }
.panel-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.panel-header-row .panel-title { margin-bottom: 0; }

.status-equal-row { align-items: stretch; }
.status-equal-row :deep(.ant-col) { display: flex; flex-direction: column; }
.status-equal-row :deep(.ant-col) > .panel-card { flex: 1; display: flex; flex-direction: column; }
.status-equal-row :deep(.ant-col) > .panel-card :deep(.ant-card-body) { flex: 1; display: flex; flex-direction: column; }
.status-equal-row .status-bars { flex: 1; justify-content: space-around; }

.status-bars { display: flex; flex-direction: column; gap: 12px; }
.bar-item { display: flex; align-items: center; gap: 10px; }
.bar-label { font-size: 13px; color: #64748b; width: 100px; flex-shrink: 0; }
.bar-count { font-size: 13px; font-weight: 700; color: #0f172a; width: 36px; text-align: right; flex-shrink: 0; }
.bar-item :deep(.ant-progress) { flex: 1; }

.fin-item  { text-align: center; padding: 10px 0; }
.fin-label { font-size: 12px; color: #94a3b8; margin-bottom: 4px; }
.fin-value { font-size: 18px; font-weight: 700; color: #0f172a; }
.num-truncate {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.text-green { color: #22c55e !important; }
.text-blue  { color: #3b82f6 !important; }
.text-red   { color: #ef4444 !important; }

.chart-controls { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.chart-legend { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.chart-legend-mobile { display: none; }
.legend-item { display: inline-flex; align-items: center; gap: 5px; margin-right: 12px; }
.legend-dot { width: 10px; height: 10px; border-radius: 3px; display: inline-block; flex-shrink: 0; }
.legend-text { font-size: 12px; color: #64748b; }

.year-input { width: 110px; }
.year-input :deep(.ant-input-number-input) { text-align: center; font-weight: 600; font-size: 14px; }

.chart-area { position: relative; }
.chart-scroll {
  overflow-x: auto; overflow-y: visible;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
  scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent;
}
.chart-scroll::-webkit-scrollbar { height: 6px; }
.chart-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

.bar-chart-svg { display: block; }
.chart-bar { cursor: pointer; transition: opacity 150ms ease, filter 150ms ease; }
.chart-bar:hover { opacity: 0.82; filter: brightness(1.1); }
.bar-val-label { font-size: 10px; font-weight: 600; font-family: inherit; }
.chart-axis-label { font-size: 11px; fill: #94a3b8; font-family: inherit; }
.chart-month-label { font-size: 12px; fill: #475569; font-weight: 500; font-family: inherit; }

.chart-tooltip {
  pointer-events: none;
  background: #0f172a; color: #fff;
  border-radius: 10px; padding: 10px 14px;
  font-size: 12px; line-height: 1.6;
  box-shadow: 0 8px 24px rgba(15,23,42,0.28);
  white-space: nowrap; max-width: 260px;
}
.tooltip-title { font-weight: 700; margin-bottom: 4px; font-size: 13px; }
.tooltip-row { display: flex; align-items: center; gap: 6px; }
.tooltip-dot { width: 8px; height: 8px; border-radius: 2px; display: inline-block; flex-shrink: 0; }

.view-all-link { color: #3b82f6; font-weight: 600; cursor: pointer; font-size: 13px; }
.view-all-link:hover { color: #1d4ed8; }

.status-tag { border-radius: 999px; padding: 2px 10px; font-weight: 700; }

.order-cell { display: flex; align-items: center; gap: 10px; }

/* Latest orders mobile */
.latest-mobile { display: flex; flex-direction: column; gap: 8px; }
.mobile-order-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 12px 14px;
  border: 1px solid rgba(148, 163, 184, 0.15);
}
.mobile-order-top { display: flex; align-items: center; gap: 10px; }
.mobile-order-info { flex: 1; min-width: 0; }
.mobile-order-code { font-size: 13px; font-weight: 700; color: #0f172a; }
.mobile-order-customer { font-size: 11px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mobile-order-bottom {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 8px; padding-top: 8px;
  border-top: 1px solid rgba(148, 163, 184, 0.15);
}
.mobile-order-label { font-size: 12px; color: #64748b; }
.mobile-order-amount { font-size: 14px; font-weight: 700; color: #0f172a; }

@media (max-width: 767px) {
  .page-title { font-size: 16px; }
  .page-subtitle { display: none; }
  .stat-card { padding: 14px; gap: 10px; flex-direction: column; align-items: flex-start; }
  .stat-icon { width: 36px; height: 36px; font-size: 16px; border-radius: 10px; }
  .stat-value {
    font-size: 20px;
    max-width: 100%; overflow-x: auto; overflow-y: hidden;
    white-space: nowrap; scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent;
    -webkit-overflow-scrolling: touch;
  }
  .stat-value::-webkit-scrollbar { height: 3px; }
  .stat-value::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
  .stat-label { font-size: 11px; }
  .stat-sub { font-size: 10px; }
  .fin-value { font-size: 14px; }
  .fin-label { font-size: 10px; }
  .bar-label { width: 70px; font-size: 11px; }

  .panel-header-row { flex-direction: row; align-items: center; justify-content: space-between; }
  .chart-legend { display: none; }
  .chart-legend-mobile {
    display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 12px;
  }
  .chart-legend-mobile .legend-item { margin-right: 10px; }
  .chart-legend-mobile .legend-text { font-size: 10px; }
  .chart-legend-mobile .legend-dot { width: 8px; height: 8px; }

  .year-input { width: 90px; }
  .year-input :deep(.ant-input-number-input) { font-size: 13px; }
  .chart-month-label { font-size: 10px; }
  .chart-axis-label { font-size: 9px; }
  .chart-tooltip { font-size: 11px; padding: 8px 10px; max-width: 220px; }
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
