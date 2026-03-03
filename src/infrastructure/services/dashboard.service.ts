import type { IDashboardService } from '@/application/services/dashboard.service.interface';
import type {
  AdminDashboardSummary,
  AdminDashboardDetails,
  MerchantSummary,
  MerchantPriceCurrencySummaryDto,
  TopCustomersResponseDto,
  PriceCurrencySummaryByDateResponseDto,
  PriceCurrencySummaryByDateRequestDto,
} from '@/domain/entities/user.entity';
import type { BackendResponse } from '@/shared/types/backend-response.types';
import { dashboardRepository } from '@/infrastructure/repositories/dashboard.repository';

export class DashboardServiceImpl implements IDashboardService {
  private readonly repository = dashboardRepository;

  async getAdminDashboardSummary(): Promise<BackendResponse<AdminDashboardSummary>> {
    return this.repository.getAdminDashboardSummary();
  }

  async getAdminDashboardDetails(): Promise<BackendResponse<AdminDashboardDetails>> {
    return this.repository.getAdminDashboardDetails();
  }

  async getMerchantSummary(): Promise<BackendResponse<MerchantSummary>> {
    return this.repository.getMerchantSummary();
  }

  async getMerchantPriceCurrencySummary(): Promise<BackendResponse<MerchantPriceCurrencySummaryDto[]>> {
    return this.repository.getMerchantPriceCurrencySummary();
  }

  async getMerchantPriceCurrencySummaryByDate(
    body: PriceCurrencySummaryByDateRequestDto,
  ): Promise<BackendResponse<PriceCurrencySummaryByDateResponseDto>> {
    return this.repository.getMerchantPriceCurrencySummaryByDate(body);
  }

  async getTopCustomers(): Promise<BackendResponse<TopCustomersResponseDto>> {
    return this.repository.getTopCustomers();
  }
}

export const dashboardService = new DashboardServiceImpl();
