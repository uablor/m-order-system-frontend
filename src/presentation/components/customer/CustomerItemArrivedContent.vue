<template>
  <div class="customer-root">

    <!-- ========== DESKTOP: two-column grid ========== -->
    <div class="desktop-layout">

      <!-- LEFT PANEL: header + list -->
      <div class="left-panel">
        <CustomerAppHeader
          :store-name="storeName"
          :customer-initial="customerInitial"
        />
        <CustomerOrderList
          :orders="orders"
          :selected-order-id="selectedOrder?.id ?? null"
          :loading="loading"
          :error-msg="errorMsg"
          :customer-first-name="customerFirstName"
          @select="onSelectOrder"
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
          :is-mobile="false"
          @submitted="onSubmitted"
        />
      </div>

    </div>

    <!-- MOBILE: detail rendered via Teleport inside CustomerOrderDetail -->
    <CustomerOrderDetail
      v-if="isMobile"
      :order="selectedOrder"
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
import { customerOrderRepository, type CustomerOrder } from '@/infrastructure/repositories/customer-order.repository';
import CustomerAppHeader from './partials/CustomerAppHeader.vue';
import CustomerOrderList from './partials/CustomerOrderList.vue';
import CustomerOrderDetail from './partials/CustomerOrderDetail.vue';

const route = useRoute();
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
  const first = orders.value[0];
  return first?.customerName || 'Luxe Boutique';
});

/* --- State --- */
const orders = ref<CustomerOrder[]>([]);
const selectedOrder = ref<CustomerOrder | null>(null);
const loading = ref(false);
const errorMsg = ref('');

/* --- Read token from URL query param: /customer/item-arrived?token=xxx --- */
const customerToken = computed(() => (route.query.token as string) || '');

/* --- Fetch orders by token --- */
const fetchOrders = async () => {
  const token = customerToken.value;
  if (!token) {
    errorMsg.value = 'No customer token provided in URL.';
    return;
  }
  loading.value = true;
  errorMsg.value = '';
  try {
    const res = await customerOrderRepository.getByToken(token, { limit: 50 });
    orders.value = res.results ?? [];
    if (!isMobile.value && orders.value.length > 0 && !selectedOrder.value) {
      selectedOrder.value = orders.value[0] ?? null;
    }
  } catch {
    errorMsg.value = 'Failed to load orders. Please try again.';
  } finally {
    loading.value = false;
  }
};

/* --- Select an order: refresh detail from API --- */
const onSelectOrder = async (order: CustomerOrder) => {
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

onMounted(fetchOrders);
</script>

<style scoped>
.customer-root {
  min-height: 100vh;
  background: #f0f4f8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
