import type { ExchangeRate } from '@/domain/entities/user.entity';
import type { BackendPaginatedResponse } from '@/shared/types/backend-response.types';
import type { ExchangeRateCreateDto, ExchangeRateUpdateDto, ExchangeRateListQueryDto } from '@/application/dto/exchange-rate.dto';

export interface IExchangeRateService {
  create(data: ExchangeRateCreateDto): Promise<{ id: number }>;
  getById(id: number): Promise<ExchangeRate>;
  getList(query: ExchangeRateListQueryDto): Promise<BackendPaginatedResponse<ExchangeRate>>;
  update(id: number, data: ExchangeRateUpdateDto): Promise<void>;
  delete(id: number): Promise<void>;
}
