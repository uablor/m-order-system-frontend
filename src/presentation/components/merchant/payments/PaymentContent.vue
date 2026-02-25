<template>
  <div class="payment-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="title-block">
        <div class="page-title">{{ $t('merchant.payment.title') }}</div>
        <div class="page-subtitle">{{ $t('merchant.payment.subtitle') }}</div>
      </div>
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
        v-if="isMobile"
        type="default"
        class="filter-toggle-btn"
        :class="{ active: showFilters }"
        @click="showFilters = !showFilters"
      >
        <FilterOutlined />
      </a-button>
    </div>

    <!-- Filter Panel -->
    <a-card v-if="!isMobile || showFilters" :bordered="false" class="filter-card mb-4">
      <div class="filter-bar">
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
        <a-select
          v-model:value="filters.status"
          allow-clear
          class="filter-select"
          :placeholder="$t('merchant.payment.statusFilter')"
        >
          <a-select-option value="PENDING">{{ $t('merchant.payment.statusPending') }}</a-select-option>
          <a-select-option value="VERIFIED">{{ $t('merchant.payment.statusVerified') }}</a-select-option>
          <a-select-option value="REJECTED">{{ $t('merchant.payment.statusRejected') }}</a-select-option>
        </a-select>
        <a-button type="primary" @click="applyFilters"><SearchOutlined /> {{ $t('common.search') }}</a-button>
        <a-button @click="resetFilters">{{ $t('common.reset') }}</a-button>
      </div>
    </a-card>

    <!-- Summary Cards -->
    <div class="summary-grid mb-4">
      <div class="summary-card">
        <div class="summary-icon payments-icon"><OrderedListOutlined /></div>
        <div class="summary-body">
          <div class="summary-label">{{ $t('merchant.payment.summaryTotalPayments') }}</div>
          <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ summary.totalPayments }}</template><div class="summary-value num-truncate">{{ summary.totalPayments }}</div></a-tooltip>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon amount-icon"><DollarOutlined /></div>
        <div class="summary-body">
          <div class="summary-label">{{ $t('merchant.payment.summaryTotalAmount') }}</div>
          <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(summary.totalAmount) }} LAK</template><div class="summary-value num-truncate">{{ truncNum(summary.totalAmount) }}</div></a-tooltip>
          <div class="summary-sub">LAK</div>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon pending-icon"><ClockCircleOutlined /></div>
        <div class="summary-body">
          <div class="summary-label">{{ $t('merchant.payment.summaryPending') }}</div>
          <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ summary.totalPending }}</template><div class="summary-value num-truncate">{{ summary.totalPending }}</div></a-tooltip>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon verified-icon"><CheckCircleOutlined /></div>
        <div class="summary-body">
          <div class="summary-label">{{ $t('merchant.payment.summaryVerified') }}</div>
          <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ summary.totalVerified }}</template><div class="summary-value num-truncate">{{ summary.totalVerified }}</div></a-tooltip>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon rejected-icon"><CloseCircleOutlined /></div>
        <div class="summary-body">
          <div class="summary-label">{{ $t('merchant.payment.summaryRejected') }}</div>
          <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ summary.totalRejected }}</template><div class="summary-value num-truncate">{{ summary.totalRejected }}</div></a-tooltip>
        </div>
      </div>
    </div>

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

    <!-- Desktop Table -->
    <a-card v-if="!isMobile" :bordered="false" class="panel-card">
      <a-table
        :columns="columns"
        :data-source="payments"
        :pagination="paginationConfig"
        row-key="id"
        size="middle"
        :loading="loading"
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
            <a v-if="record.paymentProofUrl" :href="record.paymentProofUrl" target="_blank" class="proof-link">
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
      <a-spin :spinning="loading">
        <a-empty v-if="payments.length === 0 && !loading" :description="$t('merchant.payment.noPayments')" />

        <a-collapse accordion ghost class="payments-collapse">
          <template #expandIcon="{ isActive }">
            <DownOutlined class="expand-icon" :class="{ rotated: isActive }" />
          </template>
          <a-collapse-panel v-for="p in payments" :key="p.id" class="payment-panel">
            <template #header>
              <div class="card-row">
                <a-checkbox
                  :checked="selectedIds.includes(p.id)"
                  @change="toggleSelect(p.id)"
                  @click.stop
                  class="mr-2"
                />
                <div class="payment-info">
                  <div class="payment-code">{{ p.customerOrder?.order?.orderCode || '—' }}</div>
                  <div class="payment-sub">{{ p.customerOrder?.customer?.customerName || '—' }}</div>
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
                <a :href="p.paymentProofUrl" target="_blank" class="proof-link"><LinkOutlined /> {{ $t('merchant.payment.viewProof') }}</a>
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import type { TablePaginationConfig, TableColumnsType } from 'ant-design-vue';
import {
  SearchOutlined,
  FilterOutlined,
  DownOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LinkOutlined,
  DollarOutlined,
  OrderedListOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import { paymentRepository, type PaymentItem } from '@/infrastructure/repositories/payment.repository';
import { useIsMobile } from '@/shared/composables/useIsMobile';
import { handleApiError } from '@/shared/utils/error';

const { t } = useI18n();
const { isMobile } = useIsMobile();

const loading = ref(false);
const actionLoading = ref(false);
const bulkLoading = ref(false);
const payments = ref<PaymentItem[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const showFilters = ref(false);

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

const formatNumber = (val: string | number) => Number(val || 0).toLocaleString();
const truncNum = (val: string | number, maxLen = 12) => {
  const formatted = Number(val || 0).toLocaleString();
  return formatted.length > maxLen ? formatted.slice(0, maxLen) + '…' : formatted;
};
const formatDate = (d: string | null) => (d ? dayjs(d).format('DD/MM/YYYY HH:mm') : '—');

const buildQuery = () => ({
  page: currentPage.value,
  limit: pageSize.value,
  ...(filters.search?.trim() ? { search: filters.search.trim() } : {}),
  ...(filters.status ? { status: filters.status } : {}),
  ...(filters.startDate ? { paymentDateFrom: filters.startDate } : {}),
  ...(filters.endDate ? { paymentDateTo: filters.endDate } : {}),
});

const fetchPayments = async () => {
  loading.value = true;
  try {
    const res = await paymentRepository.getByMerchant(buildQuery());
    payments.value = res.results ?? [];
    total.value = res.pagination?.total ?? 0;
    if ((res as any).summary) {
      summary.value = {
        totalPayments: (res as any).summary.totalPayments ?? 0,
        totalAmount: (res as any).summary.totalAmount ?? '0',
        totalPending: (res as any).summary.totalPending ?? 0,
        totalVerified: (res as any).summary.totalVerified ?? 0,
        totalRejected: (res as any).summary.totalRejected ?? 0,
      };
    }
  } catch (err) {
    handleApiError(err, t);
  } finally {
    loading.value = false;
  }
};

const triggerSearch = () => { currentPage.value = 1; fetchPayments(); };
const applyFilters = () => { currentPage.value = 1; fetchPayments(); };
const resetFilters = () => {
  filters.search = '';
  filters.status = undefined;
  filters.startDate = null;
  filters.endDate = null;
  currentPage.value = 1;
  fetchPayments();
};

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
  if (idx >= 0) selectedIds.value.splice(idx, 1);
  else selectedIds.value.push(id);
};

const handleVerify = async (id: number) => {
  actionLoading.value = true;
  try {
    await paymentRepository.verify(id);
    message.success(t('merchant.payment.verifySuccess'));
    await fetchPayments();
  } catch (err) { handleApiError(err, t); }
  finally { actionLoading.value = false; }
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
  } catch (err) { handleApiError(err, t); }
  finally { actionLoading.value = false; }
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
    selectedIds.value = [];
    await fetchPayments();
  } catch (err) { handleApiError(err, t); }
  finally { bulkLoading.value = false; }
};

onMounted(() => { fetchPayments(); });
</script>

<style scoped>
.mb-4 { margin-bottom: 16px; }

/* ===== Page Header ===== */
.page-header {
  display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
}
.title-block { flex: 1 1 auto; min-width: 0; }
.page-title { font-size: 22px; font-weight: 600; color: #0f172a; line-height: 1.25; }
.page-subtitle { font-size: 13px; color: #64748b; margin-top: 2px; }
.search-input { height: 44px; border-radius: 12px; width: min(320px, 100%); }
.filter-toggle-btn {
  height: 44px; width: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 18px;
}
.filter-toggle-btn.active { background: #1677ff; color: #fff; border-color: #1677ff; }

@media (max-width: 767px) {
  .page-header { flex-wrap: wrap; }
  .title-block { order: 1; flex: 1 1 auto; }
  .filter-toggle-btn { order: 2; }
  .search-input { order: 3; flex: 1 1 100%; width: 100%; }
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
:deep(.ant-table-tbody > tr:hover > td) { background: rgba(24,144,255,.06) !important; }

/* ===== Mobile ===== */
.payments-mobile { display: flex; flex-direction: column; gap: 12px; }
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
.payment-info { flex: 1; min-width: 0; }
.payment-code { font-size: 15px; font-weight: 700; color: #1d4ed8; }
.payment-sub { font-size: 12px; color: #64748b; margin-top: 2px; }
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
@media (max-width: 767px) {
  .summary-grid { grid-template-columns: 1fr; gap: 10px; }
  .summary-card { padding: 12px 14px; border-radius: 10px; }
  .summary-value { font-size: 15px; }
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
</style>
