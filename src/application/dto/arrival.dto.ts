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
  merchantId?: number;
  orderId?: number;
  startDate?: string;
  endDate?: string;
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
