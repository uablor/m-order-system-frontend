export interface CustomerInItemForm {
  uid: string;
  customerId: number | undefined;
  qty: number;
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
}

export interface DraftData {
  orderCode: string;
  items: ItemForm[];
}
