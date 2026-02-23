// Auth Endpoints
const AUTH_BASE = 'auth' as const;

const AUTH_ENDPOINTS = {
  BASE: AUTH_BASE,
  LOGIN: `${AUTH_BASE}/login`,
  ME: `${AUTH_BASE}/me`,
  LOGOUT: `${AUTH_BASE}/logout`,
} as const;

// Dashboard Endpoints
const DASHBOARD_BASE = 'dashboard' as const;

const DASHBOARD_ENDPOINTS = {
  BASE: DASHBOARD_BASE,
  ADMIN: `${DASHBOARD_BASE}/admin`,
  ADMIN_ANNUAL_REPORT: `${DASHBOARD_BASE}/admin/annual-report`,
  MERCHANT: `${DASHBOARD_BASE}/merchant`,
  MERCHANT_ANNUAL_REPORT: `${DASHBOARD_BASE}/merchant/annual-report`,
} as const;

// Users Endpoints
const USERS_BASE = 'users' as const;

const USERS_ENDPOINTS = {
  BASE: USERS_BASE,
  CREATE: USERS_BASE,
  CREATE_USER_MERCHANT: `${USERS_BASE}/user-merchant`,
  MERCHANT_CREATE: `${USERS_BASE}/merchant`,
  GET_BY_ID: (id: number) => `${USERS_BASE}/${id}`,
  LIST: USERS_BASE,
  UPDATE: (id: number) => `${USERS_BASE}/${id}`,
  SET_ACTIVE: (id: number) => `${USERS_BASE}/${id}/active`,
  CHANGE_PASSWORD: (id: number) => `${USERS_BASE}/${id}/change-password-by-id`,
  CHANGE_PASSWORD_SELF: `${USERS_BASE}/change-password-user`,
  UPDATE_PROFILE: `${USERS_BASE}/profile`,
  DELETE: (id: number) => `${USERS_BASE}/${id}`,
  BY_MERCHANT: `${USERS_BASE}/by-merchant`,
} as const;

// Roles Endpoints
const ROLES_BASE = 'roles' as const;

const ROLES_ENDPOINTS = {
  BASE: ROLES_BASE,
  CREATE: ROLES_BASE,
  GET_BY_ID: (id: number) => `${ROLES_BASE}/${id}`,
  LIST: ROLES_BASE,
  UPDATE: (id: number) => `${ROLES_BASE}/${id}`,
  DELETE: (id: number) => `${ROLES_BASE}/${id}`,
} as const;

// Permissions Endpoints
const PERMISSIONS_BASE = 'permissions' as const;

const PERMISSIONS_ENDPOINTS = {
  BASE: PERMISSIONS_BASE,
  CREATE: PERMISSIONS_BASE,
  GENERATE: `${PERMISSIONS_BASE}/generate`,
  GET_BY_ID: (id: number) => `${PERMISSIONS_BASE}/${id}`,
  LIST: PERMISSIONS_BASE,
  UPDATE: (id: number) => `${PERMISSIONS_BASE}/${id}`,
  DELETE: (id: number) => `${PERMISSIONS_BASE}/${id}`,
} as const;

// Role Permissions Endpoints
const ROLE_PERMISSIONS_BASE = 'role-permissions' as const;

const ROLE_PERMISSIONS_ENDPOINTS = {
  BASE: ROLE_PERMISSIONS_BASE,
  ASSIGN: `${ROLE_PERMISSIONS_BASE}/assign`,
  UNASSIGN: (roleId: number, permissionId: number) =>
    `${ROLE_PERMISSIONS_BASE}/${roleId}/${permissionId}`,
  GET_BY_ROLE: (roleId: number) => `${ROLE_PERMISSIONS_BASE}/role/${roleId}`,
} as const;

// Merchants Endpoints
const MERCHANTS_BASE = 'merchants' as const;

const MERCHANTS_ENDPOINTS = {
  BASE: MERCHANTS_BASE,
  CREATE: MERCHANTS_BASE,
  LIST: MERCHANTS_BASE,
  GET_BY_ID: (id: number) => `${MERCHANTS_BASE}/${id}`,
  GET_DETAIL: (id: number) => `${MERCHANTS_BASE}/${id}/detail`,
  UPDATE: (id: number) => `${MERCHANTS_BASE}/${id}`,
  DELETE: (id: number) => `${MERCHANTS_BASE}/${id}`,
} as const;

// Customers Endpoints
const CUSTOMERS_BASE = 'customers' as const;

const CUSTOMERS_ENDPOINTS = {
  BASE: CUSTOMERS_BASE,
  CREATE: CUSTOMERS_BASE,
  LIST: CUSTOMERS_BASE,
  BY_MERCHANT: `${CUSTOMERS_BASE}/by-merchant`,
  GET_BY_ID: (id: number) => `${CUSTOMERS_BASE}/${id}`,
  UPDATE: (id: number) => `${CUSTOMERS_BASE}/${id}`,
  DELETE: (id: number) => `${CUSTOMERS_BASE}/${id}`,
} as const;

// Exchange Rates Endpoints
const EXCHANGE_RATES_BASE = 'exchange-rates' as const;

const EXCHANGE_RATES_ENDPOINTS = {
  BASE: EXCHANGE_RATES_BASE,
  CREATE: EXCHANGE_RATES_BASE,
  BULK_CREATE: `${EXCHANGE_RATES_BASE}/bulk`,
  TODAY: `${EXCHANGE_RATES_BASE}/today`,
  LIST: EXCHANGE_RATES_BASE,
  GET_BY_ID: (id: number) => `${EXCHANGE_RATES_BASE}/${id}`,
  UPDATE: (id: number) => `${EXCHANGE_RATES_BASE}/${id}`,
  DELETE: (id: number) => `${EXCHANGE_RATES_BASE}/${id}`,
} as const;

// Orders Endpoints
const ORDERS_BASE = 'orders' as const;

const ORDERS_ENDPOINTS = {
  BASE: ORDERS_BASE,
  CREATE: ORDERS_BASE,
  CREATE_FULL: `${ORDERS_BASE}/create-full`,
  BY_MERCHANT: `${ORDERS_BASE}/by-merchant`,
  LIST: ORDERS_BASE,
  GET_BY_ID: (id: number) => `${ORDERS_BASE}/${id}`,
  UPDATE: (id: number) => `${ORDERS_BASE}/${id}`,
  DELETE: (id: number) => `${ORDERS_BASE}/${id}`,
} as const;

// Arrivals Endpoints
const ARRIVALS_BASE = 'arrivals' as const;

const ARRIVALS_ENDPOINTS = {
  BASE: ARRIVALS_BASE,
  CREATE: `${ARRIVALS_BASE}/create`,
  LIST: ARRIVALS_BASE,
  GET_BY_ID: (id: number) => `${ARRIVALS_BASE}/${id}`,
  UPDATE: (id: number) => `${ARRIVALS_BASE}/${id}`,
  DELETE: (id: number) => `${ARRIVALS_BASE}/${id}`,
} as const;

// Arrival Items Endpoints
const ARRIVAL_ITEMS_BASE = 'arrival-items' as const;

const ARRIVAL_ITEMS_ENDPOINTS = {
  BASE: ARRIVAL_ITEMS_BASE,
  LIST: ARRIVAL_ITEMS_BASE,
  GET_BY_ID: (id: number) => `${ARRIVAL_ITEMS_BASE}/${id}`,
  UPDATE: (id: number) => `${ARRIVAL_ITEMS_BASE}/${id}`,
  DELETE: (id: number) => `${ARRIVAL_ITEMS_BASE}/${id}`,
} as const;

// Customer Orders Endpoints
const CUSTOMER_ORDERS_BASE = 'customer-orders' as const;

const CUSTOMER_ORDERS_ENDPOINTS = {
  BASE: CUSTOMER_ORDERS_BASE,
  LIST: CUSTOMER_ORDERS_BASE,
  GET_BY_ID: (id: number) => `${CUSTOMER_ORDERS_BASE}/${id}`,
  BY_TOKEN: (token: string) => `${CUSTOMER_ORDERS_BASE}/by-token/${token}`,
} as const;

// Customer Order Items Endpoints
const CUSTOMER_ORDER_ITEMS_BASE = 'customer-order-items' as const;

const CUSTOMER_ORDER_ITEMS_ENDPOINTS = {
  BASE: CUSTOMER_ORDER_ITEMS_BASE,
  LIST: CUSTOMER_ORDER_ITEMS_BASE,
  GET_BY_ID: (id: number) => `${CUSTOMER_ORDER_ITEMS_BASE}/${id}`,
} as const;

// Payments Endpoints
const PAYMENTS_BASE = 'payments' as const;

const PAYMENTS_ENDPOINTS = {
  BASE: PAYMENTS_BASE,
  CREATE: PAYMENTS_BASE,
  MY_PAYMENTS: `${PAYMENTS_BASE}/my-payments`,
  BY_MERCHANT: `${PAYMENTS_BASE}/merchant`,
  GET_BY_ID: (id: number) => `${PAYMENTS_BASE}/${id}`,
  VERIFY: (id: number) => `${PAYMENTS_BASE}/${id}/verify`,
  REJECT: (id: number) => `${PAYMENTS_BASE}/${id}/reject`,
  BULK_VERIFY: `${PAYMENTS_BASE}/bulk-verify`,
  BULK_REJECT: `${PAYMENTS_BASE}/bulk-reject`,
  DELETE: (id: number) => `${PAYMENTS_BASE}/${id}`,
} as const;

// Notifications Endpoints
const NOTIFICATIONS_BASE = 'notifications' as const;

const NOTIFICATIONS_ENDPOINTS = {
  BASE: NOTIFICATIONS_BASE,
  LIST: NOTIFICATIONS_BASE,
  GET_BY_ID: (id: number) => `${NOTIFICATIONS_BASE}/${id}`,
  UPDATE: (id: number) => `${NOTIFICATIONS_BASE}/${id}`,
  DELETE: (id: number) => `${NOTIFICATIONS_BASE}/${id}`,
} as const;

export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  DASHBOARD: DASHBOARD_ENDPOINTS,
  USERS: USERS_ENDPOINTS,
  ROLES: ROLES_ENDPOINTS,
  PERMISSIONS: PERMISSIONS_ENDPOINTS,
  ROLE_PERMISSIONS: ROLE_PERMISSIONS_ENDPOINTS,
  MERCHANTS: MERCHANTS_ENDPOINTS,
  CUSTOMERS: CUSTOMERS_ENDPOINTS,
  EXCHANGE_RATES: EXCHANGE_RATES_ENDPOINTS,
  ORDERS: ORDERS_ENDPOINTS,
  ARRIVALS: ARRIVALS_ENDPOINTS,
  ARRIVAL_ITEMS: ARRIVAL_ITEMS_ENDPOINTS,
  NOTIFICATIONS: NOTIFICATIONS_ENDPOINTS,
  PAYMENTS: PAYMENTS_ENDPOINTS,
  CUSTOMER_ORDERS: CUSTOMER_ORDERS_ENDPOINTS,
  CUSTOMER_ORDER_ITEMS: CUSTOMER_ORDER_ITEMS_ENDPOINTS,
} as const;
