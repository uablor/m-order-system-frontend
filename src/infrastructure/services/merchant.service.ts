import type { IMerchantService } from '@/application/services/merchant.service.interface';
import type { Merchant, MerchantDetail } from '@/domain/entities/user.entity';
import type { BackendPaginatedResponse, BackendResponse } from '@/shared/types/backend-response.types';
import type { MerchantCreateDto, MerchantUpdateDto, MerchantListQueryDto } from '@/application/dto/merchant.dto';
import { merchantRepository } from '@/infrastructure/repositories/merchant.repository';

export class MerchantServiceImpl implements IMerchantService {
  private readonly repository = merchantRepository;

  async create(data: MerchantCreateDto): Promise<{ id: number }> {
    return this.repository.create(data);
  }

  async getById(id: number): Promise<Merchant> {
    return this.repository.getById(id);
  }

  async getDetail(id: number): Promise<BackendResponse<MerchantDetail>> {
    return this.repository.getDetail(id);
  }

  async getList(query: MerchantListQueryDto): Promise<BackendPaginatedResponse<Merchant>> {
    return this.repository.getList(query);
  }

  async update(id: number, data: MerchantUpdateDto): Promise<void> {
    return this.repository.update(id, data);
  }

  async delete(id: number): Promise<void> {
    return this.repository.delete(id);
  }
}

export const merchantService = new MerchantServiceImpl();
