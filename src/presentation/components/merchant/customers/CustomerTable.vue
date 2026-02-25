<template>
  <div class="merchant-customers">
    <a-breadcrumb class="mb-3">
      <a-breadcrumb-item>{{ $t('merchant.breadcrumbs.home') }}</a-breadcrumb-item>
      <a-breadcrumb-item>{{ $t('merchant.customers.breadcrumb') }}</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="page-header">
      <div class="title-block">
        <div class="page-title">{{ $t('merchant.customers.title') }}</div>
        <div class="page-subtitle">{{ $t('merchant.customers.subtitle') }}</div>
      </div>

      <a-input
        v-model:value="q"
        allow-clear
        class="search-input"
        :placeholder="$t('merchant.customers.searchPlaceholder')"
        data-testid="customer-search-input"
        @pressEnter="triggerSearch"
      >
        <template #prefix><SearchOutlined /></template>
      </a-input>

      <a-button type="primary" class="add-btn" data-testid="add-customer-btn" @click="openCreatePage">
        <template #icon><UserAddOutlined /></template>
        {{ $t('merchant.customers.addButton') }}
      </a-button>
    </div>

    <!-- Summary Cards -->
    <div class="summary-grid mb-4">
      <div class="summary-card">
        <div class="summary-icon total-icon"><TeamOutlined /></div>
        <div class="summary-body">
          <div class="summary-label">{{ $t('merchant.customers.summaryTotalCustomers') }}</div>
          <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ summary.totalCustomers }}</template><div class="summary-value num-truncate">{{ truncNum(summary.totalCustomers) }}</div></a-tooltip>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon active-icon"><UserOutlined /></div>
        <div class="summary-body">
          <div class="summary-label">{{ $t('merchant.customers.summaryActive') }}</div>
          <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ summary.totalActive }}</template><div class="summary-value num-truncate">{{ truncNum(summary.totalActive) }}</div></a-tooltip>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon inactive-icon"><StopOutlined /></div>
        <div class="summary-body">
          <div class="summary-label">{{ $t('merchant.customers.summaryInactive') }}</div>
          <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ summary.totalInactive }}</template><div class="summary-value num-truncate">{{ truncNum(summary.totalInactive) }}</div></a-tooltip>
        </div>
      </div>
    </div>

    <!-- Desktop: table inside card -->
    <a-card v-if="!isMobile" :bordered="false" class="panel-card">
      <a-table
        v-if="true"
        :columns="columns"
        :data-source="filteredCustomers"
        :pagination="paginationConfig"
        row-key="id"
        size="middle"
        :loading="loading"
        data-testid="customer-table"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'customer'">
            <div class="flex items-center gap-3">
              <a-avatar :size="40" :style="{ backgroundColor: record.avatarColor }">{{ record.avatarText }}</a-avatar>
              <div>
                <div class="font-semibold text-slate-900 leading-tight">{{ record.name }}</div>
                <div class="text-slate-500 text-sm">{{ record.code }}</div>
              </div>
            </div>
          </template>

          <template v-else-if="column.key === 'address'">
            <div class="flex items-center gap-2">
              <a-tag color="blue" class="pill-tag">{{ record.shipTag }}</a-tag>
              <span class="text-slate-700">{{ record.address }}</span>
            </div>
          </template>

          <template v-else-if="column.key === 'pay'">
            <span class="text-slate-700">{{ record.paymentMethod }}</span>
          </template>

          <template v-else-if="column.key === 'contact'">
            <div class="flex items-center gap-3">
              <a-button type="text" class="icon-action" @click="() => {}"><MessageOutlined /></a-button>
              <a-button type="text" class="icon-action" @click="() => {}"><PhoneOutlined /></a-button>
              <span class="text-slate-700">{{ record.contactPhone }}</span>
            </div>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 'active' ? 'green' : 'default'" class="pill-tag">
              {{ record.status === 'active' ? $t('merchant.customers.status.active') : $t('merchant.customers.status.inactive') }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'actions'">
            <div class="flex items-center justify-end gap-2">
              <a-button type="text" class="icon-action" @click="openEditPage(record.__raw)"><EditOutlined /></a-button>
              <a-popconfirm :title="$t('merchant.customers.confirmDelete')" @confirm="confirmDelete(record.__raw)">
                <a-button type="text" danger class="icon-action"><DeleteOutlined /></a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>

    </a-card>

    <!-- Mobile: individual cards (no outer wrapper) -->
    <div v-if="isMobile" class="customers-mobile">
      <a-collapse accordion ghost class="customers-collapse">
        <template #expandIcon="{ isActive }">
          <DownOutlined class="expand-icon" :class="{ rotated: isActive }" />
        </template>

        <a-collapse-panel v-for="c in filteredCustomers" :key="c.id">
          <template #header>
            <div class="card-row">
              <!-- Avatar with active dot -->
              <div class="avatar-wrap">
                <a-avatar :size="48" :style="{ backgroundColor: c.avatarColor }">{{ c.avatarText }}</a-avatar>
                <span v-if="c.status === 'active'" class="active-dot" />
              </div>

              <!-- Name + code -->
              <div class="item-info">
                <div class="item-name">{{ c.name }}</div>
                <div class="item-sub">{{ c.contactPhone || c.code || '-' }}</div>
              </div>

              <!-- Status tag right -->
              <div class="status-side">
                <a-tag :color="c.status === 'active' ? 'success' : 'default'" class="status-tag">
                  {{ c.status === 'active' ? $t('merchant.customers.status.active') : $t('merchant.customers.status.inactive') }}
                </a-tag>
              </div>
            </div>
          </template>

          <div class="card-detail">
            <div class="detail-row">
              <span class="detail-label">{{ $t('merchant.customers.table.address') }}</span>
              <span class="detail-val">
                <a-tag color="blue" class="ship-tag">{{ c.shipTag }}</a-tag>
                {{ c.address || '-' }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ $t('merchant.customers.table.pay') }}</span>
              <span class="detail-val">{{ c.paymentMethod || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ $t('merchant.customers.table.contact') }}</span>
              <span class="detail-val">{{ c.contactPhone || '-' }}</span>
            </div>
            <div class="detail-row border-none pt-2">
              <a-button type="default" size="small" class="action-btn" @click="openEditPage(c.__raw)">
                <EditOutlined /> {{ $t('common.edit') }}
              </a-button>
              <a-popconfirm :title="$t('merchant.customers.confirmDelete')" @confirm="confirmDelete(c.__raw)">
                <a-button type="text" danger size="small" class="action-btn">
                  <DeleteOutlined /> {{ $t('common.delete') }}
                </a-button>
              </a-popconfirm>
            </div>
          </div>
        </a-collapse-panel>
      </a-collapse>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useIsMobile } from '../../../../shared/composables/useIsMobile';
import {
  SearchOutlined,
  UserAddOutlined,
  MessageOutlined,
  PhoneOutlined,
  EditOutlined,
  DeleteOutlined,
  DownOutlined,
  TeamOutlined,
  UserOutlined,
  StopOutlined,
} from '@ant-design/icons-vue';
import type { TablePaginationConfig } from 'ant-design-vue';
import type { Customer } from '@/domain/entities/user.entity';
import { useMerchantCustomers } from '@/presentation/composables/merchant/useMerchantCustomers';
import { useRouter } from 'vue-router';

const q = ref('');
const { t } = useI18n();
const { isMobile } = useIsMobile();
const router = useRouter();

const {
  loading,
  customers,
  pagination,
  summary,
  fetchCustomers,
  searchCustomers,
  changePage,
  deleteCustomer,
} = useMerchantCustomers();

const truncNum = (val: string | number, maxLen = 12) => {
  const formatted = Number(val || 0).toLocaleString();
  return formatted.length > maxLen ? formatted.slice(0, maxLen) + '…' : formatted;
};

const columns = computed(() => ([
  { title: t('merchant.customers.table.customer'), key: 'customer' },
  { title: t('merchant.customers.table.address'), key: 'address' },
  { title: t('merchant.customers.table.pay'), key: 'pay', width: 140 },
  { title: t('merchant.customers.table.contact'), key: 'contact', width: 220 },
  { title: t('merchant.customers.table.status'), key: 'status', width: 120, align: 'center' as const },
  { title: t('merchant.customers.table.manage'), key: 'actions', width: 120, align: 'right' as const },
]));

const uiCustomers = computed(() => (customers.value || []).map((c: Customer, idx: number) => {
  const colors = ['#2563eb', '#f97316', '#ec4899', '#22c55e', '#a855f7'];
  const avatarText = (c.customerName || 'C')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x[0])
    .join('')
    .toUpperCase();

  return {
    // สำหรับ UI layer
    id: c.id,
    name: c.customerName,
    code: c.uniqueToken,
    shipTag: c.shippingProvider || '-',
    address: c.shippingAddress || '-',
    paymentMethod: c.paymentTerms || '-',
    contactPhone: c.contactPhone || '-',
    status: c.isActive ? 'active' : 'inactive',
    avatarColor: colors[idx % colors.length],
    avatarText: avatarText || 'C',
    __raw: c,
  };
}));

const filteredCustomers = computed(() => {
  const needle = q.value.trim().toLowerCase();
  if (!needle) return uiCustomers.value;
  return uiCustomers.value.filter((c) =>
    String(c.name).toLowerCase().includes(needle) ||
    String(c.contactPhone).toLowerCase().includes(needle) ||
    String(c.code).toLowerCase().includes(needle)
  );
});

const paginationConfig = computed<TablePaginationConfig>(() => ({
  current: pagination.value.page,
  pageSize: pagination.value.limit,
  total: pagination.value.total,
  showSizeChanger: true,
  pageSizeOptions: ['8', '16', '24', '50'],
}));

const handleTableChange = (p: TablePaginationConfig) => {
  if (p.current && p.pageSize) {
    changePage(p.current, p.pageSize);
  }
};

const openCreatePage = () => {
  router.push('/merchant/customers/create');
};

const openEditPage = (customer: Customer) => {
  router.push(`/merchant/customers/${customer.id}/edit`);
};

const confirmDelete = async (customer: Customer) => {
  await deleteCustomer(customer.id);
};

// Search: debounce เรียก backend
let searchTimer: number | undefined;
const triggerSearch = () => {
  window.clearTimeout(searchTimer);
  searchCustomers(q.value);
};

watch(q, () => {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    searchCustomers(q.value);
  }, 450);
});

onMounted(async () => {
  await fetchCustomers();
});
</script>

<style scoped>
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.mb-5 { margin-bottom: 20px; }

/* ===== Page header (matches UserTable responsive pattern) ===== */
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.title-block { flex: 1 1 auto; min-width: 0; }
.page-title { font-size: 22px; font-weight: 600; color: #0f172a; line-height: 1.25; }
.page-subtitle { font-size: 13px; color: #64748b; margin-top: 2px; }
.search-input { height: 44px; border-radius: 12px; width: min(320px, 100%); }
.add-btn { height: 44px; border-radius: 12px; font-weight: 700; flex-shrink: 0; }

/* Mobile: title+button on row 1, search full-width on row 2 */
@media (max-width: 767px) {
  .page-header { flex-wrap: wrap; }
  .title-block { order: 1; flex: 1 1 auto; }
  .add-btn { order: 2; flex-shrink: 0; height: 36px; font-size: 12px; padding: 0 10px; }
  .search-input { order: 3; flex: 1 1 100%; width: 100%; }
  .page-title { font-size: 15px; }
  .page-subtitle { display: none; }
}

.panel-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}
.pill-tag { border-radius: 999px; padding: 2px 10px; font-weight: 800; }
.icon-action { border-radius: 10px; }
.icon-action:hover { background: rgba(29, 78, 216, 0.08) !important; color: #1d4ed8; }

/* Mobile card list */
.customers-mobile { display: flex; flex-direction: column; gap: 10px; }
.customers-collapse { background: transparent !important; border: none !important; }
.customers-collapse :deep(.ant-collapse-item) {
  background: #ffffff !important;
  border-radius: 16px !important;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.06) !important;
  border: 1px solid rgba(148, 163, 184, 0.15) !important;
  overflow: hidden;
  margin-bottom: 10px !important;
}
.customers-collapse :deep(.ant-collapse-header) { padding: 14px 14px !important; align-items: center !important; }
.customers-collapse :deep(.ant-collapse-content) { background: transparent !important; border-top: 1px solid rgba(148, 163, 184, 0.18) !important; }
.customers-collapse :deep(.ant-collapse-content-box) { padding: 0 14px 14px !important; }

.expand-icon { font-size: 13px; color: #94a3b8; transition: transform 260ms ease; }
.expand-icon.rotated { transform: rotate(180deg); }

.card-row { display: flex; align-items: center; gap: 12px; padding-right: 4px; }

.avatar-wrap { position: relative; flex-shrink: 0; }
.active-dot {
  position: absolute;
  bottom: 2px;
  left: 2px;
  width: 11px;
  height: 11px;
  background: #22c55e;
  border-radius: 999px;
  border: 2px solid #fff;
}
.item-info { flex: 1; min-width: 0; }
.item-name { font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.3; }
.item-sub { font-size: 13px; color: #64748b; margin-top: 2px; }
.status-side { flex-shrink: 0; margin-left: auto; }
.status-tag { border-radius: 999px; font-weight: 700; font-size: 12px; }

.card-detail { padding-top: 10px; }
.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  gap: 8px;
}
.detail-row.border-none { border-bottom: none; justify-content: flex-end; gap: 8px; padding-bottom: 0; }
.detail-label { font-size: 12px; font-weight: 600; color: #94a3b8; flex-shrink: 0; }
.detail-val { font-size: 13px; font-weight: 600; color: #1e293b; text-align: right; }
.ship-tag { border-radius: 999px; font-size: 11px; }
.action-btn { border-radius: 8px; font-size: 13px; }

/* ===== Summary Cards ===== */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.summary-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.05);
  border: 1px solid rgba(148, 163, 184, 0.12);
}
.summary-icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; flex-shrink: 0;
}
.total-icon { background: rgba(29, 78, 216, 0.1); color: #1d4ed8; }
.active-icon { background: rgba(22, 163, 74, 0.1); color: #16a34a; }
.inactive-icon { background: rgba(220, 38, 38, 0.1); color: #dc2626; }
.summary-body { flex: 1; min-width: 0; }
.summary-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.4px; }
.summary-value { font-size: 18px; font-weight: 800; color: #0f172a; line-height: 1.3; }
.num-truncate {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
@media (max-width: 767px) {
  .summary-grid { grid-template-columns: 1fr; gap: 10px; }
  .summary-card { padding: 12px 14px; border-radius: 10px; }
  .summary-value { font-size: 15px; }
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
