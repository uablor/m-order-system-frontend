/**
 * Permission Create DTO
 */
export interface PermissionCreateDto {
  permissionCode: string;
  description?: string;
}

/**
 * Permission Update DTO
 */
export interface PermissionUpdateDto {
  permissionCode?: string;
  description?: string;
}

/**
 * Permission List Query DTO
 */
export interface PermissionListQueryDto {
  page?: number;
  limit?: number;
  search?: string;
}
