<template>
  <div class="merchant-dashboard">
    <a-breadcrumb class="mb-3">
      <a-breadcrumb-item>{{ $t('menus.merchant.dashboard') }}</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="mb-5">
      <div class="text-3xl font-semibold text-slate-900">{{ $t('merchant.dashboard.overviewTitle') }}</div>
      <div class="text-slate-500 mt-1">{{ $t('merchant.dashboard.overviewSubtitle') }}</div>
    </div>

    <a-row :gutter="[16, 16]" class="mb-4">
      <a-col :xs="24" :md="8">
        <a-card class="summary-card" :bordered="false">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-slate-600 font-medium">{{ $t('merchant.dashboard.cards.totalSalesToday.title') }}</div>
              <div class="text-3xl font-semibold mt-2 text-slate-900">{{ n(150000, 'currency') }}</div>
              <div class="mt-2 text-green-600 font-medium">
                +12.5% <span class="text-slate-400 font-normal">{{ $t('merchant.dashboard.cards.totalSalesToday.compare') }}</span>
              </div>
            </div>
            <div class="icon-badge bg-green-50 text-green-600">
              <RiseOutlined />
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :md="8">
        <a-card class="summary-card" :bordered="false">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-slate-600 font-medium">{{ $t('merchant.dashboard.cards.totalOrders.title') }}</div>
              <div class="text-3xl font-semibold mt-2 text-slate-900">1,240</div>
              <div class="mt-2 text-green-600 font-medium">
                +5.2% <span class="text-slate-400 font-normal">{{ $t('merchant.dashboard.cards.totalOrders.compare') }}</span>
              </div>
            </div>
            <div class="icon-badge bg-blue-50 text-blue-600">
              <ShoppingCartOutlined />
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :md="8">
        <a-card class="summary-card" :bordered="false">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-slate-600 font-medium">{{ $t('merchant.dashboard.cards.outstanding.title') }}</div>
              <div class="text-3xl font-semibold mt-2 text-slate-900">{{ n(15200, 'currency') }}</div>
              <div class="mt-2 text-red-500 font-medium">
                -2.1% <span class="text-slate-400 font-normal">{{ $t('merchant.dashboard.cards.outstanding.compare') }}</span>
              </div>
            </div>
            <div class="icon-badge bg-orange-50 text-orange-600">
              <WalletOutlined />
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="[16, 16]" class="mb-4">
      <a-col :xs="24" :lg="16">
        <a-card :bordered="false" class="panel-card">
          <div class="flex items-start justify-between mb-4">
            <div>
              <div class="text-xl font-semibold text-slate-900">{{ $t('merchant.dashboard.revenue.title') }}</div>
              <div class="text-slate-500">{{ $t('merchant.dashboard.revenue.subtitle') }}</div>
            </div>
            <a-segmented v-model:value="chartMode" :options="chartModes" />
          </div>

          <div class="chart-wrap">
            <div class="chart-grid">
              <div v-for="(v, idx) in chartValues" :key="idx" class="bar-col">
                <div class="bar" :class="{ active: idx === 2 }" :style="{ height: `${v}%` }" />
                <div class="bar-label">{{ chartLabels[idx] }}</div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :lg="8">
        <a-card :bordered="false" class="panel-card">
          <div class="text-xl font-semibold text-slate-900 mb-2">{{ $t('merchant.dashboard.quick.title') }}</div>
          <div class="space-y-3">
            <div class="quick-row">
              <div class="quick-left">
                <div class="quick-dot bg-blue-600" />
                <div>
                  <div class="font-medium text-slate-900">{{ $t('merchant.dashboard.quick.newCustomers.title') }}</div>
                  <div class="text-slate-500 text-sm">{{ $t('merchant.dashboard.quick.newCustomers.subtitle') }}</div>
                </div>
              </div>
              <div class="font-semibold text-slate-900">+8</div>
            </div>
            <div class="quick-row">
              <div class="quick-left">
                <div class="quick-dot bg-green-600" />
                <div>
                  <div class="font-medium text-slate-900">{{ $t('merchant.dashboard.quick.payments.title') }}</div>
                  <div class="text-slate-500 text-sm">{{ $t('merchant.dashboard.quick.payments.subtitle') }}</div>
                </div>
              </div>
              <div class="font-semibold text-slate-900">12</div>
            </div>
            <div class="quick-row">
              <div class="quick-left">
                <div class="quick-dot bg-orange-500" />
                <div>
                  <div class="font-medium text-slate-900">{{ $t('merchant.dashboard.quick.pendingNotify.title') }}</div>
                  <div class="text-slate-500 text-sm">{{ $t('merchant.dashboard.quick.pendingNotify.subtitle') }}</div>
                </div>
              </div>
              <div class="font-semibold text-slate-900">5</div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-card :bordered="false" class="panel-card">
      <div class="flex items-center justify-between mb-3">
        <div class="text-xl font-semibold text-slate-900">{{ $t('merchant.dashboard.latestOrders.title') }}</div>
        <a class="text-blue-600 font-medium" @click="goOrders">{{ $t('merchant.dashboard.latestOrders.viewAll') }}</a>
      </div>

      <!-- Desktop table -->
      <a-table
        v-if="!isMobile"
        :columns="latestColumns"
        :data-source="latestOrders"
        :pagination="false"
        row-key="id"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'customer'">
            <div class="flex items-center gap-3">
              <a-avatar :style="{ backgroundColor: record.avatarColor }">{{ record.avatarText }}</a-avatar>
              <div>
                <div class="font-medium text-slate-900">{{ record.customerName }}</div>
                <div class="text-slate-500 text-sm">{{ record.orderCode }}</div>
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.statusColor" class="status-tag">{{ record.statusText }}</a-tag>
          </template>
          <template v-else-if="column.key === 'total'">
            <div class="font-semibold text-slate-900">{{ n(record.totalAmount, 'currency') }}</div>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="text" class="action-btn" @click="() => {}">
              <EyeOutlined />
            </a-button>
          </template>
        </template>
      </a-table>

      <!-- Mobile accordion list (match screenshot style) -->
      <div v-else class="latest-mobile">
        <a-collapse accordion ghost class="latest-collapse">
          <a-collapse-panel v-for="o in latestOrders" :key="o.id">
            <template #header>
              <div class="mobile-header">
                <div class="flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <div class="font-semibold text-slate-900 truncate">#{{ o.orderCode }}</div>
                    <div class="text-slate-500 text-sm truncate">{{ o.customerName }}</div>
                  </div>
                  <a-tag :color="o.statusColor" class="status-tag shrink-0">{{ o.statusText }}</a-tag>
                </div>
              </div>
            </template>

            <div class="mobile-body">
              <div class="mobile-kv">
                <div class="kv-row">
                  <div class="kv-label">{{ $t('merchant.dashboard.table.total') }}</div>
                  <div class="kv-value">{{ n(o.totalAmount, 'currency') }}</div>
                </div>
                <div class="kv-row">
                  <div class="kv-label">{{ $t('merchant.dashboard.table.actions') }}</div>
                  <div class="kv-actions">
                    <a-button type="text" class="action-btn" @click="() => {}">
                      <EyeOutlined />
                    </a-button>
                  </div>
                </div>
              </div>
            </div>
          </a-collapse-panel>
        </a-collapse>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { mockOrders } from '../../../shared/mock';
import { useIsMobile } from '../../../shared/composables/useIsMobile';
import {
  RiseOutlined,
  ShoppingCartOutlined,
  WalletOutlined,
  EyeOutlined,
} from '@ant-design/icons-vue';

const router = useRouter();
const { n, t } = useI18n();
const { isMobile } = useIsMobile();

const chartMode = ref<'weekly' | 'monthly'>('weekly');
const chartModes = computed(() => ([
  { label: t('merchant.dashboard.revenue.modes.weekly'), value: 'weekly' },
  { label: t('merchant.dashboard.revenue.modes.monthly'), value: 'monthly' },
]));

const chartLabels = computed(() => (chartMode.value === 'weekly'
  ? [
    t('merchant.dashboard.revenue.days.mon'),
    t('merchant.dashboard.revenue.days.tue'),
    t('merchant.dashboard.revenue.days.wed'),
    t('merchant.dashboard.revenue.days.thu'),
    t('merchant.dashboard.revenue.days.fri'),
    t('merchant.dashboard.revenue.days.sat'),
    t('merchant.dashboard.revenue.days.sun'),
  ]
  : [
    t('merchant.dashboard.revenue.days.w1'),
    t('merchant.dashboard.revenue.days.w2'),
    t('merchant.dashboard.revenue.days.w3'),
    t('merchant.dashboard.revenue.days.w4'),
  ]
));

const chartValues = computed(() => (chartMode.value === 'weekly'
  ? [30, 45, 65, 52, 80, 74, 68]
  : [45, 70, 62, 88]
));

const latestColumns = computed(() => ([
  { title: t('merchant.dashboard.table.orderCode'), key: 'customer' },
  { title: t('merchant.dashboard.table.status'), key: 'status', align: 'center' as const, width: 140 },
  { title: t('merchant.dashboard.table.total'), key: 'total', align: 'right' as const, width: 160 },
  { title: t('merchant.dashboard.table.actions'), key: 'action', align: 'center' as const, width: 120 },
]));

const latestOrders = computed(() => mockOrders.slice(0, 3).map((o, idx) => {
  const statusText = o.arrivalStatus === 'arrived'
    ? t('merchant.dashboard.status.success')
    : t('merchant.dashboard.status.processing');
  const statusColor = o.arrivalStatus === 'arrived' ? 'green' : 'blue';
  const colors = ['#2563eb', '#f97316', '#a855f7'];
  const initials = (o.customerName || 'C').trim().split(/\s+/).slice(0, 2).map((x) => x[0]).join('').toUpperCase();
  return {
    ...o,
    statusText,
    statusColor,
    avatarColor: colors[idx % colors.length],
    avatarText: initials || 'C',
  };
}));

const goOrders = () => {
  router.push('/merchant/stock-order');
};
</script>

<style scoped>
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.mb-5 { margin-bottom: 20px; }

.summary-card,
.panel-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}

.icon-badge {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 18px;
}

.chart-wrap {
  background: #f8fafc;
  border-radius: 14px;
  padding: 18px;
  height: 320px;
  display: flex;
  align-items: flex-end;
}

.chart-grid {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 14px;
  align-items: end;
}

.bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  height: 100%;
  justify-content: flex-end;
}

.bar {
  width: 48px;
  max-width: 100%;
  border-radius: 10px;
  background: rgba(37, 99, 235, 0.18);
  transition: all 0.2s ease;
}
.bar.active { background: #1d4ed8; }

.bar-label { color: #64748b; font-size: 12px; font-weight: 600; }

.panel-card :deep(.ant-segmented) {
  border-radius: 12px;
}

.quick-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 12px;
}
.quick-left { display: flex; align-items: center; gap: 10px; }
.quick-dot { width: 10px; height: 10px; border-radius: 999px; }

.status-tag { border-radius: 999px; padding: 2px 10px; font-weight: 700; }
.action-btn { color: #334155; }
.action-btn:hover { color: #1d4ed8; background: rgba(29, 78, 216, 0.08) !important; }

/* Mobile latest-orders list style */
.latest-mobile { margin-top: 4px; }
.mobile-header { padding-right: 8px; }
.mobile-body { padding: 2px 0 6px; }
.mobile-kv {
  background: #f8fafc;
  border-radius: 14px;
  padding: 12px;
}
.kv-row { display: flex; align-items: center; justify-content: space-between; padding: 6px 0; }
.kv-label { color: #64748b; font-weight: 700; font-size: 12px; }
.kv-value { color: #0f172a; font-weight: 900; }
.kv-actions { display: flex; justify-content: flex-end; }

.latest-collapse :deep(.ant-collapse-item) {
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
  margin-bottom: 12px;
}
.latest-collapse :deep(.ant-collapse-header) {
  padding: 14px 14px !important;
}
.latest-collapse :deep(.ant-collapse-content-box) {
  padding: 0 14px 14px !important;
}
.latest-collapse :deep(.ant-collapse-arrow) {
  inset-inline-end: 14px !important;
}

@media (max-width: 768px) {
  .chart-wrap {
    height: 220px;
    padding: 12px;
    border-radius: 12px;
  }

  .chart-grid {
    gap: 8px;
  }

  .bar-col {
    gap: 6px;
  }

  .bar {
    width: 26px;
    border-radius: 8px;
  }

  .bar-label {
    font-size: 10px;
  }

  .panel-card :deep(.ant-segmented) {
    width: 100%;
  }

  .panel-card :deep(.ant-segmented-group) {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 420px) {
  .chart-wrap { height: 200px; }
  .bar { width: 22px; }
}
</style>
