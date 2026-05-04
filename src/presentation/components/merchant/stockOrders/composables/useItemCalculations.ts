import type { ItemForm } from '../types';
import { getItemTotalQty } from './useOrderItems';

// Helper function to get total quantity for a variant
function getVariantTotalQty(variant: any): number {
  return variant.customers?.reduce((sum: number, c: any) => sum + (c.qty || 0), 0) || 0;
}

export function useItemCalculations(getBuyRate: () => number, getSellRate: () => number) {
  const calcPurchaseTotalForeign = (item: ItemForm) => item.purchasePrice * getItemTotalQty(item);
  const calcPurchaseUnitLak = (item: ItemForm) => item.purchasePrice * getBuyRate();
  const calcPurchaseTotalLak = (item: ItemForm) => item.purchasePrice * getItemTotalQty(item) * getBuyRate();

  const calcDiscountLak = (item: ItemForm) => {
    // Manual mode: sum up per-customer discounts
    if (item.discountMode === 'manual') {
      let totalDiscount = 0;
      const buyRate = getBuyRate();
      item.customers.forEach(cust => {
        if (cust.discountType && cust.discountValue) {
          const custPurchaseLak = item.purchasePrice * cust.qty * buyRate;
          if (cust.discountType === 'percent') {
            totalDiscount += custPurchaseLak * (cust.discountValue / 100);
          } else if (cust.discountType === 'cash') {
            totalDiscount += cust.discountValue * buyRate;
          }
        }
      });
      return totalDiscount;
    }
    // All mode: use item-level discount
    const subtotal = calcPurchaseTotalLak(item);
    if (item.discountType === 'percent') return subtotal * (item.discountValue / 100);
    if (item.discountType === 'cash') return item.discountValue * getBuyRate();
    return 0;
  };

  const calcDiscountForeign = (item: ItemForm) => {
    const rate = getBuyRate();
    return rate === 0 ? 0 : calcDiscountLak(item) / rate;
  };

  const calcNetCostForeign = (item: ItemForm) =>
    item.purchasePrice * getItemTotalQty(item) - calcDiscountForeign(item);

  const calcNetCostLak = (item: ItemForm) => calcPurchaseTotalLak(item) - calcDiscountLak(item);

  const calcSellingUnitLak = (item: ItemForm) => item.sellingPriceForeign * getSellRate();
  const calcSellingTotalForeign = (item: ItemForm) => item.sellingPriceForeign * getItemTotalQty(item);
  const calcSellingTotalLak = (item: ItemForm) => item.sellingPriceForeign * getItemTotalQty(item) * getSellRate();

  // Variant-aware calculation functions
  const calcPurchaseTotalForeignWithVariants = (item: ItemForm) => {
    if (!item.variants || item.variants.length === 0) {
      return calcPurchaseTotalForeign(item);
    }
    return item.variants.reduce((sum, variant) => {
      return sum + (variant.purchasePrice * getVariantTotalQty(variant));
    }, 0);
  };

  const calcPurchaseTotalLakWithVariants = (item: ItemForm) => {
    return calcPurchaseTotalForeignWithVariants(item) * getBuyRate();
  };

  const calcSellingTotalForeignWithVariants = (item: ItemForm) => {
    if (!item.variants || item.variants.length === 0) {
      return calcSellingTotalForeign(item);
    }
    return item.variants.reduce((sum, variant) => {
      return sum + (variant.sellingPriceForeign * getVariantTotalQty(variant));
    }, 0);
  };

  const calcSellingTotalLakWithVariants = (item: ItemForm) => {
    return calcSellingTotalForeignWithVariants(item) * getSellRate();
  };

  const calcDiscountLakWithVariants = (item: ItemForm) => {
    // Manual mode: sum up per-customer discounts
    if (item.discountMode === 'manual' && item.variants) {
      let totalDiscount = 0;
      const buyRate = getBuyRate();
      item.variants.forEach(variant => {
        variant.customers.forEach(cust => {
          if (cust.discountType && cust.discountValue) {
            const custPurchaseLak = variant.purchasePrice * cust.qty * buyRate;
            if (cust.discountType === 'percent') {
              totalDiscount += custPurchaseLak * (cust.discountValue / 100);
            } else if (cust.discountType === 'cash') {
              totalDiscount += cust.discountValue * buyRate;
            }
          }
        });
      });
      return totalDiscount;
    }
    // All mode: use item-level discount
    if (!item.discountType) return 0;
    const variantsPurchaseLak = calcPurchaseTotalLakWithVariants(item);
    if (item.discountType === 'percent') return variantsPurchaseLak * (item.discountValue / 100);
    if (item.discountType === 'cash') return item.discountValue * getBuyRate();
    return 0;
  };

  const calcDiscountForeignWithVariants = (item: ItemForm) => {
    const rate = getBuyRate();
    return rate === 0 ? 0 : calcDiscountLakWithVariants(item) / rate;
  };

  const calcNetCostForeignWithVariants = (item: ItemForm) => {
    return calcPurchaseTotalForeignWithVariants(item) - calcDiscountForeignWithVariants(item);
  };

  const calcNetCostLakWithVariants = (item: ItemForm) => {
    return calcPurchaseTotalLakWithVariants(item) - calcDiscountLakWithVariants(item);
  };

  return {
    calcPurchaseTotalForeign,
    calcPurchaseUnitLak,
    calcPurchaseTotalLak,
    calcDiscountLak,
    calcDiscountForeign,
    calcNetCostForeign,
    calcNetCostLak,
    calcSellingUnitLak,
    calcSellingTotalForeign,
    calcSellingTotalLak,
    calcPurchaseTotalForeignWithVariants,
    calcPurchaseTotalLakWithVariants,
    calcSellingTotalForeignWithVariants,
    calcSellingTotalLakWithVariants,
    calcNetCostForeignWithVariants,
    calcNetCostLakWithVariants,
  };
}
