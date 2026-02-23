import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { dashboardService } from '@/infrastructure/services/dashboard.service';
import { handleApiError } from '@/shared/utils/error';
import { firstResult } from '@/shared/types/backend-response.types';
import type { MerchantDashboard, AnnualReport } from '@/domain/entities/user.entity';

export function useMerchantDashboard() {
  const { t } = useI18n();
  const loading = ref(false);
  const dashboard = ref<MerchantDashboard | null>(null);
  const annualReport = ref<AnnualReport | null>(null);
  const selectedYear = ref<number>(new Date().getFullYear());

  const fetchDashboard = async () => {
    loading.value = true;
    try {
      const response = await dashboardService.getMerchantDashboard();
      const data = firstResult(response);
      if (data) dashboard.value = data;
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const fetchAnnualReport = async (year?: number) => {
    loading.value = true;
    try {
      const targetYear = year ?? selectedYear.value;
      const response = await dashboardService.getMerchantAnnualReport(targetYear);
      const data = firstResult(response);
      if (data) {
        annualReport.value = data;
        selectedYear.value = targetYear;
      }
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const changeYear = async (year: number) => {
    selectedYear.value = year;
    await fetchAnnualReport(year);
  };

  const latestOrders = computed(() => dashboard.value?.latestOrders ?? []);

  return {
    loading: computed(() => loading.value),
    dashboard,
    annualReport: computed(() => annualReport.value),
    selectedYear: computed(() => selectedYear.value),
    latestOrders,
    fetchDashboard,
    fetchAnnualReport,
    changeYear,
  };
}
