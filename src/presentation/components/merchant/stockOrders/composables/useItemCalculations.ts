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

  // Shipping converted to LAK, respecting which exchange rate the shipping price is denominated in
  const calcShippingLak = (item: ItemForm) => {
    if (item.shippingCurrency === 'sell') return item.shippingPrice * getSellRate();
    return item.shippingPrice * getBuyRate(); // default: 'buy' (foreign currency)
  };

  // Shipping expressed in buy-base foreign currency (e.g. CNY) for the "Foreign" display fields
  const calcShippingForeign = (item: ItemForm) => {
    const shippingLak = calcShippingLak(item);
    const rate = getBuyRate();
    return rate === 0 ? 0 : shippingLak / rate;
  };

  const calcPurchaseAndShipForeign = (item: ItemForm) => {
    const rate = getBuyRate();
    if (rate === 0) return 0;
    // Convert purchase to KIP, add shipping in KIP, then convert back to buy-base foreign
    const purchaseLak = item.purchasePrice * getItemTotalQty(item) * rate;
    const shippingLak = calcShippingLak(item);
    return (purchaseLak + shippingLak) / rate;
  };
  const calcPurchaseAndShipLak = (item: ItemForm) =>
    calcPurchaseTotalLak(item) + calcShippingLak(item);
  const calcSubtotalLak = (item: ItemForm) => calcPurchaseTotalLak(item) + calcShippingLak(item);

  const calcDiscountLak = (item: ItemForm) => {
    const subtotal = calcSubtotalLak(item);
    if (item.discountType === 'percent') return subtotal * (item.discountValue / 100);
    // Cash discount is entered in buyBaseCcy, convert to KIP with buyRate
    if (item.discountType === 'cash') return item.discountValue * getBuyRate();
    return 0;
  };

  const calcDiscountForeign = (item: ItemForm) => {
    const rate = getBuyRate();
    return rate === 0 ? 0 : calcDiscountLak(item) / rate;
  };

  const calcNetCostForeign = (item: ItemForm) =>
    item.purchasePrice * getItemTotalQty(item) + calcShippingForeign(item) - calcDiscountForeign(item);

  const calcNetCostLak = (item: ItemForm) => calcSubtotalLak(item) - calcDiscountLak(item);

  const calcSellingUnitLak = (item: ItemForm) => item.sellingPriceForeign * getSellRate();
  const calcSellingTotalForeign = (item: ItemForm) => item.sellingPriceForeign * getItemTotalQty(item);
  const calcSellingTotalLak = (item: ItemForm) => item.sellingPriceForeign * getItemTotalQty(item) * getSellRate();

  // Variant-aware calculation functions
  const calcPurchaseTotalForeignWithVariants = (item: ItemForm) => {
    if (!item.variants || item.variants.length === 0) {
      return calcPurchaseTotalForeign(item);
    }
    
    // Sum across all variants
    const variantsTotal = item.variants.reduce((sum, variant) => {
      const variantQty = getVariantTotalQty(variant);
      return sum + (variant.purchasePrice * variantQty);
    }, 0);

    return variantsTotal;
  };

  const calcPurchaseTotalLakWithVariants = (item: ItemForm) => {
    const foreignTotal = calcPurchaseTotalForeignWithVariants(item);
    return foreignTotal * getBuyRate();
  };

  const calcSellingTotalForeignWithVariants = (item: ItemForm) => {
    if (!item.variants || item.variants.length === 0) {
      return calcSellingTotalForeign(item);
    }

    // Sum across all variants
    const variantsTotal = item.variants.reduce((sum, variant) => {
      const variantQty = getVariantTotalQty(variant);
      return sum + (variant.sellingPriceForeign * variantQty);
    }, 0);

    return variantsTotal;
  };

  const calcSellingTotalLakWithVariants = (item: ItemForm) => {
    const foreignTotal = calcSellingTotalForeignWithVariants(item);
    return foreignTotal * getSellRate();
  };

  // Variant-aware discount: uses all-variants purchase total as base for percent discount
  const calcDiscountLakWithVariants = (item: ItemForm) => {
    if (!item.discountType) return 0;
    const variantsPurchaseLak = calcPurchaseTotalLakWithVariants(item);
    const shippingLak = calcShippingLak(item);
    const allVariantsSubtotal = variantsPurchaseLak + shippingLak;
    if (item.discountType === 'percent') return allVariantsSubtotal * (item.discountValue / 100);
    // Cash discount is entered in buyBaseCcy, convert to KIP with buyRate
    if (item.discountType === 'cash') return item.discountValue * getBuyRate();
    return 0;
  };

  const calcDiscountForeignWithVariants = (item: ItemForm) => {
    const rate = getBuyRate();
    return rate === 0 ? 0 : calcDiscountLakWithVariants(item) / rate;
  };

  const calcNetCostForeignWithVariants = (item: ItemForm) => {
    const variantsPurchaseTotal = calcPurchaseTotalForeignWithVariants(item);
    const shippingForeign = calcShippingForeign(item);
    const discountForeign = calcDiscountForeignWithVariants(item);

    return variantsPurchaseTotal + shippingForeign - discountForeign;
  };

  const calcNetCostLakWithVariants = (item: ItemForm) => {
    const variantsPurchaseLak = calcPurchaseTotalLakWithVariants(item);
    const shippingLak = calcShippingLak(item);
    const discountLak = calcDiscountLakWithVariants(item);

    return variantsPurchaseLak + shippingLak - discountLak;
  };

  return {
    calcPurchaseTotalForeign,
    calcPurchaseUnitLak,
    calcPurchaseTotalLak,
    calcShippingLak,
    calcPurchaseAndShipForeign,
    calcPurchaseAndShipLak,
    calcDiscountLak,
    calcDiscountForeign,
    calcNetCostForeign,
    calcNetCostLak,
    calcSellingUnitLak,
    calcSellingTotalForeign,
    calcSellingTotalLak,
    // New variant-aware functions
    calcPurchaseTotalForeignWithVariants,
    calcPurchaseTotalLakWithVariants,
    calcSellingTotalForeignWithVariants,
    calcSellingTotalLakWithVariants,
    calcNetCostForeignWithVariants,
    calcNetCostLakWithVariants,
  };
}
