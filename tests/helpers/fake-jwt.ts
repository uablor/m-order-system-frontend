/**
 * สร้าง fake JWT สำหรับ E2E tests
 * ไม่มีการ verify signature - ใช้แค่ decode เพื่อ read payload
 */
export function createFakeJwt(
  roleName = 'admin_merchant',
  merchantId = 1,
): string {
  const toBase64Url = (str: string): string =>
    Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = toBase64Url(
    JSON.stringify({
      sub: '1',
      userId: 1,
      email: 'merchant@test.com',
      fullName: 'Test Merchant',
      roleName,
      merchantId,
      exp: Math.floor(Date.now() / 1000) + 86_400,
      iat: Math.floor(Date.now() / 1000),
    }),
  );

  return `${header}.${payload}.fakesignature`;
}
