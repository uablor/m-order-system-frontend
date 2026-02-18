import { ApiClient } from '@/infrastructure/apis/api';
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints';
import type { AssignPermissionDto } from '@/application/dto/role-permission.dto';
import type { Permission } from '@/domain/entities/user.entity';
import type { BackendResponse } from '@/shared/types/backend-response.types';

export class RolePermissionRepository {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  async assign(data: AssignPermissionDto): Promise<void> {
    await this.apiClient.post<void>(API_ENDPOINTS.ROLE_PERMISSIONS.ASSIGN, data);
  }

  async unassign(roleId: number, permissionId: number): Promise<void> {
    await this.apiClient.delete<void>(API_ENDPOINTS.ROLE_PERMISSIONS.UNASSIGN(roleId, permissionId));
  }

  async getByRoleId(roleId: number): Promise<BackendResponse<Permission>> {
    return await this.apiClient.get<BackendResponse<Permission>>(API_ENDPOINTS.ROLE_PERMISSIONS.GET_BY_ROLE(roleId));
  }
}

export const rolePermissionRepository = new RolePermissionRepository();
