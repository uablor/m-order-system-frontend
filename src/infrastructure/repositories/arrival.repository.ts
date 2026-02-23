import { ApiClient } from '@/infrastructure/apis/api';
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints';
import type { CreateArrivalDto, ArrivalUpdateDto, ArrivalListQueryDto, ArrivalItemListQueryDto, ArrivalItemUpdateDto } from '@/application/dto/arrival.dto';
import type { Arrival, ArrivalItem } from '@/domain/entities/user.entity';
import type { BackendPaginatedResponse, BackendResponse } from '@/shared/types/backend-response.types';

export class ArrivalRepository {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  async create(data: CreateArrivalDto): Promise<{ id: number }> {
    return await this.apiClient.post<{ id: number }>(API_ENDPOINTS.ARRIVALS.CREATE, data);
  }

  async getList(query: ArrivalListQueryDto): Promise<BackendPaginatedResponse<Arrival>> {
    return await this.apiClient.getPaginated<BackendPaginatedResponse<Arrival>>(
      API_ENDPOINTS.ARRIVALS.LIST,
      query,
    );
  }

  async getById(id: number): Promise<Arrival> {
    const res = await this.apiClient.get<BackendResponse<Arrival>>(API_ENDPOINTS.ARRIVALS.GET_BY_ID(id));
    const arrival = res.results?.[0];
    if (!arrival) throw new Error('Arrival not found in response');
    return arrival;
  }

  async update(id: number, data: ArrivalUpdateDto): Promise<void> {
    await this.apiClient.putOrPatch<void>(API_ENDPOINTS.ARRIVALS.UPDATE(id), data, 'PATCH');
  }

  async delete(id: number): Promise<void> {
    await this.apiClient.delete<void>(API_ENDPOINTS.ARRIVALS.DELETE(id));
  }
}

export class ArrivalItemRepository {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  async getList(query: ArrivalItemListQueryDto): Promise<BackendPaginatedResponse<ArrivalItem>> {
    return await this.apiClient.getPaginated<BackendPaginatedResponse<ArrivalItem>>(
      API_ENDPOINTS.ARRIVAL_ITEMS.LIST,
      query,
    );
  }

  async getById(id: number): Promise<ArrivalItem> {
    return await this.apiClient.get<ArrivalItem>(API_ENDPOINTS.ARRIVAL_ITEMS.GET_BY_ID(id));
  }

  async update(id: number, data: ArrivalItemUpdateDto): Promise<void> {
    await this.apiClient.putOrPatch<void>(API_ENDPOINTS.ARRIVAL_ITEMS.UPDATE(id), data, 'PATCH');
  }

  async delete(id: number): Promise<void> {
    await this.apiClient.delete<void>(API_ENDPOINTS.ARRIVAL_ITEMS.DELETE(id));
  }
}

export const arrivalRepository = new ArrivalRepository();
export const arrivalItemRepository = new ArrivalItemRepository();
