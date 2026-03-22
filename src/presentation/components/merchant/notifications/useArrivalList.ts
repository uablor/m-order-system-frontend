/**
 * Composable for Arrival List in Notification Tab
 * Handles fetching, filtering, and table display of arrival data
 */
import { computed, onMounted, reactive, ref, h } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TablePaginationConfig } from 'ant-design-vue';
import type { TableColumnsType } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';
import { arrivalRepository } from '@/infrastructure/repositories/arrival.repository';
import { customerRepository } from '@/infrastructure/repositories/customer.repository';
import type { Arrival, ArrivalItem } from '@/domain/entities/user.entity';
import type { CustomerListQueryDto } from '@/application/dto/customer.dto';

// Debounce utility function
const debounce = <T extends (...args: any[]) => any>(func: T, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export interface ArrivalQueryDto {
  page?: number;
  limit?: number;
  merchantId?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  customerId?: number;
}
import { useAuthStore } from '@/store/auth.store';
import { storeToRefs } from 'pinia';
import { useIsMobile } from '@/shared/composables/useIsMobile';
import { formatDateTime } from '@/shared/utils/date.utils';
import { handleApiError } from '@/shared/utils/error';

export function useArrivalList() {
  const { t } = useI18n();
  const { isMobile } = useIsMobile();
  const authStore = useAuthStore();
  const { authPayload } = storeToRefs(authStore);

  // Image modal state
  const imageModalVisible = ref(false);
  const modalImageUrl = ref('');
  
  const showImageModal = (imageUrl: string) => {
    modalImageUrl.value = imageUrl;
    imageModalVisible.value = true;
  };

  const closeImageModal = () => {
    imageModalVisible.value = false;
    modalImageUrl.value = '';
  };

  const showFilterToggle = computed(() => isMobile.value);
  const useMobileLayout = computed(() => isMobile.value);

  const loading = ref(false);
  const arrivals = ref<Arrival[]>([]);
  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const showFilters = ref(false);
  const startDate = ref<Dayjs | null>(null);
  const endDate = ref<Dayjs | null>(null);

  const filters = reactive<{
    search: string;
    customerId?: number;
  }>({
    search: '',
  });

  // Customer selection for notifications
  const selectedArrivalIds = ref<Set<number>>(new Set());
  const createNotiSubmitting = ref(false);
  const showCreateNotiModal = ref(false);
  const selectedLanguage = ref<'en' | 'th' | 'la'>('en');
  
  // Customer filter options
  const customerOptions = ref<{id: number, name: string}[]>([]);
  const loadingCustomers = ref(false);

  // Fetch customers for filter
  const fetchCustomers = debounce(async (searchText?: string) => {
    loadingCustomers.value = true;
    try {
      const query: CustomerListQueryDto = {
        page: 1,
        limit: 50, // Reduced limit to avoid API error
        merchantId: authPayload.value?.merchantId,
        isActive: true, // Only active customers
        search: searchText || undefined,
      };
      const response = await customerRepository.getByMerchant(query);
      customerOptions.value = response.results?.map(customer => ({
        id: customer.id,
        name: customer.customerName || `Customer ${customer.id}`
      })) || [];
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      customerOptions.value = [];
    } finally {
      loadingCustomers.value = false;
    }
  }, 500); // 500ms delay

  // Build query for API
  const buildQuery = (): ArrivalQueryDto => {
    const q: ArrivalQueryDto = {
      page: currentPage.value,
      limit: pageSize.value,
      merchantId: authPayload.value?.merchantId,
    };

    if (filters.search) q.search = filters.search;
    if (filters.customerId) q.customerId = filters.customerId;
    if (startDate.value) q.startDate = startDate.value.format('YYYY-MM-DD');
    if (endDate.value) q.endDate = endDate.value.format('YYYY-MM-DD');

    return q;
  };

  // Fetch arrivals from API
  const fetchArrivals = async () => {
    loading.value = true;
    try {
      const res = await arrivalRepository.getListByMerchant(buildQuery());
      arrivals.value = res.results ?? [];
      total.value = res.pagination?.total ?? 0;
    } catch (err) {
      handleApiError(err, t);
    } finally {
      loading.value = false;
    }
  };

  // Table columns for arrival items
  const columns = computed<TableColumnsType>(() => [
    {
      title: () => {
        // Return checkbox for select all
        return '';
      },
      key: 'checkbox',
      width: 50,
      align: 'center',
      customRender: ({ record }: { record: Arrival }) => {
        // Will be handled in template
        return record.id ? '' : '';
      },
    },
    {
      title: t('merchant.arrivalDetail.tableAvatar'),
      key: 'image',
      width: 80,
      align: 'center',
      customRender: ({ record }: { record: Arrival }) => {
        // Show images from arrival items
        const images = record.arrivalItems?.map((item: ArrivalItem) => {
          const publicUrl = item.publicUrl;
          
          if (publicUrl) {
            return h('img', {
              src: publicUrl,
              alt: 'Product Image',
              style: 'width: 40px; height: 40px; object-fit: cover; border-radius: 4px; border: 1px solid #f0f0f0; cursor: pointer;',
              onClick: () => showImageModal(publicUrl)
            });
          } else {
            return h('div', {
              style: 'width: 40px; height: 40px; background: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #999; border: 1px solid #e8e8e8;'
            }, 'No Img');
          }
        }) || [];

        return h('div', {
          style: 'display: flex; flex-direction: column; gap: 4px; align-items: center; padding: 4px 0;'
        }, images);
      },
    },
    {
      title: t('merchant.arrivalDetail.tableOrderCode'),
      key: 'orderCode',
      width: 120,
      align: 'center',
      customRender: ({ record }: { record: Arrival }) => record.order?.orderCode || '-',
    },
    {
      title: t('merchant.arrivalDetail.tableVariant'),
      key: 'variant',
      width: 200,
      align: 'left',
      customRender: ({ record }: { record: Arrival }) => {
        // Show variant text only (no images)
        const variants = record.arrivalItems?.map((item: ArrivalItem) => {
          const variant = item.variant || '-';
          const arrivedQuantity = item.arrivedQuantity || 0;
          
          return h('div', {
            style: 'margin-bottom: 4px; font-size: 13px;'
          }, `${variant} (${arrivedQuantity})`);
        }) || [];

        return h('div', variants);
      },
    },
    {
      title: t('merchant.arrivalDetail.tableQuantity'),
      key: 'quantity',
      width: 80,
      align: 'center',
      customRender: ({ record }: { record: Arrival }) => {
        const totalQty = record.arrivalItems?.reduce((sum: number, item: ArrivalItem) => sum + item.arrivedQuantity, 0) || 0;
        return totalQty;
      },
    },
    {
      title: t('merchant.arrivalDetail.tableArrivedQuantity'),
      key: 'arrivedQuantity',
      width: 100,
      align: 'center',
      customRender: ({ record }: { record: Arrival }) => {
        const totalArrived = record.arrivalItems?.reduce((sum, item) => sum + item.arrivedQuantity, 0) || 0;
        return totalArrived;
      },
    },
    {
      title: t('merchant.arrivalDetail.tableCondition'),
      key: 'condition',
      width: 80,
      align: 'center',
      customRender: ({ record }: { record: Arrival }) => {
        const conditions = record.arrivalItems?.map((item: ArrivalItem) => item.condition || '-').join(', ');
        return conditions || '-';
      },
    },
    {
      title: t('merchant.arrivalDetail.tablePurchasePrice'),
      key: 'purchasePrice',
      width: 100,
      align: 'center',
      customRender: ({ record }: { record: Arrival }) => {
        const prices = (record.arrivalItems || []).map((item: ArrivalItem) => Number(item.purchasePrice) || 0).filter((price: number) => price > 0);
        return prices.length > 0 ? prices.join(', ') : '-';
      },
    },
    {
      title: t('merchant.arrivalDetail.tableSellingPrice'),
      key: 'sellingPriceForeign',
      width: 100,
      align: 'center',
      customRender: ({ record }: { record: Arrival }) => {
        const prices = (record.arrivalItems || []).map((item: ArrivalItem) => Number(item.sellingPriceForeign) || 0).filter((price: number) => price > 0);
        return prices.length > 0 ? prices.join(', ') : '-';
      },
    },
    {
      title: t('merchant.arrivalDetail.tableProfit'),
      key: 'profit',
      width: 100,
      align: 'center',
      customRender: ({ record }: { record: Arrival }) => {
        const totalProfit = record.arrivalItems?.reduce((sum: number, item: ArrivalItem) => {
          const profit = Number(item.profit) || 0;
          return sum + profit;
        }, 0) || 0;
        return totalProfit.toLocaleString();
      },
    },
    {
      title: t('merchant.arrivalDetail.tableArrivedDate'),
      key: 'arrivedDate',
      width: 100,
      align: 'center',
      customRender: ({ record }: { record: Arrival }) => formatDateTime(record.arrivedDate + ' ' + record.arrivedTime),
    },
  ]);

  // Pagination config
  const paginationConfig = computed<TablePaginationConfig>(() => ({
    current: currentPage.value,
    pageSize: pageSize.value,
    total: total.value,
    showSizeChanger: !isMobile.value,
    showQuickJumper: !isMobile.value,
    showTotal: (total: number, range: [number, number]) =>
      t('common.pagination.total', { start: range[0], end: range[1], total }),
  }));

  // Filter change handler
  const onFilterChange = () => {
    currentPage.value = 1;
    fetchArrivals();
  };

  // Search change handler
  let searchTimer: ReturnType<typeof setTimeout> | undefined;
  const onSearchChange = () => {
    clearTimeout(searchTimer);
    if (!filters.search) {
      currentPage.value = 1;
      fetchArrivals();
      return;
    }
    searchTimer = setTimeout(() => {
      currentPage.value = 1;
      fetchArrivals();
    }, 450);
  };

  // Reset filters
  const resetFilters = () => {
    filters.search = '';
    startDate.value = null;
    endDate.value = null;
    currentPage.value = 1;
    fetchArrivals();
  };

  // Page change handler
  const onPageChange = (page: number, size: number) => {
    currentPage.value = page;
    pageSize.value = size;
    fetchArrivals();
  };

  // Table change handler
  const handleTableChange = (pagination: TablePaginationConfig) => {
    currentPage.value = pagination.current ?? 1;
    pageSize.value = pagination.pageSize ?? 10;
    fetchArrivals();
  };

  // Toggle filters
  const toggleShowFilters = () => {
    showFilters.value = !showFilters.value;
  };

  // Checkbox selection functions
  const toggleArrivalSelection = (arrivalId: number) => {
    if (selectedArrivalIds.value.has(arrivalId)) {
      selectedArrivalIds.value.delete(arrivalId);
    } else {
      selectedArrivalIds.value.add(arrivalId);
    }
  };

  const toggleSelectAll = () => {
    if (selectedArrivalIds.value.size === arrivals.value.length) {
      selectedArrivalIds.value.clear();
    } else {
      selectedArrivalIds.value = new Set(arrivals.value.map(a => a.id));
    }
  };

  const isAllSelected = computed(() => arrivals.value.length > 0 && selectedArrivalIds.value.size === arrivals.value.length);
  const isIndeterminate = computed(() => selectedArrivalIds.value.size > 0 && selectedArrivalIds.value.size < arrivals.value.length);

  // Create notification functions
  const openCreateNotiConfirm = () => {
    if (selectedArrivalIds.value.size === 0) return;
    showCreateNotiModal.value = true;
  };

  const closeCreateNotiModal = () => {
    showCreateNotiModal.value = false;
    selectedLanguage.value = 'en';
  };

  const createNotifications = async () => {
    if (selectedArrivalIds.value.size === 0) return;
    
    createNotiSubmitting.value = true;
    try {
      // TODO: Implement API call to create notifications
      // For now, just simulate and close modal
      await new Promise(resolve => setTimeout(resolve, 1000));
      selectedArrivalIds.value.clear();
      closeCreateNotiModal();
      // TODO: Show success message
    } catch (error) {
      // TODO: Handle error
    } finally {
      createNotiSubmitting.value = false;
    }
  };

  // Initialize on mount
  onMounted(() => {
    fetchArrivals();
    fetchCustomers();
  });

  return {
    loading,
    arrivals,
    total,
    currentPage,
    pageSize,
    showFilters,
    startDate,
    endDate,
    filters,
    showFilterToggle,
    useMobileLayout,
    columns,
    paginationConfig,
    formatDateTime,
    onFilterChange,
    onSearchChange,
    resetFilters,
    onPageChange,
    handleTableChange,
    toggleShowFilters,
    // Notification functionality
    selectedArrivalIds,
    createNotiSubmitting,
    showCreateNotiModal,
    selectedLanguage,
    customerOptions,
    loadingCustomers,
    toggleArrivalSelection,
    toggleSelectAll,
    isAllSelected,
    isIndeterminate,
    openCreateNotiConfirm,
    closeCreateNotiModal,
    createNotifications,
    fetchCustomers, // Add fetchCustomers to return
    // Image modal functionality
    imageModalVisible,
    modalImageUrl,
    showImageModal,
    closeImageModal,
  };
}
