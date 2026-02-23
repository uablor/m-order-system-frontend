import { ApiClient } from '@/infrastructure/apis/api';
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints';
import type { AdminDashboard, AnnualReport, MerchantDashboard } from '@/domain/entities/user.entity';
import type { BackendResponse } from '@/shared/types/backend-response.types';

export class DashboardRepository {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  async getAdminDashboard(): Promise<BackendResponse<AdminDashboard>> {
    return await this.apiClient.get<BackendResponse<AdminDashboard>>(API_ENDPOINTS.DASHBOARD.ADMIN);
  }

  async getAdminAnnualReport(year?: number): Promise<BackendResponse<AnnualReport>> {
    const params = year ? { year } : {};
    return await this.apiClient.getParams<BackendResponse<AnnualReport>>(
      API_ENDPOINTS.DASHBOARD.ADMIN_ANNUAL_REPORT,
      params,
    );
  }

  async getMerchantDashboard(): Promise<BackendResponse<MerchantDashboard>> {
    return await this.apiClient.get<BackendResponse<MerchantDashboard>>(API_ENDPOINTS.DASHBOARD.MERCHANT);
  }

  async getMerchantAnnualReport(year?: number): Promise<BackendResponse<AnnualReport>> {
    const params = year ? { year } : {};
    return await this.apiClient.getParams<BackendResponse<AnnualReport>>(
      API_ENDPOINTS.DASHBOARD.MERCHANT_ANNUAL_REPORT,
      params,
    );
  }
}

export const dashboardRepository = new DashboardRepository();
