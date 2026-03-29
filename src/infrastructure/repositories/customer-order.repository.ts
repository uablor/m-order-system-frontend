import { ApiClient } from '@/infrastructure/apis/api';
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints';
import type { BackendPaginatedResponse } from '@/shared/types/backend-response.types';
import { extractSingleResult } from '@/shared/types/backend-response.types';

export interface CustomerOrderItem {
  id: number;
  orderId: number;
  productName: string | null;
  variant: string | null;
  quantity: number;
  sellingPriceForeign: string;
  sellingTotal: string;
  targetCurrencySellingTotal: string | null;
  profit: string;
  orderItemId: number | null;
  orderItemSkuId?: number;
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
}

export interface CustomerOrder {
  id: number;
  orderId: number;
  orderCode?: string | null;
  customerId: number;
  customerName: string;
  customerToken: string;
  totalSellingAmount: string;
  totalPaid: string;
  remainingAmount: string;
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  targetCurrency: string | null;
  targetCurrencyTotalSellingAmount: string | null;
  targetCurrencyTotalPaid: string | null;
  targetCurrencyRemainingAmount: string | null;
  hasPendingPayment: boolean;
  customerOrderItems: CustomerOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerOrderFilters {
  orderCode?: string;
  customerOrderId?: number;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
}

export interface CustomerOrderListQuery {
  page?: number;
  limit?: number;
  orderId?: number;
  orderCode?: string;
  customerOrderId?: number;
  customerId?: number;
  customerToken?: string;
  notificationToken?: string;
  notificationStatus?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
}

/** รูปแบบ summary จาก API summary-by-token */
export interface CustomerOrderSummaryItem {
  baseCurrency?: string;
  targetCurrency?: string;
  totalAll: number;
  totalUnpaid: number;
  totalPaid: number;
}

class CustomerOrderRepository {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  /**
   * ดึงรายการ order ตาม customerToken และ notificationToken (จาก notification link)
   * API: GET /customer-orders/by-token?customerToken=xxx&notificationToken=xxx&page=1&limit=50
   */
  async getByToken(
    params: { customerToken: string; notificationToken?: string },
    query?: CustomerOrderListQuery,
  ): Promise<BackendPaginatedResponse<CustomerOrder>> {
    const requestParams: Record<string, string | number> = {
      page: query?.page ?? 1,
      limit: query?.limit ?? 50,
      customerToken: params.customerToken,
    };
    if (params.notificationToken) requestParams.notificationToken = params.notificationToken;
    if (query?.orderId != null) requestParams.orderId = query.orderId;
    if (query?.customerOrderId != null) requestParams.customerOrderId = query.customerOrderId;
    if (query?.paymentStatus) requestParams.paymentStatus = query.paymentStatus;
    if (query?.startDate) requestParams.startDate = query.startDate;
    if (query?.endDate) requestParams.endDate = query.endDate;

    return this.apiClient.getParams<BackendPaginatedResponse<CustomerOrder>>(
      API_ENDPOINTS.CUSTOMER_ORDERS.BY_TOKEN,
      requestParams,
    );
  }

  async getById(id: number): Promise<CustomerOrder> {
    const res = await this.apiClient.get<any>(API_ENDPOINTS.CUSTOMER_ORDERS.GET_BY_ID(id));
    const order = extractSingleResult<CustomerOrder>(res);
    if (!order) throw new Error('Customer order not found in response');
    return order;
  }

  /**
   * ดึง summary ตาม customerToken และ notificationToken
   * API: GET /customer-orders/summary-by-token?customerToken=xxx&notificationToken=xxx
   */
  async getSummaryByToken(
    params: { customerToken: string; notificationToken?: string },
  ): Promise<CustomerOrderSummaryItem[]> {
    const requestParams: Record<string, string> = {
      customerToken: params.customerToken,
    };
    if (params.notificationToken) requestParams.notificationToken = params.notificationToken;

    const res = await this.apiClient.getParams<CustomerOrderSummaryItem[] | { results?: CustomerOrderSummaryItem[] }>(
      API_ENDPOINTS.CUSTOMER_ORDERS.SUMMARY_BY_TOKEN,
      requestParams,
    );
    if (Array.isArray(res)) return res;
    return (res as { results?: CustomerOrderSummaryItem[] })?.results ?? [];
  }

  async getList(query?: CustomerOrderListQuery): Promise<BackendPaginatedResponse<CustomerOrder>> {
    const params: Record<string, string | number> = {
      page: query?.page ?? 1,
      limit: query?.limit ?? 50,
    };
    if (query?.orderId) params.orderId = query.orderId;
    if (query?.orderCode) params.orderCode = query.orderCode;
    if (query?.customerOrderId) params.customerOrderId = query.customerOrderId;
    if (query?.customerId) params.customerId = query.customerId;
    if (query?.customerToken) params.customerToken = query.customerToken;
    if (query?.notificationToken) params.notificationToken = query.notificationToken;
    if (query?.notificationStatus) params.notificationStatus = query.notificationStatus;
    if (query?.paymentStatus) params.paymentStatus = query.paymentStatus;
    if (query?.startDate) params.startDate = query.startDate;
    if (query?.endDate) params.endDate = query.endDate;
    
    return this.apiClient.getParams<BackendPaginatedResponse<CustomerOrder>>(
      API_ENDPOINTS.CUSTOMER_ORDERS.LIST,
      params,
    );
  }
}

export const customerOrderRepository = new CustomerOrderRepository();
