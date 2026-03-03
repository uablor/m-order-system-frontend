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

  const restoreDraft = () => {
    try {
      const raw = localStorage.getItem(LS_DRAFT_KEY);
      if (!raw) return;
      const draft: DraftData = JSON.parse(raw);
      skipNextSave = true;
      orderCode.value = draft.orderCode || '';
      items.value = (draft.items || []).map(item => ({
        ...item,
        customers: item.customers || [],
      }));
    } catch { /* ignore */ }
  };

  const clearDraft = () => {
    try { localStorage.removeItem(LS_DRAFT_KEY); } catch { /* ignore */ }
  };

  return { saveDraft, restoreDraft, clearDraft };
}
