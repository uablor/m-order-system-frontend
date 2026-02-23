import login from './auth/login.json';
import register from './auth/register.json';
import dashboard from './shared/dashboard.json';
import common from './shared/common.json';
import layout from './shared/layout.json';
import error from './shared/error.json';
import logout from './shared/logout.json';
import superAdminMenus from './super-admin/menus.json';
import merchantMenus from './merchant/menus.json';
import customerMenus from './customer/menus.json';
import customer from './customer/customer.json';
import merchant from './merchant/merchant.json';

const menus = {
  superAdmin: superAdminMenus,
  merchant: merchantMenus,
  customer: customerMenus,
};

import users from './super-admin/users.json';
import merchants from './super-admin/merchants.json';
import access from './super-admin/access.json';
import adminDashboard from './super-admin/dashboard.json';
import customers from './super-admin/customers.json';
import exchangeRates from './super-admin/exchangeRates.json';

export default {
  login,
  register,
  dashboard,
  common,
  layout,
  error,
  logout,
  menus,
  merchant,
  users,
  merchants,
  access,
  customer,
  adminDashboard,
  customers,
  exchangeRates,
};
