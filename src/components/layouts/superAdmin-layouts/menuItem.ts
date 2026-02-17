import {
  DashboardOutlined,
  ShopOutlined,
  FileTextOutlined,
  NotificationOutlined,
  SettingOutlined,
} from '@ant-design/icons-vue';

export interface MenuItem {
  key: string;
  icon: any;
  label: string;
  path: string;
}

export const getMenuItems = (t: any): MenuItem[] => [
  { key: 'dashboard', icon: DashboardOutlined, label: t('menus.superAdmin.dashboard'), path: '/super-admin/dashboard' },
  { key: 'merchants', icon: ShopOutlined, label: t('menus.superAdmin.merchantManagement'), path: '/super-admin/merchants' },
  { key: 'reports', icon: FileTextOutlined, label: t('menus.superAdmin.reports'), path: '/super-admin/reports' },
  { key: 'notifications', icon: NotificationOutlined, label: t('menus.superAdmin.notifications'), path: '/super-admin/notifications' },
  { key: 'settings', icon: SettingOutlined, label: t('menus.superAdmin.settings'), path: '/super-admin/settings' },
];
