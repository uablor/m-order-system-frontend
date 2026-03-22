<template>
  <div class="payment-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="title-block">
        <div class="page-title">{{ $t('merchant.payment.title') }}</div>
        <div class="page-subtitle">{{ $t('merchant.payment.subtitle') }}</div>
      </div>
      
    </div>

   

    <!-- Status Tabs - Above Summary -->
    <a-card :bordered="false" class="status-tabs-card mb-4">
      <a-tabs v-model:activeKey="activeStatusTab" class="payment-status-tabs" @change="onStatusTabChange">
        <a-tab-pane :key="'all'" :tab="$t('merchant.payment.tabAll')">
          <!-- All payments content will be shown below -->
        </a-tab-pane>
        <a-tab-pane :key="'PENDING'" :tab="$t('merchant.payment.tabPending')">
          <!-- Pending payments content will be shown below -->
        </a-tab-pane>
        <a-tab-pane :key="'VERIFIED'" :tab="$t('merchant.payment.tabVerified')">
          <!-- Verified payments content will be shown below -->
        </a-tab-pane>
        <a-tab-pane :key="'REJECTED'" :tab="$t('merchant.payment.tabRejected')">
          <!-- Rejected payments content will be shown below -->
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- Financial Summary: 4-grid layout -->
    <!-- <div class="page-header" style="margin-top: 24px;">
      <div class="title-block">
        <div class="page-title">{{ $t('merchant.dashboard.sectionFinancialOverview') }}</div>
        <div class="page-subtitle">{{ $t('merchant.dashboard.sectionFinancialOverviewDesc') }}</div>
      </div>
    </div>
     -->
    <!-- Row: Price by Currency — CSS Grid layout -->
    <div class="currency-grid !mt-3">
      <a-card 
        v-for="(currency, i) in displayCurrencies" 
        :key="currency ? (currency.baseCurrency || currency.targetCurrency || 'unknown') : `placeholder-${i}`"
        :bordered="false" 
        class="panel-card currency-card" 
        :class="currency ? `currency-${(currency.baseCurrency || currency.targetCurrency || 'unknown').toLowerCase()}` : 'currency-placeholder'"
      >
        <div class="currency-header">
          <span>{{ $t('merchant.dashboard.currency') }}</span>
          <span class="currency-badge" :class="currency ? `badge-${(currency.baseCurrency || currency.targetCurrency || 'unknown').toLowerCase()}` : 'badge-placeholder'">{{ currency ? (currency.baseCurrency || currency.targetCurrency || 'Unknown') : '—' }}</span>
        </div>
        <div class="currency-rows">
          <div class="currency-row">
            <span class="c-label">{{ $t('merchant.dashboard.totalPrice') }}</span>
            <a-tooltip :title="currency ? fmtCurrency(parseCurrencyString(currency.totalAll)) : fmtCurrency(0)" placement="top" overlay-class-name="blue-tooltip">
              <span class="c-val truncated-text">{{ currency ? fmtCurrency(parseCurrencyString(currency.totalAll)) : fmtCurrency(0) }}</span>
            </a-tooltip>
          </div>
          <div class="currency-row">
            <span class="c-label">{{ $t('merchant.dashboard.pricePaid') }}</span>
            <a-tooltip :title="currency ? fmtCurrency(parseCurrencyString(currency.totalPaid)) : fmtCurrency(0)" placement="top" overlay-class-name="blue-tooltip">
              <span class="c-val text-green truncated-text">{{ currency ? fmtCurrency(parseCurrencyString(currency.totalPaid)) : fmtCurrency(0) }}</span>
            </a-tooltip>
          </div>
          <div class="currency-row">
            <span class="c-label">{{ $t('merchant.dashboard.priceUnpaid') }}</span>
            <a-tooltip :title="currency ? fmtCurrency(parseCurrencyString(currency.totalUnpaid)) : fmtCurrency(0)" placement="top" overlay-class-name="blue-tooltip">
              <span class="c-val text-red truncated-text">{{ currency ? fmtCurrency(parseCurrencyString(currency.totalUnpaid)) : fmtCurrency(0) }}</span>
            </a-tooltip>
          </div>
        </div>
      </a-card>
    </div>
    <!-- <div class="search-filter-container">
      <a-input
        v-model:value="filters.search"
        allow-clear
        class="search-input"
        :placeholder="$t('merchant.payment.searchPlaceholder')"
        @pressEnter="triggerSearch"
      >
        <template #prefix><SearchOutlined /></template>
      </a-input>
      <a-button
        v-if="showFilterToggle"
        type="default"
        class="filter-toggle-btn"
        :class="{ active: showFilters }"
        @click="showFilters = !showFilters"
      >
        <FilterOutlined />
      </a-button>
    </div> -->
     <!-- Filter Panel -->
    <a-card v-if="!showFilterToggle || showFilters" :bordered="false" class="filter-card mb-4">
      <div class="filter-bar">
         <a-input
        v-model:value="filters.search"
        allow-clear
        class="search-input"
        :placeholder="$t('merchant.payment.searchPlaceholder')"
        @pressEnter="triggerSearch"
      >
        <template #prefix><SearchOutlined /></template>
      </a-input>
      <a-button
        v-if="showFilterToggle"
        type="default"
        class="filter-toggle-btn"
        :class="{ active: showFilters }"
        @click="showFilters = !showFilters"
      >
        <FilterOutlined />
      </a-button>
        <a-date-picker
          v-model:value="filters.startDate"
          class="filter-date-single"
          :placeholder="$t('merchant.payment.startDate')"
          value-format="YYYY-MM-DD"
        />
        <a-date-picker
          v-model:value="filters.endDate"
          class="filter-date-single"
          :placeholder="$t('merchant.payment.endDate')"
          value-format="YYYY-MM-DD"
        />
        <a-button type="primary" @click="applyFilters"><SearchOutlined /> {{ $t('common.search') }}</a-button>
        <a-button @click="resetFilters">{{ $t('common.reset') }}</a-button>
      </div>
    </a-card>

    <!-- Bulk Action Bar -->
    <div v-if="selectedIds.length > 0" class="bulk-bar mb-4">
      <span class="bulk-count">
        {{ $t('merchant.payment.selectedCount', { count: selectedIds.length }) }}
      </span>
      <a-button type="primary" class="bulk-btn verify-btn" :loading="bulkLoading" @click="handleBulkVerify">
        <CheckCircleOutlined /> {{ $t('merchant.payment.bulkVerify') }}
      </a-button>
      <a-button danger class="bulk-btn" :loading="bulkLoading" @click="openBulkRejectModal">
        <CloseCircleOutlined /> {{ $t('merchant.payment.bulkReject') }}
      </a-button>
      <a-button type="text" @click="clearSelection">{{ $t('common.cancel') }}</a-button>
    </div>

    <!-- Desktop/Tablet Table -->
    <a-card v-if="!isMobile" :bordered="false" class="panel-card">
      <a-table
        :columns="columns"
        :data-source="payments"
        :pagination="paginationConfig"
        row-key="id"
        size="middle"
        :loading="paymentsLoading"
        :scroll="{ x: 1100 }"
        :row-selection="rowSelection"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'index'">
            {{ (currentPage - 1) * pageSize + payments.indexOf(record) + 1 }}
          </template>
          <template v-else-if="column.key === 'orderCode'">
            <span class="order-code">{{ record.customerOrder?.order?.orderCode || '—' }}</span>
          </template>
          <template v-else-if="column.key === 'customer'">
            <span>{{ record.customerOrder?.customer?.customerName || '—' }}</span>
          </template>
          <template v-else-if="column.key === 'paymentAmount'">
            <span class="amount-val">{{ formatNumber(record.paymentAmount) }}</span>
          </template>
          <template v-else-if="column.key === 'paymentDate'">
            {{ formatDate(record.paymentDate) }}
          </template>
          <template v-else-if="column.key === 'paymentProofUrl'">
            <a v-if="record.paymentProofUrl" @click="openImageModal(record.paymentProofUrl)" class="proof-link">
              <LinkOutlined /> {{ $t('merchant.payment.viewProof') }}
            </a>
            <span v-else class="no-proof">—</span>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="statusColor(record.status)" class="pill-tag">
              {{ statusLabel(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'customerMessage'">
            <a-tooltip v-if="record.customerMessage" placement="top" :overlay-class-name="'blue-tooltip'">
              <template #title>{{ record.customerMessage }}</template>
              <span class="msg-truncate">{{ record.customerMessage }}</span>
            </a-tooltip>
            <span v-else>—</span>
          </template>
          <template v-else-if="column.key === 'actions'">
            <div v-if="record.status === 'PENDING'" class="flex items-center justify-end gap-1">
              <a-popconfirm :title="$t('merchant.payment.confirmVerify')" @confirm="handleVerify(record.id)">
                <a-button type="text" class="icon-action verify-action"><CheckCircleOutlined /></a-button>
              </a-popconfirm>
              <a-button type="text" danger class="icon-action" @click="openRejectModal(record.id)">
                <CloseCircleOutlined />
              </a-button>
            </div>
            <span v-else class="done-label">—</span>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Mobile Cards -->
    <div v-else class="payments-mobile">
      <a-spin :spinning="paymentsLoading">
        <!-- Select All (mobile) -->
        <div v-if="payments.length > 0 && pendingPaymentsOnPage.length > 0" class="mobile-select-all-row">
          <a-checkbox
            :checked="allPaymentsSelected"
            :indeterminate="somePaymentsSelected && !allPaymentsSelected"
            @change="toggleSelectAllPayments"
          >
            {{ $t('merchant.payment.selectAll') }}
          </a-checkbox>
        </div>

        <a-empty v-if="payments.length === 0 && !paymentsLoading" :description="$t('merchant.payment.noPayments')" />

        <a-collapse accordion ghost class="payments-collapse">
          <template #expandIcon="{ isActive }">
            <DownOutlined class="expand-icon" :class="{ rotated: isActive }" />
          </template>
          <a-collapse-panel v-for="p in payments" :key="p.id" class="payment-panel">
            <template #header>
              <div class="card-row payment-card-header">
                <a-checkbox
                  :checked="selectedIds.includes(p.id)"
                  @change="toggleSelect(p.id)"
                  @click.stop
                  class="payment-checkbox"
                />
                <div class="payment-info">
                  <div class="payment-code">{{ p.customerOrder?.order?.orderCode || '—' }}</div>
                  <div class="payment-sub">{{ p.customerOrder?.customer?.customerName || '—' }}</div>
                  <div class="payment-meta">
                    <span class="payment-date">{{ formatDate(p.paymentDate) }}</span>
                    <a v-if="p.paymentProofUrl" @click="openImageModal(p.paymentProofUrl)" class="payment-proof-mini" @click.stop>
                      <LinkOutlined /> {{ $t('merchant.payment.viewProof') }}
                    </a>
                  </div>
                  <div v-if="p.customerMessage" class="payment-msg-preview">{{ truncate(p.customerMessage, 30) }}</div>
                </div>
                <div class="amount-side">
                  <div class="amount-val">{{ formatNumber(p.paymentAmount) }}</div>
                  <a-tag :color="statusColor(p.status)" class="status-tag">{{ statusLabel(p.status) }}</a-tag>
                </div>
              </div>
            </template>
            <div class="card-detail">
              <div class="detail-row">
                <span class="detail-label">{{ $t('merchant.payment.colDate') }}</span>
                <span class="detail-val">{{ formatDate(p.paymentDate) }}</span>
              </div>
              <div v-if="p.paymentProofUrl" class="detail-row">
                <span class="detail-label">{{ $t('merchant.payment.colProof') }}</span>
                <a @click="openImageModal(p.paymentProofUrl)" class="proof-link"><LinkOutlined /> {{ $t('merchant.payment.viewProof') }}</a>
              </div>
              <div v-if="p.customerMessage" class="detail-row">
                <span class="detail-label">{{ $t('merchant.payment.colMessage') }}</span>
                <span class="detail-val">{{ p.customerMessage }}</span>
              </div>
              <div v-if="p.status === 'PENDING'" class="detail-row border-none pt-2">
                <a-popconfirm :title="$t('merchant.payment.confirmVerify')" @confirm="handleVerify(p.id)">
                  <a-button type="primary" size="small" class="detail-btn verify-btn">
                    <CheckCircleOutlined /> {{ $t('merchant.payment.verify') }}
                  </a-button>
                </a-popconfirm>
                <a-button danger size="small" class="detail-btn" @click="openRejectModal(p.id)">
                  <CloseCircleOutlined /> {{ $t('merchant.payment.reject') }}
                </a-button>
              </div>
            </div>
          </a-collapse-panel>
        </a-collapse>

        <div v-if="payments.length > 0" class="pagination-row">
          <a-pagination v-model:current="currentPage" v-model:pageSize="pageSize" :total="total" simple @change="onPageChange" />
        </div>
      </a-spin>
    </div>

    <!-- Reject Modal (single) -->
    <a-modal
      v-model:open="rejectModalVisible"
      :title="$t('merchant.payment.reject')"
      :ok-text="$t('merchant.payment.reject')"
      :cancel-text="$t('common.cancel')"
      :confirm-loading="actionLoading"
      ok-type="danger"
      @ok="submitReject"
    >
      <a-form layout="vertical">
        <a-form-item :label="$t('merchant.payment.rejectReason')" required>
          <a-textarea
            v-model:value="rejectReason"
            :placeholder="$t('merchant.payment.rejectReasonPlaceholder')"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Bulk Reject Modal -->
    <a-modal
      v-model:open="bulkRejectModalVisible"
      :title="$t('merchant.payment.bulkReject')"
      :ok-text="$t('merchant.payment.bulkReject')"
      :cancel-text="$t('common.cancel')"
      :confirm-loading="bulkLoading"
      ok-type="danger"
      @ok="submitBulkReject"
    >
      <p>{{ $t('merchant.payment.confirmBulkReject', { count: selectedIds.length }) }}</p>
      <a-form layout="vertical">
        <a-form-item :label="$t('merchant.payment.rejectReason')" required>
          <a-textarea
            v-model:value="bulkRejectReason"
            :placeholder="$t('merchant.payment.rejectReasonPlaceholder')"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Image Preview Modal -->
    <Teleport to="body">
      <Transition name="modal-fade" appear>
        <div v-if="showImageModal && currentImageUrl" class="image-modal-overlay" @click="closeImageModal">
          <div class="image-modal-container" @click.stop>
            <div class="image-modal-header">
              <div class="modal-title">{{ $t('merchant.payment.paymentProofPreview') }}</div>
              <button class="modal-close-btn" @click="closeImageModal">
                <CloseOutlined />
              </button>
            </div>
            <div class="image-modal-content">
              <img 
                :src="currentImageUrl" 
                alt="Payment proof preview" 
                class="modal-image"
                @load="imageLoaded = true"
                @error="imageError = true"
              />
              <div v-if="!imageLoaded && !imageError" class="image-loading">
                <LoadingOutlined class="loading-icon" />
                <span>{{ $t('merchant.payment.loadingImage') }}</span>
              </div>
              <div v-if="imageError" class="image-error">
                <ExclamationCircleOutlined class="error-icon" />
                <span>{{ $t('merchant.payment.imageLoadError') }}</span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import type { TablePaginationConfig, TableColumnsType } from 'ant-design-vue';
import {
  SearchOutlined,
  FilterOutlined,
  DownOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LinkOutlined,
  CloseOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import { paymentRepository, type PaymentItem } from '@/infrastructure/repositories/payment.repository';
import { useIsMobile } from '@/shared/composables/useIsMobile';
import { handleApiError } from '@/shared/utils/error';
import { useMerchantDashboard } from '../../../composables/merchant/useMerchantDashboard';

const { t } = useI18n();
const route = useRoute();
const { isMobile } = useIsMobile();
const { dashboard, fetchDashboard } = useMerchantDashboard();

const paymentsLoading = ref(false);
const actionLoading = ref(false);
const bulkLoading = ref(false);
const payments = ref<PaymentItem[]>([]);
const total = ref(0);

// Image modal state
const showImageModal = ref(false);
const currentImageUrl = ref('');
const imageLoaded = ref(false);
const imageError = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const showFilters = ref(false);

// Status tab state
const activeStatusTab = ref('all');

// Financial Summary computed properties
const allCurrencies = computed(() =>
  (dashboard.value?.priceCurrencySummary ?? []).filter((c) => c?.baseCurrency || c?.targetCurrency)
);
const displayCurrencies = computed(() => {
  const list = allCurrencies.value;
  if (!list.length) return [];
  
  // Separate baseCurrency and targetCurrency items
  const baseCurrencies = list.filter(c => c.baseCurrency);
  const targetCurrencies = list.filter(c => c.targetCurrency);
  
  // Combine: baseCurrencies first, then targetCurrencies
  const combined = [...baseCurrencies, ...targetCurrencies];
  
  return combined;
});

const showFilterToggle = computed(() => isMobile.value);

const columns = computed<TableColumnsType>(() => [
  { title: t('merchant.payment.colId'), key: 'index', width: 55 },
  { title: t('merchant.payment.colOrder'), key: 'orderCode', width: 140 },
  {title: t('merchant.payment.customerMessage'), key: 'customerMessage',dataIndex: 'customerMessage', width: 150 },
  { title: t('merchant.payment.colCustomer'), key: 'customer', width: 150 },
  { title: t('merchant.payment.colAmount'), key: 'paymentAmount', dataIndex: 'paymentAmount', width: 140, align: 'right' as const },
  { title: t('merchant.payment.colDate'), key: 'paymentDate', dataIndex: 'paymentDate', width: 140 },
  { title: t('merchant.payment.colProof'), key: 'paymentProofUrl', width: 110 },
  { title: t('merchant.payment.colStatus'), key: 'status', dataIndex: 'status', width: 110, align: 'center' as const },
  { title: t('merchant.payment.colActions'), key: 'actions', fixed: 'right' as const, width: 100, align: 'right' as const },
]);

const rowSelection = computed(() => ({
  selectedRowKeys: selectedIds.value,
  onChange: (keys: number[]) => { selectedIds.value = keys; },
  getCheckboxProps: (record: PaymentItem) => ({ disabled: record.status !== 'PENDING' }),
}));

const paginationConfig = computed((): TablePaginationConfig => ({
  current: currentPage.value,
  pageSize: pageSize.value,
  total: total.value,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
  showTotal: (tot: number) => `Total ${tot}`,
}));

// Helper functions
function fmtCurrency(val: number | undefined): string {
  if (val == null) return '0';
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val);
}

function parseCurrencyString(val: string | number): number {
  if (typeof val === 'number') return val;
  if (!val || val === '') return 0;
  return parseFloat(val.replace(/,/g, ''));
}

const formatNumber = (val: string | number) => Number(val || 0).toLocaleString();
const truncate = (text: string | null | undefined, max: number) => {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
};
const formatDate = (d: string | null) => (d ? dayjs(d).format('DD/MM/YYYY HH:mm') : '—');
const statusColor = (status: string) => {
  if (status === 'VERIFIED') return 'success';
  if (status === 'REJECTED') return 'error';
  return 'warning';
};
const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    PENDING: t('merchant.payment.statusPending'),
    VERIFIED: t('merchant.payment.statusVerified'),
    REJECTED: t('merchant.payment.statusRejected'),
  };
  return map[status] ?? status;
};

const selectedIds = ref<number[]>([]);
const rejectModalVisible = ref(false);
const bulkRejectModalVisible = ref(false);
const rejectTargetId = ref<number | null>(null);
const rejectReason = ref('');
const bulkRejectReason = ref('');

const filters = reactive<{
  search: string;
  status: string | undefined;
  startDate: string | null;
  endDate: string | null;
}>({
  search: '',
  status: undefined,
  startDate: null,
  endDate: null,
});

const summary = ref({
  totalPayments: 0,
  totalAmount: '0',
  totalPending: 0,
  totalVerified: 0,
  totalRejected: 0,
});

const buildQuery = () => ({
  page: currentPage.value,
  limit: pageSize.value,
  ...(filters.search?.trim() ? { search: filters.search.trim() } : {}),
  ...(filters.status ? { status: filters.status } : {}),
  ...(filters.startDate ? { paymentDateFrom: filters.startDate } : {}),
  ...(filters.endDate ? { paymentDateTo: filters.endDate } : {}),
});

const buildSummaryQuery = () => ({
  ...(filters.search?.trim() ? { search: filters.search.trim() } : {}),
  ...(filters.status ? { status: filters.status } : {}),
  ...(filters.startDate ? { paymentDateFrom: filters.startDate } : {}),
  ...(filters.endDate ? { paymentDateTo: filters.endDate } : {}),
});

const fetchPayments = async () => {
  paymentsLoading.value = true;
  try {
    const [listRes, summaryRes] = await Promise.all([
      paymentRepository.getByMerchant(buildQuery()),
      paymentRepository.getSummaryByMerchant(buildSummaryQuery()),
    ]);
    payments.value = listRes.results ?? [];
    total.value = listRes.pagination?.total ?? 0;
    summary.value = {
      totalPayments: summaryRes.totalPayments ?? 0,
      totalAmount: summaryRes.totalAmount ?? '0',
      totalPending: summaryRes.totalPending ?? 0,
      totalVerified: summaryRes.totalVerified ?? 0,
      totalRejected: summaryRes.totalRejected ?? 0,
    };
  } catch (err) {
    handleApiError(err, t);
  } finally {
    paymentsLoading.value = false;
  }
};

const triggerSearch = () => { currentPage.value = 1; fetchPayments(); };
const applyFilters = () => { currentPage.value = 1; fetchPayments(); };

// Status tab change handler
const onStatusTabChange = (key: string) => {
  activeStatusTab.value = key;
  // Update filters based on selected tab
  if (key === 'all') {
    filters.status = undefined;
  } else {
    filters.status = key as 'PENDING' | 'VERIFIED' | 'REJECTED';
  }
  currentPage.value = 1;
  fetchPayments();
};

const resetFilters = () => {
  filters.search = '';
  filters.status = undefined;
  filters.startDate = null;
  filters.endDate = null;
  activeStatusTab.value = 'all';
  currentPage.value = 1;
  fetchPayments();
};

// Watch for route query changes to apply filters
watch(
  () => route.query,
  (query: Record<string, any>) => {
    if (query.status && typeof query.status === 'string') {
      filters.status = query.status;
      showFilters.value = true; // Show filters when status is applied
      // Trigger data fetching with new filter
      currentPage.value = 1;
      fetchPayments();
    }
  },
  { immediate: true }
);

const onPageChange = (page: number, size: number) => {
  currentPage.value = page; pageSize.value = size; fetchPayments();
};
const handleTableChange = (pagination: TablePaginationConfig) => {
  currentPage.value = pagination.current ?? 1;
  pageSize.value = pagination.pageSize ?? 10;
  fetchPayments();
};

const clearSelection = () => { selectedIds.value = []; };
const toggleSelect = (id: number) => {
  const idx = selectedIds.value.indexOf(id);
  if (idx >= 0) selectedIds.value = selectedIds.value.filter((_, i) => i !== idx);
  else selectedIds.value = [...selectedIds.value, id];
};

const pendingPaymentsOnPage = computed(() => payments.value.filter(p => p.status === 'PENDING').map(p => p.id));
const allPaymentsSelected = computed(() => {
  const pending = pendingPaymentsOnPage.value;
  if (pending.length === 0) return false;
  return pending.every(id => selectedIds.value.includes(id));
});
const somePaymentsSelected = computed(() => selectedIds.value.length > 0);
const toggleSelectAllPayments = () => {
  if (allPaymentsSelected.value) {
    selectedIds.value = selectedIds.value.filter(id => !pendingPaymentsOnPage.value.includes(id));
  } else {
    const toAdd = pendingPaymentsOnPage.value.filter(id => !selectedIds.value.includes(id));
    selectedIds.value = [...selectedIds.value, ...toAdd];
  }
};

const handleVerify = async (id: number) => {
  actionLoading.value = true;
  try {
    await paymentRepository.verify(id);
    message.success(t('merchant.payment.verifySuccess'));
    await fetchPayments();
  } catch (err) {
    handleApiError(err, t);
  } finally {
    actionLoading.value = false;
  }
};

const openRejectModal = (id: number) => {
  rejectTargetId.value = id;
  rejectReason.value = '';
  rejectModalVisible.value = true;
};

const submitReject = async () => {
  if (!rejectReason.value.trim()) {
    message.warning(t('merchant.payment.rejectReasonRequired'));
    return;
  }
  if (!rejectTargetId.value) return;
  actionLoading.value = true;
  try {
    await paymentRepository.reject(rejectTargetId.value, { rejectReason: rejectReason.value.trim() });
    message.success(t('merchant.payment.rejectSuccess'));
    rejectModalVisible.value = false;
    await fetchPayments();
  } catch (err) {
    handleApiError(err, t);
    throw err; // re-throw เพื่อให้ modal ไม่ปิดเมื่อเกิด error
  } finally {
    actionLoading.value = false;
  }
};

const handleBulkVerify = async () => {
  if (selectedIds.value.length === 0) { message.warning(t('merchant.payment.noSelected')); return; }
  bulkLoading.value = true;
  try {
    await paymentRepository.bulkVerify([...selectedIds.value]);
    message.success(t('merchant.payment.bulkVerifySuccess'));
    selectedIds.value = [];
    await fetchPayments();
  } catch (err) { handleApiError(err, t); }
  finally { bulkLoading.value = false; }
};

const openBulkRejectModal = () => {
  if (selectedIds.value.length === 0) { message.warning(t('merchant.payment.noSelected')); return; }
  bulkRejectReason.value = '';
  bulkRejectModalVisible.value = true;
};

const submitBulkReject = async () => {
  if (!bulkRejectReason.value.trim()) {
    message.warning(t('merchant.payment.rejectReasonRequired'));
    return;
  }
  bulkLoading.value = true;
  try {
    await paymentRepository.bulkReject({
      paymentIds: [...selectedIds.value],
      rejectReason: bulkRejectReason.value.trim(),
    });
    message.success(t('merchant.payment.bulkRejectSuccess'));
    bulkRejectModalVisible.value = false;
    clearSelection();
    await fetchPayments();
    await fetchDashboard();
  } catch (err) {
    handleApiError(err, t);
  } finally {
    bulkLoading.value = false;
  }
};

const openImageModal = (imageUrl: string) => {
  currentImageUrl.value = imageUrl;
  imageLoaded.value = false;
  imageError.value = false;
  showImageModal.value = true;
};

const closeImageModal = () => {
  showImageModal.value = false;
  currentImageUrl.value = '';
  imageLoaded.value = false;
  imageError.value = false;
};

const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && showImageModal.value) {
    closeImageModal();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleEscKey);
  fetchDashboard(); 
  fetchPayments(); 
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscKey);
});
</script>

<style scoped>
.mb-4 { margin-bottom: 16px; }

/* ===== Status Tabs ===== */
.status-tabs-card {
  background: #f8fafc;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.status-tabs-card :deep(.ant-card-body) {
  padding: 0 16px 16px;
}
.payment-status-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 0;
}
.payment-status-tabs :deep(.ant-tabs-tab) {
  padding: 12px 0;
  font-weight: 500;
}
.payment-status-tabs :deep(.ant-tabs-ink-bar) {
  background: #1677ff;
}
.payment-status-tabs :deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #1677ff;
}

/* ===== Currency Grid Layout ===== */
.currency-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

/* ===== Text Truncation ===== */
.truncated-text {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}

/* ===== Search & Filter Container ===== */
.search-filter-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.search-input { 
  height: 40px; 
  border-radius: 12px; 
  min-width: 200px;
  max-width: 350px;
  flex: 1;
}
.filter-toggle-btn {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  padding: 0 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

/* Mobile responsive */
@media (max-width: 767px) {
  .search-filter-container {
    gap: 6px;
  }
  .search-input {
    min-width: 160px;
    max-width: 280px;
  }
  .filter-toggle-btn {
    min-width: 40px;
    height: 40px;
    padding: 0 10px;
  }
}

/* Galaxy Tab S7 responsive (768px - 1024px) */
@media (min-width: 768px) and (max-width: 1024px) {
  .search-filter-container {
    gap: 10px;
  }
  .search-input {
    min-width: 200px;
    max-width: 350px;
  }
  .filter-toggle-btn {
    width: 40px;
    height: 40px;
    padding: 0 11px;
  }
}

/* Tablet layout adjustments */
@media (max-width: 1023px) {
  .search-filter-container {
    gap: 8px;
  }
  .search-input {
    min-width: 180px;
    max-width: 320px;
  }
  .filter-toggle-btn {
    width: 40px;
    height: 40px;
    padding: 0 11px;
  }
}
.page-title { font-size: 22px; font-weight: 600; color: #0f172a; line-height: 1.25; }
.page-subtitle { font-size: 13px; color: #64748b; margin-top: 2px; }
.search-input { height: 44px; border-radius: 12px; width: min(320px, 100%); }
.filter-toggle-btn {
  height: 44px; width: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 18px;
}
.filter-toggle-btn.active { background: #1677ff; color: #fff; border-color: #1677ff; }

@media (max-width: 1023px) {
  .page-header { flex-wrap: wrap; }
  .search-input { min-width: 180px; flex: 1 1 auto; }
}
/* Tablet (Galaxy Tab S7 ~800px) */
@media (min-width: 768px) and (max-width: 1024px) {
  .page-header { gap: 8px; }
  .search-input { height: 40px; min-width: 200px; }
  .filter-toggle-btn { height: 40px; width: 40px; font-size: 16px; }
  .page-title { font-size: 18px; }
  .page-subtitle { font-size: 12px; }
}
@media (max-width: 767px) {
  .title-block { order: 1; flex: 1 1 auto; }
  .filter-toggle-btn { order: 2; }
  .search-input { order: 3; flex: 1 1 100%; width: 100%; min-width: 100%; }
  .page-title { font-size: 15px; }
  .page-subtitle { display: none; }
}

/* ===== Filter ===== */
.filter-card { border-radius: 14px; box-shadow: 0 1px 2px rgba(15,23,42,.06), 0 10px 25px rgba(15,23,42,.04); }
.filter-bar { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.filter-date-single { border-radius: 10px; min-width: 160px; }
.filter-date-single :deep(.ant-picker) { border-radius: 10px !important; }
.filter-select { min-width: 160px; }
.filter-select :deep(.ant-select-selector) { border-radius: 10px !important; }
@media (max-width: 767px) {
  .filter-card { border-radius: 10px; }
  .filter-card :deep(.ant-card-body) { padding: 12px !important; }
  .filter-bar { flex-direction: column; }
  .filter-date-single, .filter-select { width: 100%; }
}

/* ===== Bulk Action Bar ===== */
.bulk-bar {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 10px 16px;
}
.bulk-count { font-weight: 700; color: #1d4ed8; font-size: 14px; flex: 1; }
.bulk-btn { border-radius: 10px; font-weight: 600; }
.verify-btn { background: #16a34a; border-color: #16a34a; }
.verify-btn:hover { background: #15803d !important; border-color: #15803d !important; }

/* ===== Table ===== */
.panel-card { border-radius: 14px; box-shadow: 0 1px 2px rgba(15,23,42,.06), 0 10px 25px rgba(15,23,42,.04); }
.pill-tag { border-radius: 999px; padding: 2px 10px; font-weight: 800; font-size: 12px; }
.icon-action { border-radius: 10px; }
.icon-action:hover { background: rgba(29,78,216,.08) !important; color: #1d4ed8; }
.verify-action:hover { color: #16a34a !important; background: rgba(22,163,74,.08) !important; }
.order-code { font-weight: 700; color: #1d4ed8; }
.amount-val { font-weight: 700; color: #0f172a; }
.proof-link { color: #1d4ed8; font-size: 13px; font-weight: 600; }
.no-proof { color: #94a3b8; }
.done-label { color: #94a3b8; font-size: 13px; }

:deep(.ant-table) { width: 100%; }
:deep(.ant-table-thead > tr > th) { background: #f8fafc !important; color: #0f172a; font-weight: 700; }
:deep(.ant-table-tbody > tr:hover > td:not(.ant-table-cell-fix-right)) { background: rgba(24,144,255,.06) !important; }

/* ===== Tablet (Galaxy Tab S7) ===== */
.tablet-layout :deep(.ant-table) {
  font-size: 13px;
}
.tablet-layout :deep(.ant-table-thead > tr > th) {
  padding: 8px 12px !important;
  font-size: 12px;
}
.tablet-layout :deep(.ant-table-tbody > tr > td) {
  padding: 8px 12px !important;
}
.tablet-layout :deep(.ant-table-cell-fix-right) {
  padding: 8px 8px !important;
}

/* ===== Mobile ===== */
.payments-mobile { display: flex; flex-direction: column; gap: 12px; }
.mobile-select-all-row {
  padding: 10px 14px;
  margin-bottom: 8px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}
.payments-collapse { background: transparent !important; border: none !important; }
.payments-collapse :deep(.ant-collapse-item) {
  background: #fff !important; border-radius: 16px !important;
  box-shadow: 0 1px 3px rgba(15,23,42,.06), 0 4px 16px rgba(15,23,42,.06) !important;
  border: 1px solid rgba(148,163,184,.15) !important; overflow: hidden; margin-bottom: 10px !important;
}
.payments-collapse :deep(.ant-collapse-header) { padding: 14px !important; align-items: center !important; }
.payments-collapse :deep(.ant-collapse-content) { background: transparent !important; border-top: 1px solid rgba(148,163,184,.18) !important; }
.payments-collapse :deep(.ant-collapse-content-box) { padding: 0 14px 14px !important; }
.expand-icon { font-size: 13px; color: #94a3b8; transition: transform 260ms ease; }
.expand-icon.rotated { transform: rotate(180deg); }
.card-row { display: flex; align-items: center; gap: 10px; padding-right: 4px; }
.payment-card-header { align-items: flex-start; }
.payment-checkbox { flex-shrink: 0; margin-right: 4px; padding-top: 2px; }
.payment-info { flex: 1; min-width: 0; }
.payment-code { font-size: 15px; font-weight: 700; color: #1d4ed8; }
.payment-sub { font-size: 12px; color: #64748b; margin-top: 2px; }
.payment-meta { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 4px; font-size: 12px; }
.payment-date { color: #64748b; }
.payment-proof-mini { color: #1d4ed8; font-size: 12px; font-weight: 600; }
.payment-proof-mini:hover { color: #2563eb; }
.payment-msg-preview { font-size: 12px; color: #94a3b8; margin-top: 4px; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.amount-side { flex-shrink: 0; text-align: right; }
.status-tag { border-radius: 999px; font-weight: 700; font-size: 11px; display: block; margin-top: 4px; }
.card-detail { padding-top: 10px; }
.detail-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 0; border-bottom: 1px solid rgba(148,163,184,.2); gap: 8px;
}
.detail-row.border-none { border-bottom: none; justify-content: flex-end; gap: 8px; }
.detail-label { font-size: 12px; font-weight: 600; color: #94a3b8; }
.detail-val { font-size: 13px; font-weight: 600; color: #1e293b; text-align: right; }
.detail-btn { border-radius: 8px; font-size: 13px; }
.pagination-row { display: flex; justify-content: center; margin-top: 16px; padding-top: 12px; }
.msg-truncate {
  display: inline-block; max-width: 140px; overflow: hidden;
  text-overflow: ellipsis; white-space: nowrap; vertical-align: middle;
  cursor: pointer;
}

/* ===== Summary Cards ===== */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}
.summary-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.05);
  border: 1px solid rgba(148, 163, 184, 0.12);
}
.summary-icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; flex-shrink: 0;
}
.payments-icon { background: rgba(29, 78, 216, 0.1); color: #1d4ed8; }
.amount-icon { background: rgba(234, 88, 12, 0.1); color: #ea580c; }
.pending-icon { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.verified-icon { background: rgba(22, 163, 74, 0.1); color: #16a34a; }
.rejected-icon { background: rgba(220, 38, 38, 0.1); color: #dc2626; }
.summary-body { flex: 1; min-width: 0; }
.summary-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.4px; }
.summary-value { font-size: 18px; font-weight: 800; color: #0f172a; line-height: 1.3; }
.summary-sub { font-size: 11px; color: #94a3b8; font-weight: 600; }
.num-truncate {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
@media (max-width: 1023px) {
  .summary-grid { grid-template-columns: repeat(3, 1fr); }
}
/* ===== Financial Summary Cards ===== */
.stats-row { margin-bottom: 16px; }
.currency-card {
  background: #fff;
  border-radius: 14px;
  /* padding: 16px  18px; */
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 1px 2px rgba(15,23,42,0.06), 0 10px 25px rgba(15,23,42,0.04);
  border: 1px solid rgba(148,163,184,0.12);
  height: 100%;
}
.currency-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.currency-badge {
  padding: 4px 8px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
}
.badge-lak { background: #f59e0b; color: #fff; }
.badge-cny { background: #ef4444; color: #fff; }
.badge-thb { background: #f97316; color: #fff; }
.badge-usd { background: #3b82f6; color: #fff; }

/* Target currency specific styles */
.currency-target {
  background: linear-gradient(135deg, #f8fafc, #e0f2fe);
  border: 2px solid #3b82f6;
  position: relative;
}
.currency-target::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  border-radius: 14px 14px 0 0;
}
.badge-usdt { background: #fbbf24; color: #fff; }
.badge-placeholder { background: #f3f4f6; color: #94a3b8; }
.currency-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}
.currency-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.c-label { font-size: 12px; font-weight: 600; color: #64748b; min-width: 60px; }
.c-val { font-weight: 700; color: #0f172a; text-align: right; }
.text-green { color: #16a34a; }
.text-red { color: #dc2626; }
.num-truncate {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
@media (max-width: 767px) {
  .currency-card { padding: 12px 14px; border-radius: 10px; }
  .c-label { font-size: 11px; }
  .c-val { font-size: 13px; }
}
@media (min-width: 768px) and (max-width: 1024px) {
  .currency-card { padding: 14px 16px; }
}
@media (max-width: 1023px) {
  .currency-card { padding: 12px 14px; }
}
@media (max-width: 767px) {
  .currency-card { padding: 12px 14px; border-radius: 10px; }
}
</style>

<style>
.blue-tooltip .ant-tooltip-inner {
  background: #1d4ed8 !important;
  color: #fff !important;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 12px;
  max-width: 320px;
  word-break: break-word;
}
.blue-tooltip .ant-tooltip-arrow::before {
  background: #1d4ed8 !important;
}

/* Image Modal Styles */
.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.image-modal-container {
  background: white;
  border-radius: 16px;
  max-width: 90vw;
  max-height: 90vh;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.image-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.modal-close-btn {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 16px;
}

.modal-close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.image-modal-content {
  position: relative;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background: #f3f4f6;
}

.modal-image {
  max-width: 100%;
  max-height: 70vh;
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  object-fit: contain;
  animation: imageZoomIn 0.3s ease-out;
}

.image-loading,
.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #6b7280;
  font-size: 14px;
}

.loading-icon {
  font-size: 24px;
  color: #3b82f6;
  animation: spin 1s linear infinite;
}

.error-icon {
  font-size: 24px;
  color: #ef4444;
}

/* Modal Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from {
  opacity: 0;
}

.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .image-modal-container {
  animation: modalSlideIn 0.3s ease-out;
}

.modal-fade-leave-active .image-modal-container {
  animation: modalSlideOut 0.3s ease-in;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes modalSlideOut {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
}

@keyframes imageZoomIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .image-modal-overlay {
    padding: 10px;
  }
  
  .image-modal-container {
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 12px;
  }
  
  .image-modal-header {
    padding: 12px 16px;
  }
  
  .modal-title {
    font-size: 14px;
  }
  
  .image-modal-content {
    padding: 16px;
    min-height: 150px;
  }
  
  .modal-image {
    max-height: 60vh;
  }
}
</style>
