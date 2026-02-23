<template>
  <a-modal
    :open="open"
    :title="isEdit ? $t('exchangeRates.editRate') : $t('exchangeRates.createRate')"
    :confirm-loading="confirmLoading"
    :width="520"
    @ok="handleOk"
    @cancel="$emit('cancel')"
  >
    <a-form layout="vertical" class="rate-form">
      <a-row :gutter="16">
        <a-col :xs="24" :sm="12">
          <a-form-item :label="$t('exchangeRates.baseCurrency')" required>
            <a-select v-model:value="form.baseCurrency" :placeholder="$t('exchangeRates.selectCurrency')">
              <a-select-option value="THB">THB</a-select-option>
              <a-select-option value="USD">USD</a-select-option>
              <a-select-option value="LAK">LAK</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="12">
          <a-form-item :label="$t('exchangeRates.targetCurrency')" required>
            <a-select v-model:value="form.targetCurrency" :placeholder="$t('exchangeRates.selectCurrency')">
              <a-select-option value="THB">THB</a-select-option>
              <a-select-option value="USD">USD</a-select-option>
              <a-select-option value="LAK">LAK</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :xs="24" :sm="12">
          <a-form-item :label="$t('exchangeRates.rateType')" required>
            <a-select v-model:value="form.rateType" :placeholder="$t('exchangeRates.selectRateType')">
              <a-select-option value="BUY">{{ $t('exchangeRates.buy') }}</a-select-option>
              <a-select-option value="SELL">{{ $t('exchangeRates.sell') }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="12">
          <a-form-item :label="$t('exchangeRates.rate')" required>
            <a-input-number
              v-model:value="form.rate"
              :min="0"
              :step="0.01"
              :placeholder="$t('exchangeRates.ratePlaceholder')"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row v-if="isEdit" :gutter="16">
        <a-col :xs="24" :sm="12">
          <a-form-item :label="$t('exchangeRates.rateDate')">
            <a-input v-model:value="form.rateDate" placeholder="YYYY-MM-DD" />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="12">
          <a-form-item :label="$t('exchangeRates.isActive')">
            <a-switch v-model:checked="form.isActive" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { ExchangeRate, RateType, CurrencyCode } from '@/domain/entities/user.entity';
import { useI18n } from 'vue-i18n';

const { t: $t } = useI18n();

const props = defineProps<{
  open: boolean;
  confirmLoading: boolean;
  exchangeRate?: ExchangeRate | null;
}>();

const emit = defineEmits<{
  (e: 'ok', data: any): void;
  (e: 'cancel'): void;
}>();

const isEdit = !!props.exchangeRate;

const form = reactive({
  baseCurrency: 'THB' as CurrencyCode,
  targetCurrency: 'LAK' as CurrencyCode,
  rateType: 'BUY' as RateType,
  rate: 0,
  rateDate: '',
  isActive: true,
});

watch(() => props.exchangeRate, (val) => {
  if (val) {
    form.baseCurrency = (val.baseCurrency as CurrencyCode) || 'THB';
    form.targetCurrency = (val.targetCurrency as CurrencyCode) || 'LAK';
    form.rateType = val.rateType || 'BUY';
    form.rate = parseFloat(String(val.rate)) || 0;
    form.rateDate = val.rateDate || '';
    form.isActive = val.isActive;
  }
}, { immediate: true });

watch(() => props.open, (val) => {
  if (!val && !props.exchangeRate) {
    form.baseCurrency = 'THB';
    form.targetCurrency = 'LAK';
    form.rateType = 'BUY';
    form.rate = 0;
    form.rateDate = '';
    form.isActive = true;
  }
});

const handleOk = () => {
  emit('ok', { ...form });
};
</script>

<style scoped>
.rate-form :deep(.ant-form-item) { margin-bottom: 14px; }
</style>
