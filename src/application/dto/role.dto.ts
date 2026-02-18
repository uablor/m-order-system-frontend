/**
 * Role Create DTO
 */
export interface RoleCreateDto {
  roleName: string;
  description?: string;
}

/**
 * Role Update DTO
 */
export interface RoleUpdateDto {
  roleName?: string;
  description?: string;
}

/**
 * Role List Query DTO
 */
export interface RoleListQueryDto {
  page?: number;
  limit?: number;
  search?: string;
}
