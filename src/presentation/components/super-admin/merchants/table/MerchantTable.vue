<template>
  <div class="sa-merchants">
    <div class="page-header">
      <div class="title-block">
        <div class="page-title">{{ $t('merchants.title') }}</div>
        <div class="page-subtitle">{{ $t('merchants.subtitle') }}</div>
      </div>

      <a-input
        v-model:value="searchText"
        allow-clear
        class="search-input"
        :placeholder="$t('merchants.searchPlaceholder')"
        @pressEnter="triggerSearch"
      >
        <template #prefix><SearchOutlined /></template>
      </a-input>

      <a-button type="primary" class="add-btn" @click="handleCreate">
        <template #icon><PlusOutlined /></template>
        {{ $t('merchants.createMerchant') }}
      </a-button>
    </div>

    <!-- Desktop: table inside card -->
    <a-card v-if="!isMobile" :bordered="false" class="panel-card">
      <a-table
        v-if="true"
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

    </a-card>

    <!-- Mobile: individual cards (no outer wrapper) -->
    <div v-if="isMobile" class="merchants-mobile">
      <a-collapse accordion ghost class="merchants-collapse">
        <template #expandIcon="{ isActive }">
          <DownOutlined class="expand-icon" :class="{ rotated: isActive }" />
        </template>

        <a-collapse-panel v-for="m in merchants" :key="m.id">
          <template #header>
            <div class="card-row">
              <!-- Avatar with active dot -->
              <div class="avatar-wrap">
                <a-avatar :size="48" shape="square" :src="m.shopLogoUrl || undefined" class="shop-avatar">
                  <template #icon><ShopOutlined /></template>
                </a-avatar>
                <span v-if="m.isActive" class="active-dot" />
              </div>

              <!-- Shop name + phone/email -->
              <div class="item-info">
                <div class="item-name">{{ m.shopName }}</div>
                <div class="item-sub">{{ m.contactPhone || m.contactEmail || '-' }}</div>
              </div>

              <!-- Status tag right -->
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
              <a-button type="default" size="small" class="action-btn" @click="$emit('edit', m)">
                <EditOutlined /> {{ $t('common.edit') }}
              </a-button>
              <a-popconfirm :title="$t('merchants.confirmDelete')" @confirm="$emit('delete', m)">
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
import { computed, ref, watch } from 'vue';
import dayjs from 'dayjs';
import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ShopOutlined, DownOutlined } from '@ant-design/icons-vue';
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

.address-cell {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 170px;
}

/* Mobile card list */
.merchants-mobile { display: flex; flex-direction: column; gap: 10px; }
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
.action-btn { border-radius: 8px; font-size: 13px; }
</style>
