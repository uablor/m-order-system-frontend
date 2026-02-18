import type { UserCreateDto, UserUpdateDto, UserListQueryDto, UserMerchantCreateDto } from '@/application/dto/user.dto';

export interface ValidationError {
  field: string;
  message: string; // เก็บเป็นข้อความพร้อมใช้ (UI จะเอาไปแสดงเลย)
}

export function validateUserListQuery(query: UserListQueryDto): ValidationError[] {
  const errors: ValidationError[] = [];
  if (query.page !== undefined && query.page < 1) errors.push({ field: 'page', message: 'page must be >= 1' });
  if (query.limit !== undefined && (query.limit < 1 || query.limit > 100)) errors.push({ field: 'limit', message: 'limit must be between 1 and 100' });
  return errors;
}

export function validateCreateUser(payload: UserCreateDto): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!payload.email?.trim()) errors.push({ field: 'email', message: 'email is required' });
  if (!payload.password || payload.password.length < 6) errors.push({ field: 'password', message: 'password must be at least 6 characters' });
  if (!payload.fullName?.trim()) errors.push({ field: 'fullName', message: 'fullName is required' });
  if (!payload.roleId || Number.isNaN(Number(payload.roleId))) errors.push({ field: 'roleId', message: 'roleId is required' });
  return errors;
}

export function validateUpdateUser(payload: UserUpdateDto): ValidationError[] {
  const errors: ValidationError[] = [];
  if (payload.password !== undefined && payload.password.length > 0 && payload.password.length < 6) {
    errors.push({ field: 'password', message: 'password must be at least 6 characters' });
  }
  return errors;
}

export function validateCreateUserWithMerchant(payload: UserMerchantCreateDto): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!payload.email?.trim()) errors.push({ field: 'email', message: 'email is required' });
  if (!payload.password || payload.password.length < 6) errors.push({ field: 'password', message: 'password must be at least 6 characters' });
  if (!payload.fullName?.trim()) errors.push({ field: 'fullName', message: 'fullName is required' });
  if (!payload.shopName?.trim()) errors.push({ field: 'shopName', message: 'shopName is required' });
  return errors;
}

