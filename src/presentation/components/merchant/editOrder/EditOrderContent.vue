<template>
  <div class="stock-order-page">
    <a-breadcrumb class="mb-3">
      <a-breadcrumb-item>{{ $t('merchant.breadcrumbs.home') }}</a-breadcrumb-item>
      <a-breadcrumb-item>
        <router-link to="/merchant/orders">{{ $t('merchant.orderDetail.breadcrumbOrders') }}</router-link>
      </a-breadcrumb-item>
      <a-breadcrumb-item>ແກ້ໄຂ Order</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="page-head">
      <div class="head-left">
        <div class="page-title">ແກ້ໄຂ Order</div>
        <div class="page-subtitle">ແກ້ໄຂລາຍລະອຽດ Order ແລະ ລູກຄ້າ</div>
      </div>
    </div>

    <OrderCodeCard
      v-model="orderCode"
      :error="fieldErrors.orderCode"
      :shipping-price="shippingPrice"
      :shipping-currency="shippingCurrency"
      :buy-base-ccy="buyBaseCcy"
      :sell-base-ccy="sellBaseCcy"
      :buy-target-ccy="buyTargetCcy"
      :sell-target-ccy="sellTargetCcy"
      :shipping-converted="shippingConverted"
      @clear-error="clearFieldError('orderCode')"
      @update:shipping-price="shippingPrice = $event"
      @update:shipping-currency="shippingCurrency = $event"
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

    <!-- Items Section -->
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
        <div ref="itemScrollRef" class="swipe-container" @scroll="onItemScroll">
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
      :order-code="orderCode"
      :items="items"
      :customer-options="customerOptions"
      :shipping-price="shippingPrice"
      :shipping-currency="shippingCurrency"
      :shipping-converted="shippingConverted"
      :sell-rate="effectiveSellRate"
      @discount-change="handleCustomerDiscountChange"
      @discount-detail-change="handleDiscountDetailChange"
      @update:shipping-price="shippingPrice = $event"
      @update:shipping-currency="shippingCurrency = $event"
    />

    <!-- Submit -->
    <div class="submit-area">
      <a-button type="primary" size="large" class="submit-btn" :loading="submitting" data-testid="save-order-btn" @click="handleSubmit">
        <template #icon><SaveOutlined /></template>
        ບັນທຶກການແກ້ໄຂ
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  ShoppingOutlined, PlusOutlined, SaveOutlined,
  LeftOutlined, RightOutlined,
} from '@ant-design/icons-vue';
import { useIsMobile } from '@/shared/composables/useIsMobile';

import OrderCodeCard from '../stockOrders/components/OrderCodeCard.vue';
import ExchangeRateCard from '../stockOrders/components/ExchangeRateCard.vue';
import OrderItemForm from '../stockOrders/components/OrderItemForm.vue';
import OrderSummaryCard from '../stockOrders/components/OrderSummaryCard.vue';

import { useExchangeRates } from '../stockOrders/composables/useExchangeRates';
import type { ExchangeRateSnapshot } from '@/domain/entities/user.entity';
import { useItemCalculations } from '../stockOrders/composables/useItemCalculations';
import { useOrderItems } from '../stockOrders/composables/useOrderItems';
import { useItemCustomers } from '../stockOrders/composables/useItemCustomers';
import { useEditOrderSubmit } from './composables/useEditOrderSubmit';
import type { ItemForm } from '../stockOrders/types';

const props = defineProps<{
  editOrderId: number;
  initialOrderCode: string;
  initialItems: ItemForm[];
  initialShippingPrice?: number;
  initialShippingCurrency?: 'buy' | 'sell';
  initialBuyRate?: ExchangeRateSnapshot | null;
  initialSellRate?: ExchangeRateSnapshot | null;
}>();

const emit = defineEmits<{
  (e: 'openRateModal', data: {
    buy: { baseCurrency: string; targetCurrency: string; rate: number | undefined };
    sell: { baseCurrency: string; targetCurrency: string; rate: number | undefined };
  }): void
}>();

const router = useRouter();

const customerTotalDiscount = ref(0);
const summaryDiscountMode = ref<'all' | 'manual'>('manual');
const summaryAllDiscountType = ref<'percent' | 'cash' | undefined>(undefined);
const summaryAllDiscountValue = ref(0);

const handleCustomerDiscountChange = (amount: number) => { customerTotalDiscount.value = amount; };
const handleDiscountDetailChange = (
  mode: 'all' | 'manual',
  allType: 'percent' | 'cash' | undefined,
  allValue: number,
) => {
  summaryDiscountMode.value = mode;
  summaryAllDiscountType.value = allType;
  summaryAllDiscountValue.value = allValue;
};

const shippingPrice = ref(0);
const shippingCurrency = ref<'buy' | 'sell'>('buy');

const openRateModal = (data: {
  buy: { baseCurrency: string; targetCurrency: string; rate: number | undefined };
  sell: { baseCurrency: string; targetCurrency: string; rate: number | undefined };
}) => {
  emit('openRateModal', data);
};

const { isMobile } = useIsMobile();
const orderCode = ref('');

const {
  buyRateDisplay, sellRateDisplay,
  buyBaseCcy, buyTargetCcy, sellBaseCcy, sellTargetCcy,
  getBuyRate, getSellRate, getBuyRateId, getSellRateId, fetchTodayRates, setRates,
} = useExchangeRates();

const isBuySameCurrency = computed(() => buyBaseCcy.value === buyTargetCcy.value);
const isSellSameCurrency = computed(() => sellBaseCcy.value === sellTargetCcy.value);
const getEffectiveBuyRate = () => isBuySameCurrency.value ? 1 : getBuyRate();
const getEffectiveSellRate = () => isSellSameCurrency.value ? 1 : getSellRate();
const effectiveSellRate = computed(() => getEffectiveSellRate());

const calc = useItemCalculations(getEffectiveBuyRate, getEffectiveSellRate);

const {
  items, activeItemIdx, itemScrollRef,
  onItemScroll, scrollToItem, addItem, removeItem,
} = useOrderItems(isMobile);

void itemScrollRef;

const {
  customerOptions, customerSearching,
  onCustomerSearch, onCustomerFocus, fetchCustomers,
  goCreateCustomer, handleNewCustomerReturn,
} = useItemCustomers(items, () => {});

const handleSuccess = () => {
  router.push(`/merchant/orders/${props.editOrderId}`);
};

const { submitting, fieldErrors, clearFieldError, handleSubmit } = useEditOrderSubmit(
  orderCode, items, handleSuccess, getBuyRateId, getSellRateId, shippingPrice, shippingCurrency, props.editOrderId,
  summaryDiscountMode, summaryAllDiscountType, summaryAllDiscountValue,
);

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

const shippingConverted = computed(() => {
  const rate = shippingCurrency.value === 'sell' ? getEffectiveSellRate() : getEffectiveBuyRate();
  return (shippingPrice.value || 0) * rate;
});

const summaryPurchaseTotalForeign = computed(() =>
  items.value.reduce((sum, item) => sum + calc.calcPurchaseTotalForeignWithVariants(item), 0));
const summaryPurchaseTotalLak = computed(() =>
  items.value.reduce((sum, item) => sum + calc.calcPurchaseTotalLakWithVariants(item), 0));
const summarySellingTotalForeign = computed(() => {
  const raw = items.value.reduce((sum, item) => sum + calc.calcSellingTotalForeignWithVariants(item), 0);
  return Math.max(0, raw - customerTotalDiscount.value);
});
const summarySellingTotalLak = computed(() => {
  const rawLak = items.value.reduce((sum, item) => sum + calc.calcSellingTotalLakWithVariants(item), 0);
  const rate = getEffectiveSellRate();
  return Math.max(0, rawLak - customerTotalDiscount.value * rate);
});
const summaryNetCostLak = computed(() =>
  items.value.reduce((sum, item) => sum + calc.calcPurchaseTotalLakWithVariants(item), 0));
const summaryProfitLak = computed(() => summarySellingTotalLak.value - summaryNetCostLak.value);
const summaryProfitForeign = computed(() => {
  const rate = getEffectiveSellRate();
  return rate === 0 ? 0 : summaryProfitLak.value / rate;
});

const refreshRates = () => fetchTodayRates();

const updateExchangeRates = async (buyId?: number, sellId?: number) => {
  try {
    const { exchangeRateRepository } = await import('@/infrastructure/repositories/exchange-rate.repository');
    const buyRate = buyId ? await exchangeRateRepository.getById(buyId) : null;
    const sellRate = sellId ? await exchangeRateRepository.getById(sellId) : null;
    setRates(buyRate, sellRate);
  } catch (error) {
    // Failed to update exchange rates
  }
};

const getStoredExchangeRateIds = () => {
  const storageKey = `edit_order_${props.editOrderId}_exchange_rates`;
  const storedRates = localStorage.getItem(storageKey);
  if (storedRates) {
    try {
      const { buyRateId, sellRateId } = JSON.parse(storedRates);
      return { buyRateId, sellRateId };
    } catch (error) {
      // Failed to parse stored exchange rates
    }
  }
  return { buyRateId: undefined, sellRateId: undefined };
};

defineExpose({ refreshRates, updateExchangeRates, getStoredExchangeRateIds });

onMounted(async () => {
  // Populate from existing order data
  orderCode.value = props.initialOrderCode;
  if (props.initialItems && props.initialItems.length > 0) {
    items.value = JSON.parse(JSON.stringify(props.initialItems));
  } else {
    addItem();
  }
  if (props.initialShippingPrice !== undefined) shippingPrice.value = props.initialShippingPrice;
  if (props.initialShippingCurrency) shippingCurrency.value = props.initialShippingCurrency;

  // Check if there are new exchange rate IDs from localStorage (created via modal)
  const storageKey = `edit_order_${props.editOrderId}_exchange_rates`;
  const storedRates = localStorage.getItem(storageKey);
  
  if (storedRates) {
    try {
      const { buyRateId, sellRateId } = JSON.parse(storedRates);
      await updateExchangeRates(buyRateId, sellRateId);
    } catch (error) {
      // Fallback to initial rates
      if (props.initialBuyRate || props.initialSellRate) {
        setRates(
          props.initialBuyRate ?? null,
          props.initialSellRate ?? null,
        );
      }
    }
  } else {
    // Seed the order's saved exchange rates. Do NOT auto-fetch today's rates
    // so the order's original rates are preserved. User can update via rate modal.
    if (props.initialBuyRate || props.initialSellRate) {
      setRates(
        props.initialBuyRate ?? null,
        props.initialSellRate ?? null,
      );
    }
  }
  // If no saved rates on order, leave fields empty for user to create new rates via modal
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

@media (min-width: 768px) and (max-width: 1024px) {
  .panel-card :deep(.ant-card-body) { padding: 14px !important; }
}

@media (max-width: 767px) {
  .page-title { font-size: 16px; }
  .page-subtitle { font-size: 12px; }
  .panel-card { border-radius: 10px; }
  .panel-card :deep(.ant-card-body) { padding: 12px !important; }
  .submit-area { justify-content: stretch; }
  .submit-btn { width: 100%; }
}
</style>
