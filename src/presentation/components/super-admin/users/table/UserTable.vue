<template>
  <div class="sa-users">
    <!-- Header: on mobile → title+button same row, search below; on desktop → title | search+button -->
    <div class="page-header">
      <div class="title-block">
        <div class="page-title">{{ $t('users.title') }}</div>
        <div class="page-subtitle">{{ $t('users.subtitle') }}</div>
      </div>

      <a-input
        v-model:value="q"
        allow-clear
        class="search-input"
        :placeholder="$t('users.search')"
        @pressEnter="triggerSearch"
      >
        <template #prefix><SearchOutlined /></template>
      </a-input>

      <!-- <a-button type="primary" class="add-btn" @click="$emit('create-merchant')">
        <template #icon><PlusOutlined /></template>
        {{ $t('users.createUser') }}
      </a-button> -->
    </div>

    <!-- Desktop: table inside card -->
    <a-card v-if="!isMobile" :bordered="false" class="panel-card">
      <a-table
        :columns="columns"
        :data-source="users"
        :pagination="paginationConfig"
        row-key="id"
        size="middle"
        :loading="loading"
        :scroll="{ x: 1100 }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'isActive'">
            <a-tag :color="record.isActive ? 'success' : 'default'">
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
              <a-popconfirm :title="$t('users.confirmDelete')" @confirm="$emit('delete', record)">
                <a-button type="text" danger class="icon-action"><DeleteOutlined /></a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Mobile: individual cards with expand, no outer wrapper -->
    <div v-else class="users-mobile">
      <a-collapse accordion ghost class="users-collapse">
        <template #expandIcon="{ isActive }">
          <DownOutlined class="expand-icon" :class="{ rotated: isActive }" />
        </template>

        <a-collapse-panel v-for="u in users" :key="u.id" class="user-panel">
          <template #header>
            <div class="card-row">
              <!-- Avatar + active dot -->
              <div class="avatar-wrap">
                <a-avatar class="user-avatar" :size="48">
                  {{ (u.fullName || u.email || '?').slice(0, 1).toUpperCase() }}
                </a-avatar>
                <span v-if="u.isActive" class="active-dot" />
              </div>

              <!-- Name + email (left) -->
              <div class="user-info">
                <div class="user-name">{{ u.fullName || '-' }}</div>
                <div class="user-email">{{ u.email }}</div>
              </div>

              <!-- Status tag (right) -->
              <div class="status-side">
                <a-tag :color="u.isActive ? 'success' : 'default'" class="status-tag">
                  {{ u.isActive ? $t('users.active') : $t('users.inactive') }}
                </a-tag>
              </div>
            </div>
          </template>

          <!-- Expanded detail rows -->
          <div class="card-detail">
            <div class="detail-row">
              <span class="detail-label">{{ $t('users.role') }}</span>
              <span class="detail-val">{{ u.roleName || '-' }}</span>
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
              <a-popconfirm :title="$t('users.confirmDelete')" @confirm="$emit('delete', u)">
                <a-button type="text" danger size="small" class="delete-btn">
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
import { computed, ref, watch } from 'vue';
import dayjs from 'dayjs';
import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
import { useIsMobile } from '@/shared/composables/useIsMobile';
import { SearchOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons-vue';
import type { User } from '@/domain/entities/user.entity';
import { useI18n } from 'vue-i18n';

const emit = defineEmits<{
  (e: 'create-merchant'): void;
  (e: 'delete', user: User): void;
  (e: 'search', value: string): void;
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

const q = ref('');

let searchTimer: number | undefined;
const triggerSearch = () => {
  window.clearTimeout(searchTimer);
  emit('search', q.value);
};

watch(q, () => {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    emit('search', q.value);
  }, 450);
});

const paginationConfig = computed(() => ({
  current: props.pagination.page,
  pageSize: props.pagination.limit,
  total: props.pagination.total,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
}));

const handleTableChange = (p: TablePaginationConfig) => {
  if (p.current && p.pageSize) emit('page-change', p.current, p.pageSize);
};

const columns = computed<TableColumnsType>(() => [
  { title: '#', key: 'index', width: 70, customRender: ({ index }: { index: number }) => (props.pagination.page - 1) * props.pagination.limit + index + 1 },
  { title: $t('users.email'), dataIndex: 'email', key: 'email', width: 260 },
  { title: $t('users.fullName'), dataIndex: 'fullName', key: 'fullName', width: 220 },
  { title: $t('users.role'), dataIndex: 'roleName', key: 'roleName', width: 160 },
  { title: $t('users.isActive'), key: 'isActive', width: 120 },
  { title: $t('users.lastLogin'), key: 'lastLogin', width: 180 },
  { title: $t('users.createdAt'), key: 'createdAt', width: 180 },
  { title: $t('users.actions'), key: 'actions', fixed: 'right' as const, width: 120, align: 'right' as const },
]);
</script>

<style scoped>
/* ===== Page header ===== */
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

/* Mobile header: title+button same row, search drops to next row full-width */
@media (max-width: 767px) {
  .page-header { flex-wrap: wrap; }
  .title-block { order: 1; flex: 1 1 auto; }
  .add-btn { order: 2; flex-shrink: 0; height: 36px; font-size: 12px; padding: 0 10px; }
  .search-input { order: 3; flex: 1 1 100%; width: 100%; }
  .page-title { font-size: 15px; }
  .page-subtitle { display: none; }
}

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
:deep(.ant-table-tbody > tr:hover > td) {
  background: rgba(24, 144, 255, 0.06) !important;
}

/* ===== Mobile card list ===== */
.users-mobile { display: flex; flex-direction: column; gap: 12px; }

/* Each panel = white card */
.users-collapse { background: transparent !important; border: none !important; }
.users-collapse :deep(.ant-collapse-item) {
  background: #ffffff !important;
  border-radius: 16px !important;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.06) !important;
  border: 1px solid rgba(148, 163, 184, 0.15) !important;
  overflow: hidden;
  margin-bottom: 10px !important;
}
.users-collapse :deep(.ant-collapse-header) {
  padding: 14px 14px !important;
  align-items: center !important;
}
.users-collapse :deep(.ant-collapse-content) {
  background: transparent !important;
  border-top: 1px solid rgba(148, 163, 184, 0.18) !important;
}
.users-collapse :deep(.ant-collapse-content-box) {
  padding: 0 14px 14px !important;
}

/* Expand icon: chevron down */
.expand-icon {
  font-size: 13px;
  color: #94a3b8;
  transition: transform 260ms ease;
}
.expand-icon.rotated { transform: rotate(180deg); }

/* Card header row */
.card-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: 4px;
}

/* Status tag on the right */
.status-side { flex-shrink: 0; margin-left: auto; }

/* Avatar + green dot */
.avatar-wrap {
  position: relative;
  flex-shrink: 0;
}
.user-avatar {
  background: rgba(22, 119, 255, 0.1);
  color: #1677ff;
  font-weight: 800;
  font-size: 18px;
}
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

/* User info */
.user-info { flex: 1; min-width: 0; }
.user-name { font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.3; }
.user-email { font-size: 13px; color: #64748b; margin-top: 2px; word-break: break-all; }

/* Status tag on right */
.status-tag { border-radius: 999px; font-weight: 700; font-size: 12px; }

/* Expanded detail section */
.card-detail { padding-top: 10px; }
.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  gap: 8px;
}
.detail-row.border-none { border-bottom: none; justify-content: flex-end; }
.detail-label { font-size: 12px; font-weight: 600; color: #94a3b8; }
.detail-val { font-size: 13px; font-weight: 600; color: #1e293b; text-align: right; }
.delete-btn { border-radius: 8px; font-size: 13px; }
</style>
