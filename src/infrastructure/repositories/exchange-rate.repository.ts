import { ApiClient } from '@/infrastructure/apis/api';
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints';
import type { ExchangeRateCreateDto, ExchangeRateBulkCreateDto, ExchangeRateUpdateDto, ExchangeRateListQueryDto } from '@/application/dto/exchange-rate.dto';
import type { ExchangeRate } from '@/domain/entities/user.entity';
import type { BackendPaginatedResponse, BackendResponse } from '@/shared/types/backend-response.types';

export class ExchangeRateRepository {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  async create(data: ExchangeRateCreateDto): Promise<{ id: number }> {
    return await this.apiClient.post<{ id: number }>(API_ENDPOINTS.EXCHANGE_RATES.CREATE, data);
  }

  async createBulk(data: ExchangeRateBulkCreateDto): Promise<void> {
    await this.apiClient.post<void>(API_ENDPOINTS.EXCHANGE_RATES.BULK_CREATE, data);
  }

  async getToday(): Promise<BackendResponse<ExchangeRate>> {
    return await this.apiClient.get<BackendResponse<ExchangeRate>>(API_ENDPOINTS.EXCHANGE_RATES.TODAY);
  }

  async getById(id: number): Promise<ExchangeRate> {
    const res = await this.apiClient.get<BackendResponse<ExchangeRate>>(API_ENDPOINTS.EXCHANGE_RATES.GET_BY_ID(id));
    const rate = res.results?.[0];
    if (!rate) throw new Error('Exchange rate not found in response');
    return rate;
  }

  async getList(query: ExchangeRateListQueryDto): Promise<BackendPaginatedResponse<ExchangeRate>> {
    return await this.apiClient.getPaginated<BackendPaginatedResponse<ExchangeRate>>(
      API_ENDPOINTS.EXCHANGE_RATES.LIST,
      query,
    );
  }

  async update(id: number, data: ExchangeRateUpdateDto): Promise<void> {
    await this.apiClient.putOrPatch<void>(API_ENDPOINTS.EXCHANGE_RATES.UPDATE(id), data, 'PATCH');
  }

  async delete(id: number): Promise<void> {
    await this.apiClient.delete<void>(API_ENDPOINTS.EXCHANGE_RATES.DELETE(id));
  }
}

export const exchangeRateRepository = new ExchangeRateRepository();
