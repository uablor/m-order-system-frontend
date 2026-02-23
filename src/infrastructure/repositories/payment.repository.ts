import { ApiClient } from '@/infrastructure/apis/api';
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints';
import type { BackendPaginatedResponse } from '@/shared/types/backend-response.types';

export interface PaymentQueryDto {
  page?: number;
  limit?: number;
  status?: string;
  customerOrderId?: number;
  customerId?: number;
  merchantId?: number;
  paymentDateFrom?: string;
  paymentDateTo?: string;
}

export interface PaymentCustomerOrder {
  id: number;
  customerId: number;
  customer?: {
    id: number;
    customerName: string;
    customerType: string;
  };
  order?: {
    id: number;
    orderCode: string;
    merchantId: number;
  };
  totalSellingAmountLak: string;
  totalPaid: string;
  remainingAmount: string;
  paymentStatus: string;
}

export interface PaymentItem {
  id: number;
  customerOrderId: number;
  customerOrder?: PaymentCustomerOrder;
  paymentAmount: string;
  paymentDate: string;
  paymentProofUrl: string | null;
  customerMessage: string | null;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedById: number | null;
  verifiedAt: string | null;
  rejectedById: number | null;
  rejectedAt: string | null;
  rejectReason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRejectDto {
  rejectReason: string;
}

export interface PaymentBulkVerifyDto {
  paymentIds: number[];
}

export interface PaymentBulkRejectDto {
  paymentIds: number[];
  rejectReason: string;
}

export class PaymentRepository {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  async getByMerchant(query: PaymentQueryDto): Promise<BackendPaginatedResponse<PaymentItem>> {
    return await this.apiClient.getPaginated<BackendPaginatedResponse<PaymentItem>>(
      API_ENDPOINTS.PAYMENTS.BY_MERCHANT,
      query,
    );
  }

  async verify(id: number): Promise<void> {
    await this.apiClient.putOrPatch<void>(API_ENDPOINTS.PAYMENTS.VERIFY(id), {}, 'PATCH');
  }

  async reject(id: number, dto: PaymentRejectDto): Promise<void> {
    await this.apiClient.putOrPatch<void>(API_ENDPOINTS.PAYMENTS.REJECT(id), dto, 'PATCH');
  }

  async bulkVerify(paymentIds: number[]): Promise<void> {
    await this.apiClient.putOrPatch<void>(API_ENDPOINTS.PAYMENTS.BULK_VERIFY, { paymentIds }, 'PATCH');
  }

  async bulkReject(dto: PaymentBulkRejectDto): Promise<void> {
    await this.apiClient.putOrPatch<void>(API_ENDPOINTS.PAYMENTS.BULK_REJECT, dto, 'PATCH');
  }
}

export const paymentRepository = new PaymentRepository();
