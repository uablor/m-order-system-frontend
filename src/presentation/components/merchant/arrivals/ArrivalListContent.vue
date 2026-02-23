<template>
  <div class="arrival-list-page">
    <div class="page-header">
      <div class="title-block">
        <div class="page-title">{{ $t('merchant.arrivals.title') }}</div>
        <div class="page-subtitle">{{ $t('merchant.arrivals.subtitle') }}</div>
      </div>

      <a-input
        v-model:value="filters.search"
        allow-clear
        class="search-input"
        :placeholder="$t('merchant.arrivals.searchPlaceholder')"
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

      <a-button type="primary" class="add-btn" @click="openCreateModal">
        <template #icon><PlusOutlined /></template>
        {{ $t('merchant.arrivals.recordArrival') }}
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
          :placeholder="$t('merchant.arrivals.startDate')"
          :popup-class-name="'blue-picker-popup'"
          @change="onFilterChange"
        />
        <a-date-picker
          v-model:value="endDate"
          class="filter-date-single"
          :placeholder="$t('merchant.arrivals.endDate')"
          :popup-class-name="'blue-picker-popup'"
          @change="onFilterChange"
        />

        <a-select
          v-model:value="filters.orderId"
          allow-clear
          show-search
          option-filter-prop="label"
          class="filter-select"
          :placeholder="$t('merchant.arrivals.orderFilter')"
          @change="onFilterChange"
        >
          <a-select-option
            v-for="o in orderOptions"
            :key="o.id"
            :value="o.id"
            :label="o.orderCode"
          >
            {{ o.orderCode }}
          </a-select-option>
        </a-select>
      </div>
    </a-card>

    <!-- Desktop: table inside card -->
    <a-card v-if="!isMobile" :bordered="false" class="panel-card">
      <a-table
        :columns="columns"
        :data-source="arrivals"
        :pagination="paginationConfig"
        row-key="id"
        size="middle"
        :loading="loading"
        :scroll="{ x: 900 }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'index'">
            {{ (currentPage - 1) * pageSize + arrivals.indexOf(record) + 1 }}
          </template>
          <template v-else-if="column.key === 'orderCode'">
            <span class="order-code">{{ record.order?.orderCode || `#${record.orderId}` }}</span>
          </template>
          <template v-else-if="column.key === 'arrivedDate'">
            {{ formatDate(record.arrivedDate) }}
          </template>
          <template v-else-if="column.key === 'arrivedTime'">
            {{ record.arrivedTime || '-' }}
          </template>
          <template v-else-if="column.key === 'itemsCount'">
            <a-tag class="count-tag">{{ record.arrivalItems?.length || 0 }}</a-tag>
          </template>
          <template v-else-if="column.key === 'notes'">
            <a-tooltip v-if="record.notes && record.notes.length > 30" placement="top" :overlay-class-name="'blue-tooltip'">
              <template #title>{{ record.notes }}</template>
              <span class="notes-truncate">{{ truncate(record.notes, 30) }}</span>
            </a-tooltip>
            <span v-else class="notes-text">{{ record.notes || '—' }}</span>
          </template>
          <template v-else-if="column.key === 'actions'">
            <div class="flex items-center justify-end gap-2">
              <a-button type="text" class="icon-action" @click="viewDetail(record.id)">
                <EyeOutlined />
              </a-button>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Mobile: collapse cards -->
    <div v-else class="arrivals-mobile">
      <a-spin :spinning="loading">
        <a-empty v-if="arrivals.length === 0 && !loading" :description="$t('merchant.arrivals.noArrivals')" />

        <a-collapse accordion ghost class="arrivals-collapse">
          <template #expandIcon="{ isActive }">
            <DownOutlined class="expand-icon" :class="{ rotated: isActive }" />
          </template>

          <a-collapse-panel v-for="arrival in arrivals" :key="arrival.id" class="arrival-panel">
            <template #header>
              <div class="card-row">
                <div class="avatar-wrap">
                  <a-avatar class="arrival-avatar" :size="48">
                    #{{ arrival.id }}
                  </a-avatar>
                </div>
                <div class="arrival-info">
                  <div class="arrival-name">{{ arrival.order?.orderCode || `#${arrival.orderId}` }}</div>
                  <div class="arrival-date">{{ formatDate(arrival.arrivedDate) }}</div>
                </div>
                <div class="status-side">
                  <a-tag class="count-tag">{{ arrival.arrivalItems?.length || 0 }} {{ $t('merchant.arrivals.colItems') }}</a-tag>
                </div>
              </div>
            </template>

            <div class="card-detail">
              <div class="detail-row">
                <span class="detail-label">{{ $t('merchant.arrivals.colTime') }}</span>
                <span class="detail-val">{{ arrival.arrivedTime || '-' }}</span>
              </div>
              <div v-if="arrival.notes" class="detail-row">
                <span class="detail-label">{{ $t('merchant.arrivals.colNotes') }}</span>
                <span class="detail-val">{{ truncate(arrival.notes, 50) }}</span>
              </div>
              <div class="detail-row border-none pt-2">
                <a-button type="primary" size="small" class="detail-btn" @click="viewDetail(arrival.id)">
                  <EyeOutlined /> {{ $t('merchant.arrivals.viewDetail') }}
                </a-button>
              </div>
            </div>
          </a-collapse-panel>
        </a-collapse>

        <div v-if="arrivals.length > 0" class="pagination-row">
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

    <!-- Create Arrival Modal -->
    <a-modal
      v-model:open="createModalVisible"
      :title="$t('merchant.arrivals.createTitle')"
      :width="720"
      :ok-text="$t('merchant.arrivals.submit')"
      :cancel-text="$t('merchant.arrivals.cancel')"
      :confirm-loading="submitting"
      :ok-button-props="{ disabled: !canSubmit }"
      @ok="handleCreate"
      @cancel="resetCreateForm"
    >
      <div class="create-form">
        <div class="form-group">
          <label class="form-label">{{ $t('merchant.arrivals.selectOrder') }} <span class="required">*</span></label>
          <a-select
            v-model:value="createForm.orderId"
            show-search
            option-filter-prop="label"
            :placeholder="$t('merchant.arrivals.selectOrderPlaceholder')"
            class="form-input"
            :loading="loadingOrders"
            @change="onOrderSelected"
          >
            <a-select-option
              v-for="o in orderOptions"
              :key="o.id"
              :value="o.id"
              :label="o.orderCode"
            >
              {{ o.orderCode }} — {{ formatDate(o.orderDate) }}
            </a-select-option>
          </a-select>
        </div>

        <div class="form-group">
          <label class="form-label">{{ $t('merchant.arrivals.notes') }}</label>
          <a-textarea
            v-model:value="createForm.notes"
            :rows="2"
            :placeholder="$t('merchant.arrivals.notesPlaceholder')"
            class="form-input"
          />
        </div>

        <a-spin v-if="loadingOrderDetail" class="order-detail-spinner" />

        <template v-if="selectedOrderItems.length > 0">
          <div class="items-section-title">{{ $t('merchant.arrivals.arrivalItems') }}</div>

          <div class="arrival-items-list">
            <div
              v-for="(item, idx) in createForm.arrivalItems"
              :key="idx"
              class="arrival-item-row"
            >
              <a-checkbox v-model:checked="item.selected" class="item-checkbox">
                <span class="item-product-name">
                  {{ getOrderItemLabel(item.orderItemId) }}
                </span>
              </a-checkbox>

              <div v-if="item.selected" class="item-fields">
                <div class="item-field">
                  <label class="field-label">{{ $t('merchant.arrivals.quantity') }}</label>
                  <a-input-number
                    v-model:value="item.arrivedQuantity"
                    :min="1"
                    :max="getOrderItemQty(item.orderItemId)"
                    size="small"
                    class="qty-input"
                  />
                </div>
                <div class="item-field">
                  <label class="field-label">{{ $t('merchant.arrivals.condition') }}</label>
                  <a-select
                    v-model:value="item.condition"
                    size="small"
                    class="condition-select"
                    :placeholder="$t('merchant.arrivals.conditionPlaceholder')"
                    allow-clear
                  >
                    <a-select-option value="OK">OK</a-select-option>
                    <a-select-option value="DAMAGED">DAMAGED</a-select-option>
                    <a-select-option value="LOST">LOST</a-select-option>
                  </a-select>
                </div>
                <div class="item-field">
                  <label class="field-label">{{ $t('merchant.arrivals.itemNotes') }}</label>
                  <a-input
                    v-model:value="item.notes"
                    size="small"
                    :placeholder="$t('merchant.arrivals.itemNotesPlaceholder')"
                  />
                </div>
              </div>
            </div>
          </div>
        </template>

        <a-empty
          v-if="createForm.orderId && selectedOrderItems.length === 0 && !loadingOrderDetail"
          :description="$t('merchant.arrivals.noOrderItems')"
          class="mt-3"
        />
      </div>
    </a-modal>
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
  PlusOutlined,
  FilterOutlined,
  DownOutlined,
} from '@ant-design/icons-vue';
import { arrivalRepository } from '@/infrastructure/repositories/arrival.repository';
import { orderRepository } from '@/infrastructure/repositories/order.repository';
import type { Arrival, Order, OrderItem, ArrivalItemCondition } from '@/domain/entities/user.entity';
import type { ArrivalListQueryDto, CreateArrivalDto } from '@/application/dto/arrival.dto';
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
const arrivals = ref<Arrival[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const startDate = ref<Dayjs | null>(null);
const endDate = ref<Dayjs | null>(null);
const showFilters = ref(false);

const filters = reactive<{
  search: string;
  orderId: number | undefined;
}>({
  search: '',
  orderId: undefined,
});

const orderOptions = ref<Order[]>([]);
const loadingOrders = ref(false);

const createModalVisible = ref(false);
const submitting = ref(false);
const loadingOrderDetail = ref(false);
const selectedOrderItems = ref<OrderItem[]>([]);

interface CreateArrivalItemForm {
  orderItemId: number;
  arrivedQuantity: number;
  condition: ArrivalItemCondition | undefined;
  notes: string;
  selected: boolean;
}

const createForm = reactive<{
  orderId: number | undefined;
  notes: string;
  arrivalItems: CreateArrivalItemForm[];
}>({
  orderId: undefined,
  notes: '',
  arrivalItems: [],
});

const canSubmit = computed(() => {
  if (!createForm.orderId) return false;
  const selected = createForm.arrivalItems.filter(i => i.selected);
  return selected.length > 0 && selected.every(i => i.arrivedQuantity > 0);
});

const columns = computed<TableColumnsType>(() => [
  { title: '#', key: 'index', width: 60 },
  { title: t('merchant.arrivals.colOrder'), key: 'orderCode', dataIndex: 'orderId', width: 160 },
  { title: t('merchant.arrivals.colDate'), key: 'arrivedDate', dataIndex: 'arrivedDate', width: 140 },
  { title: t('merchant.arrivals.colTime'), key: 'arrivedTime', dataIndex: 'arrivedTime', width: 120 },
  { title: t('merchant.arrivals.colItems'), key: 'itemsCount', width: 100, align: 'center' as const },
  { title: t('merchant.arrivals.colNotes'), key: 'notes', dataIndex: 'notes', width: 200, ellipsis: true },
  { title: t('merchant.arrivals.colActions'), key: 'actions', fixed: 'right' as const, width: 100, align: 'right' as const },
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
    fetchArrivals();
  }
};

const truncate = (text: string | null, max: number) => {
  if (!text) return '-';
  return text.length > max ? text.slice(0, max) + '…' : text;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString();
};

const onFilterChange = () => {
  currentPage.value = 1;
  fetchArrivals();
};

let searchTimer: ReturnType<typeof setTimeout> | undefined;
const triggerSearch = () => {
  clearTimeout(searchTimer);
  currentPage.value = 1;
  fetchArrivals();
};
watch(() => filters.search, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage.value = 1;
    fetchArrivals();
  }, 450);
});

const buildQuery = (): ArrivalListQueryDto => {
  const query: ArrivalListQueryDto = {
    page: currentPage.value,
    limit: pageSize.value,
    merchantId: authPayload.value?.merchantId,
  };
  if (filters.search?.trim()) query.search = filters.search.trim();
  if (filters.orderId) query.orderId = filters.orderId;
  if (startDate.value) query.startDate = startDate.value.format('YYYY-MM-DD');
  if (endDate.value) query.endDate = endDate.value.format('YYYY-MM-DD');
  return query;
};

const fetchArrivals = async () => {
  loading.value = true;
  try {
    const res = await arrivalRepository.getList(buildQuery());
    arrivals.value = res.results ?? [];
    total.value = res.pagination?.total ?? 0;
  } catch (err) {
    handleApiError(err, t);
  } finally {
    loading.value = false;
  }
};

const fetchOrders = async () => {
  loadingOrders.value = true;
  try {
    const res = await orderRepository.getList({
      limit: 200,
      merchantId: authPayload.value?.merchantId,
    });
    orderOptions.value = res.results ?? [];
  } catch (err) {
    handleApiError(err, t);
  } finally {
    loadingOrders.value = false;
  }
};

const onPageChange = (page: number, size: number) => {
  currentPage.value = page;
  pageSize.value = size;
  fetchArrivals();
};

const viewDetail = (id: number) => {
  router.push(`/merchant/arrivals/${id}`);
};

const openCreateModal = () => {
  createModalVisible.value = true;
  if (orderOptions.value.length === 0) fetchOrders();
};

const onOrderSelected = async (orderId: number) => {
  if (!orderId) {
    selectedOrderItems.value = [];
    createForm.arrivalItems = [];
    return;
  }
  loadingOrderDetail.value = true;
  try {
    const order = await orderRepository.getById(orderId);
    const items = order.orderItems ?? [];
    selectedOrderItems.value = items;
    createForm.arrivalItems = items.map(item => ({
      orderItemId: item.id,
      arrivedQuantity: item.quantity,
      condition: 'OK' as ArrivalItemCondition,
      notes: '',
      selected: true,
    }));
  } catch (err) {
    handleApiError(err, t);
    selectedOrderItems.value = [];
    createForm.arrivalItems = [];
  } finally {
    loadingOrderDetail.value = false;
  }
};

const getOrderItemLabel = (orderItemId: number) => {
  const item = selectedOrderItems.value.find(i => i.id === orderItemId);
  if (!item) return `#${orderItemId}`;
  return item.variant ? `${item.productName} (${item.variant})` : item.productName;
};

const getOrderItemQty = (orderItemId: number) => {
  const item = selectedOrderItems.value.find(i => i.id === orderItemId);
  return item?.quantity ?? 999;
};

const resetCreateForm = () => {
  createForm.orderId = undefined;
  createForm.notes = '';
  createForm.arrivalItems = [];
  selectedOrderItems.value = [];
};

const handleCreate = async () => {
  if (!canSubmit.value) return;
  submitting.value = true;
  try {
    const payload: CreateArrivalDto = {
      orderId: createForm.orderId!,
      notes: createForm.notes || undefined,
      arrivalItems: createForm.arrivalItems
        .filter(i => i.selected)
        .map(i => ({
          orderItemId: i.orderItemId,
          arrivedQuantity: i.arrivedQuantity,
          condition: i.condition || undefined,
          notes: i.notes || undefined,
        })),
    };
    await arrivalRepository.create(payload);
    message.success(t('merchant.arrivals.createSuccess'));
    createModalVisible.value = false;
    resetCreateForm();
    await fetchArrivals();
  } catch (err) {
    handleApiError(err, t);
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchArrivals();
  fetchOrders();
});
</script>

<style scoped>
.mb-4 { margin-bottom: 16px; }
.mt-3 { margin-top: 12px; }

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
.add-btn { height: 44px; border-radius: 12px; font-weight: 700; flex-shrink: 0; }

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
  .add-btn { order: 3; flex-shrink: 0; height: 36px; font-size: 12px; padding: 0 10px; }
  .search-input { order: 4; flex: 1 1 100%; width: 100%; }
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
.filter-select { min-width: 180px; }
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
.order-code { font-weight: 700; color: #1d4ed8; }
.pill-tag { border-radius: 999px; padding: 2px 10px; font-weight: 800; font-size: 12px; }
.count-tag {
  border-radius: 999px; font-size: 12px; font-weight: 800;
  background: #eff6ff; color: #1d4ed8; border: none;
}
.notes-text { color: #64748b; font-size: 13px; }
.notes-truncate {
  display: inline-block; max-width: 180px; overflow: hidden;
  text-overflow: ellipsis; white-space: nowrap; vertical-align: middle;
  color: #64748b; font-size: 13px; cursor: pointer;
}
.icon-action { border-radius: 10px; }
.icon-action:hover { background: rgba(29, 78, 216, 0.08) !important; color: #1d4ed8; }

:deep(.ant-table) { width: 100%; }
:deep(.ant-table-thead > tr > th) {
  background: #f8fafc !important; color: #0f172a; font-weight: 700;
}
:deep(.ant-table-tbody > tr:hover > td) {
  background: rgba(24, 144, 255, 0.06) !important;
}

/* ===== Mobile card list ===== */
.arrivals-mobile { display: flex; flex-direction: column; gap: 12px; }

.arrivals-collapse { background: transparent !important; border: none !important; }
.arrivals-collapse :deep(.ant-collapse-item) {
  background: #ffffff !important;
  border-radius: 16px !important;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.06) !important;
  border: 1px solid rgba(148, 163, 184, 0.15) !important;
  overflow: hidden; margin-bottom: 10px !important;
}
.arrivals-collapse :deep(.ant-collapse-header) {
  padding: 14px 14px !important; align-items: center !important;
}
.arrivals-collapse :deep(.ant-collapse-content) {
  background: transparent !important;
  border-top: 1px solid rgba(148, 163, 184, 0.18) !important;
}
.arrivals-collapse :deep(.ant-collapse-content-box) {
  padding: 0 14px 14px !important;
}

.expand-icon { font-size: 13px; color: #94a3b8; transition: transform 260ms ease; }
.expand-icon.rotated { transform: rotate(180deg); }

.card-row { display: flex; align-items: center; gap: 12px; padding-right: 4px; }
.status-side { flex-shrink: 0; margin-left: auto; }

.avatar-wrap { position: relative; flex-shrink: 0; }
.arrival-avatar {
  background: rgba(22, 119, 255, 0.1); color: #1677ff;
  font-weight: 800; font-size: 14px;
}
.arrival-info { flex: 1; min-width: 0; }
.arrival-name { font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.3; }
.arrival-date { font-size: 13px; color: #64748b; margin-top: 2px; }

.card-detail { padding-top: 10px; }
.detail-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 0; border-bottom: 1px solid rgba(148, 163, 184, 0.2); gap: 8px;
}
.detail-row.border-none { border-bottom: none; justify-content: flex-end; }
.detail-label { font-size: 12px; font-weight: 600; color: #94a3b8; }
.detail-val { font-size: 13px; font-weight: 600; color: #1e293b; text-align: right; }
.detail-btn { border-radius: 8px; font-size: 13px; }

.pagination-row {
  display: flex; justify-content: center; margin-top: 16px; padding-top: 12px;
}

/* ===== Create Modal ===== */
.create-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; font-weight: 700; color: #334155; }
.required { color: #dc2626; }
.form-input { border-radius: 10px; }
.items-section-title {
  font-size: 14px; font-weight: 800; color: #0f172a;
  padding-top: 8px; border-top: 1px solid rgba(148, 163, 184, 0.18);
}
.arrival-items-list { display: flex; flex-direction: column; gap: 12px; }
.arrival-item-row {
  background: #f8fafc; border-radius: 12px;
  padding: 12px 14px; border: 1px solid rgba(148, 163, 184, 0.15);
}
.item-checkbox { font-weight: 700; color: #0f172a; }
.item-product-name { font-weight: 700; color: #0f172a; font-size: 14px; }
.item-fields {
  display: flex; flex-wrap: wrap; gap: 10px;
  margin-top: 10px; padding-top: 10px;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
}
.item-field { display: flex; flex-direction: column; gap: 4px; min-width: 120px; flex: 1; }
.field-label {
  font-size: 11px; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: 0.3px;
}
.qty-input { width: 100%; border-radius: 8px; }
.condition-select { min-width: 130px; }
.condition-select :deep(.ant-select-selector) { border-radius: 8px !important; }
.order-detail-spinner { display: flex; justify-content: center; padding: 20px 0; }

@media (max-width: 767px) {
  .item-fields { flex-direction: column; }
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
