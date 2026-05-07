<template>
  <a-card v-if="visible" :bordered="false" class="panel-card mb-4 summary-card">

    <!-- Order Detail — grouped by customer -->
    <div v-if="hasDetail" class="detail-section">
      <div class="detail-header">
        <UnorderedListOutlined class="detail-header-icon" />
        <span class="detail-header-title">{{ $t('merchant.orders.summary.detailTitle') }}</span>
        <span v-if="orderCode" class="order-code-badge">
          <TagOutlined class="order-code-icon" />
          {{ orderCode }}
        </span>
      </div>

      <!-- Discount mode selector -->
      <div class="discount-mode-bar">
        <span class="discount-mode-label">{{ $t('merchant.orders.summary.discountModeLabel') }}</span>
        <a-radio-group v-model:value="discountMode" button-style="solid" size="small">
          <a-radio-button value="manual">{{ $t('merchant.orders.summary.discountModeManual') }}</a-radio-button>
          <a-radio-button value="all">{{ $t('merchant.orders.summary.discountModeAll') }}</a-radio-button>
        </a-radio-group>
      </div>

      <div class="cust-list">
        <div
          v-for="(cust, cIdx) in customerSummaries"
          :key="cust.customerId"
          class="cust-block"
        >
          <!-- Customer header -->
          <div class="cust-block-header">
            <span class="cust-block-num">{{ cIdx + 1 }}</span>
            <span class="cust-block-name">{{ cust.customerName }}</span>
            <span class="cust-block-qty">
              {{ $t('merchant.orders.summary.totalQtyLabel', { qty: cust.totalQty }) }}
            </span>
          </div>

          <!-- Products + variants this customer ordered -->
          <div class="cust-orders">
            <div
              v-for="prod in cust.products"
              :key="prod.productUid"
              class="cust-order-product"
            >
              <div class="cust-order-product-name">{{ prod.productName || '-' }}</div>
              <div
                v-for="(v, vi) in prod.variants"
                :key="vi"
                class="cust-order-variant-line"
              >
                <span class="cust-order-dot" :style="{ background: getVariantColor(vi) }" />
                <span class="cust-order-variant-name">
                  {{ v.variantName || $t('merchant.orders.summary.variantFallback', { number: vi + 1 }) }}
                </span>
                <span class="cust-order-qty">{{ $t('merchant.orders.summary.itemQtyLabel', { qty: v.qty }) }}</span>
                <span class="cust-order-unit">{{ $t('merchant.orders.summary.unitPriceLabel') }} {{ fmtNum(v.unitPrice) }} {{ sellBaseCcy }}</span>
                <span class="cust-order-line-total">= {{ fmtNum(v.lineTotal) }} {{ sellBaseCcy }}</span>
              </div>
            </div>
          </div>

          <!-- Subtotal / Discount / Total -->
          <div class="cust-pricing">
            <!-- Before discount (always shown) -->
            <div class="cust-pricing-row">
              <span class="cust-pricing-label">{{ $t('merchant.orders.summary.beforeDiscount') }}</span>
              <span class="cust-pricing-val before-discount">{{ fmtNum(cust.subtotal) }} {{ sellBaseCcy }}</span>
            </div>

            <!-- Manual mode: per-customer discount controls -->
            <template v-if="discountMode === 'manual'">
              <div class="cust-pricing-row cust-discount-row">
                <span class="cust-pricing-label discount-label">{{ $t('merchant.orders.summary.discountLabel') }}</span>
                <div class="cust-discount-controls">
                  <a-select
                    v-model:value="cust.canonical.discountType"
                    allow-clear
                    :placeholder="$t('merchant.orders.items.noDiscount')"
                    size="small"
                    class="cust-disc-type-sel"
                    @change="(val: string | null) => handleDiscountTypeChange(val, cust.canonical)"
                  >
                    <a-select-option value="percent">%</a-select-option>
                    <a-select-option value="cash">{{ $t('merchant.orders.items.cash') }}</a-select-option>
                  </a-select>
                  <a-input-number
                    v-model:value="cust.canonical.discountValue"
                    :formatter="numFormatter"
                    :parser="numParser"
                    :disabled="!cust.canonical.discountType"
                    :min="0"
                    size="small"
                    class="cust-disc-val-inp"
                  />
                </div>
                <span v-if="cust.discountAmount > 0" class="cust-discount-amount-badge">
                  − {{ fmtNum(cust.discountAmount) }} {{ sellBaseCcy }}
                </span>
              </div>

              <!-- Total after discount (manual) -->
              <div class="cust-pricing-row cust-total-final-row">
                <span class="cust-pricing-label total-label">{{ $t('merchant.orders.summary.customerTotalLabel') }}</span>
                <span class="cust-total-final-val">{{ fmtNum(cust.total) }} {{ sellBaseCcy }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- All mode: global discount section -->
      <div v-if="discountMode === 'all' && customerSummaries.length > 0" class="all-discount-section">
        <div class="all-disc-row">
          <span class="all-disc-label">{{ $t('merchant.orders.summary.grandSubtotalLabel') }}</span>
          <span class="all-disc-subtotal">{{ fmtNum(grandSubtotal) }} {{ sellBaseCcy }}</span>
        </div>
        <div class="all-disc-row all-disc-control-row">
          <span class="all-disc-label discount-label">{{ $t('merchant.orders.summary.allDiscountLabel') }}</span>
          <div class="cust-discount-controls">
            <a-select
              v-model:value="allDiscountType"
              allow-clear
              :placeholder="$t('merchant.orders.items.noDiscount')"
              size="small"
              class="cust-disc-type-sel"
              @change="handleAllDiscountTypeChange"
            >
              <a-select-option value="percent">%</a-select-option>
              <a-select-option value="cash">{{ $t('merchant.orders.items.cash') }}</a-select-option>
            </a-select>
            <a-input-number
              v-model:value="allDiscountValue"
              :formatter="numFormatter"
              :parser="numParser"
              :disabled="!allDiscountType"
              :min="0"
              size="small"
              class="cust-disc-val-inp"
            />
          </div>
          <span v-if="allDiscountAmount > 0" class="cust-discount-amount-badge">
            − {{ fmtNum(allDiscountAmount) }} {{ sellBaseCcy }}
          </span>
        </div>
        <div class="all-disc-row all-disc-total-row">
          <span class="all-disc-label total-label">{{ $t('merchant.orders.summary.grandTotalLabel') }}</span>
          <span class="all-disc-total-val">{{ fmtNum(grandTotalAfterDiscount) }} {{ sellBaseCcy }}</span>
        </div>
      </div>

      <div class="detail-divider" />
    </div>

    <!-- Overall financial totals -->
    <div class="panel-title">
      <CalculatorOutlined class="icon-blue" />
      <span>{{ $t('merchant.orders.summary.title') }}</span>
    </div>
    <a-form layout="vertical">
      <template v-if="!isMobile">
        <a-row :gutter="[16, 0]">
          <a-col :md="6">
            <a-form-item :label="`${$t('merchant.orders.summary.purchaseTotalForeign')} (${buyBaseCcy})`">
              <a-input :value="fmtNum(purchaseTotalForeign)" disabled class="w-full" />
            </a-form-item>
          </a-col>
          <a-col v-if="!isBuySameCurrency" :md="6">
            <a-form-item :label="`${$t('merchant.orders.summary.purchaseTotalLak')} (${buyTargetCcy})`">
              <a-input :value="fmtNum(purchaseTotalLak)" disabled class="w-full" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="[16, 0]">
          <a-col :md="6">
            <a-form-item :label="`${$t('merchant.orders.summary.sellingTotalForeign')} (${sellBaseCcy})`">
              <a-input :value="fmtNum(sellingTotalForeign)" disabled class="w-full" />
            </a-form-item>
          </a-col>
          <a-col v-if="!isSellSameCurrency" :md="6">
            <a-form-item :label="`${$t('merchant.orders.summary.sellingTotalLak')} (${sellTargetCcy})`">
              <a-input :value="fmtNum(sellingTotalLak)" disabled class="w-full" />
            </a-form-item>
          </a-col>
          <a-col :md="6">
            <a-form-item :label="`${$t('merchant.orders.summary.profitForeign')} (${sellBaseCcy})`">
              <a-input :value="fmtNum(profitForeign)" disabled class="w-full summary-profit" />
            </a-form-item>
          </a-col>
          <a-col v-if="!isSellSameCurrency" :md="6">
            <a-form-item :label="`${$t('merchant.orders.summary.profitLak')} (${sellTargetCcy})`">
              <a-input :value="fmtNum(profitLak)" disabled class="w-full summary-profit" />
            </a-form-item>
          </a-col>
        </a-row>
      </template>
      <template v-else>
        <a-row :gutter="[12, 0]">
          <a-col :span="12">
            <a-form-item :label="`${$t('merchant.orders.summary.purchaseTotalForeign')} (${buyBaseCcy})`">
              <a-input :value="fmtNum(purchaseTotalForeign)" disabled class="w-full" />
            </a-form-item>
          </a-col>
          <a-col v-if="!isBuySameCurrency" :span="12">
            <a-form-item :label="`${$t('merchant.orders.summary.purchaseTotalLak')} (${buyTargetCcy})`">
              <a-input :value="fmtNum(purchaseTotalLak)" disabled class="w-full" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="[12, 0]">
          <a-col :span="12">
            <a-form-item :label="`${$t('merchant.orders.summary.sellingTotalForeign')} (${sellBaseCcy})`">
              <a-input :value="fmtNum(sellingTotalForeign)" disabled class="w-full" />
            </a-form-item>
          </a-col>
          <a-col v-if="!isSellSameCurrency" :span="12">
            <a-form-item :label="`${$t('merchant.orders.summary.sellingTotalLak')} (${sellTargetCcy})`">
              <a-input :value="fmtNum(sellingTotalLak)" disabled class="w-full" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="[12, 0]">
          <a-col :span="12">
            <a-form-item :label="`${$t('merchant.orders.summary.profitForeign')} (${sellBaseCcy})`">
              <a-input :value="fmtNum(profitForeign)" disabled class="w-full summary-profit" />
            </a-form-item>
          </a-col>
          <a-col v-if="!isSellSameCurrency" :span="12">
            <a-form-item :label="`${$t('merchant.orders.summary.profitLak')} (${sellTargetCcy})`">
              <a-input :value="fmtNum(profitLak)" disabled class="w-full summary-profit" />
            </a-form-item>
          </a-col>
        </a-row>
      </template>
    </a-form>

    <!-- Shipping Section -->
    <div class="shipping-section">
      <div class="shipping-title">
        <SendOutlined class="icon-blue" />
        <span>{{ $t('merchant.orders.form.shippingCost') }}</span>
      </div>
      <a-row :gutter="[16, 0]">
        <a-col :xs="24" :sm="8">
          <a-form-item :label="$t('merchant.orders.items.shippingCurrencyType')" class="compact-form-item">
            <a-select :value="shippingCurrency" class="w-full" @change="onShippingCurrencyChange">
              <a-select-option value="buy">BUY — {{ buyBaseCcy }}</a-select-option>
              <a-select-option value="sell">SELL — {{ sellBaseCcy }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="8">
          <a-form-item :label="`${$t('merchant.orders.items.shippingPrice')} (${shippingCcy})`" class="compact-form-item">
            <a-input-number
              :value="shippingPrice"
              :formatter="numFormatter"
              :parser="numParser"
              :min="0"
              class="w-full"
              @change="onShippingPriceChange"
            />
          </a-form-item>
        </a-col>
        <a-col v-if="!shippingIsSameCurrency" :xs="24" :sm="8">
          <a-form-item :label="`${$t('merchant.orders.items.shippingKip')} (${shippingTargetCcy})`" class="compact-form-item">
            <a-input :value="fmtNum(shippingConverted ?? 0)" disabled class="w-full" />
          </a-form-item>
        </a-col>
      </a-row>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { CalculatorOutlined, UnorderedListOutlined, TagOutlined, SendOutlined } from '@ant-design/icons-vue';
import { fmtNumber, numFormatter, numParser } from '@/shared/utils/format';
import type { ItemForm, CustomerInItemForm } from '../types';
import type { Customer } from '@/domain/entities/user.entity';

const props = defineProps<{
  visible: boolean;
  isMobile: boolean;
  buyBaseCcy: string;
  buyTargetCcy: string;
  sellBaseCcy: string;
  sellTargetCcy: string;
  purchaseTotalForeign: number;
  purchaseTotalLak: number;
  sellingTotalForeign: number;
  sellingTotalLak: number;
  profitForeign: number;
  profitLak: number;
  orderCode?: string;
  items?: ItemForm[];
  customerOptions?: Customer[];
  shippingPrice?: number;
  shippingCurrency?: 'buy' | 'sell';
  shippingConverted?: number;
}>();

const emit = defineEmits<{
  'discount-change': [total: number];
  'update:shippingPrice': [val: number];
  'update:shippingCurrency': [val: 'buy' | 'sell'];
}>();

const { t } = useI18n();
const fmtNum = fmtNumber;

const discountMode = ref<'all' | 'manual'>('manual');
const allDiscountType = ref<'percent' | 'cash' | undefined>(undefined);
const allDiscountValue = ref<number>(0);

const handleAllDiscountTypeChange = (val: unknown) => {
  if (!val) allDiscountValue.value = 0;
};

const isBuySameCurrency = computed(() => props.buyBaseCcy === props.buyTargetCcy);
const isSellSameCurrency = computed(() => props.sellBaseCcy === props.sellTargetCcy);

const VARIANT_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#DDA0DD', '#98D8C8'];
const getVariantColor = (idx: number) => VARIANT_COLORS[idx % VARIANT_COLORS.length];

const getCustomerName = (customerId: number | undefined): string => {
  if (!customerId) return t('merchant.orders.summary.unknownCustomer');
  const found = props.customerOptions?.find(c => c.id === customerId);
  return found?.customerName ?? `#${customerId}`;
};

const calcDiscountAmount = (subtotal: number, type?: string, value?: number): number => {
  if (!type || !value) return 0;
  if (type === 'percent') return subtotal * (value / 100);
  return value;
};

/**
 * Build a customer-centric summary.
 * Each unique customer gets one entry showing all their ordered products/variants,
 * a subtotal, ONE discount control, and a final total.
 * The "canonical" CustomerInItemForm is the first occurrence of the customer across
 * all items/variants — its discountType/discountValue drive the per-customer discount.
 */
const customerSummaries = computed(() => {
  if (!props.items || props.items.length === 0) return [];

  interface CustAccum {
    customerId: number;
    totalQty: number;
    products: Array<{
      productName: string;
      productUid: string;
      variants: Array<{ variantName: string; qty: number; unitPrice: number; lineTotal: number }>;
      productSubtotal: number;
    }>;
    canonical: CustomerInItemForm;
  }

  const custMap = new Map<number, CustAccum>();

  for (const item of props.items) {
    for (const variant of (item.variants ?? [])) {
      for (const cust of (variant.customers ?? [])) {
        if (!cust.customerId || (cust.qty ?? 0) <= 0) continue;

        if (!custMap.has(cust.customerId)) {
          custMap.set(cust.customerId, {
            customerId: cust.customerId,
            totalQty: 0,
            products: [],
            canonical: cust,
          });
        }

        const entry = custMap.get(cust.customerId)!;
        entry.totalQty += cust.qty ?? 0;

        let prodEntry = entry.products.find(p => p.productUid === item.uid);
        if (!prodEntry) {
          prodEntry = {
            productName: item.productName,
            productUid: item.uid,
            variants: [],
            productSubtotal: 0,
          };
          entry.products.push(prodEntry);
        }

        const lineTotal = (cust.qty ?? 0) * (variant.sellingPriceForeign ?? 0);
        prodEntry.variants.push({
          variantName: variant.variant || '',
          qty: cust.qty ?? 0,
          unitPrice: variant.sellingPriceForeign ?? 0,
          lineTotal,
        });
        prodEntry.productSubtotal += lineTotal;
      }
    }
  }

  return Array.from(custMap.values()).map(entry => {
    const subtotal = entry.products.reduce((s, p) => s + p.productSubtotal, 0);
    // Read discountType/discountValue explicitly so Vue tracks them as reactive dependencies
    const discType = entry.canonical.discountType;
    const discVal = entry.canonical.discountValue ?? 0;
    const discountAmount = calcDiscountAmount(subtotal, discType, discVal);
    return {
      customerId: entry.customerId,
      customerName: getCustomerName(entry.customerId),
      totalQty: entry.totalQty,
      products: entry.products,
      subtotal,
      canonical: entry.canonical,
      discountAmount,
      total: Math.max(0, subtotal - discountAmount),
    };
  });
});

const grandSubtotal = computed(() =>
  customerSummaries.value.reduce((s, c) => s + c.subtotal, 0)
);

const allDiscountAmount = computed(() =>
  calcDiscountAmount(grandSubtotal.value, allDiscountType.value, allDiscountValue.value)
);

const totalDiscountAmount = computed(() => {
  if (discountMode.value === 'all') return allDiscountAmount.value;
  return customerSummaries.value.reduce((s, c) => s + c.discountAmount, 0);
});

const grandTotalAfterDiscount = computed(() =>
  Math.max(0, grandSubtotal.value - totalDiscountAmount.value)
);

watch(totalDiscountAmount, (val) => emit('discount-change', val), { immediate: true });

const hasDetail = computed(() =>
  !!(props.orderCode || customerSummaries.value.length > 0)
);

const handleDiscountTypeChange = (val: unknown, canonical: CustomerInItemForm) => {
  if (!val) canonical.discountValue = 0;
};

// Shipping computed properties
const shippingCcy = computed(() =>
  props.shippingCurrency === 'sell' ? props.sellBaseCcy : props.buyBaseCcy,
);
const shippingTargetCcy = computed(() =>
  props.shippingCurrency === 'sell' ? props.sellTargetCcy : props.buyTargetCcy,
);
const shippingIsSameCurrency = computed(() => shippingCcy.value === shippingTargetCcy.value);

const onShippingPriceChange = (val: number | null) => {
  emit('update:shippingPrice', val ?? 0);
};

const onShippingCurrencyChange = (val: 'buy' | 'sell') => {
  emit('update:shippingCurrency', val);
};
</script>

<style scoped>
.w-full { width: 100%; }
.mb-4 { margin-bottom: 16px; }

.panel-card {
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 25px rgba(15, 23, 42, 0.04);
}
.panel-title {
  font-size: 16px; font-weight: 800; color: #0f172a;
  display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
}
.icon-blue { color: #1d4ed8; font-size: 18px; }
:deep(.ant-input[disabled]) { color: #0f172a !important; font-weight: 600; background: #f1f5f9; font-size: 13px; }

.summary-card {
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(30, 64, 175, 0.07);
  background: linear-gradient(135deg, #f0fdf4 0%, #f8fafc 60%, #eff6ff 100%);
  margin-bottom: 18px;
  border: 1.5px solid rgba(34, 197, 94, 0.18);
}
.summary-card :deep(.ant-card-head) { border-bottom: 1.5px solid rgba(34, 197, 94, 0.12); background: transparent; }
.summary-card :deep(.ant-card-head-title) { font-size: 16px; font-weight: 800; color: #16a34a; }
.summary-card :deep(.ant-card-body) { padding: 18px 20px 6px; }
.summary-profit:deep(input) { color: #16a34a !important; font-weight: 800; background: #f0fdf4 !important; border-color: rgba(34, 197, 94, 0.25) !important; }

/* ── Detail section ── */
.detail-section { margin-bottom: 8px; }
.detail-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(34,197,94,0.25), transparent);
  margin: 16px 0;
}
.detail-header {
  display: flex; align-items: center; gap: 10px; margin-bottom: 16px;
}
.detail-header-icon { color: #1d4ed8; font-size: 16px; }
.detail-header-title {
  font-size: 14px; font-weight: 800; color: #0f172a;
  text-transform: uppercase; letter-spacing: 0.4px;
}
.order-code-badge {
  display: inline-flex; align-items: center; gap: 5px; margin-left: auto;
  background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 20px;
  padding: 3px 12px; font-size: 13px; font-weight: 700; color: #1d4ed8;
}
.order-code-icon { font-size: 12px; }

/* ── Customer list ── */
.cust-list { display: flex; flex-direction: column; gap: 14px; }

.cust-block {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

/* Customer header bar */
.cust-block-header {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  background: linear-gradient(90deg, #eff6ff, #f5f3ff);
  border-bottom: 1px solid #e2e8f0;
}
.cust-block-num {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 50%;
  background: #7c3aed; color: #fff; font-size: 11px; font-weight: 800; flex-shrink: 0;
}
.cust-block-name { flex: 1; font-size: 14px; font-weight: 700; color: #1e293b; }
.cust-block-qty {
  font-size: 12px; font-weight: 700; color: #7c3aed;
  background: #f5f3ff; padding: 2px 9px; border-radius: 10px;
}

/* ── Ordered products / variants ── */
.cust-orders {
  padding: 10px 14px;
  display: flex; flex-direction: column; gap: 10px;
  border-bottom: 1px solid #f1f5f9;
}
.cust-order-product { display: flex; flex-direction: column; gap: 4px; }
.cust-order-product-name {
  font-size: 11px; font-weight: 700; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 2px;
}
.cust-order-variant-line {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 8px; background: #f8fafc; border-radius: 6px;
  border: 1px solid #f1f5f9;
}
.cust-order-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.cust-order-variant-name { flex: 1; font-size: 12px; font-weight: 500; color: #475569; }
.cust-order-qty {
  font-size: 12px; font-weight: 700; color: #1d4ed8;
  background: #eff6ff; padding: 1px 6px; border-radius: 4px; flex-shrink: 0;
}
.cust-order-unit { font-size: 11px; color: #94a3b8; flex-shrink: 0; }
.cust-order-line-total {
  font-size: 12px; font-weight: 700; color: #059669;
  min-width: 90px; text-align: right; flex-shrink: 0;
}

/* ── Pricing rows ── */
.cust-pricing {
  padding: 10px 14px;
  display: flex; flex-direction: column; gap: 7px;
}
.cust-pricing-row {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.cust-pricing-label {
  font-size: 12px; font-weight: 600; color: #6b7280;
  min-width: 110px; flex-shrink: 0;
}
.cust-pricing-val {
  font-size: 13px; font-weight: 700; color: #374151; margin-left: auto;
}
.before-discount { color: #64748b; }

/* Discount row */
.cust-discount-row { gap: 6px; }
.discount-label { color: #d97706; }
.cust-discount-controls { display: flex; align-items: center; gap: 6px; }
.cust-disc-type-sel { width: 90px; }
.cust-disc-val-inp { width: 100px; }
.cust-discount-amount-badge {
  font-size: 12px; font-weight: 700; color: #dc2626;
  background: #fef2f2; padding: 2px 8px; border-radius: 6px;
  margin-left: auto;
}

/* Total after discount */
.cust-total-final-row {
  border-top: 1px solid #e2e8f0;
  padding-top: 7px;
  margin-top: 2px;
}
.total-label { color: #059669; font-weight: 700; font-size: 13px; }
.cust-total-final-val {
  font-size: 15px; font-weight: 800; color: #059669; margin-left: auto;
}

/* ── Discount mode bar ── */
.discount-mode-bar {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 14px;
  padding: 8px 12px;
  background: #f8fafc; border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.discount-mode-label {
  font-size: 12px; font-weight: 700; color: #475569; flex-shrink: 0;
}

/* ── All-mode global discount section ── */
.all-discount-section {
  margin-top: 14px;
  background: #fffbeb;
  border: 1.5px solid #fde68a;
  border-radius: 10px;
  padding: 12px 14px;
  display: flex; flex-direction: column; gap: 8px;
}
.all-disc-row {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.all-disc-label {
  font-size: 12px; font-weight: 600; color: #6b7280;
  min-width: 150px; flex-shrink: 0;
}
.all-disc-subtotal {
  font-size: 13px; font-weight: 700; color: #64748b; margin-left: auto;
}
.all-disc-control-row { gap: 6px; }
.all-disc-total-row {
  border-top: 1px solid #fde68a; padding-top: 8px; margin-top: 2px;
}
.all-disc-total-val {
  font-size: 15px; font-weight: 800; color: #059669; margin-left: auto;
}

/* ── Shipping section ── */
.shipping-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}
.shipping-title {
  font-size: 14px; font-weight: 700; color: #0f172a;
  display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
}
.compact-form-item { margin-bottom: 0; }

@media (max-width: 767px) {
  .panel-card { border-radius: 10px; }
  .summary-card { border-radius: 12px; }
  .summary-card :deep(.ant-card-body) { padding: 12px 12px 4px !important; }
  .detail-header { flex-wrap: wrap; }
  .order-code-badge { margin-left: 0; }
  .cust-pricing-label { min-width: 80px; }
  .cust-order-variant-line { flex-wrap: wrap; }
  .cust-order-line-total { min-width: auto; }
  .cust-order-unit { display: none; }
}
</style>
