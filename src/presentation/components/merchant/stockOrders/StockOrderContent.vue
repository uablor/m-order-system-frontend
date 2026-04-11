<template>
  <div class="stock-order-page">
    <a-breadcrumb class="mb-3">
      <a-breadcrumb-item>{{ $t('merchant.breadcrumbs.home') }}</a-breadcrumb-item>
      <a-breadcrumb-item>{{ $t('merchant.orders.breadcrumb') }}</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="page-head">
      <div class="head-left">
        <div class="page-title">{{ $t('merchant.orders.title') }}</div>
        <div class="page-subtitle">{{ $t('merchant.orders.subtitle') }}</div>
      </div>
    </div>

    <OrderCodeCard
      v-model="orderCode"
      :error="fieldErrors.orderCode"
      @clear-error="clearFieldError('orderCode')"
    />

    <ExchangeRateCard
      :buy-rate-display="buyRateDisplay"
      :sell-rate-display="sellRateDisplay"
      :buy-rate="getBuyRate()"
      :sell-rate="getSellRate()"
      :buy-base-currency="buyBaseCcy"
      :buy-target-currency="buyTargetCcy"
      :sell-base-currency="sellBaseCcy"
      :sell-target-currency="sellTargetCcy"
      @edit="openRateModal"
    />

    <!-- Items Section (each item includes its own customer list) -->
    <a-card :bordered="false" class="panel-card mb-4" data-testid="items-section">
      <div class="panel-header-row">
        <div class="panel-title" style="margin-bottom:0">
          <ShoppingOutlined class="icon-blue" />
          <span>{{ $t('merchant.orders.items.title') }}</span>
        </div>
      </div>
      <a-empty v-if="items.length === 0" :description="$t('merchant.orders.items.noItems')" />
      <template v-if="!isMobile">
        <OrderItemForm
          v-for="(item, idx) in items" :key="item.uid"
          :item="item" :index="idx" :is-mobile="false"
          :buy-base-ccy="buyBaseCcy" :buy-target-ccy="buyTargetCcy"
          :sell-base-ccy="sellBaseCcy" :sell-target-ccy="sellTargetCcy"
          :get-buy-rate="getBuyRate" :get-sell-rate="getSellRate"
          :errors="getItemErrors(idx)"
          :customer-options="customerOptions"
          :customer-searching="customerSearching"
          @remove="removeItem"
          @clear-error="(field: string) => clearFieldError(`items.${idx}.${field}`)"
          @customer-search="onCustomerSearch"
          @customer-focus="onCustomerFocus"
          @create-customer="goCreateCustomer"
        />
      </template>
      <template v-else-if="items.length > 0">
        <div ref="itemScrollRef" class="swipe-container" @scroll="onItemScrollWithSave">
          <div v-for="(item, idx) in items" :key="item.uid" class="swipe-slide">
            <OrderItemForm
              :item="item" :index="idx" :is-mobile="true"
              :buy-base-ccy="buyBaseCcy" :buy-target-ccy="buyTargetCcy"
              :sell-base-ccy="sellBaseCcy" :sell-target-ccy="sellTargetCcy"
              :get-buy-rate="getBuyRate" :get-sell-rate="getSellRate"
              :errors="getItemErrors(idx)"
              :customer-options="customerOptions"
              :customer-searching="customerSearching"
              @remove="removeItem"
              @clear-error="(field: string) => clearFieldError(`items.${idx}.${field}`)"
              @customer-search="onCustomerSearch"
              @customer-focus="onCustomerFocus"
              @create-customer="goCreateCustomer"
            />
          </div>
        </div>
        <div class="swipe-nav">
          <button class="swipe-nav-btn" :disabled="activeItemIdx === 0" @click="scrollToItem(activeItemIdx - 1)"><LeftOutlined /></button>
          <span class="swipe-nav-label">{{ $t('merchant.orders.items.indicator', { current: activeItemIdx + 1, total: items.length }) }}</span>
          <button class="swipe-nav-btn" :disabled="activeItemIdx >= items.length - 1" @click="scrollToItem(activeItemIdx + 1)"><RightOutlined /></button>
        </div>
      </template>
      <!-- ปุ่ม Add Item อยู่ใต้รายการ -->
      <a-button type="dashed" block class="add-item-btn" data-testid="add-item-btn" @click="addItem">
        <template #icon><PlusOutlined /></template>
        {{ $t('merchant.orders.items.addItem') }}
      </a-button>
    </a-card>

    <OrderSummaryCard
      :visible="items.length > 0"
      :is-mobile="isMobile"
      :buy-base-ccy="buyBaseCcy" :buy-target-ccy="buyTargetCcy"
      :sell-base-ccy="sellBaseCcy" :sell-target-ccy="sellTargetCcy"
      :purchase-total-foreign="summaryPurchaseTotalForeign"
      :purchase-total-lak="summaryPurchaseTotalLak"
      :selling-total-foreign="summarySellingTotalForeign"
      :selling-total-lak="summarySellingTotalLak"
      :profit-foreign="summaryProfitForeign"
      :profit-lak="summaryProfitLak"
    />

    <!-- Submit -->
    <div class="submit-area">
      <a-button type="primary" size="large" class="submit-btn" :loading="submitting" data-testid="create-order-btn" @click="handleSubmit">
        <template #icon><SaveOutlined /></template>
        {{ $t('merchant.orders.buttons.createOrder') }}
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  ShoppingOutlined, PlusOutlined, SaveOutlined,
  LeftOutlined, RightOutlined,
} from '@ant-design/icons-vue';
import { useIsMobile } from '@/shared/composables/useIsMobile';

import OrderCodeCard from './components/OrderCodeCard.vue';
import ExchangeRateCard from './components/ExchangeRateCard.vue';
import OrderItemForm from './components/OrderItemForm.vue';
import OrderSummaryCard from './components/OrderSummaryCard.vue';

import { useExchangeRates } from './composables/useExchangeRates';
import { useItemCalculations } from './composables/useItemCalculations';
import { useOrderItems } from './composables/useOrderItems';
import { useItemCustomers } from './composables/useItemCustomers';
import { useDraftStorage } from './composables/useDraftStorage';
import { useOrderSubmit } from './composables/useOrderSubmit';

const emit = defineEmits<{ 
  (e: 'openRateModal', data: {
    buy: { baseCurrency: string; targetCurrency: string; rate: number | undefined };
    sell: { baseCurrency: string; targetCurrency: string; rate: number | undefined };
  }): void 
}>();

const openRateModal = (data: {
  buy: { baseCurrency: string; targetCurrency: string; rate: number | undefined };
  sell: { baseCurrency: string; targetCurrency: string; rate: number | undefined };
}) => {
  emit('openRateModal', data);
};

onMounted(() => {
  // Restore from simple localStorage key
  const saved = localStorage.getItem('stock_order_active_item');
  if (saved) {
    const context = JSON.parse(saved);
    const itemIndex = context.itemIndex;
    if (itemIndex >= 0 && items.value[itemIndex]) {
      // Navigate to the saved SKU item
      setTimeout(() => {
        scrollToItem(itemIndex);
      }, 100);
    }
  }
});

// Save current item index to localStorage when scrolling
const onItemScrollWithSave = () => {
  onItemScroll();
  // Save current active item index to localStorage
  localStorage.setItem('stock_order_active_item', JSON.stringify({
    itemIndex: activeItemIdx.value,
    timestamp: Date.now()
  }));
};

const { isMobile } = useIsMobile();
const orderCode = ref('');

const {
  buyRateDisplay, sellRateDisplay,
  buyBaseCcy, buyTargetCcy, sellBaseCcy, sellTargetCcy,
  getBuyRate, getSellRate, fetchTodayRates,
} = useExchangeRates();

const calc = useItemCalculations(getBuyRate, getSellRate);

const {
  items, activeItemIdx, itemScrollRef,
  onItemScroll, scrollToItem, addItem, removeItem,
} = useOrderItems(isMobile);

// Silence unused template refs
void itemScrollRef;

const { saveDraft, restoreDraft, clearDraft, clearOrderCode } = useDraftStorage(orderCode, items);

const {
  customerOptions, customerSearching,
  onCustomerSearch, onCustomerFocus, fetchCustomers,
  goCreateCustomer, handleNewCustomerReturn,
} = useItemCustomers(items, saveDraft);

const { submitting, fieldErrors, clearFieldError, handleSubmit } = useOrderSubmit(orderCode, items, () => {
    clearDraft();
    clearOrderCode(); // Also clear the order code after successful submission
  });

const getItemErrors = (idx: number): Record<string, string> => {
  const prefix = `items.${idx}.`;
  const result: Record<string, string> = {};
  for (const key of Object.keys(fieldErrors.value)) {
    if (key.startsWith(prefix)) {
      result[key.slice(prefix.length)] = fieldErrors.value[key]!;
    }
  }
  return result;
};

const summaryPurchaseTotalForeign = computed(() =>
  items.value.reduce((sum, item) => sum + calc.calcNetCostForeignWithVariants(item), 0));
const summaryPurchaseTotalLak = computed(() =>
  items.value.reduce((sum, item) => sum + calc.calcNetCostLakWithVariants(item), 0));
const summarySellingTotalForeign = computed(() =>
  items.value.reduce((sum, item) => sum + calc.calcSellingTotalForeignWithVariants(item), 0));
const summarySellingTotalLak = computed(() =>
  items.value.reduce((sum, item) => sum + calc.calcSellingTotalLakWithVariants(item), 0));
const summaryNetCostLak = summaryPurchaseTotalLak;
const summaryProfitLak = computed(() => summarySellingTotalLak.value - summaryNetCostLak.value);
const summaryProfitForeign = computed(() => {
  const rate = getSellRate();
  return rate === 0 ? 0 : summaryProfitLak.value / rate;
});

const refreshRates = () => fetchTodayRates();
defineExpose({ refreshRates });

onMounted(async () => {
  // Use intelligent draft restoration - only restore if there's meaningful data
  restoreDraft();
  if (items.value.length === 0) addItem();
  fetchTodayRates();
  await fetchCustomers('');
  handleNewCustomerReturn();
});
</script>

<style scoped>
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.page-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.head-left { flex: 1; min-width: 0; }
.page-title { font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.25; }
.page-subtitle { font-size: 13px; color: #64748b; margin-top: 2px; }
.panel-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}
.panel-header-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.panel-title { font-size: 16px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.icon-blue { color: #1d4ed8; font-size: 18px; }
.add-btn { border-radius: 12px; font-weight: 700; }
.add-item-btn {
  margin-top: 12px; border-radius: 12px; font-weight: 700;
  border-color: #1d4ed8; color: #1d4ed8; height: 42px;
}
.add-item-btn:hover { background: #eff6ff !important; border-color: #1d4ed8 !important; color: #1d4ed8 !important; }
.submit-area { display: flex; justify-content: flex-end; margin-top: 8px; margin-bottom: 20px; }
.submit-btn { height: 48px; border-radius: 14px; font-weight: 900; min-width: 200px; }

/* Swipe navigation (mobile) */
.swipe-container {
  display: flex; overflow-x: auto; scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch; gap: 0; scrollbar-width: none;
}
.swipe-container::-webkit-scrollbar { display: none; }
.swipe-slide { flex: 0 0 100%; scroll-snap-align: start; min-width: 0; }
.swipe-slide :deep(.item-block) { margin-bottom: 0; }
.swipe-nav { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 12px; padding: 0 4px; }
.swipe-nav-btn {
  width: 36px; height: 36px; border-radius: 50%;
  border: 1.5px solid #cbd5e1; background: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; color: #1d4ed8; cursor: pointer;
  transition: all 0.15s ease; flex-shrink: 0;
}
.swipe-nav-btn:active:not(:disabled) { background: #eff6ff; transform: scale(0.92); }
.swipe-nav-btn:disabled { opacity: 0.3; cursor: default; color: #94a3b8; border-color: #e2e8f0; }
.swipe-nav-label { font-size: 13px; font-weight: 800; color: #1d4ed8; letter-spacing: 0.3px; white-space: nowrap; }

/* Tablet */
@media (min-width: 768px) and (max-width: 1024px) {
  .panel-card :deep(.ant-card-body) { padding: 14px !important; }
}

/* Mobile */
@media (max-width: 767px) {
  .page-title { font-size: 16px; }
  .page-subtitle { font-size: 12px; }
  .panel-card { border-radius: 10px; }
  .panel-card :deep(.ant-card-body) { padding: 12px !important; }
  .submit-area { justify-content: stretch; }
  .submit-btn { width: 100%; }
}
</style>
