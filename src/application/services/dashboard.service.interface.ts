import type { AdminDashboard, AnnualReport, MerchantDashboard } from '@/domain/entities/user.entity';
import type { BackendResponse } from '@/shared/types/backend-response.types';

export interface IDashboardService {
  getAdminDashboard(): Promise<BackendResponse<AdminDashboard>>;
  getAdminAnnualReport(year?: number): Promise<BackendResponse<AnnualReport>>;
  getMerchantDashboard(): Promise<BackendResponse<MerchantDashboard>>;
  getMerchantAnnualReport(year?: number): Promise<BackendResponse<AnnualReport>>;
}
