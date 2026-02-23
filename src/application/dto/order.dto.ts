import type { ArrivalStatusEnum, PaymentStatusEnum } from '@/domain/entities/user.entity';

export interface OrderListQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  merchantId?: number;
  customerId?: number;
  customerName?: string;
  startDate?: string;
  endDate?: string;
  arrivalStatus?: ArrivalStatusEnum;
  paymentStatus?: PaymentStatusEnum;
}

export interface OrderUpdateDto {
  orderCode?: string;
  orderDate?: string;
  arrivalStatus?: ArrivalStatusEnum;
  arrivedAt?: string;
  notifiedAt?: string;
  totalShippingCostLak?: number;
  paymentStatus?: PaymentStatusEnum;
  depositAmount?: number;
  paidAmount?: number;
}
