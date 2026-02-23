import type { Customer } from '@/domain/entities/user.entity';
import type { BackendPaginatedResponse } from '@/shared/types/backend-response.types';
import type { CustomerCreateDto, CustomerUpdateDto, CustomerListQueryDto } from '@/application/dto/customer.dto';

export interface ICustomerService {
  create(data: CustomerCreateDto): Promise<{ id: number }>;
  getById(id: number): Promise<Customer>;
  getList(query: CustomerListQueryDto): Promise<BackendPaginatedResponse<Customer>>;
  update(id: number, data: CustomerUpdateDto): Promise<void>;
  delete(id: number): Promise<void>;
}
