import type { CustomerType, PreferredContactMethod } from '@/domain/entities/user.entity';

export interface CustomerCreateDto {
  merchantId: number;
  customerName: string;
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
  isActive?: boolean;
}

export interface CustomerListQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  merchantId?: number;
}
