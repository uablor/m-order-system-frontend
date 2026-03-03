import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { AdminDashboard, AdminDashboardSummary, AdminDashboardDetails } from '@/domain/entities/user.entity';

export const useSuperAdminDashboardStore = defineStore('superAdminDashboardStore', () => {
  const loading = ref(false);
  const summary = ref<AdminDashboardSummary | null>(null);
  const details = ref<AdminDashboardDetails | null>(null);

  const dashboardData = computed((): AdminDashboard | null => {
    if (!summary.value && !details.value) return null;
    return {
      summary: summary.value ?? { totalMerchants: 0, totalAdminUsers: 0, totalMerchantUsers: 0, totalOrders: 0 },
      details: details.value ?? { topMerchants: [], recentUserLogins: [] },
    };
  });

  const setLoading = (value: boolean) => { loading.value = value; };
  const setSummary = (value: AdminDashboardSummary | null) => { summary.value = value; };
  const setDetails = (value: AdminDashboardDetails | null) => { details.value = value; };

  return {
    loading,
    summary,
    details,
    dashboardData,
    setLoading,
    setSummary,
    setDetails,
  };
});
