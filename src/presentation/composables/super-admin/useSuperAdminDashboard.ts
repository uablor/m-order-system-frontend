import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { dashboardService } from '@/infrastructure/services/dashboard.service';
import { handleApiError } from '@/shared/utils/error';
import { useSuperAdminDashboardStore } from '@/presentation/stores/super-admin/superAdminDashboard.store';
import { extractSingleResult } from '@/shared/types/backend-response.types';

export function useSuperAdminDashboard() {
  const { t } = useI18n();
  const store = useSuperAdminDashboardStore();

  const fetchDashboard = async () => {
    store.setLoading(true);
    try {
      const [summaryRes, detailsRes] = await Promise.allSettled([
        dashboardService.getAdminDashboardSummary(),
        dashboardService.getAdminDashboardDetails(),
      ]);
      if (summaryRes.status === 'fulfilled') {
        const data = extractSingleResult(summaryRes.value);
        if (data) store.setSummary(data);
      }
      if (detailsRes.status === 'fulfilled') {
        const data = extractSingleResult(detailsRes.value);
        if (data) store.setDetails(data);
      }
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  return {
    loading: computed(() => store.loading),
    dashboard: computed(() => store.dashboardData),
    fetchDashboard,
  };
}
