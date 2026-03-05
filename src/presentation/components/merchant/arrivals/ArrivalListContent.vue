<template>
  <div class="arrival-list-page">
    <div v-if="!embedded" class="page-header">
      <div class="title-block">
        <div class="page-title">{{ $t('merchant.arrivals.title') }}</div>
        <div class="page-subtitle">{{ $t('merchant.arrivals.subtitle') }}</div>
      </div>
      <a-button
        v-if="isMobile"
        type="default"
        class="filter-toggle-btn filter-toggle-btn--header"
        :class="{ active: showFilters }"
        @click="showFilters = !showFilters"
      >
        <FilterOutlined />
      </a-button>
      <a-button type="primary" class="add-btn" @click="goToCreateMultiple">
        <template #icon><PlusOutlined /></template>
        {{ $t('merchant.arrivals.recordArrival') }}
      </a-button>
    </div>

    <!-- Embedded + Mobile: แถบ filter toggle (เมื่อ embed ใน Notification tab, ไม่ใช้เมื่อ controlsInParent) -->
    <div v-if="embedded && isMobile && !controlsInParent" class="embedded-mobile-toolbar">
      <a-button
        type="default"
        class="filter-toggle-btn"
        :class="{ active: showFilters }"
        @click="showFilters = !showFilters"
      >
        <FilterOutlined />
      </a-button>
    </div>

    <!-- Filter: แถวเดียว — Date, Sort, Customer, Search -->
    <div class="filter-wrapper mb-4" :class="{ 'mt-0': embedded }">
      <Transition name="filter-panel">
        <a-card
          v-if="!isMobile || showFilters"
          :bordered="false"
          class="filter-card filter-card--single"
        >
          <div class="filter-bar filter-bar--single">
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
              v-model:value="filters.sort"
              allow-clear
              class="filter-select filter-select--sort"
              :placeholder="$t('merchant.arrivals.sortDirection')"
              @change="onFilterChange"
            >
              <a-select-option value="DESC">{{ $t('merchant.arrivals.sortDesc') }}</a-select-option>
              <a-select-option value="ASC">{{ $t('merchant.arrivals.sortAsc') }}</a-select-option>
            </a-select>
            <a-select
              v-model:value="filters.customerId"
              allow-clear
              show-search
              option-filter-prop="label"
              class="filter-select filter-select--customer"
              :placeholder="$t('merchant.arrivals.customerNameFilterShort')"
              :loading="loadingCustomers"
              @change="onFilterChange"
            >
              <a-select-option
                v-for="customer in customerOptions"
                :key="customer.id"
                :value="customer.id"
                :label="customer.name"
              >
                {{ customer.name }}
              </a-select-option>
            </a-select>
            <a-input
              v-model:value="filters.search"
              allow-clear
              class="filter-input filter-input--search"
              :placeholder="$t('merchant.arrivals.searchPlaceholder')"
              @pressEnter="triggerSearch"
            >
              <template #prefix><SearchOutlined /></template>
            </a-input>
            <!-- <a-input
              v-model:value="filters.customerName"
              allow-clear
              class="filter-input filter-input--customer"
              :placeholder="$t('merchant.arrivals.customerNameFilterShort')"
              @pressEnter="onFilterChange"
              @change="onCustomerNameChange"
            >
              <template #prefix><UserOutlined /></template>
            </a-input> -->
          </div>
        </a-card>
      </Transition>
    </div>

    <!-- Create Noti button (embedded mode, arrivals without notification, ไม่ใช้เมื่อ controlsInParent) -->
    <div v-if="showCreateNotiBar && !controlsInParent" class="create-noti-bar">
      <span class="create-noti-count">{{ $t('merchant.notifications.createNotiSelectedCount', { count: selectedArrivalIds.size }) }}</span>
      <a-button type="primary" :loading="createNotiSubmitting" @click="openCreateNotiConfirm">
        {{ $t('merchant.notifications.createNoti') }}
      </a-button>
    </div>

    <!-- Desktop: table inside card -->
    <a-card v-if="!isMobile" :bordered="false" class="panel-card" :class="{ 'tablet-layout': isTabletLayout }">
      <a-table
        :columns="columnsWithCheckbox"
        :data-source="arrivals"
        :pagination="paginationConfig"
        :row-selection="rowSelection"
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
            <a-tooltip v-if="record.notes" placement="top" :overlay-class-name="'blue-tooltip'" :title="record.notes">
              <span class="notes-truncate">{{ truncate(record.notes, 25) }}</span>
            </a-tooltip>
            <span v-else class="notes-text">—</span>
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
        <!-- Select All (embedded + notification tab) -->
        <div v-if="embedded && notificationFilter === false && arrivals.length > 0" class="mobile-select-all-row">
          <a-checkbox
            :checked="allArrivalsSelected"
            :indeterminate="someArrivalsSelected && !allArrivalsSelected"
            @change="toggleSelectAllArrivals"
          >
            {{ $t('merchant.arrivals.selectAll') }}
          </a-checkbox>
        </div>

        <a-empty v-if="arrivals.length === 0 && !loading" :description="$t('merchant.arrivals.noArrivals')" />

        <a-collapse accordion ghost class="arrivals-collapse">
          <template #expandIcon="{ isActive }">
            <DownOutlined class="expand-icon" :class="{ rotated: isActive }" />
          </template>

          <a-collapse-panel v-for="arrival in arrivals" :key="arrival.id" class="arrival-panel">
            <template #header>
              <div class="card-row">
                <a-checkbox
                  v-if="embedded && notificationFilter === false"
                  :checked="selectedArrivalIds.has(arrival.id)"
                  class="arrival-checkbox"
                  @change="toggleArrivalSelection(arrival.id)"
                  @click.stop
                />
                <div class="avatar-wrap">
                  <a-avatar class="arrival-avatar" :size="48">
                    #{{ arrival.id }}
                  </a-avatar>
                </div>
                <div class="arrival-info">
                  <div class="arrival-name">{{ arrival.order?.orderCode || `#${arrival.orderId}` }}</div>
                  <div class="arrival-meta">
                    <span class="arrival-date">{{ formatDate(arrival.arrivedDate) }}</span>
                    <span class="arrival-time">{{ arrival.arrivedTime || '-' }}</span>
                  </div>
                  <a-tag class="count-tag count-tag-inline">{{ arrival.arrivalItems?.length || 0 }} {{ $t('merchant.arrivals.colItems') }}</a-tag>
                </div>
              </div>
            </template>

            <div class="card-detail">
              <div class="detail-row">
                <span class="detail-label">{{ $t('merchant.arrivals.colTime') }}</span>
                <span class="detail-val">{{ arrival.arrivedTime || '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ $t('merchant.arrivals.colItems') }}</span>
                <span class="detail-val">{{ arrival.arrivalItems?.length || 0 }}</span>
              </div>
              <div v-if="arrival.notes" class="detail-row">
                <span class="detail-label">{{ $t('merchant.arrivals.colNotes') }}</span>
                <a-tooltip placement="top" :overlay-class-name="'blue-tooltip'" :title="arrival.notes">
                  <span class="detail-val notes-truncate">{{ truncate(arrival.notes, 35) }}</span>
                </a-tooltip>
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

    <!-- Confirm Create Notifications Modal -->
    <a-modal
      v-model:open="createNotiConfirmVisible"
      :title="$t('merchant.notifications.createNotiConfirmTitle')"
      :ok-text="$t('merchant.notifications.createNoti')"
      :cancel-text="$t('common.cancel')"
      :confirm-loading="createNotiSubmitting"
      @ok="handleCreateNotifications"
    >
      <div class="create-noti-modal-content">
        <p class="create-noti-modal-message">{{ $t('merchant.notifications.createNotiConfirmMessage', { count: selectedArrivalIds.size }) }}</p>
        <div class="create-noti-language-row">
          <span class="create-noti-language-label">{{ $t('merchant.arrivals.notificationMessageLanguage') }}:</span>
          <a-radio-group v-model:value="createNotiLanguage" size="small" class="create-noti-language-options">
            <a-radio-button value="en">{{ $t('merchant.arrivals.notificationLangEn') }}</a-radio-button>
            <a-radio-button value="th">{{ $t('merchant.arrivals.notificationLangTh') }}</a-radio-button>
            <a-radio-button value="la">{{ $t('merchant.arrivals.notificationLangLa') }}</a-radio-button>
          </a-radio-group>
        </div>
      </div>
    </a-modal>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    /** เมื่อ true: ซ่อน header และ Record Arrival button (ใช้ embed ในหน้า notifications) */
    embedded?: boolean;
    /** filter default สำหรับ notification: true = มี notification, false = ยังไม่มี notification */
    notificationFilter?: boolean;
    /** เมื่อ true: แสดง filter + Create Noti ใน parent header แทน (ใช้กับ NotificationListContent) */
    controlsInParent?: boolean;
  }>(),
  { embedded: false, notificationFilter: undefined, controlsInParent: false },
);
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import type { Dayjs } from 'dayjs';
import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
import {
  SearchOutlined,
  EyeOutlined,
  PlusOutlined,
  FilterOutlined,
  DownOutlined,
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { arrivalRepository } from '@/infrastructure/repositories/arrival.repository';
import { orderRepository } from '@/infrastructure/repositories/order.repository';
import { notificationRepository, type CreateNotificationDto, type CreateNotificationMultipleResponseItem } from '@/infrastructure/repositories/notification.repository';
import type { Arrival, Order } from '@/domain/entities/user.entity';
import type { ArrivalListQueryDto } from '@/application/dto/arrival.dto';
import { useAuthStore } from '@/store/auth.store';
import { storeToRefs } from 'pinia';
import { useIsMobile } from '@/shared/composables/useIsMobile';
import { handleApiError } from '@/shared/utils/error';
import { useWhatsApp } from '@/shared/composables/useWhatsApp';

const { t } = useI18n();
const router = useRouter();
const { openWhatsAppChat, isValidWhatsAppPhone, formatPhoneForWhatsApp } = useWhatsApp();
const authStore = useAuthStore();
const { authPayload } = storeToRefs(authStore);
const { isMobile, isTablet } = useIsMobile();

const loading = ref(false);
const arrivals = ref<Arrival[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const startDate = ref<Dayjs | null>(null);
const endDate = ref<Dayjs | null>(null);
const showFilters = ref(false);

/* แสดง tablet layout adjustments สำหรับ Galaxy Tab S7 */
const isTabletLayout = computed(() => isTablet.value);

const filters = reactive<{
  search: string;
  searchField: string;
  orderId: number | undefined;
  customerId: number | undefined;
  sort: 'ASC' | 'DESC' | undefined;
  customerName: string;
}>({
  search: '',
  searchField: 'orderCode',
  orderId: undefined,
  customerId: undefined,
  sort: undefined,
  customerName: '',
});

const orderOptions = ref<Order[]>([]);
const orderOptionsForFilter = ref<Order[]>([]);
const loadingOrders = ref(false);

// Customer filter variables
const customerOptions = ref<{ id: number; name: string }[]>([]);
const loadingCustomers = ref(false);
const selectedArrivalIds = ref<Set<number>>(new Set());
const createNotiConfirmVisible = ref(false);
const createNotiSubmitting = ref(false);
const createNotiLanguage = ref<'en' | 'th' | 'la'>('en');

const columns = computed<TableColumnsType>(() => [
  { title: '#', key: 'index', width: 60 },
  { title: t('merchant.arrivals.colOrder'), key: 'orderCode', dataIndex: 'orderId', width: 160 },
  { title: t('merchant.arrivals.colDate'), key: 'arrivedDate', dataIndex: 'arrivedDate', width: 140 },
  { title: t('merchant.arrivals.colTime'), key: 'arrivedTime', dataIndex: 'arrivedTime', width: 120 },
  { title: t('merchant.arrivals.colItems'), key: 'itemsCount', width: 100, align: 'center' as const },
  { title: t('merchant.arrivals.colNotes'), key: 'notes', dataIndex: 'notes', width: 200, ellipsis: true },
  { title: t('merchant.arrivals.colActions'), key: 'actions', fixed: 'right' as const, width: 100, align: 'right' as const },
]);

const columnsWithCheckbox = computed<TableColumnsType>(() => columns.value);

const showCreateNotiBar = computed(
  () => props.embedded && props.notificationFilter === false && selectedArrivalIds.value.size > 0,
);

const rowSelection = computed(() => {
  if (!props.embedded || props.notificationFilter !== false) return undefined;
  const selected = Array.from(selectedArrivalIds.value);
  return {
    selectedRowKeys: selected,
    onChange: (keys: (string | number)[]) => {
      selectedArrivalIds.value = new Set(keys as number[]);
    },
  };
});

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

/* ใช้เมื่อ uncomment customer name filter input
let customerNameTimer: ReturnType<typeof setTimeout> | undefined;
const onCustomerNameChange = () => {
  clearTimeout(customerNameTimer);
  customerNameTimer = setTimeout(() => {
    currentPage.value = 1;
    fetchArrivals();
  }, 450);
};
*/

const buildQuery = (): ArrivalListQueryDto => {
  const query: ArrivalListQueryDto = {
    page: currentPage.value,
    limit: pageSize.value,
    merchantId: authPayload.value?.merchantId,
  };
  if (filters.search?.trim()) query.search = filters.search.trim();
  if (filters.searchField) query.searchField = filters.searchField;
  if (filters.orderId) query.orderId = filters.orderId;
  if (filters.customerId) query.customerId = filters.customerId;
  if (filters.sort) query.sort = filters.sort;
  if (filters.customerName?.trim()) query.customerName = filters.customerName.trim();
  if (startDate.value) query.startDate = startDate.value.format('YYYY-MM-DD');
  if (endDate.value) query.endDate = endDate.value.format('YYYY-MM-DD');
  if (props.notificationFilter !== undefined) query.notification = props.notificationFilter;
  return query;
};

const fetchArrivals = async () => {
  loading.value = true;
  try {
    const res = await arrivalRepository.getListByMerchant(buildQuery());
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
    const [listRes, filterRes] = await Promise.all([
      orderRepository.getListByMerchant({
        limit: 200,
        merchantId: authPayload.value?.merchantId,
        arrivalStatus: 'NOT_ARRIVED',
      }),
      orderRepository.getListByMerchant({
        limit: 500,
        merchantId: authPayload.value?.merchantId,
      }),
    ]);
    orderOptions.value = listRes.results ?? [];
    orderOptionsForFilter.value = filterRes.results ?? [];
  } catch (err) {
    handleApiError(err, t);
  } finally {
    loadingOrders.value = false;
    // Load customers after orders are available
    fetchCustomers();
  }
};

const fetchCustomers = async () => {
  loadingCustomers.value = true;
  try {
    // Extract unique customers from existing orders
    const uniqueCustomers = new Map<number, string>();
    for (const order of orderOptionsForFilter.value) {
      const customerOrders = order.customerOrders ?? [];
      for (const customerOrder of customerOrders) {
        if (customerOrder.customer && customerOrder.customer.id && customerOrder.customer.customerName) {
          uniqueCustomers.set(customerOrder.customer.id, customerOrder.customer.customerName);
        }
      }
    }
    customerOptions.value = Array.from(uniqueCustomers.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    handleApiError(err, t);
  } finally {
    loadingCustomers.value = false;
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

const buildNotisFromSelectedArrivals = (): CreateNotificationDto[] => {
  const map = new Map<number, number[]>();
  const selectedArrivals = arrivals.value.filter(a => selectedArrivalIds.value.has(a.id));
  for (const arrival of selectedArrivals) {
    const coList = arrival.order?.customerOrders ?? [];
    for (const co of coList) {
      const cid = co.customerId;
      if (!map.has(cid)) map.set(cid, []);
      if (!map.get(cid)!.includes(co.id)) map.get(cid)!.push(co.id);
    }
  }
  return Array.from(map.entries()).map(([customerId, customerOrderIds]) => ({
    customerId,
    customerOrderIds,
  }));
};

const openCreateNotiConfirm = () => {
  createNotiConfirmVisible.value = true;
};

const toggleShowFilters = () => {
  showFilters.value = !showFilters.value;
};

const toggleArrivalSelection = (id: number) => {
  const next = new Set(selectedArrivalIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  selectedArrivalIds.value = next;
};

const allArrivalsSelected = computed(() => {
  if (arrivals.value.length === 0) return false;
  return arrivals.value.every(a => selectedArrivalIds.value.has(a.id));
});
const someArrivalsSelected = computed(() => selectedArrivalIds.value.size > 0);
const toggleSelectAllArrivals = () => {
  if (allArrivalsSelected.value) {
    selectedArrivalIds.value = new Set();
  } else {
    selectedArrivalIds.value = new Set(arrivals.value.map(a => a.id));
  }
};

/** เปิดแท็บ WhatsApp สำหรับแต่ละ notification (เหมือน CreateMultipleArrivalsContent) */
const openWhatsAppTabsForNotifications = (notifications: CreateNotificationMultipleResponseItem[]) => {
  const valid = notifications.filter(
    n => n.recipientContact && isValidWhatsAppPhone(formatPhoneForWhatsApp(n.recipientContact)),
  );
  valid.forEach((n, i) => {
    setTimeout(() => {
      const raw = n.language;
      const lang: 'en' | 'th' | 'la' = raw === 'th' || raw === 'la' ? raw : 'en';
      const customerName = n.customer?.customerName ?? (lang === 'en' ? 'Customer' : lang === 'th' ? 'ลูกค้า' : 'ລູກຄ້າ');
      openWhatsAppChat({
        phone: n.recipientContact!,
        template: {
          customerName,
          orderNumbers: n.relatedOrders ?? undefined,
        },
        notificationLink: n.notificationLink ?? undefined,
        lang,
      });
    }, i * 250);
  });
};

const handleCreateNotifications = async () => {
  const notis = buildNotisFromSelectedArrivals();
  if (notis.length === 0) {
    message.warning(t('merchant.notifications.createNotiConfirmMessage', { count: 0 }));
    return;
  }
  createNotiSubmitting.value = true;
  try {
    const res = await notificationRepository.createMultiple({ notifications: notis, language: createNotiLanguage.value });
    message.success(t('merchant.notifications.createSuccess'));
    createNotiConfirmVisible.value = false;
    selectedArrivalIds.value = new Set();
    fetchArrivals();
    if (res && res.length > 0) {
      openWhatsAppTabsForNotifications(res);
    }
  } catch (err) {
    handleApiError(err, t);
  } finally {
    createNotiSubmitting.value = false;
  }
};

const goToCreateMultiple = () => {
  router.push('/merchant/arrivals/create-multiple');
};

defineExpose({
  showFilters,
  selectedArrivalIds,
  createNotiSubmitting,
  openCreateNotiConfirm,
  toggleShowFilters,
});

onMounted(() => {
  fetchArrivals();
  fetchOrders();
  fetchCustomers();
});

// โหลด orders และ customers สำหรับ filter
watch(showFilters, (visible) => {
  if (visible) {
    if (orderOptions.value.length === 0) fetchOrders();
    if (customerOptions.value.length === 0) fetchCustomers();
  }
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

.search-input { height: 44px; border-radius: 12px; width: min(200px, 100%); flex: 0 1 200px; }
.search-field-select { height: 44px; min-width: 140px; }
.search-field-select :deep(.ant-select-selector) { border-radius: 12px !important; height: 44px !important; }
.search-field-select :deep(.ant-select-selection-item) { line-height: 42px !important; }
.add-btn { height: 44px; border-radius: 12px; font-weight: 700; flex-shrink: 0; }

.filter-toggle-btn {
  height: 44px; width: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; font-size: 18px;
}
.filter-toggle-btn.active {
  background: #1677ff; color: #fff; border-color: #1677ff;
}
.filter-toggle-btn--header {
  flex-shrink: 0;
}

@media (max-width: 767px) {
  .page-header { flex-wrap: wrap; }
  .title-block { order: 1; flex: 1 1 auto; }
  .filter-toggle-btn--header { order: 2; }
  .add-btn { order: 3; flex-shrink: 0; height: 36px; font-size: 12px; padding: 0 10px; }
  .search-field-select { order: 4; flex: 1 1 100%; width: 100%; }
  .search-input { order: 5; flex: 1 1 100%; width: 100%; }
  .page-title { font-size: 15px; }
  .page-subtitle { display: none; }
}

/* ===== Filter Wrapper ===== */
.filter-wrapper { display: flex; flex-direction: column; gap: 10px; }
.filter-wrapper .mb-4 { margin-bottom: 0; }

/* ===== Filter Card Row 1 ===== */
.filter-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}
.filter-card--single :deep(.ant-card-body) { padding: 12px 16px !important; }
.filter-bar {
  display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
}
.filter-bar--single { flex-wrap: wrap; }
/* แถว 1: ทุก filter ขนาดเท่ากันและกว้างขึ้น */
.filter-date-single { border-radius: 10px; min-width: 180px; width: 180px; flex-shrink: 0; height: 44px; }
.filter-date-single :deep(.ant-picker) {
  border-radius: 10px !important;
  height: 44px !important;
  min-height: 44px !important;
}
.filter-date-single :deep(.ant-picker-input) {
  height: 44px !important;
  min-height: 44px !important;
}
.filter-date-single :deep(.ant-picker-input > input) {
  height: 42px !important;
  line-height: 42px !important;
}
.filter-select {
  min-width: 180px; width: 180px; flex-shrink: 0;
  height: 44px;
  display: flex;
  align-items: center;
 
}
.filter-select :deep(.ant-select-selector) { border-radius: 10px !important; height: 44px !important; line-height: 42px !important; }
.filter-select--sort { min-width: 180px; width: 180px; }
.filter-select--customer { min-width: 200px; width: 200px; }

/* Search และ Customer — ความกว้างเท่ากัน แก้ white padding ที่บัง border */
.filter-input {
  height: 44px; border-radius: 10px;
  flex: 1 1 200px; min-width: 160px;
}
.filter-input--search,
.filter-input--customer {
  flex: 1 1 200px;
  min-width: 160px;
  max-width: none;
}
/* แก้แถบสีขาวที่บัง border บน-ล่าง — ใช้ border ชัดเจนและลบ padding ที่เกิน */
.filter-bar :deep(.ant-input-affix-wrapper) {
  border-radius: 10px !important;
  border: 1px solid #d9d9d9 !important;
  padding: 0 11px !important;
  padding-inline-start: 36px !important;
  height: 44px !important;
  box-sizing: border-box !important;
}
.filter-bar :deep(.ant-input-affix-wrapper:hover) {
  border-color: #4096ff !important;
}
.filter-bar :deep(.ant-input-affix-wrapper .ant-input) {
  padding: 0 !important;
  height: 42px !important;
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}
.filter-toggle-btn--inline {
  height: 44px; width: 44px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; font-size: 18px;
}
.filter-toggle-btn--inline.active {
  background: #1677ff; color: #fff; border-color: #1677ff;
}

/* Animation สำหรับ filter panel (mobile) */
.filter-panel-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.filter-panel-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.filter-panel-enter-from,
.filter-panel-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.filter-panel-enter-to,
.filter-panel-leave-from {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 767px) {
  .filter-card--single { border-radius: 10px; }
  .filter-card--single :deep(.ant-card-body) { padding: 12px !important; }
  .filter-bar--single { flex-direction: column; }
  .filter-date-single,
  .filter-select,
  .filter-select--customer { min-width: 100%; width: 100%; }
  .filter-input--search,
  .filter-input--customer { min-width: 100%; flex: 1 1 100%; }
}

/* Tablet (Galaxy Tab S7 ~800px) — filter แสดง 2 คอลัมน์ */
@media (min-width: 768px) and (max-width: 1024px) {
  .filter-bar--single { flex-wrap: wrap; gap: 8px; }
  .filter-date-single,
  .filter-select,
  .filter-select--customer { min-width: 140px; flex: 1 1 140px; }
  .filter-input--search,
  .filter-input--customer { min-width: 120px; flex: 1 1 160px; }
  .page-header { flex-wrap: wrap; gap: 8px; }
  .add-btn { height: 40px; font-size: 13px; }
  .filter-toggle-btn { height: 40px; width: 40px; }
}

.filter-slide-enter-active,
.filter-slide-leave-active { transition: all 0.25s ease; }
.filter-slide-enter-from,
.filter-slide-leave-to { opacity: 0; transform: translateY(-8px); }

/* ===== Create Noti bar ===== */
.create-noti-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 16px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
}
.create-noti-count {
  font-weight: 600;
  color: #1d4ed8;
}

/* ===== Create Noti Modal ===== */
.create-noti-modal-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.create-noti-modal-message {
  margin: 0;
  color: #334155;
}
.create-noti-language-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.create-noti-language-label {
  font-weight: 500;
  color: #334155;
}
.create-noti-language-options {
  flex: 1;
  min-width: 200px;
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
.count-tag-inline {
  margin-top: 6px;
  display: inline-block;
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
:deep(.ant-table-tbody > tr:hover > td:not(.ant-table-cell-fix-right)) {
  background: rgba(24, 144, 255, 0.06) !important;
}

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

/* ===== Embedded mobile toolbar ===== */
.embedded-mobile-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.embedded-mobile-toolbar .filter-toggle-btn {
  height: 40px;
  width: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
.embedded-mobile-toolbar .filter-toggle-btn.active {
  background: #1677ff;
  color: #fff;
  border-color: #1677ff;
}

/* ===== Mobile card list ===== */
.arrivals-mobile { display: flex; flex-direction: column; gap: 12px; }

.arrival-checkbox {
  flex-shrink: 0;
  margin-right: 8px;
}
.arrival-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
}
.arrival-time {
  color: #0ea5e9;
  font-weight: 500;
}

.mobile-select-all-row {
  padding: 12px 16px;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}
.mobile-select-all-row :deep(.ant-checkbox-wrapper) {
  font-weight: 600;
  color: #334155;
}

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

.card-row { display: flex; align-items: center; gap: 12px; padding-right: 12px; }
.arrival-info .count-tag-inline { margin-right: 0; }
.detail-val.notes-truncate {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}

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
.item-product-name {
  font-weight: 700; color: #0f172a; font-size: 14px;
  margin-bottom: 10px; padding-bottom: 8px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
}
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
