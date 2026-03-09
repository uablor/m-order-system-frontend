import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { dashboardService } from '@/infrastructure/services/dashboard.service';
import { handleApiError } from '@/shared/utils/error';
import { extractSingleResult, extractArrayResult } from '@/shared/types/backend-response.types';
import type {
  MerchantSummary,
  MerchantPriceCurrencySummaryDto,
  TopCustomersResponseDto,
} from '@/domain/entities/user.entity';

export interface MerchantDashboard {
  summary: MerchantSummary;
  priceCurrencySummary: MerchantPriceCurrencySummaryDto[];
  topCustomers: TopCustomersResponseDto;
}

export function useMerchantDashboard() {
  const { t } = useI18n();
  const loading = ref(false);
  const summary = ref<MerchantSummary | null>(null);
  const priceCurrencySummary = ref<MerchantPriceCurrencySummaryDto[] | null>(null);
  const topCustomers = ref<TopCustomersResponseDto | null>(null);

  const dashboard = computed((): MerchantDashboard => {
    // Always return a dashboard object, even if data is not loaded yet
    return {
      summary: summary.value ?? {
        totalUsers: 0, totalCustomers: 0, totalOrders: 0,
        totalPaidOrders: 0, totalArrivals: 0, totalOrderItems: 0,
      },
      priceCurrencySummary: priceCurrencySummary.value ?? [
        {
          baseCurrency: 'USDT',
          totalAll: 0,
          totalUnpaid: 0,
          totalPaid: 0,
          totalAllConverted: 0,
          totalUnpaidConverted: 0,
          totalPaidConverted: 0,
        },
        {
          baseCurrency: 'THB',
          totalAll: 0,
          totalUnpaid: 0,
          totalPaid: 0,
          totalAllConverted: 0,
          totalUnpaidConverted: 0,
          totalPaidConverted: 0,
        },
        {
          targetCurrency: 'LAK',
          totalAll: 0,
          totalUnpaid: 0,
          totalPaid: 0,
          totalAllConverted: 0,
          totalUnpaidConverted: 0,
          totalPaidConverted: 0,
        },
      ],
      topCustomers: topCustomers.value ?? { customers: [] },
    };
  });

  const fetchDashboard = async () => {
    loading.value = true;
    try {
      
      // Fetch summary first (most important)
      try {
        const summaryRes = await dashboardService.getMerchantSummary();
        const summaryData = extractSingleResult(summaryRes);
        if (summaryData) {
          summary.value = summaryData;
        }
      } catch (error) {
      }
      
      // Fetch price currency summary
      try {
        const priceCurrencyRes = await dashboardService.getMerchantPriceCurrencySummary();
        const raw = extractArrayResult<MerchantPriceCurrencySummaryDto[] | MerchantPriceCurrencySummaryDto>(priceCurrencyRes);
        const priceCurrencyData = (raw.length === 1 && Array.isArray(raw[0])) ? raw[0] : raw as MerchantPriceCurrencySummaryDto[];
        if (priceCurrencyData && Array.isArray(priceCurrencyData)) {
          priceCurrencySummary.value = priceCurrencyData;
        }
      } catch (error) {
      }
      
      // Fetch top customers
      try {
        const topCustomersRes = await dashboardService.getTopCustomers();
        const topCustomersData = extractSingleResult(topCustomersRes);
        if (topCustomersData) {
          topCustomers.value = topCustomersData;
        }
      } catch (error) {
      }
      
      return true;
    } catch (error) {
      handleApiError(error, t);
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading: computed(() => loading.value),
    dashboard,
    fetchDashboard,
  };
}
