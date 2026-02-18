<template>
  <div class="sa-access-table">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
      <div>
        <div class="text-3xl font-semibold text-slate-900">{{ $t('access.roles.title') }}</div>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
        <a-button type="primary" class="add-btn sm:shrink-0" @click="$emit('create')">
          <template #icon><PlusOutlined /></template>
          {{ $t('access.roles.create') }}
        </a-button>
      </div>
    </div>

    <a-card :bordered="false" class="panel-card">
      <a-table
        v-if="!isMobile"
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

      <div v-else class="mobile-list">
        <a-collapse accordion ghost class="mobile-collapse">
          <a-collapse-panel v-for="r in roles" :key="r.id">
            <template #header>
              <div class="mobile-header">
                <div class="font-semibold text-slate-900 truncate">{{ r.roleName }}</div>
                <div class="text-slate-500 text-sm truncate">{{ r.description || '-' }}</div>
              </div>
            </template>

            <div class="mobile-body">
              <div class="mobile-kv">
                <div class="info-item">
                  <div class="info-label">Created At</div>
                  <div class="info-value">{{ formatDate(r.createdAt) }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Updated At</div>
                  <div class="info-value">{{ formatDate(r.updatedAt) }}</div>
                </div>
                <div class="info-item last">
                  <div class="info-label">Actions</div>
                  <div class="info-actions">
                    <a-button type="text" class="icon-action" @click="$emit('edit', r)">{{ $t('common.edit') }}</a-button>
                    <a-popconfirm :title="$t('access.roles.confirmDelete')" @confirm="$emit('delete', r)">
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
import type { Role } from '@/domain/entities/user.entity';

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

