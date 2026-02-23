import { computed, ref } from 'vue';
import type { Ref } from 'vue';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { orderRepository } from '@/infrastructure/repositories/order.repository';
import type { CreateFullOrderDto } from '@/infrastructure/repositories/order.repository';
import { handleApiError } from '@/shared/utils/error';
import type { ItemForm, CustomerOrderForm } from '../types';

export function useOrderSubmit(
  orderCode: Ref<string>,
  items: Ref<ItemForm[]>,
  customerOrders: Ref<CustomerOrderForm[]>,
  clearDraft: () => void,
) {
  const { t } = useI18n();
  const submitting = ref(false);

  const canSubmit = computed(() => {
    if (!orderCode.value.trim()) return false;
    if (items.value.length === 0) return false;
    if (items.value.some(i => !i.productName.trim() || i.quantity < 1)) return false;
    return true;
  });

  const handleSubmit = async () => {
    if (!canSubmit.value) return;
    submitting.value = true;
    try {
      const payload: CreateFullOrderDto = {
        orderCode: orderCode.value.trim(),
        items: items.value.map((item, idx) => ({
          Index: idx,
          productName: item.productName.trim(),
          variant: item.variant.trim() || undefined,
          quantity: item.quantity,
          purchasePrice: item.purchasePrice,
          shippingPrice: item.shippingPrice || undefined,
          discountType: item.discountType || undefined,
          discountValue: item.discountType ? item.discountValue : undefined,
          sellingPriceForeign: item.sellingPriceForeign,
        })),
        customerOrders: customerOrders.value
          .filter(co => co.customerId != null && co.items.length > 0)
          .map(co => ({
            customerId: co.customerId!,
            items: co.items.map(ci => ({
              orderItemIndex: ci.orderItemIndex,
              quantity: ci.quantity,
              sellingPriceForeign: ci.sellingPriceForeign || undefined,
            })),
          })),
      };
      await orderRepository.createFull(payload);
      message.success(t('merchant.orders.toast.createSuccess'));
      orderCode.value = '';
      items.value = [];
      customerOrders.value = [];
      clearDraft();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const rawMsg: string = axiosErr?.response?.data?.message ?? '';
      const insufficientMatch = rawMsg.match(
        /Insufficient stock for item[^\:]*[:\s]+"?([^"]+)"?\s*:\s*requested\s+(\d+),\s*available\s+(\d+)/i,
      );
      if (insufficientMatch) {
        const [, productNameRaw, requested, available] = insufficientMatch;
        message.error(
          t('merchant.orders.toast.insufficientStock', {
            productName: (productNameRaw ?? '').trim(),
            requested,
            available,
          }),
        );
      } else {
        handleApiError(err, t);
      }
    } finally {
      submitting.value = false;
    }
  };

  return { submitting, canSubmit, handleSubmit };
}
