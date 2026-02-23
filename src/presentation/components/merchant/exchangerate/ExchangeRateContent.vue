<template>
  <div class="exchange-rate-page">
    <a-breadcrumb class="mb-3">
      <a-breadcrumb-item>{{ $t('merchant.breadcrumbs.home') }}</a-breadcrumb-item>
      <a-breadcrumb-item>{{ $t('merchant.exchangeRates.breadcrumb') }}</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="page-header">
      <div class="title-block">
        <div class="page-title">{{ $t('merchant.exchangeRates.title') }}</div>
        <div class="page-subtitle">{{ $t('merchant.exchangeRates.subtitle') }}</div>
      </div>
      <a-button type="primary" class="add-btn" @click="showForm = !showForm">
        <template #icon><PlusOutlined /></template>
        {{ $t('merchant.exchangeRates.addButton') }}
      </a-button>
    </div>

    <!-- Create Form -->
    <Transition name="form-slide">
      <a-card v-if="showForm" :bordered="false" class="form-card">
        <div class="form-card-title">{{ $t('merchant.exchangeRates.form.title') }}</div>
        <a-form ref="formRef" :model="form" layout="vertical" @finish="handleSubmit">
          <a-row :gutter="[16, 0]">
            <a-col :xs="24" :sm="12" :md="6">
              <a-form-item :label="$t('merchant.exchangeRates.form.baseCurrency')" name="baseCurrency"
                :rules="[{ required: true, message: $t('merchant.exchangeRates.form.baseCurrencyRequired') }]">
                <a-input v-model:value="form.baseCurrency" :placeholder="$t('merchant.exchangeRates.form.baseCurrencyPlaceholder')"
                  style="text-transform:uppercase" @input="form.baseCurrency = form.baseCurrency.toUpperCase()" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="12" :md="6">
              <a-form-item :label="$t('merchant.exchangeRates.form.targetCurrency')" name="targetCurrency"
                :rules="[{ required: true, message: $t('merchant.exchangeRates.form.targetCurrencyRequired') }]">
                <a-input v-model:value="form.targetCurrency" :placeholder="$t('merchant.exchangeRates.form.targetCurrencyPlaceholder')"
                  @input="form.targetCurrency = form.targetCurrency.toUpperCase()" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="12" :md="4">
              <a-form-item :label="$t('merchant.exchangeRates.form.rateType')" name="rateType">
                <a-select v-model:value="form.rateType" style="width:100%">
                  <a-select-option value="BUY">
                    <a-tag color="green" class="type-tag">{{ $t('merchant.exchangeRates.typeBuy') }}</a-tag>
                  </a-select-option>
                  <a-select-option value="SELL">
                    <a-tag color="volcano" class="type-tag">{{ $t('merchant.exchangeRates.typeSell') }}</a-tag>
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="12" :md="8">
              <a-form-item :label="$t('merchant.exchangeRates.form.rate')" name="rate"
                :rules="[{ required: true, message: $t('merchant.exchangeRates.form.rateRequired') }]">
                <a-input-number v-model:value="form.rate" :placeholder="$t('merchant.exchangeRates.form.ratePlaceholder')"
                  :min="0" :precision="4" style="width:100%" />
              </a-form-item>
            </a-col>
          </a-row>
          <div class="form-actions">
            <a-button @click="resetForm">{{ $t('merchant.exchangeRates.form.cancel') }}</a-button>
            <a-button type="primary" html-type="submit" :loading="loading">{{ $t('merchant.exchangeRates.form.submit') }}</a-button>
          </div>
        </a-form>
      </a-card>
    </Transition>

    <!-- Filter Bar -->
    <a-card :bordered="false" class="filter-card">
      <div class="filter-top-row">
        <a-radio-group v-model:value="activeFilter" button-style="solid" size="small" @change="handleFilterChange">
          <a-radio-button value="">{{ $t('merchant.exchangeRates.filterAll') }}</a-radio-button>
          <a-radio-button value="BUY">{{ $t('merchant.exchangeRates.filterBuy') }}</a-radio-button>
          <a-radio-button value="SELL">{{ $t('merchant.exchangeRates.filterSell') }}</a-radio-button>
        </a-radio-group>
        <a-button type="link" size="small" @click="showAdvFilter = !showAdvFilter">
          <template #icon><FilterOutlined /></template>
          {{ showAdvFilter ? $t('merchant.exchangeRates.hideFilters') : $t('merchant.exchangeRates.showFilters') }}
        </a-button>
      </div>

      <Transition name="form-slide">
        <div v-if="showAdvFilter" class="adv-filter-grid">
          <a-row :gutter="[12, 12]">
            <a-col :xs="24" :sm="12" :md="6">
              <a-input v-model:value="advFilters.search" :placeholder="$t('merchant.exchangeRates.filter.searchPlaceholder')"
                allow-clear @pressEnter="applyAdvFilters" @change="onSearchChange" />
            </a-col>
            <a-col :xs="12" :sm="6" :md="4">
              <a-input v-model:value="advFilters.baseCurrency" :placeholder="$t('merchant.exchangeRates.filter.baseCurrency')"
                allow-clear @pressEnter="applyAdvFilters" @input="advFilters.baseCurrency = (advFilters.baseCurrency ?? '').toUpperCase()" />
            </a-col>
            <a-col :xs="12" :sm="6" :md="4">
              <a-input v-model:value="advFilters.targetCurrency" :placeholder="$t('merchant.exchangeRates.filter.targetCurrency')"
                allow-clear @pressEnter="applyAdvFilters" @input="advFilters.targetCurrency = (advFilters.targetCurrency ?? '').toUpperCase()" />
            </a-col>
            <a-col :xs="12" :sm="6" :md="4">
              <a-select v-model:value="advFilters.isActive" :placeholder="$t('merchant.exchangeRates.filter.status')"
                allow-clear style="width:100%" @change="applyAdvFilters">
                <a-select-option :value="true">{{ $t('merchant.exchangeRates.active') }}</a-select-option>
                <a-select-option :value="false">{{ $t('merchant.exchangeRates.inactive') }}</a-select-option>
              </a-select>
            </a-col>
            <a-col :xs="24" :sm="12" :md="6">
              <a-range-picker v-model:value="dateRange" style="width:100%" :placeholder="[$t('merchant.exchangeRates.filter.startDate'), $t('merchant.exchangeRates.filter.endDate')]"
                @change="applyAdvFilters" />
            </a-col>
            <a-col :xs="24" :sm="6" :md="4" class="filter-actions">
              <a-button type="primary" size="small" @click="applyAdvFilters">
                <template #icon><SearchOutlined /></template>
                {{ $t('merchant.exchangeRates.filter.apply') }}
              </a-button>
              <a-button size="small" @click="resetAdvFilters">{{ $t('merchant.exchangeRates.filter.reset') }}</a-button>
            </a-col>
          </a-row>
        </div>
      </Transition>
    </a-card>

    <!-- Desktop table -->
    <a-card v-if="!isMobile" :bordered="false" class="panel-card">
      <a-table :columns="columns" :data-source="rates" :pagination="paginationConfig" row-key="id"
        size="middle" :loading="loading" :scroll="{ x: 800 }" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'rateType'">
            <a-tag :color="record.rateType === 'BUY' ? 'green' : 'volcano'" class="pill-tag">
              {{ record.rateType === 'BUY' ? $t('merchant.exchangeRates.typeBuy') : $t('merchant.exchangeRates.typeSell') }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'isActive'">
            <a-tag :color="record.isActive ? 'success' : 'default'" class="pill-tag">
              {{ record.isActive ? $t('merchant.exchangeRates.active') : $t('merchant.exchangeRates.inactive') }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'rate'">
            <span class="rate-val">{{ Number(record.rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) }}</span>
          </template>
          <template v-else-if="column.key === 'pair'">
            <span class="currency-pair">{{ record.baseCurrency }} → {{ record.targetCurrency }}</span>
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-popconfirm :title="$t('merchant.exchangeRates.confirmDelete')" @confirm="handleDelete(record.id)">
              <a-button type="link" danger size="small"><DeleteOutlined /></a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Mobile card collapse list -->
    <div v-else class="rates-mobile">
      <a-collapse class="rates-collapse" :expand-icon="expandCollapseIcon">
        <a-collapse-panel v-for="r in rates" :key="r.id">
          <template #header>
            <div class="card-row">
              <div class="item-info">
                <div class="item-name">{{ r.baseCurrency }} → {{ r.targetCurrency }}</div>
                <div class="item-sub">{{ r.rateDate }}</div>
              </div>
              <div class="card-right">
                <a-tag :color="r.rateType === 'BUY' ? 'green' : 'volcano'" class="pill-tag">
                  {{ r.rateType === 'BUY' ? $t('merchant.exchangeRates.typeBuy') : $t('merchant.exchangeRates.typeSell') }}
                </a-tag>
              </div>
            </div>
          </template>
          <div class="card-detail">
            <div class="detail-row">
              <span class="detail-label">{{ $t('merchant.exchangeRates.table.rate') }}</span>
              <span class="detail-val rate-val">{{ Number(r.rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ $t('merchant.exchangeRates.table.isActive') }}</span>
              <a-tag :color="r.isActive ? 'success' : 'default'" class="pill-tag">
                {{ r.isActive ? $t('merchant.exchangeRates.active') : $t('merchant.exchangeRates.inactive') }}
              </a-tag>
            </div>
            <div class="detail-row action-row">
              <a-popconfirm :title="$t('merchant.exchangeRates.confirmDelete')" @confirm="handleDelete(r.id)">
                <a-button type="link" danger size="small"><DeleteOutlined /> {{ $t('merchant.exchangeRates.filter.delete') }}</a-button>
              </a-popconfirm>
            </div>
          </div>
        </a-collapse-panel>
      </a-collapse>
      <div class="mobile-pagination">
        <a-pagination :current="pagination.page" :page-size="pagination.limit" :total="pagination.total"
          size="small" simple @change="(p: number) => changePage(p, pagination.limit)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue';
import type { FormInstance, TablePaginationConfig } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';
import { PlusOutlined, DownOutlined, FilterOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { useI18n } from 'vue-i18n';
import { useIsMobile } from '@/shared/composables/useIsMobile';
import { useMerchantExchangeRates } from '@/presentation/composables/merchant/useMerchantExchangeRates';

const { t } = useI18n();
const { isMobile } = useIsMobile();
const { loading, rates, pagination, fetchRates, createRate, deleteRate, changePage, setFilter } = useMerchantExchangeRates();

const showForm = ref(false);
const showAdvFilter = ref(false);
const formRef = ref<FormInstance>();
const activeFilter = ref<'BUY' | 'SELL' | ''>('');
const dateRange = ref<[Dayjs, Dayjs] | null>(null);

const form = reactive({
  baseCurrency: '',
  targetCurrency: 'LAK',
  rateType: 'BUY' as 'BUY' | 'SELL',
  rate: null as number | null,
});

const advFilters = reactive({
  search: '' as string,
  baseCurrency: '' as string,
  targetCurrency: '' as string,
  isActive: undefined as boolean | undefined,
});

const expandCollapseIcon = ({ isActive }: { isActive: boolean }) =>
  h(DownOutlined, { class: 'expand-icon', style: { transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)' } });

const columns = computed(() => [
  { title: `${t('merchant.exchangeRates.table.baseCurrency')} → ${t('merchant.exchangeRates.table.targetCurrency')}`, key: 'pair', width: 160 },
  { title: t('merchant.exchangeRates.table.rateType'), key: 'rateType', width: 100, align: 'center' as const },
  { title: t('merchant.exchangeRates.table.rate'), key: 'rate', width: 140, align: 'right' as const },
  { title: t('merchant.exchangeRates.table.rateDate'), dataIndex: 'rateDate', key: 'rateDate', width: 120 },
  { title: t('merchant.exchangeRates.table.isActive'), key: 'isActive', width: 100, align: 'center' as const },
  { title: t('merchant.exchangeRates.table.actions'), key: 'actions', width: 80, align: 'center' as const, fixed: 'right' as const },
]);

const paginationConfig = computed(() => ({
  current: pagination.value.page,
  pageSize: pagination.value.limit,
  total: pagination.value.total,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
}));

const handleTableChange = (p: TablePaginationConfig) => {
  if (p.current && p.pageSize) changePage(p.current, p.pageSize);
};

const handleFilterChange = () => {
  setFilter(activeFilter.value === '' ? undefined : activeFilter.value as 'BUY' | 'SELL');
};

const onSearchChange = () => {
  if (!advFilters.search) applyAdvFilters();
};

const applyAdvFilters = () => {
  const q: Record<string, any> = { page: 1 };
  if (advFilters.search) q.search = advFilters.search;
  if (advFilters.baseCurrency) q.baseCurrency = advFilters.baseCurrency;
  if (advFilters.targetCurrency) q.targetCurrency = advFilters.targetCurrency;
  if (advFilters.isActive !== undefined) q.isActive = advFilters.isActive;
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    q.startDate = dateRange.value[0].format('YYYY-MM-DD');
    q.endDate = dateRange.value[1].format('YYYY-MM-DD');
  }
  fetchRates(q);
};

const resetAdvFilters = () => {
  advFilters.search = '';
  advFilters.baseCurrency = '';
  advFilters.targetCurrency = '';
  advFilters.isActive = undefined;
  dateRange.value = null;
  fetchRates({ page: 1 });
};

const handleSubmit = async () => {
  if (!form.rate) return;
  const ok = await createRate({
    baseCurrency: form.baseCurrency as any,
    targetCurrency: form.targetCurrency as any,
    rateType: form.rateType,
    rate: form.rate,
  });
  if (ok) resetForm();
};

const handleDelete = async (id: number) => {
  await deleteRate(id);
};

const resetForm = () => {
  form.baseCurrency = '';
  form.targetCurrency = 'LAK';
  form.rateType = 'BUY';
  form.rate = null;
  formRef.value?.clearValidate();
  showForm.value = false;
};

onMounted(() => fetchRates());
</script>

<style scoped>
.mb-3 { margin-bottom: 12px; }
.page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.title-block { flex: 1 1 auto; min-width: 0; }
.page-title { font-size: 22px; font-weight: 600; color: #0f172a; line-height: 1.25; }
.page-subtitle { font-size: 13px; color: #64748b; margin-top: 2px; }
.add-btn { height: 44px; border-radius: 12px; font-weight: 700; flex-shrink: 0; }

@media (max-width: 767px) {
  .page-title { font-size: 15px; }
  .page-subtitle { display: none; }
  .add-btn { height: 36px; font-size: 12px; padding: 0 10px; }
}

.form-slide-enter-active { transition: all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1); }
.form-slide-leave-active { transition: all 0.22s cubic-bezier(0.4, 0, 1, 1); }
.form-slide-enter-from { opacity: 0; transform: translateY(-16px) scaleY(0.95); }
.form-slide-leave-to { opacity: 0; transform: translateY(-8px) scaleY(0.96); }

.form-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
  margin-bottom: 16px;
  border: 2px solid #e0e7ff;
}
.form-card-title { font-size: 15px; font-weight: 700; color: #1d4ed8; margin-bottom: 16px; }
.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }

.filter-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
  margin-bottom: 12px;
}
.filter-top-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.adv-filter-grid { margin-top: 12px; padding-top: 12px; border-top: 1px solid #f0f0f0; }
.filter-actions { display: flex; align-items: flex-end; gap: 6px; }

@media (max-width: 767px) {
  .filter-actions { justify-content: flex-end; }
}

.panel-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}
.pill-tag { border-radius: 999px; padding: 2px 10px; font-weight: 700; }
.rate-val { font-weight: 700; color: #0f172a; font-variant-numeric: tabular-nums; }
.currency-pair { font-weight: 700; color: #1d4ed8; letter-spacing: 0.02em; }

.rates-mobile { display: flex; flex-direction: column; }
.rates-collapse { background: transparent !important; border: none !important; }
.rates-collapse :deep(.ant-collapse-item) {
  background: #fff !important; border-radius: 16px !important;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.06) !important;
  border: 1px solid rgba(148, 163, 184, 0.15) !important;
  overflow: hidden; margin-bottom: 10px !important;
}
.rates-collapse :deep(.ant-collapse-header) { padding: 14px !important; align-items: center !important; }
.rates-collapse :deep(.ant-collapse-content) { background: transparent !important; border-top: 1px solid rgba(148, 163, 184, 0.18) !important; }
.rates-collapse :deep(.ant-collapse-content-box) { padding: 0 14px 14px !important; }

.expand-icon { font-size: 13px; color: #94a3b8; transition: transform 260ms ease; }
.card-row { display: flex; align-items: center; gap: 12px; min-width: 0; width: 100%; }
.item-info { flex: 1; min-width: 0; }
.item-name { font-size: 14px; font-weight: 700; color: #1d4ed8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-sub { font-size: 12px; color: #64748b; margin-top: 2px; }
.card-right { flex-shrink: 0; }
.card-detail { padding-top: 12px; display: flex; flex-direction: column; gap: 8px; }
.detail-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
.detail-label { color: #64748b; font-weight: 500; }
.detail-val { color: #0f172a; font-weight: 600; text-align: right; }
.action-row { justify-content: flex-end; margin-top: 4px; }
.type-tag { border-radius: 999px; }
.mobile-pagination { display: flex; justify-content: center; margin-top: 12px; }
</style>
