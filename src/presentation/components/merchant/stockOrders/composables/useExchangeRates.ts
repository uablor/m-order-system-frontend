import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { exchangeRateRepository } from '@/infrastructure/repositories/exchange-rate.repository';
import { extractArrayResult } from '@/shared/types/backend-response.types';
import type { ExchangeRate } from '@/domain/entities/user.entity';

// Lao Kip is stored as 'KIP' in some legacy records but the ISO code is 'LAK'.
// Normalize at read time so the rest of the UI always sees 'LAK'.
const normCcy = (code: string | undefined): string =>
  !code ? 'LAK' : code.toUpperCase() === 'KIP' ? 'LAK' : code;

const rateDisplay = (rate: ExchangeRate | null, notSetLabel: string): string => {
  if (!rate) return notSetLabel;
  const base = normCcy(rate.baseCurrency);
  const target = normCcy(rate.targetCurrency);
  const rateNum = Number(rate.rate).toLocaleString();
  // When both currencies are the same (e.g. LAK/LAK) show "1,000 LAK = 1,000 LAK"
  // instead of the misleading "1 LAK = 1,000 LAK".
  if (base === target) return `${rateNum} ${base} = ${rateNum} ${target}`;
  return `1 ${base} = ${rateNum} ${target}`;
};

export function useExchangeRates() {
  const { t } = useI18n();

  const todayBuyRate = ref<ExchangeRate | null>(null);
  const todaySellRate = ref<ExchangeRate | null>(null);

  const buyRateDisplay = computed(() =>
    rateDisplay(todayBuyRate.value, t('merchant.orders.exchangeRate.notSet')),
  );

  const sellRateDisplay = computed(() =>
    rateDisplay(todaySellRate.value, t('merchant.orders.exchangeRate.notSet')),
  );

  const buyBaseCcy = computed(() => normCcy(todayBuyRate.value?.baseCurrency) || 'USDT');
  const buyTargetCcy = computed(() => normCcy(todayBuyRate.value?.targetCurrency));
  const sellBaseCcy = computed(() => normCcy(todaySellRate.value?.baseCurrency) || 'USDT');
  const sellTargetCcy = computed(() => normCcy(todaySellRate.value?.targetCurrency));

  const getBuyRate = () => Number(todayBuyRate.value?.rate ?? 0);
  const getSellRate = () => Number(todaySellRate.value?.rate ?? 0);

  const fetchTodayRates = async () => {
    try {
      const res = await exchangeRateRepository.getToday();
      const results = extractArrayResult<ExchangeRate>(res);
      todayBuyRate.value = results.find((r: ExchangeRate) => r.rateType === 'BUY') ?? null;
      todaySellRate.value = results.find((r: ExchangeRate) => r.rateType === 'SELL') ?? null;
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
