import {
  DashboardOutlined,
  TeamOutlined,
  ShoppingOutlined,
  BellOutlined,
  DollarOutlined,
  FileTextOutlined,
  SwapOutlined,
  OrderedListOutlined,
  UserSwitchOutlined,
  InboxOutlined,
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
  { key: 'orders', icon: OrderedListOutlined, label: t('menus.merchant.orders'), path: '/merchant/orders' },
  { key: 'arrivals', icon: InboxOutlined, label: t('menus.merchant.arrivals'), path: '/merchant/arrivals' },
  { key: 'notifications', icon: BellOutlined, label: t('menus.merchant.notifications'), path: '/merchant/notifications' },
  { key: 'payment', icon: DollarOutlined, label: t('menus.merchant.payment'), path: '/merchant/payment' },
  { key: 'team', icon: UserSwitchOutlined, label: t('menus.merchant.teamMembers'), path: '/merchant/team' },
  { key: 'exchange-rates', icon: SwapOutlined, label: t('menus.merchant.exchangeRates'), path: '/merchant/exchange-rates' },
  // { key: 'reports', icon: FileTextOutlined, label: t('menus.merchant.reports'), path: '/merchant/reports' },
];
