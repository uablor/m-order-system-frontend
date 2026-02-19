<template>
  <MerchantLayout>
    <StockOrderContent />
    <ExchangeRateBulkModal ref="bulkModalRef" @submitted="onRatesSubmitted" @skipped="onRatesSkipped" />
  </MerchantLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { isAxiosError } from 'axios';
import MerchantLayout from '../../../components/layouts/merchant-layouts/AppLayout.vue';
import StockOrderContent from '../../components/merchant/StockOrderContent.vue';
import ExchangeRateBulkModal from '../../components/merchant/ExchangeRateBulkModal.vue';
import { exchangeRateRepository } from '@/infrastructure/repositories/exchange-rate.repository';

const bulkModalRef = ref<InstanceType<typeof ExchangeRateBulkModal>>();

onMounted(async () => {
  try {
    const res = await exchangeRateRepository.getToday();
    const results = res.results ?? [];

    const hasBuy  = results.some((r) => r.rateType === 'BUY');
    const hasSell = results.some((r) => r.rateType === 'SELL');

    if (hasBuy && hasSell) {
      /* ครบทั้ง BUY และ SELL แล้ว — ไม่ต้องแสดง modal */
      return;
    }

    if (hasBuy && !hasSell) {
      /* มีแค่ BUY — แสดงเฉพาะฟอร์ม SELL */
      bulkModalRef.value?.open('sell-only');
    } else if (!hasBuy && hasSell) {
      /* มีแค่ SELL — แสดงเฉพาะฟอร์ม BUY */
      bulkModalRef.value?.open('buy-only');
    } else {
      /* ไม่มีเลย — แสดงทั้ง 2 ฟอร์ม */
      bulkModalRef.value?.open('both');
    }
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 403) {
      /* ผู้ใช้ไม่มี merchant context — ข้ามโดยไม่เปิด modal */
      return;
    }
    /* error อื่น (network, 500) — เปิด modal แบบ 2 ฟอร์มเป็น fallback */
    bulkModalRef.value?.open('both');
  }
});

const onRatesSubmitted = () => {
  // rates saved — stay on page
};

const onRatesSkipped = () => {
  // user skipped — stay on page
};
</script>
