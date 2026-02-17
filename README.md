# M-Order System Frontend

A modern order management system built with Vue 3, TypeScript, and Ant Design Vue.

## 🚀 Features

- ✅ **Vue 3** with Composition API
- ✅ **TypeScript** for type safety
- ✅ **Ant Design Vue** for beautiful UI components
- ✅ **Pinia** for state management
- ✅ **Vue Router** for navigation
- ✅ **Vue i18n** for multi-language support (English & Lao)
- ✅ **Responsive Design** for mobile and desktop

## 📁 Project Structure

```
src/
├── components/
│   └── layouts/
│       └── superAdmin-layouts/     # Admin dashboard layout
│           ├── AppLayout.vue       # Main layout wrapper
│           ├── HeaderLayout.vue    # Header with language switcher
│           ├── SidebarLayout.vue   # Sidebar navigation
│           ├── FooterLayout.vue    # Footer
│           └── menuItem.ts         # Menu configuration
├── views/
│   ├── auth/
│   │   ├── LoginPage.vue          # Login page
│   │   └── RegisterPage.vue       # Registration page
│   └── dashboard/
│       └── DashboardPage.vue      # Main dashboard
├── store/
│   └── auth.store.ts              # Authentication store (Pinia)
├── router/
│   └── index.ts                   # Vue Router configuration
├── localization/
│   ├── en/                        # English translations
│   │   ├── login.json
│   │   ├── register.json
│   │   ├── dashboard.json
│   │   └── index.ts
│   ├── la/                        # Lao translations
│   │   ├── login.json
│   │   ├── register.json
│   │   ├── dashboard.json
│   │   └── index.ts
│   ├── index.ts                   # Export all languages
│   └── i18n.config.ts             # i18n configuration
├── App.vue                        # Root component
├── main.ts                        # Application entry point
└── style.css                      # Global styles
```

## 🎯 Menu Items (Sidebar)

The dashboard includes the following menu items:

1. **Dashboard** (ແດຊບອດ) - Main overview
2. **Customers/Agents** (ລູກຄ້າ/ຕົວແທນ) - Customer management
3. **Stock Orders** (ສະຕ໊ອກອໍເດີ) - Order inventory
4. **Items Arrived** (ຂອງຖຶງແລ້ວ) - Received items
5. **Notify Arrival** (ແຈ້ງເຄື່ອງຖຶງ) - Arrival notifications
6. **Payment** (ການຊຳລະເງິນ) - Payment management
7. **Reports** (ລາຍງານ) - Analytics and reports
8. **Settings** (ຕັ້ງຄ່າ) - System settings

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)

### Install Dependencies

```bash
pnpm install
```

### Run Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

## 🌐 Multi-Language Support

The application supports two languages:

- **English (en)**
- **Lao (la)**

Users can switch languages using the language switcher in the header (globe icon).

Language preference is saved in `localStorage` and persists across sessions.

## 🔐 Authentication Flow

### Login
1. Navigate to `/login`
2. Enter username and password
3. Click "Sign In"
4. Redirected to `/dashboard` on success

### Register
1. Navigate to `/register`
2. Enter email, username, and password
3. Click "Create Account"
4. Redirected to `/dashboard` on success

### Logout
1. Click user avatar in header
2. Select "Logout" from dropdown
3. Redirected to `/login`

**Note:** Authentication is currently mocked with `console.log`. The token is stored in `localStorage` for demonstration purposes. Replace with actual API calls when integrating with backend.

## 📄 Pages & Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | - | Redirects to `/login` |
| `/login` | LoginPage.vue | User login |
| `/register` | RegisterPage.vue | User registration |
| `/dashboard` | DashboardPage.vue | Main dashboard (requires auth) |

## 🎨 UI Components

### Layout Components

- **AppLayout**: Main layout wrapper with sidebar, header, content, and footer
- **HeaderLayout**: Top navigation bar with language switcher, notifications, and user menu
- **SidebarLayout**: Collapsible sidebar with menu items
- **FooterLayout**: Footer with copyright and links

### Page Components

- **LoginPage**: Login form with validation
- **RegisterPage**: Registration form with password confirmation
- **DashboardPage**: Dashboard with statistics, tables, and notifications

## 🔧 Configuration

### Router Guards

The router includes navigation guards to protect authenticated routes:

```typescript
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('access_token');
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login'); // Redirect to login if not authenticated
  } else if (to.meta.skipAuth && isAuthenticated) {
    next('/dashboard'); // Redirect to dashboard if already authenticated
  } else {
    next(); // Allow navigation
  }
});
```

### i18n Configuration

Language configuration is in `src/localization/i18n.config.ts`:

```typescript
export const i18n = createI18n({
  legacy: false,
  locale: savedLocale, // Default language from localStorage
  fallbackLocale: 'la', // Fallback to Lao
  messages: {
    en: messages.en,
    la: messages.la,
  },
  // Number formats for currency
  numberFormats: {
    en: { currency: { style: 'currency', currency: 'USD' } },
    la: { currency: { style: 'currency', currency: 'LAK' } },
  }
});
```

## 📝 Adding New Features

### Adding a New Page

1. Create component in `src/views/`
2. Add route in `src/router/index.ts`
3. Add menu item in `src/components/layouts/superAdmin-layouts/menuItem.ts`
4. Add translations in `src/localization/en/` and `src/localization/la/`

### Adding Translations

1. Add keys to JSON files in `src/localization/en/` and `src/localization/la/`
2. Use in components: `{{ $t('key.path') }}`
3. Or in script: `const { t } = useI18n(); t('key.path')`

### Example:

```vue
<template>
  <h1>{{ $t('dashboard.welcome') }}</h1>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
console.log(t('dashboard.title'));
</script>
```

## 🎯 Next Steps

### Backend Integration

Replace mock authentication with real API calls:

1. Create API service in `src/services/`
2. Update `auth.store.ts` to use real API
3. Add axios or fetch for HTTP requests
4. Handle errors and loading states

### Add More Pages

The menu items are configured but routes need to be created:

- Customers/Agents page
- Stock Orders page
- Items Arrived page
- Notify Arrival page
- Payment page
- Reports page
- Settings page

### Enhanced Features

- Form validation with more rules
- Error handling and user feedback
- Loading states for async operations
- Pagination for tables
- Search and filter functionality
- Real-time notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📧 Support

For questions or issues, please contact: support@m-order.com

---

**Built with ❤️ using Vue 3 + TypeScript + Ant Design Vue**
