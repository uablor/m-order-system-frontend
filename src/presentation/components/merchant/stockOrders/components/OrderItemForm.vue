<template>
  <div class="item-block">
    <div class="item-header">
      <span class="item-num">#{{ index + 1 }}</span>
      <a-button type="text" danger size="small" @click="$emit('remove', item.uid)"><DeleteOutlined /></a-button>
    </div>
    <a-form layout="vertical" class="item-form">
      <!-- Basic Info -->
      <template v-if="!isMobile">
        <a-row :gutter="[16, 0]">
          <a-col :sm="24" :md="10">
            <a-form-item
              :label="$t('merchant.orders.items.productName')"
              :validate-status="errors.productName ? 'error' : ''"
              :help="errors.productName || ''"
            >
              <a-input
                v-model:value="item.productName"
                :placeholder="$t('merchant.orders.items.productNamePh')"
                :status="errors.productName ? 'error' : undefined"
                @input="onFieldChange('productName')"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="14" :md="8">
            <a-form-item :label="$t('merchant.orders.items.variant')">
              <a-input v-model:value="item.variant" :placeholder="$t('merchant.orders.items.variantPh')" />
            </a-form-item>
          </a-col>
          <a-col :sm="10" :md="6">
            <a-form-item
              :label="$t('merchant.orders.items.quantity')"
              :validate-status="errors.quantity ? 'error' : ''"
              :help="errors.quantity || ''"
            >
              <a-input-number
                v-model:value="item.quantity" :min="1"
                :formatter="numFormatter" :parser="numParser"
                :status="errors.quantity ? 'error' : undefined"
                class="w-full"
                @change="onFieldChange('quantity')"
              />
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
            @input="onFieldChange('productName')"
          />
        </a-form-item>
        <a-form-item :label="$t('merchant.orders.items.variant')">
          <a-input v-model:value="item.variant" :placeholder="$t('merchant.orders.items.variantPh')" />
        </a-form-item>
        <a-form-item
          :label="$t('merchant.orders.items.quantity')"
          :validate-status="errors.quantity ? 'error' : ''"
          :help="errors.quantity || ''"
        >
          <a-input-number
            v-model:value="item.quantity" :min="1"
            :formatter="numFormatter" :parser="numParser"
            :status="errors.quantity ? 'error' : undefined"
            class="w-full"
            @change="onFieldChange('quantity')"
          />
        </a-form-item>
      </template>

      <!-- Section: Purchase -->
      <div class="item-section">
        <div class="item-section-header">
          <span class="item-section-title purchase">{{ $t('merchant.orders.items.sectionPurchase') }}</span>
          <span class="exchange-rate-tag buy">1 {{ buyBaseCcy }} = {{ fmtRate(getBuyRate()) }} {{ buyTargetCcy }}</span>
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
        <a-row :gutter="gutter">
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
            <a-form-item :label="`${$t('merchant.orders.items.netCostForeign')} (${buyBaseCcy})`">
              <a-input :value="fmtNum(calc.calcNetCostForeign(item))" disabled class="w-full computed-highlight" />
            </a-form-item>
          </a-col>
          <a-col v-bind="halfCol">
            <a-form-item :label="`${$t('merchant.orders.items.netCostKip')} (${buyTargetCcy})`">
              <a-input :value="fmtNum(calc.calcNetCostLak(item))" disabled class="w-full computed-highlight" />
            </a-form-item>
          </a-col>
        </a-row>
      </div>
      <!-- Section: Discount -->
      <div class="item-section">
        <div class="item-section-header">
          <span class="item-section-title discount">{{ $t('merchant.orders.items.sectionDiscount') }}</span>
        </div>
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
            <a-form-item :label="$t('merchant.orders.items.discountValue')">
              <a-input-number v-model:value="item.discountValue" :min="0" :formatter="numFormatter" :parser="numParser" class="w-full" />
            </a-form-item>
          </a-col>
          <a-col v-if="item.discountType" v-bind="halfCol">
            <a-form-item :label="`${$t('merchant.orders.items.discountForeign')} (${buyBaseCcy})`">
              <a-input :value="fmtNum(calc.calcDiscountForeign(item))" disabled class="w-full" />
            </a-form-item>
          </a-col>
          <a-col v-if="item.discountType" v-bind="halfCol">
            <a-form-item :label="`${$t('merchant.orders.items.discountKip')} (${buyTargetCcy})`">
              <a-input :value="fmtNum(calc.calcDiscountLak(item))" disabled class="w-full" />
            </a-form-item>
          </a-col>
        </a-row>
      </div>
      <!-- Section: Selling -->
      <div class="item-section">
        <div class="item-section-header">
          <span class="item-section-title selling">{{ $t('merchant.orders.items.sectionSelling') }}</span>
          <span class="exchange-rate-tag sell">1 {{ sellBaseCcy }} = {{ fmtRate(getSellRate()) }} {{ sellTargetCcy }}</span>
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
                class="w-full"
                @change="onFieldChange('sellingPriceForeign')"
              />
            </a-form-item>
          </a-col>
          <a-col v-bind="halfCol">
            <a-form-item :label="`${$t('merchant.orders.items.sellingKip')} (${sellTargetCcy})`">
              <a-input :value="fmtNum(calc.calcSellingUnitLak(item))" disabled class="w-full" />
            </a-form-item>
          </a-col>
          <a-col v-bind="halfCol">
            <a-form-item :label="`${$t('merchant.orders.items.sellingTotalForeign')} (${sellBaseCcy})`">
              <a-input :value="fmtNum(calc.calcSellingTotalForeign(item))" disabled class="w-full" />
            </a-form-item>
          </a-col>
          <a-col v-bind="halfCol">
            <a-form-item :label="`${$t('merchant.orders.items.sellingTotalKip')} (${sellTargetCcy})`">
              <a-input :value="fmtNum(calc.calcSellingTotalLak(item))" disabled class="w-full" />
            </a-form-item>
          </a-col>
        </a-row>
      </div>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DeleteOutlined } from '@ant-design/icons-vue';
import { fmtNumber, numFormatter, numParser } from '@/shared/utils/format';
import { useItemCalculations } from '../composables/useItemCalculations';
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
}>();

const emit = defineEmits<{
  (e: 'remove', uid: string): void;
  (e: 'clearError', field: string): void;
}>();

const calc = useItemCalculations(props.getBuyRate, props.getSellRate);

const fmtNum = fmtNumber;
const fmtRate = (val: number) => val.toLocaleString('en-US');

const gutter = computed<[number, number]>(() => props.isMobile ? [12, 0] : [16, 0]);
const halfCol = computed(() => props.isMobile ? { span: 12 } : { sm: 12, md: 6 });

const onFieldChange = (field: string) => {
  if (props.errors[field]) {
    emit('clearError', field);
  }
};
</script>

<style scoped>
.w-full { width: 100%; }
.item-block {
  background: #f8fafc; border-radius: 16px; padding: 18px 20px 4px; margin-bottom: 14px;
  border: 1px solid rgba(148, 163, 184, 0.18); transition: box-shadow 0.15s ease;
}
.item-block:hover { box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06); }
.item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.item-num { font-weight: 800; color: #1d4ed8; font-size: 14px; }
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
.item-section-title.discount { color: #d97706; }
.exchange-rate-tag { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; white-space: nowrap; }
.exchange-rate-tag.buy { background: #ecfdf5; color: #059669; }
.exchange-rate-tag.sell { background: #fff7ed; color: #d97706; }
.computed-highlight:deep(input) { color: #1d4ed8 !important; font-weight: 700; background: #eff6ff !important; }
@media (max-width: 767px) {
  .item-block { padding: 14px 12px 6px; border-radius: 12px; }
  .item-section { padding: 10px 10px 2px; border-radius: 10px; }
  .item-section-title { font-size: 12px; }
  .exchange-rate-tag { font-size: 10px; }
}
</style>
