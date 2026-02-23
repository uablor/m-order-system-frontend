import { message } from 'ant-design-vue';
import { AxiosError } from 'axios';

export function handleApiError(error: unknown, t: (key: string) => string): void {
  if (error instanceof AxiosError) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as {
        message?: string | string[];
        error?: string;
      };

      const errorMessage = Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message || data.error || t('error.unknown');

      switch (status) {
        case 400:
          message.error(errorMessage);
          break;
        case 401:
          message.error(t('error.unauthorized'));
          break;
        case 403:
          message.error(errorMessage || t('error.forbidden'));
          break;
        case 404:
          message.error(t('error.notFound'));
          break;
        case 500:
          message.error(t('error.server'));
          break;
        default:
          message.error(errorMessage);
      }
    } else if (error.request) {
      message.error(t('error.network'));
    } else {
      message.error(error.message || t('error.unknown'));
    }
  } else {
    message.error(t('error.unknown'));
  }
}
