<template>
  <MerchantLayout>
    <div v-if="loading" style="display: flex; justify-content: center; padding: 60px">
      <a-spin size="large" />
    </div>
    <a-result
      v-else-if="error"
      status="404"
      title="ບໍ່ພົບຂໍ້ມູນ"
      sub-title="ບໍ່ສາມາດໂຫລດຂໍ້ມູນ Order ໄດ້"
    >
      <template #extra>
        <a-button type="primary" @click="router.push('/merchant/orders')">ກັບໄປລາຍການ</a-button>
      </template>
    </a-result>
    <StockOrderContent
      v-else-if="order"
      ref="contentRef"
      :edit-order-id="orderId"
      :initial-order-code="initialOrderCode"
      :initial-items="initialItems"
      :initial-shipping-price="initialShippingPrice"
      :initial-shipping-currency="initialShippingCurrency"
      @open-rate-modal="openModal"
    />
    <ExchangeRateBulkModal ref="bulkModalRef" @submitted="onRatesSubmitted" @skipped="() => {}" />
  </MerchantLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MerchantLayout from '../../../../components/layouts/merchant-layouts/AppLayout.vue';
import StockOrderContent from '../../../components/merchant/stockOrders/StockOrderContent.vue';
import ExchangeRateBulkModal from '../../../components/merchant/exchangerate/ExchangeRateBulkModal.vue';
import { orderRepository } from '@/infrastructure/repositories/order.repository';
import { orderToItemForms } from '@/shared/utils/orderToItemForms';
import { handleApiError } from '@/shared/utils/error';
import { useI18n } from 'vue-i18n';
import type { Order } from '@/domain/entities/user.entity';
import type { ItemForm } from '../../../components/merchant/stockOrders/types';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const bulkModalRef = ref<InstanceType<typeof ExchangeRateBulkModal>>();
const contentRef = ref<InstanceType<typeof StockOrderContent>>();

const loading = ref(false);
const error = ref(false);
const order = ref<Order | null>(null);
const orderId = ref<number>(0);
const initialOrderCode = ref('');
const initialItems = ref<ItemForm[]>([]);
const initialShippingPrice = ref(0);
const initialShippingCurrency = ref<'buy' | 'sell'>('buy');

onMounted(async () => {
  const id = Number(route.params.id);
  if (!id) {
    error.value = true;
    return;
  }
  orderId.value = id;
  loading.value = true;
  try {
    order.value = await orderRepository.getById(id);
    const mapped = orderToItemForms(order.value);
    initialOrderCode.value = mapped.orderCode;
    initialItems.value = mapped.items;
    initialShippingPrice.value = mapped.shippingPrice;
    initialShippingCurrency.value = mapped.shippingCurrency;
  } catch (err) {
    error.value = true;
    handleApiError(err, t);
  } finally {
    loading.value = false;
  }
});

const openModal = (data?: {
  buy: { baseCurrency: string; targetCurrency: string; rate: number | undefined };
  sell: { baseCurrency: string; targetCurrency: string; rate: number | undefined };
}) => {
  bulkModalRef.value?.open('both', data);
};

const onRatesSubmitted = () => {
  contentRef.value?.refreshRates();
};
</script>
