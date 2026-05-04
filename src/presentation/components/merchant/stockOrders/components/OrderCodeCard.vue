<template>
  <a-card :bordered="false" class="panel-card mb-4">
    <div class="panel-title">
      <FileTextOutlined class="icon-blue" />
      <span>{{ $t('merchant.orders.form.orderCode') }}</span>
    </div>
    <a-form-item
      :validate-status="error ? 'error' : ''"
      :help="error || ''"
      class="order-code-form-item"
    >
      <a-input
        :value="modelValue"
        :placeholder="$t('merchant.orders.form.orderCodePlaceholder')"
        allow-clear
        size="large"
        :status="error ? 'error' : undefined"
        data-testid="order-code-input"
        @update:value="onInput"
      />
    </a-form-item>

    <!-- Shipping Section -->
    <div class="shipping-title">
      <TruckOutlined class="icon-blue" />
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
          <a-input :value="fmtNum(shippingConverted)" disabled class="w-full" />
        </a-form-item>
      </a-col>
    </a-row>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { FileTextOutlined, TruckOutlined } from '@ant-design/icons-vue';
import { fmtNumber, numFormatter, numParser } from '@/shared/utils/format';

const props = defineProps<{
  modelValue: string;
  error?: string;
  shippingPrice: number;
  shippingCurrency: 'buy' | 'sell';
  buyBaseCcy: string;
  sellBaseCcy: string;
  buyTargetCcy: string;
  sellTargetCcy: string;
  shippingConverted: number;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void;
  (e: 'clearError'): void;
  (e: 'update:shippingPrice', val: number): void;
  (e: 'update:shippingCurrency', val: 'buy' | 'sell'): void;
}>();

const fmtNum = fmtNumber;

const shippingCcy = computed(() =>
  props.shippingCurrency === 'sell' ? props.sellBaseCcy : props.buyBaseCcy,
);
const shippingTargetCcy = computed(() =>
  props.shippingCurrency === 'sell' ? props.sellTargetCcy : props.buyTargetCcy,
);
const shippingIsSameCurrency = computed(() => shippingCcy.value === shippingTargetCcy.value);

const onInput = (val: string) => {
  emit('update:modelValue', val);
  if (props.error) emit('clearError');
};

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
.shipping-title {
  font-size: 14px; font-weight: 700; color: #0f172a;
  display: flex; align-items: center; gap: 8px; margin-bottom: 10px; margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #e2e8f0;
}
.icon-blue { color: #1d4ed8; font-size: 18px; }
.order-code-form-item { margin-bottom: 0; }
.compact-form-item { margin-bottom: 0; }
@media (max-width: 767px) {
  .panel-card { border-radius: 10px; }
  .panel-card :deep(.ant-card-body) { padding: 12px !important; }
}
</style>
