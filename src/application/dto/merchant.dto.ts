import type { MerchantCurrency } from '@/domain/entities/user.entity';

export interface MerchantListQueryDto {
  page?: number;
  limit?: number;
  search?: string;
}

export interface MerchantCreateDto {
  shopName: string;
  shopLogoUrl?: string;
  shopAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactFacebook?: string;
  contactLine?: string;
  contactWhatsapp?: string;
  defaultCurrency?: MerchantCurrency;
  isActive?: boolean;
}

export interface MerchantUpdateDto {
  shopName?: string;
  shopLogoUrl?: string;
  shopAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactFacebook?: string;
  contactLine?: string;
  contactWhatsapp?: string;
  defaultCurrency?: MerchantCurrency;
  isActive?: boolean;
}
