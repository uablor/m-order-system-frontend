export type LayoutType = 'superAdmin' | 'merchant' | 'customer';

export const LAYOUT_TYPES: LayoutType[] = ['superAdmin', 'merchant', 'customer'];

export const LAYOUT_LABELS: Record<LayoutType, string> = {
  superAdmin: 'layout.superAdmin',
  merchant: 'layout.merchant',
  customer: 'layout.customer',
};
