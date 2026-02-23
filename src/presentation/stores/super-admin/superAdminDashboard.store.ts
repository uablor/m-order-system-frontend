import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { AdminDashboard, AnnualReport } from '@/domain/entities/user.entity';

export const useSuperAdminDashboardStore = defineStore('superAdminDashboardStore', () => {
  const loading = ref(false);
  const dashboard = ref<AdminDashboard | null>(null);
  const annualReport = ref<AnnualReport | null>(null);
  const selectedYear = ref<number>(new Date().getFullYear());

  const dashboardData = computed(() => dashboard.value);
  const reportData = computed(() => annualReport.value);
  const currentYear = computed(() => selectedYear.value);

  const setLoading = (value: boolean) => { loading.value = value; };
  const setDashboard = (value: AdminDashboard | null) => { dashboard.value = value; };
  const setAnnualReport = (value: AnnualReport | null) => { annualReport.value = value; };
  const setSelectedYear = (value: number) => { selectedYear.value = value; };

  return {
    loading,
    dashboard,
    annualReport,
    selectedYear,
    dashboardData,
    reportData,
    currentYear,
    setLoading,
    setDashboard,
    setAnnualReport,
    setSelectedYear,
  };
});
