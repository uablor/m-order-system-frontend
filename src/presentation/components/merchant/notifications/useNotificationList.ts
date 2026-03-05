/**
 * Composable สำหรับ Notification List
 * จัดการ filters, columns, fetch, handlers และ Create modal
 */
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import type { TablePaginationConfig } from 'ant-design-vue';
import type { TableColumnsType } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';
import { notificationRepository } from '@/infrastructure/repositories/notification.repository';
import { customerRepository } from '@/infrastructure/repositories/customer.repository';
import { customerOrderRepository, type CustomerOrder } from '@/infrastructure/repositories/customer-order.repository';
import { useAuthStore } from '@/store/auth.store';
import { storeToRefs } from 'pinia';
import { useIsMobile } from '@/shared/composables/useIsMobile';
import { useWhatsApp } from '@/shared/composables/useWhatsApp';
import { useFacebookMessenger } from '@/shared/composables/useFacebookMessenger';
import { formatDateTime } from '@/shared/utils/date.utils';
import { handleApiError } from '@/shared/utils/error';
import type { NotificationItem } from '@/infrastructure/repositories/notification.repository';
import type { Customer } from '@/domain/entities/user.entity';

export function useNotificationList() {
  const { t } = useI18n();
  const { isMobile } = useIsMobile();
  const { openWhatsAppChat, isValidWhatsAppPhone, formatPhoneForWhatsApp } = useWhatsApp({ openInNewTab: true });
  const { openFacebookMessengerChat, isValidFacebookId } = useFacebookMessenger({ openInNewTab: true });
  const authStore = useAuthStore();
  const { authPayload } = storeToRefs(authStore);

  const showFilterToggle = computed(() => isMobile.value);
  const useMobileLayout = computed(() => isMobile.value);

  const loading = ref(false);
  const notifications = ref<NotificationItem[]>([]);
  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const showFilters = ref(false);
  const startDate = ref<Dayjs | null>(null);
  const endDate = ref<Dayjs | null>(null);

  const filters = reactive<{
    search: string;
    notificationType: string | undefined;
    status: string | undefined;
  }>({
    search: '',
    notificationType: undefined,
    status: undefined,
  });

  const columns = computed<TableColumnsType>(() => [
    { title: t('merchant.notifications.colId'), key: 'index', width: 55 },
    { title: t('merchant.notifications.colType'), key: 'notificationType', dataIndex: 'notificationType', width: 120, align: 'center' as const },
    { title: t('merchant.notifications.colChannel'), key: 'channel', dataIndex: 'channel', width: 100, align: 'center' as const },
    { title: t('merchant.notifications.colRecipient'), key: 'recipientContact', dataIndex: 'recipientContact', width: 140 },
    { title: t('merchant.notifications.colContactPhone'), key: 'contactPhone', width: 130 },
    { title: t('merchant.notifications.colContactWhatsapp'), key: 'contactWhatsapp', width: 130 },
    { title: t('merchant.notifications.colContactLine'), key: 'contactLine', width: 130 },
    { title: t('merchant.notifications.colMessage'), key: 'messageContent', dataIndex: 'messageContent', width: 220 },
    { title: t('merchant.notifications.colLink'), key: 'notificationLink', dataIndex: 'notificationLink', width: 160 },
    { title: t('merchant.notifications.colRetry'), key: 'retryCount', dataIndex: 'retryCount', width: 80, align: 'center' as const },
    { title: t('merchant.notifications.colStatus'), key: 'status', dataIndex: 'status', width: 100, align: 'center' as const },
    { title: t('merchant.notifications.colSentAt'), key: 'sentAt', dataIndex: 'sentAt', width: 140 },
    { title: t('merchant.notifications.colActions'), key: 'actions', fixed: 'right' as const, width: 150, align: 'right' as const },
  ]);

  const paginationConfig = computed((): TablePaginationConfig => ({
    current: currentPage.value,
    pageSize: pageSize.value,
    total: total.value,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50'],
    showTotal: (tot: number) => `Total ${tot}`,
  }));

  const typeColor = (type: string): string => {
    const map: Record<string, string> = {
      ARRIVAL: 'cyan',
      PAYMENT: 'green',
      REMINDER: 'orange',
    };
    return map[type] ?? 'default';
  };

  const typeLabel = (type: string): string => {
    const map: Record<string, string> = {
      ARRIVAL: t('merchant.notifications.typeArrival'),
      PAYMENT: t('merchant.notifications.typePayment'),
      REMINDER: t('merchant.notifications.typeReminder'),
    };
    return map[type] ?? type;
  };

  const statusColor = (status: string): string => (status === 'SENT' ? 'success' : 'error');

  const statusLabel = (status: string): string =>
    status === 'SENT' ? t('merchant.notifications.statusSent') : t('merchant.notifications.statusFailed');

  /* ========== WhatsApp Language Modal ========== */
  const whatsappLangModalVisible = ref(false);
  const selectedRecordForWhatsapp = ref<NotificationItem | null>(null);

  const openWhatsAppLangModal = (record: NotificationItem): void => {
    const phone = record.customer?.contactWhatsapp ?? record.recipientContact;
    if (!phone || !canOpenWhatsApp(phone)) {
      message.warning(t('merchant.notifications.whatsappInvalidPhone'));
      return;
    }
    selectedRecordForWhatsapp.value = record;
    whatsappLangModalVisible.value = true;
  };

  const closeWhatsAppLangModal = (): void => {
    whatsappLangModalVisible.value = false;
    selectedRecordForWhatsapp.value = null;
  };

  const sendWhatsAppWithLang = (lang: 'en' | 'th' | 'la'): void => {
    const record = selectedRecordForWhatsapp.value;
    if (!record) return;
    const phone = record.customer?.contactWhatsapp ?? record.recipientContact;
    if (!phone) return;
    const ok = openWhatsAppChat({
      phone,
      template: {
        customerName: record.customer?.customerName ?? 'Customer',
        orderNumbers: record.relatedOrders ?? undefined,
      },
      notificationLink: record.notificationLink ?? undefined,
      lang,
    });
    closeWhatsAppLangModal();
    if (!ok) message.warning(t('merchant.notifications.whatsappInvalidPhone'));
  };

  const handleWhatsAppClick = (record: NotificationItem): void => {
    openWhatsAppLangModal(record);
  };

  const canOpenWhatsApp = (phone: string | null | undefined): boolean =>
    isValidWhatsAppPhone(formatPhoneForWhatsApp(phone));

  /** ดึง Facebook ID จาก record — ใช้ contactFacebook หรือ recipientContact เมื่อ channel เป็น FB */
  const getFacebookId = (record: NotificationItem): string | null => {
    const fromCustomer = record.customer?.contactFacebook;
    if (fromCustomer && isValidFacebookId(fromCustomer)) return fromCustomer;
    if (record.channel === 'FB' && record.recipientContact && isValidFacebookId(record.recipientContact)) {
      return record.recipientContact;
    }
    return null;
  };

  const handleFacebookClick = (record: NotificationItem): void => {
    const facebookId = getFacebookId(record);
    if (!facebookId) return;
    const ok = openFacebookMessengerChat(facebookId);
    if (!ok) message.warning(t('merchant.notifications.facebookInvalidId'));
  };

  const canOpenFacebook = (record: NotificationItem): boolean => !!getFacebookId(record);

  const buildQuery = () => {
    const q: Record<string, unknown> = {
      page: currentPage.value,
      limit: pageSize.value,
      merchantId: authPayload.value?.merchantId,
    };
    if (filters.search?.trim()) q.search = filters.search.trim();
    if (filters.notificationType) q.notificationType = filters.notificationType;
    if (filters.status) q.status = filters.status;
    if (startDate.value) q.startDate = startDate.value.format('YYYY-MM-DD');
    if (endDate.value) q.endDate = endDate.value.format('YYYY-MM-DD');
    return q as Parameters<typeof notificationRepository.getList>[0];
  };

  const fetchNotifications = async () => {
    loading.value = true;
    try {
      const res = await notificationRepository.getList(buildQuery());
      notifications.value = res.results ?? [];
      total.value = res.pagination?.total ?? 0;
    } catch (err) {
      handleApiError(err, t);
    } finally {
      loading.value = false;
    }
  };

  const onFilterChange = () => {
    currentPage.value = 1;
    fetchNotifications();
  };

  let searchTimer: ReturnType<typeof setTimeout> | undefined;
  const onSearchChange = () => {
    clearTimeout(searchTimer);
    if (!filters.search) {
      currentPage.value = 1;
      fetchNotifications();
      return;
    }
    searchTimer = setTimeout(() => {
      currentPage.value = 1;
      fetchNotifications();
    }, 450);
  };

  const resetFilters = () => {
    filters.search = '';
    filters.notificationType = undefined;
    filters.status = undefined;
    startDate.value = null;
    endDate.value = null;
    currentPage.value = 1;
    fetchNotifications();
  };

  const onPageChange = (page: number, size: number) => {
    currentPage.value = page;
    pageSize.value = size;
    fetchNotifications();
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    currentPage.value = pagination.current ?? 1;
    pageSize.value = pagination.pageSize ?? 10;
    fetchNotifications();
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationRepository.delete(id);
      message.success(t('merchant.notifications.deleteSuccess'));
      await fetchNotifications();
    } catch (err) {
      handleApiError(err, t);
    }
  };

  /* ========== Create Notification Modal ========== */
  const createModalVisible = ref(false);
  const createSubmitting = ref(false);
  const createForm = reactive<{ customerId: number | undefined; customerOrderIds: number[]; message: string }>({
    customerId: undefined,
    customerOrderIds: [],
    message: '',
  });
  const customers = ref<Customer[]>([]);
  const customerOrders = ref<CustomerOrder[]>([]);
  const loadingCustomers = ref(false);
  const loadingCustomerOrders = ref(false);

  const openCreateModal = async () => {
    createForm.customerId = undefined;
    createForm.customerOrderIds = [];
    createForm.message = '';
    customerOrders.value = [];
    createModalVisible.value = true;
    await fetchCustomers();
  };

  const closeCreateModal = () => {
    createModalVisible.value = false;
  };

  const fetchCustomers = async () => {
    loadingCustomers.value = true;
    try {
      const res = await customerRepository.getByMerchant({
        page: 1,
        limit: 100,
      });
      customers.value = res.results ?? [];
    } catch (err) {
      handleApiError(err, t);
    } finally {
      loadingCustomers.value = false;
    }
  };

  const fetchCustomerOrders = async (customerId: number) => {
    loadingCustomerOrders.value = true;
    try {
      const res = await customerOrderRepository.getList({
        page: 1,
        limit: 200,
        customerId,
      });
      const orders = res.results ?? [];
      customerOrders.value = orders;
      // Default: เลือกทั้งหมดอัตโนมัติ
      createForm.customerOrderIds = orders.map((co) => co.id);
    } catch (err) {
      handleApiError(err, t);
      customerOrders.value = [];
      createForm.customerOrderIds = [];
    } finally {
      loadingCustomerOrders.value = false;
    }
  };

  watch(
    () => createForm.customerId,
    (id) => {
      createForm.customerOrderIds = [];
      if (id) fetchCustomerOrders(id);
      else customerOrders.value = [];
    },
  );

  /** สร้าง label สำหรับ Customer Order — แสดง productName เท่านั้น */
  const getCustomerOrderLabel = (co: CustomerOrder): string => {
    const names = co.customerOrderItems
      ?.map((item) => item.productName)
      .filter((n) => n && n.trim());
    return names?.length ? names.join(', ') : `Order #${co.orderId}`;
  };

  const canSubmitCreate = computed(
    () =>
      !!createForm.customerId &&
      createForm.customerOrderIds.length > 0,
  );

  const handleCreateSubmit = async () => {
    if (!createForm.customerId || createForm.customerOrderIds.length === 0) return;
    createSubmitting.value = true;
    try {
      await notificationRepository.create({
        customerId: createForm.customerId,
        customerOrderIds: createForm.customerOrderIds,
        message: createForm.message?.trim() || undefined,
      });
      message.success(t('merchant.notifications.createSuccess'));
      closeCreateModal();
      await fetchNotifications();
    } catch (err) {
      handleApiError(err, t);
    } finally {
      createSubmitting.value = false;
    }
  };

  onMounted(() => fetchNotifications());

  return {
    loading,
    notifications,
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
    typeColor,
    typeLabel,
    statusColor,
    statusLabel,
    formatDateTime,
    handleWhatsAppClick,
    canOpenWhatsApp,
    handleFacebookClick,
    canOpenFacebook,
    onFilterChange,
    onSearchChange,
    resetFilters,
    onPageChange,
    handleTableChange,
    handleDelete,
    whatsappLangModalVisible,
    selectedRecordForWhatsapp,
    closeWhatsAppLangModal,
    sendWhatsAppWithLang,
    createModalVisible,
    createForm,
    createSubmitting,
    customers,
    customerOrders,
    loadingCustomers,
    loadingCustomerOrders,
    openCreateModal,
    closeCreateModal,
    canSubmitCreate,
    handleCreateSubmit,
    getCustomerOrderLabel,
  };
}
