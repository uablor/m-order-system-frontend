import { computed, ref } from 'vue';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { exchangeRateService } from '@/infrastructure/services/exchange-rate.service';
import type { ExchangeRate } from '@/domain/entities/user.entity';
import type { BackendPaginatedResponse } from '@/shared/types/backend-response.types';
import type { ExchangeRateCreateDto, ExchangeRateListQueryDto, ExchangeRateUpdateDto } from '@/application/dto/exchange-rate.dto';
import { handleApiError } from '@/shared/utils/error';
import { useSuperAdminExchangeRateStore } from '@/presentation/stores/super-admin/superAdminExchangeRate.store';

export function useSuperAdminExchangeRates() {
  const { t } = useI18n();
  const store = useSuperAdminExchangeRateStore();
  const selectedRate = ref<ExchangeRate | null>(null);

  const fetchExchangeRates = async (overrideQuery: Partial<ExchangeRateListQueryDto> = {}) => {
    const query: ExchangeRateListQueryDto = {
      page: store.query.page,
      limit: store.query.limit,
      search: store.query.search,
      ...overrideQuery,
    };

    store.setLoading(true);
    try {
      const response: BackendPaginatedResponse<ExchangeRate> = await exchangeRateService.getList(query);
      store.setExchangeRates(response.results);
      store.setPagination(response.pagination);
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  const createExchangeRate = async (payload: ExchangeRateCreateDto) => {
    store.setLoading(true);
    try {
      await exchangeRateService.create(payload);
      message.success(t('exchangeRates.createSuccess'));
      await fetchExchangeRates();
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  const updateExchangeRate = async (id: number, payload: ExchangeRateUpdateDto) => {
    store.setLoading(true);
    try {
      await exchangeRateService.update(id, payload);
      message.success(t('exchangeRates.updateSuccess'));
      await fetchExchangeRates();
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  const deleteExchangeRate = async (id: number) => {
    store.setLoading(true);
    try {
      await exchangeRateService.delete(id);
      message.success(t('exchangeRates.deleteSuccess'));
      await fetchExchangeRates();
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  const searchExchangeRates = async (searchText: string) => {
    store.setQuery({ page: 1, search: searchText || undefined });
    await fetchExchangeRates();
  };

  const changePage = async (page: number, limit: number) => {
    store.setQuery({ page, limit });
    await fetchExchangeRates();
  };

  const setSelectedRate = (rate: ExchangeRate | null) => {
    selectedRate.value = rate;
  };

  return {
    loading: computed(() => store.loading),
    exchangeRates: computed(() => store.tableData),
    pagination: computed(() => store.tablePagination),
    selectedRate: computed(() => selectedRate.value),
    fetchExchangeRates,
    createExchangeRate,
    updateExchangeRate,
    deleteExchangeRate,
    searchExchangeRates,
    changePage,
    setSelectedRate,
  };
}
