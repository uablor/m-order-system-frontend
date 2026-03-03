import type { Order } from '@/domain/entities/user.entity';
import { calculateMerchantPriceCurrencySummary, formatCurrency, getPrimaryCurrency, getFinancialStatus } from '@/shared/utils/currencySummary';

/**
 * Composable สำหรับใช้งาน Currency Summary Logic
 * Logic เดียวกับ API POST /dashboard/merchant/price-currency-summary
 */
export function useCurrencySummary() {
  
  /**
   * คำนวณสรุปราคาตามสกุลเงินจากข้อมูลออเดอร์
   */
  const calculateSummary = (orders: Order[]) => {
    return calculateMerchantPriceCurrencySummary(orders);
  };

  /**
   * แสดงผลลัพธ์เป็นข้อความ
   */
  const formatSummary = (summary: ReturnType<typeof calculateMerchantPriceCurrencySummary>) => {
    const primaryCurrency = getPrimaryCurrency(summary);
    const status = getFinancialStatus(summary);

    return {
      totalOrders: summary.totalOrders,
      totalIncome: formatCurrency(summary.totalIncome),
      totalExpense: formatCurrency(summary.totalExpense),
      totalProfit: formatCurrency(summary.totalProfit),
      primaryCurrency,
      financialStatus: status,
      currencyBreakdown: summary.byCurrency.map(currency => ({
        targetCurrency: currency.targetCurrency,
        orders: currency.totalOrders,
        income: formatCurrency(currency.totalIncome, 'LAK'),
        expense: formatCurrency(currency.totalExpense, 'LAK'),
        profit: formatCurrency(currency.totalProfit, 'LAK'),
        profitPercentage: currency.totalExpense > 0 
          ? ((currency.totalProfit / currency.totalExpense) * 100).toFixed(1)
          : '0.0'
      }))
    };
  };

  /**
   * หาสกุลเงินที่มีกำไรสูงสุด
   */
  const getMostProfitableCurrency = (summary: ReturnType<typeof calculateMerchantPriceCurrencySummary>) => {
    return summary.byCurrency
      .filter(currency => currency.totalProfit > 0)
      .sort((a, b) => b.totalProfit - a.totalProfit)[0];
  };

  /**
   * หาสกุลเงินที่ขาดทุนสูงสุด
   */
  const getMostLossCurrency = (summary: ReturnType<typeof calculateMerchantPriceCurrencySummary>) => {
    return summary.byCurrency
      .filter(currency => currency.totalProfit < 0)
      .sort((a, b) => a.totalProfit - b.totalProfit)[0];
  };

  /**
   * คำนวณสัดส่วนของแต่ละสกุลเงิน (แสดงค่าเป็น LAK)
   */
  const getCurrencyDistribution = (summary: ReturnType<typeof calculateMerchantPriceCurrencySummary>) => {
    const totalOrders = summary.totalOrders;
    
    return summary.byCurrency.map(currency => ({
      targetCurrency: currency.targetCurrency,
      orders: currency.totalOrders,
      percentage: totalOrders > 0 ? (currency.totalOrders / totalOrders * 100).toFixed(1) : '0.0',
      income: formatCurrency(currency.totalIncome, 'LAK'),
      expense: formatCurrency(currency.totalExpense, 'LAK'),
      profit: formatCurrency(currency.totalProfit, 'LAK')
    }));
  };

  return {
    calculateSummary,
    formatSummary,
    getMostProfitableCurrency,
    getMostLossCurrency,
    getCurrencyDistribution,
    formatCurrency,
    getPrimaryCurrency,
    getFinancialStatus
  };
}
