/**
 * Types that match backend `ResponseInterface` and `ResponseWithPaginationInterface`
 * (NestJS backend in `m-order-system-back`).
 */

export interface BackendResponse<T> {
  success: boolean;
  Code: number;
  message: string;
  results?: T | T[];
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

/** ดึง element แรกจาก results (รองรับทั้ง array และ single object จาก backend) */
export function firstResult<T>(res: BackendResponse<T>): T | undefined {
  const r = res.results;
  if (r == null) return undefined;
  return Array.isArray(r) ? r[0] : (r as T);
}

/** ดึง single result (รองรับ backend ส่ง results เป็น object หรือ array) */
export function extractSingleResult<T>(res: { results?: T | T[] } | null | undefined): T | undefined {
  const r = res?.results;
  if (r == null) return undefined;
  return Array.isArray(r) ? r[0] : (r as T);
}

/** ดึง array จาก results (รองรับ results เป็น array หรือ single object) */
export function extractArrayResult<T>(res: { results?: T | T[] } | null | undefined): T[] {
  const r = res?.results;
  if (r == null) return [];
  return Array.isArray(r) ? r : [r as T];
}

