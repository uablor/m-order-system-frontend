import { ApiClient } from '@/infrastructure/apis/api';
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints';
import type { OrderListQueryDto, OrderUpdateDto } from '@/application/dto/order.dto';
import type { Order } from '@/domain/entities/user.entity';
import type { BackendPaginatedResponse, BackendResponse } from '@/shared/types/backend-response.types';

export interface CreateFullOrderItemDto {
  Index: number;
  productName: string;
  variant?: string;
  quantity: number;
  purchasePrice: number;
  shippingPrice?: number;
  discountType?: 'percent' | 'cash';
  discountValue?: number;
  sellingPriceForeign: number;
}

export interface CreateFullCustomerOrderItemDto {
  orderItemIndex: number;
  quantity: number;
  sellingPriceForeign?: number;
}

export interface CreateFullCustomerOrderDto {
  customerId: number;
  items: CreateFullCustomerOrderItemDto[];
}

export interface CreateFullOrderDto {
  orderCode: string;
  items: CreateFullOrderItemDto[];
  customerOrders: CreateFullCustomerOrderDto[];
}

export interface OrderCreateHeaderDto {
  merchantId: number;
  orderCode: string;
  orderDate: string;
  arrivalStatus?: 'NOT_ARRIVED' | 'ARRIVED';
  totalShippingCostLak?: number;
}

export class OrderRepository {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  async createFull(data: CreateFullOrderDto): Promise<any> {
    return await this.apiClient.post<any>(API_ENDPOINTS.ORDERS.CREATE_FULL, data);
  }

  async createHeader(data: OrderCreateHeaderDto): Promise<{ id: number }> {
    return await this.apiClient.post<{ id: number }>(API_ENDPOINTS.ORDERS.CREATE, data);
  }

  async getList(query: OrderListQueryDto): Promise<BackendPaginatedResponse<Order>> {
    return await this.apiClient.getPaginated<BackendPaginatedResponse<Order>>(
      API_ENDPOINTS.ORDERS.LIST,
      query,
    );
  }

  async getById(id: number): Promise<Order> {
    const res = await this.apiClient.get<BackendResponse<Order>>(API_ENDPOINTS.ORDERS.GET_BY_ID(id));
    const order = res.results?.[0];
    if (!order) throw new Error('Order not found in response');
    return order;
  }

  async update(id: number, data: OrderUpdateDto): Promise<void> {
    await this.apiClient.putOrPatch<void>(API_ENDPOINTS.ORDERS.UPDATE(id), data, 'PATCH');
  }

  async delete(id: number): Promise<void> {
    await this.apiClient.delete<void>(API_ENDPOINTS.ORDERS.DELETE(id));
  }
}

export const orderRepository = new OrderRepository();
