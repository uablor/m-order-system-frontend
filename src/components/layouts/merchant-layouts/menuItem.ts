import {
  DashboardOutlined,
  TeamOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  NotificationOutlined,
  DollarOutlined,
  FileTextOutlined,
  SwapOutlined,
} from '@ant-design/icons-vue';

export interface MenuItem {
  key: string;
  icon: any;
  label: string;
  path: string;
}

export const getMenuItems = (t: any): MenuItem[] => [
  { key: 'dashboard', icon: DashboardOutlined, label: t('menus.merchant.dashboard'), path: '/merchant/dashboard' },
  { key: 'customers', icon: TeamOutlined, label: t('menus.merchant.customerManagement'), path: '/merchant/customers' },
  { key: 'stock-order', icon: ShoppingOutlined, label: t('menus.merchant.stockOrder'), path: '/merchant/stock-order' },
  { key: 'item-arrived', icon: CheckCircleOutlined, label: t('menus.merchant.itemArrived'), path: '/merchant/item-arrived' },
  { key: 'notify-arrival', icon: NotificationOutlined, label: t('menus.merchant.notifyArrival'), path: '/merchant/notify-arrival' },
  { key: 'payment', icon: DollarOutlined, label: t('menus.merchant.payment'), path: '/merchant/payment' },
  { key: 'exchange-rates', icon: SwapOutlined, label: t('menus.merchant.exchangeRates'), path: '/merchant/exchange-rates' },
  { key: 'reports', icon: FileTextOutlined, label: t('menus.merchant.reports'), path: '/merchant/reports' },
];
