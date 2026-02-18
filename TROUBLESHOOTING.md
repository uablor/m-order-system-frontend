# 🛠️ Troubleshooting Guide

## Console Errors

### ❌ PHANTOM / contentScript.js / evmAsk.js Errors

**Error Message:**
```
[PHANTOM] error updating cache Error: Could not establish connection. Receiving end does not exist.
contentScript.js:1
evmAsk.js:15
Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist.
```

**สาเหตุ:**
- Error นี้มาจาก **Phantom Wallet browser extension** ที่ติดตั้งไว้ใน Chrome/Brave
- ไม่ใช่จากโค้ดของโปรเจกต์เรา
- ไม่กระทบการทำงานของระบบ

**วิธีแก้:**

#### Option 1: ปิด Phantom Extension (แนะนำขณะพัฒนา)
1. ไปที่ `chrome://extensions/`
2. หา "Phantom"
3. ปิด toggle ชั่วคราว

#### Option 2: กรอง Console Errors
1. เปิด DevTools Console (F12)
2. คลิก Filter icon (รูปกรวย)
3. พิมพ์: `-PHANTOM -contentScript -evmAsk`
4. Error พวกนี้จะถูกซ่อน

---

## Connection Errors

### ❌ ERR_CONNECTION_REFUSED

**Error Message:**
```
POST http://localhost:3000/auth/login net::ERR_CONNECTION_REFUSED
```

**สาเหตุ:** Backend server ไม่ได้ running

**วิธีแก้:**
```bash
cd m-order-system-back
pnpm start
```

---

### ❌ Network Error / CORS

**Error Message:**
```
Access to XMLHttpRequest at 'http://localhost:3000' from origin 'http://localhost:5173' has been blocked by CORS
```

**สาเหตุ:** Backend ไม่ได้ตั้งค่า CORS

**วิธีแก้:**
1. เช็ก `main.ts` ใน backend
2. ควรมี:
```typescript
app.enableCors({
  origin: ['http://localhost:5173'],
  credentials: true,
});
```

---

## Authentication Errors

### ❌ 401 Unauthorized

**สาเหตุ:**
- Token หมดอายุ
- Token ไม่ถูกต้อง
- ยังไม่ได้ login

**วิธีแก้:**
- ระบบจะ redirect ไปหน้า login อัตโนมัติ
- Login ใหม่อีกครั้ง

---

### ❌ Invalid or expired token

**สาเหตุ:** JWT token หมดอายุ

**วิธีแก้:**
- Logout แล้ว Login ใหม่
- หรือรอให้ระบบ auto redirect

---

## Build Errors

### ❌ Cannot find module '@/...'

**Error Message:**
```
Failed to resolve import "@/shared/utils/decodeJwt"
```

**สาเหตุ:** Path alias `@` ไม่ได้ถูก config

**วิธีแก้:**
1. เช็ก `vite.config.ts`:
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

2. เช็ก `tsconfig.app.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

3. Restart dev server:
```bash
# กด Ctrl+C ใน terminal แล้วรันใหม่
pnpm dev
```

---

### ❌ The requested module does not provide an export

**Error Message:**
```
The requested module '/node_modules/.vite/deps/axios.js' does not provide an export named 'AxiosInstance'
```

**สาเหตุ:** Import types ผิดวิธี

**วิธีแก้:**
แยก import:
```typescript
// ❌ ผิด
import { AxiosInstance } from 'axios';

// ✅ ถูกต้อง
import type { AxiosInstance } from 'axios';
```

---

## Database Errors

### ❌ Table doesn't exist

**วิธีแก้:**
```bash
cd m-order-system-back
pnpm migration:run
pnpm seed
```

---

## pnpm Errors

### ❌ Unexpected store location

**Error Message:**
```
ERR_PNPM_UNEXPECTED_STORE
```

**วิธีแก้:**
```bash
rm -rf node_modules
pnpm install
```

---

## Development Tips

### 🔧 Clear Cache
```bash
# Frontend
rm -rf node_modules/.vite
pnpm dev

# Backend
rm -rf dist
pnpm start
```

### 🔧 Check Running Processes
```bash
# Check port 3000 (Backend)
lsof -ti:3000

# Check port 5173 (Frontend)
lsof -ti:5173
```

### 🔧 Kill Process
```bash
# Kill backend
kill -9 $(lsof -ti:3000)

# Kill frontend
kill -9 $(lsof -ti:5173)
```

---

## 📚 เอกสารเพิ่มเติม

- [README.md](README.md) - Setup และการใช้งาน
- [INTEGRATION_STATUS.md](INTEGRATION_STATUS.md) - สถานะการพัฒนา
- [BACKEND_API_ANALYSIS.md](../m-order-system-back/BACKEND_API_ANALYSIS.md) - API Documentation
