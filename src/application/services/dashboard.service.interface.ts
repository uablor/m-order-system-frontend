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

export interface IDashboardService {
  getAdminDashboardSummary(): Promise<BackendResponse<AdminDashboardSummary>>;
  getAdminDashboardDetails(): Promise<BackendResponse<AdminDashboardDetails>>;
  getMerchantSummary(): Promise<BackendResponse<MerchantSummary>>;
  getMerchantPriceCurrencySummary(): Promise<BackendResponse<MerchantPriceCurrencySummaryDto[]>>;
  getMerchantPriceCurrencySummaryByDate(
    body: PriceCurrencySummaryByDateRequestDto,
  ): Promise<BackendResponse<PriceCurrencySummaryByDateResponseDto>>;
  getTopCustomers(): Promise<BackendResponse<TopCustomersResponseDto>>;
}
