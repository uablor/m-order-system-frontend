import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { BackendPagination } from '@/shared/types/backend-response.types';
import type { Merchant } from '@/domain/entities/user.entity';
import type { MerchantListQueryDto } from '@/application/dto/merchant.dto';

const defaultPagination: BackendPagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

export const useSuperAdminMerchantStore = defineStore('superAdminMerchantStore', () => {
  const loading = ref(false);
  const merchants = ref<Merchant[]>([]);
  const pagination = ref<BackendPagination>({ ...defaultPagination });
  const query = ref<MerchantListQueryDto>({ page: 1, limit: 10, search: undefined });

  const tableData = computed(() => merchants.value);
  const tablePagination = computed(() => pagination.value);
  const currentQuery = computed(() => query.value);

  const setLoading = (value: boolean) => { loading.value = value; };
  const setMerchants = (value: Merchant[]) => { merchants.value = value; };
  const setPagination = (value: BackendPagination) => { pagination.value = value; };
  const setQuery = (value: Partial<MerchantListQueryDto>) => { query.value = { ...query.value, ...value }; };
  const resetQuery = () => { query.value = { page: 1, limit: 10, search: undefined }; };

  return {
    loading,
    merchants,
    pagination,
    query,
    tableData,
    tablePagination,
    currentQuery,
    setLoading,
    setMerchants,
    setPagination,
    setQuery,
    resetQuery,
  };
});
