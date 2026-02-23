export interface UserMerchantCreateDto {
  email: string;
  password: string;
  fullName: string;
  shopName: string;
  shopLogoUrl?: string;
  shopAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactFacebook?: string;
  contactLine?: string;
  contactWhatsapp?: string;
  defaultCurrency?: 'THB' | 'USD' | 'LAK';
}

export interface UserByMerchantQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}
