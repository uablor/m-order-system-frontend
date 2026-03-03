import { computed, ref } from 'vue';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { merchantService } from '@/infrastructure/services/merchant.service';
import type { Merchant } from '@/domain/entities/user.entity';
import type { BackendPaginatedResponse } from '@/shared/types/backend-response.types';
import type { MerchantCreateDto, MerchantListQueryDto, MerchantUpdateDto } from '@/application/dto/merchant.dto';
import { handleApiError } from '@/shared/utils/error';
import { useSuperAdminMerchantStore } from '@/presentation/stores/super-admin/superAdminMerchant.store';

/**
 * Business logic สำหรับ Super Admin: Store Management
 * - Filter state แยกจาก pagination ใน store เพื่อให้ sort/search คงอยู่ตอน paginate
 */
export function useSuperAdminMerchants() {
  const { t } = useI18n();
  const store = useSuperAdminMerchantStore();
  const selectedMerchant = ref<Merchant | null>(null);

  /* เก็บ filter ปัจจุบันไว้ใน composable scope เพื่อให้ pagination ใช้ซ้ำได้ */
  const activeFilters = ref<{
    search?: string;
    searchField?: string;
    sort?: 'ASC' | 'DESC';
  }>({});

  /**
   * สร้าง query object ที่ clean — ลบ key ที่เป็น undefined/null/''/NaN ออก
   * เพื่อให้ Axios ไม่ส่ง query string ที่ไม่ต้องการ
   */
  const buildCleanQuery = (raw: Record<string, any>): Record<string, any> => {
    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(raw)) {
      if (v !== undefined && v !== null && v !== '' && !Number.isNaN(v)) {
        clean[k] = v;
      }
    }
    return clean;
  };

  const fetchMerchants = async (params: Partial<MerchantListQueryDto> = {}) => {
    /* อัพเดท filter state ถ้า params ส่ง filter fields มา */
    if ('search' in params) activeFilters.value.search = params.search;
    if ('searchField' in params) activeFilters.value.searchField = params.searchField;
    if ('sort' in params) activeFilters.value.sort = params.sort;

    /* อัพเดท pagination ใน store ถ้ามีการระบุมา */
    if (params.page != null) store.setQuery({ page: params.page });
    if (params.limit != null) store.setQuery({ limit: params.limit });

    /* สร้าง query สะอาด — เฉพาะค่าที่ defined */
    const query = buildCleanQuery({
      page: store.query.page ?? 1,
      limit: store.query.limit ?? 10,
      search: activeFilters.value.search,
      searchField: activeFilters.value.searchField,
      sort: activeFilters.value.sort,
    }) as MerchantListQueryDto;

    store.setLoading(true);
    try {
      const response: BackendPaginatedResponse<Merchant> = await merchantService.getList(query);
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
      await merchantService.create(payload);
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
      await merchantService.update(id, payload);
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
      await merchantService.delete(id);
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

  const changePage = async (page: number, limit: number) => {
    await fetchMerchants({ page, limit });
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
    changePage,
    setSelectedMerchant,
  };
}
