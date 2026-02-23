# Merchant Frontend Flow Documentation

## Overview

เอกสารนี้อธิบายโฟลว์การทำงานของหน้า Merchant ในระบบ m-order-system-frontend ทั้ง 3 ส่วนหลัก:
1. **Exchange Rates** — จัดการอัตราแลกเปลี่ยน (พร้อมตัวกรองขั้นสูง)
2. **Orders** — จัดการออเดอร์ (CRUD + ตัวกรอง)
3. **Order Detail** — ดูรายละเอียดออเดอร์ + รายการสินค้า

---

## 1. Exchange Rates Page (อัตราแลกเปลี่ยน)

### Route
```
/merchant/exchange-rates
```

### API ที่เชื่อมต่อ
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/exchange-rates` | ดึงรายการอัตราแลกเปลี่ยน (พร้อม filter) |
| POST | `/exchange-rates` | สร้างอัตราแลกเปลี่ยนใหม่ |
| DELETE | `/exchange-rates/:id` | ลบอัตราแลกเปลี่ยน |

### Query Parameters (GET /exchange-rates)
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | หน้าปัจจุบัน (default: 1) |
| `limit` | number | จำนวนต่อหน้า (default: 20) |
| `search` | string | ค้นหาทั่วไป |
| `merchantId` | number | กรองตาม merchant |
| `rateType` | 'BUY' \| 'SELL' | กรองตามประเภท |
| `baseCurrency` | string | กรองตามสกุลเงินต้นทาง |
| `targetCurrency` | string | กรองตามสกุลเงินปลายทาง |
| `isActive` | boolean | กรองตามสถานะ active |
| `startDate` | string (YYYY-MM-DD) | วันเริ่มต้น |
| `endDate` | string (YYYY-MM-DD) | วันสิ้นสุด |

### Flow
```
User เปิดหน้า Exchange Rates
  ├── onMounted → fetchRates() เรียก GET /exchange-rates
  ├── UI แสดงตาราง (Desktop) หรือ Card List (Mobile)
  │
  ├── [Filter] ด่วน: BUY / SELL / All (Radio Button)
  │   └── setFilter() → fetchRates({ rateType, page: 1 })
  │
  ├── [Filter] ขั้นสูง: กดปุ่ม "Filters" เพื่อเปิด
  │   ├── Search → ค้นหาทั่วไป
  │   ├── Base Currency → กรองสกุลเงินต้นทาง
  │   ├── Target Currency → กรองสกุลเงินปลายทาง
  │   ├── Status → Active / Inactive
  │   ├── Date Range → ช่วงวันที่
  │   └── กดปุ่ม "Search" → applyAdvFilters() → fetchRates(query)
  │   └── กดปุ่ม "Reset" → resetAdvFilters()
  │
  ├── [สร้าง] กดปุ่ม "Add Rate"
  │   ├── แสดงฟอร์ม (Slide Animation)
  │   ├── กรอก: Base Currency, Target Currency, Rate Type, Rate
  │   └── Submit → createRate() → POST /exchange-rates → fetchRates()
  │
  └── [ลบ] กดปุ่ม Delete (Popconfirm)
      └── deleteRate(id) → DELETE /exchange-rates/:id → fetchRates()
```

### File Structure
```
composable   → src/presentation/composables/merchant/useMerchantExchangeRates.ts
component    → src/presentation/components/merchant/ExchangeRateContent.vue
view         → src/presentation/views/merchant/ExchangeRatePage.vue
repository   → src/infrastructure/repositories/exchange-rate.repository.ts
dto          → src/application/dto/exchange-rate.dto.ts
entity       → src/domain/entities/user.entity.ts (ExchangeRate interface)
i18n         → src/localization/{en,th,la}/merchant/merchant.json → exchangeRates section
```

---

## 2. Orders Page (รายการออเดอร์)

### Route
```
/merchant/orders
```

### API ที่เชื่อมต่อ
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders/by-merchant` | ดึงรายการออเดอร์ของ merchant (JWT auto-set merchantId) |
| POST | `/orders/create-full` | สร้างออเดอร์แบบเต็ม (ออเดอร์ + items + customer orders) |
| PATCH | `/orders/:id` | แก้ไขออเดอร์ |
| DELETE | `/orders/:id` | ลบออเดอร์ |

### Query Parameters (GET /orders/by-merchant)
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | หน้าปัจจุบัน (default: 1) |
| `limit` | number | จำนวนต่อหน้า (default: 10) |
| `search` | string | ค้นหาทั่วไป (order code) |
| `customerName` | string | ค้นหาตามชื่อลูกค้า (partial match) |
| `startDate` | string (YYYY-MM-DD) | วันเริ่มต้น |
| `endDate` | string (YYYY-MM-DD) | วันสิ้นสุด |

### Flow
```
User เปิดหน้า Orders
  ├── onMounted → fetchOrders() เรียก GET /orders/by-merchant
  ├── UI แสดงตาราง (Desktop) หรือ Card List (Mobile)
  │
  ├── [Filter] 
  │   ├── Search → ค้นหารหัสออเดอร์
  │   ├── Customer Name → ชื่อลูกค้า
  │   ├── Date Range → ช่วงวันที่
  │   └── กดปุ่ม "Search" → applyFilters()
  │
  ├── [ดูรายละเอียด] กดปุ่มตา (Eye Icon) หรือกดการ์ด (Mobile)
  │   └── router.push('/merchant/orders/:id') → Order Detail Page
  │
  ├── [แก้ไข] กดปุ่ม Edit (Pencil Icon)
  │   ├── แสดง Modal แก้ไข
  │   ├── แก้ไขได้: Order Code, Date, Arrival Status, Payment Status,
  │   │             Deposit, Paid Amount, Shipping Cost
  │   └── Submit → updateOrder(id, data) → PATCH /orders/:id → fetchOrders()
  │
  └── [ลบ] กดปุ่ม Delete (Popconfirm)
      └── deleteOrder(id) → DELETE /orders/:id → fetchOrders()
```

### File Structure
```
composable   → src/presentation/composables/merchant/useMerchantOrders.ts
component    → src/presentation/components/merchant/OrderListContent.vue
view         → src/presentation/views/merchant/OrdersPage.vue
repository   → src/infrastructure/repositories/order.repository.ts
dto          → src/application/dto/order.dto.ts
entity       → src/domain/entities/user.entity.ts (Order interface)
i18n         → src/localization/{en,th,la}/merchant/merchant.json → orderList section
```

---

## 3. Order Detail Page (รายละเอียดออเดอร์)

### Route
```
/merchant/orders/:id
```

### API ที่เชื่อมต่อ
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders/:id` | ดึงข้อมูลออเดอร์ตาม ID (รวม items + customer orders) |
| GET | `/order-items?orderId=X` | ดึงรายการสินค้าในออเดอร์ (แบบ paginated) |

### Flow
```
User กดดูรายละเอียดจากหน้า Orders
  ├── onMounted → 
  │   ├── fetchOrderById(id) → GET /orders/:id
  │   └── fetchItems(orderId) → GET /order-items?orderId=X
  │
  ├── แสดงข้อมูล:
  │   ├── [Summary Cards] วันที่, สถานะมาถึง, สถานะชำระ, ผู้สร้าง
  │   ├── [Financial Summary] ต้นทุนซื้อ, ค่าส่ง, ส่วนลด, ต้นทุนสุทธิ,
  │   │                        ยอดขาย, กำไร, มัดจำ, ชำระแล้ว, ยอดค้าง
  │   ├── [Order Items] ตารางสินค้า (paginated)
  │   │   ├── Desktop: Table
  │   │   └── Mobile: Card List
  │   └── [Customer Orders] ตารางลูกค้า (ถ้ามี)
  │
  └── [Back] กดปุ่ม "Back" → router.back()
```

### File Structure
```
composable   → src/presentation/composables/merchant/useMerchantOrderItems.ts
component    → src/presentation/components/merchant/OrderDetailContent.vue
view         → src/presentation/views/merchant/OrderDetailPage.vue
repository   → src/infrastructure/repositories/order-item.repository.ts
dto          → src/application/dto/order-item.dto.ts
entity       → src/domain/entities/user.entity.ts (OrderItemResponse interface)
i18n         → src/localization/{en,th,la}/merchant/merchant.json → orderDetail section
```

---

## Menu Structure (Merchant Layout)

| # | Menu Key | Icon | Route | Page |
|---|----------|------|-------|------|
| 1 | dashboard | DashboardOutlined | /merchant/dashboard | DashboardPage |
| 2 | customers | TeamOutlined | /merchant/customers | CustomersPage |
| 3 | orders | ShoppingCartOutlined | /merchant/orders | OrdersPage |
| 4 | item-arrived | CheckCircleOutlined | /merchant/item-arrived | ItemArrivedPage |
| 5 | notify-arrival | NotificationOutlined | /merchant/notify-arrival | NotifyArrivalPage |
| 6 | payment | DollarOutlined | /merchant/payment | PaymentPage |
| 7 | exchange-rates | SwapOutlined | /merchant/exchange-rates | ExchangeRatePage |
| 8 | reports | FileTextOutlined | /merchant/reports | ReportsPage |

> **Note:** "Stock Order" เมนูเดิมถูกลบออกแล้ว และแทนที่ด้วย "Orders" (รายการออเดอร์)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Presentation                      │
│  ┌─────────────┐  ┌────────────────┐  ┌───────────┐ │
│  │    Views     │  │  Components    │  │Composables│ │
│  │ OrdersPage   │  │OrderListContent│  │useMerchant│ │
│  │ OrderDetail  │  │OrderDetail     │  │Orders     │ │
│  │ ExchangeRate │  │ExchangeRate    │  │OrderItems │ │
│  └──────┬──────┘  └───────┬────────┘  │ExchRates  │ │
│         │                 │           └─────┬─────┘ │
└─────────┼─────────────────┼─────────────────┼───────┘
          │                 │                 │
┌─────────┼─────────────────┼─────────────────┼───────┐
│         ▼     Infrastructure Layer          ▼       │
│  ┌────────────────┐  ┌───────────────────────────┐  │
│  │  Repositories   │  │     API Client (Axios)    │  │
│  │ order.repo.ts   │  │                           │  │
│  │ order-item.repo │  │   JWT Token Auto-attach   │  │
│  │ exchange-rate   │  │   Error Handling          │  │
│  └────────┬───────┘  └──────────┬────────────────┘  │
│           │                     │                    │
└───────────┼─────────────────────┼────────────────────┘
            │                     │
            ▼                     ▼
     ┌──────────────────────────────────┐
     │        Backend API (NestJS)       │
     │  GET  /orders/by-merchant         │
     │  GET  /orders/:id                 │
     │  PATCH /orders/:id                │
     │  DELETE /orders/:id               │
     │  GET  /order-items?orderId=X      │
     │  GET  /order-items/:id            │
     │  GET  /exchange-rates             │
     │  POST /exchange-rates             │
     │  DELETE /exchange-rates/:id       │
     └──────────────────────────────────┘
```

---

## Internationalization (i18n)

ทุกหน้ารองรับ 3 ภาษา:
- **English** (en) — `src/localization/en/merchant/merchant.json`
- **Thai** (th) — `src/localization/th/merchant/merchant.json`
- **Lao** (la) — `src/localization/la/merchant/merchant.json`

### Translation Keys
- `merchant.orderList.*` — หน้ารายการออเดอร์
- `merchant.orderDetail.*` — หน้ารายละเอียดออเดอร์
- `merchant.exchangeRates.*` — หน้าอัตราแลกเปลี่ยน
- `menus.merchant.*` — เมนู Sidebar

---

## Responsive Design

ทุกหน้ารองรับ Responsive:

| Breakpoint | Desktop | Mobile |
|------------|---------|--------|
| Exchange Rates | a-table | a-collapse card list |
| Orders List | a-table | card list with click-to-detail |
| Order Detail | a-table for items | card list for items |
| Financial Summary | grid 3 columns | grid 1 column |
| Filters | inline row | stacked |
