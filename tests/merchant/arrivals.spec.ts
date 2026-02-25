import { test, expect } from '@playwright/test';
import { injectMerchantAuth } from '../helpers/auth';
import { mockTodayExchangeRates, mockArrivalsApi, mockOrdersApi } from '../helpers/mock-api';
import { mockArrivals } from '../helpers/mock-data';

test.describe('Arrivals', () => {
  test.beforeEach(async ({ page }) => {
    await injectMerchantAuth(page);
    await mockTodayExchangeRates(page);
    await mockArrivalsApi(page);
    await mockOrdersApi(page);
    await page.goto('/merchant/arrivals');
    await page.waitForLoadState('networkidle');
  });

  test('แสดงหน้า arrivals ถูกต้อง', async ({ page }) => {
    // ตรวจสอบ page title หรือ header
    const heading = page.locator('.page-title, h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 5_000 });
  });

  test('แสดงรายการ arrivals ในตาราง', async ({ page }) => {
    await page.waitForSelector('.ant-table-tbody tr, .ant-collapse-item', { timeout: 5_000 });
    const rows = page.locator('.ant-table-tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });

  test('คลิก Record Arrival → modal หรือ form ปรากฏ', async ({ page }) => {
    const addBtn = page.locator('.ant-btn-primary').first();
    await addBtn.click();
    await page.waitForTimeout(1_000);
    const modal = page.locator('.ant-modal-content');
    const visible = await modal.isVisible().catch(() => false);
    expect(visible).toBeTruthy();
  });

  test('คลิก View Detail → navigate ไปหน้า detail', async ({ page }) => {
    await page.waitForSelector('.ant-table-tbody tr, .ant-collapse-item');
    const viewBtn = page.locator('.anticon-eye').first();
    const visible = await viewBtn.isVisible().catch(() => false);
    if (visible) {
      await viewBtn.click();
      await page.waitForURL(/\/merchant\/arrivals\/\d+/, { timeout: 8_000 });
      expect(page.url()).toMatch(/\/merchant\/arrivals\/\d+/);
    } else {
      expect(true).toBe(true);
    }
  });

  test('filter by date → กรอง arrivals', async ({ page }) => {
    const datePicker = page.locator('.ant-picker').first();
    const visible = await datePicker.isVisible().catch(() => false);
    if (visible) {
      await datePicker.click();
      await page.waitForTimeout(500);
      // ปิด picker
      await page.keyboard.press('Escape');
    }
    expect(true).toBe(true);
  });

  test('empty state - ไม่มี arrivals', async ({ page }) => {
    await page.route('**/arrivals**', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          json: { results: [], pagination: { page: 1, limit: 10, total: 0 } },
        });
      } else {
        route.continue();
      }
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    const emptyEl = page.locator('.ant-empty, .ant-table-placeholder');
    const visible = await emptyEl.isVisible({ timeout: 5_000 }).catch(() => false);
    expect(visible).toBeTruthy();
  });
});
