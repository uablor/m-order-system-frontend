import type { Order } from '@/domain/entities/user.entity';

export interface CurrencySummary {
  targetCurrency: string;  // สกุลเงินต้นทางที่ใช้ซื้อ/ขาย
  totalOrders: number;
  totalIncome: number;     // รายได้รวม (ใน LAK)
  totalExpense: number;    // รายจ่ายรวม (ใน LAK)
  totalProfit: number;     // กำไรรวม (ใน LAK)
}

export interface MerchantSummary {
  totalOrders: number;
  totalIncome: number;     // รายได้รวม (ใน LAK)
  totalExpense: number;    // รายจ่ายรวม (ใน LAK)
  totalProfit: number;     // กำไรรวม (ใน LAK)
  byCurrency: CurrencySummary[];
}

/**
 * คำนวณสรุปราคาตามสกุลเงินเป้าหมาย (target currency)
 * Logic เดียวกับ API POST /dashboard/merchant/price-currency-summary
 * 
 * การทำงาน:
 * 1. จัดกลุ่มออเดอร์ตามสกุลเงินที่ใช้ขาย (target currency)
 * 2. แปลงรายได้/รายจ่ายเป็น LAK โดยคูณกับอัตราแลกเปลี่ยน
 * 3. สรุปผลเป็น LAK ทั้งหมด
 * 
 * ตัวอย่างการคำนวณ:
 * - รายได้ = sellingAmount * sellRate (แปลงเป็น LAK)
 * - รายจ่าย = (purchaseCost + shippingCost) * buyRate (แปลงเป็น LAK)
 * - กำไร = รายได้ - รายจ่าย (ใน LAK)
 */
export function calculateMerchantPriceCurrencySummary(
  orders: Order[]
): MerchantSummary {
  // เริ่มต้นด้วยข้อมูลเปล่า
  const summary: MerchantSummary = {
    totalOrders: 0,
    totalIncome: 0,
    totalExpense: 0,
    totalProfit: 0,
    byCurrency: []
  };

  // สร้าง Map สำหรับเก็บข้อมูลตามสกุลเงิน
  const currencyMap = new Map<string, CurrencySummary>();

    // วนลูปผ่านทุกออเดอร์
  orders.forEach(order => {
    // เพิ่มจำนวนออเดอร์ทั้งหมด
    summary.totalOrders += 1;

    // หาสกุลเงินเป้าหมาย (จาก selling rate ของออเดอร์)
    const targetCurrency = order.exchangeRateSell?.targetCurrency || 'LAK';

    // ถ้ายังไม่มีใน Map ให้สร้างใหม่
    if (!currencyMap.has(targetCurrency)) {
      currencyMap.set(targetCurrency, {
        targetCurrency,
        totalOrders: 0,
        totalIncome: 0,
        totalExpense: 0,
        totalProfit: 0
      });
    }

    // ดึงข้อมูลสกุลเงินนี้
    const currencyData = currencyMap.get(targetCurrency)!;

    // เพิ่มจำนวนออเดอร์ในสกุลนี้
    currencyData.totalOrders += 1;

    // คำนวณรายได้ (selling total) - แปลงเป็น LAK
    let incomeInLak = 0;
    if (order.targetCurrencyTotalSellingAmount) {
      // ใช้ค่าที่แปลงเป็น LAK แล้ว (ถ้ามี)
      incomeInLak = Number(order.targetCurrencyTotalSellingAmount) || 0;
    } else {
      // คำนวณจาก selling amount * exchange rate
      const sellingAmount = Number(order.totalSellingAmount) || 0;
      const sellRate = Number(order.exchangeRateSellValue) || 1;
      incomeInLak = sellingAmount * sellRate;
    }
    currencyData.totalIncome += incomeInLak;
    summary.totalIncome += incomeInLak;

    // คำนวณรายจ่าย (purchase total + shipping) - แปลงเป็น LAK
    let expenseInLak = 0;
    if (order.targetCurrencyTotalFinalCost) {
      // ใช้ค่าที่แปลงเป็น LAK แล้ว (ถ้ามี)
      expenseInLak = Number(order.targetCurrencyTotalFinalCost) || 0;
    } else {
      // คำนวณจาก purchase + shipping * exchange rate
      const purchaseCost = Number(order.totalPurchaseCost) || 0;
      const shippingCost = Number(order.totalShippingCost) || 0;
      const buyRate = Number(order.exchangeRateBuyValue) || 1;
      expenseInLak = (purchaseCost + shippingCost) * buyRate;
    }
    currencyData.totalExpense += expenseInLak;
    summary.totalExpense += expenseInLak;

    // คำนวณกำไร (ใน LAK)
    const profit = incomeInLak - expenseInLak;
    currencyData.totalProfit += profit;
  });

  // คำนวณกำไรรวม
  summary.totalProfit = summary.totalIncome - summary.totalExpense;

  // แปลง Map เป็น Array และเรียงลำดับ
  summary.byCurrency = Array.from(currencyMap.values()).sort((a, b) => {
    // เรียงลำดับตามจำนวนออเดอร์ (มากไปน้อย)
    return b.totalOrders - a.totalOrders;
  });

  return summary;
}

/**
 * ฟังก์ชันสำหรับ format ตัวเลข (ค่าเริ่มต้นเป็น LAK)
 */
export function formatCurrency(amount: number, currency: string = 'LAK'): string {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  
  return currency ? `${formatted} ${currency}` : formatted;
}

/**
 * ฟังก์ชันสำหรับหาสกุลเงินที่ใช้มากที่สุด
 */
export function getPrimaryCurrency(summary: MerchantSummary): string {
  if (summary.byCurrency.length === 0) return 'LAK';
  
  return summary.byCurrency.reduce((prev, current) => 
    prev.totalOrders > current.totalOrders ? prev : current
  ).targetCurrency;
}

/**
 * ฟังก์ชันสำหรับตรวจสอบสถานะการเงิน
 */
export function getFinancialStatus(summary: MerchantSummary): {
  status: 'profit' | 'loss' | 'break-even';
  percentage: number;
} {
  if (summary.totalProfit > 0) {
    return {
      status: 'profit',
      percentage: (summary.totalProfit / summary.totalExpense) * 100
    };
  } else if (summary.totalProfit < 0) {
    return {
      status: 'loss', 
      percentage: Math.abs((summary.totalProfit / summary.totalExpense) * 100)
    };
  } else {
    return {
      status: 'break-even',
      percentage: 0
    };
  }
}
