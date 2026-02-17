import login from './auth/login.json';
import register from './auth/register.json';
import dashboard from './shared/dashboard.json';
import common from './shared/common.json';
import layout from './shared/layout.json';
import superAdminMenus from './super-admin/menus.json';
import merchantMenus from './merchant/menus.json';
import customerMenus from './customer/menus.json';
import merchant from './merchant/merchant.json';

const menus = {
  superAdmin: superAdminMenus,
  merchant: merchantMenus,
  customer: customerMenus,
};

export default {
  login,
  register,
  dashboard,
  common,
  layout,
  menus,
  merchant,
};
