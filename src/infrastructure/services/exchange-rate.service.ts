import type { IExchangeRateService } from '@/application/services/exchange-rate.service.interface';
import type { ExchangeRate } from '@/domain/entities/user.entity';
import type { BackendPaginatedResponse } from '@/shared/types/backend-response.types';
import type { ExchangeRateCreateDto, ExchangeRateUpdateDto, ExchangeRateListQueryDto } from '@/application/dto/exchange-rate.dto';
import { exchangeRateRepository } from '@/infrastructure/repositories/exchange-rate.repository';

export class ExchangeRateServiceImpl implements IExchangeRateService {
  private readonly repository = exchangeRateRepository;

  async create(data: ExchangeRateCreateDto): Promise<{ id: number }> {
    return this.repository.create(data);
  }

  async getById(id: number): Promise<ExchangeRate> {
    return this.repository.getById(id);
  }

  async getList(query: ExchangeRateListQueryDto): Promise<BackendPaginatedResponse<ExchangeRate>> {
    return this.repository.getList(query);
  }

  async update(id: number, data: ExchangeRateUpdateDto): Promise<void> {
    return this.repository.update(id, data);
  }

  async delete(id: number): Promise<void> {
    return this.repository.delete(id);
  }
}

export const exchangeRateService = new ExchangeRateServiceImpl();
