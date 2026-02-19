import { ApiClient } from '@/infrastructure/apis/api';
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints';
import type {
  ExchangeRateCreateDto,
  ExchangeRateBulkCreateDto,
  ExchangeRateListQueryDto,
  ExchangeRateUpdateDto,
} from '@/application/dto/exchange-rate.dto';
import type { ExchangeRate } from '@/domain/entities/user.entity';
import type { BackendPaginatedResponse } from '@/shared/types/backend-response.types';

/** Standard response wrapper for GET /exchange-rates/today
 *  results: 0–2 items; use rateType === 'BUY' | 'SELL' to distinguish */
export interface ExchangeRateTodayResponse {
  success: boolean;
  Code: number;
  message: string;
  results: ExchangeRate[];
}

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

  async getToday(): Promise<ExchangeRateTodayResponse> {
    return await this.apiClient.get<ExchangeRateTodayResponse>(API_ENDPOINTS.EXCHANGE_RATES.TODAY);
  }

  async getList(query: ExchangeRateListQueryDto): Promise<BackendPaginatedResponse<ExchangeRate>> {
    return await this.apiClient.getPaginated<BackendPaginatedResponse<ExchangeRate>>(
      API_ENDPOINTS.EXCHANGE_RATES.LIST,
      query,
    );
  }

  async getById(id: number): Promise<ExchangeRate> {
    return await this.apiClient.get<ExchangeRate>(API_ENDPOINTS.EXCHANGE_RATES.GET_BY_ID(id));
  }

  async update(id: number, data: ExchangeRateUpdateDto): Promise<void> {
    await this.apiClient.putOrPatch<void>(API_ENDPOINTS.EXCHANGE_RATES.UPDATE(id), data, 'PATCH');
  }

  async delete(id: number): Promise<void> {
    await this.apiClient.delete<void>(API_ENDPOINTS.EXCHANGE_RATES.DELETE(id));
  }
}

export const exchangeRateRepository = new ExchangeRateRepository();
