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
      <a-button
        v-if="isMobile"
        :class="['filter-toggle-btn', { 'filter-active': hasActiveFilter }]"
        @click="showMobileFilter = !showMobileFilter"
      >
        <template #icon><FilterOutlined /></template>
        <a-badge v-if="hasActiveFilter" color="#1d4ed8" dot />
      </a-button>
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

    <!-- Filter Bar: under summary, desktop inline / mobile via icon -->
    <Transition name="filter-slide">
      <div v-if="!isMobile || showMobileFilter" class="filter-section mb-4">
        <div class="filter-bar">
          <template v-if="!isMobile">
            <a-select
              v-model:value="filterType"
              :placeholder="$t('merchant.customers.filter.allTypes')"
              allow-clear
              class="filter-select"
              @change="applyFilters"
            >
              <a-select-option value="CUSTOMER">{{ $t('merchant.customers.form.type.customer') }}</a-select-option>
              <a-select-option value="AGENT">{{ $t('merchant.customers.form.type.agent') }}</a-select-option>
            </a-select>
            <a-select
              v-model:value="filterStatus"
              :placeholder="$t('merchant.customers.filter.allStatus')"
              allow-clear
              class="filter-select"
              @change="applyFilters"
            >
              <a-select-option :value="true">{{ $t('merchant.customers.status.active') }}</a-select-option>
              <a-select-option :value="false">{{ $t('merchant.customers.status.inactive') }}</a-select-option>
            </a-select>
            <a-button v-if="hasActiveFilter" class="reset-btn" @click="resetFilters">
              <template #icon><CloseCircleOutlined /></template>
              {{ $t('merchant.customers.filter.reset') }}
            </a-button>
          </template>
          <template v-else>
            <div class="mobile-filter-panel">
              <a-select
                v-model:value="filterType"
                :placeholder="$t('merchant.customers.filter.allTypes')"
                allow-clear
                class="w-full mb-2"
                @change="applyFilters"
              >
                <a-select-option value="CUSTOMER">{{ $t('merchant.customers.form.type.customer') }}</a-select-option>
                <a-select-option value="AGENT">{{ $t('merchant.customers.form.type.agent') }}</a-select-option>
              </a-select>
              <a-select
                v-model:value="filterStatus"
                :placeholder="$t('merchant.customers.filter.allStatus')"
                allow-clear
                class="w-full mb-2"
                @change="applyFilters"
              >
                <a-select-option :value="true">{{ $t('merchant.customers.status.active') }}</a-select-option>
                <a-select-option :value="false">{{ $t('merchant.customers.status.inactive') }}</a-select-option>
              </a-select>
              <a-button v-if="hasActiveFilter" block class="reset-btn" @click="resetFilters">
                <template #icon><CloseCircleOutlined /></template>
                {{ $t('merchant.customers.filter.reset') }}
              </a-button>
            </div>
          </template>
        </div>
      </div>
    </Transition>

    <!-- Desktop: table inside card -->
    <a-card v-if="!isMobile" :bordered="false" class="panel-card">
      <a-table
        :columns="columns"
        :data-source="filteredCustomers"
        :pagination="paginationConfig"
        row-key="id"
        size="middle"
        :loading="loading"
        :scroll="{ x: 900 }"
        data-testid="customer-table"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'customer'">
            <div class="customer-cell">
              <a-avatar :size="36" :style="{ backgroundColor: record.avatarColor, flexShrink: 0 }">{{ record.avatarText }}</a-avatar>
              <div class="customer-info">
                <a-tooltip :overlay-class-name="'blue-tooltip'" placement="topLeft">
                  <template #title>
                    <div class="tooltip-name">{{ record.name }}</div>
                    <div class="tooltip-token">{{ record.code }}</div>
                  </template>
                  <div class="customer-name">{{ record.name }}</div>
                </a-tooltip>
                <div class="customer-code">{{ record.code }}</div>
              </div>
            </div>
          </template>

          <template v-else-if="column.key === 'address'">
            <a-tooltip :overlay-class-name="'blue-tooltip'" :title="record.address" placement="topLeft">
              <span class="address-text">{{ record.address }}</span>
            </a-tooltip>
          </template>

          <!-- <template v-else-if="column.key === 'pay'">
            <span class="text-slate-700">{{ record.paymentMethod }}</span>
          </template> -->

          <template v-else-if="column.key === 'contact'">
            <div class="flex items-center gap-3">
             <!-- <a-button type="text" class="icon-action" @click="() => {}"><MessageOutlined /></a-button> --->
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
  PhoneOutlined,
  EditOutlined,
  DeleteOutlined,
  DownOutlined,
  TeamOutlined,
  UserOutlined,
  StopOutlined,
  FilterOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons-vue';
import type { TablePaginationConfig } from 'ant-design-vue';
import type { Customer } from '@/domain/entities/user.entity';
import { useMerchantCustomers } from '@/presentation/composables/merchant/useMerchantCustomers';
import { useRouter } from 'vue-router';

const q = ref('');
const filterType = ref<'CUSTOMER' | 'AGENT' | undefined>(undefined);
const filterStatus = ref<boolean | undefined>(undefined);
const showMobileFilter = ref(false);

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
  filterCustomers,
  changePage,
  deleteCustomer,
} = useMerchantCustomers();

const hasActiveFilter = computed(() => filterType.value != null || filterStatus.value != null);

const applyFilters = () => {
  filterCustomers({
    customerType: filterType.value,
    isActive: filterStatus.value,
  });
};

const resetFilters = () => {
  filterType.value = undefined;
  filterStatus.value = undefined;
  q.value = '';
  showMobileFilter.value = false;
  filterCustomers({ customerType: undefined, isActive: undefined, search: undefined });
};

const truncNum = (val: string | number, maxLen = 12) => {
  const formatted = Number(val || 0).toLocaleString();
  return formatted.length > maxLen ? formatted.slice(0, maxLen) + '…' : formatted;
};

const columns = computed(() => ([
  { title: t('merchant.customers.table.customer'), key: 'customer', width: 200 },
  { title: t('merchant.customers.table.address'), key: 'address', width: 280 },
  { title: t('merchant.customers.table.contact'), key: 'contact', width: 200 },
  { title: t('merchant.customers.table.status'), key: 'status', width: 120, align: 'center' as const },
  { title: t('merchant.customers.table.manage'), key: 'actions', width: 100, fixed: 'right' as const, align: 'right' as const },
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

const filteredCustomers = computed(() => uiCustomers.value);

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
.search-input { height: 44px; border-radius: 12px; width: min(200px, 100%); flex: 0 1 200px; }
.add-btn { height: 44px; border-radius: 12px; font-weight: 700; flex-shrink: 0; }

/* Mobile responsive header */
@media (max-width: 767px) {
  .page-header { flex-wrap: wrap; }
  .title-block { order: 1; flex: 1 1 auto; }
  .add-btn { order: 2; flex-shrink: 0; height: 36px; font-size: 12px; padding: 0 10px; }
  .page-title { font-size: 15px; }
  .page-subtitle { display: none; }
}

/* Filter section under summary */
.filter-section { }
.filter-bar {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
}
.filter-select { height: 40px; border-radius: 10px; min-width: 140px; }
.filter-select :deep(.ant-select-selector) { height: 40px !important; border-radius: 10px !important; align-items: center; }
.reset-btn { height: 40px; border-radius: 10px; color: #dc2626; border-color: #fca5a5; font-weight: 600; flex-shrink: 0; }
.reset-btn:hover { background: #fef2f2 !important; color: #dc2626 !important; border-color: #ef4444 !important; }
.filter-toggle-btn { height: 40px; width: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0; }
.filter-toggle-btn.filter-active { border-color: #1d4ed8; color: #1d4ed8; background: #eff6ff; }

.filter-slide-enter-active,
.filter-slide-leave-active { transition: all 0.25s ease; }
.filter-slide-enter-from,
.filter-slide-leave-to { opacity: 0; transform: translateY(-8px); }

/* Mobile filter panel */
.mobile-filter-panel {
  background: #f8fafc; border-radius: 12px; padding: 14px;
  border: 1px solid rgba(148, 163, 184, 0.2);
}
.w-full { width: 100%; }
.mb-2 { margin-bottom: 8px; }

/* Slide animation */
.filter-slide-enter-active,
.filter-slide-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.filter-slide-enter-from,
.filter-slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.filter-slide-enter-to,
.filter-slide-leave-from {
  opacity: 1;
  max-height: 300px;
}

@media (max-width: 767px) {
  .filter-search { max-width: none; flex: 1; }
}

.panel-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}

/* ===== Table cell styles ===== */
.customer-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.customer-info {
  min-width: 0;
  flex: 1;
}
.customer-name {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 110px;
  cursor: default;
}
.customer-code {
  font-size: 12px;
  color: #64748b;
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 110px;
}

.address-text {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px;
  color: #334155;
  font-size: 13px;
  cursor: default;
}

/* ===== Table header/row overrides (match other tables) ===== */
:deep(.ant-table-thead > tr > th) {
  background: #f8fafc !important;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  border-bottom: 1px solid #e2e8f0 !important;
  padding: 10px 12px !important;
}
:deep(.ant-table-tbody > tr > td) {
  padding: 10px 12px !important;
  border-bottom: 1px solid rgba(226, 232, 240, 0.6) !important;
}
:deep(.ant-table-tbody > tr:hover > td:not(.ant-table-cell-fix-right)) {
  background: #f8faff !important;
}
:deep(.ant-table-tbody > tr:last-child > td) {
  border-bottom: none !important;
}

.pill-tag { border-radius: 999px; padding: 2px 10px; font-weight: 700; }
.icon-action { border-radius: 8px; width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; }
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
.blue-tooltip .tooltip-name {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}
.blue-tooltip .tooltip-token {
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.75);
  font-family: monospace;
  word-break: break-all;
}
</style>
