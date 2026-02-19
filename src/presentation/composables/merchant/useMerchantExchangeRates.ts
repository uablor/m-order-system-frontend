import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/store/auth.store';
import { exchangeRateRepository } from '@/infrastructure/repositories/exchange-rate.repository';
import type { ExchangeRate } from '@/domain/entities/user.entity';
import type { ExchangeRateCreateDto, ExchangeRateBulkCreateDto, ExchangeRateListQueryDto } from '@/application/dto/exchange-rate.dto';
import { handleApiError } from '@/shared/utils/error';

export function useMerchantExchangeRates() {
  const { t } = useI18n();
  const authStore = useAuthStore();
  const { authPayload } = storeToRefs(authStore);

  const loading = ref(false);
  const rates = ref<ExchangeRate[]>([]);
  const pagination = ref({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const filterRateType = ref<'BUY' | 'SELL' | undefined>(undefined);

  const getMerchantId = (): number | null => {
    return authPayload.value?.merchantId ?? null;
  };

  const fetchRates = async (overrideQuery: Partial<ExchangeRateListQueryDto> = {}) => {
    const mid = getMerchantId();
    if (!mid) return;
    loading.value = true;
    try {
      const query: ExchangeRateListQueryDto = {
        page: pagination.value.page,
        limit: pagination.value.limit,
        merchantId: mid,
        rateType: filterRateType.value,
        ...overrideQuery,
      };
      const res = await exchangeRateRepository.getList(query);
      rates.value = res.results ?? [];
      pagination.value = {
        page: res.pagination.page,
        limit: res.pagination.limit,
        total: res.pagination.total,
        totalPages: res.pagination.totalPages,
      };
    } catch (error) {
      handleApiError(error, t);
    } finally {
      loading.value = false;
    }
  };

  const createRate = async (payload: Omit<ExchangeRateCreateDto, 'merchantId'>) => {
    loading.value = true;
    try {
      await exchangeRateRepository.create(payload);
      message.success(t('merchant.exchangeRates.toast.createSuccess'));
      await fetchRates({ page: 1 });
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const createBulkRates = async (items: Omit<ExchangeRateCreateDto, 'merchantId'>[]) => {
    loading.value = true;
    try {
      const payload: ExchangeRateBulkCreateDto = { items: items as ExchangeRateCreateDto[] };
      await exchangeRateRepository.createBulk(payload);
      message.success(t('merchant.exchangeRates.toast.bulkCreateSuccess'));
      await fetchRates({ page: 1 });
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteRate = async (id: number) => {
    loading.value = true;
    try {
      await exchangeRateRepository.delete(id);
      message.success(t('merchant.exchangeRates.toast.deleteSuccess'));
      await fetchRates();
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const changePage = async (page: number, limit: number) => {
    pagination.value.page = page;
    pagination.value.limit = limit;
    await fetchRates();
  };

  const setFilter = async (rateType: 'BUY' | 'SELL' | undefined) => {
    filterRateType.value = rateType;
    await fetchRates({ page: 1 });
  };

  return {
    loading: computed(() => loading.value),
    rates: computed(() => rates.value),
    pagination: computed(() => pagination.value),
    filterRateType: computed(() => filterRateType.value),
    fetchRates,
    createRate,
    createBulkRates,
    deleteRate,
    changePage,
    setFilter,
  };
}
