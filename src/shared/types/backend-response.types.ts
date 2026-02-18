/**
 * Types that match backend `ResponseInterface` and `ResponseWithPaginationInterface`
 * (NestJS backend in `m-order-system-back`).
 */

export interface BackendResponse<T> {
  success: boolean;
  Code: number;
  message: string;
  results?: T[];
}

export interface BackendPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface BackendPaginatedResponse<T> extends Omit<BackendResponse<T>, 'results'> {
  results: T[];
  pagination: BackendPagination;
}

export function firstResult<T>(res: BackendResponse<T>): T | undefined {
  return res.results?.[0];
}

