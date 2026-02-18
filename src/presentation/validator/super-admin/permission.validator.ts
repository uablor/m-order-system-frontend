import type { PermissionCreateDto, PermissionListQueryDto, PermissionUpdateDto } from '@/application/dto/permission.dto';

export interface ValidationError {
  field: string;
  message: string;
}

export function validatePermissionListQuery(query: PermissionListQueryDto): ValidationError[] {
  const errors: ValidationError[] = [];
  if (query.page !== undefined && query.page < 1) errors.push({ field: 'page', message: 'page must be >= 1' });
  if (query.limit !== undefined && (query.limit < 1 || query.limit > 100)) errors.push({ field: 'limit', message: 'limit must be between 1 and 100' });
  return errors;
}

export function validateCreatePermission(payload: PermissionCreateDto): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!payload.permissionCode?.trim()) errors.push({ field: 'permissionCode', message: 'permissionCode is required' });
  if (payload.permissionCode && payload.permissionCode.length > 100) errors.push({ field: 'permissionCode', message: 'permissionCode max length is 100' });
  if (payload.description && payload.description.length > 500) errors.push({ field: 'description', message: 'description max length is 500' });
  return errors;
}

export function validateUpdatePermission(payload: PermissionUpdateDto): ValidationError[] {
  const errors: ValidationError[] = [];
  if (payload.permissionCode !== undefined) {
    if (!payload.permissionCode.trim()) errors.push({ field: 'permissionCode', message: 'permissionCode cannot be empty' });
    if (payload.permissionCode.length > 100) errors.push({ field: 'permissionCode', message: 'permissionCode max length is 100' });
  }
  if (payload.description !== undefined && payload.description.length > 500) {
    errors.push({ field: 'description', message: 'description max length is 500' });
  }
  return errors;
}

