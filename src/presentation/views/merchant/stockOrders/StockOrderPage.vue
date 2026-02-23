<template>
  <MerchantLayout>
    <StockOrderContent ref="contentRef" @open-rate-modal="openModal" />
    <ExchangeRateBulkModal ref="bulkModalRef" @submitted="onRatesSubmitted" @skipped="onRatesSkipped" />
  </MerchantLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { isAxiosError } from 'axios';
import MerchantLayout from '../../../../components/layouts/merchant-layouts/AppLayout.vue';
import StockOrderContent from '../../../components/merchant/stockOrders/StockOrderContent.vue';
import ExchangeRateBulkModal from '../../../components/merchant/exchangerate/ExchangeRateBulkModal.vue';
import { exchangeRateRepository } from '@/infrastructure/repositories/exchange-rate.repository';

const bulkModalRef = ref<InstanceType<typeof ExchangeRateBulkModal>>();
const contentRef = ref<InstanceType<typeof StockOrderContent>>();

onMounted(async () => {
  try {
    const res = await exchangeRateRepository.getToday();
    const results = res.results ?? [];
    const hasBuy  = results.some((r) => r.rateType === 'BUY');
    const hasSell = results.some((r) => r.rateType === 'SELL');
    if (hasBuy && hasSell) return;
    if (hasBuy && !hasSell) bulkModalRef.value?.open('sell-only');
    else if (!hasBuy && hasSell) bulkModalRef.value?.open('buy-only');
    else bulkModalRef.value?.open('both');
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 403) return;
    bulkModalRef.value?.open('both');
  }
});

const openModal = () => {
  bulkModalRef.value?.open('both');
};

const onRatesSubmitted = () => {
  contentRef.value?.refreshRates();
};

const onRatesSkipped = () => {
  // user skipped
};
</script>
