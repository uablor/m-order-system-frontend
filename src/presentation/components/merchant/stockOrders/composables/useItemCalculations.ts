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
      const sellRate = getSellRate();
      item.customers.forEach(cust => {
        if (cust.discountType && cust.discountValue) {
          const custSellingLak = item.sellingPriceForeign * cust.qty * sellRate;
          if (cust.discountType === 'percent') {
            totalDiscount += custSellingLak * (cust.discountValue / 100);
          } else if (cust.discountType === 'cash') {
            totalDiscount += cust.discountValue * sellRate;
          }
        }
      });
      return totalDiscount;
    }
    // All mode: use item-level discount based on selling price
    const subtotal = item.sellingPriceForeign * getItemTotalQty(item) * getSellRate();
    if (item.discountType === 'percent') return subtotal * (item.discountValue / 100);
    if (item.discountType === 'cash') return item.discountValue * getSellRate();
    return 0;
  };

  const calcDiscountForeign = (item: ItemForm) => {
    const rate = getSellRate();
    return rate === 0 ? 0 : calcDiscountLak(item) / rate;
  };

  const calcNetCostForeign = (item: ItemForm) => {
    const purchaseTotalForeign = item.purchasePrice * getItemTotalQty(item);
    const discountLak = calcDiscountLak(item); // Discount in LAK
    const buyRate = getBuyRate();
    
    // Convert discount from LAK to buyBaseCcy using buy rate
    const discountInBuyCurrency = buyRate === 0 ? 0 : discountLak / buyRate;
    
    return purchaseTotalForeign - discountInBuyCurrency;
  };

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
      const sellRate = getSellRate();
      item.variants.forEach(variant => {
        variant.customers.forEach(cust => {
          if (cust.discountType && cust.discountValue) {
            const custSellingLak = variant.sellingPriceForeign * cust.qty * sellRate;
            if (cust.discountType === 'percent') {
              totalDiscount += custSellingLak * (cust.discountValue / 100);
            } else if (cust.discountType === 'cash') {
              totalDiscount += cust.discountValue * sellRate;
            }
          }
        });
      });
      return totalDiscount;
    }
    // All mode: use item-level discount based on selling price
    if (!item.discountType) return 0;
    const variantsSellingLak = calcSellingTotalLakWithVariants(item);
    if (item.discountType === 'percent') return variantsSellingLak * (item.discountValue / 100);
    if (item.discountType === 'cash') return item.discountValue * getSellRate();
    return 0;
  };

  const calcNetCostForeignWithVariants = (item: ItemForm) => {
    const purchaseTotalForeign = calcPurchaseTotalForeignWithVariants(item);
    const discountLak = calcDiscountLakWithVariants(item); // Discount in LAK
    const buyRate = getBuyRate();
    
    // Convert discount from LAK to buyBaseCcy using buy rate
    const discountInBuyCurrency = buyRate === 0 ? 0 : discountLak / buyRate;
    
    return purchaseTotalForeign - discountInBuyCurrency;
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
