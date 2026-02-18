/**
 * User Create DTO
 */
export interface UserCreateDto {
  email: string;
  password: string;
  fullName: string;
  roleId: number;
  isActive?: boolean;
}

/**
 * User Update DTO
 */
export interface UserUpdateDto {
  email?: string;
  password?: string;
  fullName?: string;
  roleId?: number;
  isActive?: boolean;
}

/**
 * User List Query DTO
 */
export interface UserListQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

/**
 * User + Merchant Create DTO (POST /users/user-merchant)
 */
export type CurrencyCode = 'THB' | 'USD' | 'LAK';

export interface UserMerchantCreateDto {
  // User fields
  email: string;
  password: string;
  fullName: string;

  // Merchant fields
  shopName: string;
  shopLogoUrl?: string;
  shopAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactFacebook?: string;
  contactLine?: string;
  contactWhatsapp?: string;
  defaultCurrency?: CurrencyCode;
}
