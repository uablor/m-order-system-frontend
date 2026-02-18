<template>
  <div class="sa-merchants">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
      <div>
        <div class="text-3xl font-semibold text-slate-900">{{ $t('merchants.title') }}</div>
        <div class="text-slate-500 mt-1">{{ $t('merchants.subtitle') }}</div>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
        <a-input
          v-model:value="searchText"
          allow-clear
          class="search-input"
          :placeholder="$t('merchants.searchPlaceholder')"
          @pressEnter="triggerSearch"
        >
          <template #prefix><SearchOutlined /></template>
        </a-input>

        <a-button type="primary" class="add-btn sm:shrink-0" @click="handleCreate">
          <template #icon><PlusOutlined /></template>
          {{ $t('merchants.createMerchant') }}
        </a-button>
      </div>
    </div>

    <a-card :bordered="false" class="panel-card">
      <!-- Desktop table -->
      <a-table
        v-if="!isMobile"
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
            <a-tag :color="record.isActive ? 'success' : 'default'">
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
            <div class="flex items-center justify-end gap-2">
              <a-button type="text" class="icon-action" @click="$emit('edit', record)"><EditOutlined /></a-button>
              <a-popconfirm :title="$t('merchants.confirmDelete')" @confirm="$emit('delete', record)">
                <a-button type="text" danger class="icon-action"><DeleteOutlined /></a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>

      <!-- Mobile accordion/list -->
      <div v-else class="merchants-mobile">
        <a-collapse accordion ghost class="merchants-collapse">
          <a-collapse-panel v-for="m in merchants" :key="m.id">
            <template #header>
              <div class="mobile-header">
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-3 min-w-0">
                    <a-avatar :size="36" shape="square" :src="m.shopLogoUrl || undefined">
                      <template #icon><ShopOutlined /></template>
                    </a-avatar>
                    <div class="min-w-0">
                      <div class="font-semibold text-slate-900 truncate">{{ m.shopName }}</div>
                      <div class="text-slate-500 text-sm truncate">{{ m.contactPhone || m.contactEmail || '-' }}</div>
                    </div>
                  </div>
                  <a-tag :color="m.isActive ? 'green' : 'default'" class="pill-tag shrink-0">
                    {{ m.isActive ? $t('merchants.active') : $t('merchants.inactive') }}
                  </a-tag>
                </div>
              </div>
            </template>

            <div class="mobile-body">
              <div class="mobile-kv">
                <div class="info-item">
                  <div class="info-label">{{ $t('merchants.shopAddress') }}</div>
                  <div class="info-value">{{ m.shopAddress || '-' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">{{ $t('merchants.defaultCurrency') }}</div>
                  <div class="info-value">{{ m.defaultCurrency }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">{{ $t('merchants.createdAt') }}</div>
                  <div class="info-value">{{ formatDate(m.createdAt) }}</div>
                </div>
                <div class="info-item last">
                  <div class="info-label">{{ $t('merchants.actions') }}</div>
                  <div class="info-actions">
                    <a-button type="text" class="icon-action" @click="$emit('edit', m)"><EditOutlined /></a-button>
                    <a-popconfirm :title="$t('merchants.confirmDelete')" @confirm="$emit('delete', m)">
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
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ShopOutlined } from '@ant-design/icons-vue';
import { useIsMobile } from '@/shared/composables/useIsMobile';
import type { Merchant } from '@/domain/entities/user.entity';
import { useI18n } from 'vue-i18n';

const emit = defineEmits<{
  (e: 'create'): void;
  (e: 'edit', merchant: Merchant): void;
  (e: 'delete', merchant: Merchant): void;
  (e: 'search', value: string): void;
  (e: 'page-change', page: number, pageSize: number): void;
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

const searchText = ref('');

const handleCreate = () => emit('create');

let searchTimer: number | undefined;
const triggerSearch = () => {
  window.clearTimeout(searchTimer);
  emit('search', searchText.value);
};
watch(searchText, () => {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    emit('search', searchText.value);
  }, 450);
});

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
  if (p.current && p.pageSize) emit('page-change', p.current, p.pageSize);
};

const columns = computed<TableColumnsType>(() => [
  {
    title: '#',
    key: 'index',
    width: 70,
    customRender: ({ index }: { index: number }) =>
      (props.pagination.page - 1) * props.pagination.limit + index + 1,
  },
  { title: $t('merchants.shopName'), dataIndex: 'shopName', key: 'shopName', width: 200 },
  { title: 'Logo', key: 'shopLogoUrl', width: 70 },
  { title: $t('merchants.shopAddress'), dataIndex: 'shopAddress', key: 'shopAddress', width: 200 },
  { title: $t('merchants.contactPhone'), dataIndex: 'contactPhone', key: 'contactPhone', width: 140 },
  { title: $t('merchants.contactEmail'), dataIndex: 'contactEmail', key: 'contactEmail', width: 220 },
  { title: $t('merchants.defaultCurrency'), dataIndex: 'defaultCurrency', key: 'defaultCurrency', width: 110 },
  { title: $t('merchants.isActive'), key: 'isActive', width: 110, align: 'center' as const },
  { title: $t('merchants.createdAt'), key: 'createdAt', width: 170 },
  { title: $t('merchants.updatedAt'), key: 'updatedAt', width: 170 },
  { title: $t('merchants.actions'), key: 'actions', fixed: 'right' as const, width: 120, align: 'right' as const },
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

.address-cell {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 170px;
}

/* Mobile list style (same pattern as merchant customers) */
.merchants-mobile { margin-top: 4px; }
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

.merchants-collapse :deep(.ant-collapse-item) {
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
  margin-bottom: 12px;
}
.merchants-collapse :deep(.ant-collapse-header) { padding: 14px 14px !important; }
.merchants-collapse :deep(.ant-collapse-content-box) { padding: 0 14px 14px !important; }
.merchants-collapse :deep(.ant-collapse-arrow) { inset-inline-end: 14px !important; }

@media (max-width: 480px) {
  .info-item { flex-direction: column; align-items: flex-start; }
  .info-label { min-width: 0; }
  .info-value, .info-actions { justify-content: flex-start; text-align: left; }
}
</style>
