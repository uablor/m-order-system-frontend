<template>
  <div class="customer-root">

    <!-- ========== DESKTOP: two-column grid ========== -->
    <div class="desktop-layout">

      <!-- LEFT PANEL: header + list -->
      <div class="left-panel">
        <CustomerAppHeader
          :store-name="storeName"
          :customer-initial="customerInitial"
          @open-filter="orderListRef?.openFilterModal?.()"
        />
        <CustomerOrderList
          ref="orderListRef"
          :orders="filteredOrders"
          :summary="summary"
          :pagination="displayPagination"
          :filters="filters"
          :selected-order-id="selectedOrder?.id ?? null"
          :loading="loading"
          :error-msg="errorMsg"
          :customer-first-name="customerFirstName"
          @select="onSelectOrder"
          @page-change="onPageChange"
          @filter-change="onFilterChange"
        />
      </div>

      <!-- RIGHT PANEL: detail or placeholder (desktop only) -->
      <div class="right-panel">
        <Transition name="fade">
          <div v-if="!selectedOrder" class="detail-placeholder">
            <div class="placeholder-icon"><InboxOutlined /></div>
            <div class="placeholder-text">{{ $t('customer.sectionTitle') }}</div>
            <div class="placeholder-hint">{{ $t('customer.greetingSub') }}</div>
          </div>
        </Transition>

        <CustomerOrderDetail
          v-if="!isMobile"
          :order="selectedOrder"
          :customer-token="customerToken"
          :is-mobile="false"
          @submitted="onSubmitted"
        />
      </div>

    </div>

    <!-- MOBILE: detail rendered via Teleport inside CustomerOrderDetail -->
    <CustomerOrderDetail
      v-if="isMobile"
      :order="selectedOrder"
      :customer-token="customerToken"
      :is-mobile="true"
      @close="selectedOrder = null"
      @submitted="onSubmitted"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/store/auth.store';
import { storeToRefs } from 'pinia';
import { useIsMobile } from '@/shared/composables/useIsMobile';
import { InboxOutlined } from '@ant-design/icons-vue';
import {
  customerOrderRepository,
  type CustomerOrder,
  type CustomerOrderSummaryItem,
} from '@/infrastructure/repositories/customer-order.repository';
import CustomerAppHeader from './partials/CustomerAppHeader.vue';
import CustomerOrderList from './partials/CustomerOrderList.vue';
import type { CustomerOrderFilters } from '@/infrastructure/repositories/customer-order.repository';
import CustomerOrderDetail from './partials/CustomerOrderDetail.vue';

const route = useRoute();
const orderListRef = ref<InstanceType<typeof CustomerOrderList> | null>(null);
const { isMobile } = useIsMobile();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

/* --- User info --- */
const customerFirstName = computed(() => {
  const full = user.value?.fullName || '';
  return full.split(' ')[0] || 'Customer';
});
const customerInitial = computed(() => (user.value?.fullName || 'C').charAt(0).toUpperCase());

/* --- Store name: use first order's customerName or default --- */
const storeName = computed(() => {
  const first = orders.value?.[0];
  return first?.customerName || 'Luxe Boutique';
});

/* --- State --- */
const orders = ref<CustomerOrder[]>([]);
const summary = ref<CustomerOrderSummaryItem[]>([]);
const selectedOrder = ref<CustomerOrder | null>(null);
const loading = ref(false);
const errorMsg = ref('');
const page = ref(1);
const limit = ref(100); // ดึงข้อมูลจำนวนมากเพื่อ filter order code บน frontend ได้
const pagination = ref({
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
});
const filters = ref<CustomerOrderFilters>({});

/* --- Filter order code บน frontend (ไม่เรียก API ใหม่) --- */
const filteredOrders = computed(() => {
  const list = orders.value || [];
  const searchVal = filters.value.orderCode?.trim();
  if (!searchVal) return list;
  const lower = searchVal.toLowerCase();
  return list.filter((o) => {
    const code = (o.orderCode ?? String(o.id)).toLowerCase();
    return code.includes(lower);
  });
});

/* --- Pagination สำหรับแสดงผล: เมื่อมี filter ใช้ข้อมูล filtered --- */
const displayPagination = computed(() => {
  const base = pagination.value || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };
  const hasFilter = !!filters.value.orderCode?.trim();
  if (!hasFilter) return base;
  const total = filteredOrders.value?.length || 0;
  return {
    ...base,
    total,
    page: 1,
    limit: total || 1,
    totalPages: total > 0 ? 1 : 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };
});

/* --- อ่าน token จาก URL: ?customerToken=xxx&notificationToken=xxx (จาก notification link) --- */
const customerToken = computed(
  () => (route.query.customerToken as string) || (route.query.token as string) || ''
);
const notificationToken = computed(() => (route.query.notificationToken as string) || '');

/* --- Fetch orders + summary (ไม่ส่ง orderCode — filter ทำที่ frontend) --- */
const fetchOrders = async (pageNum?: number, limitNum?: number) => {
  const ct = customerToken.value;
  if (!ct) {
    errorMsg.value = 'No customer token provided in URL.';
    return;
  }
  const p = pageNum ?? page.value;
  const l = limitNum ?? limit.value;
  loading.value = true;
  errorMsg.value = '';
  try {
    const query: Record<string, unknown> = { page: p, limit: l };

    const [ordersRes, summaryRes] = await Promise.all([
      customerOrderRepository.getByToken(
        { customerToken: ct, notificationToken: notificationToken.value || undefined },
        query as any,
      ),
      customerOrderRepository.getSummaryByToken({
        customerToken: ct,
        notificationToken: notificationToken.value || undefined,
      }),
    ]);
    const rawOrders = ordersRes.results ?? [];
    orders.value = rawOrders;
    summary.value = summaryRes ?? [];
    if (ordersRes.pagination) {
      pagination.value = ordersRes.pagination;
      page.value = ordersRes.pagination.page;
      limit.value = ordersRes.pagination.limit;
    } else {
      // Fallback: ถ้า backend ไม่ส่ง pagination ให้ derive จาก results
      const total = orders.value.length;
      pagination.value = {
        total,
        page: p,
        limit: l,
        totalPages: Math.max(1, Math.ceil(total / l)),
        hasNextPage: p * l < total,
        hasPreviousPage: p > 1,
      };
    }
    if (!isMobile.value && orders.value.length > 0 && !selectedOrder.value) {
      selectedOrder.value = orders.value[0] ?? null;
    }
  } catch (error: any) {
    console.error('Failed to fetch customer orders:', error);
    
    // Check for specific database errors
    if (error?.message?.includes('Unknown column') || error?.message?.includes('image_id')) {
      errorMsg.value = 'Database is being updated. Please try again in a few minutes.';
      // Auto-retry after 3 seconds
      setTimeout(() => {
        if (errorMsg.value.includes('Database is being updated')) {
          fetchOrders(); // Retry automatically
        }
      }, 3000);
    } else if (error?.response?.status === 500) {
      errorMsg.value = 'Server is temporarily unavailable. Please try again later.';
    } else if (error?.response?.status === 404) {
      errorMsg.value = 'Orders not found. Please check your token.';
    } else {
      errorMsg.value = 'Failed to load orders. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};

/* --- Select an order: refresh detail from API --- */
const onSelectOrder = async (order: CustomerOrder) => {
  filters.value = {}; // เคลียร์ filter เพื่อแสดงรายการทั้งหมด
  selectedOrder.value = order;
  try {
    const fresh = await customerOrderRepository.getById(order.id);
    if (fresh) selectedOrder.value = fresh;
  } catch {
    /* use stale data */
  }
};

/* --- After payment submitted: re-fetch list --- */
const onSubmitted = async () => {
  selectedOrder.value = null;
  await fetchOrders();
};

const onPageChange = (newPage: number, newLimit?: number) => {
  // เมื่อมี filter order code อยู่ ไม่ refetch (แสดงผล filtered บน frontend)
  if (filters.value.orderCode?.trim()) return;
  page.value = newPage;
  if (newLimit != null) limit.value = newLimit;
  fetchOrders(newPage, newLimit ?? limit.value);
};

const onFilterChange = (newFilters: CustomerOrderFilters) => {
  filters.value = newFilters;
};

onMounted(() => fetchOrders());
</script>

<style scoped>
.customer-root {
  min-height: 100vh;
  background: #f0f4f8;
  font-family: 'Noto Sans Lao', 'Noto Sans', 'Noto Sans Thai', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* ===== DESKTOP TWO-COLUMN LAYOUT ===== */
.desktop-layout {
  display: grid;
  grid-template-columns: 1fr;
  width: 100%;
  min-height: 100vh;
}

@media (min-width: 768px) {
  .desktop-layout {
    grid-template-columns: 380px 1fr;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
}

@media (min-width: 1200px) {
  .desktop-layout {
    grid-template-columns: 440px 1fr;
  }
}

/* ===== LEFT PANEL ===== */
.left-panel {
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e2e8f0;
}

@media (min-width: 768px) {
  .left-panel {
    height: 100vh;
    overflow: hidden;
  }
}

/* ===== RIGHT PANEL ===== */
.right-panel {
  background: #f8fafc;
  position: relative;
  overflow: hidden;
  display: none;
}

@media (min-width: 768px) {
  .right-panel {
    display: block;
    height: 100vh;
    overflow-y: auto;
  }
}

/* Placeholder */
.detail-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
  color: #94a3b8;
}
.placeholder-icon { font-size: 56px; margin-bottom: 16px; opacity: 0.35; }
.placeholder-text { font-size: 17px; font-weight: 700; color: #64748b; margin-bottom: 6px; }
.placeholder-hint { font-size: 13px; color: #94a3b8; max-width: 240px; }

/* Transitions */
.fade-enter-active { transition: opacity 0.22s ease, transform 0.22s ease; }
.fade-leave-active { transition: opacity 0.16s ease; }
.fade-enter-from { opacity: 0; transform: translateY(10px); }
.fade-leave-to { opacity: 0; }
</style>
