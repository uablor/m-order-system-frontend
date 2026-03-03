import type { Merchant, MerchantDetail } from '@/domain/entities/user.entity';
import type { BackendPaginatedResponse } from '@/shared/types/backend-response.types';
import type { MerchantCreateDto, MerchantUpdateDto, MerchantListQueryDto } from '@/application/dto/merchant.dto';

export interface IMerchantService {
  create(data: MerchantCreateDto): Promise<{ id: number }>;
  getById(id: number): Promise<Merchant>;
  getDetail(id: number): Promise<MerchantDetail>;
  getList(query: MerchantListQueryDto): Promise<BackendPaginatedResponse<Merchant>>;
  update(id: number, data: MerchantUpdateDto): Promise<void>;
  delete(id: number): Promise<void>;
}
