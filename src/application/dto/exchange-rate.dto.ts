import type { RateType, CurrencyCode } from '@/domain/entities/user.entity';

export interface ExchangeRateCreateDto {
  baseCurrency: CurrencyCode;
  targetCurrency: CurrencyCode;
  rateType: RateType;
  rate: number;
}

export interface ExchangeRateUpdateDto {
  baseCurrency?: CurrencyCode;
  targetCurrency?: CurrencyCode;
  rateType?: RateType;
  rate?: number;
  rateDate?: string;
  isActive?: boolean;
}

export interface ExchangeRateBulkCreateDto {
  items: ExchangeRateCreateDto[];
}

export interface ExchangeRateListQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  merchantId?: number;
  rateType?: RateType;
  baseCurrency?: CurrencyCode;
  targetCurrency?: CurrencyCode;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}
