import { ApiClient } from '@/infrastructure/apis/api';
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints';
import type { BackendPaginatedResponse, BackendResponse } from '@/shared/types/backend-response.types';

export interface CustomerOrderItem {
  id: number;
  orderId: number;
  productName: string;
  quantity: number;
  sellingPriceForeign: string;
  sellingTotalLak: string;
  profitLak: string;
}

export interface CustomerOrder {
  id: number;
  orderId: number;
  customerId: number;
  customerName: string;
  customerToken: string;
  totalSellingAmountLak: string;
  totalPaid: string;
  remainingAmount: string;
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  customerOrderItems: CustomerOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerOrderListQuery {
  page?: number;
  limit?: number;
  orderId?: number;
  customerId?: number;
  customerToken?: string;
}

class CustomerOrderRepository {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  async getByToken(token: string, query?: CustomerOrderListQuery): Promise<BackendPaginatedResponse<CustomerOrder>> {
    const params: Record<string, string | number> = {
      page: query?.page ?? 1,
      limit: query?.limit ?? 50,
    };
    return this.apiClient.getParams<BackendPaginatedResponse<CustomerOrder>>(
      API_ENDPOINTS.CUSTOMER_ORDERS.BY_TOKEN(token),
      params,
    );
  }

  async getById(id: number): Promise<CustomerOrder> {
    const res = await this.apiClient.get<BackendResponse<CustomerOrder>>(
      API_ENDPOINTS.CUSTOMER_ORDERS.GET_BY_ID(id),
    );
    const results = (res as any).results;
    return Array.isArray(results) ? results[0] : results;
  }

  async getList(query?: CustomerOrderListQuery): Promise<BackendPaginatedResponse<CustomerOrder>> {
    const params: Record<string, string | number> = {
      page: query?.page ?? 1,
      limit: query?.limit ?? 50,
    };
    if (query?.orderId) params.orderId = query.orderId;
    if (query?.customerId) params.customerId = query.customerId;
    if (query?.customerToken) params.customerToken = query.customerToken;
    return this.apiClient.getParams<BackendPaginatedResponse<CustomerOrder>>(
      API_ENDPOINTS.CUSTOMER_ORDERS.LIST,
      params,
    );
  }
}

export const customerOrderRepository = new CustomerOrderRepository();
