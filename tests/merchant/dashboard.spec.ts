import { test, expect } from '@playwright/test';
import { injectMerchantAuth } from '../helpers/auth';
import { mockTodayExchangeRates, mockDashboardApi, mockOrdersApi, mockCustomersApi } from '../helpers/mock-api';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await injectMerchantAuth(page);
    await mockTodayExchangeRates(page);
    await mockDashboardApi(page);
    await mockOrdersApi(page);
    await mockCustomersApi(page);
    await page.goto('/merchant/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('แสดงหน้า dashboard หลังจาก login', async ({ page }) => {
    expect(page.url()).toContain('/merchant/dashboard');
    await expect(page.locator('body')).toBeVisible();
  });

  test('dashboard โหลดโดยไม่มี error', async ({ page }) => {
    const errorBanners = page.locator('.ant-alert-error, .error-page');
    const count = await errorBanners.count();
    expect(count).toBe(0);
  });

  test('แสดง sidebar navigation', async ({ page }) => {
    const sidebar = page.locator('.ant-layout-sider, .sidebar, .ant-menu');
    await expect(sidebar.first()).toBeVisible({ timeout: 5_000 });
  });

  test('navigate จาก dashboard ไป stock-order', async ({ page }) => {
    await page.goto('/merchant/stock-order');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/merchant/stock-order');
  });
});
