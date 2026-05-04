import type { Order } from '@/domain/entities/user.entity';
import type { ItemForm, ProductVariant, CustomerInItemForm } from '@/presentation/components/merchant/stockOrders/types';

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
}

function parseDiscountType(raw: string | null | undefined): 'percent' | 'cash' | undefined {
  if (raw === 'PERCENT') return 'percent';
  if (raw === 'FIX') return 'cash';
  return undefined;
}

function buildCustomerDiscount(co: { discountType?: string | null; discountValue?: string | null }): {
  discountType?: 'percent' | 'cash';
  discountValue?: number;
} {
  const dt = parseDiscountType(co.discountType);
  if (!dt) return {};
  return { discountType: dt, discountValue: Number(co.discountValue ?? 0) };
}

export function orderToItemForms(order: Order): {
  orderCode: string;
  items: ItemForm[];
  shippingPrice: number;
  shippingCurrency: 'buy' | 'sell';
} {
  // Build a lookup: customerId → { discountType, discountValue }
  const customerDiscountLookup = new Map<number, { discountType?: 'percent' | 'cash'; discountValue?: number }>();
  for (const co of order.customerOrders ?? []) {
    customerDiscountLookup.set(co.customerId, buildCustomerDiscount(co));
  }

  const items: ItemForm[] = (order.orderItems ?? []).map(orderItem => {
    const skus = orderItem.skus || [];

    if (skus.length <= 1) {
      const sku = skus[0];
      const customers: CustomerInItemForm[] = [];

      for (const co of order.customerOrders ?? []) {
        for (const coi of co.customerOrderItems) {
          const skuId = sku?.id;
          if (skuId !== undefined && coi.orderItemSkuId === skuId) {
            const disc = customerDiscountLookup.get(co.customerId) ?? {};
            customers.push({
              uid: uid(),
              customerId: co.customerId,
              qty: coi.quantity,
              ...disc,
            });
          }
        }
      }

      // Determine discount mode: if any customer has a unique discount → manual; else 'all'
      const uniqueDiscounts = new Set(customers.map(c => `${c.discountType}|${c.discountValue}`));
      const allSameDiscount = uniqueDiscounts.size <= 1;
      const firstCust = customers[0];
      const sharedDiscountType = allSameDiscount ? firstCust?.discountType : undefined;
      const sharedDiscountValue = allSameDiscount ? (firstCust?.discountValue ?? 0) : 0;
      const discountMode: 'all' | 'manual' = (allSameDiscount && !sharedDiscountType) || allSameDiscount ? 'all' : 'manual';

      return {
        uid: uid(),
        productName: orderItem.productName,
        variant: sku?.variant ?? '',
        purchasePrice: Number(sku?.purchasePrice ?? 0),
        sellingPriceForeign: Number(sku?.sellingPriceForeign ?? 0),
        discountMode,
        discountType: discountMode === 'all' ? sharedDiscountType : undefined,
        discountValue: discountMode === 'all' ? sharedDiscountValue : 0,
        quantity: orderItem.quantity,
        imageId: orderItem.imageId ?? undefined,
        productImage: orderItem.image?.publicUrl ?? undefined,
        customers,
      };
    }

    // Multiple SKUs → variants
    const variants: ProductVariant[] = skus.map(sku => {
      const skuCustomers: CustomerInItemForm[] = [];

      for (const co of order.customerOrders ?? []) {
        for (const coi of co.customerOrderItems) {
          if (coi.orderItemSkuId === sku.id) {
            const disc = customerDiscountLookup.get(co.customerId) ?? {};
            skuCustomers.push({
              uid: uid(),
              customerId: co.customerId,
              qty: coi.quantity,
              ...disc,
            });
          }
        }
      }

      return {
        uid: uid(),
        variant: sku.variant ?? '',
        purchasePrice: Number(sku.purchasePrice),
        sellingPriceForeign: Number(sku.sellingPriceForeign),
        customers: skuCustomers,
      };
    });

    // Determine discount mode from variant customers
    const allVariantCustomers = variants.flatMap(v => v.customers);
    const uniqueVariantDiscounts = new Set(allVariantCustomers.map(c => `${c.discountType}|${c.discountValue}`));
    const allSameVariantDiscount = uniqueVariantDiscounts.size <= 1;
    const firstVariantCust = allVariantCustomers[0];
    const variantDiscountMode: 'all' | 'manual' = allSameVariantDiscount ? 'all' : 'manual';
    const variantSharedDiscountType = allSameVariantDiscount ? firstVariantCust?.discountType : undefined;
    const variantSharedDiscountValue = allSameVariantDiscount ? (firstVariantCust?.discountValue ?? 0) : 0;

    return {
      uid: uid(),
      productName: orderItem.productName,
      variant: '',
      purchasePrice: 0,
      sellingPriceForeign: 0,
      discountMode: variantDiscountMode,
      discountType: variantDiscountMode === 'all' ? variantSharedDiscountType : undefined,
      discountValue: variantDiscountMode === 'all' ? variantSharedDiscountValue : 0,
      quantity: orderItem.quantity,
      imageId: orderItem.imageId ?? undefined,
      productImage: orderItem.image?.publicUrl ?? undefined,
      customers: [],
      variants,
    };
  });

  // Get shipping price from the first order item (same value applied to all items by backend)
  const rawShipping = order.orderItems?.[0]?.shippingPrice;
  const shippingPrice = rawShipping ? Number(rawShipping) : 0;

  return {
    orderCode: order.orderCode,
    items,
    shippingPrice,
    shippingCurrency: 'buy',
  };
}
