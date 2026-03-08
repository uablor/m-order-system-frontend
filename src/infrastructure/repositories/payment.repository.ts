import { ApiClient } from '@/infrastructure/apis/api';
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints';
import type { BackendPaginatedResponse } from '@/shared/types/backend-response.types';
import { extractSingleResult } from '@/shared/types/backend-response.types';

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

  async getSummaryByMerchant(query: Omit<PaymentQueryDto, 'page' | 'limit'>): Promise<{
    totalPayments: number;
    totalAmount: string;
    totalPending: number;
    totalVerified: number;
    totalRejected: number;
  }> {
    const res = await this.apiClient.getParams<any>(API_ENDPOINTS.PAYMENTS.BY_MERCHANT_SUMMARY, query);
    const data = extractSingleResult(res) ?? res;
    return {
      totalPayments: data?.totalPayments ?? 0,
      totalAmount: data?.totalAmount ?? '0',
      totalPending: data?.totalPending ?? 0,
      totalVerified: data?.totalVerified ?? 0,
      totalRejected: data?.totalRejected ?? 0,
    };
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

  async getByCustomerOrderId(customerOrderId: number): Promise<PaymentItem | null> {
    try {
      const response = await this.apiClient.getParams<any>(
        API_ENDPOINTS.PAYMENTS.BY_CUSTOMER_ORDER(customerOrderId),
        {},
      );
      const data = extractSingleResult(response) ?? response;
      return data || null;
    } catch (error) {
      console.error('Error fetching payment by customer order ID:', error);
      return null;
    }
  }
}

export const paymentRepository = new PaymentRepository();
