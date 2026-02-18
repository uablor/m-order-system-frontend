import { computed, ref } from 'vue';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { merchantRepository } from '@/infrastructure/repositories/merchant.repository';
import type { Merchant } from '@/domain/entities/user.entity';
import type { BackendPaginatedResponse } from '@/shared/types/backend-response.types';
import type { MerchantCreateDto, MerchantListQueryDto, MerchantUpdateDto } from '@/application/dto/merchant.dto';
import { handleApiError } from '@/shared/utils/error';
import { useSuperAdminMerchantStore } from '@/presentation/stores/super-admin/superAdminMerchant.store';

/**
 * Business logic สำหรับ Super Admin: Merchant Management
 * - list / pagination / CRUD
 */
export function useSuperAdminMerchants() {
  const { t } = useI18n();
  const store = useSuperAdminMerchantStore();
  const selectedMerchant = ref<Merchant | null>(null);

  const fetchMerchants = async (overrideQuery: Partial<MerchantListQueryDto> = {}) => {
    const query: MerchantListQueryDto = {
      page: store.query.page,
      limit: store.query.limit,
      search: store.query.search,
      ...overrideQuery,
    };

    store.setLoading(true);
    try {
      const response: BackendPaginatedResponse<Merchant> = await merchantRepository.getList(query);
      store.setMerchants(response.results);
      store.setPagination(response.pagination);
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  const createMerchant = async (payload: MerchantCreateDto) => {
    if (!payload.shopName?.trim()) {
      message.error(t('merchants.shopNameRequired'));
      return false;
    }
    store.setLoading(true);
    try {
      await merchantRepository.create(payload);
      message.success(t('merchants.createSuccess'));
      await fetchMerchants();
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  const updateMerchant = async (id: number, payload: MerchantUpdateDto) => {
    store.setLoading(true);
    try {
      await merchantRepository.update(id, payload);
      message.success(t('merchants.updateSuccess'));
      await fetchMerchants();
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  const deleteMerchant = async (id: number) => {
    store.setLoading(true);
    try {
      await merchantRepository.delete(id);
      message.success(t('merchants.deleteSuccess'));
      await fetchMerchants();
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  const searchMerchants = async (searchText: string) => {
    store.setQuery({ page: 1, search: searchText || undefined });
    await fetchMerchants();
  };

  const changePage = async (page: number, limit: number) => {
    store.setQuery({ page, limit });
    await fetchMerchants();
  };

  const setSelectedMerchant = (merchant: Merchant | null) => {
    selectedMerchant.value = merchant;
  };

  return {
    loading: computed(() => store.loading),
    merchants: computed(() => store.tableData),
    pagination: computed(() => store.tablePagination),
    selectedMerchant: computed(() => selectedMerchant.value),
    fetchMerchants,
    createMerchant,
    updateMerchant,
    deleteMerchant,
    searchMerchants,
    changePage,
    setSelectedMerchant,
  };
}
