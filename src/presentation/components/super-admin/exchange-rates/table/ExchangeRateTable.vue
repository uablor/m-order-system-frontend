<template>
  <div class="sa-exchange-rates">
    <div class="page-header">
      <div class="title-block">
        <div class="page-title">{{ $t('exchangeRates.title') }}</div>
        <div class="page-subtitle">{{ $t('exchangeRates.subtitle') }}</div>
      </div>

      <a-input
        v-model:value="searchText"
        allow-clear
        class="search-input"
        :placeholder="$t('exchangeRates.searchPlaceholder')"
        @pressEnter="triggerSearch"
      >
        <template #prefix><SearchOutlined /></template>
      </a-input>

      <a-button type="primary" class="add-btn" @click="handleCreate">
        <template #icon><PlusOutlined /></template>
        {{ $t('exchangeRates.createRate') }}
      </a-button>
    </div>

    <!-- Desktop Table -->
    <a-card v-if="!isMobile" :bordered="false" class="panel-card">
      <a-table
        :columns="columns"
        :data-source="exchangeRates"
        :pagination="paginationConfig"
        row-key="id"
        size="middle"
        :loading="loading"
        :scroll="{ x: 1000 }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'rateType'">
            <a-tag :color="record.rateType === 'BUY' ? 'green' : 'volcano'">
              {{ record.rateType === 'BUY' ? $t('exchangeRates.buy') : $t('exchangeRates.sell') }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'rate'">
            <span class="rate-value">{{ formatRate(record.rate) }}</span>
          </template>

          <template v-else-if="column.key === 'currencies'">
            <span class="currency-pair">
              <a-tag color="blue">{{ record.baseCurrency }}</a-tag>
              <span class="arrow">→</span>
              <a-tag color="purple">{{ record.targetCurrency }}</a-tag>
            </span>
          </template>

          <template v-else-if="column.key === 'isActive'">
            <a-tag :color="record.isActive ? 'success' : 'default'">
              {{ record.isActive ? $t('exchangeRates.active') : $t('exchangeRates.inactive') }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'rateDate'">
            {{ record.rateDate || '-' }}
          </template>

          <template v-else-if="column.key === 'createdAt'">
            {{ formatDate(record.createdAt) }}
          </template>

          <template v-else-if="column.key === 'actions'">
            <div class="flex items-center justify-end gap-2">
              <a-button type="text" class="icon-action" @click="$emit('edit', record)"><EditOutlined /></a-button>
              <a-popconfirm :title="$t('exchangeRates.confirmDelete')" @confirm="$emit('delete', record)">
                <a-button type="text" danger class="icon-action"><DeleteOutlined /></a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Mobile Cards -->
    <div v-if="isMobile" class="rates-mobile">
      <a-collapse accordion ghost class="rates-collapse">
        <template #expandIcon="{ isActive }">
          <DownOutlined class="expand-icon" :class="{ rotated: isActive }" />
        </template>

        <a-collapse-panel v-for="r in exchangeRates" :key="r.id">
          <template #header>
            <div class="card-row">
              <div class="avatar-wrap">
                <a-avatar :size="44" class="rate-avatar" :class="r.rateType === 'BUY' ? 'buy' : 'sell'">
                  {{ r.rateType === 'BUY' ? 'B' : 'S' }}
                </a-avatar>
                <span v-if="r.isActive" class="active-dot" />
              </div>
              <div class="item-info">
                <div class="item-name">{{ r.baseCurrency }} → {{ r.targetCurrency }}</div>
                <div class="item-sub rate-display">{{ formatRate(r.rate) }}</div>
              </div>
              <div class="status-side">
                <a-tag :color="r.rateType === 'BUY' ? 'green' : 'volcano'" class="status-tag">
                  {{ r.rateType === 'BUY' ? $t('exchangeRates.buy') : $t('exchangeRates.sell') }}
                </a-tag>
              </div>
            </div>
          </template>

          <div class="card-detail">
            <div class="detail-row">
              <span class="detail-label">{{ $t('exchangeRates.rateDate') }}</span>
              <span class="detail-val">{{ r.rateDate || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ $t('exchangeRates.isActive') }}</span>
              <span class="detail-val">
                <a-tag :color="r.isActive ? 'success' : 'default'" style="margin: 0">
                  {{ r.isActive ? $t('exchangeRates.active') : $t('exchangeRates.inactive') }}
                </a-tag>
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ $t('exchangeRates.createdAt') }}</span>
              <span class="detail-val">{{ formatDate(r.createdAt) }}</span>
            </div>
            <div class="detail-row border-none pt-2">
              <a-button type="default" size="small" class="action-btn" @click="$emit('edit', r)">
                <EditOutlined /> {{ $t('common.edit') }}
              </a-button>
              <a-popconfirm :title="$t('exchangeRates.confirmDelete')" @confirm="$emit('delete', r)">
                <a-button type="text" danger size="small" class="action-btn">
                  <DeleteOutlined /> {{ $t('common.delete') }}
                </a-button>
              </a-popconfirm>
            </div>
          </div>
        </a-collapse-panel>
      </a-collapse>

      <div v-if="paginationConfig.total > paginationConfig.pageSize" class="mobile-pagination">
        <a-pagination
          :current="paginationConfig.current"
          :page-size="paginationConfig.pageSize"
          :total="paginationConfig.total"
          size="small"
          @change="(p: number, ps: number) => $emit('page-change', p, ps)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import dayjs from 'dayjs';
import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons-vue';
import { useIsMobile } from '@/shared/composables/useIsMobile';
import type { ExchangeRate } from '@/domain/entities/user.entity';
import { useI18n } from 'vue-i18n';

const emit = defineEmits<{
  (e: 'create'): void;
  (e: 'edit', rate: ExchangeRate): void;
  (e: 'delete', rate: ExchangeRate): void;
  (e: 'search', value: string): void;
  (e: 'page-change', page: number, pageSize: number): void;
}>();

const props = defineProps<{
  exchangeRates: ExchangeRate[];
  loading: boolean;
  pagination: { page: number; limit: number; total: number; totalPages: number };
}>();

const { t: $t } = useI18n();
const { isMobile } = useIsMobile();
const searchText = ref('');

const handleCreate = () => emit('create');

let searchTimer: number | undefined;
const triggerSearch = () => {
  window.clearTimeout(searchTimer);
  emit('search', searchText.value);
};
watch(searchText, () => {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => emit('search', searchText.value), 450);
});

const formatDate = (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm');
const formatRate = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 }).format(num);
};

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
  { title: '#', key: 'index', width: 60, customRender: ({ index }: { index: number }) => (props.pagination.page - 1) * props.pagination.limit + index + 1 },
  { title: $t('exchangeRates.baseCurrency') + ' → ' + $t('exchangeRates.targetCurrency'), key: 'currencies', width: 200 },
  { title: $t('exchangeRates.rateType'), key: 'rateType', width: 100 },
  { title: $t('exchangeRates.rate'), key: 'rate', width: 140, align: 'right' as const },
  { title: $t('exchangeRates.rateDate'), key: 'rateDate', width: 120 },
  { title: $t('exchangeRates.isActive'), key: 'isActive', width: 90, align: 'center' as const },
  { title: $t('exchangeRates.createdAt'), key: 'createdAt', width: 160 },
  { title: $t('exchangeRates.actions'), key: 'actions', fixed: 'right' as const, width: 110, align: 'right' as const },
]);
</script>

<style scoped>
.page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.title-block { flex: 1 1 auto; min-width: 0; }
.page-title { font-size: 22px; font-weight: 600; color: #0f172a; line-height: 1.25; }
.page-subtitle { font-size: 13px; color: #64748b; margin-top: 2px; }
.search-input { height: 44px; border-radius: 12px; width: min(320px, 100%); }
.add-btn { height: 44px; border-radius: 12px; font-weight: 700; flex-shrink: 0; }

@media (max-width: 767px) {
  .page-header { flex-wrap: wrap; }
  .title-block { order: 1; flex: 1 1 auto; }
  .add-btn { order: 2; flex-shrink: 0; height: 36px; font-size: 12px; padding: 0 10px; }
  .search-input { order: 3; flex: 1 1 100%; width: 100%; }
  .page-title { font-size: 15px; }
  .page-subtitle { display: none; }
}

.panel-card { border-radius: 14px; box-shadow: 0 1px 2px rgba(15,23,42,0.06), 0 10px 25px rgba(15,23,42,0.04); }
.icon-action { border-radius: 10px; }
.icon-action:hover { background: rgba(29,78,216,0.08) !important; color: #1d4ed8; }

.rate-value { font-weight: 700; font-size: 14px; color: #0f172a; }
.currency-pair { display: inline-flex; align-items: center; gap: 4px; }
.arrow { color: #94a3b8; font-size: 13px; }

.rates-mobile { display: flex; flex-direction: column; gap: 10px; }
.rates-collapse { background: transparent !important; border: none !important; }
.rates-collapse :deep(.ant-collapse-item) { background: #fff !important; border-radius: 16px !important; box-shadow: 0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.06) !important; border: 1px solid rgba(148,163,184,0.15) !important; overflow: hidden; margin-bottom: 10px !important; }
.rates-collapse :deep(.ant-collapse-header) { padding: 14px !important; align-items: center !important; }
.rates-collapse :deep(.ant-collapse-content) { background: transparent !important; border-top: 1px solid rgba(148,163,184,0.18) !important; }
.rates-collapse :deep(.ant-collapse-content-box) { padding: 0 14px 14px !important; }

.expand-icon { font-size: 13px; color: #94a3b8; transition: transform 260ms ease; }
.expand-icon.rotated { transform: rotate(180deg); }

.card-row { display: flex; align-items: center; gap: 12px; padding-right: 4px; }
.avatar-wrap { position: relative; flex-shrink: 0; }
.rate-avatar { font-weight: 700; font-size: 16px; }
.rate-avatar.buy { background: rgba(34,197,94,0.12); color: #22c55e; }
.rate-avatar.sell { background: rgba(239,68,68,0.12); color: #ef4444; }
.active-dot { position: absolute; bottom: 2px; left: 2px; width: 11px; height: 11px; background: #22c55e; border-radius: 999px; border: 2px solid #fff; }
.item-info { flex: 1; min-width: 0; }
.item-name { font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.3; }
.item-sub { font-size: 13px; color: #64748b; margin-top: 2px; }
.rate-display { font-weight: 700; color: #0f172a; }
.status-side { flex-shrink: 0; margin-left: auto; }
.status-tag { border-radius: 999px; font-weight: 700; font-size: 12px; }

.card-detail { padding-top: 10px; }
.detail-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(148,163,184,0.2); gap: 8px; }
.detail-row.border-none { border-bottom: none; justify-content: flex-end; gap: 8px; padding-bottom: 0; }
.detail-label { font-size: 12px; font-weight: 600; color: #94a3b8; flex-shrink: 0; }
.detail-val { font-size: 13px; font-weight: 600; color: #1e293b; text-align: right; }
.action-btn { border-radius: 8px; font-size: 13px; }

.mobile-pagination { display: flex; justify-content: center; margin-top: 12px; }
</style>
