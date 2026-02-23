export interface ItemForm {
  uid: string;
  productName: string;
  variant: string;
  quantity: number;
  purchasePrice: number;
  shippingPrice: number;
  discountType: 'percent' | 'cash' | undefined;
  discountValue: number;
  sellingPriceForeign: number;
}

export interface CoItemForm {
  orderItemIndex: number;
  quantity: number;
  sellingPriceForeign: number | undefined;
}

export interface CustomerOrderForm {
  uid: string;
  customerId: number | undefined;
  items: CoItemForm[];
}

export interface DraftData {
  orderCode: string;
  items: ItemForm[];
  customerOrders: CustomerOrderForm[];
}
