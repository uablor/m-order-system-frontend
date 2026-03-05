import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { merchantService } from '@/infrastructure/services/merchant.service';
import { handleApiError } from '@/shared/utils/error';
import type { MerchantDetail } from '@/domain/entities/user.entity';

export function useMerchantDetail() {
  const { t } = useI18n();
  const loading = ref(false);
  const merchant = ref<MerchantDetail | null>(null);
  const error = ref(false);
  const priceCurrencySummary = ref<any[]>([]);

  const fetchDetail = async (id: number) => {
    loading.value = true;
    error.value = false;
    try {
      const res = await merchantService.getDetail(id);
      merchant.value = res ?? null;
      
      // Fetch price currency summary using admin endpoint
      try {
        const currencyRes = await merchantService.getAdminPriceCurrencySummary(id);
        priceCurrencySummary.value = currencyRes.results ?? [];
      } catch (currencyErr) {
        console.error('Failed to fetch price currency summary:', currencyErr);
        priceCurrencySummary.value = [];
      }
    } catch (err) {
      error.value = true;
      handleApiError(err, t);
    } finally {
      loading.value = false;
    }
  };

  const summary = computed(() => merchant.value?.summary ?? null);
  const financial = computed(() => summary.value?.financial ?? null);
  const owner = computed(() => merchant.value?.owner ?? null);

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    merchant,
    summary,
    financial,
    owner,
    priceCurrencySummary,
    fetchDetail,
  };
}
