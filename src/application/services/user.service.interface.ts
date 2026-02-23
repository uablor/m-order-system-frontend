import type { User } from '@/domain/entities/user.entity';
import type { BackendPaginatedResponse, BackendResponse } from '@/shared/types/backend-response.types';
import type { UserCreateDto, UserUpdateDto, UserListQueryDto, UserMerchantCreateDto } from '@/application/dto/user.dto';

export interface IUserService {
  create(data: UserCreateDto): Promise<{ id: number }>;
  createUserWithMerchant(data: UserMerchantCreateDto): Promise<{ userId: number; merchantId: number }>;
  getById(id: number): Promise<User>;
  getList(query: UserListQueryDto): Promise<BackendPaginatedResponse<User>>;
  update(id: number, data: UserUpdateDto): Promise<void>;
  setActive(id: number, isActive: boolean): Promise<void>;
  changePassword(id: number, password: string): Promise<void>;
  delete(id: number): Promise<void>;
}
