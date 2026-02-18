import { computed } from 'vue';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { customerRepository } from '@/infrastructure/repositories/customer.repository';
import { merchantRepository } from '@/infrastructure/repositories/merchant.repository';
import type { Customer } from '@/domain/entities/user.entity';
import type { BackendPaginatedResponse } from '@/shared/types/backend-response.types';
import type { CustomerCreateDto, CustomerListQueryDto, CustomerUpdateDto } from '@/application/dto/customer.dto';
import { handleApiError } from '@/shared/utils/error';
import { useMerchantCustomerStore } from '@/presentation/stores/merchant/merchantCustomer.store';

/**
 * Business logic สำหรับ Merchant: Customer/Agent CRUD
 * - list / pagination / search / CRUD
 * หมายเหตุ: backend ต้องส่ง merchantId (optional) เราจึงดึง merchant ของ current user จาก GET /merchants
 */
export function useMerchantCustomers() {
  const { t } = useI18n();
  const store = useMerchantCustomerStore();

  const ensureMerchantId = async (): Promise<number | null> => {
    if (store.merchantId != null && store.merchantId !== null) return store.merchantId;
    try {
      const res = await merchantRepository.getList({ page: 1, limit: 1 });
      const first = res.results?.[0];
      if (!first) return null;
      store.setMerchantId(first.id);
      return first.id;
    } catch (error) {
      handleApiError(error, t);
      return null;
    }
  };

  const fetchCustomers = async (overrideQuery: Partial<CustomerListQueryDto> = {}) => {
    const merchantId = await ensureMerchantId();
    if (!merchantId) {
      message.error('Merchant not found for current user');
      return false;
    }

    const query: CustomerListQueryDto = {
      page: store.query.page,
      limit: store.query.limit,
      merchantId,
      search: store.query.search,
      ...overrideQuery,
    };

    store.setLoading(true);
    try {
      const response: BackendPaginatedResponse<Customer> = await customerRepository.getList(query);
      store.setCustomers(response.results);
      store.setPagination(response.pagination);
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  const searchCustomers = async (searchText: string) => {
    store.setQuery({ page: 1, search: searchText || undefined });
    await fetchCustomers();
  };

  const changePage = async (page: number, limit: number) => {
    store.setQuery({ page, limit });
    await fetchCustomers();
  };

  const createCustomer = async (payload: Omit<CustomerCreateDto, 'merchantId'>) => {
    const merchantId = await ensureMerchantId();
    if (!merchantId) {
      message.error('Merchant not found for current user');
      return false;
    }
    if (!payload.customerName?.trim()) {
      message.error(t('merchant.customers.form.customerNameRequired'));
      return false;
    }

    store.setLoading(true);
    try {
      await customerRepository.create({ ...payload, merchantId });
      message.success(t('merchant.customers.toast.createSuccess'));
      await fetchCustomers({ page: 1 });
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  const updateCustomer = async (id: number, payload: CustomerUpdateDto) => {
    store.setLoading(true);
    try {
      await customerRepository.update(id, payload);
      message.success(t('merchant.customers.toast.updateSuccess'));
      await fetchCustomers();
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  const deleteCustomer = async (id: number) => {
    store.setLoading(true);
    try {
      await customerRepository.delete(id);
      message.success(t('merchant.customers.toast.deleteSuccess'));
      await fetchCustomers();
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  return {
    loading: computed(() => store.loading),
    customers: computed(() => store.tableData),
    pagination: computed(() => store.tablePagination),
    fetchCustomers,
    searchCustomers,
    changePage,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
}

