<template>
  <div class="co-block">
    <div class="co-header">
      <span class="co-num">{{ $t('merchant.orders.customerOrders.customer') }} #{{ index + 1 }}</span>
      <a-button type="text" danger size="small" @click="$emit('remove', co.uid)"><DeleteOutlined /></a-button>
    </div>

    <!-- Desktop layout -->
    <template v-if="!isMobile">
      <a-form-item
        :label="$t('merchant.orders.customerOrders.selectCustomer')"
        :validate-status="error ? 'error' : ''"
        :help="error || ''"
      >
        <div class="customer-select-row">
          <a-select v-model:value="co.customerId" show-search :placeholder="$t('merchant.orders.customerOrders.searchCustomerPh')"
            :filter-option="false" :not-found-content="customerSearching ? undefined : null" class="customer-select" size="large"
            :status="error ? 'error' : undefined"
            @search="$emit('customerSearch', $event)" @focus="$emit('customerFocus')" @change="onCustomerChange">
            <template v-if="customerSearching" #notFoundContent><a-spin size="small" /></template>
            <a-select-option v-for="c in customerOptions" :key="c.id" :value="c.id">
              <div class="customer-opt">
                <span class="customer-name">{{ c.customerName }}</span>
                <a-tag size="small" :color="c.customerType === 'AGENT' ? 'purple' : 'blue'" class="customer-type-tag">{{ c.customerType }}</a-tag>
              </div>
            </a-select-option>
          </a-select>
          <a-button type="default" class="create-cust-btn" @click="$emit('createCustomer', co.uid)">
            <template #icon><UserAddOutlined /></template>
            <span>{{ $t('merchant.orders.customerOrders.createNew') }}</span>
          </a-button>
        </div>
      </a-form-item>
      <div class="co-items-title">{{ $t('merchant.orders.customerOrders.assignItems') }}</div>
      <div v-if="itemsError" class="co-items-error">{{ itemsError }}</div>
      <a-empty v-if="items.length === 0" :description="$t('merchant.orders.customerOrders.addItemsFirst')" style="margin:8px 0" />
      <a-row v-if="co.items.length > 0" :gutter="[8, 0]" class="co-col-labels">
        <a-col :sm="6"><span>{{ $t('merchant.orders.customerOrders.selectItem') }}</span></a-col>
        <a-col :sm="3"><span>{{ $t('merchant.orders.customerOrders.qtyLabel') }}</span></a-col>
        <a-col :sm="5"><span>{{ $t('merchant.orders.customerOrders.priceLabel') }} ({{ sellBaseCcy }})</span></a-col>
        <a-col :sm="5"><span>{{ $t('merchant.orders.customerOrders.totalLabel') }} ({{ sellBaseCcy }})</span></a-col>
        <a-col :sm="2"></a-col>
      </a-row>
      <div v-for="(coItem, ciIdx) in co.items" :key="ciIdx" class="co-item-row">
        <a-row :gutter="[8, 8]" align="middle">
          <a-col :sm="6">
            <a-select v-model:value="coItem.orderItemIndex" :placeholder="$t('merchant.orders.customerOrders.selectItem')" style="width:100%" @change="$emit('selectChange', coItem)">
              <a-select-option v-for="(item, iIdx) in items" :key="iIdx" :value="iIdx">#{{ iIdx + 1 }} {{ item.productName || '...' }} {{ item.variant ? `(${item.variant})` : '' }}</a-select-option>
            </a-select>
          </a-col>
          <a-col :sm="3">
            <a-input-number
              :value="coItem.quantity" :min="1" :max="getMaxQty(co, coItem)" :precision="0"
              :formatter="numFormatter" :parser="numParser" style="width:100%"
              @change="(v: number | string | null) => $emit('qtyChange', co, coItem, v)" @wheel.prevent
            />
          </a-col>
          <a-col :sm="5"><a-input-number :value="coItem.sellingPriceForeign" :formatter="numFormatter" disabled style="width:100%" /></a-col>
          <a-col :sm="5"><a-input :value="getCoItemTotal(coItem)" disabled style="width:100%" class="total-display" /></a-col>
          <a-col :sm="2"><a-button type="text" danger size="small" @click="$emit('removeItem', co, ciIdx)"><DeleteOutlined /></a-button></a-col>
        </a-row>
      </div>
    </template>

    <!-- Mobile layout -->
    <template v-else>
      <a-form layout="vertical">
        <a-form-item
          :label="$t('merchant.orders.customerOrders.selectCustomer')"
          :validate-status="error ? 'error' : ''"
          :help="error || ''"
        >
          <a-select v-model:value="co.customerId" show-search :placeholder="$t('merchant.orders.customerOrders.searchCustomerPh')"
            :filter-option="false" :not-found-content="customerSearching ? undefined : null" style="width:100%" size="large"
            :status="error ? 'error' : undefined"
            @search="$emit('customerSearch', $event)" @focus="$emit('customerFocus')" @change="onCustomerChange">
            <template v-if="customerSearching" #notFoundContent><a-spin size="small" /></template>
            <a-select-option v-for="c in customerOptions" :key="c.id" :value="c.id">
              <div class="customer-opt">
                <span class="customer-name">{{ c.customerName }}</span>
                <a-tag size="small" :color="c.customerType === 'AGENT' ? 'purple' : 'blue'" class="customer-type-tag">{{ c.customerType }}</a-tag>
              </div>
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
      <a-button type="default" block class="create-cust-btn-mobile" @click="$emit('createCustomer', co.uid)">
        <template #icon><UserAddOutlined /></template>{{ $t('merchant.orders.customerOrders.createNew') }}
      </a-button>
      <div class="co-items-title">{{ $t('merchant.orders.customerOrders.assignItems') }}</div>
      <div v-if="itemsError" class="co-items-error">{{ itemsError }}</div>
      <div v-for="(coItem, ciIdx) in co.items" :key="ciIdx" class="co-item-row">
        <a-form layout="vertical">
          <a-form-item :label="$t('merchant.orders.customerOrders.selectItem')">
            <a-select v-model:value="coItem.orderItemIndex" style="width:100%" @change="$emit('selectChange', coItem)">
              <a-select-option v-for="(item, iIdx) in items" :key="iIdx" :value="iIdx">#{{ iIdx + 1 }} {{ item.productName || '...' }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-row :gutter="[8, 0]">
            <a-col :span="7">
              <a-form-item :label="$t('merchant.orders.customerOrders.qtyLabel')">
                <a-input-number
                  :value="coItem.quantity" :min="1" :max="getMaxQty(co, coItem)" :precision="0"
                  :formatter="numFormatter" :parser="numParser" class="w-full"
                  @change="(v: number | string | null) => $emit('qtyChange', co, coItem, v)" @wheel.prevent
                />
              </a-form-item>
            </a-col>
            <a-col :span="7">
              <a-form-item :label="`${$t('merchant.orders.customerOrders.priceLabel')} (${sellBaseCcy})`">
                <a-input-number :value="coItem.sellingPriceForeign" :formatter="numFormatter" disabled class="w-full" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item :label="`${$t('merchant.orders.customerOrders.totalLabel')} (${sellBaseCcy})`">
                <a-input :value="getCoItemTotal(coItem)" disabled class="w-full total-display" />
              </a-form-item>
            </a-col>
            <a-col :span="2" class="flex items-center justify-center" style="padding-top:24px">
              <a-button type="text" danger size="small" @click="$emit('removeItem', co, ciIdx)"><DeleteOutlined /></a-button>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </template>

    <a-button type="dashed" block class="add-co-item-btn" :disabled="items.length === 0" @click="onAddItem">
      <template #icon><PlusOutlined /></template>{{ $t('merchant.orders.customerOrders.addItem') }}
    </a-button>
  </div>
</template>

<script setup lang="ts">
import { DeleteOutlined, PlusOutlined, UserAddOutlined } from '@ant-design/icons-vue';
import { numFormatter, numParser } from '@/shared/utils/format';
import type { Customer } from '@/domain/entities/user.entity';
import type { ItemForm, CoItemForm, CustomerOrderForm } from '../types';

const props = defineProps<{
  co: CustomerOrderForm;
  index: number;
  items: ItemForm[];
  isMobile: boolean;
  sellBaseCcy: string;
  customerOptions: Customer[];
  customerSearching: boolean;
  getMaxQty: (co: CustomerOrderForm, coItem: CoItemForm) => number;
  getCoItemTotal: (coItem: CoItemForm) => string;
  error?: string;
  itemsError?: string;
}>();

const emit = defineEmits<{
  (e: 'remove', uid: string): void;
  (e: 'addItem', co: CustomerOrderForm): void;
  (e: 'removeItem', co: CustomerOrderForm, idx: number): void;
  (e: 'selectChange', coItem: CoItemForm): void;
  (e: 'qtyChange', co: CustomerOrderForm, coItem: CoItemForm, val: number | string | null): void;
  (e: 'customerSearch', val: string): void;
  (e: 'customerFocus'): void;
  (e: 'createCustomer', uid: string): void;
  (e: 'clearError'): void;
  (e: 'clearItemsError'): void;
}>();

const onCustomerChange = () => {
  if (props.error) emit('clearError');
};

const onAddItem = () => {
  emit('addItem', props.co);
  if (props.itemsError) emit('clearItemsError');
};
</script>

<style scoped>
.w-full { width: 100%; }
.co-block {
  background: #f8fafc; border-radius: 16px; padding: 18px 20px 10px; margin-bottom: 14px;
  border: 1px solid rgba(148, 163, 184, 0.18); transition: box-shadow 0.15s ease;
}
.co-block:hover { box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06); }
.co-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.co-num { font-weight: 800; color: #1d4ed8; font-size: 14px; }
.co-block :deep(.ant-form-item) { margin-bottom: 12px; }
.co-block :deep(.ant-form-item-label > label) { font-size: 12px; font-weight: 700; color: #64748b; }
.customer-select-row { display: flex; gap: 8px; align-items: flex-start; }
.customer-select { flex: 1; min-width: 0; }
.create-cust-btn { border-radius: 10px; height: 40px; font-weight: 700; display: flex; align-items: center; gap: 6px; white-space: nowrap; flex-shrink: 0; }
.create-cust-btn-mobile { border-radius: 10px; font-weight: 700; margin-bottom: 8px; }
.customer-opt { display: flex; align-items: center; gap: 8px; }
.customer-name { font-weight: 600; }
.customer-type-tag { font-size: 10px; border-radius: 999px; }
.co-items-title { font-size: 13px; font-weight: 700; color: #475569; margin: 10px 0 8px; }
.co-items-error { font-size: 12px; font-weight: 600; color: #ff4d4f; margin: -4px 0 8px; }
.co-col-labels { margin-bottom: 6px; padding: 0 12px; }
.co-col-labels span { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.4px; }
.co-item-row { margin-bottom: 8px; background: #fff; border-radius: 12px; padding: 10px 12px; border: 1px solid rgba(148, 163, 184, 0.12); }
.co-item-row :deep(.ant-input-number), .co-item-row :deep(.ant-select) { width: 100% !important; }
.co-item-row .total-display:deep(input) { color: #1d4ed8 !important; font-weight: 700; background: #eff6ff !important; }
.co-item-row :deep(.ant-input-number-disabled) { background: #f1f5f9 !important; }
.co-item-row :deep(.ant-input-number-disabled .ant-input-number-input) { color: #0f172a !important; font-weight: 600; }
.add-co-item-btn { border-radius: 10px; margin-top: 4px; }
:deep(.ant-input[disabled]) { color: #0f172a !important; font-weight: 600; background: #f1f5f9; font-size: 13px; }
@media (max-width: 767px) {
  .co-block { padding: 14px 12px 6px; border-radius: 12px; }
}
</style>
