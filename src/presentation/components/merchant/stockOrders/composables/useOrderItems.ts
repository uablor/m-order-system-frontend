import { nextTick, ref } from 'vue';
import type { Ref } from 'vue';
import type { ItemForm } from '../types';

export function useOrderItems(isMobile: Ref<boolean>) {
  const items = ref<ItemForm[]>([]);

  const activeItemIdx = ref(0);
  const itemScrollRef = ref<HTMLElement | null>(null);

  const calcActiveIdx = (el: HTMLElement) => {
    const scrollLeft = el.scrollLeft;
    const slideWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth : 1;
    return Math.round(scrollLeft / slideWidth);
  };

  const onItemScroll = () => {
    if (itemScrollRef.value) activeItemIdx.value = calcActiveIdx(itemScrollRef.value);
  };

  const scrollToItem = (i: number) => {
    if (!itemScrollRef.value) return;
    const slide = itemScrollRef.value.children[i] as HTMLElement | undefined;
    slide?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  };

  const uid = () => String(Date.now()) + Math.random().toString(36).slice(2, 6);

  const addItem = () => {
    items.value.push({
      uid: uid(), productName: '', variant: '', quantity: 1,
      purchasePrice: 0, shippingPrice: 0,
      discountType: undefined, discountValue: 0, sellingPriceForeign: 0,
    });
    if (isMobile.value) nextTick(() => scrollToItem(items.value.length - 1));
  };

  const removeItem = (id: string) => {
    items.value = items.value.filter(i => i.uid !== id);
  };

  return {
    items,
    activeItemIdx,
    itemScrollRef,
    onItemScroll,
    scrollToItem,
    addItem,
    removeItem,
  };
}
