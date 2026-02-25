import { type Page } from '@playwright/test';

/**
 * Token จริงสำหรับ E2E tests (admin_merchant)
 * ใช้ token ที่มีอายุยาวเพื่อไม่ให้หมดระหว่าง test
 */
const REAL_AUTH_TOKEN =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXBhcnRtZW50SWQiOjk5LCJkZXBhcnRtZW50TmFtZSI6IuC6hOC6sOC6meC6sOC6meC7jeC6suC6geC6sOC6iuC6p-C6hyIsImRpdmlzaW9uSWQiOjk5OTk5OSwiZGl2aXNpb25OYW1lIjoi4LqE4Lqw4LqZ4Lqw4LqZ4LuN4Lqy4LqB4Lqw4LqK4Lqn4LqHIiwiZXhwIjoxNzcxOTkyNTIxLCJpYXQiOjE3NzE5MDYxMjEsInBlcm1pc3Npb25zIjpbImRhc2hib2FyZC5hY2Nlc3MuYWxsIiwiZGFzaGJvYXJkLmFjY2Vzcy5kZXBhcnRtZW50IiwiaW5jb21pbmc6ZG9jdW1lbnRzOmNyZWF0ZSJdLCJwb3NpdGlvbklkIjoxMSwicG9zaXRpb25OYW1lIjoi4Lqn4Lq04LqK4Lqy4LqB4Lqy4LqZIiwicm9sZXMiOlsiSW5jb21pbmcgT3V0Z29pbmcgTWluaXN0cnkiXSwic3ViIjoiZmI5NjkzODktNTYyYS00N2QzLWJhMzEtMmZhY2Y0MGMwY2FlIiwidXNlcm5hbWUiOiJpbl9taW5pc3RlciJ9.vGxkX5cGWjbg3beUS_s2c_ajesKT8YNfXMYAj5YyHj2ZEsZcEbZvNgpXAVPQfTkhaoxor0Fv3axpx9J1y5Ea-L6cEDK1UqKaXxXgA-06OImGqs6IfjhSuvA6PtMUPCsPjaD7cI_uBZxsol2HuZ11VE5t0Y1WZMB3SyO1rAU3CQvbST1dRsBUSXQukc2QpCCZ9usKwfbwjlEWI1oblrbMUz5J35CuYzAFOvcVLHY6DLQtuUO0-yC86CNLjs-xTQzNLVP82257_YNYol8209SNKioTwvyzlEZMos_Gl0Gdt4oywSbtlrP_RLa_qZlQqfMd4raMfj3Ab9J7hx5PYRKPVw';

/**
 * Inject merchant auth token ก่อนหน้า page load
 * ใช้ใน beforeEach ของทุก authenticated test
 */
export async function injectMerchantAuth(page: Page): Promise<void> {
  await page.addInitScript((t: string) => {
    try {
      localStorage.setItem('access_token', t);
      const d = new Date();
      d.setTime(d.getTime() + 86_400_000);
      document.cookie = `access_token=${t}; expires=${d.toUTCString()}; path=/`;
    } catch (_) {
      // ignore
    }
  }, REAL_AUTH_TOKEN);
}

/**
 * ลบ auth token ออกจาก page
 */
export async function clearAuth(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.removeItem('access_token');
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
  });
}

/**
 * ทำ login ผ่าน UI จริง (สำหรับ login tests)
 */
export async function loginViaUI(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto('/login');
  await page.locator('[data-testid="email-input"]').fill(email);
  await page.locator('[data-testid="password-input"]').fill(password);
  await page.locator('[data-testid="submit-btn"]').click();
}
