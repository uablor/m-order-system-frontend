import { watch } from 'vue';
import type { Ref } from 'vue';
import type { ItemForm, DraftData } from '../types';

const LS_DRAFT_KEY = 'stock_order_draft';

export function useDraftStorage(
  orderCode: Ref<string>,
  items: Ref<ItemForm[]>,
) {
  let skipNextSave = false;
  let saveTimer: ReturnType<typeof setTimeout> | null = null;

  // Check if draft contains meaningful data that should be restored
  const shouldRestoreDraft = (draft: DraftData): boolean => {
    // Don't restore if there are no items or only empty items
    if (!draft.items || draft.items.length === 0) {
      return false;
    }
    
    // Check if items have meaningful data (product name, variants, etc.)
    const hasMeaningfulItems = draft.items.some(item => {
      // Has product name
      if (item.productName && item.productName.trim()) {
        return true;
      }
      
      // Has variants with data
      if (item.variants && item.variants.length > 0) {
        return item.variants.some(variant => {
          return (variant.variant && variant.variant.trim()) || 
                 variant.purchasePrice > 0 || 
                 variant.sellingPriceForeign > 0 ||
                 (variant.customers && variant.customers.length > 0);
        });
      }
      
      return false;
    });
    
    return hasMeaningfulItems;
  };

  const saveDraft = () => {
    if (skipNextSave) { skipNextSave = false; return; }
    try {
      const draft: DraftData = {
        orderCode: orderCode.value,
        items: JSON.parse(JSON.stringify(items.value)),
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

  const restoreDraft = (forceRestore: boolean = false) => {
    try {
      const raw = localStorage.getItem(LS_DRAFT_KEY);
      if (!raw) return;
      const draft: DraftData = JSON.parse(raw);
      
      // Only restore if it's a meaningful draft or forced restore
      if (!forceRestore && !shouldRestoreDraft(draft)) {
        // Clear the meaningless draft
        localStorage.removeItem(LS_DRAFT_KEY);
        return;
      }
      
      skipNextSave = true;
      
      // Only restore order code if we have meaningful items or it's forced
      if (forceRestore || shouldRestoreDraft(draft)) {
        orderCode.value = draft.orderCode || '';
      } else {
        orderCode.value = '';
      }
      
      items.value = (draft.items || []).map(item => ({
        ...item,
        customers: item.customers || [],
      }));
    } catch { /* ignore */ }
  };

  const clearDraft = () => {
    try { localStorage.removeItem(LS_DRAFT_KEY); } catch { /* ignore */ }
  };

  const clearOrderCode = () => {
    orderCode.value = '';
    saveDraft(); // Save the cleared state
  };

  return { saveDraft, restoreDraft, clearDraft, clearOrderCode, shouldRestoreDraft };
}
