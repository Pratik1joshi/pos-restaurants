# 🚀 Restaurant POS System - Getting Started

## What Has Been Built

### ✅ Core Infrastructure (COMPLETED)

#### 1. Database Layer
- **schema.sql** - Complete SQLite schema with 20+ tables
  - Users & authentication (users, sessions, roles, devices)
  - Restaurant operations (tables, orders, order_items, kots)
  - Menu management (menu_categories, menu_items, menu_item_variants)
  - Billing (bills, bill_payments)
  - Inventory (ingredients, recipe_ingredients)
  - Sync system (sync_logs)
  - Settings & branches

- **seed.js** - Sample data generator
  - 5 demo users (admin, 2 waiters, cashier, kitchen)
  - 10 restaurant tables
  - 8 menu categories
  - 32 menu items (starters, soups, main course, breads, rice, desserts, beverages)
  - System settings

#### 2. Database Repositories
- **index.js** - Database connection with WAL mode, transactions
- **repositories/orders.js** - Order CRUD operations
- **repositories/menu.js** - Menu management
- **repositories/tables.js** - Table operations
- **repositories/bills.js** - Billing and payments

#### 3. Authentication System
- **auth/auth.js** - Complete auth service
  - PIN-based authentication (SHA-256 hashing)
  - Session management (24-hour tokens)
  - Role-based permissions (admin, cashier, waiter, kitchen)
  - Device registration and tracking

#### 4. API Routes
- **/api/auth/login** - User authentication
- **/api/auth/logout** - Session termination
- **/api/auth/verify** - Token verification
- **/api/restaurant/orders** - Order management (GET, POST, PATCH)

### 📋 Default Login Credentials

```
Role: Admin
Username: admin
PIN: 123456

Role: Waiter  
Username: john
PIN: 1234

Role: Waiter
Username: ram
PIN: 4567

Role: Cashier
Username: sita
PIN: 7890

Role: Kitchen
Username: chef
PIN: 1111
```

## 🏃 Quick Start Guide

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Initialize Database
```bash
npm run db:seed
```

This will:
- Create `pos_restaurant.db` file
- Create all tables
- Insert sample data
- Display login credentials

### Step 3: Start Development Server
```bash
npm run dev
```

The app will be available at **http://localhost:3000**

## 📁 Project Structure

```
pos-restaurent-system/
├── app/
│   ├── api/
│   │   ├── auth/              # Authentication routes
│   │   │   ├── login/
│   │   │   ├── logout/
│   │   │   └── verify/
│   │   └── restaurant/        # Restaurant operations
│   │       └── orders/
│   ├── admin/                 # Admin panel (to be built)
│   ├── waiter/                # Waiter app (to be built)
│   ├── kitchen/               # Kitchen display (to be built)
│   └── cashier/               # Cashier app (to be built)
├── lib/
│   ├── db/
│   │   ├── schema.sql         # Database schema
│   │   ├── seed.js            # Seed data
│   │   ├── index.js           # Database connection
│   │   └── repositories/      # Data access layer
│   │       ├── orders.js
│   │       ├── menu.js
│   │       ├── tables.js
│   │       └── bills.js
│   └── auth/
│       └── auth.js            # Authentication service
├── components/                # UI components (to be built)
└── Documentation/
    ├── SYSTEM_ARCHITECTURE.md
    ├── DATABASE_SCHEMA.md
    ├── UI_UX_WIREFRAMES.md
    ├── WORKFLOW_MAP.md
    └── IMPLEMENTATION_ROADMAP.md
```

## 🔧 Available NPM Scripts

```json
{
  "dev": "next dev --turbopack",      # Start dev server
  "build": "next build",              # Build for production
  "start": "next start",              # Start production server
  "lint": "eslint",                   # Lint code
  "db:seed": "node lib/db/seed.js",   # Seed database
  "db:reset": "rm -f pos_restaurant.db && node lib/db/seed.js"  # Reset DB
}
```

## 🗄️ Database

### Location
`pos_restaurant.db` (created in project root)

### Reset Database
If you need to reset the database:
```bash
npm run db:reset
```

## 📊 Sample Menu Items

The seeded database includes:

**Starters:**
- Chicken Tikka (Rs 450)
- Paneer Tikka (Rs 380)
- Veg Momos (Rs 180)
- Chicken Momos (Rs 220)

**Main Course:**
- Butter Chicken (Rs 520)
- Dal Makhni (Rs 320)
- Paneer Butter Masala (Rs 420)

**Breads:**
- Naan (Rs 45)
- Garlic Naan (Rs 60)
- Roti (Rs 35)

**And many more...**

## 🧪 Testing the API

### Login Test
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","pin":"123456","deviceId":"test-device"}'
```

### Create Order Test
```bash
curl -X POST http://localhost:3000/api/restaurant/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "table_id": 1,
    "order_type": "dine-in",
    "items": [
      {
        "menu_item_id": 1,
        "quantity": 2,
        "unit_price": 450,
        "subtotal": 900
      }
    ]
  }'
```

## 🎯 Next Steps

### Phase 1: Complete Core Features
1. ✅ Database & repositories
2. ✅ Authentication system
3. ✅ Basic API routes
4. ⏳ UI Component library
5. ⏳ Waiter app interface
6. ⏳ Kitchen Display System
7. ⏳ Cashier/Billing interface

### Phase 2: Advanced Features
- WebSocket real-time sync
- Offline mode with IndexedDB
- Cloud synchronization
- Hardware integration (printers, scanners)
- AI analytics

## 🐛 Troubleshooting

### Database locked error
- Make sure only one instance of the app is running
- Delete `pos_restaurant.db-shm` and `pos_restaurant.db-wal` files
- Restart the server

### Module not found errors
- Run `npm install` again
- Check that `package.json` has `"type": "module"`

### Database schema errors
- Run `npm run db:reset` to recreate the database

## 📚 Documentation

Complete documentation available in:
- `SYSTEM_ARCHITECTURE.md` - Full system design
- `DATABASE_SCHEMA.md` - Database structure
- `UI_UX_WIREFRAMES.md` - Interface designs
- `WORKFLOW_MAP.md` - Operational workflows
- `IMPLEMENTATION_ROADMAP.md` - Development plan

## 💡 Tips

1. **Development**: Use `npm run dev` for hot reload
2. **Database**: Use SQLite Browser or DB Browser for SQLite to view data
3. **API Testing**: Use Postman or Thunder Client VS Code extension
4. **Logs**: Check console for detailed error messages

## 🆘 Support

For issues or questions:
1. Check the documentation files
2. Review the database schema
3. Check API route implementations
4. Verify authentication tokens

---

**Status**: Core infrastructure complete ✅  
**Next**: Building UI components and interfaces  
**Target**: Fully functional POS system in 20 weeks
