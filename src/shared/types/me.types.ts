export interface AuthUserDto {
  userId: number;
  email: string;
  fullName: string;
  roleId: number;
  roleName?: string;
  merchantId?: number;
  permissions?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
}

