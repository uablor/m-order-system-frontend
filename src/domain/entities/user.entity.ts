export interface ExchangeRate {
  id: number;
  merchantId: number;
  baseCurrency: string;
  targetCurrency: string;
  rateType: 'BUY' | 'SELL';
  rate: string;
  isActive: boolean;
  rateDate: string;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  roleId: number;
  roleName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
}

export interface Role {
  id: number;
  roleName: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: number;
  permissionCode: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermission {
  id: number;
  roleId: number;
  permissionId: number;
  createdAt: string;
  updatedAt: string;
}

export type MerchantCurrency = 'THB' | 'USD' | 'LAK';

export interface Merchant {
  id: number;
  ownerUserId: number;
  shopName: string;
  shopLogoUrl: string | null;
  shopAddress: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  contactFacebook: string | null;
  contactLine: string | null;
  contactWhatsapp: string | null;
  defaultCurrency: MerchantCurrency;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantDetailOwner {
  id: number;
  email: string;
  fullName: string;
  roleId: number;
  roleName?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
}

export interface MerchantDetailFinancial {
  totalOrders: number;
  ordersUnpaid: number;
  ordersPartial: number;
  ordersPaid: number;
  totalIncomeLak: number;
  totalIncomeThb: number;
  totalExpenseLak: number;
  totalExpenseThb: number;
  totalProfitLak: number;
  totalProfitThb: number;
  totalPaidAmount: number;
  totalRemainingAmount: number;
}

export interface MerchantDetailSummary {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  customerTypeCustomer: number;
  customerTypeAgent: number;
  financial: MerchantDetailFinancial;
}

export interface MerchantDetail extends Merchant {
  owner: MerchantDetailOwner | null;
  summary: MerchantDetailSummary;
}

export type CustomerType = 'CUSTOMER' | 'AGENT';
export type PreferredContactMethod = 'PHONE' | 'FACEBOOK' | 'WHATSAPP' | 'LINE';

export interface Customer {
  id: number;
  merchantId: number;
  customerName: string;
  customerType: CustomerType;
  shippingAddress: string | null;
  shippingProvider: string | null;
  shippingSource: string | null;
  shippingDestination: string | null;
  paymentTerms: string | null;
  contactPhone: string | null;
  contactFacebook: string | null;
  contactWhatsapp: string | null;
  contactLine: string | null;
  preferredContactMethod: PreferredContactMethod | null;
  uniqueToken: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthPayload {
  userId: number;
  email: string;
  roleName: string;
  merchantId?: number;
  iat: number;
  exp: number;
}

export interface AdminDashboard {
  totalMerchants: number;
  activeMerchants: number;
  totalUsers: number;
  activeUsers: number;
  totalCustomers: number;
  activeCustomers: number;
  totalOrders: number;
  ordersThisMonth: number;
  ordersByPaymentStatus: {
    UNPAID: number;
    PARTIAL: number;
    PAID: number;
  };
  ordersByArrivalStatus: {
    NOT_ARRIVED: number;
    ARRIVED: number;
  };
  totalFinalCost: number;
  totalRevenueLAK: number;
  totalRevenueTHB: number;
  totalProfitLAK: number;
  totalProfitTHB: number;
  totalOutstandingAmount: number;
}

export interface MonthlyReport {
  month: number;
  monthName: string;
  orderCount: number;
  finalCostLak: string;
  revenueLak: string;
  revenueThb: string;
  profitLak: string;
  profitThb: string;
}

export interface AnnualReport {
  year: number;
  months: MonthlyReport[];
}

export interface LatestOrder {
  id: number;
  orderCode: string;
  arrivalStatus: string;
  totalAmount: string;
  customerName: string | null;
}

export interface MerchantDashboard {
  merchantId: number;
  shopName: string;
  totalOrders: number;
  totalOrdersThisMonth: number;
  ordersByPaymentStatus: {
    UNPAID: number;
    PARTIAL: number;
    PAID: number;
  };
  ordersByArrivalStatus: {
    NOT_ARRIVED: number;
    ARRIVED: number;
  };
  totalCustomers: number;
  totalArrivals: number;
  totalFinalCostLak: string;
  totalRevenueLak: string;
  totalRevenueThb: string;
  totalProfitLak: string;
  totalProfitThb: string;
  totalOutstandingAmountLak: string;
  latestOrders: LatestOrder[];
}

export type RateType = 'BUY' | 'SELL';
export type CurrencyCode = 'THB' | 'USD' | 'LAK';

export type ArrivalStatusEnum = 'NOT_ARRIVED' | 'ARRIVED';
export type PaymentStatusEnum = 'UNPAID' | 'PARTIAL' | 'PAID';
export type ArrivalItemCondition = 'OK' | 'DAMAGED' | 'LOST';

export interface OrderItem {
  id: number;
  orderId: number;
  productName: string;
  variant: string | null;
  quantity: number;
  quantityRemaining: number;
  purchaseCurrency: string;
  purchasePrice: string;
  purchaseExchangeRate: string;
  purchaseTotalLak: string;
  shippingPrice: string;
  shippingLak: string;
  totalCostBeforeDiscountLak: string;
  discountType: string | null;
  discountValue: string;
  discountAmountLak: string;
  finalCostLak: string;
  finalCostThb: string;
  sellingPriceForeign: string;
  sellingExchangeRate: string;
  sellingTotalLak: string;
  profitLak: string;
  profitThb: string;
  totalPriceLak: string;
  totalPriceThb: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerOrderItem {
  id: number;
  customerOrderId: number;
  orderItemId: number;
  quantity: number;
  sellingPriceForeign: string | null;
  sellingPriceLak: string;
  sellingPriceThb: string;
  sellingTotalLak: string;
  profitLak: string;
  orderItem?: { productName: string; variant: string | null };
  createdAt: string;
  updatedAt: string;
}

export interface CustomerOrder {
  id: number;
  orderId: number;
  customerId: number;
  totalSellingAmountLak: string;
  totalSellingAmountThb: string;
  paymentStatus: PaymentStatusEnum;
  paidAmount: string;
  remainingAmount: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  customerOrderItems?: CustomerOrderItem[];
}

export interface Order {
  id: number;
  merchantId: number;
  createdBy: number | null;
  orderCode: string;
  orderDate: string;
  arrivalStatus: ArrivalStatusEnum;
  arrivedAt: string | null;
  notifiedAt: string | null;
  totalPurchaseCostLak: string;
  totalShippingCostLak: string;
  totalCostBeforeDiscountLak: string;
  totalDiscountLak: string;
  totalFinalCostLak: string;
  totalFinalCostThb: string;
  totalSellingAmountLak: string;
  totalSellingAmountThb: string;
  totalProfitLak: string;
  totalProfitThb: string;
  depositAmount: string;
  paidAmount: string;
  remainingAmount: string;
  paymentStatus: PaymentStatusEnum;
  createdByUser?: User | null;
  orderItems?: OrderItem[];
  customerOrders?: CustomerOrder[];
  createdAt: string;
  updatedAt: string;
}

export interface ArrivalItem {
  id: number;
  arrivalId: number;
  orderItemId: number;
  arrivedQuantity: number;
  condition: ArrivalItemCondition | null;
  notes: string | null;
  orderItem?: OrderItem;
  createdAt: string;
  updatedAt: string;
}

export interface Arrival {
  id: number;
  orderId: number;
  merchantId: number;
  arrivedDate: string;
  arrivedTime: string;
  recordedBy: number | null;
  notes: string | null;
  order?: Order;
  merchant?: Merchant;
  recordedByUser?: User | null;
  arrivalItems?: ArrivalItem[];
  createdAt: string;
  updatedAt: string;
}
