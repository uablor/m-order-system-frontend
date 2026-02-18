import type { CustomerType, PreferredContactMethod } from '@/domain/entities/user.entity';

export interface CustomerListQueryDto {
  page?: number;
  limit?: number;
  merchantId?: number;
  search?: string;
}

export interface CustomerCreateDto {
  merchantId: number;
  customerName: string;
  customerType: CustomerType;
  shippingAddress?: string;
  shippingProvider?: string;
  shippingSource?: string;
  shippingDestination?: string;
  paymentTerms?: string;
  contactPhone?: string;
  contactFacebook?: string;
  contactWhatsapp?: string;
  contactLine?: string;
  preferredContactMethod?: PreferredContactMethod;
  uniqueToken?: string;
  isActive?: boolean;
}

export interface CustomerUpdateDto {
  customerName?: string;
  customerType?: CustomerType;
  shippingAddress?: string;
  shippingProvider?: string;
  shippingSource?: string;
  shippingDestination?: string;
  paymentTerms?: string;
  contactPhone?: string;
  contactFacebook?: string;
  contactWhatsapp?: string;
  contactLine?: string;
  preferredContactMethod?: PreferredContactMethod;
  uniqueToken?: string;
  isActive?: boolean;
}

