<template>
  <div class="sa-users">
    <!-- ===== Page Header ===== -->
    <div class="page-header">
      <!-- Title block -->
      <div class="title-block">
        <div class="page-title">{{ $t('users.title') }}</div>
        <div class="page-subtitle">{{ $t('users.subtitle') }}</div>
      </div>

      <!-- Header actions -->
      <div class="header-actions">
        <!-- Create button -->
        <a-button type="primary" class="header-create-btn" @click="$emit('create-user')">
          <template #icon><PlusOutlined /></template>
          {{ $t('users.createUser') }}
        </a-button>
        
        <!-- Filter toggle button -->
        <a-tooltip :title="$t('users.filterSort')">
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
            <a-input
              v-model:value="q"
              allow-clear
              class="filter-item search-input"
              :placeholder="$t('users.search')"
              @pressEnter="emitFilter"
              @change="onSearchChange"
            >
              <template #prefix><SearchOutlined /></template>
            </a-input>

            <a-select
              v-model:value="searchField"
              allow-clear
              class="filter-item search-field-select"
              :placeholder="$t('users.filterSearchField')"
              @change="emitFilter"
            >
              <a-select-option value="fullName">{{ $t('users.fullName') }}</a-select-option>
              <a-select-option value="email">{{ $t('users.email') }}</a-select-option>
            </a-select>

            <a-select
              v-model:value="filterIsActive"
              allow-clear
              class="filter-item filter-select"
              :placeholder="$t('users.filterStatus')"
              @change="emitFilter"
            >
              <a-select-option :value="true">{{ $t('users.active') }}</a-select-option>
              <a-select-option :value="false">{{ $t('users.inactive') }}</a-select-option>
            </a-select>

            <a-select
              v-model:value="filterSort"
              allow-clear
              class="filter-item filter-select"
              :placeholder="$t('users.filterSort')"
              @change="emitFilter"
            >
              <a-select-option value="DESC">{{ $t('users.sortNewest') }}</a-select-option>
              <a-select-option value="ASC">{{ $t('users.sortOldest') }}</a-select-option>
            </a-select>

            <a-date-picker
              v-model:value="filterStartDate"
              class="filter-item filter-date"
              :placeholder="$t('users.filterStartDate')"
              popup-class-name="single-panel-picker"
              @change="emitFilter"
            />

            <a-date-picker
              v-model:value="filterEndDate"
              class="filter-item filter-date"
              :placeholder="$t('users.filterEndDate')"
              popup-class-name="single-panel-picker"
              @change="emitFilter"
            />

            <a-button class="filter-item reset-btn" @click="resetFilters">
              {{ $t('users.filterReset') }}
            </a-button>
          </div>
        </a-card>
      </div>
    </div>

    <!-- ===== Desktop: table inside card ===== -->
    <a-card v-if="!isMobile" :bordered="false" class="panel-card">
      <a-table
        :columns="columns"
        :data-source="users"
        :pagination="paginationConfig"
        row-key="id"
        size="middle"
        :loading="loading"
        :scroll="{ x: 1000 }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'roleName'">
            <a-tag color="blue" class="role-tag">
              {{ record.roleName || record.role?.roleName || '-' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'isActive'">
            <a-tag :color="record.isActive ? 'success' : 'default'" class="pill-tag">
              {{ record.isActive ? $t('users.active') : $t('users.inactive') }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'lastLogin'">
            {{ record.lastLogin ? formatDate(record.lastLogin) : '-' }}
          </template>
          <template v-else-if="column.key === 'createdAt'">
            {{ formatDate(record.createdAt) }}
          </template>
          <template v-else-if="column.key === 'actions'">
            <div class="flex items-center justify-end gap-2">
              <a-tooltip :title="$t('users.changePassword')">
                <a-button type="text" size="small" class="icon-action" @click="$emit('changePassword', record)">
                  <KeyOutlined />
                </a-button>
              </a-tooltip>
              <a-tooltip :title="record.isActive ? $t('users.deactivateUser') : $t('users.activateUser')">
              <a-button 
                type="text" 
                size="small" 
                :class="['icon-action', record.isActive ? 'status-active' : 'status-inactive']"
                @click="$emit('toggle-status', record)"
              >
                <PoweroffOutlined />
              </a-button>
            </a-tooltip>
              <a-popconfirm :title="$t('users.confirmDelete')" @confirm="$emit('delete', record)">
                <a-button type="text" danger class="icon-action"><DeleteOutlined /></a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- ===== Mobile / Tablet: card list ===== -->
    <div v-else class="users-mobile">
      <a-spin :spinning="loading">
        <a-empty v-if="users.length === 0 && !loading" :description="$t('users.noUsers')" />

        <a-collapse accordion ghost class="users-collapse">
          <template #expandIcon="{ isActive }">
            <DownOutlined class="expand-icon" :class="{ rotated: isActive }" />
          </template>

          <a-collapse-panel v-for="u in users" :key="u.id" class="user-panel">
            <template #header>
              <div class="card-row">
                <div class="avatar-wrap">
                  <a-avatar class="user-avatar" :size="48">
                    {{ (u.fullName || u.email || '?').slice(0, 1).toUpperCase() }}
                  </a-avatar>
                  <span v-if="u.isActive" class="active-dot" />
                </div>
                <div class="user-info">
                  <div class="user-name">{{ u.fullName || '-' }}</div>
                  <div class="user-email">{{ u.email }}</div>
                </div>
                <div class="status-side">
                  <a-tag :color="u.isActive ? 'success' : 'default'" class="status-tag">
                    {{ u.isActive ? $t('users.active') : $t('users.inactive') }}
                  </a-tag>
                </div>
              </div>
            </template>

            <div class="card-detail">
              <div class="detail-row">
                <span class="detail-label">{{ $t('users.role') }}</span>
                <a-tag color="blue" class="role-tag">
                  {{ (u as any).roleName || (u as any).role?.roleName || '-' }}
                </a-tag>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ $t('users.lastLogin') }}</span>
                <span class="detail-val">{{ u.lastLogin ? formatDate(u.lastLogin) : '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ $t('users.createdAt') }}</span>
                <span class="detail-val">{{ formatDate(u.createdAt) }}</span>
              </div>
              <div class="detail-row border-none pt-2">
                <a-tooltip :title="$t('users.changePassword')">
                  <a-button type="default" size="small" class="delete-btn" @click="() => $emit('changePassword', u)">
                    <KeyOutlined /> {{ $t('users.changePassword') }}
                  </a-button>
                </a-tooltip>
                <a-tooltip :title="u.isActive ? $t('users.deactivateUser') : $t('users.activateUser')">
                  <a-button 
                    type="text" 
                    size="small" 
                    :class="['delete-btn', u.isActive ? 'status-active' : 'status-inactive']"
                    @click="() => $emit('toggle-status', u)"
                  >
                    <PoweroffOutlined /> {{ u.isActive ? $t('users.deactivate') : $t('users.activate') }}
                  </a-button>
                </a-tooltip>
                <a-popconfirm :title="$t('users.confirmDelete')" @confirm="() => $emit('delete', u)">
                  <a-button type="text" danger size="small" class="delete-btn">
                    <DeleteOutlined /> {{ $t('common.delete') }}
                  </a-button>
                </a-popconfirm>
              </div>
            </div>
          </a-collapse-panel>
        </a-collapse>

        <div v-if="users.length > 0" class="pagination-row">
          <a-pagination
            v-model:current="mobilePage"
            :page-size="props.pagination.limit"
            :total="props.pagination.total"
            simple
            @change="(p: number, s: number) => emit('page-change', p, s)"
          />
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
import { useIsMobile } from '@/shared/composables/useIsMobile';
import {
  SearchOutlined,
  DeleteOutlined,
  DownOutlined,
  PlusOutlined,
  FilterOutlined,
  PoweroffOutlined,
  KeyOutlined,
} from '@ant-design/icons-vue';
import type { User } from '@/domain/entities/user.entity';
import { useI18n } from 'vue-i18n';

export interface UserFilterPayload {
  search?: string;
  searchField?: string;
  isActive?: boolean;
  sort?: 'ASC' | 'DESC';
  startDate?: string;
  endDate?: string;
}

const emit = defineEmits<{
  (e: 'create-user'): void;
  (e: 'create-merchant'): void;
  (e: 'delete', user: User): void;
  (e: 'toggle-status', user: User): void;
  (e: 'changePassword', user: User): void;
  (e: 'filter-change', filters: UserFilterPayload): void;
  (e: 'page-change', page: number, pageSize: number): void;
}>();

const props = defineProps<{
  users: User[];
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}>();

const { isMobile } = useIsMobile();
const { t: $t } = useI18n();

const formatDate = (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm');

/* ===== Filter visibility ===== */
/* Desktop: เริ่มแบบ open, Mobile: เริ่มแบบ closed */
const filterVisible = ref(!isMobile.value);

watch(isMobile, (mobile) => {
  if (mobile) filterVisible.value = false;
  else filterVisible.value = true;
});

/* ===== Filter state ===== */
const q = ref('');
const searchField = ref<string | undefined>(undefined);
const filterIsActive = ref<boolean | undefined>(undefined);
const filterSort = ref<'ASC' | 'DESC' | undefined>(undefined);
const filterStartDate = ref<Dayjs | null>(null);
const filterEndDate = ref<Dayjs | null>(null);
const mobilePage = ref(props.pagination.page);

/* ตรวจว่ามี filter ที่ active อยู่ (สำหรับแสดง dot บน toggle button) */
const hasActiveFilters = computed(
  () =>
    filterIsActive.value !== undefined ||
    filterSort.value !== undefined ||
    filterStartDate.value !== null ||
    filterEndDate.value !== null,
);

/* ===== Emit current filter state ===== */
const emitFilter = () => {
  emit('filter-change', {
    search: q.value || undefined,
    searchField: searchField.value || undefined,
    isActive: filterIsActive.value,
    sort: filterSort.value,
    startDate: filterStartDate.value?.format('YYYY-MM-DD') ?? undefined,
    endDate: filterEndDate.value?.format('YYYY-MM-DD') ?? undefined,
  });
};

const resetFilters = () => {
  q.value = '';
  searchField.value = undefined;
  filterIsActive.value = undefined;
  filterSort.value = undefined;
  filterStartDate.value = null;
  filterEndDate.value = null;
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
  if (p.current && p.pageSize) emit('page-change', p.current, p.pageSize);
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
  { title: $t('users.email'), dataIndex: 'email', key: 'email', width: 240 },
  { title: $t('users.fullName'), dataIndex: 'fullName', key: 'fullName', width: 200 },
  { title: $t('users.role'), key: 'roleName', width: 140 },
  { title: $t('users.isActive'), key: 'isActive', width: 110, align: 'center' as const },
  { title: $t('users.lastLogin'), key: 'lastLogin', width: 170 },
  { title: $t('users.createdAt'), key: 'createdAt', width: 170 },
  { title: $t('users.actions'), key: 'actions', fixed: 'right' as const, width: 100, align: 'right' as const },
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

.filter-item { height: 40px; }
.filter-item.search-input { min-width: 180px; flex: 1 1 200px; max-width: 280px; border-radius: 10px; }
.filter-item.search-field-select { min-width: 140px; flex: 0 0 auto; }
.filter-item.search-field-select :deep(.ant-select-selector) { border-radius: 10px !important; height: 40px !important; }
.filter-item.add-btn { flex-shrink: 0; }

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

/* Red dot on filter icon when filters are active */
.filter-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 7px;
  height: 7px;
  background: #ef4444;
  border-radius: 999px;
  border: 1.5px solid #fff;
}

.add-btn { height: 44px; border-radius: 12px; font-weight: 700; flex-shrink: 0; }

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

/* ===== Filter card content ===== */
.filter-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.04);
  margin-top: 4px;
}
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
.filter-item { height: 40px; }
.filter-select { min-width: 150px; flex: 1 1 150px; max-width: 200px; }
.filter-select :deep(.ant-select-selector) { border-radius: 10px !important; height: 40px !important; }
.filter-select :deep(.ant-select-selection-item) { line-height: 38px !important; }
.filter-select :deep(.ant-select-selection-placeholder) { line-height: 38px !important; }

.filter-date { min-width: 150px; flex: 1 1 150px; max-width: 180px; }
.filter-date :deep(.ant-picker) { border-radius: 10px; height: 40px; }

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
.icon-action { border-radius: 10px; }
.icon-action:hover { background: rgba(29, 78, 216, 0.08) !important; color: #1d4ed8; }
:deep(.ant-table) { width: 100%; }
:deep(.ant-table-thead > tr > th) {
  background: #f8fafc !important;
  color: #0f172a;
  font-weight: 700;
}
:deep(.ant-table-tbody > tr:hover > td:not(.ant-table-cell-fix-right)) {
  background: rgba(24, 144, 255, 0.06) !important;
}

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
.role-tag { border-radius: 999px; font-size: 12px; font-weight: 700; }
.pill-tag { border-radius: 999px; font-weight: 700; }

/* ===== Mobile / Tablet card list ===== */
.users-mobile { display: flex; flex-direction: column; gap: 0; }
.users-collapse { background: transparent !important; border: none !important; }
.users-collapse :deep(.ant-collapse-item) {
  background: #ffffff !important;
  border-radius: 16px !important;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.06) !important;
  border: 1px solid rgba(148, 163, 184, 0.15) !important;
  overflow: hidden;
  margin-bottom: 10px !important;
}
.users-collapse :deep(.ant-collapse-header) { padding: 14px 14px !important; align-items: center !important; }
.users-collapse :deep(.ant-collapse-content) {
  background: transparent !important;
  border-top: 1px solid rgba(148, 163, 184, 0.18) !important;
}
.users-collapse :deep(.ant-collapse-content-box) { padding: 0 14px 14px !important; }

.expand-icon { font-size: 13px; color: #94a3b8; transition: transform 260ms ease; }
.expand-icon.rotated { transform: rotate(180deg); }

.card-row { display: flex; align-items: center; gap: 12px; padding-right: 4px; }
.status-side { flex-shrink: 0; margin-left: auto; }

.avatar-wrap { position: relative; flex-shrink: 0; }
.user-avatar { background: rgba(22, 119, 255, 0.1); color: #1677ff; font-weight: 800; font-size: 18px; }
.active-dot {
  position: absolute; bottom: 2px; left: 2px;
  width: 11px; height: 11px; background: #22c55e;
  border-radius: 999px; border: 2px solid #fff;
}
.user-info { flex: 1; min-width: 0; }
.user-name { font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.3; }
.user-email { font-size: 13px; color: #64748b; margin-top: 2px; word-break: break-all; }
.status-tag { border-radius: 999px; font-weight: 700; font-size: 12px; }

.card-detail { padding-top: 10px; }
.detail-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 0; border-bottom: 1px solid rgba(148, 163, 184, 0.2); gap: 8px;
}
.detail-row.border-none { border-bottom: none; justify-content: flex-end; }
.detail-row.pt-2 { padding-top: 8px; }
.detail-label { font-size: 12px; font-weight: 600; color: #94a3b8; }
.detail-val { font-size: 13px; font-weight: 600; color: #1e293b; text-align: right; }
.delete-btn { border-radius: 8px; font-size: 13px; }

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

/* ===== Galaxy Tab S7 (768–1024px) ===== */
@media (max-width: 1024px) and (min-width: 768px) {
  .search-input { width: 180px; }
  .search-field-select { width: 130px; }
  .filter-select { min-width: 130px; max-width: 160px; }
  .filter-date { min-width: 130px; max-width: 160px; }
}

/* ===== Mobile < 768px */
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

<style>
/* Single panel date picker — non-scoped เพราะ popup render นอก component */
.single-panel-picker .ant-picker-panels > *:last-child { display: none !important; }
.single-panel-picker .ant-picker-panels > *:first-child .ant-picker-header-next-btn,
.single-panel-picker .ant-picker-panels > *:first-child .ant-picker-header-super-next-btn {
  visibility: visible !important;
}
.single-panel-picker .ant-picker-panel-container { min-width: unset !important; }
</style>
