export interface User {
  id: number;
  email: string;
  fullName: string;
  roleId: number;
  roleName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
}

export interface Role {
  id: number;
  roleName: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: number;
  permissionCode: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermission {
  id: number;
  roleId: number;
  permissionId: number;
  createdAt: string;
  updatedAt: string;
}

export type MerchantCurrency = 'THB' | 'USD' | 'LAK';

export interface Merchant {
  id: number;
  ownerUserId: number;
  shopName: string;
  shopLogoUrl: string | null;
  shopAddress: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  contactFacebook: string | null;
  contactLine: string | null;
  contactWhatsapp: string | null;
  defaultCurrency: MerchantCurrency;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CustomerType = 'CUSTOMER' | 'AGENT';
export type PreferredContactMethod = 'PHONE' | 'FACEBOOK' | 'WHATSAPP' | 'LINE';

export interface Customer {
  id: number;
  merchantId: number;
  customerName: string;
  customerType: CustomerType;
  shippingAddress: string | null;
  shippingProvider: string | null;
  shippingSource: string | null;
  shippingDestination: string | null;
  paymentTerms: string | null;
  contactPhone: string | null;
  contactFacebook: string | null;
  contactWhatsapp: string | null;
  contactLine: string | null;
  preferredContactMethod: PreferredContactMethod | null;
  uniqueToken: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthPayload {
  userId: number;
  email: string;
  roleName: string;
  iat: number;
  exp: number;
}
