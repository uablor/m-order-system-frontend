import { ApiClient } from '@/infrastructure/apis/api';
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints';
import type { LoginDto, LoginResponse } from '@/application/dto/auth.dto';
import type { BackendResponse } from '@/shared/types/backend-response.types';
import type { AuthUserDto } from '@/shared/types/me.types';

export class AuthRepository {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  async login(credentials: LoginDto): Promise<LoginResponse> {
    return await this.apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
  }

  async me(): Promise<BackendResponse<AuthUserDto>> {
    return await this.apiClient.get<BackendResponse<AuthUserDto>>(API_ENDPOINTS.AUTH.ME);
  }

  async logout(): Promise<void> {
    try {
      await this.apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {});
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}

export const authRepository = new AuthRepository();
