import { ApiClient } from '@/infrastructure/apis/api';
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints';
import type { MerchantCreateDto, MerchantListQueryDto, MerchantUpdateDto } from '@/application/dto/merchant.dto';
import type { Merchant, MerchantDetail } from '@/domain/entities/user.entity';
import type { BackendPaginatedResponse } from '@/shared/types/backend-response.types';
import { extractSingleResult } from '@/shared/types/backend-response.types';

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
    const res = await this.apiClient.get<any>(API_ENDPOINTS.MERCHANTS.GET_BY_ID(id));
    const merchant = extractSingleResult<Merchant>(res);
    if (!merchant) throw new Error('Merchant not found in response');
    return merchant;
  }

  async getDetail(id: number): Promise<MerchantDetail> {
    const res = await this.apiClient.get<any>(API_ENDPOINTS.MERCHANTS.GET_DETAIL(id));
    const detail = extractSingleResult<MerchantDetail>(res);
    if (!detail) throw new Error('Merchant detail not found in response');
    return detail;
  }

  async update(id: number, data: MerchantUpdateDto): Promise<void> {
    await this.apiClient.putOrPatch<void>(API_ENDPOINTS.MERCHANTS.UPDATE(id), data, 'PATCH');
  }

  async delete(id: number): Promise<void> {
    await this.apiClient.delete<void>(API_ENDPOINTS.MERCHANTS.DELETE(id));
  }

  async setActive(id: number, isActive: boolean): Promise<void> {
    await this.apiClient.putOrPatch<void>(API_ENDPOINTS.MERCHANTS.UPDATE_ACTIVE(id), { isActive }, 'PATCH');
  }

  async getAdminPriceCurrencySummary(merchantId: number): Promise<any> {
    return await this.apiClient.post<any>('/dashboard/admin/merchant-price-currency-summary', { merchantId });
  }

  async getPriceCurrencySummaryByDate(merchantId: number): Promise<any> {
    return await this.apiClient.post<any>('/merchants/price-currency-summary-by-date', { merchantId });
  }
}

export const merchantRepository = new MerchantRepository();
