import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { BackendPagination } from '@/shared/types/backend-response.types';
import type { Customer } from '@/domain/entities/user.entity';
import type { CustomerListQueryDto } from '@/application/dto/customer.dto';

const defaultPagination: BackendPagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

export const useSuperAdminCustomerStore = defineStore('superAdminCustomerStore', () => {
  const loading = ref(false);
  const customers = ref<Customer[]>([]);
  const pagination = ref<BackendPagination>({ ...defaultPagination });
  const query = ref<CustomerListQueryDto>({ page: 1, limit: 10, search: undefined, merchantId: undefined });

  const tableData = computed(() => customers.value);
  const tablePagination = computed(() => pagination.value);
  const currentQuery = computed(() => query.value);

  const setLoading = (value: boolean) => { loading.value = value; };
  const setCustomers = (value: Customer[]) => { customers.value = value; };
  const setPagination = (value: BackendPagination) => { pagination.value = value; };
  const setQuery = (value: Partial<CustomerListQueryDto>) => { query.value = { ...query.value, ...value }; };
  const resetQuery = () => { query.value = { page: 1, limit: 10, search: undefined, merchantId: undefined }; };

  return {
    loading,
    customers,
    pagination,
    query,
    tableData,
    tablePagination,
    currentQuery,
    setLoading,
    setCustomers,
    setPagination,
    setQuery,
    resetQuery,
  };
});
