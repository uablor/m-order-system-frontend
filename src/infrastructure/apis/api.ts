import api from '@/common/axios.config';

export class ApiClient {
  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    const response = await api.get<T>(endpoint);
    return response.data;
  }

  /**
   * GET with query parameters
   */
  async getParams<T>(endpoint: string, params: any): Promise<T> {
    const response = await api.get<T>(endpoint, { params });
    return response.data;
  }

  /**
   * GET with pagination
   */
  async getPaginated<T>(endpoint: string, params: Record<string, any>): Promise<T> {
    const response = await api.get<T>(endpoint, { params });
    return response.data;
  }

  /**
   * POST request
   */
  async post<T, U = unknown>(
    endpoint: string,
    data: U
  ): Promise<T> {
    const response = await api.post<T>(endpoint, data);
    return response.data;
  }

  /**
   * PUT or PATCH request
   */
  async putOrPatch<T, U = unknown>(
    endpoint: string,
    data: U,
    method: 'PUT' | 'PATCH' = 'PUT'
  ): Promise<T> {
    const response =
      method === 'PUT'
        ? await api.put<T>(endpoint, data)
        : await api.patch<T>(endpoint, data);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    const response = await api.delete<T>(endpoint);
    return response.data;
  }

  /**
   * POST/PUT/PATCH with multipart/form-data
   */
  async postOrPutOrPatchMultipart<T>(
    endpoint: string,
    data: any,
    method: 'PUT' | 'PATCH' | 'POST' = 'POST'
  ): Promise<T> {
    const headers = { 'Content-Type': 'multipart/form-data' };
    const response =
      method === 'POST'
        ? await api.post<T>(endpoint, data, { headers })
        : method === 'PUT'
        ? await api.put<T>(endpoint, data, { headers })
        : await api.patch<T>(endpoint, data, { headers });
    return response.data as T;
  }
}
