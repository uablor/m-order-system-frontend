import { ApiClient } from '@/infrastructure/apis/api';
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints';
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

export class DashboardRepository {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  async getAdminDashboardSummary(): Promise<BackendResponse<AdminDashboardSummary>> {
    return await this.apiClient.get<BackendResponse<AdminDashboardSummary>>(
      API_ENDPOINTS.DASHBOARD.ADMIN_SUMMARY,
    );
  }

  async getAdminDashboardDetails(): Promise<BackendResponse<AdminDashboardDetails>> {
    return await this.apiClient.get<BackendResponse<AdminDashboardDetails>>(
      API_ENDPOINTS.DASHBOARD.ADMIN_DETAILS,
    );
  }

  async getMerchantSummary(): Promise<BackendResponse<MerchantSummary>> {
    return await this.apiClient.get<BackendResponse<MerchantSummary>>(
      API_ENDPOINTS.DASHBOARD.MERCHANT_SUMMARY,
    );
  }

  async getMerchantPriceCurrencySummary(): Promise<BackendResponse<MerchantPriceCurrencySummaryDto[]>> {
    return await this.apiClient.post<BackendResponse<MerchantPriceCurrencySummaryDto[]>>(
      API_ENDPOINTS.DASHBOARD.MERCHANT_PRICE_CURRENCY_SUMMARY,
      {},
    );
  }

  async getMerchantPriceCurrencySummaryByDate(
    body: PriceCurrencySummaryByDateRequestDto,
  ): Promise<BackendResponse<PriceCurrencySummaryByDateResponseDto>> {
    return await this.apiClient.post<BackendResponse<PriceCurrencySummaryByDateResponseDto>>(
      API_ENDPOINTS.DASHBOARD.MERCHANT_PRICE_CURRENCY_SUMMARY_BY_DATE,
      body,
    );
  }

  async getTopCustomers(): Promise<BackendResponse<TopCustomersResponseDto>> {
    return await this.apiClient.get<BackendResponse<TopCustomersResponseDto>>(
      API_ENDPOINTS.DASHBOARD.MERCHANT_TOP_CUSTOMERS,
    );
  }
}

export const dashboardRepository = new DashboardRepository();
