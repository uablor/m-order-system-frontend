import type { IDashboardService } from '@/application/services/dashboard.service.interface';
import type { AdminDashboard, AnnualReport, MerchantDashboard } from '@/domain/entities/user.entity';
import type { BackendResponse } from '@/shared/types/backend-response.types';
import { dashboardRepository } from '@/infrastructure/repositories/dashboard.repository';

export class DashboardServiceImpl implements IDashboardService {
  private readonly repository = dashboardRepository;

  async getAdminDashboard(): Promise<BackendResponse<AdminDashboard>> {
    return this.repository.getAdminDashboard();
  }

  async getAdminAnnualReport(year?: number): Promise<BackendResponse<AnnualReport>> {
    return this.repository.getAdminAnnualReport(year);
  }

  async getMerchantDashboard(): Promise<BackendResponse<MerchantDashboard>> {
    return this.repository.getMerchantDashboard();
  }

  async getMerchantAnnualReport(year?: number): Promise<BackendResponse<AnnualReport>> {
    return this.repository.getMerchantAnnualReport(year);
  }
}

export const dashboardService = new DashboardServiceImpl();
