import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { BackendPagination } from '@/shared/types/backend-response.types';
import type { ExchangeRate } from '@/domain/entities/user.entity';
import type { ExchangeRateListQueryDto } from '@/application/dto/exchange-rate.dto';

const defaultPagination: BackendPagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

export const useSuperAdminExchangeRateStore = defineStore('superAdminExchangeRateStore', () => {
  const loading = ref(false);
  const exchangeRates = ref<ExchangeRate[]>([]);
  const pagination = ref<BackendPagination>({ ...defaultPagination });
  const query = ref<ExchangeRateListQueryDto>({ page: 1, limit: 10, search: undefined });

  const tableData = computed(() => exchangeRates.value);
  const tablePagination = computed(() => pagination.value);
  const currentQuery = computed(() => query.value);

  const setLoading = (value: boolean) => { loading.value = value; };
  const setExchangeRates = (value: ExchangeRate[]) => { exchangeRates.value = value; };
  const setPagination = (value: BackendPagination) => { pagination.value = value; };
  const setQuery = (value: Partial<ExchangeRateListQueryDto>) => { query.value = { ...query.value, ...value }; };
  const resetQuery = () => { query.value = { page: 1, limit: 10, search: undefined }; };

  return {
    loading,
    exchangeRates,
    pagination,
    query,
    tableData,
    tablePagination,
    currentQuery,
    setLoading,
    setExchangeRates,
    setPagination,
    setQuery,
    resetQuery,
  };
});
