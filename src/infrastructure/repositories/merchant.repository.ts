import { ApiClient } from '@/infrastructure/apis/api';
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints';
import type { MerchantCreateDto, MerchantListQueryDto, MerchantUpdateDto } from '@/application/dto/merchant.dto';
import type { Merchant, MerchantDetail } from '@/domain/entities/user.entity';
import type { BackendPaginatedResponse, BackendResponse } from '@/shared/types/backend-response.types';

export class MerchantRepository {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  async create(data: MerchantCreateDto): Promise<{ id: number }> {
    return await this.apiClient.post<{ id: number }>(API_ENDPOINTS.MERCHANTS.CREATE, data);
  }

  async getList(query: MerchantListQueryDto): Promise<BackendPaginatedResponse<Merchant>> {
    return await this.apiClient.getPaginated<BackendPaginatedResponse<Merchant>>(
      API_ENDPOINTS.MERCHANTS.LIST,
      query,
    );
  }

  async getById(id: number): Promise<Merchant> {
    return await this.apiClient.get<Merchant>(API_ENDPOINTS.MERCHANTS.GET_BY_ID(id));
  }

  async getDetail(id: number): Promise<BackendResponse<MerchantDetail>> {
    return await this.apiClient.get<BackendResponse<MerchantDetail>>(API_ENDPOINTS.MERCHANTS.GET_DETAIL(id));
  }

  async update(id: number, data: MerchantUpdateDto): Promise<void> {
    await this.apiClient.putOrPatch<void>(API_ENDPOINTS.MERCHANTS.UPDATE(id), data, 'PATCH');
  }

  async delete(id: number): Promise<void> {
    await this.apiClient.delete<void>(API_ENDPOINTS.MERCHANTS.DELETE(id));
  }
}

export const merchantRepository = new MerchantRepository();
