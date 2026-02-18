import { ApiClient } from '@/infrastructure/apis/api';
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints';
import type { RoleCreateDto, RoleUpdateDto, RoleListQueryDto } from '@/application/dto/role.dto';
import type { Role } from '@/domain/entities/user.entity';
import type { BackendPaginatedResponse } from '@/shared/types/backend-response.types';

export class RoleRepository {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  async create(data: RoleCreateDto): Promise<{ id: number }> {
    return await this.apiClient.post<{ id: number }>(API_ENDPOINTS.ROLES.CREATE, data);
  }

  async getById(id: number): Promise<Role> {
    return await this.apiClient.get<Role>(API_ENDPOINTS.ROLES.GET_BY_ID(id));
  }

  async getList(query: RoleListQueryDto): Promise<BackendPaginatedResponse<Role>> {
    return await this.apiClient.getPaginated<BackendPaginatedResponse<Role>>(API_ENDPOINTS.ROLES.LIST, query);
  }

  async update(id: number, data: RoleUpdateDto): Promise<void> {
    await this.apiClient.putOrPatch<void>(API_ENDPOINTS.ROLES.UPDATE(id), data, 'PATCH');
  }

  async delete(id: number): Promise<void> {
    await this.apiClient.delete<void>(API_ENDPOINTS.ROLES.DELETE(id));
  }
}

export const roleRepository = new RoleRepository();
