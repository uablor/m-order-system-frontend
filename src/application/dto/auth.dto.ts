/**
 * Login DTO
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * Login Response (matches backend AuthResponseDto)
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  access_token: string;
  user?: {
    userId: number;
    email: string;
    fullName: string;
    roleId: number;
    roleName?: string;
  };
}
