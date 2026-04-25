export interface CustomerInItemForm {
  uid: string;
  customerId: number | undefined;
  qty: number;
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
  shippingPrice: number; // ✅ Move to item level
  shippingCurrency?: 'buy' | 'sell'; // which exchange rate the shipping is priced in
  discountType: 'percent' | 'cash' | undefined; // ✅ Move to item level
  discountValue: number; // ✅ Move to item level
  sellingPriceForeign: number;
  customers: CustomerInItemForm[];
  quantity: number; // Add missing quantity property
  productImage?: string; // Product image URL
  imageId?: number; // Database image ID
  variants?: ProductVariant[]; // Array of product variants
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
}

export interface DraftData {
  orderCode: string;
  items: ItemForm[];
}
