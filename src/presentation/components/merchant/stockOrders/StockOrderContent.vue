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
      @edit="openRateModal"
    />

    <!-- Items Section -->
    <a-card :bordered="false" class="panel-card mb-4" data-testid="items-section">
      <div class="panel-header-row">
        <div class="panel-title" style="margin-bottom:0">
          <ShoppingOutlined class="icon-blue" />
          <span>{{ $t('merchant.orders.items.title') }}</span>
        </div>
        <a-button type="primary" class="add-btn" data-testid="add-item-btn" @click="addItem">
          <template #icon><PlusOutlined /></template>
          {{ $t('merchant.orders.items.addItem') }}
        </a-button>
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
          @remove="removeItem"
          @clear-error="(field: string) => clearFieldError(`items.${idx}.${field}`)"
        />
      </template>
      <template v-else-if="items.length > 0">
        <div ref="itemScrollRef" class="swipe-container" @scroll="onItemScroll">
          <div v-for="(item, idx) in items" :key="item.uid" class="swipe-slide">
            <OrderItemForm
              :item="item" :index="idx" :is-mobile="true"
              :buy-base-ccy="buyBaseCcy" :buy-target-ccy="buyTargetCcy"
              :sell-base-ccy="sellBaseCcy" :sell-target-ccy="sellTargetCcy"
              :get-buy-rate="getBuyRate" :get-sell-rate="getSellRate"
              :errors="getItemErrors(idx)"
              @remove="removeItem"
              @clear-error="(field: string) => clearFieldError(`items.${idx}.${field}`)"
            />
          </div>
        </div>
        <div class="swipe-nav">
          <button class="swipe-nav-btn" :disabled="activeItemIdx === 0" @click="scrollToItem(activeItemIdx - 1)"><LeftOutlined /></button>
          <span class="swipe-nav-label">{{ $t('merchant.orders.items.indicator', { current: activeItemIdx + 1, total: items.length }) }}</span>
          <button class="swipe-nav-btn" :disabled="activeItemIdx >= items.length - 1" @click="scrollToItem(activeItemIdx + 1)"><RightOutlined /></button>
        </div>
      </template>
    </a-card>

    <!-- Customer Orders Section -->
    <a-card :bordered="false" class="panel-card mb-4" data-testid="customers-section">
      <div class="panel-header-row">
        <div class="panel-title" style="margin-bottom:0">
          <TeamOutlined class="icon-blue" />
          <span>{{ $t('merchant.orders.customerOrders.title') }}</span>
        </div>
        <a-button type="primary" class="add-btn" data-testid="add-customer-btn" @click="addCustomerOrder">
          <template #icon><PlusOutlined /></template>
          {{ $t('merchant.orders.customerOrders.addCustomer') }}
        </a-button>
      </div>
      <a-empty v-if="customerOrders.length === 0" :description="$t('merchant.orders.customerOrders.noCustomers')" />
      <template v-if="!isMobile">
        <CustomerOrderBlock
          v-for="(co, coIdx) in customerOrders" :key="co.uid"
          :co="co" :index="coIdx" :items="items" :is-mobile="false"
          :sell-base-ccy="sellBaseCcy" :customer-options="customerOptions"
          :customer-searching="customerSearching"
          :get-max-qty="getMaxQtyForCoItem" :get-co-item-total="coItemTotal"
          :error="getCustomerError(coIdx)"
          :items-error="fieldErrors[`customerOrders.${coIdx}.items`]"
          @remove="removeCustomerOrder"
          @add-item="addCoItem"
          @remove-item="removeCoItem"
          @select-change="onCoItemSelectChange"
          @qty-change="onCoItemQtyChange"
          @customer-search="onCustomerSearch"
          @customer-focus="onCustomerFocus"
          @create-customer="goCreateCustomer"
          @clear-error="clearCustomerError(coIdx)"
          @clear-items-error="clearFieldError(`customerOrders.${coIdx}.items`)"
        />
      </template>
      <template v-else-if="customerOrders.length > 0">
        <div ref="coScrollRef" class="swipe-container" @scroll="onCoScroll">
          <div v-for="(co, coIdx) in customerOrders" :key="co.uid" class="swipe-slide">
            <CustomerOrderBlock
              :co="co" :index="coIdx" :items="items" :is-mobile="true"
              :sell-base-ccy="sellBaseCcy" :customer-options="customerOptions"
              :customer-searching="customerSearching"
              :get-max-qty="getMaxQtyForCoItem" :get-co-item-total="coItemTotal"
              :error="getCustomerError(coIdx)"
              :items-error="fieldErrors[`customerOrders.${coIdx}.items`]"
              @remove="removeCustomerOrder"
              @add-item="addCoItem"
              @remove-item="removeCoItem"
              @select-change="onCoItemSelectChange"
              @qty-change="onCoItemQtyChange"
              @customer-search="onCustomerSearch"
              @customer-focus="onCustomerFocus"
              @create-customer="goCreateCustomer"
              @clear-error="clearCustomerError(coIdx)"
              @clear-items-error="clearFieldError(`customerOrders.${coIdx}.items`)"
            />
          </div>
        </div>
        <div class="swipe-nav">
          <button class="swipe-nav-btn" :disabled="activeCoIdx === 0" @click="scrollToCo(activeCoIdx - 1)"><LeftOutlined /></button>
          <span class="swipe-nav-label">{{ $t('merchant.orders.customerOrders.indicator', { current: activeCoIdx + 1, total: customerOrders.length }) }}</span>
          <button class="swipe-nav-btn" :disabled="activeCoIdx >= customerOrders.length - 1" @click="scrollToCo(activeCoIdx + 1)"><RightOutlined /></button>
        </div>
      </template>
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
import { computed, onMounted } from 'vue';
import {
  ShoppingOutlined, TeamOutlined, PlusOutlined, SaveOutlined,
  LeftOutlined, RightOutlined,
} from '@ant-design/icons-vue';
import { useIsMobile } from '@/shared/composables/useIsMobile';

import OrderCodeCard from './components/OrderCodeCard.vue';
import ExchangeRateCard from './components/ExchangeRateCard.vue';
import OrderItemForm from './components/OrderItemForm.vue';
import CustomerOrderBlock from './components/CustomerOrderBlock.vue';
import OrderSummaryCard from './components/OrderSummaryCard.vue';

import { useExchangeRates } from './composables/useExchangeRates';
import { useItemCalculations } from './composables/useItemCalculations';
import { useOrderItems } from './composables/useOrderItems';
import { useCustomerOrders } from './composables/useCustomerOrders';
import { useDraftStorage } from './composables/useDraftStorage';
import { useOrderSubmit } from './composables/useOrderSubmit';
import type { CustomerOrderForm } from './types';

import { ref } from 'vue';

const emit = defineEmits<{ (e: 'openRateModal'): void }>();
const openRateModal = () => emit('openRateModal');

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

const customerOrders = ref<CustomerOrderForm[]>([]);

const { saveDraft, restoreDraft, clearDraft } = useDraftStorage(orderCode, items, customerOrders);

const {
  customerOptions, customerSearching,
  activeCoIdx, coScrollRef, onCoScroll, scrollToCo,
  addCustomerOrder, removeCustomerOrder,
  addCoItem, removeCoItem, onCoItemSelectChange, coItemTotal,
  getMaxQtyForCoItem, onCoItemQtyChange,
  onCustomerSearch, onCustomerFocus, fetchCustomers,
  goCreateCustomer, handleNewCustomerReturn,
} = useCustomerOrders(items, customerOrders, isMobile, saveDraft);

const { submitting, fieldErrors, clearFieldError, handleSubmit } = useOrderSubmit(orderCode, items, customerOrders, clearDraft);

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

const getCustomerError = (coIdx: number): string | undefined => {
  return fieldErrors.value[`customerOrders.${coIdx}.customerId`]
    || (coIdx === 0 ? fieldErrors.value['customerOrders'] : undefined);
};

const clearCustomerError = (coIdx: number) => {
  clearFieldError(`customerOrders.${coIdx}.customerId`);
  clearFieldError('customerOrders');
};

const summaryPurchaseTotalForeign = computed(() =>
  items.value.reduce((sum, item) => sum + calc.calcNetCostForeign(item), 0));
const summaryPurchaseTotalLak = computed(() =>
  items.value.reduce((sum, item) => sum + calc.calcNetCostLak(item), 0));
const summarySellingTotalForeign = computed(() =>
  items.value.reduce((sum, item) => sum + calc.calcSellingTotalForeign(item), 0));
const summarySellingTotalLak = computed(() =>
  items.value.reduce((sum, item) => sum + calc.calcSellingTotalLak(item), 0));
const summaryNetCostLak = summaryPurchaseTotalLak; // Alias for clarity
const summaryProfitLak = computed(() => summarySellingTotalLak.value - summaryNetCostLak.value);
const summaryProfitForeign = computed(() => {
  const rate = getSellRate();
  return rate === 0 ? 0 : summaryProfitLak.value / rate;
});

const refreshRates = () => fetchTodayRates();
defineExpose({ refreshRates });

onMounted(async () => {
  restoreDraft();
  if (items.value.length === 0) addItem();
  if (customerOrders.value.length === 0) addCustomerOrder();
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
.submit-area { display: flex; justify-content: flex-end; margin-top: 8px; margin-bottom: 20px; }
.submit-btn { height: 48px; border-radius: 14px; font-weight: 900; min-width: 200px; }

/* Swipe navigation (mobile) */
.swipe-container {
  display: flex; overflow-x: auto; scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch; gap: 0; scrollbar-width: none;
}
.swipe-container::-webkit-scrollbar { display: none; }
.swipe-slide { flex: 0 0 100%; scroll-snap-align: start; min-width: 0; }
.swipe-slide :deep(.item-block),
.swipe-slide :deep(.co-block) { margin-bottom: 0; }
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

@media (max-width: 767px) {
  .page-title { font-size: 16px; }
  .page-subtitle { font-size: 12px; }
  .panel-card { border-radius: 10px; }
  .panel-card :deep(.ant-card-body) { padding: 12px !important; }
  .submit-area { justify-content: stretch; }
  .submit-btn { width: 100%; }
}
</style>
