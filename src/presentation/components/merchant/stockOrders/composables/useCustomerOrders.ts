import { nextTick, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { customerRepository } from '@/infrastructure/repositories/customer.repository';
import type { Customer } from '@/domain/entities/user.entity';
import { useAuthStore } from '@/store/auth.store';
import { storeToRefs } from 'pinia';
import { fmtNumber } from '@/shared/utils/format';
import type { ItemForm, CoItemForm, CustomerOrderForm } from '../types';

const LS_NEW_CUSTOMER_KEY = 'stock_order_new_customer';

export function useCustomerOrders(
  items: Ref<ItemForm[]>,
  customerOrders: Ref<CustomerOrderForm[]>,
  isMobile: Ref<boolean>,
  saveDraft: () => void,
) {
  const { t } = useI18n();
  const router = useRouter();
  const authStore = useAuthStore();
  const { authPayload } = storeToRefs(authStore);
  const customerOptions = ref<Customer[]>([]);
  const customerSearching = ref(false);
  let searchTimeout: ReturnType<typeof setTimeout> | null = null;

  const activeCoIdx = ref(0);
  const coScrollRef = ref<HTMLElement | null>(null);

  const calcActiveIdx = (el: HTMLElement) => {
    const scrollLeft = el.scrollLeft;
    const slideWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth : 1;
    return Math.round(scrollLeft / slideWidth);
  };

  const onCoScroll = () => {
    if (coScrollRef.value) activeCoIdx.value = calcActiveIdx(coScrollRef.value);
  };

  const scrollToCo = (i: number) => {
    if (!coScrollRef.value) return;
    const slide = coScrollRef.value.children[i] as HTMLElement | undefined;
    slide?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  };

  const uid = () => String(Date.now()) + Math.random().toString(36).slice(2, 6);

  const addCustomerOrder = () => {
    customerOrders.value.push({ uid: uid(), customerId: undefined, items: [] });
    if (isMobile.value) nextTick(() => scrollToCo(customerOrders.value.length - 1));
  };

  const removeCustomerOrder = (id: string) => {
    customerOrders.value = customerOrders.value.filter(co => co.uid !== id);
  };

  const addCoItem = (co: CustomerOrderForm) => {
    const defaultPrice = items.value.length > 0 ? (items.value[0]?.sellingPriceForeign ?? 0) : 0;
    co.items.push({ orderItemIndex: 0, quantity: 1, sellingPriceForeign: defaultPrice });
  };

  const removeCoItem = (co: CustomerOrderForm, idx: number) => {
    co.items.splice(idx, 1);
  };

  const onCoItemSelectChange = (coItem: CoItemForm) => {
    const src = items.value[coItem.orderItemIndex];
    if (src) coItem.sellingPriceForeign = src.sellingPriceForeign;
  };

  const coItemTotal = (coItem: CoItemForm) =>
    fmtNumber((coItem.quantity || 0) * (coItem.sellingPriceForeign || 0));

  const getMaxQtyForCoItem = (_currentCo: CustomerOrderForm, currentCoItem: CoItemForm): number => {
    const itemIdx = currentCoItem.orderItemIndex;
    const totalQty = items.value[itemIdx]?.quantity ?? 0;
    let assignedByOthers = 0;
    for (const co of customerOrders.value) {
      for (const ci of co.items) {
        if (ci === currentCoItem) continue;
        if (ci.orderItemIndex === itemIdx) assignedByOthers += ci.quantity || 0;
      }
    }
    return Math.max(1, totalQty - assignedByOthers);
  };

  const onCoItemQtyChange = (co: CustomerOrderForm, coItem: CoItemForm, newVal: number | string | null) => {
    const val = Number(newVal) || 1;
    const itemIdx = coItem.orderItemIndex;
    const totalQty = items.value[itemIdx]?.quantity ?? 0;
    const productName = items.value[itemIdx]?.productName || `#${itemIdx + 1}`;
    const maxQty = getMaxQtyForCoItem(co, coItem);

    if (val > maxQty) {
      coItem.quantity = maxQty;
      const assignedByOthers = totalQty - maxQty;
      const remainingQty = totalQty - assignedByOthers;
      message.warning(t('merchant.orders.toast.qtyExceeded', { productName, totalQty, remainingQty }));
    } else if (val < 1) {
      coItem.quantity = 1;
    } else {
      coItem.quantity = val;
    }
  };

  watch(
    () => items.value.map(i => i.quantity),
    () => {
      for (const co of customerOrders.value) {
        for (const coItem of co.items) {
          const max = getMaxQtyForCoItem(co, coItem);
          if (coItem.quantity > max) coItem.quantity = max;
        }
      }
    },
    { deep: true },
  );

  let syncPriceTimer: ReturnType<typeof setTimeout> | null = null;
  watch(
    () => items.value.map(i => i.sellingPriceForeign),
    () => {
      if (syncPriceTimer) clearTimeout(syncPriceTimer);
      syncPriceTimer = setTimeout(() => {
        for (const co of customerOrders.value) {
          for (const coItem of co.items) {
            const src = items.value[coItem.orderItemIndex];
            if (src) coItem.sellingPriceForeign = src.sellingPriceForeign;
          }
        }
      }, 1000);
    },
    { deep: true },
  );

  const onCustomerSearch = (val: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => fetchCustomers(val), 300);
  };

  const onCustomerFocus = () => {
    if (customerOptions.value.length === 0) fetchCustomers('');
  };

  const fetchCustomers = async (search: string) => {
    customerSearching.value = true;
    try {
      const mid = authPayload.value?.merchantId;
      const res = await customerRepository.getList({ merchantId: mid, search: search || undefined, limit: 50 });
      customerOptions.value = res.results ?? [];
    } catch (err) {
      console.error('[StockOrder] fetchCustomers failed:', err);
    } finally {
      customerSearching.value = false;
    }
  };

  const goCreateCustomer = (coUid: string) => {
    saveDraft();
    router.push({ path: '/merchant/customers/create', query: { from: 'stock-order', coUid } });
  };

  const handleNewCustomerReturn = () => {
    try {
      const raw = localStorage.getItem(LS_NEW_CUSTOMER_KEY);
      if (!raw) return;
      const data: { customerId: number; customerName: string; customerType: string; coUid: string } = JSON.parse(raw);
      localStorage.removeItem(LS_NEW_CUSTOMER_KEY);
      if (!customerOptions.value.find(c => c.id === data.customerId)) {
        customerOptions.value.unshift({
          id: data.customerId,
          customerName: data.customerName,
          customerType: data.customerType as 'CUSTOMER' | 'AGENT',
        } as Customer);
      }
      const target = customerOrders.value.find(co => co.uid === data.coUid);
      if (target) target.customerId = data.customerId;
    } catch { /* ignore */ }
  };

  return {
    customerOptions,
    customerSearching,
    activeCoIdx,
    coScrollRef,
    onCoScroll,
    scrollToCo,
    addCustomerOrder,
    removeCustomerOrder,
    addCoItem,
    removeCoItem,
    onCoItemSelectChange,
    coItemTotal,
    getMaxQtyForCoItem,
    onCoItemQtyChange,
    onCustomerSearch,
    onCustomerFocus,
    fetchCustomers,
    goCreateCustomer,
    handleNewCustomerReturn,
  };
}
