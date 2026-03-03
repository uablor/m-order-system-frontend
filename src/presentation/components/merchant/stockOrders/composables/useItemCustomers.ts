import { ref } from 'vue';
import type { Ref } from 'vue';
import { useRouter } from 'vue-router';
import { customerRepository } from '@/infrastructure/repositories/customer.repository';
import type { Customer } from '@/domain/entities/user.entity';
import { useAuthStore } from '@/store/auth.store';
import { storeToRefs } from 'pinia';
import type { ItemForm, CustomerInItemForm } from '../types';

const LS_NEW_CUSTOMER_KEY = 'stock_order_new_customer';

export function useItemCustomers(
  items: Ref<ItemForm[]>,
  saveDraft: () => void,
) {
  const router = useRouter();
  const authStore = useAuthStore();
  const { authPayload } = storeToRefs(authStore);
  const customerOptions = ref<Customer[]>([]);
  const customerSearching = ref(false);
  let searchTimeout: ReturnType<typeof setTimeout> | null = null;

  const uid = () => String(Date.now()) + Math.random().toString(36).slice(2, 6);

  const addCustomerToItem = (item: ItemForm) => {
    const newCustomer: CustomerInItemForm = { uid: uid(), customerId: undefined, qty: 1 };
    item.customers.push(newCustomer);
  };

  const removeCustomerFromItem = (item: ItemForm, customerUid: string) => {
    item.customers = item.customers.filter(c => c.uid !== customerUid);
  };

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

  const goCreateCustomer = (itemUid: string, customerUid: string) => {
    saveDraft();
    router.push({ path: '/merchant/customers/create', query: { from: 'stock-order', itemUid, customerUid } });
  };

  const handleNewCustomerReturn = () => {
    try {
      const raw = localStorage.getItem(LS_NEW_CUSTOMER_KEY);
      if (!raw) return;
      const data: {
        customerId: number;
        customerName: string;
        customerType: string;
        itemUid?: string;
        customerUid?: string;
      } = JSON.parse(raw);
      localStorage.removeItem(LS_NEW_CUSTOMER_KEY);

      if (!customerOptions.value.find(c => c.id === data.customerId)) {
        customerOptions.value.unshift({
          id: data.customerId,
          customerName: data.customerName,
          customerType: data.customerType as 'CUSTOMER' | 'AGENT',
        } as Customer);
      }

      if (data.itemUid && data.customerUid) {
        const targetItem = items.value.find(i => i.uid === data.itemUid);
        if (targetItem) {
          const targetCustomer = targetItem.customers.find(c => c.uid === data.customerUid);
          if (targetCustomer) targetCustomer.customerId = data.customerId;
        }
      }
    } catch { /* ignore */ }
  };

  return {
    customerOptions,
    customerSearching,
    addCustomerToItem,
    removeCustomerFromItem,
    onCustomerSearch,
    onCustomerFocus,
    fetchCustomers,
    goCreateCustomer,
    handleNewCustomerReturn,
  };
}
