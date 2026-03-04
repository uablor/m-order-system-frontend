# การวิเคราะห์ Customer Frontend และการเชื่อมต่อ API

## สารบัญ
1. [ภาพรวมโครงสร้าง](#ภาพรวมโครงสร้าง)
2. [Flow การทำงานหลัก](#flow-การทำงานหลัก)
3. [การเชื่อมต่อ API แต่ละจุด](#การเชื่อมต่อ-api-แต่ละจุด)
4. [Repository Layer](#repository-layer)
5. [API Endpoints ที่ใช้](#api-endpoints-ที่ใช้)
6. [Data Flow Diagram](#data-flow-diagram)

---

## ภาพรวมโครงสร้าง

โฟลเดอร์ `customer` ประกอบด้วย:

```
customer/
├── CustomerItemArrivedContent.vue   ← หน้าหลัก (Entry Point)
├── MessageToMerchantContent.vue    ← หน้า redirect ไป item-arrived
└── partials/
    ├── CustomerAppHeader.vue       ← Header (ไม่มี API)
    ├── CustomerOrderList.vue       ← รายการ order (รับ props ไม่เรียก API เอง)
    ├── CustomerOrderDetail.vue     ← รายละเอียด + ส่ง slip (เรียก API)
    └── CustomerOrderDetailBody.vue ← UI body (ไม่มี API)
```

**หลักการออกแบบ:** แยก layer ชัดเจน — Component หลักเรียก API ผ่าน Repository แล้วส่งข้อมูลลง child components ผ่าน props

---

## Flow การทำงานหลัก

### 1. การเข้าหน้า Customer (จาก Notification Link)

ลูกค้าได้รับลิงก์จากร้านค้า (เช่น ผ่าน WhatsApp/LINE) ในรูปแบบ:

```
https://your-frontend.com/customer/item-arrived?customerToken=xxx&notificationToken=yyy
```

- **customerToken** = `unique_token` ของ customer (จากตาราง customers)
- **notificationToken** = `unique_token` ของ notification (จากตาราง notifications)

### 2. ขั้นตอนเมื่อโหลดหน้า

```
CustomerItemArrivedContent.vue (onMounted)
    │
    ├─► อ่าน route.query.customerToken, route.query.notificationToken
    │
    ├─► เรียก customerOrderRepository.getByToken({ customerToken, notificationToken })
    │       │
    │       └─► GET /customer-orders/by-token?customerToken=xxx&notificationToken=yyy&page=1&limit=50
    │
    ├─► เก็บผลลัพธ์ใน orders.value
    │
    └─► เลือก order แรกเป็น selectedOrder (Desktop)
```

### 3. เมื่อลูกค้าเลือก Order

```
onSelectOrder(order)
    │
    ├─► ตั้ง selectedOrder = order
    │
    └─► เรียก customerOrderRepository.getById(order.id)
            │
            └─► GET /customer-orders/:id
            │
            └─► อัปเดต selectedOrder ด้วยข้อมูลล่าสุด
```

### 4. เมื่อลูกค้าส่ง Slip (ชำระเงิน)

```
CustomerOrderDetail.vue → handleSubmit()
    │
    ├─► 1. อัปโหลดรูป slip ก่อน
    │       uploadFilesForCustomer([slipFile], customerToken)
    │       └─► POST /upload/files-v2-public (FormData: customerToken + files)
    │       └─► ได้ imageId กลับมา
    │
    ├─► 2. สร้าง payment
    │       ApiClient.post(API_ENDPOINTS.PAYMENTS.CREATE, {
    │         customerOrderId,
    │         paymentAmount,
    │         paymentProofImageId,
    │         customerMessage
    │       })
    │       └─► POST /payments
    │
    └─► 3. emit('submitted') → Parent เรียก fetchOrders() ใหม่
```

---

## การเชื่อมต่อ API แต่ละจุด

### จุดที่ 1: ดึงรายการ Order (by-token)

| รายการ | รายละเอียด |
|--------|-------------|
| **ไฟล์** | `CustomerItemArrivedContent.vue` บรรทัด 108–111 |
| **Repository** | `customerOrderRepository.getByToken()` |
| **API** | `GET /customer-orders/by-token` |
| **Query Params** | `customerToken`, `notificationToken`, `page`, `limit` |
| **Auth** | ไม่ต้องใช้ JWT (Public endpoint) |

```typescript
// CustomerItemArrivedContent.vue
const res = await customerOrderRepository.getByToken(
  { customerToken: ct, notificationToken: notificationToken.value || undefined },
  { limit: 50 },
);
orders.value = res.results ?? [];
```

**Backend:** Controller ใช้ `getList()` เหมือนกัน แต่ filter ด้วย `customerToken` และ `notificationToken` ใน DTO

---

### จุดที่ 2: ดึงรายละเอียด Order เดี่ยว

| รายการ | รายละเอียด |
|--------|-------------|
| **ไฟล์** | `CustomerItemArrivedContent.vue` บรรทัด 144–145 |
| **Repository** | `customerOrderRepository.getById(id)` |
| **API** | `GET /customer-orders/:id` |
| **Auth** | ไม่ต้องใช้ JWT (Public) |

```typescript
// เมื่อเลือก order จะ refresh ข้อมูลล่าสุด
const fresh = await customerOrderRepository.getById(order.id);
if (fresh) selectedOrder.value = fresh;
```

---

### จุดที่ 3: อัปโหลด Slip (รูปหลักฐานการโอน)

| รายการ | รายละเอียด |
|--------|-------------|
| **ไฟล์** | `CustomerOrderDetail.vue` บรรทัด 146 |
| **Function** | `uploadFilesForCustomer(files, customerToken)` |
| **API** | `POST /upload/files-v2-public` |
| **Body** | FormData: `customerToken`, `files[]` |
| **Auth** | ไม่ต้องใช้ JWT (ส่ง customerToken ใน body แทน) |

```typescript
// upload.repository.ts
const formData = new FormData();
formData.append('customerToken', customerToken);
for (const file of files) formData.append('files', file);
await api.post(API_ENDPOINTS.UPLOAD.FILES_V2_PUBLIC, formData, ...);
```

---

### จุดที่ 4: สร้าง Payment (ส่ง slip + ข้อความ)

| รายการ | รายละเอียด |
|--------|-------------|
| **ไฟล์** | `CustomerOrderDetail.vue` บรรทัด 149–155 |
| **API Client** | `new ApiClient().post()` โดยตรง (ไม่ผ่าน repository) |
| **API** | `POST /payments` |
| **Body** | `{ customerOrderId, paymentAmount, paymentProofImageId, customerMessage }` |
| **Auth** | ใช้ JWT ถ้ามี (จาก axios interceptor) — แต่อาจเป็น Public ได้ถ้า backend อนุญาต |

```typescript
await client.post(API_ENDPOINTS.PAYMENTS.CREATE, {
  customerOrderId: props.order.id,
  paymentAmount: parseFloat(props.order.remainingAmount) || 0,
  paymentProofImageId: imageId,
  customerMessage: message.value.trim() || undefined,
});
```

---

## Repository Layer

### CustomerOrderRepository

| Method | Endpoint | ใช้เมื่อ |
|--------|----------|----------|
| `getByToken(params, query)` | `GET /customer-orders/by-token` | โหลดรายการ order ตาม link notification |
| `getById(id)` | `GET /customer-orders/:id` | โหลดรายละเอียด order เดี่ยว |
| `getList(query)` | `GET /customer-orders` | ใช้ฝั่ง merchant (customerId, orderId ฯลฯ) |

### ApiClient (Infrastructure)

- `get(endpoint)` — GET ธรรมดา
- `getParams(endpoint, params)` — GET พร้อม query string
- `post(endpoint, data)` — POST JSON

### Axios Config

- **baseURL:** จาก `VITE_API_BASE_URL`
- **Request Interceptor:** ใส่ `Authorization: Bearer <token>` ถ้ามี token ใน Pinia
- **Response Interceptor:** จัดการ 401 → clear auth และ redirect ไป login

---

## API Endpoints ที่ใช้ (Customer Side)

| Endpoint | Method | ใช้ใน | Auth |
|----------|--------|-------|------|
| `/customer-orders/by-token` | GET | CustomerItemArrivedContent | Public |
| `/customer-orders/:id` | GET | CustomerItemArrivedContent | Public |
| `/upload/files-v2-public` | POST | CustomerOrderDetail | Public (customerToken ใน body) |
| `/payments` | POST | CustomerOrderDetail | ขึ้นกับ backend |

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Customer Item Arrived Page                           │
│                  (CustomerItemArrivedContent.vue)                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    URL: ?customerToken=xxx&notificationToken=yyy
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  fetchOrders()                                                           │
│  └─► customerOrderRepository.getByToken()                                │
│       └─► GET /customer-orders/by-token?customerToken=...&notificationToken=... │
│       └─► orders = res.results                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌──────────────────────────────┐    ┌──────────────────────────────────────┐
│  CustomerOrderList           │    │  CustomerOrderDetail                 │
│  (รับ orders เป็น props)     │    │  (รับ selectedOrder เป็น props)       │
│  - แสดง summary ยอดค้าง     │    │  - แสดงรายละเอียดสินค้า               │
│  - คลิก order → emit select │    │  - อัปโหลด slip                       │
└──────────────────────────────┘    │  - ส่ง payment                       │
                    │                 └──────────────────────────────────────┘
                    │                               │
                    │  onSelectOrder()               │  handleSubmit()
                    │  └─► getById(id)               │  ├─► uploadFilesForCustomer()
                    │      GET /customer-orders/:id   │  │    POST /upload/files-v2-public
                    │                               │  └─► POST /payments
                    └───────────────────────────────┘
```

---

## สรุป Logic สำคัญ

1. **Token-based Access:** หน้า customer ใช้ `customerToken` + `notificationToken` จาก URL แทน JWT ทำให้ลูกค้าเข้าได้โดยไม่ต้อง login
2. **Public Endpoints:** Customer orders และ upload ใช้ endpoint ที่ไม่ต้องส่ง JWT
3. **Two-step Payment:** อัปโหลดรูปก่อน → ได้ imageId → ส่ง payment พร้อม imageId
4. **Error Handling:** มีการ retry อัตโนมัติเมื่อเจอ database error และแสดงข้อความ error ที่เหมาะสม
