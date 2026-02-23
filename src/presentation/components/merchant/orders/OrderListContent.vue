<template>
  <div class="order-list-page">
    <div class="page-header">
      <div class="title-block">
        <div class="page-title">{{ $t('merchant.orderList.title') }}</div>
        <div class="page-subtitle">{{ $t('merchant.orderList.subtitle') }}</div>
      </div>

      <a-input
        v-model:value="filters.search"
        allow-clear
        class="search-input"
        :placeholder="$t('merchant.orderList.searchPlaceholder')"
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
    <a-card
      v-if="!isMobile || showFilters"
      :bordered="false"
      class="filter-card mb-4"
    >
      <div class="filter-bar">
        <a-date-picker
          v-model:value="startDate"
          class="filter-date-single"
          :placeholder="$t('merchant.orderList.startDate')"
          :popup-class-name="'blue-picker-popup'"
          @change="onFilterChange"
        />
        <a-date-picker
          v-model:value="endDate"
          class="filter-date-single"
          :placeholder="$t('merchant.orderList.endDate')"
          :popup-class-name="'blue-picker-popup'"
          @change="onFilterChange"
        />

        <a-select
          v-model:value="filters.arrivalStatus"
          allow-clear
          class="filter-select"
          :placeholder="$t('merchant.orderList.arrivalStatusFilter')"
          @change="onFilterChange"
        >
          <a-select-option value="NOT_ARRIVED">{{ $t('merchant.orderList.arrivalNotArrived') }}</a-select-option>
          <a-select-option value="ARRIVED">{{ $t('merchant.orderList.arrivalArrived') }}</a-select-option>
        </a-select>

        <a-select
          v-model:value="filters.paymentStatus"
          allow-clear
          class="filter-select"
          :placeholder="$t('merchant.orderList.paymentStatusFilter')"
          @change="onFilterChange"
        >
          <a-select-option value="UNPAID">{{ $t('merchant.orderList.paymentUnpaid') }}</a-select-option>
          <a-select-option value="PARTIAL">{{ $t('merchant.orderList.paymentPartial') }}</a-select-option>
          <a-select-option value="PAID">{{ $t('merchant.orderList.paymentPaid') }}</a-select-option>
        </a-select>
      </div>
    </a-card>

    <!-- Summary Cards -->
    <div class="summary-grid mb-4">
      <div class="summary-card">
        <div class="summary-icon orders-icon"><OrderedListOutlined /></div>
        <div class="summary-body">
          <div class="summary-label">{{ $t('merchant.orderList.summaryTotalOrders') }}</div>
          <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ summary.totalOrders }}</template><div class="summary-value num-truncate">{{ summary.totalOrders }}</div></a-tooltip>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon cost-icon"><DollarOutlined /></div>
        <div class="summary-body">
          <div class="summary-label">{{ $t('merchant.orderList.summaryTotalCost') }}</div>
          <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(summary.totalFinalCostLak) }} LAK</template><div class="summary-value num-truncate">{{ truncNum(summary.totalFinalCostLak) }}</div></a-tooltip>
          <div class="summary-sub">LAK</div>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon selling-icon"><ShoppingCartOutlined /></div>
        <div class="summary-body">
          <div class="summary-label">{{ $t('merchant.orderList.summaryTotalSelling') }}</div>
          <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(summary.totalSellingAmountLak) }} LAK</template><div class="summary-value num-truncate">{{ truncNum(summary.totalSellingAmountLak) }}</div></a-tooltip>
          <div class="summary-sub">LAK</div>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon profit-icon"><RiseOutlined /></div>
        <div class="summary-body">
          <div class="summary-label">{{ $t('merchant.orderList.summaryTotalProfit') }}</div>
          <a-tooltip :overlay-class-name="'blue-tooltip'"><template #title>{{ formatNumber(summary.totalProfitLak) }} LAK</template><div class="summary-value num-truncate" :class="{ 'profit-positive': Number(summary.totalProfitLak) >= 0, 'profit-negative': Number(summary.totalProfitLak) < 0 }">{{ truncNum(summary.totalProfitLak) }}</div></a-tooltip>
          <div class="summary-sub">LAK</div>
        </div>
      </div>
    </div>

    <!-- Desktop: table inside card -->
    <a-card v-if="!isMobile" :bordered="false" class="panel-card">
      <a-table
        :columns="columns"
        :data-source="orders"
        :pagination="paginationConfig"
        row-key="id"
        size="middle"
        :loading="loading"
        :scroll="{ x: 1100 }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'index'">
            {{ (currentPage - 1) * pageSize + orders.indexOf(record) + 1 }}
          </template>
          <template v-else-if="column.key === 'orderCode'">
            <span class="order-code-link" @click="viewDetail(record.id)">{{ record.orderCode }}</span>
          </template>
          <template v-else-if="column.key === 'orderDate'">
            {{ formatDate(record.orderDate) }}
          </template>
          <template v-else-if="column.key === 'arrivalStatus'">
            <a-tag :color="arrivalColor(record.arrivalStatus)" class="pill-tag">
              {{ arrivalLabel(record.arrivalStatus) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'paymentStatus'">
            <a-tag :color="paymentColor(record.paymentStatus)" class="pill-tag">
              {{ paymentLabel(record.paymentStatus) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'orderItemsCount'">
            <a-tag class="count-tag">{{ record.orderItems?.length || 0 }}</a-tag>
          </template>
          <template v-else-if="column.key === 'totalFinalCostLak'">
            {{ formatNumber(record.totalFinalCostLak) }}
          </template>
          <template v-else-if="column.key === 'profit'">
            <span :class="{ 'profit-positive': Number(record.totalProfitLak) >= 0, 'profit-negative': Number(record.totalProfitLak) < 0 }">
              {{ formatNumber(record.totalProfitLak) }}
            </span>
          </template>
          <template v-else-if="column.key === 'actions'">
            <div class="flex items-center justify-end gap-2">
              <a-button type="text" class="icon-action" @click="viewDetail(record.id)">
                <EyeOutlined />
              </a-button>
              <a-popconfirm :title="$t('merchant.orderList.confirmDelete')" @confirm="handleDelete(record.id)">
                <a-button type="text" danger class="icon-action"><DeleteOutlined /></a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Mobile: collapse cards -->
    <div v-else class="orders-mobile">
      <a-spin :spinning="loading">
        <a-empty v-if="orders.length === 0 && !loading" :description="$t('merchant.orderList.noOrders')" />

        <a-collapse accordion ghost class="orders-collapse">
          <template #expandIcon="{ isActive }">
            <DownOutlined class="expand-icon" :class="{ rotated: isActive }" />
          </template>

          <a-collapse-panel v-for="order in orders" :key="order.id" class="order-panel">
            <template #header>
              <div class="card-row">
                <div class="order-avatar-wrap">
                  <a-avatar class="order-avatar" :size="48">
                    {{ (order.orderCode || '?').slice(0, 2).toUpperCase() }}
                  </a-avatar>
                </div>
                <div class="order-info">
                  <div class="order-name">{{ order.orderCode }}</div>
                  <div class="order-date">{{ formatDate(order.orderDate) }}</div>
                </div>
                <div class="status-side">
                  <a-tag :color="paymentColor(order.paymentStatus)" class="status-tag">
                    {{ paymentLabel(order.paymentStatus) }}
                  </a-tag>
                </div>
              </div>
            </template>

            <div class="card-detail">
              <div class="detail-row">
                <span class="detail-label">{{ $t('merchant.orderList.colArrivalStatus') }}</span>
                <a-tag :color="arrivalColor(order.arrivalStatus)" class="pill-tag">
                  {{ arrivalLabel(order.arrivalStatus) }}
                </a-tag>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ $t('merchant.orderList.colTotalCost') }}</span>
                <span class="detail-val">{{ formatNumber(order.totalFinalCostLak) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ $t('merchant.orderList.colProfit') }}</span>
                <span class="detail-val" :class="{ 'profit-positive': Number(order.totalProfitLak) >= 0, 'profit-negative': Number(order.totalProfitLak) < 0 }">
                  {{ formatNumber(order.totalProfitLak) }}
                </span>
              </div>
              <div class="detail-row border-none pt-2">
                <a-button type="primary" size="small" class="detail-btn" @click="viewDetail(order.id)">
                  <EyeOutlined /> {{ $t('merchant.orderList.viewDetail') }}
                </a-button>
                <a-popconfirm :title="$t('merchant.orderList.confirmDelete')" @confirm="handleDelete(order.id)">
                  <a-button type="text" danger size="small" class="delete-btn">
                    <DeleteOutlined /> {{ $t('common.delete') }}
                  </a-button>
                </a-popconfirm>
              </div>
            </div>
          </a-collapse-panel>
        </a-collapse>

        <div v-if="orders.length > 0" class="pagination-row">
          <a-pagination
            v-model:current="currentPage"
            v-model:pageSize="pageSize"
            :total="total"
            simple
            @change="onPageChange"
          />
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';
import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
import {
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  FilterOutlined,
  DownOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
} from '@ant-design/icons-vue';
import { OrderedListOutlined } from '@ant-design/icons-vue';
import { orderRepository } from '@/infrastructure/repositories/order.repository';
import type { Order, ArrivalStatusEnum, PaymentStatusEnum } from '@/domain/entities/user.entity';
import type { OrderListQueryDto } from '@/application/dto/order.dto';
import { useAuthStore } from '@/store/auth.store';
import { storeToRefs } from 'pinia';
import { useIsMobile } from '@/shared/composables/useIsMobile';
import { handleApiError } from '@/shared/utils/error';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const { authPayload } = storeToRefs(authStore);
const { isMobile } = useIsMobile();

const loading = ref(false);
const orders = ref<Order[]>([]);
const total = ref(0);
const summary = ref({
  totalOrders: 0,
  totalFinalCostLak: '0',
  totalSellingAmountLak: '0',
  totalProfitLak: '0',
});
const currentPage = ref(1);
const pageSize = ref(10);
const startDate = ref<Dayjs | null>(null);
const endDate = ref<Dayjs | null>(null);
const showFilters = ref(false);

const filters = reactive<{
  search: string;
  arrivalStatus: ArrivalStatusEnum | undefined;
  paymentStatus: PaymentStatusEnum | undefined;
}>({
  search: '',
  arrivalStatus: undefined,
  paymentStatus: undefined,
});

const columns = computed<TableColumnsType>(() => [
  { title: '#', key: 'index', width: 60 },
  { title: t('merchant.orderList.colOrderCode'), key: 'orderCode', dataIndex: 'orderCode', width: 160 },
  { title: t('merchant.orderList.colOrderDate'), key: 'orderDate', dataIndex: 'orderDate', width: 140 },
  { title: t('merchant.orderList.colArrivalStatus'), key: 'arrivalStatus', dataIndex: 'arrivalStatus', width: 140, align: 'center' as const },
  { title: t('merchant.orderList.colPaymentStatus'), key: 'paymentStatus', dataIndex: 'paymentStatus', width: 140, align: 'center' as const },
  { title: t('merchant.orderList.colOrderItems'), key: 'orderItemsCount', width: 100, align: 'center' as const },
  { title: t('merchant.orderList.colTotalCost'), key: 'totalFinalCostLak', dataIndex: 'totalFinalCostLak', width: 140, align: 'right' as const },
  { title: t('merchant.orderList.colProfit'), key: 'profit', width: 130, align: 'right' as const },
  { title: t('merchant.orderList.colActions'), key: 'actions', fixed: 'right' as const, width: 100, align: 'right' as const },
]);

const paginationConfig = computed(() => ({
  current: currentPage.value,
  pageSize: pageSize.value,
  total: total.value,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
}));

const handleTableChange = (p: TablePaginationConfig) => {
  if (p.current && p.pageSize) {
    currentPage.value = p.current;
    pageSize.value = p.pageSize;
    fetchOrders();
  }
};

const arrivalColor = (status: ArrivalStatusEnum) => status === 'ARRIVED' ? 'green' : 'orange';
const arrivalLabel = (status: ArrivalStatusEnum) =>
  status === 'ARRIVED' ? t('merchant.orderList.arrivalArrived') : t('merchant.orderList.arrivalNotArrived');

const paymentColor = (status: PaymentStatusEnum) => {
  if (status === 'PAID') return 'green';
  if (status === 'PARTIAL') return 'orange';
  return 'red';
};
const paymentLabel = (status: PaymentStatusEnum) => {
  if (status === 'PAID') return t('merchant.orderList.paymentPaid');
  if (status === 'PARTIAL') return t('merchant.orderList.paymentPartial');
  return t('merchant.orderList.paymentUnpaid');
};

const formatNumber = (val: string | number) => Number(val || 0).toLocaleString();
const truncNum = (val: string | number, maxLen = 12) => {
  const formatted = Number(val || 0).toLocaleString();
  return formatted.length > maxLen ? formatted.slice(0, maxLen) + '…' : formatted;
};
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString();
};

const onFilterChange = () => {
  currentPage.value = 1;
  fetchOrders();
};

let searchTimer: ReturnType<typeof setTimeout> | undefined;
const triggerSearch = () => {
  clearTimeout(searchTimer);
  currentPage.value = 1;
  fetchOrders();
};
watch(() => filters.search, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage.value = 1;
    fetchOrders();
  }, 450);
});

const buildQuery = (): OrderListQueryDto => {
  const query: OrderListQueryDto = {
    page: currentPage.value,
    limit: pageSize.value,
    merchantId: authPayload.value?.merchantId,
  };
  if (filters.search?.trim()) query.search = filters.search.trim();
  if (startDate.value) query.startDate = startDate.value.format('YYYY-MM-DD');
  if (endDate.value) query.endDate = endDate.value.format('YYYY-MM-DD');
  if (filters.arrivalStatus) query.arrivalStatus = filters.arrivalStatus;
  if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;
  return query;
};

const fetchOrders = async () => {
  loading.value = true;
  try {
    const query = buildQuery();
    const res = await orderRepository.getList(query) as any;
    orders.value = res.results ?? [];
    total.value = res.pagination?.total ?? 0;
    if (res.summary) {
      summary.value = {
        totalOrders: res.summary.totalOrders ?? 0,
        totalFinalCostLak: res.summary.totalFinalCostLak ?? '0',
        totalSellingAmountLak: res.summary.totalSellingAmountLak ?? '0',
        totalProfitLak: res.summary.totalProfitLak ?? '0',
      };
    }
  } catch (err) {
    handleApiError(err, t);
  } finally {
    loading.value = false;
  }
};

const onPageChange = (page: number, size: number) => {
  currentPage.value = page;
  pageSize.value = size;
  fetchOrders();
};

const viewDetail = (id: number) => {
  router.push(`/merchant/orders/${id}`);
};

const handleDelete = async (id: number) => {
  try {
    await orderRepository.delete(id);
    message.success(t('merchant.orderList.deleteSuccess'));
    await fetchOrders();
  } catch (err) {
    handleApiError(err, t);
  }
};

onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
.mb-4 { margin-bottom: 16px; }

/* ===== Summary Cards ===== */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
.orders-icon { background: rgba(29, 78, 216, 0.1); color: #1d4ed8; }
.cost-icon { background: rgba(234, 88, 12, 0.1); color: #ea580c; }
.selling-icon { background: rgba(22, 163, 74, 0.1); color: #16a34a; }
.profit-icon { background: rgba(139, 92, 246, 0.1); color: #7c3aed; }
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
.count-tag {
  border-radius: 999px; font-size: 12px; font-weight: 800;
  background: #eff6ff; color: #1d4ed8; border: none;
}
@media (max-width: 1023px) {
  .summary-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 767px) {
  .summary-grid { grid-template-columns: 1fr; gap: 10px; }
  .summary-card { padding: 12px 14px; border-radius: 10px; }
  .summary-value { font-size: 15px; }
}

/* ===== Page header ===== */
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

.filter-toggle-btn {
  height: 44px; width: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; font-size: 18px;
}
.filter-toggle-btn.active {
  background: #1677ff; color: #fff; border-color: #1677ff;
}

@media (max-width: 767px) {
  .page-header { flex-wrap: wrap; }
  .title-block { order: 1; flex: 1 1 auto; }
  .filter-toggle-btn { order: 2; }
  .search-input { order: 3; flex: 1 1 100%; width: 100%; }
  .page-title { font-size: 15px; }
  .page-subtitle { display: none; }
}

/* ===== Filter Card ===== */
.filter-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}
.filter-bar {
  display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
}
.filter-date-single { border-radius: 10px; min-width: 160px; }
.filter-date-single :deep(.ant-picker) { border-radius: 10px !important; }
.filter-select { min-width: 160px; }
.filter-select :deep(.ant-select-selector) { border-radius: 10px !important; }

@media (max-width: 767px) {
  .filter-card { border-radius: 10px; }
  .filter-card :deep(.ant-card-body) { padding: 12px !important; }
  .filter-bar { flex-direction: column; }
  .filter-date-single { width: 100%; }
  .filter-select { width: 100%; }
}

/* ===== Desktop card ===== */
.panel-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}
.order-code-link { font-weight: 700; color: #1d4ed8; cursor: pointer; }
.order-code-link:hover { text-decoration: underline; }
.pill-tag { border-radius: 999px; padding: 2px 10px; font-weight: 800; font-size: 12px; }
.icon-action { border-radius: 10px; }
.icon-action:hover { background: rgba(29, 78, 216, 0.08) !important; color: #1d4ed8; }
.profit-positive { color: #16a34a; font-weight: 700; }
.profit-negative { color: #dc2626; font-weight: 700; }

:deep(.ant-table) { width: 100%; }
:deep(.ant-table-thead > tr > th) {
  background: #f8fafc !important; color: #0f172a; font-weight: 700;
}
:deep(.ant-table-tbody > tr:hover > td) {
  background: rgba(24, 144, 255, 0.06) !important;
}

/* ===== Mobile card list ===== */
.orders-mobile { display: flex; flex-direction: column; gap: 12px; }

.orders-collapse { background: transparent !important; border: none !important; }
.orders-collapse :deep(.ant-collapse-item) {
  background: #ffffff !important;
  border-radius: 16px !important;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.06) !important;
  border: 1px solid rgba(148, 163, 184, 0.15) !important;
  overflow: hidden;
  margin-bottom: 10px !important;
}
.orders-collapse :deep(.ant-collapse-header) {
  padding: 14px 14px !important;
  align-items: center !important;
}
.orders-collapse :deep(.ant-collapse-content) {
  background: transparent !important;
  border-top: 1px solid rgba(148, 163, 184, 0.18) !important;
}
.orders-collapse :deep(.ant-collapse-content-box) {
  padding: 0 14px 14px !important;
}

.expand-icon {
  font-size: 13px; color: #94a3b8;
  transition: transform 260ms ease;
}
.expand-icon.rotated { transform: rotate(180deg); }

.card-row {
  display: flex; align-items: center; gap: 12px; padding-right: 4px;
}
.status-side { flex-shrink: 0; margin-left: auto; }

.order-avatar-wrap { position: relative; flex-shrink: 0; }
.order-avatar {
  background: rgba(22, 119, 255, 0.1); color: #1677ff;
  font-weight: 800; font-size: 16px;
}
.order-info { flex: 1; min-width: 0; }
.order-name { font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.3; }
.order-date { font-size: 13px; color: #64748b; margin-top: 2px; }
.status-tag { border-radius: 999px; font-weight: 700; font-size: 12px; }

.card-detail { padding-top: 10px; }
.detail-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 0; border-bottom: 1px solid rgba(148, 163, 184, 0.2); gap: 8px;
}
.detail-row.border-none { border-bottom: none; justify-content: flex-end; }
.detail-label { font-size: 12px; font-weight: 600; color: #94a3b8; }
.detail-val { font-size: 13px; font-weight: 600; color: #1e293b; text-align: right; }
.detail-btn { border-radius: 8px; font-size: 13px; }
.delete-btn { border-radius: 8px; font-size: 13px; }

.pagination-row {
  display: flex; justify-content: center; margin-top: 16px; padding-top: 12px;
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
