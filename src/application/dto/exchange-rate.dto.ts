export type ExchangeRateType = 'BUY' | 'SELL';

export interface ExchangeRateCreateDto {
  baseCurrency: string;
  targetCurrency: string;
  rateType: ExchangeRateType;
  rate: number;
}

export interface ExchangeRateBulkCreateDto {
  items: ExchangeRateCreateDto[];
}

export interface ExchangeRateUpdateDto {
  baseCurrency?: string;
  targetCurrency?: string;
  rateType?: ExchangeRateType;
  rate?: number;
  rateDate?: string;
  isActive?: boolean;
}

export interface ExchangeRateListQueryDto {
  page?: number;
  limit?: number;
  merchantId?: number;
  rateType?: ExchangeRateType;
  baseCurrency?: string;
  targetCurrency?: string;
  isActive?: boolean;
}
