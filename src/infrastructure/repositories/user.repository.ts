import { ApiClient } from '@/infrastructure/apis/api';
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints';
import type { UserCreateDto, UserUpdateDto, UserListQueryDto, UserMerchantCreateDto } from '@/application/dto/user.dto';
import type { User } from '@/domain/entities/user.entity';
import type { BackendPaginatedResponse } from '@/shared/types/backend-response.types';

export class UserRepository {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  async create(data: UserCreateDto): Promise<{ id: number }> {
    return await this.apiClient.post<{ id: number }>(API_ENDPOINTS.USERS.CREATE, data);
  }

  async createUserWithMerchant(data: UserMerchantCreateDto): Promise<{ userId: number; merchantId: number }> {
    return await this.apiClient.post<{ userId: number; merchantId: number }, UserMerchantCreateDto>(
      API_ENDPOINTS.USERS.CREATE_USER_MERCHANT,
      data
    );
  }

  async getById(id: number): Promise<User> {
    // BaseController อาจ wrap response; ถ้าไม่ wrap จะเป็น User ตรงๆ
    return await this.apiClient.get<User>(API_ENDPOINTS.USERS.GET_BY_ID(id));
  }

  async getList(query: UserListQueryDto): Promise<BackendPaginatedResponse<User>> {
    return await this.apiClient.getPaginated<BackendPaginatedResponse<User>>(API_ENDPOINTS.USERS.LIST, query);
  }

  async update(id: number, data: UserUpdateDto): Promise<void> {
    await this.apiClient.putOrPatch<void>(API_ENDPOINTS.USERS.UPDATE(id), data, 'PATCH');
  }

  async setActive(id: number, isActive: boolean): Promise<void> {
    await this.apiClient.putOrPatch<void>(API_ENDPOINTS.USERS.SET_ACTIVE(id), { isActive }, 'PATCH');
  }

  async changePassword(id: number, password: string): Promise<void> {
    await this.apiClient.putOrPatch<void>(API_ENDPOINTS.USERS.CHANGE_PASSWORD(id), { password }, 'PATCH');
  }

  async delete(id: number): Promise<void> {
    await this.apiClient.delete<void>(API_ENDPOINTS.USERS.DELETE(id));
  }

  async merchantCreate(data: { email: string; password: string; fullName: string; isActive?: boolean }): Promise<{ id: number }> {
    return await this.apiClient.post<{ id: number }>(API_ENDPOINTS.USERS.MERCHANT_CREATE, data);
  }

  async getByMerchant(query: Record<string, any>): Promise<BackendPaginatedResponse<User>> {
    return await this.apiClient.getPaginated<BackendPaginatedResponse<User>>(
      API_ENDPOINTS.USERS.BY_MERCHANT,
      query,
    );
  }
}

export const userRepository = new UserRepository();
