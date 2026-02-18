import { ApiClient } from '@/infrastructure/apis/api';
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints';
import type { PermissionCreateDto, PermissionUpdateDto, PermissionListQueryDto } from '@/application/dto/permission.dto';
import type { Permission } from '@/domain/entities/user.entity';
import type { BackendPaginatedResponse } from '@/shared/types/backend-response.types';

export class PermissionRepository {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  async create(data: PermissionCreateDto): Promise<{ id: number }> {
    return await this.apiClient.post<{ id: number }>(API_ENDPOINTS.PERMISSIONS.CREATE, data);
  }

  async generateFromControllers(): Promise<void> {
    await this.apiClient.post<void>(API_ENDPOINTS.PERMISSIONS.GENERATE, {});
  }

  async getById(id: number): Promise<Permission> {
    return await this.apiClient.get<Permission>(API_ENDPOINTS.PERMISSIONS.GET_BY_ID(id));
  }

  async getList(query: PermissionListQueryDto): Promise<BackendPaginatedResponse<Permission>> {
    return await this.apiClient.getPaginated<BackendPaginatedResponse<Permission>>(API_ENDPOINTS.PERMISSIONS.LIST, query);
  }

  async update(id: number, data: PermissionUpdateDto): Promise<void> {
    await this.apiClient.putOrPatch<void>(API_ENDPOINTS.PERMISSIONS.UPDATE(id), data, 'PATCH');
  }

  async delete(id: number): Promise<void> {
    await this.apiClient.delete<void>(API_ENDPOINTS.PERMISSIONS.DELETE(id));
  }
}

export const permissionRepository = new PermissionRepository();
