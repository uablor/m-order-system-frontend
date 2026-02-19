<template>
  <div class="sa-access-table">
    <div class="page-header">
      <div class="title-block">
        <div class="page-title">{{ $t('access.roles.title') }}</div>
      </div>
      <a-button type="primary" class="add-btn" @click="$emit('create')">
        <template #icon><PlusOutlined /></template>
        {{ $t('access.roles.create') }}
      </a-button>
    </div>

    <!-- Desktop: table inside card -->
    <a-card v-if="!isMobile" :bordered="false" class="panel-card">
      <a-table
        :columns="columns"
        :data-source="roles"
        :pagination="paginationConfig"
        row-key="id"
        size="middle"
        :loading="loading"
        :scroll="{ x: 1000 }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'createdAt'">
            {{ formatDate(record.createdAt) }}
          </template>
          <template v-else-if="column.key === 'updatedAt'">
            {{ formatDate(record.updatedAt) }}
          </template>
          <template v-else-if="column.key === 'actions'">
            <div class="flex items-center justify-end gap-2">
              <a-button type="text" class="icon-action" @click="$emit('edit', record)">{{ $t('common.edit') }}</a-button>
              <a-popconfirm :title="$t('access.roles.confirmDelete')" @confirm="$emit('delete', record)">
                <a-button type="text" danger class="icon-action">{{ $t('common.delete') }}</a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Mobile: card collapse list -->
    <div v-else class="roles-mobile">
      <a-collapse class="roles-collapse" :expand-icon="expandCollapseIcon">
        <a-collapse-panel v-for="r in roles" :key="r.id">
          <template #header>
            <div class="card-row">
              <div class="item-info">
                <div class="item-name">{{ r.roleName }}</div>
                <div class="item-sub">{{ r.description || '-' }}</div>
              </div>
            </div>
          </template>

          <div class="card-detail">
            <div class="detail-row">
              <span class="detail-label">Created At</span>
              <span class="detail-val">{{ formatDate(r.createdAt) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Updated At</span>
              <span class="detail-val">{{ formatDate(r.updatedAt) }}</span>
            </div>
            <div class="detail-row action-row">
              <a-button type="primary" ghost size="small" class="action-btn" @click="$emit('edit', r)">{{ $t('common.edit') }}</a-button>
              <a-popconfirm :title="$t('access.roles.confirmDelete')" @confirm="$emit('delete', r)">
                <a-button danger size="small" class="action-btn">{{ $t('common.delete') }}</a-button>
              </a-popconfirm>
            </div>
          </div>
        </a-collapse-panel>
      </a-collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue';
import dayjs from 'dayjs';
import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
import { PlusOutlined, DownOutlined } from '@ant-design/icons-vue';
import { useIsMobile } from '@/shared/composables/useIsMobile';
import type { Role } from '@/domain/entities/user.entity';

const expandCollapseIcon = ({ isActive }: { isActive: boolean }) =>
  h(DownOutlined, { class: 'expand-icon', style: { transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)' } });

const props = defineProps<{
  roles: Role[];
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}>();

const emit = defineEmits<{
  (e: 'create'): void;
  (e: 'edit', role: Role): void;
  (e: 'delete', role: Role): void;
  (e: 'page-change', page: number, pageSize: number): void;
}>();

const formatDate = (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm');

const { isMobile } = useIsMobile();

const paginationConfig = computed(() => ({
  current: props.pagination.page,
  pageSize: props.pagination.limit,
  total: props.pagination.total,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
}));

const handleTableChange = (p: TablePaginationConfig) => {
  if (p.current && p.pageSize) {
    // backend จำกัด limit ไม่เกิน 100
    emit('page-change', p.current, Math.min(p.pageSize, 100));
  }
};

const columns = computed<TableColumnsType>(() => [
  {
    title: '#',
    key: 'index',
    width: 70,
    customRender: ({ index }: { index: number }) =>
      (props.pagination.page - 1) * props.pagination.limit + index + 1,
  },
  { title: 'Role', dataIndex: 'roleName', key: 'roleName', width: 240 },
  { title: 'Description', dataIndex: 'description', key: 'description', width: 360 },
  { title: 'Created At', key: 'createdAt', width: 180 },
  { title: 'Updated At', key: 'updatedAt', width: 180 },
  { title: 'Actions', key: 'actions', fixed: 'right' as const, width: 140 },
]);
</script>

<style scoped>
/* ===== Page header ===== */
.page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.title-block { flex: 1 1 auto; min-width: 0; }
.page-title { font-size: 22px; font-weight: 600; color: #0f172a; line-height: 1.25; }
.add-btn { height: 44px; border-radius: 12px; font-weight: 700; flex-shrink: 0; }

@media (max-width: 767px) {
  .page-title { font-size: 15px; }
  .add-btn { height: 36px; font-size: 12px; padding: 0 10px; }
}

/* ===== Desktop card ===== */
.panel-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}
.icon-action { border-radius: 10px; }
.icon-action:hover { background: rgba(29, 78, 216, 0.08) !important; color: #1d4ed8; }

/* ===== Mobile card list ===== */
.roles-mobile { display: flex; flex-direction: column; }
.roles-collapse { background: transparent !important; border: none !important; }
.roles-collapse :deep(.ant-collapse-item) {
  background: #ffffff !important;
  border-radius: 16px !important;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.06) !important;
  border: 1px solid rgba(148, 163, 184, 0.15) !important;
  overflow: hidden;
  margin-bottom: 10px !important;
}
.roles-collapse :deep(.ant-collapse-header) { padding: 14px 14px !important; align-items: center !important; }
.roles-collapse :deep(.ant-collapse-content) { background: transparent !important; border-top: 1px solid rgba(148, 163, 184, 0.18) !important; }
.roles-collapse :deep(.ant-collapse-content-box) { padding: 0 14px 14px !important; }

.expand-icon { font-size: 13px; color: #94a3b8; transition: transform 260ms ease; }

.card-row { display: flex; align-items: center; gap: 12px; min-width: 0; width: 100%; }
.item-info { flex: 1; min-width: 0; }
.item-name { font-size: 14px; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-sub { font-size: 12px; color: #64748b; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.card-detail { padding-top: 12px; display: flex; flex-direction: column; gap: 8px; }
.detail-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
.detail-label { color: #64748b; font-weight: 500; }
.detail-val { color: #0f172a; font-weight: 600; text-align: right; }
.action-row { justify-content: flex-end; gap: 8px; margin-top: 4px; }
.action-btn { border-radius: 8px; font-weight: 600; }
</style>

