<template>
  <div class="item-block" :style="{ borderColor: itemBorderColor, boxShadow: `0 2px 12px ${itemBorderColor}22` }">
    <div class="item-color-strip" :style="{ background: itemBorderColor }" />
    <div class="item-header">
      <span class="item-num" :style="{ color: itemBorderColor, borderColor: `${itemBorderColor}44`, background: `${itemBorderColor}12` }">#{{ index + 1 }}</span>
      <a-button type="text" danger size="small" @click="$emit('remove', item.uid)"><DeleteOutlined /></a-button>
    </div>
    <a-form layout="vertical" class="item-form">
      <!-- Basic Info: productName + variant (no qty) -->
      <template v-if="!isMobile">
        <a-row :gutter="[16, 0]">
          <a-col :sm="24" :md="14">
            <a-form-item
              :label="$t('merchant.orders.items.productName')"
              :validate-status="errors.productName ? 'error' : ''"
              :help="errors.productName || ''"
            >
              <a-input
                v-model:value="item.productName"
                :placeholder="$t('merchant.orders.items.productNamePh')"
                :status="errors.productName ? 'error' : undefined"
                :data-testid="`item-product-name-${index}`"
                @input="onFieldChange('productName')"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :md="10">
            <a-form-item :label="$t('merchant.orders.items.variant')">
              <a-input v-model:value="item.variant" :placeholder="$t('merchant.orders.items.variantPh')" />
            </a-form-item>
          </a-col>
        </a-row>
      </template>
      <template v-else>
        <a-form-item
          :label="$t('merchant.orders.items.productName')"
          :validate-status="errors.productName ? 'error' : ''"
          :help="errors.productName || ''"
        >
          <a-input
            v-model:value="item.productName"
            :placeholder="$t('merchant.orders.items.productNamePh')"
            :status="errors.productName ? 'error' : undefined"
            :data-testid="`item-product-name-${index}`"
            @input="onFieldChange('productName')"
          />
        </a-form-item>
        <a-form-item :label="$t('merchant.orders.items.variant')">
          <a-input v-model:value="item.variant" :placeholder="$t('merchant.orders.items.variantPh')" />
        </a-form-item>
      </template>

      <!-- Section: Purchase -->
      <div class="item-section">
        <div class="item-section-header">
          <span class="item-section-title purchase">{{ $t('merchant.orders.items.sectionPurchase') }}</span>
          <span v-if="!isBuySameCurrency" class="exchange-rate-tag buy">1 {{ buyBaseCcy }} = {{ fmtRate(getBuyRate()) }} {{ buyTargetCcy }}</span>
        </div>
        <a-row :gutter="gutter">
          <a-col v-bind="halfCol">
            <a-form-item
              :label="`${$t('merchant.orders.items.purchasePrice')} (${buyBaseCcy})`"
              :validate-status="errors.purchasePrice ? 'error' : ''"
              :help="errors.purchasePrice || ''"
            >
              <a-input-number
                v-model:value="item.purchasePrice" :min="0"
                :formatter="numFormatter" :parser="numParser"
                :status="errors.purchasePrice ? 'error' : undefined"
                :data-testid="`item-purchase-price-${index}`"
                class="w-full"
                @change="onFieldChange('purchasePrice')"
              />
            </a-form-item>
          </a-col>
          <a-col v-bind="halfCol">
            <a-form-item :label="`${$t('merchant.orders.items.purchaseTotalForeign')} (${buyBaseCcy})`">
              <a-input :value="fmtNum(calc.calcPurchaseTotalForeign(item))" disabled class="w-full" />
            </a-form-item>
          </a-col>
          <a-col v-bind="halfCol">
            <a-form-item :label="`${$t('merchant.orders.items.shippingPrice')} (${buyBaseCcy})`">
              <a-input-number v-model:value="item.shippingPrice" :min="0" :formatter="numFormatter" :parser="numParser" class="w-full" />
            </a-form-item>
          </a-col>
          <a-col v-bind="halfCol">
            <a-form-item :label="`${$t('merchant.orders.items.purchaseAndShipForeign')} (${buyBaseCcy})`">
              <a-input :value="fmtNum(calc.calcPurchaseAndShipForeign(item))" disabled class="w-full" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row v-if="!isBuySameCurrency" :gutter="gutter">
          <a-col v-bind="halfCol">
            <a-form-item :label="`${$t('merchant.orders.items.purchasePriceKip')} (${buyTargetCcy})`">
              <a-input :value="fmtNum(calc.calcPurchaseUnitLak(item))" disabled class="w-full" />
            </a-form-item>
          </a-col>
          <a-col v-bind="halfCol">
            <a-form-item :label="`${$t('merchant.orders.items.purchaseTotalKip')} (${buyTargetCcy})`">
              <a-input :value="fmtNum(calc.calcPurchaseTotalLak(item))" disabled class="w-full" />
            </a-form-item>
          </a-col>
          <a-col v-bind="halfCol">
            <a-form-item :label="`${$t('merchant.orders.items.shippingKip')} (${buyTargetCcy})`">
              <a-input :value="fmtNum(calc.calcShippingLak(item))" disabled class="w-full" />
            </a-form-item>
          </a-col>
          <a-col v-bind="halfCol">
            <a-form-item :label="`${$t('merchant.orders.items.purchaseAndShipKip')} (${buyTargetCcy})`">
              <a-input :value="fmtNum(calc.calcPurchaseAndShipLak(item))" disabled class="w-full" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="gutter">
          <a-col v-bind="halfCol">
            <a-form-item :label="$t('merchant.orders.items.discountType')">
              <a-select v-model:value="item.discountType" allow-clear :placeholder="$t('merchant.orders.items.noDiscount')" class="w-full">
                <a-select-option value="percent">%</a-select-option>
                <a-select-option value="cash">{{ $t('merchant.orders.items.cash') }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col v-if="item.discountType" v-bind="halfCol">
            <a-form-item :label="`${$t('merchant.orders.items.discountValue')} (${buyBaseCcy})`">
              <a-input-number v-model:value="item.discountValue" :min="0" :formatter="numFormatter" :parser="numParser" class="w-full" />
            </a-form-item>
          </a-col>
          <a-col v-if="item.discountType && !isBuySameCurrency" v-bind="halfCol">
            <a-form-item :label="`${$t('merchant.orders.items.discountKip')} (${buyTargetCcy})`">
              <a-input :value="fmtNum(calc.calcDiscountLak(item))" disabled class="w-full" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="gutter">
          <a-col v-bind="halfCol">
            <a-form-item :label="`${$t('merchant.orders.items.netCostForeign')} (${buyBaseCcy})`">
              <a-input :value="fmtNum(calc.calcNetCostForeign(item))" disabled class="w-full computed-highlight" />
            </a-form-item>
          </a-col>
          <a-col v-if="!isBuySameCurrency" v-bind="halfCol">
            <a-form-item :label="`${$t('merchant.orders.items.netCostKip')} (${buyTargetCcy})`">
              <a-input :value="fmtNum(calc.calcNetCostLak(item))" disabled class="w-full computed-highlight" />
            </a-form-item>
          </a-col>
        </a-row>
      </div>

      <!-- Section: Selling -->
      <div class="item-section">
        <div class="item-section-header">
          <span class="item-section-title selling">{{ $t('merchant.orders.items.sectionSelling') }}</span>
          <span v-if="!isSellSameCurrency" class="exchange-rate-tag sell">1 {{ sellBaseCcy }} = {{ fmtRate(getSellRate()) }} {{ sellTargetCcy }}</span>
        </div>
        <a-row :gutter="gutter">
          <a-col v-bind="halfCol">
            <a-form-item
              :label="`${$t('merchant.orders.items.sellingPrice')} (${sellBaseCcy})`"
              :validate-status="errors.sellingPriceForeign ? 'error' : ''"
              :help="errors.sellingPriceForeign || ''"
            >
              <a-input-number
                v-model:value="item.sellingPriceForeign" :min="0"
                :formatter="numFormatter" :parser="numParser"
                :status="errors.sellingPriceForeign ? 'error' : undefined"
                :data-testid="`item-selling-price-${index}`"
                class="w-full"
                @change="onFieldChange('sellingPriceForeign')"
              />
            </a-form-item>
          </a-col>
          <a-col v-bind="halfCol">
            <a-form-item :label="`${$t('merchant.orders.items.sellingTotalForeign')} (${sellBaseCcy})`">
              <a-input :value="fmtNum(calc.calcSellingTotalForeign(item))" disabled class="w-full" />
            </a-form-item>
          </a-col>
          <a-col v-if="!isSellSameCurrency" v-bind="halfCol">
            <a-form-item :label="`${$t('merchant.orders.items.sellingTotalKip')} (${sellTargetCcy})`">
              <a-input :value="fmtNum(calc.calcSellingTotalLak(item))" disabled class="w-full" />
            </a-form-item>
          </a-col>
        </a-row>
      </div>

      <!-- Section: Customers -->
      <div class="item-section customers-section">
        <div class="item-section-header">
          <span class="item-section-title customers-title">{{ $t('merchant.orders.items.customersSection') }}</span>
          <span class="total-qty-badge">
            {{ $t('merchant.orders.items.totalQtyLabel') }}: <strong>{{ totalQty }}</strong>
          </span>
        </div>

        <div v-if="errors.customers" class="cust-section-error">{{ errors.customers }}</div>

        <!-- Desktop column headers -->
        <div v-if="!isMobile && item.customers.length > 0" class="cust-col-labels">
          <span class="cust-label-customer">{{ $t('merchant.orders.customerOrders.selectCustomer') }}</span>
          <span class="cust-label-qty">{{ $t('merchant.orders.customerOrders.qtyLabel') }}</span>
          <span class="cust-label-action"></span>
        </div>

        <!-- Customer rows -->
        <div v-for="(cust, cIdx) in item.customers" :key="cust.uid" class="cust-row">
          <!-- Desktop row -->
          <template v-if="!isMobile">
            <div class="cust-row-inner">
              <div class="cust-col-customer">
                <a-select
                  v-model:value="cust.customerId"
                  show-search
                  :filter-option="false"
                  :not-found-content="customerSearching ? undefined : null"
                  :placeholder="$t('merchant.orders.customerOrders.searchCustomerPh')"
                  :status="errors[`customers.${cIdx}.customerId`] ? 'error' : undefined"
                  class="w-full"
                  @search="$emit('customerSearch', $event)"
                  @focus="$emit('customerFocus')"
                >
                  <template v-if="customerSearching" #notFoundContent><a-spin size="small" /></template>
                  <a-select-option v-for="c in customerOptions" :key="c.id" :value="c.id">
                    <div class="customer-opt">
                      <span class="customer-name">{{ c.customerName }}</span>
                      <a-tag size="small" :color="c.customerType === 'AGENT' ? 'purple' : 'blue'" class="customer-type-tag">{{ c.customerType }}</a-tag>
                    </div>
                  </a-select-option>
                </a-select>
                <span v-if="errors[`customers.${cIdx}.customerId`]" class="cust-field-error">{{ errors[`customers.${cIdx}.customerId`] }}</span>
              </div>
              <div class="cust-col-qty">
                <a-input-number
                  v-model:value="cust.qty"
                  :min="1"
                  :precision="0"
                  :formatter="numFormatter"
                  :parser="numParser"
                  class="w-full"
                />
              </div>
              <div class="cust-col-actions">
                <a-tooltip :title="$t('merchant.orders.customerOrders.createNew')" placement="top">
                  <a-button type="text" size="small" class="create-cust-btn" @click="$emit('createCustomer', item.uid, cust.uid)">
                    <UserAddOutlined />
                  </a-button>
                </a-tooltip>
                <a-button type="text" danger size="small" @click="removeCustomer(cust.uid)">
                  <DeleteOutlined />
                </a-button>
              </div>
            </div>
          </template>

          <!-- Mobile row -->
          <template v-else>
            <div class="cust-row-mobile">
              <div class="cust-mobile-select-row">
                <a-select
                  v-model:value="cust.customerId"
                  show-search
                  :filter-option="false"
                  :not-found-content="customerSearching ? undefined : null"
                  :placeholder="$t('merchant.orders.customerOrders.searchCustomerPh')"
                  :status="errors[`customers.${cIdx}.customerId`] ? 'error' : undefined"
                  class="cust-select-mobile"
                  @search="$emit('customerSearch', $event)"
                  @focus="$emit('customerFocus')"
                >
                  <template v-if="customerSearching" #notFoundContent><a-spin size="small" /></template>
                  <a-select-option v-for="c in customerOptions" :key="c.id" :value="c.id">
                    {{ c.customerName }}
                  </a-select-option>
                </a-select>
                <a-button type="text" size="small" class="create-cust-btn" @click="$emit('createCustomer', item.uid, cust.uid)">
                  <UserAddOutlined />
                </a-button>
              </div>
              <div class="cust-mobile-bottom-row">
                <a-input-number
                  v-model:value="cust.qty"
                  :min="1"
                  :precision="0"
                  :formatter="numFormatter"
                  :parser="numParser"
                  class="cust-qty-mobile"
                />
                <a-button type="text" danger size="small" @click="removeCustomer(cust.uid)">
                  <DeleteOutlined />
                </a-button>
              </div>
            </div>
          </template>
        </div>

        <!-- Add Customer button -->
        <a-button type="dashed" block class="add-cust-btn" @click="addCustomer">
          <template #icon><PlusOutlined /></template>
          {{ $t('merchant.orders.items.addCustomer') }}
        </a-button>
      </div>

      <!-- Section: Item Summary (แสดงเมื่อมีลูกค้าและ qty > 0) -->
      <div v-if="totalQty > 0" class="item-summary-section">
        <div class="item-summary-header">
          <CalculatorOutlined class="summary-icon" />
          <span class="item-summary-title">{{ $t('merchant.orders.items.itemSummary') }}</span>
          <span class="item-summary-qty-badge">{{ $t('merchant.orders.items.totalQtyLabel') }}: <strong>{{ totalQty }}</strong></span>
        </div>
        <div class="item-summary-grid">
          <!-- Net Cost -->
          <div class="summary-stat">
            <div class="summary-stat-label">{{ $t('merchant.orders.items.netCostForeign') }} ({{ buyBaseCcy }})</div>
            <div class="summary-stat-value cost">{{ fmtNum(calc.calcNetCostForeign(item)) }}</div>
          </div>
          <div v-if="!isBuySameCurrency" class="summary-stat">
            <div class="summary-stat-label">{{ $t('merchant.orders.items.netCostKip') }} ({{ buyTargetCcy }})</div>
            <div class="summary-stat-value cost">{{ fmtNum(calc.calcNetCostLak(item)) }}</div>
          </div>
          <!-- Selling Total -->
          <div class="summary-stat">
            <div class="summary-stat-label">{{ $t('merchant.orders.items.sellingTotalForeign') }} ({{ sellBaseCcy }})</div>
            <div class="summary-stat-value selling">{{ fmtNum(calc.calcSellingTotalForeign(item)) }}</div>
          </div>
          <div v-if="!isSellSameCurrency" class="summary-stat">
            <div class="summary-stat-label">{{ $t('merchant.orders.items.sellingTotalKip') }} ({{ sellTargetCcy }})</div>
            <div class="summary-stat-value selling">{{ fmtNum(calc.calcSellingTotalLak(item)) }}</div>
          </div>
          <!-- Profit -->
          <div class="summary-stat profit-stat">
            <div class="summary-stat-label">{{ $t('merchant.orders.summary.profitForeign') }} ({{ sellBaseCcy }})</div>
            <div class="summary-stat-value profit">{{ fmtNum(itemProfitForeign) }}</div>
          </div>
          <div v-if="!isSellSameCurrency" class="summary-stat profit-stat">
            <div class="summary-stat-label">{{ $t('merchant.orders.summary.profitLak') }} ({{ sellTargetCcy }})</div>
            <div class="summary-stat-value profit">{{ fmtNum(itemProfitLak) }}</div>
          </div>
        </div>
      </div>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DeleteOutlined, PlusOutlined, UserAddOutlined, CalculatorOutlined } from '@ant-design/icons-vue';
import { fmtNumber, numFormatter, numParser } from '@/shared/utils/format';
import { useItemCalculations } from '../composables/useItemCalculations';
import type { Customer } from '@/domain/entities/user.entity';
import type { ItemForm } from '../types';

const props = defineProps<{
  item: ItemForm;
  index: number;
  isMobile: boolean;
  buyBaseCcy: string;
  buyTargetCcy: string;
  sellBaseCcy: string;
  sellTargetCcy: string;
  getBuyRate: () => number;
  getSellRate: () => number;
  errors: Record<string, string>;
  customerOptions: Customer[];
  customerSearching: boolean;
}>();

const emit = defineEmits<{
  (e: 'remove', uid: string): void;
  (e: 'clearError', field: string): void;
  (e: 'customerSearch', val: string): void;
  (e: 'customerFocus'): void;
  (e: 'createCustomer', itemUid: string, customerUid: string): void;
}>();

const ITEM_COLORS = ['#4E8EB5', '#45BA6A', '#4F3BB3', '#8439AD', '#A84385'];
const itemBorderColor = computed(() => ITEM_COLORS[props.index % ITEM_COLORS.length]!);

const calc = useItemCalculations(props.getBuyRate, props.getSellRate);

const fmtNum = fmtNumber;
const fmtRate = (val: number) => val.toLocaleString('en-US');

const gutter = computed<[number, number]>(() => props.isMobile ? [12, 0] : [16, 0]);
const halfCol = computed(() => props.isMobile ? { span: 12 } : { sm: 12, md: 6 });

const isBuySameCurrency = computed(() => props.buyBaseCcy === props.buyTargetCcy);
const isSellSameCurrency = computed(() => props.sellBaseCcy === props.sellTargetCcy);

const totalQty = computed(() => props.item.customers.reduce((sum, c) => sum + (c.qty || 0), 0));

const itemProfitLak = computed(() => calc.calcSellingTotalLak(props.item) - calc.calcNetCostLak(props.item));
const itemProfitForeign = computed(() => {
  const rate = props.getSellRate();
  return rate === 0 ? 0 : itemProfitLak.value / rate;
});

const uid = () => String(Date.now()) + Math.random().toString(36).slice(2, 6);

const addCustomer = () => {
  props.item.customers.push({ uid: uid(), customerId: undefined, qty: 1 });
};

const removeCustomer = (customerUid: string) => {
  props.item.customers = props.item.customers.filter(c => c.uid !== customerUid);
};

const onFieldChange = (field: string) => {
  if (props.errors[field]) {
    emit('clearError', field);
  }
};
</script>

<style scoped>
.w-full { width: 100%; }
.item-block {
  background: #f8fafc; border-radius: 16px; padding: 0 0 4px; margin-bottom: 14px;
  border: 1.5px solid rgba(148, 163, 184, 0.18); transition: box-shadow 0.2s ease;
  overflow: hidden;
}
.item-color-strip {
  height: 5px; width: 100%; border-radius: 14px 14px 0 0;
}
.item-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 4px; padding: 10px 20px 0;
}
.item-num {
  font-weight: 800; font-size: 13px;
  padding: 3px 10px; border-radius: 999px; border: 1.5px solid;
  transition: all 0.15s ease;
}
.item-form { padding: 0 20px; }
.item-form :deep(.ant-form-item) { margin-bottom: 16px; }
.item-form :deep(.ant-form-item-label) { padding-bottom: 4px; }
.item-form :deep(.ant-form-item-label > label) { font-size: 12px; font-weight: 700; color: #64748b; }
.item-form :deep(.ant-input-number), .item-form :deep(.ant-input), .item-form :deep(.ant-select) { width: 100% !important; }
:deep(.ant-input[disabled]) { color: #0f172a !important; font-weight: 600; background: #f1f5f9; font-size: 13px; }

.item-section {
  margin-bottom: 8px; padding: 12px 16px 4px;
  background: #fff; border-radius: 12px; border: 1px solid rgba(148, 163, 184, 0.15);
}
.item-section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
.item-section-title { font-size: 13px; font-weight: 800; letter-spacing: 0.3px; text-transform: uppercase; }
.item-section-title.purchase { color: #1d4ed8; }
.item-section-title.selling { color: #059669; }
.customers-title { color: #7c3aed; }
.exchange-rate-tag { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; white-space: nowrap; }
.exchange-rate-tag.buy { background: #ecfdf5; color: #059669; }
.exchange-rate-tag.sell { background: #fff7ed; color: #d97706; }
.computed-highlight:deep(input) { color: #1d4ed8 !important; font-weight: 700; background: #eff6ff !important; }

/* Total qty badge */
.total-qty-badge {
  font-size: 12px; font-weight: 700; color: #7c3aed;
  background: #f5f3ff; padding: 2px 10px; border-radius: 999px;
  border: 1px solid rgba(124, 58, 237, 0.2);
}

/* Customers section */
.customers-section { padding-bottom: 12px; }
.cust-section-error { font-size: 12px; color: #ff4d4f; font-weight: 600; margin-bottom: 8px; }

/* Desktop column labels */
.cust-col-labels {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 6px; padding: 0 2px;
}
.cust-label-customer { flex: 1; min-width: 150px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.4px; }
.cust-label-qty { width: 280px; flex-shrink: 0; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.4px; }
.cust-label-action { width: 72px; flex-shrink: 0; }

/* Customer row — desktop */
.cust-row {
  margin-bottom: 8px; background: #f8fafc;
  border-radius: 10px; padding: 8px 10px;
  border: 1px solid rgba(148, 163, 184, 0.12);
}
.cust-row-inner { display: flex; align-items: center; gap: 8px; }
.cust-col-customer { flex: 1; min-width: 150px; }
.cust-col-qty { width: 280px; flex-shrink: 0; }
.cust-col-actions { width: 72px; flex-shrink: 0; display: flex; gap: 2px; justify-content: flex-end; }
.create-cust-btn { border-radius: 8px; color: #7c3aed; }
.create-cust-btn:hover { background: #f5f3ff !important; }
.cust-field-error { font-size: 11px; color: #ff4d4f; display: block; margin-top: 2px; }

/* Customer row — mobile */
.cust-row-mobile { display: flex; flex-direction: column; gap: 6px; }
.cust-mobile-select-row { display: flex; gap: 6px; align-items: center; }
.cust-select-mobile { flex: 1; min-width: 0; }
.cust-mobile-bottom-row { display: flex; align-items: center; gap: 8px; }
.cust-qty-mobile { width: 120px; }

/* Add customer button */
.add-cust-btn { border-radius: 10px; margin-top: 6px; border-color: #a78bfa; color: #7c3aed; }
.add-cust-btn:hover { border-color: #7c3aed !important; background: #faf5ff !important; color: #7c3aed !important; }

/* Item Summary Section */
.item-summary-section {
  margin-top: 12px;
  padding: 14px 16px 10px;
  background: linear-gradient(135deg, #f0fdf4 0%, #f8fafc 60%, #eff6ff 100%);
  border-radius: 14px;
  border: 1.5px solid rgba(34, 197, 94, 0.2);
}
.item-summary-header {
  display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;
}
.summary-icon { color: #16a34a; font-size: 16px; }
.item-summary-title {
  font-size: 13px; font-weight: 800; color: #16a34a;
  text-transform: uppercase; letter-spacing: 0.3px;
}
.item-summary-qty-badge {
  font-size: 11px; font-weight: 700; color: #7c3aed;
  background: #f5f3ff; padding: 2px 8px; border-radius: 999px;
  border: 1px solid rgba(124, 58, 237, 0.2);
  margin-left: auto;
}
.item-summary-grid {
  display: flex; flex-wrap: wrap; gap: 8px;
}
.summary-stat {
  flex: 1 1 140px; min-width: 120px;
  background: #fff; border-radius: 10px;
  padding: 8px 12px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}
.profit-stat {
  background: #f0fdf4;
  border-color: rgba(34, 197, 94, 0.2);
}
.summary-stat-label {
  font-size: 10px; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: 0.4px;
  margin-bottom: 4px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.summary-stat-value {
  font-size: 15px; font-weight: 800; color: #0f172a;
  font-variant-numeric: tabular-nums;
}
.summary-stat-value.cost { color: #1d4ed8; }
.summary-stat-value.selling { color: #d97706; }
.summary-stat-value.profit { color: #16a34a; }

@media (max-width: 767px) {
  .item-block {
    background: #f8fafc;
    border-radius: 14px;
    overflow: hidden;
    margin-bottom: 20px;
    padding-bottom: 4px;
  }
  .item-header { padding: 8px 12px 0; }
  .item-form { padding: 0 12px; }
  .item-section {
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 0;
    margin-bottom: 16px;
  }
  .item-section-title { font-size: 12px; }
  .exchange-rate-tag { font-size: 10px; }
  .customers-section { padding: 10px 12px; background: #f5f3ff; border-radius: 12px; border: 1px solid rgba(124, 58, 237, 0.15); }
  .cust-row { padding: 8px; }
  .item-summary-section { padding: 10px 12px 8px; }
  .summary-stat { flex: 1 1 100px; min-width: 90px; padding: 6px 10px; }
  .summary-stat-value { font-size: 13px; }
}
</style>
