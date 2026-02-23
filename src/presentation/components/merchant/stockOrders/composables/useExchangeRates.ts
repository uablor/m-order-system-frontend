import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { exchangeRateRepository } from '@/infrastructure/repositories/exchange-rate.repository';
import type { ExchangeRate } from '@/domain/entities/user.entity';

export function useExchangeRates() {
  const { t } = useI18n();

  const todayBuyRate = ref<ExchangeRate | null>(null);
  const todaySellRate = ref<ExchangeRate | null>(null);

  const buyRateDisplay = computed(() => {
    if (!todayBuyRate.value) return t('merchant.orders.exchangeRate.notSet');
    return `1 ${todayBuyRate.value.baseCurrency} = ${Number(todayBuyRate.value.rate).toLocaleString()} ${todayBuyRate.value.targetCurrency}`;
  });

  const sellRateDisplay = computed(() => {
    if (!todaySellRate.value) return t('merchant.orders.exchangeRate.notSet');
    return `1 ${todaySellRate.value.baseCurrency} = ${Number(todaySellRate.value.rate).toLocaleString()} ${todaySellRate.value.targetCurrency}`;
  });

  const buyBaseCcy = computed(() => todayBuyRate.value?.baseCurrency ?? 'USDT');
  const buyTargetCcy = computed(() => todayBuyRate.value?.targetCurrency ?? 'KIP');
  const sellBaseCcy = computed(() => todaySellRate.value?.baseCurrency ?? 'USDT');
  const sellTargetCcy = computed(() => todaySellRate.value?.targetCurrency ?? 'KIP');

  const getBuyRate = () => Number(todayBuyRate.value?.rate ?? 0);
  const getSellRate = () => Number(todaySellRate.value?.rate ?? 0);

  const fetchTodayRates = async () => {
    try {
      const res = await exchangeRateRepository.getToday();
      const results = res.results ?? [];
      todayBuyRate.value = results.find(r => r.rateType === 'BUY') ?? null;
      todaySellRate.value = results.find(r => r.rateType === 'SELL') ?? null;
    } catch { /* handled in StockOrderPage via modal */ }
  };

  return {
    todayBuyRate,
    todaySellRate,
    buyRateDisplay,
    sellRateDisplay,
    buyBaseCcy,
    buyTargetCcy,
    sellBaseCcy,
    sellTargetCcy,
    getBuyRate,
    getSellRate,
    fetchTodayRates,
  };
}
