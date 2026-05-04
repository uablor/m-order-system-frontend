import type { Order } from '@/domain/entities/user.entity';
import type { ItemForm, ProductVariant, CustomerInItemForm } from '@/presentation/components/merchant/stockOrders/types';

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
}

export function orderToItemForms(order: Order): { orderCode: string; items: ItemForm[] } {
  const items: ItemForm[] = order.orderItems.map(orderItem => {
    const skus = orderItem.skus || [];

    if (skus.length <= 1) {
      const sku = skus[0];
      const customers: CustomerInItemForm[] = [];

      for (const co of order.customerOrders) {
        for (const coi of co.customerOrderItems) {
          const skuId = sku?.id;
          if (skuId !== undefined && (coi.orderItemSkuId === skuId)) {
            customers.push({
              uid: uid(),
              customerId: co.customerId,
              qty: coi.quantity,
            });
          }
        }
      }

      return {
        uid: uid(),
        productName: orderItem.productName,
        variant: sku?.variant ?? '',
        purchasePrice: Number(sku?.purchasePrice ?? 0),
        sellingPriceForeign: Number(sku?.sellingPriceForeign ?? 0),
        shippingPrice: 0,
        shippingCurrency: 'buy' as const,
        discountType: undefined,
        discountValue: 0,
        quantity: orderItem.quantity,
        imageId: orderItem.imageId ?? undefined,
        productImage: orderItem.image?.publicUrl ?? undefined,
        customers,
      };
    }

    // Multiple SKUs → variants
    const variants: ProductVariant[] = skus.map(sku => {
      const skuCustomers: CustomerInItemForm[] = [];

      for (const co of order.customerOrders) {
        for (const coi of co.customerOrderItems) {
          if (coi.orderItemSkuId === sku.id) {
            skuCustomers.push({
              uid: uid(),
              customerId: co.customerId,
              qty: coi.quantity,
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

    return {
      uid: uid(),
      productName: orderItem.productName,
      variant: '',
      purchasePrice: 0,
      sellingPriceForeign: 0,
      shippingPrice: 0,
      shippingCurrency: 'buy' as const,
      discountType: undefined,
      discountValue: 0,
      quantity: orderItem.quantity,
      imageId: orderItem.imageId ?? undefined,
      productImage: orderItem.image?.publicUrl ?? undefined,
      customers: [],
      variants,
    };
  });

  return { orderCode: order.orderCode, items };
}
