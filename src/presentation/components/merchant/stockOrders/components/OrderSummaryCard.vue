<template>
  <a-card v-if="visible" :bordered="false" class="panel-card mb-4 summary-card">
    <div class="panel-title">
      <CalculatorOutlined class="icon-blue" />
      <span>{{ $t('merchant.orders.summary.title') }}</span>
    </div>

    <!-- Totals section -->
    <a-form layout="vertical">
      <!-- Desktop: 4 cols per row -->
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
      <!-- Mobile: 2 cols per row -->
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

    <!-- Order Detail Breakdown -->
    <div v-if="hasDetail" class="detail-section">
      <div class="detail-divider" />

      <!-- Header row with order code -->
      <div class="detail-header">
        <UnorderedListOutlined class="detail-header-icon" />
        <span class="detail-header-title">{{ $t('merchant.orders.summary.detailTitle') }}</span>
        <span v-if="orderCode" class="order-code-badge">
          <TagOutlined class="order-code-icon" />
          {{ orderCode }}
        </span>
      </div>

      <!-- Items -->
      <div class="detail-items">
        <div
          v-for="(row, iIdx) in orderDetail"
          :key="iIdx"
          class="detail-item-block"
        >
          <!-- Product name row -->
          <div class="detail-product-row">
            <span class="detail-item-num">{{ iIdx + 1 }}</span>
            <span class="detail-product-name">
              {{ row.productName || $t('merchant.orders.summary.productFallback', { number: iIdx + 1 }) }}
            </span>
            <span class="detail-item-total-qty">
              {{ $t('merchant.orders.summary.totalQtyLabel', { qty: row.totalQty }) }}
            </span>
          </div>

          <!-- Variants under this product -->
          <div class="detail-variants">
            <div
              v-for="(variant, vIdx) in row.variants"
              :key="vIdx"
              class="detail-variant-block"
            >
              <!-- Variant label (size/name) -->
              <div class="detail-variant-label">
                <span class="variant-dot" :style="{ background: getVariantColor(vIdx) }" />
                <span class="detail-variant-name">
                  {{ variant.variantName || $t('merchant.orders.summary.variantFallback', { number: vIdx + 1 }) }}
                </span>
                <span class="detail-variant-qty-badge">
                  <!-- {{ $t('merchant.orders.summary.qtyUnit', { qty: variant.totalQty }) }} -->
                </span>
              </div>

              <!-- Customers under this variant -->
              <div class="detail-customers">
                <div
                  v-for="(cust, cIdx) in variant.customers"
                  :key="cIdx"
                  class="detail-customer-row"
                >
                  <span class="cust-index">{{ cIdx + 1 }}.</span>
                  <span class="cust-name">{{ cust.customerName }}</span>
                  <span class="cust-qty">{{ $t('merchant.orders.summary.customerQtyLabel', { qty: cust.qty }) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { CalculatorOutlined, UnorderedListOutlined, TagOutlined } from '@ant-design/icons-vue';
import { fmtNumber } from '@/shared/utils/format';
import type { ItemForm } from '../types';
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
}>();

const { t } = useI18n();
const fmtNum = fmtNumber;

const isBuySameCurrency = computed(() => props.buyBaseCcy === props.buyTargetCcy);
const isSellSameCurrency = computed(() => props.sellBaseCcy === props.sellTargetCcy);

const VARIANT_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#DDA0DD', '#98D8C8'];
const getVariantColor = (idx: number) => VARIANT_COLORS[idx % VARIANT_COLORS.length];

/** Resolve customer name from customerOptions, fallback to ID string */
const getCustomerName = (customerId: number | undefined): string => {
  if (!customerId) return t('merchant.orders.summary.unknownCustomer');
  const found = props.customerOptions?.find(c => c.id === customerId);
  return found?.customerName ?? `#${customerId}`;
};

/** Structured breakdown for display */
const orderDetail = computed(() => {
  if (!props.items || props.items.length === 0) return [];
  return props.items.map(item => {
    const variants = (item.variants ?? []).map(variant => {
      const customers = (variant.customers ?? [])
        .filter(c => (c.qty ?? 0) > 0)
        .map(c => ({
          customerName: getCustomerName(c.customerId),
          qty: c.qty ?? 0,
        }));
      const totalQty = customers.reduce((s, c) => s + c.qty, 0);
      return { variantName: variant.variant || '', customers, totalQty };
    }).filter(v => v.customers.length > 0);

    const totalQty = variants.reduce((s, v) => s + v.totalQty, 0);
    return { productName: item.productName || '', variants, totalQty };
  });
});

const hasDetail = computed(() =>
  !!(props.orderCode || orderDetail.value.some(r => r.variants.length > 0))
);
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
.detail-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(34,197,94,0.25), transparent);
  margin: 4px 0 18px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.detail-header-icon { color: #1d4ed8; font-size: 16px; }
.detail-header-title {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.order-code-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-left: auto;
  background: #eff6ff;
  border: 1.5px solid #bfdbfe;
  border-radius: 20px;
  padding: 3px 12px;
  font-size: 13px;
  font-weight: 700;
  color: #1d4ed8;
}
.order-code-icon { font-size: 12px; }

/* Item blocks */
.detail-items { display: flex; flex-direction: column; gap: 14px; }

.detail-item-block {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.detail-product-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: linear-gradient(90deg, #f8fafc, #f1f5f9);
  border-bottom: 1px solid #e2e8f0;
}
.detail-item-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #1d4ed8;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  flex-shrink: 0;
}
.detail-product-name {
  flex: 1;
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
}
.detail-item-total-qty {
  font-size: 12px;
  font-weight: 700;
  color: #059669;
  background: #d1fae5;
  padding: 2px 9px;
  border-radius: 10px;
}

/* Variants */
.detail-variants { padding: 10px 14px; display: flex; flex-direction: column; gap: 10px; }

.detail-variant-block { display: flex; flex-direction: column; gap: 6px; }

.detail-variant-label {
  display: flex;
  align-items: center;
  gap: 7px;
}
.variant-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.detail-variant-name {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}
.detail-variant-qty-badge {
  margin-left: auto;
  font-size: 11px;
  font-weight: 700;
  color: #1d4ed8;
  background: #eff6ff;
  padding: 1px 8px;
  border-radius: 8px;
}

/* Customers */
.detail-customers {
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.detail-customer-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 10px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #f1f5f9;
}
.cust-index { font-size: 11px; color: #94a3b8; min-width: 16px; }
.cust-name { flex: 1; font-size: 13px; font-weight: 600; color: #1e293b; }
.cust-qty {
  font-size: 12px;
  font-weight: 700;
  color: #7c3aed;
  background: #f5f3ff;
  padding: 1px 8px;
  border-radius: 8px;
}

@media (max-width: 767px) {
  .panel-card { border-radius: 10px; }
  .summary-card { border-radius: 12px; }
  .summary-card :deep(.ant-card-body) { padding: 12px 12px 4px !important; }
  .summary-card :deep(.ant-card-head-title) { font-size: 14px; }
  .detail-header { flex-wrap: wrap; }
  .order-code-badge { margin-left: 0; }
}
</style>
