import { watch } from 'vue';
import type { Ref } from 'vue';
import type { ItemForm, DraftData } from '../types';

const LS_DRAFT_KEY = 'stock_order_draft';

export function useDraftStorage(
  orderCode: Ref<string>,
  items: Ref<ItemForm[]>,
  shippingPrice: Ref<number>,
  shippingCurrency: Ref<'buy' | 'sell'>,
) {
  let skipNextSave = false;
  let saveTimer: ReturnType<typeof setTimeout> | null = null;

  const shouldRestoreDraft = (draft: DraftData): boolean => {
    if (!draft.items || draft.items.length === 0) return false;
    return draft.items.some(item => {
      if (item.productName && item.productName.trim()) return true;
      if (item.variants && item.variants.length > 0) {
        return item.variants.some(variant =>
          (variant.variant && variant.variant.trim()) ||
          variant.purchasePrice > 0 ||
          variant.sellingPriceForeign > 0 ||
          (variant.customers && variant.customers.length > 0),
        );
      }
      return false;
    });
  };

  const saveDraft = () => {
    if (skipNextSave) { skipNextSave = false; return; }
    try {
      const draft: DraftData = {
        orderCode: orderCode.value,
        items: JSON.parse(JSON.stringify(items.value)),
        shippingPrice: shippingPrice.value,
        shippingCurrency: shippingCurrency.value,
      };
      localStorage.setItem(LS_DRAFT_KEY, JSON.stringify(draft));
    } catch { /* ignore */ }
  };

  const debounceSave = () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(saveDraft, 400);
  };

  watch(orderCode, debounceSave);
  watch(items, debounceSave, { deep: true });
  watch(shippingPrice, debounceSave);
  watch(shippingCurrency, debounceSave);

  const restoreDraft = (forceRestore: boolean = false) => {
    try {
      const raw = localStorage.getItem(LS_DRAFT_KEY);
      if (!raw) return;
      const draft: DraftData = JSON.parse(raw);

      if (!forceRestore && !shouldRestoreDraft(draft)) {
        localStorage.removeItem(LS_DRAFT_KEY);
        return;
      }

      skipNextSave = true;

      if (forceRestore || shouldRestoreDraft(draft)) {
        orderCode.value = draft.orderCode || '';
      } else {
        orderCode.value = '';
      }

      items.value = (draft.items || []).map(item => ({
        ...item,
        customers: item.customers || [],
      }));

      if (draft.shippingPrice !== undefined) shippingPrice.value = draft.shippingPrice;
      if (draft.shippingCurrency) shippingCurrency.value = draft.shippingCurrency;
    } catch { /* ignore */ }
  };

  const clearDraft = () => {
    try { localStorage.removeItem(LS_DRAFT_KEY); } catch { /* ignore */ }
  };

  const clearOrderCode = () => {
    orderCode.value = '';
    saveDraft();
  };

  return { saveDraft, restoreDraft, clearDraft, clearOrderCode, shouldRestoreDraft };
}
