import { ApiClient } from '@/infrastructure/apis/api';
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints';
import type { BackendPaginatedResponse } from '@/shared/types/backend-response.types';
import { extractSingleResult } from '@/shared/types/backend-response.types';
import type { OrderItem } from '@/domain/entities/user.entity';

export interface OrderItemListQuery {
  page?: number;
  limit?: number;
  orderId?: number;
}

class OrderItemRepository {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  async getListByMerchant(query?: OrderItemListQuery): Promise<BackendPaginatedResponse<OrderItem>> {
    const params: Record<string, string | number> = {
      page: query?.page ?? 1,
      limit: query?.limit ?? 10,
    };
    if (query?.orderId) params.orderId = query.orderId;
    return await this.apiClient.getPaginated<BackendPaginatedResponse<OrderItem>>(
      API_ENDPOINTS.ORDER_ITEMS.BY_MERCHANT,
      params,
    );
  }

  async getList(query?: OrderItemListQuery): Promise<BackendPaginatedResponse<OrderItem>> {
    const params: Record<string, string | number> = {
      page: query?.page ?? 1,
      limit: query?.limit ?? 10,
    };
    if (query?.orderId) params.orderId = query.orderId;
    return await this.apiClient.getPaginated<BackendPaginatedResponse<OrderItem>>(
      API_ENDPOINTS.ORDER_ITEMS.LIST,
      params,
    );
  }

  async getById(id: number): Promise<OrderItem> {
    const res = await this.apiClient.get<{ results: OrderItem }>(API_ENDPOINTS.ORDER_ITEMS.GET_BY_ID(id));
    const item = extractSingleResult<OrderItem>(res);
    if (!item) throw new Error('Order item not found');
    return item;
  }
}

export const orderItemRepository = new OrderItemRepository();
