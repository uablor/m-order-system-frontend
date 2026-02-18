# M-Order System Frontend

Frontend application for M-Order System built with Vue 3 + TypeScript + Ant Design Vue.

## 🚀 Features

- ✅ **Authentication System**: Login with JWT token, role-based access control
- ✅ **Multi-language Support**: English, Lao, Thai (i18n)
- ✅ **Responsive Design**: Mobile-friendly layout และ components
- ✅ **Clean Architecture**: Domain-driven design with layers (presentation, application, domain, infrastructure)
- ✅ **TypeScript**: Type-safe development
- ✅ **Pinia**: State management
- ✅ **Vue Router**: Client-side routing with guards
- ✅ **Ant Design Vue**: UI component library
- ✅ **Axios**: HTTP client with interceptors

## 📦 Tech Stack

- **Framework**: Vue 3 (Composition API)
- **Language**: TypeScript
- **UI Library**: Ant Design Vue 4.x
- **State Management**: Pinia
- **Routing**: Vue Router 5.x
- **HTTP Client**: Axios
- **i18n**: Vue I18n 11.x
- **Build Tool**: Vite
- **CSS**: Tailwind CSS 4.x
- **Date Utility**: Day.js

## 🛠️ Installation

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install dependencies
pnpm install
```

## ⚙️ Configuration

สร้างไฟล์ `.env` ที่ root directory:

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:3000
```

## 🚀 Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 📁 Project Structure

```
src/
├── application/           # Application layer
│   └── dto/              # Data Transfer Objects
├── common/               # Common configurations
│   └── axios.config.ts   # Axios interceptors
├── components/           # Reusable components
│   ├── Base/             # Base components (Table, Form, etc.)
│   ├── layouts/          # Layout components (by role)
│   └── ui/               # UI components
├── domain/               # Domain layer
│   └── entities/         # Domain entities
├── infrastructure/       # Infrastructure layer
│   ├── apis/             # API client
│   └── repositories/     # Data repositories
├── localization/         # i18n translations (en, la, th)
├── presentation/         # Presentation layer
│   ├── components/       # Feature-specific components
│   └── views/            # Page components
├── router/               # Vue Router configuration
├── shared/               # Shared utilities
│   ├── composables/      # Vue composables
│   ├── constants/        # Constants (API endpoints, etc.)
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
├── store/                # Pinia stores
├── App.vue               # Root component
└── main.ts               # Application entry point
```

## 🔐 Authentication Flow

1. User logs in with email + password
2. Backend returns JWT token + user data
3. Token is stored in localStorage
4. Token is automatically added to all API requests via Axios interceptor
5. Router guards check authentication and role before navigating
6. If token is expired (401), user is redirected to login page

## 🌍 i18n (Internationalization)

รองรับ 3 ภาษา:
- **English (en)**
- **Lao (la)** - Default
- **Thai (th)**

เปลี่ยนภาษาได้ที่หน้า Login หรือใน Header

## 👥 User Roles

- **SUPER_ADMIN**: Full access to system
- **ADMIN**: Admin access
- **ADMIN_MERCHANT**: Merchant admin
- **EMPLOYEE_MERCHANT**: Merchant employee
- **CUSTOMER**: Customer access

## 📄 API Integration

### Endpoints

Backend API Base URL: `http://localhost:3000`

**Authentication:**
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user

**Users:**
- `GET /users` - List users (with pagination)
- `POST /users` - Create user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

**Roles:**
- `GET /roles` - List roles
- `POST /roles` - Create role
- `PATCH /roles/:id` - Update role
- `DELETE /roles/:id` - Delete role

**Permissions:**
- `GET /permissions` - List permissions
- `POST /permissions` - Create permission
- `POST /permissions/generate` - Generate from controllers
- `PATCH /permissions/:id` - Update permission
- `DELETE /permissions/:id` - Delete permission

**Role Permissions:**
- `POST /role-permissions/assign` - Assign permission to role
- `DELETE /role-permissions/:roleId/:permissionId` - Unassign
- `GET /role-permissions/role/:roleId` - Get by role

ดู `BACKEND_API_ANALYSIS.md` สำหรับรายละเอียดเพิ่มเติม

## ✅ Implemented Features

### Super Admin
- ✅ Dashboard
- ✅ **Users Management** (CRUD with pagination, search)
- 🚧 Roles Management (TODO)
- 🚧 Permissions Management (TODO)
- 🚧 Role Permissions Management (TODO)
- ⏳ Merchants Management (existing UI)
- ⏳ Reports (existing UI)
- ⏳ Notifications (existing UI)
- ⏳ Settings (existing UI)

### Merchant
- ⏳ Dashboard (existing UI)
- ⏳ Customers (existing UI)
- ⏳ Stock Orders (existing UI)
- ⏳ Item Arrived (existing UI)
- ⏳ Notify Arrival (existing UI)
- ⏳ Payment (existing UI)
- ⏳ Reports (existing UI)

### Customer
- ⏳ Item Arrived (existing UI)
- ⏳ Messages (existing UI)

## 🎯 Next Steps

1. สร้าง Roles, Permissions, Role Permissions pages (ตาม pattern ของ Users Page)
2. เชื่อม API ของ Merchants, Orders, Arrivals, Notifications
3. ปรับปรุง Dashboard ให้แสดงข้อมูลจริง
4. เพิ่ม unit tests
5. เพิ่ม E2E tests

## 📚 Documentation

- [INTEGRATION_STATUS.md](INTEGRATION_STATUS.md) - รายละเอียดสถานะการพัฒนา
- [BACKEND_API_ANALYSIS.md](../m-order-system-back/BACKEND_API_ANALYSIS.md) - รายละเอียด Backend API

## 🐛 Troubleshooting

### Backend Connection Error

```
ERR_CONNECTION_REFUSED at http://localhost:3000
```

**Solution**: ตรวจสอบว่า backend server กำลัง running อยู่

```bash
cd ../m-order-system-back
pnpm start
```

### Token Expired

ถ้า token หมดอายุ จะ redirect ไปหน้า login อัตโนมัติ

### pnpm store error

```bash
pnpm install
```

หรือถ้ายังไม่ได้ ลองลบ node_modules แล้ว install ใหม่:

```bash
rm -rf node_modules
pnpm install
```

## 🤝 Contributing

1. สร้าง feature branch จาก `main`
2. Commit changes
3. Push to branch
4. Create Pull Request

## 📝 License

MIT License

---

Made with ❤️ by M-Order System Team
