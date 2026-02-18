<template>
  <div class="sa-access-table">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
      <div>
        <div class="text-3xl font-semibold text-slate-900">{{ $t('access.permissions.title') }}</div>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
        <a-button type="default" class="add-btn sm:shrink-0" @click="$emit('generate')">
          {{ $t('access.permissions.generate') }}
        </a-button>
        <a-button type="primary" class="add-btn sm:shrink-0" @click="$emit('create')">
          <template #icon><PlusOutlined /></template>
          {{ $t('access.permissions.create') }}
        </a-button>
      </div>
    </div>

    <a-card :bordered="false" class="panel-card">
      <a-table
        v-if="!isMobile"
        :columns="columns"
        :data-source="permissions"
        :pagination="paginationConfig"
        row-key="id"
        size="middle"
        :loading="loading"
        :scroll="{ x: 1100 }"
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
              <a-popconfirm :title="$t('access.permissions.confirmDelete')" @confirm="$emit('delete', record)">
                <a-button type="text" danger class="icon-action">{{ $t('common.delete') }}</a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>

      <div v-else class="mobile-list">
        <a-collapse accordion ghost class="mobile-collapse">
          <a-collapse-panel v-for="p in permissions" :key="p.id">
            <template #header>
              <div class="mobile-header">
                <div class="font-semibold text-slate-900 truncate">{{ p.permissionCode }}</div>
                <div class="text-slate-500 text-sm truncate">{{ p.description || '-' }}</div>
              </div>
            </template>

            <div class="mobile-body">
              <div class="mobile-kv">
                <div class="info-item">
                  <div class="info-label">Created At</div>
                  <div class="info-value">{{ formatDate(p.createdAt) }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Updated At</div>
                  <div class="info-value">{{ formatDate(p.updatedAt) }}</div>
                </div>
                <div class="info-item last">
                  <div class="info-label">Actions</div>
                  <div class="info-actions">
                    <a-button type="text" class="icon-action" @click="$emit('edit', p)">{{ $t('common.edit') }}</a-button>
                    <a-popconfirm :title="$t('access.permissions.confirmDelete')" @confirm="$emit('delete', p)">
                      <a-button type="text" danger class="icon-action">{{ $t('common.delete') }}</a-button>
                    </a-popconfirm>
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
import { computed } from 'vue';
import dayjs from 'dayjs';
import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { useIsMobile } from '@/shared/composables/useIsMobile';
import type { Permission } from '@/domain/entities/user.entity';

const props = defineProps<{
  permissions: Permission[];
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
  (e: 'generate'): void;
  (e: 'edit', permission: Permission): void;
  (e: 'delete', permission: Permission): void;
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
  { title: 'Code', dataIndex: 'permissionCode', key: 'permissionCode', width: 260 },
  { title: 'Description', dataIndex: 'description', key: 'description', width: 320 },
  { title: 'Created At', key: 'createdAt', width: 180 },
  { title: 'Updated At', key: 'updatedAt', width: 180 },
  { title: 'Actions', key: 'actions', fixed: 'right' as const, width: 140 },
]);
</script>

<style scoped>
.panel-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}
.add-btn { height: 44px; border-radius: 12px; font-weight: 700; }
.icon-action { border-radius: 10px; }
.icon-action:hover { background: rgba(29, 78, 216, 0.08) !important; color: #1d4ed8; }

.mobile-list { margin-top: 4px; }
.mobile-header { padding-right: 8px; min-width: 0; }
.mobile-body { padding: 8px 4px 4px; }
.mobile-kv { display: grid; gap: 10px; }
.info-item { display: grid; grid-template-columns: 120px 1fr; gap: 10px; align-items: start; }
.info-item.last { grid-template-columns: 120px 1fr; }
.info-label { font-size: 12px; color: #64748b; }
.info-value { color: #0f172a; font-weight: 600; word-break: break-word; }
.info-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
</style>

