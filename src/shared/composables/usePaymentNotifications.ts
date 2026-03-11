import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { paymentRepository } from '@/infrastructure/repositories/payment.repository';
import type { PaymentItem } from '@/infrastructure/repositories/payment.repository';

export function usePaymentNotifications() {
  const router = useRouter();
  const unreadPayments = ref<PaymentItem[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed property for notification count
  const notificationCount = computed(() => unreadPayments.value.length);

  // Fetch unread payments
  const fetchUnreadPayments = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      const payments = await paymentRepository.getUnreadPaymentsByMerchant();
      unreadPayments.value = payments;
    } catch (err) {
      console.error('Error fetching unread payments:', err);
      error.value = 'Failed to fetch notifications';
      unreadPayments.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  // Mark payment as read
  const markAsRead = async (paymentId: number) => {
    try {
      await paymentRepository.markAsRead(paymentId);
      // Remove from unread list
      unreadPayments.value = unreadPayments.value.filter(p => p.id !== paymentId);
    } catch (err) {
      console.error('Error marking payment as read:', err);
      throw err;
    }
  };

  // Handle notification click
  const handleNotificationClick = async (payment: PaymentItem) => {
    try {
      // Mark as read
      await markAsRead(payment.id);
      
      // Navigate to payments page with pending filter
      await router.push({
        path: '/merchant/payment',
        query: { status: 'PENDING' }
      });
    } catch (err) {
      console.error('Error handling notification click:', err);
    }
  };

  // Initialize on composable creation
  fetchUnreadPayments();

  return {
    unreadPayments,
    isLoading,
    error,
    notificationCount,
    fetchUnreadPayments,
    markAsRead,
    handleNotificationClick,
  };
}
