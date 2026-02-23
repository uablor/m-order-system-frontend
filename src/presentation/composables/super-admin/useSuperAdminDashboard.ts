import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { dashboardService } from '@/infrastructure/services/dashboard.service';
import { handleApiError } from '@/shared/utils/error';
import { useSuperAdminDashboardStore } from '@/presentation/stores/super-admin/superAdminDashboard.store';
import { firstResult } from '@/shared/types/backend-response.types';

export function useSuperAdminDashboard() {
  const { t } = useI18n();
  const store = useSuperAdminDashboardStore();

  const fetchDashboard = async () => {
    store.setLoading(true);
    try {
      const response = await dashboardService.getAdminDashboard();
      const data = firstResult(response);
      if (data) store.setDashboard(data);
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  const fetchAnnualReport = async (year?: number) => {
    store.setLoading(true);
    try {
      const targetYear = year ?? store.selectedYear;
      const response = await dashboardService.getAdminAnnualReport(targetYear);
      const data = firstResult(response);
      if (data) {
        store.setAnnualReport(data);
        store.setSelectedYear(targetYear);
      }
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  const changeYear = async (year: number) => {
    store.setSelectedYear(year);
    await fetchAnnualReport(year);
  };

  return {
    loading: computed(() => store.loading),
    dashboard: computed(() => store.dashboardData),
    annualReport: computed(() => store.reportData),
    selectedYear: computed(() => store.currentYear),
    fetchDashboard,
    fetchAnnualReport,
    changeYear,
  };
}
