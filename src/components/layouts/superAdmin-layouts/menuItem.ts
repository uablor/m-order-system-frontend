import {
  DashboardOutlined,
  UserOutlined,
  ShopOutlined,
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
  { key: 'users', icon: UserOutlined, label: t('menus.superAdmin.users'), path: '/super-admin/users' },
  { key: 'merchants', icon: ShopOutlined, label: t('menus.superAdmin.merchantManagement'), path: '/super-admin/merchants' },
  { key: 'settings', icon: SettingOutlined, label: t('menus.superAdmin.settings'), path: '/super-admin/settings' },
];
