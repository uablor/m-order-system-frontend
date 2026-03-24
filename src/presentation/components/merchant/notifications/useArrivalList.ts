/**
 * Composable for Arrival List in Notification Tab
 * Handles fetching, filtering, and table display of arrival data
 */
import { computed, onMounted, reactive, ref, h } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TablePaginationConfig } from 'ant-design-vue';
import type { TableColumnsType } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';
import { customerOrderRepository } from '@/infrastructure/repositories/customer-order.repository';
import { customerRepository } from '@/infrastructure/repositories/customer.repository';
import { notificationRepository } from '@/infrastructure/repositories/notification.repository';
import { useWhatsApp } from '@/shared/composables/useWhatsApp';
import { message } from 'ant-design-vue';
import type { CustomerOrder, CustomerOrderItem } from '@/infrastructure/repositories/customer-order.repository';
import type { CustomerListQueryDto } from '@/application/dto/customer.dto';
import type { CreateNotificationDto, CreateNotificationMultipleResponseItem } from '@/infrastructure/repositories/notification.repository';

// Debounce utility function
const debounce = <T extends (...args: any[]) => any>(func: T, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export interface CustomerOrderQueryDto {
  page?: number;
  limit?: number;
  merchantId?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  customerId?: number;
  orderCode?: string;
  paymentStatus?: string;
  notificationStatus?: string;
}
import { useAuthStore } from '@/store/auth.store';
import { storeToRefs } from 'pinia';
import { useIsMobile } from '@/shared/composables/useIsMobile';
import { formatDateTime } from '@/shared/utils/date.utils';
import { handleApiError } from '@/shared/utils/error';

export function useCustomerOrderList() {
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
  const customerOrders = ref<CustomerOrder[]>([]);
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
  const selectedCustomerOrderIds = ref<Set<number>>(new Set());
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
  const buildQuery = (): CustomerOrderQueryDto => {
    const q: CustomerOrderQueryDto = {
      page: currentPage.value,
      limit: pageSize.value,
      // notificationStatus: 'null', // Filter for orders where notification is null - removed since backend defaults to null
    };

    if (filters.search) q.search = filters.search;
    if (filters.customerId) q.customerId = filters.customerId;
    if (startDate.value) q.startDate = startDate.value.format('YYYY-MM-DD');
    if (endDate.value) q.endDate = endDate.value.format('YYYY-MM-DD');
    
    // Optional: explicitly set notificationStatus if needed
    // q.notificationStatus = 'null'; // Uncomment to explicitly filter for null notifications

    return q;
  };

  // Fetch customer orders from API
  const fetchCustomerOrders = async () => {
    loading.value = true;
    try {
      const res = await customerOrderRepository.getList(buildQuery());
      customerOrders.value = res.results ?? [];
      total.value = res.pagination?.total ?? 0;
    } catch (err) {
      handleApiError(err, t);
    } finally {
      loading.value = false;
    }
  };

  // Table columns for customer orders
  const columns = computed<TableColumnsType>(() => [
    {
      title: () => {
        // Return checkbox for select all
        return '';
      },
      key: 'checkbox',
      width: 20,
      align: 'center',
      customRender: ({ record }: { record: CustomerOrder }) => {
        // Will be handled in template
        return record.id ? '' : '';
      },
    },
    {
      title: t('merchant.arrivalDetail.tableOrderCode'),
      key: 'orderCode',
      width: 100,
      align: 'center',
      customRender: ({ record }: { record: CustomerOrder }) => record.orderCode || '-',
    },
    {
      title: t('merchant.arrivalDetail.tableCustomerName'),
      key: 'customerName',
      width: 60,
      align: 'left',
      customRender: ({ record }: { record: CustomerOrder }) => record.customerName || '-',
    },
    {
      title: t('merchant.arrivalDetail.tableQuantity'),
      key: 'quantity',
      width: 80,
      align: 'center',
      customRender: ({ record }: { record: CustomerOrder }) => {
        const totalQty = record.customerOrderItems?.reduce((sum: number, item: CustomerOrderItem) => sum + item.quantity, 0) || 0;
        return totalQty;
      },
    },
    {
      title: t('merchant.arrivalDetail.tableSellingPrice'),
      key: 'totalSellingAmount',
      width: 120,
      align: 'center',
      customRender: ({ record }: { record: CustomerOrder }) => record.totalSellingAmount || '0.00',
    },
    {
      title: t('merchant.arrivalDetail.tablePaymentStatus'),
      key: 'paymentStatus',
      width: 100,
      align: 'center',
      customRender: ({ record }: { record: CustomerOrder }) => record.paymentStatus || '-',
    },
    {
      title: t('merchant.arrivalDetail.tableCreatedDate'),
      key: 'createdAt',
      width: 120,
      align: 'center',
      customRender: ({ record }: { record: CustomerOrder }) => formatDateTime(record.createdAt),
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
    fetchCustomerOrders();
  };

  // Search change handler
  let searchTimer: ReturnType<typeof setTimeout> | undefined;
  const onSearchChange = () => {
    clearTimeout(searchTimer);
    if (!filters.search) {
      currentPage.value = 1;
      fetchCustomerOrders();
      return;
    }
    searchTimer = setTimeout(() => {
      currentPage.value = 1;
      fetchCustomerOrders();
    }, 450);
  };

  // Reset filters
  const resetFilters = () => {
    filters.search = '';
    startDate.value = null;
    endDate.value = null;
    currentPage.value = 1;
    fetchCustomerOrders();
  };

  // Page change handler
  const onPageChange = (page: number, newPageSize?: number) => {
    currentPage.value = page;
    if (newPageSize) pageSize.value = newPageSize;
    fetchCustomerOrders();
  };

  // Table change handler
  const handleTableChange = (
    pagination: any,
    filters: any,
    sorter: any,
  ) => {
    currentPage.value = pagination.current;
    pageSize.value = pagination.pageSize;
    fetchCustomerOrders();
  };

  // Toggle filters
  const toggleShowFilters = () => {
    showFilters.value = !showFilters.value;
  };

  // Checkbox selection functions
  const toggleArrivalSelection = (orderId: number) => {
    if (selectedCustomerOrderIds.value.has(orderId)) {
      selectedCustomerOrderIds.value.delete(orderId);
    } else {
      selectedCustomerOrderIds.value.add(orderId);
    }
  };

  const toggleSelectAll = () => {
    if (selectedCustomerOrderIds.value.size === customerOrders.value.length) {
      selectedCustomerOrderIds.value.clear();
    } else {
      selectedCustomerOrderIds.value = new Set(customerOrders.value.map(co => co.id));
    }
  };

  const isAllSelected = computed(() => customerOrders.value.length > 0 && selectedCustomerOrderIds.value.size === customerOrders.value.length);
  const isIndeterminate = computed(() => selectedCustomerOrderIds.value.size > 0 && selectedCustomerOrderIds.value.size < customerOrders.value.length);

  // Create notification functions
  const openCreateNotiConfirm = () => {
    if (selectedCustomerOrderIds.value.size === 0) return;
    showCreateNotiModal.value = true;
  };

  const closeCreateNotiModal = () => {
    showCreateNotiModal.value = false;
    selectedLanguage.value = 'en';
  };

  const createNotifications = async (language?: 'en' | 'th' | 'la') => {
    if (selectedCustomerOrderIds.value.size === 0) return;
    
    createNotiSubmitting.value = true;
    try {
      // Use the passed language parameter or fallback to selectedLanguage
      const notificationLanguage = language || selectedLanguage.value;
      
      // Map selected customer orders to customers for notification creation
      const customerMap = new Map<number, { customerId: number; customerName: string; customerOrders: number[]; }>();
      
      // Group customer orders by customer
      customerOrders.value.forEach(customerOrder => {
        if (selectedCustomerOrderIds.value.has(customerOrder.id)) {
          const customerId = customerOrder.customerId;
          
          if (customerId) {
            if (!customerMap.has(customerId)) {
              customerMap.set(customerId, {
                customerId,
                customerName: customerOrder.customerName,
                customerOrders: [],
              });
            }
            customerMap.get(customerId)!.customerOrders.push(customerOrder.id);
          }
        }
      });

      // Create notifications for each customer
      const notifications: CreateNotificationDto[] = Array.from(customerMap.entries()).map(([customerId, customerData]) => ({
        customerId,
        customerOrderIds: customerData.customerOrders,
      }));
      
      // If no notifications, show warning
      if (notifications.length === 0) {
        message.warning('No customer orders selected for notification creation');
        createNotiSubmitting.value = false;
        return;
      }
      
      try {
        // Call API to create notifications
        const res = await notificationRepository.createMultiple({ 
          notifications, 
          language: notificationLanguage 
        });
        
        if (res && res.length > 0) {
          message.success('Notifications created successfully');
          selectedCustomerOrderIds.value.clear();
          closeCreateNotiModal();
          
          // Refetch customer orders to update the list
          fetchCustomerOrders();
          
          // Open WhatsApp chats for each notification
          if (res && res.length > 0) {
            const { openWhatsAppChat } = useWhatsApp();
            
            res.forEach((notification: CreateNotificationMultipleResponseItem, index: number) => {
              const customerName = notification.customer?.customerName || 'Customer';
              const lang: 'en' | 'th' | 'la' = notificationLanguage === 'th' || notificationLanguage === 'la' 
                ? notificationLanguage 
                : 'en';
              
              setTimeout(() => {
                openWhatsAppChat({
                  phone: notification.recipientContact || '',
                  notificationLink: notification.notificationLink,
                  template: {
                    customerName,
                    orderNumbers: notification.relatedOrders || undefined,
                  },
                  lang,
                });
              }, index * 1000); // Stagger WhatsApp opens
            });
          }
        }
      } catch (error) {
        console.error('Failed to create notifications:', error);
        message.error('Failed to create notifications');
      } finally {
        createNotiSubmitting.value = false;
      }
    } catch (error) {
      console.error('Error in notification creation process:', error);
      message.error('An error occurred while creating notifications');
      createNotiSubmitting.value = false;
    }
  };

  // Initialize data on mount
  onMounted(() => {
    fetchCustomerOrders();
  });

  return {
    loading,
    customerOrders,
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
    selectedCustomerOrderIds,
    createNotiSubmitting,
    showCreateNotiModal,
    customerOptions,
    loadingCustomers,
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
