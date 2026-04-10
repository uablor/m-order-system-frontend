<template>
  <div class="sa-merchants">
    <!-- ===== Page Header ===== -->
    <div class="page-header">
      <div class="title-block">
        <div class="page-title">{{ $t('merchants.title') }}</div>
        <div class="page-subtitle">{{ $t('merchants.subtitle') }}</div>
      </div>
      
      <!-- Header actions -->
      <div class="header-actions">
        <!-- Create button -->
        <a-button type="primary" class="header-create-btn" @click="handleCreate">
          <template #icon><PlusOutlined /></template>
          {{ $t('merchants.createMerchant') }}
        </a-button>
        
        <!-- Filter toggle button -->
        <a-tooltip :title="$t('merchants.filterSort')">
          <button
            class="filter-toggle-btn"
            :class="{ 'filter-toggle-btn--active': filterVisible || hasActiveFilters }"
            @click="filterVisible = !filterVisible"
          >
            <FilterOutlined />
            <span v-if="hasActiveFilters" class="filter-dot" />
          </button>
        </a-tooltip>
      </div>
    </div>

    <!-- ===== Filter Card (search + filters + create) ===== -->
    <div class="filter-collapse" :class="{ 'filter-collapse--open': filterVisible }">
      <div class="filter-collapse-inner">
        <a-card :bordered="false" class="filter-card">
          <div class="filter-bar">
            <!-- Search input -->
            <a-input
              v-model:value="q"
              allow-clear
              class="filter-item search-input"
              :placeholder="$t('merchants.searchPlaceholder')"
              @pressEnter="emitFilter"
              @change="onSearchChange"
            >
              <template #prefix><SearchOutlined /></template>
            </a-input>

            <!-- Search field select -->
            <a-select
              v-model:value="searchField"
              allow-clear
              class="filter-item search-field-select"
              :placeholder="$t('merchants.filterSearchField')"
              @change="emitFilter"
            >
              <a-select-option value="shopName">{{ $t('merchants.sfShopName') }}</a-select-option>
              <a-select-option value="contactPhone">{{ $t('merchants.sfPhone') }}</a-select-option>
              <a-select-option value="contactEmail">{{ $t('merchants.sfEmail') }}</a-select-option>
              <a-select-option value="shopAddress">{{ $t('merchants.sfAddress') }}</a-select-option>
            </a-select>

            <!-- Sort direction -->
            <a-select
              v-model:value="filterSort"
              allow-clear
              class="filter-item filter-select"
              :placeholder="$t('merchants.filterSort')"
              @change="emitFilter"
            >
              <a-select-option value="DESC">{{ $t('merchants.sortNewest') }}</a-select-option>
              <a-select-option value="ASC">{{ $t('merchants.sortOldest') }}</a-select-option>
            </a-select>

            <!-- Reset button -->
            <a-button class="filter-item reset-btn" @click="resetFilters">
              {{ $t('merchants.filterReset') }}
            </a-button>
          </div>
        </a-card>
      </div>
    </div>

    <!-- ===== Desktop: table inside card ===== -->
    <a-card v-if="!isMobile" :bordered="false" class="panel-card">
      <a-table
        :columns="columns"
        :data-source="merchants"
        :pagination="paginationConfig"
        row-key="id"
        size="middle"
        :loading="loading"
        :scroll="{ x: 1200 }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'isActive'">
            <a-tag :color="record.isActive ? 'success' : 'default'" class="pill-tag">
              {{ record.isActive ? $t('merchants.active') : $t('merchants.inactive') }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'createdAt'">
            {{ formatDate(record.createdAt) }}
          </template>
          <template v-else-if="column.key === 'updatedAt'">
            {{ formatDate(record.updatedAt) }}
          </template>
          <template v-else-if="column.key === 'shopLogoUrl'">
            <a-avatar v-if="record.shopLogoUrl" :src="record.shopLogoUrl" shape="square" :size="32" />
            <span v-else>-</span>
          </template>
          <template v-else-if="column.key === 'shopAddress'">
            <span class="address-cell">{{ record.shopAddress || '-' }}</span>
          </template>
          <template v-else-if="column.key === 'defaultCurrency'">
            <a-tag color="blue">{{ record.defaultCurrency }}</a-tag>
          </template>
          <template v-else-if="column.key === 'actions'">
            <div class="actions-wrap">
              <a-tooltip :title="$t('merchants.detail.viewDetail')">
                <a-button type="text" size="small" class="icon-action eye-btn" @click="$emit('detail', record)">
                  <EyeOutlined />
                </a-button>
              </a-tooltip>
              <a-button type="text" size="small" class="icon-action" @click="$emit('edit', record)">
                <EditOutlined />
              </a-button>
              <a-tooltip :title="$t('merchants.changePassword')">
                <a-button type="text" size="small" class="icon-action" @click="$emit('changePassword', record)">
                  <KeyOutlined />
                </a-button>
              </a-tooltip>
              <a-tooltip :title="record.isActive ? $t('merchants.deactivateMerchant') : $t('merchants.activateMerchant')">
                <a-button 
                  type="text" 
                  size="small" 
                  :class="['icon-action', record.isActive ? 'status-active' : 'status-inactive']"
                  @click="$emit('toggle-status', record)"
                >
                  <PoweroffOutlined />
                </a-button>
              </a-tooltip>
              <a-popconfirm :title="$t('merchants.confirmDelete')" @confirm="$emit('delete', record)">
                <a-button type="text" size="small" danger class="icon-action"><DeleteOutlined /></a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- ===== Mobile / Tablet: card list ===== -->
    <div v-if="isMobile" class="merchants-mobile">
      <a-spin :spinning="loading">
        <a-empty v-if="merchants.length === 0 && !loading" />

        <a-collapse accordion ghost class="merchants-collapse">
          <template #expandIcon="{ isActive }">
            <DownOutlined class="expand-icon" :class="{ rotated: isActive }" />
          </template>

          <a-collapse-panel v-for="m in merchants" :key="m.id">
            <template #header>
              <div class="card-row">
                <div class="avatar-wrap">
                  <a-avatar :size="48" shape="square" :src="m.shopLogoUrl || undefined" class="shop-avatar">
                    <template #icon><ShopOutlined /></template>
                  </a-avatar>
                  <span v-if="m.isActive" class="active-dot" />
                </div>
                <div class="item-info">
                  <div class="item-name">{{ m.shopName }}</div>
                  <div class="item-sub">{{ m.contactPhone || m.contactEmail || '-' }}</div>
                </div>
                <div class="status-side">
                  <a-tag :color="m.isActive ? 'success' : 'default'" class="status-tag">
                    {{ m.isActive ? $t('merchants.active') : $t('merchants.inactive') }}
                  </a-tag>
                </div>
              </div>
            </template>

            <div class="card-detail">
              <div class="detail-row">
                <span class="detail-label">{{ $t('merchants.shopAddress') }}</span>
                <span class="detail-val">{{ m.shopAddress || '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ $t('merchants.defaultCurrency') }}</span>
                <span class="detail-val">{{ m.defaultCurrency }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ $t('merchants.contactPhone') }}</span>
                <span class="detail-val">{{ m.contactPhone || '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ $t('merchants.contactEmail') }}</span>
                <span class="detail-val">{{ m.contactEmail || '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ $t('merchants.createdAt') }}</span>
                <span class="detail-val">{{ formatDate(m.createdAt) }}</span>
              </div>
              <div class="detail-row border-none pt-2">
                <a-button type="primary" ghost size="small" class="action-btn" @click="() => $emit('detail', m)">
                  <EyeOutlined /> {{ $t('merchants.detail.viewDetail') }}
                </a-button>
                <a-button type="default" size="small" class="action-btn" @click="() => $emit('edit', m)">
                  <EditOutlined /> {{ $t('common.edit') }}
                </a-button>
                <a-tooltip :title="$t('merchants.changePassword')">
                  <a-button type="default" size="small" class="action-btn" @click="() => $emit('changePassword', m)">
                    <KeyOutlined /> {{ $t('merchants.changePassword') }}
                  </a-button>
                </a-tooltip>
                <a-tooltip :title="m.isActive ? $t('merchants.deactivateMerchant') : $t('merchants.activateMerchant')">
                  <a-button 
                    type="text" 
                    size="small" 
                    :class="['action-btn', m.isActive ? 'status-active' : 'status-inactive']"
                    @click="() => $emit('toggle-status', m)"
                  >
                    <PoweroffOutlined /> {{ m.isActive ? $t('merchants.deactivate') : $t('merchants.activate') }}
                  </a-button>
                </a-tooltip>
                <a-popconfirm :title="$t('merchants.confirmDelete')" @confirm="() => $emit('delete', m)">
                  <a-button type="text" danger size="small" class="action-btn">
                    <DeleteOutlined /> {{ $t('common.delete') }}
                  </a-button>
                </a-popconfirm>
              </div>
            </div>
          </a-collapse-panel>
        </a-collapse>

        <div v-if="merchants.length > 0" class="pagination-row">
          <a-pagination
            v-model:current="mobilePage"
            :page-size="props.pagination.limit"
            :total="props.pagination.total"
            simple
            @change="(p: number, s: number) => emit('pageChange', p, s)"
          />
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import dayjs from 'dayjs';
import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ShopOutlined,
  DownOutlined,
  EyeOutlined,
  FilterOutlined,
  PoweroffOutlined,
  KeyOutlined,
} from '@ant-design/icons-vue';
import { useIsMobile } from '@/shared/composables/useIsMobile';
import type { Merchant } from '@/domain/entities/user.entity';
import { useI18n } from 'vue-i18n';
// import type { m } from 'vue-router/dist/index-DvGaX1AX.mjs';

export interface MerchantFilterPayload {
  search?: string;
  searchField?: string;
  sort?: 'ASC' | 'DESC';
}

const emit = defineEmits<{
  (e: 'create'): void;
  (e: 'detail', merchant: Merchant): void;
  (e: 'edit', merchant: Merchant): void;
  (e: 'delete', merchant: Merchant): void;
  (e: 'toggle-status', merchant: Merchant): void;
  (e: 'changePassword', merchant: Merchant): void;
  (e: 'pageChange', page: number, pageSize: number): void;
  (e: 'filter', payload: MerchantFilterPayload): void;
}>();

const props = defineProps<{
  merchants: Merchant[];
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}>();

const { t: $t } = useI18n();
const { isMobile } = useIsMobile();

const formatDate = (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm');

const handleCreate = () => emit('create');

/* ===== Filter visibility ===== */
/* Desktop: start open, Mobile: start closed */
const filterVisible = ref(!isMobile.value);

watch(isMobile, (mobile) => {
  if (mobile) filterVisible.value = false;
  else filterVisible.value = true;
});

/* ===== Filter state ===== */
const q = ref('');
const searchField = ref<string | undefined>(undefined);
const filterSort = ref<'ASC' | 'DESC' | undefined>(undefined);
const mobilePage = ref(props.pagination.page);

/* Check if there are active filters (for showing dot on toggle button) */
const hasActiveFilters = computed(
  () =>
    filterSort.value !== undefined,
);

/* ===== Emit current filter state ===== */
const emitFilter = () => {
  emit('filter', {
    search: q.value || undefined,
    searchField: searchField.value || undefined,
    sort: filterSort.value,
  });
};

const resetFilters = () => {
  q.value = '';
  searchField.value = undefined;
  filterSort.value = undefined;
  emitFilter();
};

/* Debounce for search input */
let searchTimer: number | undefined;
const onSearchChange = () => {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => emitFilter(), 450);
};

/* ===== Pagination ===== */
const paginationConfig = computed(() => ({
  current: props.pagination.page,
  pageSize: props.pagination.limit,
  total: props.pagination.total,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
}));

watch(() => props.pagination.page, (v) => { mobilePage.value = v; });

const handleTableChange = (p: TablePaginationConfig) => {
  if (p.current && p.pageSize) emit('pageChange', p.current, p.pageSize);
};

/* ===== Columns ===== */
const columns = computed<TableColumnsType>(() => [
  {
    title: '#',
    key: 'index',
    width: 60,
    customRender: ({ index }: { index: number }) =>
      (props.pagination.page - 1) * props.pagination.limit + index + 1,
  },
  { title: $t('merchants.shopName'), dataIndex: 'shopName', key: 'shopName', width: 200 },
  { title: 'Logo', key: 'shopLogoUrl', width: 70, align: 'center' as const },
  { title: $t('merchants.shopAddress'), dataIndex: 'shopAddress', key: 'shopAddress', width: 200 },
  { title: $t('merchants.contactPhone'), dataIndex: 'contactPhone', key: 'contactPhone', width: 140 },
  { title: $t('merchants.contactEmail'), dataIndex: 'contactEmail', key: 'contactEmail', width: 220 },
  { title: $t('merchants.defaultCurrency'), dataIndex: 'defaultCurrency', key: 'defaultCurrency', width: 110 },
  { title: $t('merchants.isActive'), key: 'isActive', width: 110, align: 'center' as const },
  { title: $t('merchants.createdAt'), key: 'createdAt', width: 170 },
  { title: $t('merchants.updatedAt'), key: 'updatedAt', width: 170 },
  { title: $t('merchants.actions'), key: 'actions', fixed: 'right' as const, width: 130, align: 'center' as const },
]);
</script>

<style scoped>
/* ===== Page header ===== */
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.title-block { flex: 1 1 auto; min-width: 0; }
.page-title { font-size: 22px; font-weight: 600; color: #0f172a; line-height: 1.25; }
.page-subtitle { font-size: 13px; color: #64748b; margin-top: 2px; }

/* Header actions container */
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* Create button in header */
.header-create-btn {
  height: 44px;
  border-radius: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  flex-shrink: 0;
}

/* Filter toggle button */
.filter-toggle-btn {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;
}
.filter-toggle-btn:hover {
  background: #f1f5f9;
  color: #1d4ed8;
  border-color: #1d4ed8;
}
.filter-toggle-btn--active {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #1d4ed8;
  box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.1);
}
.filter-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: #1d4ed8;
  border-radius: 999px;
  border: 2px solid #fff;
}

/* ===== Collapsible filter panel ===== */
.filter-collapse {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition:
    grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.28s ease,
    transform 0.28s ease;
  transform: translateY(-6px);
  margin-bottom: 0;
}
.filter-collapse--open {
  grid-template-rows: 1fr;
  opacity: 1;
  transform: translateY(0);
  margin-bottom: 12px;
}
.filter-collapse-inner {
  overflow: hidden;
}

.add-btn { height: 44px; border-radius: 12px; font-weight: 700; flex-shrink: 0; }

/* ===== Filter card ===== */
.filter-card {
  border-radius: 14px;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.04);
}
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
.filter-item { height: 40px; }
.filter-item.search-input { min-width: 180px; flex: 1 1 200px; max-width: 280px; border-radius: 10px; }
.filter-item.search-field-select { min-width: 140px; flex: 0 0 auto; }
.filter-item.search-field-select :deep(.ant-select-selector) { border-radius: 10px !important; height: 40px !important; }
.filter-item.add-btn { flex-shrink: 0; }
.filter-select { min-width: 160px; flex: 1 1 160px; max-width: 220px; }
.filter-select :deep(.ant-select-selector) { border-radius: 10px !important; height: 40px !important; }
.filter-select :deep(.ant-select-selection-item) { line-height: 38px !important; }
.filter-select :deep(.ant-select-selection-placeholder) { line-height: 38px !important; }

.reset-btn {
  border-radius: 10px;
  flex-shrink: 0;
  height: 40px;
  padding: 0 18px;
  font-weight: 600;
  color: #64748b;
  border-color: #e2e8f0;
}
.reset-btn:hover { color: #1d4ed8 !important; border-color: #1d4ed8 !important; }

/* ===== Desktop card ===== */
.panel-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}
.pill-tag { border-radius: 999px; padding: 2px 10px; font-weight: 700; }
.actions-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  flex-wrap: nowrap;
  position: relative;
  z-index: 10;
}
.icon-action {
  border-radius: 8px;
  min-width: 28px;
  width: 28px;
  height: 28px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.icon-action:hover { background: rgba(29, 78, 216, 0.08) !important; color: #1d4ed8; }

/* ===== Fixed right column: background + z-index เพื่อ scroll ข้ามโดยไม่ใส ===== */
:deep(.ant-table-cell-fix-right) {
  background: #ffffff !important;
}
:deep(.ant-table-thead .ant-table-cell-fix-right) {
  background: #f8fafc !important;
  z-index: 11 !important;
}
:deep(.ant-table-tbody .ant-table-cell-fix-right) {
  z-index: 2 !important;
}
/* :deep(.ant-table-tbody > tr:hover .ant-table-cell-fix-right) {
  background: rgba(24, 144, 255, 0.06) !important;
} */

.eye-btn { color: #6366f1; }
.eye-btn:hover { background: rgba(99, 102, 241, 0.1) !important; color: #4f46e5; }
.address-cell {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 170px;
}
:deep(.ant-table-thead > tr > th) {
  background: #f8fafc !important;
  color: #0f172a;
  font-weight: 700;
}
:deep(.ant-table-tbody > tr:hover > td:not(.ant-table-cell-fix-right)) {
  background: rgba(24, 144, 255, 0.06) !important;
}

/* ===== Mobile / Tablet card list ===== */
.merchants-mobile { display: flex; flex-direction: column; gap: 0; }
.merchants-collapse { background: transparent !important; border: none !important; }
.merchants-collapse :deep(.ant-collapse-item) {
  background: #ffffff !important;
  border-radius: 16px !important;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.06) !important;
  border: 1px solid rgba(148, 163, 184, 0.15) !important;
  overflow: hidden;
  margin-bottom: 10px !important;
}
.merchants-collapse :deep(.ant-collapse-header) { padding: 14px 14px !important; align-items: center !important; }
.merchants-collapse :deep(.ant-collapse-content) { background: transparent !important; border-top: 1px solid rgba(148, 163, 184, 0.18) !important; }
.merchants-collapse :deep(.ant-collapse-content-box) { padding: 0 14px 14px !important; }

.expand-icon { font-size: 13px; color: #94a3b8; transition: transform 260ms ease; }
.expand-icon.rotated { transform: rotate(180deg); }

.card-row { display: flex; align-items: center; gap: 12px; padding-right: 4px; }
.avatar-wrap { position: relative; flex-shrink: 0; }
.shop-avatar { background: rgba(22, 119, 255, 0.1); color: #1677ff; }
.active-dot {
  position: absolute; bottom: 2px; left: 2px;
  width: 11px; height: 11px; background: #22c55e;
  border-radius: 999px; border: 2px solid #fff;
}
.item-info { flex: 1; min-width: 0; }
.item-name { font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.3; }
.item-sub { font-size: 13px; color: #64748b; margin-top: 2px; }
.status-side { flex-shrink: 0; margin-left: auto; }
.status-tag { border-radius: 999px; font-weight: 700; font-size: 12px; }

.card-detail { padding-top: 10px; }
.detail-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 0; border-bottom: 1px solid rgba(148, 163, 184, 0.2); gap: 8px;
}
.detail-row.border-none { border-bottom: none; justify-content: flex-end; gap: 8px; padding-bottom: 0; }
.detail-row.pt-2 { padding-top: 8px; }
.detail-label { font-size: 12px; font-weight: 600; color: #94a3b8; flex-shrink: 0; }
.detail-val { font-size: 13px; font-weight: 600; color: #1e293b; text-align: right; }
.action-btn { border-radius: 8px; font-size: 13px; }

/* Status toggle button styles */
.status-active {
  color: #52c41a !important;
  background: rgba(82, 196, 26, 0.1) !important;
  border-color: rgba(82, 196, 26, 0.3) !important;
}
.status-active:hover {
  background: rgba(82, 196, 26, 0.2) !important;
  color: #389e0d !important;
  border-color: rgba(82, 196, 26, 0.5) !important;
}
.status-inactive {
  color: #8c8c8c !important;
  background: rgba(140, 140, 140, 0.1) !important;
  border-color: rgba(140, 140, 140, 0.3) !important;
}
.status-inactive:hover {
  background: rgba(140, 140, 140, 0.2) !important;
  color: #595959 !important;
  border-color: rgba(140, 140, 140, 0.5) !important;
}

.pagination-row {
  display: flex; justify-content: center;
  margin-top: 16px; padding-bottom: 8px;
}

/* ===== Responsive ===== */

/* Galaxy Tab S7 (768px - 1024px) */
@media (max-width: 1024px) and (min-width: 768px) {
  .filter-select { min-width: 150px; max-width: 180px; }
  .search-input { width: min(260px, 100%); }
}

/* Mobile < 768px */
@media (max-width: 767px) {
  .page-header { flex-wrap: wrap; }
  .title-block { flex: 1 1 auto; }
  .header-actions { gap: 6px; }
  .header-create-btn { 
    height: 36px; 
    font-size: 12px; 
    padding: 0 10px;
    min-width: auto;
  }
  .filter-toggle-btn { width: 40px; height: 40px; border-radius: 10px; }
  .page-title { font-size: 16px; }
  .page-subtitle { display: none; }

  .filter-bar { gap: 8px; }
  .filter-item.search-input { flex: 1 1 100%; max-width: none; }
  .filter-item.search-field-select { min-width: 120px; flex: 1 1 auto; }
  .filter-select { flex: 1 1 calc(50% - 4px); min-width: unset; max-width: unset; }
  .reset-btn { flex: 1 1 100%; }
}
</style>
