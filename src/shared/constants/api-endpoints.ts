// Auth Endpoints
const AUTH_BASE = 'auth' as const;

const AUTH_ENDPOINTS = {
  BASE: AUTH_BASE,
  LOGIN: `${AUTH_BASE}/login`,
  ME: `${AUTH_BASE}/me`,
  LOGOUT: `${AUTH_BASE}/logout`,
} as const;

// Users Endpoints
const USERS_BASE = 'users' as const;

const USERS_ENDPOINTS = {
  BASE: USERS_BASE,
  CREATE: USERS_BASE,
  CREATE_USER_MERCHANT: `${USERS_BASE}/user-merchant`,
  GET_BY_ID: (id: number) => `${USERS_BASE}/${id}`,
  LIST: USERS_BASE,
  UPDATE: (id: number) => `${USERS_BASE}/${id}`,
  DELETE: (id: number) => `${USERS_BASE}/${id}`,
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
  UPDATE: (id: number) => `${MERCHANTS_BASE}/${id}`,
  DELETE: (id: number) => `${MERCHANTS_BASE}/${id}`,
} as const;

// Customers Endpoints
const CUSTOMERS_BASE = 'customers' as const;

const CUSTOMERS_ENDPOINTS = {
  BASE: CUSTOMERS_BASE,
  CREATE: CUSTOMERS_BASE,
  LIST: CUSTOMERS_BASE,
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

export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  USERS: USERS_ENDPOINTS,
  ROLES: ROLES_ENDPOINTS,
  PERMISSIONS: PERMISSIONS_ENDPOINTS,
  ROLE_PERMISSIONS: ROLE_PERMISSIONS_ENDPOINTS,
  MERCHANTS: MERCHANTS_ENDPOINTS,
  CUSTOMERS: CUSTOMERS_ENDPOINTS,
  EXCHANGE_RATES: EXCHANGE_RATES_ENDPOINTS,
} as const;
