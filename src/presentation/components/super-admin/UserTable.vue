<template>
  <div class="sa-users">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
      <div>
        <div class="text-3xl font-semibold text-slate-900">{{ $t('users.title') }}</div>
        <div class="text-slate-500 mt-1">{{ $t('users.subtitle') }}</div>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
        <a-input
          v-model:value="q"
          allow-clear
          class="search-input"
          :placeholder="$t('users.search')"
          @pressEnter="triggerSearch"
        >
          <template #prefix><SearchOutlined /></template>
        </a-input>

        <a-button type="primary" class="add-btn sm:shrink-0" @click="$emit('create-merchant')">
          <template #icon><PlusOutlined /></template>
          {{ $t('users.createMerchantUser') }}
        </a-button>
      </div>
    </div>

    <a-card :bordered="false" class="panel-card">
      <!-- Desktop table -->
      <a-table
        v-if="!isMobile"
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

      <!-- Mobile accordion/list -->
      <div v-else class="users-mobile">
        <a-collapse accordion ghost class="users-collapse">
          <a-collapse-panel v-for="u in users" :key="u.id">
            <template #header>
              <div class="mobile-header">
                <div class="flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <div class="font-semibold text-slate-900 truncate">{{ u.fullName }}</div>
                    <div class="text-slate-500 text-sm truncate">{{ u.email }}</div>
                  </div>
                  <a-tag :color="u.isActive ? 'green' : 'default'" class="pill-tag shrink-0">
                    {{ u.isActive ? $t('users.active') : $t('users.inactive') }}
                  </a-tag>
                </div>
              </div>
            </template>

            <div class="mobile-body">
              <div class="mobile-kv">
                <div class="info-item">
                  <div class="info-label">{{ $t('users.role') }}</div>
                  <div class="info-value">{{ u.roleName || '-' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">{{ $t('users.lastLogin') }}</div>
                  <div class="info-value">{{ u.lastLogin ? formatDate(u.lastLogin) : '-' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">{{ $t('users.createdAt') }}</div>
                  <div class="info-value">{{ formatDate(u.createdAt) }}</div>
                </div>
                <div class="info-item last">
                  <div class="info-label">{{ $t('users.actions') }}</div>
                  <div class="info-actions">
                    <a-popconfirm :title="$t('users.confirmDelete')" @confirm="$emit('delete', u)">
                      <a-button type="text" danger class="icon-action"><DeleteOutlined /></a-button>
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
import { computed, ref, watch } from 'vue';
import dayjs from 'dayjs';
import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
import { useIsMobile } from '@/shared/composables/useIsMobile';
import { SearchOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue';
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

const formatDate = (value: string) => {
  return dayjs(value).format('YYYY-MM-DD HH:mm');
};

const q = ref('');
let searchTimer: number | undefined;
const triggerSearch = () => {
  window.clearTimeout(searchTimer);
  // reset to first page when searching
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
.panel-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}

.search-input { width: min(420px, 100%); height: 44px; border-radius: 12px; }
.add-btn { height: 44px; border-radius: 12px; font-weight: 700; }
.pill-tag { border-radius: 999px; padding: 2px 10px; font-weight: 800; }
.icon-action { border-radius: 10px; }
.icon-action:hover { background: rgba(29, 78, 216, 0.08) !important; color: #1d4ed8; }

/* Mobile list style (same pattern as merchant customers) */
.users-mobile { margin-top: 4px; }
.mobile-header { padding-right: 8px; }
.mobile-body { padding: 2px 0 6px; }
.mobile-kv {
  background: #f8fafc;
  border-radius: 14px;
  padding: 12px;
}
.info-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.35);
}
.info-item.last { border-bottom: none; padding-bottom: 2px; }
.info-label { color: #64748b; font-weight: 800; font-size: 12px; min-width: 120px; }
.info-value { color: #0f172a; font-weight: 800; text-align: right; flex: 1; }
.info-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex-wrap: wrap; flex: 1; }

.users-collapse :deep(.ant-collapse-item) {
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
  margin-bottom: 12px;
}
.users-collapse :deep(.ant-collapse-header) { padding: 14px 14px !important; }
.users-collapse :deep(.ant-collapse-content-box) { padding: 0 14px 14px !important; }
.users-collapse :deep(.ant-collapse-arrow) { inset-inline-end: 14px !important; }

@media (max-width: 480px) {
  .info-item { flex-direction: column; align-items: flex-start; }
  .info-label { min-width: 0; }
  .info-value, .info-actions { justify-content: flex-start; text-align: left; }
}
</style>

