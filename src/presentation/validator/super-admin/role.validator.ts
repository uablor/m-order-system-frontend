import type { RoleCreateDto, RoleListQueryDto, RoleUpdateDto } from '@/application/dto/role.dto';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateRoleListQuery(query: RoleListQueryDto): ValidationError[] {
  const errors: ValidationError[] = [];
  if (query.page !== undefined && query.page < 1) errors.push({ field: 'page', message: 'page must be >= 1' });
  if (query.limit !== undefined && (query.limit < 1 || query.limit > 100)) errors.push({ field: 'limit', message: 'limit must be between 1 and 100' });
  return errors;
}

export function validateCreateRole(payload: RoleCreateDto): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!payload.roleName?.trim()) errors.push({ field: 'roleName', message: 'roleName is required' });
  if (payload.roleName && payload.roleName.length > 100) errors.push({ field: 'roleName', message: 'roleName max length is 100' });
  if (payload.description && payload.description.length > 500) errors.push({ field: 'description', message: 'description max length is 500' });
  return errors;
}

export function validateUpdateRole(payload: RoleUpdateDto): ValidationError[] {
  const errors: ValidationError[] = [];
  if (payload.roleName !== undefined) {
    if (!payload.roleName.trim()) errors.push({ field: 'roleName', message: 'roleName cannot be empty' });
    if (payload.roleName.length > 100) errors.push({ field: 'roleName', message: 'roleName max length is 100' });
  }
  if (payload.description !== undefined && payload.description.length > 500) {
    errors.push({ field: 'description', message: 'description max length is 500' });
  }
  return errors;
}

