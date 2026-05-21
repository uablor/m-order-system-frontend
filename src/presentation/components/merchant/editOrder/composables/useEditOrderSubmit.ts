import { ref, nextTick } from 'vue';
import type { Ref } from 'vue';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { orderRepository } from '@/infrastructure/repositories/order.repository';
import type { CreateFullOrderDto } from '@/infrastructure/repositories/order.repository';
import { handleApiError } from '@/shared/utils/error';
import type { ItemForm } from '../../stockOrders/types';

export function useEditOrderSubmit(
  orderCode: Ref<string>,
  items: Ref<ItemForm[]>,
  onSuccess: () => void,
  getBuyRateId: () => number | undefined,
  getSellRateId: () => number | undefined,
  shippingPrice: Ref<number>,
  shippingCurrency: Ref<'buy' | 'sell'>,
  editOrderId: number,
  summaryDiscountMode?: Ref<'all' | 'manual'>,
  summaryAllDiscountType?: Ref<'percent' | 'cash' | undefined>,
  summaryAllDiscountValue?: Ref<number>,
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

      const hasVariants = item.variants && item.variants.length > 0;

      if (!hasVariants) {
        if (!item.purchasePrice || item.purchasePrice <= 0) {
          errors[`items.${i}.purchasePrice`] = t('merchant.orders.validation.inline.purchasePrice');
          if (!firstToastMsg) firstToastMsg = t('merchant.orders.validation.purchasePriceRequired', { index: i + 1 });
        }
        if (!item.sellingPriceForeign || item.sellingPriceForeign <= 0) {
          errors[`items.${i}.sellingPriceForeign`] = t('merchant.orders.validation.inline.sellingPrice');
          if (!firstToastMsg) firstToastMsg = t('merchant.orders.validation.sellingPriceRequired', { index: i + 1 });
        }

        if (item.customers.length === 0) {
          errors[`items.${i}.customers`] = t('merchant.orders.validation.inline.customersRequired');
          if (!firstToastMsg) firstToastMsg = t('merchant.orders.validation.customersRequired', { index: i + 1 });
        } else {
          for (let j = 0; j < item.customers.length; j++) {
            const cust = item.customers[j]!;
            if (!cust.customerId) {
              errors[`items.${i}.customers.${j}.customerId`] = t('merchant.orders.validation.inline.customerRequired');
              if (!firstToastMsg) firstToastMsg = t('merchant.orders.validation.customerRequired', { index: i + 1 });
            }
            if (!cust.qty || cust.qty < 1) {
              errors[`items.${i}.customers.${j}.qty`] = t('merchant.orders.validation.inline.quantity');
              if (!firstToastMsg) firstToastMsg = t('merchant.orders.validation.quantityRequired', { index: i + 1 });
            }
          }
        }
      } else {
        // Validate variant-level customers
        for (const variant of item.variants!) {
          if (variant.customers.length === 0) {
            errors[`items.${i}.customers`] = t('merchant.orders.validation.inline.customersRequired');
            if (!firstToastMsg) firstToastMsg = t('merchant.orders.validation.customersRequired', { index: i + 1 });
            break;
          }
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
      const customerMap = new Map<number, { orderItemIndex: number; skuIndex: number; quantity: number; sellingPriceForeign: number }[]>();
      const customerDiscountMap = new Map<number, { discountType?: 'PERCENT' | 'FIX'; discountValue?: number }>();
      const customerOrderIdMap = new Map<number, number>(); // customerId → customerOrderId
      let orderItemIndex = 0;

      const expandedItems: Array<{
        id?: number;
        Index: number;
        productName: string;
        skus: Array<{
          id?: number;
          orderItemSkuIndex: number;
          variant: string;
          quantity: number;
          purchasePrice: number;
          sellingPriceForeign: number;
          exchangeRateBuyId?: number;
          exchangeRateSellId?: number;
        }>;
        discountType?: 'PERCENT' | 'FIX';
        discountValue?: number;
        imageId?: number;
      }> = [];

      const toBackendDiscountType = (dt: 'percent' | 'cash' | undefined): 'PERCENT' | 'FIX' | undefined =>
        dt === 'percent' ? 'PERCENT' : dt === 'cash' ? 'FIX' : undefined;

      items.value.forEach((item) => {
        if (item.variants && item.variants.length > 0) {
          let skuIndex = 0;
          const skus = item.variants
            .map((variant) => {
              const variantTotalQty = variant.customers.reduce((sum, c) => sum + (c.qty || 0), 0);
              if (variantTotalQty < 1) return null;

              const currentSkuIndex = skuIndex++;

              variant.customers.forEach(c => {
                if (!c.customerId) return;
                if (!customerMap.has(c.customerId)) customerMap.set(c.customerId, []);
                customerMap.get(c.customerId)!.push({
                  orderItemIndex: orderItemIndex,
                  skuIndex: currentSkuIndex,
                  quantity: c.qty,
                  sellingPriceForeign: variant.sellingPriceForeign,
                });
                // Track customerOrderId for patch merge
                if (c.customerOrderId && !customerOrderIdMap.has(c.customerId)) {
                  customerOrderIdMap.set(c.customerId, c.customerOrderId);
                }
                if (!customerDiscountMap.get(c.customerId)?.discountType) {
                  if (c.discountType) {
                    customerDiscountMap.set(c.customerId, {
                      discountType: toBackendDiscountType(c.discountType),
                      discountValue: c.discountValue ?? 0,
                    });
                  } else if (item.discountType) {
                    customerDiscountMap.set(c.customerId, {
                      discountType: toBackendDiscountType(item.discountType),
                      discountValue: item.discountValue,
                    });
                  }
                }
              });

              return {
                id: variant.orderItemSkuId,
                orderItemSkuIndex: currentSkuIndex,
                variant: variant.variant.trim() || '',
                quantity: variantTotalQty,
                purchasePrice: variant.purchasePrice,
                sellingPriceForeign: variant.sellingPriceForeign,
                exchangeRateBuyId: getBuyRateId(),
                exchangeRateSellId: getSellRateId(),
              };
            })
            .filter((s): s is NonNullable<typeof s> => s !== null);

          expandedItems.push({
            id: item.orderItemId,
            Index: orderItemIndex++,
            productName: item.productName.trim(),
            skus,
            ...(item.imageId && { imageId: item.imageId }),
          });
        } else {
          expandedItems.push({
            id: item.orderItemId,
            Index: orderItemIndex++,
            productName: item.productName.trim(),
            skus: [{
              id: item.orderItemSkuId,
              orderItemSkuIndex: 0,
              variant: item.variant.trim() || '',
              quantity: item.customers.reduce((sum, c) => sum + (c.qty || 0), 0),
              purchasePrice: item.purchasePrice,
              sellingPriceForeign: item.sellingPriceForeign,
              exchangeRateBuyId: getBuyRateId(),
              exchangeRateSellId: getSellRateId(),
            }],
            ...(item.imageId && { imageId: item.imageId }),
          });

          item.customers.forEach(c => {
            if (!c.customerId) return;
            if (!customerMap.has(c.customerId)) customerMap.set(c.customerId, []);
            customerMap.get(c.customerId)!.push({
              orderItemIndex: expandedItems.length - 1,
              skuIndex: 0,
              quantity: c.qty,
              sellingPriceForeign: item.sellingPriceForeign,
            });
            // Track customerOrderId for patch merge
            if (c.customerOrderId && !customerOrderIdMap.has(c.customerId)) {
              customerOrderIdMap.set(c.customerId, c.customerOrderId);
            }
            if (!customerDiscountMap.get(c.customerId)?.discountType) {
              if (c.discountType) {
                customerDiscountMap.set(c.customerId, {
                  discountType: toBackendDiscountType(c.discountType),
                  discountValue: c.discountValue ?? 0,
                });
              } else if (item.discountType) {
                customerDiscountMap.set(c.customerId, {
                  discountType: toBackendDiscountType(item.discountType),
                  discountValue: item.discountValue,
                });
              }
            }
          });
        }
      });

      const shippingExchangeRateId = shippingCurrency.value === 'sell' ? getSellRateId() : getBuyRateId();
      const exchangeRateBuyId = getBuyRateId();
      const exchangeRateSellId = getSellRateId();

      const payload: CreateFullOrderDto = {
        orderCode: orderCode.value.trim(),
        shippingPrice: shippingPrice.value || undefined,
        ...(exchangeRateBuyId && { exchangeRateBuyId }),
        ...(exchangeRateSellId && { exchangeRateSellId }),
        shippingExchangeRateId,
        items: expandedItems,
        customerOrders: Array.from(customerMap.entries()).map(([customerId, custItems]) => {
          const isAllMode = summaryDiscountMode?.value === 'all';
          const allType = summaryAllDiscountType?.value;
          const allValue = summaryAllDiscountValue?.value ?? 0;

          let discountFields: { discountType?: 'PERCENT' | 'FIX'; discountValue?: number } = {};
          if (isAllMode && allType) {
            discountFields = {
              discountType: toBackendDiscountType(allType),
              discountValue: allValue,
            };
          } else {
            const disc = customerDiscountMap.get(customerId);
            if (disc?.discountType) {
              discountFields = {
                discountType: disc.discountType,
                discountValue: disc.discountValue,
              };
            }
          }

          return {
            id: customerOrderIdMap.get(customerId),
            customerId,
            items: custItems,
            ...discountFields,
          };
        }),
      };

      console.log('🚀 Patching order payload:', JSON.stringify(payload, null, 2));

      await orderRepository.patchFull(editOrderId, payload);
      const toastMsg = t('merchant.orders.toast.updateSuccess');
      message.success(toastMsg === 'merchant.orders.toast.updateSuccess' ? 'Order updated successfully!' : toastMsg);

      clearAllErrors();
      orderCode.value = '';
      items.value.forEach(item => {
        try { localStorage.removeItem(`order-item-${item.uid}-variant-index`); } catch { /* ignore */ }
      });
      try { localStorage.removeItem('stock_order_active_item'); } catch { /* ignore */ }
      items.value = [];
      onSuccess();
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
