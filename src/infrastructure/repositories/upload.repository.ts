import api from '@/common/axios.config';
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints';

export interface ImageUploadResponse {
  id: number;
  originalName: string;
  fileName: string;
  fileKey: string;
  publicUrl: string | null;
  [key: string]: unknown;
}

/**
 * อัปโหลดไฟล์สำหรับ customer (public endpoint ไม่ต้องใช้ JWT)
 * ใช้ customerToken จาก URL query
 */
export async function uploadFilesForCustomer(
  files: File[],
  customerToken: string,
): Promise<ImageUploadResponse[]> {
  const formData = new FormData();
  formData.append('customerToken', customerToken);
  for (const file of files) {
    formData.append('files', file);
  }

  // ต้องไม่ส่ง Content-Type เพื่อให้ browser ตั้ง multipart/form-data + boundary อัตโนมัติ
  // (axios default เป็น application/json ทำให้ server ไม่ parse ไฟล์ได้)
  const response = await api.post<ImageUploadResponse[] | { results?: ImageUploadResponse[] }>(
    API_ENDPOINTS.UPLOAD.FILES_V2_PUBLIC,
    formData,
    {
      headers: {
        'Content-Type': undefined as unknown as string,
      },
    },
  );

  const data = response.data as any;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data)) return data;
  return [];
}

/**
 * Upload files for merchant (requires authentication)
 */
export async function uploadFilesForMerchant(
  files: File[],
): Promise<ImageUploadResponse[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }

  const response = await api.post<ImageUploadResponse[] | { results?: ImageUploadResponse[] }>(
    API_ENDPOINTS.UPLOAD.FILES_V2,
    formData,
    {
      headers: {
        'Content-Type': undefined as unknown as string,
      },
    },
  );

  const data = response.data as any;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data)) return data;
  return [];
}

/**
 * Delete uploaded file by ID (requires authentication)
 */
export async function deleteFile(fileId: number): Promise<void> {
  await api.delete(`${API_ENDPOINTS.UPLOAD.DELETE_FILE_V2}/${fileId}`);
}
