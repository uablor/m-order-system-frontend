import type { ItemForm } from '../types';

export function useItemCalculations(getBuyRate: () => number, getSellRate: () => number) {
  const calcPurchaseTotalForeign = (item: ItemForm) => item.purchasePrice * item.quantity;
  const calcPurchaseUnitLak = (item: ItemForm) => item.purchasePrice * getBuyRate();
  const calcPurchaseTotalLak = (item: ItemForm) => item.purchasePrice * item.quantity * getBuyRate();
  const calcShippingLak = (item: ItemForm) => item.shippingPrice * getBuyRate();
  const calcPurchaseAndShipForeign = (item: ItemForm) => item.purchasePrice + item.shippingPrice;
  const calcPurchaseAndShipLak = (item: ItemForm) => (item.purchasePrice + item.shippingPrice) * getBuyRate();
  const calcSubtotalLak = (item: ItemForm) => calcPurchaseTotalLak(item) + calcShippingLak(item);

  const calcDiscountLak = (item: ItemForm) => {
    const subtotal = calcSubtotalLak(item);
    if (item.discountType === 'percent') return subtotal * (item.discountValue / 100);
    if (item.discountType === 'cash') return item.discountValue * getBuyRate();
    return 0;
  };

  const calcDiscountForeign = (item: ItemForm) => {
    const rate = getBuyRate();
    return rate === 0 ? 0 : calcDiscountLak(item) / rate;
  };

  const calcNetCostForeign = (item: ItemForm) =>
    item.purchasePrice * item.quantity + item.shippingPrice - calcDiscountForeign(item);

  const calcNetCostLak = (item: ItemForm) => calcSubtotalLak(item) - calcDiscountLak(item);

  const calcSellingUnitLak = (item: ItemForm) => item.sellingPriceForeign * getSellRate();
  const calcSellingTotalForeign = (item: ItemForm) => item.sellingPriceForeign * item.quantity;
  const calcSellingTotalLak = (item: ItemForm) => item.sellingPriceForeign * item.quantity * getSellRate();

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
  };
}
