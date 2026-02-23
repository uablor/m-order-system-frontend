import type { ICustomerService } from '@/application/services/customer.service.interface';
import type { Customer } from '@/domain/entities/user.entity';
import type { BackendPaginatedResponse } from '@/shared/types/backend-response.types';
import type { CustomerCreateDto, CustomerUpdateDto, CustomerListQueryDto } from '@/application/dto/customer.dto';
import { customerRepository } from '@/infrastructure/repositories/customer.repository';

export class CustomerServiceImpl implements ICustomerService {
  private readonly repository = customerRepository;

  async create(data: CustomerCreateDto): Promise<{ id: number }> {
    return this.repository.create(data);
  }

  async getById(id: number): Promise<Customer> {
    return this.repository.getById(id);
  }

  async getList(query: CustomerListQueryDto): Promise<BackendPaginatedResponse<Customer>> {
    return this.repository.getList(query);
  }

  async update(id: number, data: CustomerUpdateDto): Promise<void> {
    return this.repository.update(id, data);
  }

  async delete(id: number): Promise<void> {
    return this.repository.delete(id);
  }
}

export const customerService = new CustomerServiceImpl();
