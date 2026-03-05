import type { ArrivalItemCondition } from '@/domain/entities/user.entity';

export interface CreateArrivalItemDto {
  orderItemId: number;
  arrivedQuantity: number;
  condition?: ArrivalItemCondition;
  notes?: string;
}

export interface CreateArrivalDto {
  orderId: number;
  notes?: string;
  arrivalItems: CreateArrivalItemDto[];
}

export interface CreateNotificationDto {
  customerOrderIds: number[];
  message?: string;
  customerId: number;
}

export interface CreateMultipleArrivalsDto {
  notes?: string;
  orders: CreateArrivalDto[];
  notification?: boolean;
  notis?: CreateNotificationDto[];
  language?: 'en' | 'th' | 'la';
}

export interface ArrivalUpdateDto {
  arrivedDate?: string;
  arrivedTime?: string;
  recordedBy?: number | null;
  notes?: string | null;
}

export interface ArrivalListQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  searchField?: string;
  sort?: 'ASC' | 'DESC';
  merchantId?: number;
  orderId?: number;
  orderItemId?: number;
  customerId?: number;
  startDate?: string;
  endDate?: string;
  customerName?: string;
  createdByUserId?: number;
  arrivalDate?: string;
  arrivalTime?: string;
  arrival?: boolean;
  notification?: boolean;
}

export interface ArrivalItemListQueryDto {
  page?: number;
  limit?: number;
  arrivalId?: number;
  orderItemId?: number;
}

export interface ArrivalItemUpdateDto {
  arrivedQuantity?: number;
  condition?: ArrivalItemCondition | null;
  notes?: string | null;
}
