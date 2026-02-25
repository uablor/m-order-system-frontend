import { type Page } from '@playwright/test';
import {
  mockExchangeRates,
  mockCustomers,
  mockOrders,
  mockOrderDetail,
  mockCreateOrderResponse,
  mockLoginSuccess,
  mockDashboard,
  mockArrivals,
  mockPayments,
  mockExchangeRateList,
} from './mock-data';

/**
 * Mock exchange-rates/today API - ป้องกัน modal ขึ้นถามอัตราแลกเปลี่ยน
 */
export async function mockTodayExchangeRates(page: Page): Promise<void> {
  await page.route('**/exchange-rates/today**', (route) =>
    route.fulfill({ status: 200, json: mockExchangeRates }),
  );
}

/**
 * Mock exchange-rates list API
 */
export async function mockExchangeRateListApi(page: Page): Promise<void> {
  await mockTodayExchangeRates(page);
  await page.route('**/exchange-rates**', (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({ status: 200, json: mockExchangeRateList });
    } else if (route.request().method() === 'POST') {
      route.fulfill({ status: 201, json: { id: 99, ...JSON.parse(route.request().postData() ?? '{}') } });
    } else if (route.request().method() === 'DELETE') {
      route.fulfill({ status: 200, json: { success: true } });
    } else {
      route.continue();
    }
  });
}

/**
 * Mock customers API
 */
export async function mockCustomersApi(page: Page): Promise<void> {
  await page.route('**/customers**', (route) => {
    const method = route.request().method();
    const url = route.request().url();

    if (method === 'GET' && url.includes('by-merchant')) {
      route.fulfill({ status: 200, json: mockCustomers });
    } else if (method === 'GET' && url.match(/\/customers\/\d+/)) {
      route.fulfill({ status: 200, json: mockCustomers.results[0] });
    } else if (method === 'DELETE') {
      route.fulfill({ status: 200, json: { success: true } });
    } else if (method === 'POST') {
      route.fulfill({
        status: 201,
        json: {
          id: 99,
          customerName: 'ລູກຄ້າໃໝ່',
          uniqueToken: 'CUST-099',
          isActive: true,
          merchantId: 1,
        },
      });
    } else if (method === 'PUT' || method === 'PATCH') {
      route.fulfill({ status: 200, json: { success: true } });
    } else {
      route.continue();
    }
  });
}

/**
 * Mock orders API
 */
export async function mockOrdersApi(page: Page): Promise<void> {
  await page.route('**/orders**', (route) => {
    const method = route.request().method();
    const url = route.request().url();

    if (method === 'GET' && url.includes('by-merchant')) {
      route.fulfill({ status: 200, json: mockOrders });
    } else if (method === 'GET' && url.includes('create-full')) {
      route.continue();
    } else if (method === 'GET' && url.match(/\/orders\/\d+/)) {
      route.fulfill({ status: 200, json: mockOrderDetail });
    } else if (method === 'POST' && url.includes('create-full')) {
      route.fulfill({ status: 201, json: mockCreateOrderResponse });
    } else if (method === 'DELETE') {
      route.fulfill({ status: 200, json: { success: true } });
    } else {
      route.continue();
    }
  });
}

/**
 * Mock login API
 */
export async function mockLoginApi(
  page: Page,
  scenario: 'success' | 'invalid' | 'server-error' = 'success',
): Promise<void> {
  await page.route('**/auth/login**', (route) => {
    if (scenario === 'success') {
      route.fulfill({ status: 200, json: mockLoginSuccess });
    } else if (scenario === 'invalid') {
      route.fulfill({
        status: 401,
        json: { message: 'Invalid email or password' },
      });
    } else {
      route.fulfill({ status: 500, json: { message: 'Internal server error' } });
    }
  });
}

/**
 * Mock dashboard API
 */
export async function mockDashboardApi(page: Page): Promise<void> {
  await page.route('**/dashboard**', (route) =>
    route.fulfill({ status: 200, json: mockDashboard }),
  );
}

/**
 * Mock arrivals API
 */
export async function mockArrivalsApi(page: Page): Promise<void> {
  await page.route('**/arrivals**', (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      route.fulfill({ status: 200, json: mockArrivals });
    } else if (method === 'POST') {
      route.fulfill({ status: 201, json: { id: 99, success: true } });
    } else {
      route.continue();
    }
  });
}

/**
 * Mock payments API
 */
export async function mockPaymentsApi(page: Page): Promise<void> {
  await page.route('**/payments**', (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      route.fulfill({ status: 200, json: mockPayments });
    } else if (method === 'POST' || method === 'PATCH') {
      route.fulfill({ status: 200, json: { success: true } });
    } else {
      route.continue();
    }
  });
}

/**
 * Mock create order แบบ insufficient stock error
 */
export async function mockCreateOrderInsufficientStock(page: Page): Promise<void> {
  await page.route('**/orders/create-full**', (route) => {
    route.fulfill({
      status: 400,
      json: {
        message: 'Insufficient stock for item "ສິນຄ້າ A": requested 100, available 5',
      },
    });
  });
}

/**
 * Mock create order แบบ validation error จาก backend
 */
export async function mockCreateOrderValidationError(page: Page): Promise<void> {
  await page.route('**/orders/create-full**', (route) => {
    route.fulfill({
      status: 422,
      json: {
        errors: {
          orderCode: 'Order code already exists',
        },
      },
    });
  });
}

/**
 * Setup tất cả common mocks ที่ stock order page ต้องการ
 */
export async function setupStockOrderPageMocks(page: Page): Promise<void> {
  await mockTodayExchangeRates(page);
  await mockCustomersApi(page);
  await mockOrdersApi(page);
}
