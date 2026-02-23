import type { IUserService } from '@/application/services/user.service.interface';
import type { User } from '@/domain/entities/user.entity';
import type { BackendPaginatedResponse } from '@/shared/types/backend-response.types';
import type { UserCreateDto, UserUpdateDto, UserListQueryDto, UserMerchantCreateDto } from '@/application/dto/user.dto';
import { userRepository } from '@/infrastructure/repositories/user.repository';

export class UserServiceImpl implements IUserService {
  private readonly repository = userRepository;

  async create(data: UserCreateDto): Promise<{ id: number }> {
    return this.repository.create(data);
  }

  async createUserWithMerchant(data: UserMerchantCreateDto): Promise<{ userId: number; merchantId: number }> {
    return this.repository.createUserWithMerchant(data);
  }

  async getById(id: number): Promise<User> {
    return this.repository.getById(id);
  }

  async getList(query: UserListQueryDto): Promise<BackendPaginatedResponse<User>> {
    return this.repository.getList(query);
  }

  async update(id: number, data: UserUpdateDto): Promise<void> {
    return this.repository.update(id, data);
  }

  async setActive(id: number, isActive: boolean): Promise<void> {
    return this.repository.setActive(id, isActive);
  }

  async changePassword(id: number, password: string): Promise<void> {
    return this.repository.changePassword(id, password);
  }

  async delete(id: number): Promise<void> {
    return this.repository.delete(id);
  }
}

export const userService = new UserServiceImpl();
