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
  shippingPrice: number;
  discountType: 'percent' | 'cash' | undefined;
  discountValue: number;
  sellingPriceForeign: number;
  customers: CustomerInItemForm[];
  quantity: number; // Add missing quantity property
}

export interface DraftData {
  orderCode: string;
  items: ItemForm[];
}
