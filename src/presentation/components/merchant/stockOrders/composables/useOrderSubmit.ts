import { ref, nextTick } from 'vue';
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
  const fieldErrors = ref<Record<string, string>>({});

  const clearFieldError = (key: string) => {
    if (fieldErrors.value[key]) {
      const next = { ...fieldErrors.value };
      delete next[key];
      fieldErrors.value = next;
    }
  };

  const clearAllErrors = () => {
    fieldErrors.value = {};
  };

  const scrollToFirstError = () => {
    nextTick(() => {
      nextTick(() => {
        const el = document.querySelector(
          '.ant-form-item-has-error, [data-validate-status="error"]',
        );
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          nextTick(() => {
            const input = el.querySelector(
              'input, .ant-input-number-input',
            ) as HTMLElement | null;
            input?.focus();
          });
        }
      });
    });
  };

  const validate = (): boolean => {
    clearAllErrors();
    const errors: Record<string, string> = {};
    let firstToastMsg = '';

    if (!orderCode.value.trim()) {
      errors['orderCode'] = t('merchant.orders.validation.inline.orderCode');
      if (!firstToastMsg) firstToastMsg = t('merchant.orders.validation.orderCodeRequired');
    }

    if (items.value.length === 0) {
      message.warning(t('merchant.orders.validation.atLeastOneItem'));
      return false;
    }

    for (let i = 0; i < items.value.length; i++) {
      const item = items.value[i]!;
      if (!item.productName.trim()) {
        errors[`items.${i}.productName`] = t('merchant.orders.validation.inline.productName');
        if (!firstToastMsg) firstToastMsg = t('merchant.orders.validation.productNameRequired', { index: i + 1 });
      }
      if (item.quantity < 1) {
        errors[`items.${i}.quantity`] = t('merchant.orders.validation.inline.quantity');
        if (!firstToastMsg) firstToastMsg = t('merchant.orders.validation.quantityRequired', { index: i + 1 });
      }
      if (!item.purchasePrice || item.purchasePrice <= 0) {
        errors[`items.${i}.purchasePrice`] = t('merchant.orders.validation.inline.purchasePrice');
        if (!firstToastMsg) firstToastMsg = t('merchant.orders.validation.purchasePriceRequired', { index: i + 1 });
      }
      if (!item.sellingPriceForeign || item.sellingPriceForeign <= 0) {
        errors[`items.${i}.sellingPriceForeign`] = t('merchant.orders.validation.inline.sellingPrice');
        if (!firstToastMsg) firstToastMsg = t('merchant.orders.validation.sellingPriceRequired', { index: i + 1 });
      }
    }

    const validCo = customerOrders.value.filter(co => co.customerId != null);
    if (validCo.length === 0) {
      errors['customerOrders'] = t('merchant.orders.validation.inline.atLeastOneCustomer');
      if (!firstToastMsg) firstToastMsg = t('merchant.orders.validation.atLeastOneCustomer');
    } else {
      for (let i = 0; i < customerOrders.value.length; i++) {
        const co = customerOrders.value[i]!;
        if (co.customerId == null) {
          errors[`customerOrders.${i}.customerId`] = t('merchant.orders.validation.inline.customerRequired');
          if (!firstToastMsg) firstToastMsg = t('merchant.orders.validation.customerRequired', { index: i + 1 });
        } else if (co.items.length === 0) {
          errors[`customerOrders.${i}.items`] = t('merchant.orders.validation.inline.coItemsRequired');
          if (!firstToastMsg) firstToastMsg = t('merchant.orders.validation.coItemsRequired', { index: i + 1 });
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      fieldErrors.value = errors;
      message.warning(firstToastMsg);
      scrollToFirstError();
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
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
      clearAllErrors();
      orderCode.value = '';
      items.value = [];
      customerOrders.value = [];
      clearDraft();
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: {
          data?: {
            message?: string | string[];
            errors?: Record<string, string>;
          };
        };
      };
      const data = axiosErr?.response?.data;
      const rawMsg: string =
        typeof data?.message === 'string'
          ? data.message
          : Array.isArray(data?.message)
            ? data.message[0] ?? ''
            : '';

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
      } else if (data?.errors && typeof data.errors === 'object') {
        fieldErrors.value = { ...data.errors };
        const firstKey = Object.keys(data.errors)[0];
        if (firstKey) {
          message.error(data.errors[firstKey]!);
          scrollToFirstError();
        }
      } else if (Array.isArray(data?.message) && data.message.length > 0) {
        for (const msg of data.message) {
          message.error(msg);
        }
      } else {
        handleApiError(err, t);
      }
    } finally {
      submitting.value = false;
    }
  };

  return { submitting, fieldErrors, clearFieldError, handleSubmit };
}
