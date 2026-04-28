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

export interface MerchantFinancialByCurrency {
  baseCurrency: string;
  totalOrders: number;
  totalIncomeLak: number;
  totalExpenseLak: number;
  totalProfitLak: number;
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
  byCurrency: MerchantFinancialByCurrency[];
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

export interface TopMerchant {
  id: number;
  shopName: string;
  totalOrders: number;
  ownerUser?: string;
  ownerUserEmail?: string;
}

export interface RecentUserLogin {
  id: number;
  fullName: string;
  email: string;
  lastLogin: Date;
  merchant?: { id: number; shopName: string };
}

export interface AdminDashboardSummary {
  totalMerchants: number;
  totalAdminUsers: number;
  totalMerchantUsers: number;
  totalOrders: number;
}

export interface AdminDashboardDetails {
  topMerchants: TopMerchant[];
  recentUserLogins: RecentUserLogin[];
}

export interface AdminDashboard {
  summary: AdminDashboardSummary;
  details: AdminDashboardDetails;
}

export interface MonthlyReport {
  month: number;
  monthName: string;
  orderCount: number;
  finalCost: string;
  revenue: string;
  profit: string;
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

export interface MerchantSummary {
  totalUsers: number;
  totalCustomers: number;
  totalOrders: number;
  totalPaidOrders: number;
  totalArrivals: number;
  totalOrderItems: number;
}

export interface MerchantPriceSummary {
  totalOrderItemsPrice: number;
  totalOrderItemsPriceUnpaid: number;
  totalOrderItemsPricePaid: number;
  totalOrderItemsFinalCostPaid: number;
  totalPaymentsPrice: number;
  totalPaymentsPriceRejected: number;
  totalPaymentsPricePendingVerified: number;
  totalPaymentsPricePendingRejected: number;
  totalFinalCost: number;
  totalShippingPrice: number;
  totalFinalCostPaid: number;
  totalShippingPricePaid: number;
}

export interface MerchantPriceListEntry {
  totalPrice: number;
  totalPriceUnpaid: number;
  totalPricePaid: number;
}

export interface MerchantPriceList {
  usdt: MerchantPriceListEntry;
  thb: MerchantPriceListEntry;
  lak: MerchantPriceListEntry;
}

export interface MerchantDashboard {
  summary: MerchantSummary;
  priceCurrencySummary: MerchantPriceCurrencySummaryDto[];
  topCustomers: TopCustomersResponseDto;
}

export interface TopCustomerDto {
  rank: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  totalBuyAmountLak: number;
  orderCount: number;
  averageOrderAmountLak: number;
}

export interface TopCustomersResponseDto {
  customers: TopCustomerDto[];
}

export interface MerchantPriceCurrencySummaryDto {
  baseCurrency?: string;
  targetCurrency?: string;
  totalAll: number;
  totalUnpaid: number;
  totalPaid: number;
  totalAllConverted?: number;
  totalUnpaidConverted?: number;
  totalPaidConverted?: number;
}

/** Response from POST /dashboard/merchant/price-currency-summary-by-date */
export interface PriceCurrencySummaryByDateMonthDto {
  year: number;
  month: number;
  currencies: Array<{
    type: 'BUY' | 'SELL';
    baseCurrency: string;
    totalAll: number;
    totalUnpaid: number;
    totalPaid: number;
  }>;
  summary: {
    targetCurrency: string;
    totalAll: number;
    totalUnpaid: number;
    totalPaid: number;
  };
}

export interface PriceCurrencySummaryByDateResponseDto {
  startDate: string;
  endDate: string;
  months: PriceCurrencySummaryByDateMonthDto[];
  totalSummary: {
    targetCurrency: string;
    totalAll: number;
    totalUnpaid: number;
    totalPaid: number;
  };
}

export interface PriceCurrencySummaryByDateRequestDto {
  startDate?: string;
  endDate?: string;
  merchantId?: number;
}

export type RateType = 'BUY' | 'SELL';
export type CurrencyCode = 'THB' | 'USD' | 'LAK';

export type ArrivalStatusEnum = 'NOT_ARRIVED' | 'ARRIVED';
export type PaymentStatusEnum = 'UNPAID' | 'PARTIAL' | 'PAID';
export type ArrivalItemCondition = 'OK' | 'DAMAGED' | 'LOST';

export interface ExchangeRateSnapshot {
  id: number;
  baseCurrency: string;
  targetCurrency: string;
  rate: string;
  rateType: string;
  rateDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemSku {
  id: number;
  orderItemId: number;
  orderItemSkuIndex: number | null;
  variant: string | null;
  quantity: number;
  exchangeRateBuy: ExchangeRateSnapshot | null;
  exchangeRateSell: ExchangeRateSnapshot | null;
  exchangeRateBuyValue: string | null;
  exchangeRateSellValue: string | null;
  purchasePrice: string;
  purchaseTotal: string;
  sellingPriceForeign: string;
  sellingTotal: string;
  profit: string;
  targetCurrencyPurchaseTotal: string | null;
  targetCurrencyPurchasePrice: string | null;
  targetCurrencySellingPriceForeign: string | null;
  targetCurrencySellingTotal: string | null;
  targetCurrencyProfit: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productName: string;
  variant: string | null;
  quantity: number;
  imageId?: number | null;
  image?: {
    id: number;
    publicUrl: string | null;
    fileName: string;
    originalName: string;
  } | null;
  skus: OrderItemSku[];
  exchangeRateBuy: ExchangeRateSnapshot | null;
  exchangeRateSell: ExchangeRateSnapshot | null;
  exchangeRateBuyValue: string | null;
  exchangeRateSellValue: string | null;
  purchasePrice: string;
  purchaseTotal: string;
  shippingPrice: string | null;
  totalCostBeforeDiscount: string;
  discountType: string | null;
  discountValue: string | null;
  discountAmount: string;
  finalCost: string;
  sellingPriceForeign: string;
  sellingTotal: string;
  profit: string;
  targetCurrencyPurchasePrice: string;
  targetCurrencyPurchaseTotal: string;
  targetCurrencyShippingPrice: string;
  targetCurrencyTotalCostBeforeDiscount: string;
  targetCurrencyDiscountType: string | null;
  targetCurrencyDiscountValue: string | null;
  targetCurrencyDiscountAmount: string;
  targetCurrencyFinalCost: string;
  targetCurrencySellingPriceForeign: string;
  targetCurrencySellingTotal: string;
  targetCurrencyProfit: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerOrderItem {
  id: number;
  customerOrderId: number;
  orderItemId: number;
  orderItemSkuId?: number;
  orderItemIndex: number | null;
  productName: string | null;
  variant: string | null;
  quantity: number;
  sellingTotal: string;
  profit: string;
  exchangeRateSell?: {
    id: number;
    createdAt: string;
    updatedAt: string;
    baseCurrency: string;
    targetCurrency: string;
    rateType: string;
    rate: string;
    isActive: boolean;
    rateDate: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerSnapshotDto {
  id: number;
  customerName: string;
  customerType: string;
}

export interface CustomerOrder {
  id: number;
  orderId: number;
  customerId: number;
  customer: CustomerSnapshotDto | null;
  totalSellingAmount: string;
  paidAmount: string;
  remainingAmount: string;
  targetCurrencyTotalSellingAmount: string;
  targetCurrencyPaidAmount: string;
  targetCurrencyRemainingAmount: string;
  paymentStatus: PaymentStatusEnum;
  customerOrderItems: CustomerOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  merchantId: number;
  createdByUser: User | null;
  orderCode: string;
  orderDate: string;
  arrivalStatus: ArrivalStatusEnum;
  arrivedAt: string | null;
  notifiedAt: string | null;
  exchangeRateBuy: ExchangeRateSnapshot | null;
  exchangeRateSell: ExchangeRateSnapshot | null;
  shippingExchangeRate: ExchangeRateSnapshot | null;
  exchangeRateBuyValue: string | null;
  exchangeRateSellValue: string | null;
  totalPurchaseCost: string;
  totalShippingCost: string;
  totalCostBeforeDiscount: string;
  totalDiscount: string;
  totalFinalCost: string;
  totalSellingAmount: string;
  totalProfit: string;
  targetCurrencyTotalPurchaseCost: string;
  targetCurrencyTotalShippingCost: string;
  targetCurrencyTotalCostBeforeDiscount: string;
  targetCurrencyTotalDiscount: string;
  targetCurrencyTotalFinalCost: string;
  targetCurrencyTotalSellingAmount: string;
  targetCurrencyTotalProfit: string;
  targetCurrencyTotalShippingCostByShippingExchangeRate: string;
  paymentStatus: PaymentStatusEnum;
  orderItems?: OrderItem[];
  customerOrders?: CustomerOrder[];
  createdAt: string;
  updatedAt: string;
}

export interface ArrivalItem {
  id: number;
  arrivalId: number;
  orderItemId: number;
  variant: string | null;
  quantity: number;
  publicUrl: string | null;
  purchasePrice: string | null;
  purchaseTotal: number;
  shippingPrice: number;
  totalCostBeforeDiscount: number;
  discountType: string | null;
  discountValue: string | null;
  discountAmount: number;
  finalCost: number;
  sellingPriceForeign: string | null;
  sellingTotal: number;
  profit: number;
  arrivedQuantity: number;
  condition: ArrivalItemCondition | null;
  notes: string | null;
  orderItem?: OrderItem; // For when backend fixes the relationship
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
