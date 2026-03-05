/**
 * Date formatting utilities
 * ใช้ * as dayjsModule เพราะ dayjs อาจไม่มี default export ในบาง bundler
 */
import * as dayjsModule from 'dayjs';

const dayjs = ((dayjsModule as { default?: unknown }).default ?? dayjsModule) as typeof import('dayjs');

/** รูปแบบ DD/MM/YYYY HH:mm */
export const formatDateTime = (dt: string | Date | null | undefined): string => {
  if (!dt) return '—';
  return dayjs(dt).format('DD/MM/YYYY HH:mm');
};

/** รูปแบบ DD/MM/YYYY */
export const formatDate = (dt: string | Date | null | undefined): string => {
  if (!dt) return '—';
  return dayjs(dt).format('DD/MM/YYYY');
};
