import { ApiClient } from '@/infrastructure/apis/api';
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints';
import type { CustomerCreateDto, CustomerListQueryDto, CustomerUpdateDto } from '@/application/dto/customer.dto';
import type { Customer } from '@/domain/entities/user.entity';
import type { BackendPaginatedResponse } from '@/shared/types/backend-response.types';

export class CustomerRepository {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  async create(data: CustomerCreateDto): Promise<{ id: number }> {
    return await this.apiClient.post<{ id: number }>(API_ENDPOINTS.CUSTOMERS.CREATE, data);
  }

  async getById(id: number): Promise<Customer> {
    return await this.apiClient.get<Customer>(API_ENDPOINTS.CUSTOMERS.GET_BY_ID(id));
  }

  async getList(query: CustomerListQueryDto): Promise<BackendPaginatedResponse<Customer>> {
    return await this.apiClient.getPaginated<BackendPaginatedResponse<Customer>>(API_ENDPOINTS.CUSTOMERS.LIST, query);
  }

  async update(id: number, data: CustomerUpdateDto): Promise<void> {
    await this.apiClient.putOrPatch<void>(API_ENDPOINTS.CUSTOMERS.UPDATE(id), data, 'PATCH');
  }

  async delete(id: number): Promise<void> {
    await this.apiClient.delete<void>(API_ENDPOINTS.CUSTOMERS.DELETE(id));
  }
}

export const customerRepository = new CustomerRepository();

