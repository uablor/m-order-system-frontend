import { CheckCircleOutlined, MessageOutlined } from '@ant-design/icons-vue';

export interface MenuItem {
  key: string;
  icon: any;
  label: string;
  path: string;
}

export const getMenuItems = (t: any): MenuItem[] => [
  { key: 'item-arrived', icon: CheckCircleOutlined, label: t('menus.customer.itemArrived'), path: '/customer/item-arrived' },
  { key: 'message', icon: MessageOutlined, label: t('menus.customer.messageToMerchant'), path: '/customer/message' },
];
