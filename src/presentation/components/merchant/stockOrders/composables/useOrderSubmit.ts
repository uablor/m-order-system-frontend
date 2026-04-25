import { ref, nextTick } from 'vue';
import type { Ref } from 'vue';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { orderRepository } from '@/infrastructure/repositories/order.repository';
import type { CreateFullOrderDto } from '@/infrastructure/repositories/order.repository';
import { handleApiError } from '@/shared/utils/error';
import type { ItemForm } from '../types';

export function useOrderSubmit(
  orderCode: Ref<string>,
  items: Ref<ItemForm[]>,
  onSuccess: () => void,
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
      if (!item.purchasePrice || item.purchasePrice <= 0) {
        errors[`items.${i}.purchasePrice`] = t('merchant.orders.validation.inline.purchasePrice');
        if (!firstToastMsg) firstToastMsg = t('merchant.orders.validation.purchasePriceRequired', { index: i + 1 });
      }
      if (!item.sellingPriceForeign || item.sellingPriceForeign <= 0) {
        errors[`items.${i}.sellingPriceForeign`] = t('merchant.orders.validation.inline.sellingPrice');
        if (!firstToastMsg) firstToastMsg = t('merchant.orders.validation.sellingPriceRequired', { index: i + 1 });
      }

      // Each item must have at least 1 customer assigned
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
      // Transform nested structure → backend format
      const customerMap = new Map<number, { orderItemIndex: number; skuIndex: number; quantity: number; sellingPriceForeign: number }[]>();
      let orderItemIndex = 0;
      
      // Expand each item with variants into separate order items
      const expandedItems: Array<{
        Index: number;
        productName: string;
        skus: Array<{
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
        shippingPrice?: number;
      }> = [];
      
      items.value.forEach((item) => {
        if (item.variants && item.variants.length > 0) {
          // Create ONE order item with multiple SKUs for all variants
          const skus = item.variants.map((variant, variantIndex) => {
            const variantTotalQty = variant.customers.reduce((sum, c) => sum + (c.qty || 0), 0);
            
            // Map customers for this variant
            variant.customers.forEach(c => {
              if (!c.customerId) return;
              if (!customerMap.has(c.customerId)) customerMap.set(c.customerId, []);
              customerMap.get(c.customerId)!.push({
                orderItemIndex: orderItemIndex, // ✅ Always 0 for single order item
                skuIndex: variantIndex, // ✅ Use variant index as skuIndex
                quantity: c.qty,
                sellingPriceForeign: variant.sellingPriceForeign,
              });
            });
            
            return {
              orderItemSkuIndex: variantIndex, // ✅ Use variant index
              variant: variant.variant.trim() || '',
              quantity: variantTotalQty,
              purchasePrice: variant.purchasePrice,
              sellingPriceForeign: variant.sellingPriceForeign,
              exchangeRateBuyId: 1, // Default value - you may want to get this from UI
              exchangeRateSellId: 2 // Default value - you may want to get this from UI
            };
          });
          
          expandedItems.push({
            Index: orderItemIndex++,
            productName: item.productName.trim(),
            skus: skus, // ✅ Multiple SKUs in one order item
            discountType: item.discountType === 'percent' ? 'PERCENT' : (item.discountType === 'cash' ? 'FIX' : undefined), // ✅ Use item level
            discountValue: item.discountType ? item.discountValue : undefined, // ✅ Use item level
            ...(item.imageId && { imageId: item.imageId }),
            shippingPrice: item.shippingPrice || undefined // ✅ Use item level
          });
        } else {
          // No variants - create single order item as before
          expandedItems.push({
            Index: orderItemIndex++,
            productName: item.productName.trim(),
            skus: [{
              orderItemSkuIndex: 0,
              variant: item.variant.trim() || '',
              quantity: item.customers.reduce((sum, c) => sum + (c.qty || 0), 0),
              purchasePrice: item.purchasePrice,
              sellingPriceForeign: item.sellingPriceForeign,
              exchangeRateBuyId: 1, // Default value - you may want to get this from UI
              exchangeRateSellId: 2 // Default value - you may want to get this from UI
            }],
            discountType: item.discountType === 'percent' ? 'PERCENT' : (item.discountType === 'cash' ? 'FIX' : undefined), // ✅ Use item level
            discountValue: item.discountType ? item.discountValue : undefined, // ✅ Use item level
            ...(item.imageId && { imageId: item.imageId }),
            shippingPrice: item.shippingPrice || undefined // ✅ Use item level
          });
          
          // Map customers for this item
          item.customers.forEach(c => {
            if (!c.customerId) return;
            if (!customerMap.has(c.customerId)) customerMap.set(c.customerId, []);
            customerMap.get(c.customerId)!.push({
              orderItemIndex: expandedItems.length - 1,
              skuIndex: 0, // Always 0 for single variant items
              quantity: c.qty,
              sellingPriceForeign: item.sellingPriceForeign,
            });
          });
        }
      });

      const payload: CreateFullOrderDto = {
        orderCode: orderCode.value.trim(),
        items: expandedItems,
        customerOrders: Array.from(customerMap.entries()).map(([customerId, custItems]) => ({
          customerId,
          items: custItems,
        })),
      };

      console.log('🚀 Submitting order payload:', JSON.stringify(payload, null, 2));
      console.log('📸 Items with imageId:', expandedItems.map(item => ({ 
        productName: item.productName, 
        imageId: item.imageId,
        hasImage: !!item.imageId 
      })));

      await orderRepository.createFull(payload);
      message.success(t('merchant.orders.toast.createSuccess'));
      clearAllErrors();
      orderCode.value = '';
      // Clear per-item variant-index keys from localStorage before wiping items array
      items.value.forEach(item => {
        try { localStorage.removeItem(`order-item-${item.uid}-variant-index`); } catch { /* ignore */ }
      });
      try { localStorage.removeItem('stock_order_active_item'); } catch { /* ignore */ }
      items.value = [];
      onSuccess(); // Call the success callback which handles clearing
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
