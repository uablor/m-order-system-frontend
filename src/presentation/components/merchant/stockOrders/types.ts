export interface CustomerInItemForm {
  uid: string;
  customerId: number | undefined;
  qty: number;
  discountType?: 'percent' | 'cash' | undefined;
  discountValue?: number;
  customerOrderId?: number;
}

export interface CoItemForm {
  orderItemIndex: number;
  quantity: number;
  sellingPriceForeign: number;
}

export interface CustomerOrderForm {
  uid: string;
  customerId: number | undefined;
  items: CoItemForm[];
}

export interface ItemForm {
  uid: string;
  productName: string;
  variant: string;
  purchasePrice: number;
  discountMode?: 'all' | 'manual';
  discountType: 'percent' | 'cash' | undefined;
  discountValue: number;
  sellingPriceForeign: number;
  customers: CustomerInItemForm[];
  quantity: number;
  productImage?: string;
  imageId?: number;
  variants?: ProductVariant[];
  orderItemId?: number;
  orderItemSkuId?: number;
}

// Product variant interface
export interface ProductVariant {
  uid: string;
  variant: string;
  purchasePrice: number;
  sellingPriceForeign: number;
  // ✅ Remove shippingPrice, discountType, discountValue from variant level
  customers: CustomerInItemForm[];
  productImage?: string; // Product image URL for this variant
  orderItemSkuId?: number;
}

export interface DraftData {
  orderCode: string;
  items: ItemForm[];
  shippingPrice?: number;
  shippingCurrency?: 'buy' | 'sell';
}
