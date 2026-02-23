import { ApiClient } from '@/infrastructure/apis/api';
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints';
import type { BackendPaginatedResponse } from '@/shared/types/backend-response.types';

export interface NotificationQueryDto {
  page?: number;
  limit?: number;
  merchantId?: number;
  customerId?: number;
  notificationType?: string;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface NotificationItem {
  id: number;
  merchantId: number;
  customerId: number;
  notificationType: string;
  channel: string;
  recipientContact: string;
  messageContent: string;
  notificationLink: string | null;
  retryCount: number;
  lastRetryAt: string | null;
  status: string;
  sentAt: string | null;
  errorMessage: string | null;
  relatedOrders: number[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationUpdateDto {
  status?: string;
}

export class NotificationRepository {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  async getList(query: NotificationQueryDto): Promise<BackendPaginatedResponse<NotificationItem>> {
    return await this.apiClient.getPaginated<BackendPaginatedResponse<NotificationItem>>(
      API_ENDPOINTS.NOTIFICATIONS.LIST,
      query,
    );
  }

  async update(id: number, data: NotificationUpdateDto): Promise<void> {
    await this.apiClient.putOrPatch<void>(API_ENDPOINTS.NOTIFICATIONS.UPDATE(id), data, 'PATCH');
  }

  async delete(id: number): Promise<void> {
    await this.apiClient.delete<void>(API_ENDPOINTS.NOTIFICATIONS.DELETE(id));
  }
}

export const notificationRepository = new NotificationRepository();
