import { computed, ref } from 'vue';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { customerService } from '@/infrastructure/services/customer.service';
import type { Customer } from '@/domain/entities/user.entity';
import type { BackendPaginatedResponse } from '@/shared/types/backend-response.types';
import type { CustomerCreateDto, CustomerListQueryDto, CustomerUpdateDto } from '@/application/dto/customer.dto';
import { handleApiError } from '@/shared/utils/error';
import { useSuperAdminCustomerStore } from '@/presentation/stores/super-admin/superAdminCustomer.store';

export function useSuperAdminCustomers() {
  const { t } = useI18n();
  const store = useSuperAdminCustomerStore();
  const selectedCustomer = ref<Customer | null>(null);

  const fetchCustomers = async (overrideQuery: Partial<CustomerListQueryDto> = {}) => {
    const query: CustomerListQueryDto = {
      page: store.query.page,
      limit: store.query.limit,
      search: store.query.search,
      merchantId: store.query.merchantId,
      ...overrideQuery,
    };

    store.setLoading(true);
    try {
      const response: BackendPaginatedResponse<Customer> = await customerService.getList(query);
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

  const createCustomer = async (payload: CustomerCreateDto) => {
    if (!payload.customerName?.trim()) {
      message.error(t('customers.customerNameRequired'));
      return false;
    }
    store.setLoading(true);
    try {
      await customerService.create(payload);
      message.success(t('customers.createSuccess'));
      await fetchCustomers();
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
      await customerService.update(id, payload);
      message.success(t('customers.updateSuccess'));
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
      await customerService.delete(id);
      message.success(t('customers.deleteSuccess'));
      await fetchCustomers();
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

  const setSelectedCustomer = (customer: Customer | null) => {
    selectedCustomer.value = customer;
  };

  return {
    loading: computed(() => store.loading),
    customers: computed(() => store.tableData),
    pagination: computed(() => store.tablePagination),
    selectedCustomer: computed(() => selectedCustomer.value),
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    changePage,
    setSelectedCustomer,
  };
}
