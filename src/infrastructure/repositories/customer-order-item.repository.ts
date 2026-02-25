import { ApiClient } from '@/infrastructure/apis/api';
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints';
import type { BackendPaginatedResponse } from '@/shared/types/backend-response.types';

export interface CustomerOrderItemDetail {
  id: number;
  customerOrderId: number;
  orderItemId: number;
  quantity: number;
  sellingPriceForeign: string;
  sellingTotalLak: string;
  profitLak: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerOrderItemQuery {
  page?: number;
  limit?: number;
  customerOrderId?: number;
  orderItemId?: number;
}

class CustomerOrderItemRepository {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  async getList(query?: CustomerOrderItemQuery): Promise<BackendPaginatedResponse<CustomerOrderItemDetail>> {
    const params: Record<string, string | number> = {
      page: query?.page ?? 1,
      limit: query?.limit ?? 100,
    };
    if (query?.customerOrderId) params.customerOrderId = query.customerOrderId;
    if (query?.orderItemId) params.orderItemId = query.orderItemId;
    return await this.apiClient.getPaginated<BackendPaginatedResponse<CustomerOrderItemDetail>>(
      API_ENDPOINTS.CUSTOMER_ORDER_ITEMS.LIST,
      params,
    );
  }

  async getById(id: number): Promise<CustomerOrderItemDetail> {
    const res = await this.apiClient.get<{ results: CustomerOrderItemDetail[] }>(
      API_ENDPOINTS.CUSTOMER_ORDER_ITEMS.GET_BY_ID(id),
    );
    const results = (res as any).results;
    return Array.isArray(results) ? results[0] : results;
  }
}

export const customerOrderItemRepository = new CustomerOrderItemRepository();
