import { ApiClient } from '@/infrastructure/apis/api';
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints';
import type { BackendPaginatedResponse } from '@/shared/types/backend-response.types';
import { extractSingleResult } from '@/shared/types/backend-response.types';

export interface CustomerOrderItem {
  id: number;
  orderId: number;
  productName: string;
  variant: string | null;
  quantity: number;
  sellingPriceForeign: string;
  sellingTotal: string;
  targetCurrencySellingTotal: string | null;
  profit: string;
}

export interface CustomerOrder {
  id: number;
  orderId: number;
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
    
    try {
      return this.apiClient.getParams<BackendPaginatedResponse<CustomerOrder>>(
        API_ENDPOINTS.CUSTOMER_ORDERS.BY_TOKEN(token),
        params,
      );
    } catch (error: any) {
      // If it's a database column error, try with a fallback endpoint
      if (error?.message?.includes('Unknown column') || error?.message?.includes('image_id')) {
        console.warn('Database schema issue detected, trying fallback endpoint');
        // Try a simpler endpoint that doesn't include image_id
        return this.apiClient.getParams<BackendPaginatedResponse<CustomerOrder>>(
          `${API_ENDPOINTS.CUSTOMER_ORDERS.BY_TOKEN(token)}?fallback=true`,
          params,
        );
      }
      throw error;
    }
  }

  async getById(id: number): Promise<CustomerOrder> {
    const res = await this.apiClient.get<any>(API_ENDPOINTS.CUSTOMER_ORDERS.GET_BY_ID(id));
    const order = extractSingleResult<CustomerOrder>(res);
    if (!order) throw new Error('Customer order not found in response');
    return order;
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
