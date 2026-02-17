# 🚀 Quick Start Guide - M-Order System

## ການຕິດຕັ້ງ (Installation)

### 1. ຕິດຕັ້ງ Dependencies ດ້ວຍ pnpm:

```bash
cd /Users/kongmong/Desktop/web_developer/work_out/web_order/m-order-system-frontend
pnpm install
```

### 2. ເລີ່ມຕົ້ນ Development Server:

```bash
pnpm dev
```

### 3. ເປີດ Browser:

ໄປທີ່: `http://localhost:5173`

---

## 📱 ການໃຊ້ງານ (Usage)

### ໜ້າ Login:
1. ໄປທີ່ `http://localhost:5173/login`
2. ປ້ອນ username ແລະ password (ປ້ອນຫຍັງກໍໄດ້)
3. ກົດປຸ່ມ "ເຂົ້າສູ່ລະບົບ"
4. ຈະໄປໜ້າ Dashboard ອັດຕະໂນມັດ

### ໜ້າ Register:
1. ໄປທີ່ `http://localhost:5173/register`
2. ປ້ອນ email, username, password
3. ກົດປຸ່ມ "ສ້າງບັນຊີ"
4. ຈະໄປໜ້າ Dashboard ອັດຕະໂນມັດ

### ໜ້າ Dashboard:
- ເບິ່ງສະຖິຕິຕ່າງໆ
- ເບິ່ງຕາຕະລາງ Orders
- ເບິ່ງການແຈ້ງເຕືອນ
- ເປີດ Sidebar ເບິ່ງເມນູທັງໝົດ

---

## 🌐 ການປ່ຽນພາສາ (Language Switching)

ໃນໜ້າ Login/Register ແລະ Dashboard:
- ກົດປຸ່ມ 🌐 ຢູ່ທາງຂວາເທິງ
- ເລືອກ:
  - **EN** = English
  - **ລາວ** = ພາສາລາວ

ພາສາທີ່ເລືອກຈະຖືກບັນທຶກໄວ້ໃນ localStorage

---

## 🎨 ສິ່ງທີ່ໄດ້ຕິດຕັ້ງແລ້ວ (What's Installed)

✅ **Pinia** - State Management  
✅ **Vue Router** - Navigation  
✅ **Ant Design Vue** - UI Components  
✅ **Vue i18n** - Multi-language (ລາວ & English)  
✅ **@ant-design/icons-vue** - Icons

---

## 📂 ໂຄງສ້າງໂປຣເຈກ (Project Structure)

```
src/
├── components/layouts/superAdmin-layouts/  # Layout ຂອງ Admin
│   ├── AppLayout.vue                       # Layout ຫຼັກ
│   ├── HeaderLayout.vue                    # Header + ປ່ຽນພາສາ
│   ├── SidebarLayout.vue                   # Sidebar ເມນູ
│   ├── FooterLayout.vue                    # Footer
│   └── menuItem.ts                         # ການຕັ້ງຄ່າເມນູ
│
├── views/                                  # ໜ້າຕ່າງໆ
│   ├── auth/
│   │   ├── LoginPage.vue                   # ໜ້າ Login
│   │   └── RegisterPage.vue                # ໜ້າ Register
│   └── dashboard/
│       └── DashboardPage.vue               # ໜ້າ Dashboard
│
├── store/
│   └── auth.store.ts                       # Pinia Store ສຳລັບ Auth
│
├── router/
│   └── index.ts                            # Vue Router Config
│
├── localization/                           # ການແປພາສາ
│   ├── en/                                 # ພາສາອັງກິດ
│   ├── la/                                 # ພາສາລາວ
│   └── i18n.config.ts                      # i18n Config
│
├── App.vue                                 # Root Component
└── main.ts                                 # Entry Point
```

---

## 🎯 ເມນູທັງໝົດໃນ Sidebar (Menu Items)

1. **ແດຊບອດ** (Dashboard)
2. **ລູກຄ້າ/ຕົວແທນ** (Customers/Agents)
3. **ສະຕ໊ອກອໍເດີ** (Stock Orders)
4. **ຂອງຖຶງແລ້ວ** (Items Arrived)
5. **ແຈ້ງເຄື່ອງຖຶງ** (Notify Arrival)
6. **ການຊຳລະເງິນ** (Payment)
7. **ລາຍງານ** (Reports)
8. **ຕັ້ງຄ່າ** (Settings)

---

## ⚠️ ໝາຍເຫດສຳຄັນ (Important Notes)

### 🔐 Authentication (ການເຂົ້າສູ່ລະບົບ)
- ປັດຈຸບັນໃຊ້ **Mock Authentication** (ປອມ)
- ບໍ່ໄດ້ເຊື່ອມຕໍ່ກັບ Backend ຈິງ
- ຂໍ້ມູນ login ຈະຖືກບັນທຶກໃນ `localStorage`
- ເມື່ອເຊື່ອມຕໍ່ກັບ Backend ຈິງ, ຕ້ອງແກ້ໄຂໃນ `src/store/auth.store.ts`

### 📄 Routes ທີ່ເຮັດວຽກແລ້ວ
- ✅ `/login` - ໜ້າ Login
- ✅ `/register` - ໜ້າ Register
- ✅ `/dashboard` - ໜ້າ Dashboard

### 📄 Routes ທີ່ຍັງບໍ່ທັນມີໜ້າ (ມີແຕ່ເມນູ)
- ⏳ `/customers` - Customers/Agents
- ⏳ `/stock-order` - Stock Orders
- ⏳ `/arrived` - Items Arrived
- ⏳ `/notify-arrival` - Notify Arrival
- ⏳ `/payment` - Payment
- ⏳ `/reports` - Reports
- ⏳ `/settings` - Settings

---

## 🎨 UI Features (ຄຸນສົມບັດ UI)

✅ **Responsive Design** - ໃຊ້ໄດ້ທັງ Desktop ແລະ Mobile  
✅ **Dark Mode Sidebar** - Sidebar ສີເຂັ້ມສວຍງາມ  
✅ **Collapsible Sidebar** - Sidebar ຫຍໍ້ໄດ້  
✅ **Language Switcher** - ປ່ຽນພາສາໄດ້ທຸກໜ້າ  
✅ **User Menu** - ເມນູຜູ້ໃຊ້ພ້ອມ Logout  
✅ **Notifications Badge** - Badge ການແຈ້ງເຕືອນ  
✅ **Statistics Cards** - Card ສະແດງສະຖິຕິ  
✅ **Data Table** - ຕາຕະລາງຂໍ້ມູນ Orders  
✅ **Loading States** - Transitions ລະຫວ່າງໜ້າ

---

## 🔧 Commands (ຄຳສັ່ງທີ່ໃຊ້)

```bash
# ຕິດຕັ້ງ dependencies
pnpm install

# ເລີ່ມ dev server
pnpm dev

# Build ສຳລັບ production
pnpm build

# Preview production build
pnpm preview
```

---

## 📞 ຕິດຕໍ່ (Contact)

ຖ້າມີບັນຫາຫຼືຄຳຖາມ, ກະລຸນາຕິດຕໍ່:
- Email: support@m-order.com
- GitHub: [m-order-system](https://github.com/yourusername/m-order-system)

---

**ສ້າງດ້ວຍ ❤️ ໂດຍໃຊ້ Vue 3 + TypeScript + Ant Design Vue**
