# 🏪 Hybrid POS System - Complete Architecture
## For Restaurants & Shops in Nepal

---

## 📋 TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [Operating Modes](#operating-modes)
3. [Module Specifications](#module-specifications)
4. [Database Design](#database-design)
5. [Sync Architecture](#sync-architecture)
6. [API Endpoints](#api-endpoints)
7. [UI/UX Flows](#uiux-flows)
8. [Hardware Integration](#hardware-integration)
9. [AI Features](#ai-features)
10. [Security & Roles](#security--roles)
11. [Implementation Roadmap](#implementation-roadmap)

---

## 1. SYSTEM OVERVIEW

### Architecture Type
**Progressive Web App (PWA) + Electron Hybrid**

### Tech Stack
- **Frontend**: Next.js 15+ (React), TailwindCSS
- **Local Backend**: Node.js Express Server
- **Local Database**: SQLite (Better-SQLite3)
- **Cloud Database**: PostgreSQL (Primary) + MongoDB (Analytics)
- **Offline Storage**: IndexedDB + LocalStorage
- **Real-time**: WebSockets (Socket.io)
- **Sync Engine**: Custom conflict-free replicated data type (CRDT)
- **AI/ML**: TensorFlow.js (client-side), Python FastAPI (cloud-side)

### System Components
```
┌─────────────────────────────────────────────────────────────┐
│                     CLOUD LAYER                              │
│  PostgreSQL + MongoDB + Redis + AI Engine + Backup Service  │
└─────────────────────────────────────────────────────────────┘
                            ↕️ HTTPS/WSS
┌─────────────────────────────────────────────────────────────┐
│                  LOCAL SERVER (Wi-Fi Mode)                   │
│        Node.js + SQLite + Socket.io + Sync Engine           │
└─────────────────────────────────────────────────────────────┘
                            ↕️ HTTP/WS
┌──────────────┬──────────────┬──────────────┬──────────────┐
│   Waiter     │   Kitchen    │   Cashier    │    Admin     │
│   Tablet     │   Display    │   Terminal   │   Dashboard  │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

---

## 2. OPERATING MODES

### 🔵 MODE 1: LOCAL WI-FI MODE (Primary Mode)

**Setup:**
```
Local Server Device (Laptop/Mini PC)
├── Runs Node.js Server (Port 3000)
├── SQLite Database (pos_local.db)
├── WebSocket Server (Port 3001)
└── Local DNS (pos.local via mDNS)

Connected Devices
├── Waiter Tablets (http://192.168.1.100:3000/waiter)
├── Kitchen Display (http://192.168.1.100:3000/kitchen)
├── Cashier Terminal (http://192.168.1.100:3000/cashier)
└── Admin Device (http://192.168.1.100:3000/admin)
```

**Features:**
- Real-time order sync (< 100ms latency)
- No internet required
- Supports 10-50 concurrent devices
- Automatic device discovery
- Local backup every 30 minutes

**Technical Implementation:**
```javascript
// Local Server Setup
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const Database = require('better-sqlite3');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const db = new Database('pos_local.db');

// Real-time order broadcasting
io.on('connection', (socket) => {
  socket.on('new_order', (order) => {
    // Save to local DB
    const result = db.prepare('INSERT INTO orders ...').run(order);
    
    // Broadcast to kitchen
    io.to('kitchen').emit('order_received', order);
    
    // Broadcast to cashier
    io.to('cashier').emit('order_update', order);
  });
});
```

---

### 🟢 MODE 2: FULL OFFLINE MODE

**Scenario:** Single device with no network

**Storage Strategy:**
```javascript
// IndexedDB Schema
const dbSchema = {
  name: 'POS_Offline',
  version: 1,
  stores: [
    {
      name: 'orders',
      keyPath: 'id',
      autoIncrement: true,
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'status', keyPath: 'status' },
        { name: 'synced', keyPath: 'synced' }
      ]
    },
    {
      name: 'menu_items',
      keyPath: 'id'
    },
    {
      name: 'sync_queue',
      keyPath: 'id',
      autoIncrement: true
    }
  ]
};
```

**Sync Queue System:**
```javascript
// When offline, queue all changes
class OfflineSyncQueue {
  async addToQueue(operation) {
    const change = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      operation: operation.type, // 'INSERT', 'UPDATE', 'DELETE'
      table: operation.table,
      data: operation.data,
      synced: false
    };
    
    await db.syncQueue.add(change);
  }
  
  async syncWhenOnline() {
    const pending = await db.syncQueue.where('synced').equals(false).toArray();
    
    for (const change of pending) {
      try {
        await fetch('/api/sync', {
          method: 'POST',
          body: JSON.stringify(change)
        });
        
        await db.syncQueue.update(change.id, { synced: true });
      } catch (error) {
        // Retry later
      }
    }
  }
}
```

---

### 🟣 MODE 3: CLOUD SYNC MODE

**Sync Strategy:**
```
Local SQLite → Sync Engine → Cloud PostgreSQL
     ↓              ↓              ↓
 Change Log → Conflict Check → Merge & Apply
```

**Sync Intervals:**
- Real-time: Critical operations (orders, payments)
- Every 5 minutes: Menu updates, inventory
- Every 1 hour: Analytics, reports
- Daily: Full backup

**Implementation:**
```javascript
class CloudSyncEngine {
  constructor() {
    this.syncInterval = 5 * 60 * 1000; // 5 minutes
    this.lastSync = null;
  }
  
  async syncToCloud() {
    const changes = await this.getLocalChanges();
    
    const response = await fetch('https://api.yourpos.com/sync', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'X-Branch-ID': this.branchId
      },
      body: JSON.stringify({
        changes,
        lastSync: this.lastSync,
        deviceId: this.deviceId
      })
    });
    
    const { cloudChanges, conflicts } = await response.json();
    
    // Apply cloud changes to local
    await this.applyCloudChanges(cloudChanges);
    
    // Resolve conflicts
    await this.resolveConflicts(conflicts);
    
    this.lastSync = new Date().toISOString();
  }
  
  async resolveConflicts(conflicts) {
    for (const conflict of conflicts) {
      // Rule: Latest timestamp wins
      if (conflict.cloudTimestamp > conflict.localTimestamp) {
        await this.applyCloudVersion(conflict);
      } else {
        await this.pushLocalVersion(conflict);
      }
    }
  }
}
```

---

## 3. MODULE SPECIFICATIONS

### 🍽 MODULE 1: WAITER APP

**Features:**
```
┌─────────────────────────────────────┐
│        WAITER APP MAIN SCREEN       │
├─────────────────────────────────────┤
│  [Profile: John] [Battery: 85%]    │
│  [Active Orders: 5]                 │
├─────────────────────────────────────┤
│           TABLE LAYOUT              │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│  │ T1 │ │ T2 │ │ T3 │ │ T4 │      │
│  │🟢  │ │🔴  │ │🟡  │ │🟢  │      │
│  └────┘ └────┘ └────┘ └────┘      │
│                                     │
│  🟢 Available  🔴 Occupied          │
│  🟡 Reserved   🔵 Cleaning          │
├─────────────────────────────────────┤
│  [➕ New Order]  [📋 My Orders]    │
└─────────────────────────────────────┘
```

**Order Taking Flow:**
```javascript
// Waiter Order Component
const WaiterOrderScreen = () => {
  const [selectedTable, setSelectedTable] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const submitOrder = async () => {
    const order = {
      id: generateOfflineId(),
      tableId: selectedTable.id,
      waiterId: currentUser.id,
      items: orderItems,
      status: 'pending',
      timestamp: Date.now(),
      notes: orderNotes,
      kotNumber: await generateKOT()
    };
    
    // Save locally first (instant feedback)
    await saveToLocalDB(order);
    
    // Broadcast via WebSocket if online
    if (isOnline) {
      socket.emit('new_order', order);
    } else {
      // Queue for sync
      await addToSyncQueue('INSERT', 'orders', order);
    }
    
    // Show success notification
    showToast('Order sent to kitchen!');
    
    // Navigate back
    router.push('/waiter/tables');
  };
  
  return (
    <div>
      {/* Menu categories */}
      <CategoryTabs categories={categories} />
      
      {/* Menu items grid */}
      <MenuItemsGrid onAddItem={addToOrder} />
      
      {/* Current order summary */}
      <OrderSummary items={orderItems} />
      
      {/* Action buttons */}
      <button onClick={submitOrder}>Send to Kitchen</button>
      <button onClick={saveAsDraft}>Save Draft</button>
    </div>
  );
};
```

**Key Features:**
1. **PIN-based Login** (4-6 digit)
2. **Table Management**
   - Visual table map
   - Table status colors
   - Table capacity display
   - Filter by status
3. **Menu Browsing**
   - Category tabs
   - Search with autocomplete
   - Item images
   - Price display
   - Variants (Small/Medium/Large)
   - Dietary tags (🌱 Veg, 🌶️ Spicy)
4. **Order Customization**
   - Quantity +/-
   - Special instructions per item
   - Half/Full portions
   - Add-ons (extra cheese, etc.)
5. **Order Actions**
   - Send to kitchen
   - Save as draft
   - Modify existing order
   - Transfer table
   - Merge tables
   - Split order
6. **Notifications**
   - Food ready alerts
   - Table requests
   - Manager calls

---

### 🔪 MODULE 2: KITCHEN DISPLAY SYSTEM (KDS)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│              KITCHEN DISPLAY SYSTEM - MAIN                  │
├─────────────────────────────────────────────────────────────┤
│ [Station: All ▼] [Filter: Pending ▼]  🔔 15 Pending Orders │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ KOT #247     │  │ KOT #248     │  │ KOT #249     │    │
│  │ Table: T-12  │  │ Table: T-05  │  │ Table: T-08  │    │
│  │ Time: 2m     │  │ Time: 8m     │  │ Time: 15m ⚠️│    │
│  │ Status: NEW  │  │ Status: Cook │  │ Status: Cook │    │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤    │
│  │ • Chicken    │  │ • Paneer     │  │ • Momos (8)  │    │
│  │   Tikka x2   │  │   Butter x1  │  │   🌶️ Extra  │    │
│  │   🌶️🌶️       │  │ • Dal Makhni │  │ • Chowmein   │    │
│  │ • Naan x4    │  │   x1         │  │   x1         │    │
│  │              │  │              │  │              │    │
│  │ [START COOK] │  │ [MARK READY] │  │ [MARK READY] │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

**Time-based Color Coding:**
```javascript
const getKOTColor = (elapsedMinutes) => {
  if (elapsedMinutes < 5) return 'bg-green-100 border-green-500';
  if (elapsedMinutes < 10) return 'bg-yellow-100 border-yellow-500';
  if (elapsedMinutes < 15) return 'bg-orange-100 border-orange-500';
  return 'bg-red-100 border-red-500'; // Urgent!
};
```

**Kitchen Station Management:**
```javascript
const kitchenStations = [
  { id: 'grill', name: 'Grill', items: ['tandoori', 'kebabs'] },
  { id: 'chinese', name: 'Chinese', items: ['noodles', 'manchurian'] },
  { id: 'bar', name: 'Bar', items: ['drinks', 'cocktails'] },
  { id: 'dessert', name: 'Desserts', items: ['ice-cream', 'cake'] },
  { id: 'main', name: 'Main Course', items: ['curry', 'rice'] }
];

// Auto-route orders to stations
const routeOrderToStation = (order) => {
  const stationMap = {};
  
  order.items.forEach(item => {
    const station = findStationForItem(item);
    if (!stationMap[station]) {
      stationMap[station] = [];
    }
    stationMap[station].push(item);
  });
  
  // Create separate KOTs for each station
  Object.entries(stationMap).forEach(([station, items]) => {
    createKOT({
      ...order,
      items,
      station,
      kotNumber: `${order.kotNumber}-${station.toUpperCase()}`
    });
  });
};
```

**KDS Features:**
1. **Order Display**
   - Card-based layout
   - Time since order
   - Color-coded urgency
   - Table number prominent
   - Item quantities clear
2. **Order Status Flow**
   - `NEW` → `PREPARING` → `READY` → `SERVED`
3. **Station Filtering**
   - Show only relevant orders
   - Multi-station support
4. **Actions**
   - Start cooking
   - Mark ready (notifies waiter)
   - Bump/complete order
   - View order history
5. **Alerts**
   - Sound on new order
   - Visual flash
   - Overdue orders highlight

---

### 💰 MODULE 3: CASHIER/BILLING SYSTEM

**Billing Screen:**
```
┌─────────────────────────────────────────────────────────────┐
│                    CASHIER - BILLING                         │
├─────────────────────────────────────────────────────────────┤
│  [Table View] [Quick Sale] [History]          Bill #: 1247  │
├─────────────────────────────────────────────────────────────┤
│  TABLE: T-12        TIME: 45min         WAITER: John D.     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ITEM                QTY    PRICE      TOTAL                │
│  ─────────────────────────────────────────────────          │
│  Chicken Tikka       2    Rs 450    Rs 900                  │
│  Naan (Plain)        4    Rs  45    Rs 180                  │
│  Dal Makhni          1    Rs 320    Rs 320                  │
│  Paneer Butter       1    Rs 380    Rs 380                  │
│  ─────────────────────────────────────────────────          │
│                            Subtotal:  Rs 1,780              │
│                   Service Charge 10%: Rs   178              │
│                           VAT 13%   : Rs   254.54           │
│                            ─────────────────                │
│                         GRAND TOTAL:  Rs 2,212.54           │
├─────────────────────────────────────────────────────────────┤
│  [💵 Cash] [💳 Card] [📱 QR Pay]  [🎁 Discount] [🧾 Print] │
└─────────────────────────────────────────────────────────────┘
```

**Billing Implementation:**
```javascript
const BillingSystem = () => {
  const [currentBill, setCurrentBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState({ type: 'none', value: 0 });
  
  const calculateBill = (order) => {
    const subtotal = order.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    
    const serviceCharge = subtotal * 0.10; // 10%
    const taxableAmount = subtotal + serviceCharge;
    const vat = taxableAmount * 0.13; // 13% VAT in Nepal
    
    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = subtotal * (discount.value / 100);
    } else if (discount.type === 'amount') {
      discountAmount = discount.value;
    }
    
    const grandTotal = taxableAmount + vat - discountAmount;
    
    return {
      subtotal,
      serviceCharge,
      vat,
      discountAmount,
      grandTotal
    };
  };
  
  const generateBill = async () => {
    const bill = {
      id: generateBillNumber(),
      orderId: currentOrder.id,
      tableId: currentOrder.tableId,
      calculations: calculateBill(currentOrder),
      paymentMethod,
      timestamp: Date.now(),
      cashier: currentUser.id,
      status: 'pending'
    };
    
    // Save to local DB
    await saveBill(bill);
    
    // Print receipt
    if (printerConnected) {
      await printReceipt(bill);
    }
    
    // Update table status
    await updateTableStatus(currentOrder.tableId, 'available');
    
    return bill;
  };
  
  const processSplitBill = async (splitConfig) => {
    // Split by amount or items
    const bills = splitConfig.map(split => ({
      ...currentBill,
      items: split.items,
      amount: split.amount,
      splitRef: currentBill.id
    }));
    
    return Promise.all(bills.map(generateBill));
  };
};
```

**Cashier Features:**
1. **Bill Generation**
   - Auto-calculate totals
   - Service charge option
   - VAT/Tax calculation
   - Discount application
2. **Payment Methods**
   - Cash (with change calculation)
   - Card (Swipe/Chip/Contactless)
   - QR Payment (eSewa, Khalti, Fonepay)
   - Split payment (multiple methods)
3. **Bill Actions**
   - Print receipt
   - Email receipt
   - SMS receipt
   - Re-print
   - Cancel bill (with reason)
4. **Advanced Features**
   - Split bill (by amount/items/person)
   - Merge bills (combine tables)
   - Partial payment
   - Credit/Pay later
5. **Quick Sale Mode**
   - For counter/takeaway
   - Barcode scanning
   - Fast checkout

---

### ⚙️ MODULE 4: ADMIN PANEL

**Dashboard Overview:**
```
┌─────────────────────────────────────────────────────────────┐
│                   ADMIN DASHBOARD                            │
├─────────────────────────────────────────────────────────────┤
│  TODAY'S PERFORMANCE                          [Date: Dec 1]  │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Total Sales  │  │ Orders       │  │ Avg Bill     │     │
│  │ Rs 45,230    │  │ 87 orders    │  │ Rs 520       │     │
│  │ ↑ 15%       │  │ ↑ 8%         │  │ ↓ 5%         │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  📊 SALES TREND (Last 7 Days)                               │
│  [Line Chart showing daily sales]                           │
│                                                              │
│  🍕 TOP SELLING ITEMS              ⏰ PEAK HOURS            │
│  1. Chicken Tikka (45 orders)      12PM-2PM: 35%           │
│  2. Paneer Butter (38 orders)      7PM-9PM: 40%            │
│  3. Veg Momos (32 orders)          3PM-5PM: 15%            │
├─────────────────────────────────────────────────────────────┤
│  [📝 Menu] [👥 Staff] [📦 Inventory] [⚙️ Settings]         │
└─────────────────────────────────────────────────────────────┘
```

**Menu Management:**
```javascript
const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [editMode, setEditMode] = useState(false);
  
  const addMenuItem = async (item) => {
    const newItem = {
      id: generateId(),
      name: item.name,
      category: item.category,
      price: item.price,
      variants: item.variants || [],
      ingredients: item.ingredients || [],
      preparationTime: item.prepTime,
      isVeg: item.isVeg,
      isSpicy: item.isSpicy,
      image: await uploadImage(item.image),
      available: true,
      tags: item.tags,
      allergens: item.allergens
    };
    
    await db.menuItems.add(newItem);
    await syncToCloud('menu_items', 'INSERT', newItem);
  };
  
  return (
    <div>
      <MenuItemsTable items={menuItems} />
      <MenuItemForm onSubmit={addMenuItem} />
      <BulkUploadCSV />
      <MenuPreview />
    </div>
  );
};
```

**Admin Features:**
1. **Menu Management**
   - Add/Edit/Delete items
   - Bulk upload via CSV
   - Category management
   - Price variants
   - Image upload
   - Recipe/ingredients tracking
   - Allergen info
   - Toggle availability
2. **Staff Management**
   - Add users
   - Assign roles
   - PIN management
   - Shift scheduling
   - Performance tracking
   - Attendance
3. **Table Layout**
   - Drag-and-drop designer
   - Set capacity
   - Floor plans (multiple floors)
   - Section management
4. **Analytics & Reports**
   - Sales reports (daily/weekly/monthly)
   - Category-wise analysis
   - Waiter performance
   - Payment method breakdown
   - Hourly analysis
   - Item profitability
   - Waste tracking
5. **Inventory (Optional)**
   - Ingredient stock
   - Low stock alerts
   - Purchase orders
   - Supplier management
   - Recipe costing
6. **System Settings**
   - Tax configuration
   - Service charge
   - Printer setup
   - Device management
   - Sync settings
   - Backup & restore
   - Multi-branch setup

---

## 4. DATABASE DESIGN

### SQLite Schema (Local)

```sql
-- Users & Authentication
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  pin TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL, -- 'admin', 'cashier', 'waiter', 'kitchen'
  email TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Roles & Permissions
CREATE TABLE roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  permissions TEXT NOT NULL, -- JSON array
  description TEXT
);

-- Devices (Track connected devices)
CREATE TABLE devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT UNIQUE NOT NULL,
  device_name TEXT,
  device_type TEXT, -- 'waiter', 'kitchen', 'cashier', 'admin'
  ip_address TEXT,
  last_seen DATETIME,
  user_id INTEGER,
  is_active BOOLEAN DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tables (Restaurant seating)
CREATE TABLE tables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_number TEXT UNIQUE NOT NULL,
  floor TEXT DEFAULT 'Ground',
  section TEXT,
  capacity INTEGER DEFAULT 4,
  position_x INTEGER, -- For visual layout
  position_y INTEGER,
  status TEXT DEFAULT 'available', -- 'available', 'occupied', 'reserved', 'cleaning'
  current_order_id INTEGER,
  waiter_id INTEGER,
  occupied_at DATETIME,
  FOREIGN KEY (current_order_id) REFERENCES orders(id),
  FOREIGN KEY (waiter_id) REFERENCES users(id)
);

-- Menu Categories
CREATE TABLE menu_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  icon TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Menu Items
CREATE TABLE menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_id INTEGER NOT NULL,
  base_price REAL NOT NULL,
  image_url TEXT,
  preparation_time INTEGER DEFAULT 15, -- minutes
  is_vegetarian BOOLEAN DEFAULT 0,
  is_vegan BOOLEAN DEFAULT 0,
  is_spicy BOOLEAN DEFAULT 0,
  spice_level INTEGER DEFAULT 0, -- 0-5
  is_available BOOLEAN DEFAULT 1,
  tags TEXT, -- JSON array
  allergens TEXT, -- JSON array
  calories INTEGER,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES menu_categories(id)
);

-- Item Variants (Size, Type)
CREATE TABLE menu_item_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  menu_item_id INTEGER NOT NULL,
  variant_name TEXT NOT NULL, -- 'Small', 'Large', 'Half', 'Full'
  price_modifier REAL DEFAULT 0, -- Added to base price
  is_default BOOLEAN DEFAULT 0,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- Orders
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT UNIQUE NOT NULL,
  table_id INTEGER,
  waiter_id INTEGER,
  order_type TEXT DEFAULT 'dine-in', -- 'dine-in', 'takeaway', 'delivery'
  customer_name TEXT,
  customer_phone TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'preparing', 'ready', 'served', 'cancelled'
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME,
  ready_at DATETIME,
  served_at DATETIME,
  synced BOOLEAN DEFAULT 0,
  sync_version INTEGER DEFAULT 1,
  FOREIGN KEY (table_id) REFERENCES tables(id),
  FOREIGN KEY (waiter_id) REFERENCES users(id)
);

-- Order Items
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  menu_item_id INTEGER NOT NULL,
  variant_id INTEGER,
  quantity INTEGER DEFAULT 1,
  unit_price REAL NOT NULL,
  subtotal REAL NOT NULL,
  special_instructions TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'preparing', 'ready', 'served'
  kot_printed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id),
  FOREIGN KEY (variant_id) REFERENCES menu_item_variants(id)
);

-- KOT (Kitchen Order Tickets)
CREATE TABLE kots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kot_number TEXT UNIQUE NOT NULL,
  order_id INTEGER NOT NULL,
  station TEXT, -- 'grill', 'chinese', 'bar', etc.
  status TEXT DEFAULT 'pending',
  printed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME,
  completed_at DATETIME,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- KOT Items (Items in each KOT)
CREATE TABLE kot_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kot_id INTEGER NOT NULL,
  order_item_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  FOREIGN KEY (kot_id) REFERENCES kots(id),
  FOREIGN KEY (order_item_id) REFERENCES order_items(id)
);

-- Bills
CREATE TABLE bills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bill_number TEXT UNIQUE NOT NULL,
  order_id INTEGER NOT NULL,
  table_id INTEGER,
  subtotal REAL NOT NULL,
  service_charge REAL DEFAULT 0,
  service_charge_percent REAL DEFAULT 10,
  tax REAL DEFAULT 0,
  tax_percent REAL DEFAULT 13, -- VAT in Nepal
  discount_amount REAL DEFAULT 0,
  discount_type TEXT, -- 'amount', 'percentage'
  discount_reason TEXT,
  grand_total REAL NOT NULL,
  status TEXT DEFAULT 'unpaid', -- 'unpaid', 'paid', 'cancelled'
  cashier_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (table_id) REFERENCES tables(id),
  FOREIGN KEY (cashier_id) REFERENCES users(id)
);

-- Bill Payments (Support split payments)
CREATE TABLE bill_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bill_id INTEGER NOT NULL,
  payment_method TEXT NOT NULL, -- 'cash', 'card', 'qr', 'credit'
  amount REAL NOT NULL,
  reference_number TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bill_id) REFERENCES bills(id)
);

-- Ingredients (For inventory tracking)
CREATE TABLE ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  unit TEXT NOT NULL, -- 'kg', 'litre', 'piece'
  current_stock REAL DEFAULT 0,
  min_stock_level REAL DEFAULT 0,
  cost_per_unit REAL DEFAULT 0,
  supplier TEXT,
  last_purchased_at DATETIME,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Recipe Ingredients (Link menu items to ingredients)
CREATE TABLE recipe_ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  menu_item_id INTEGER NOT NULL,
  ingredient_id INTEGER NOT NULL,
  quantity_required REAL NOT NULL,
  unit TEXT NOT NULL,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

-- Sync Logs (Track all changes for syncing)
CREATE TABLE sync_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  record_id INTEGER NOT NULL,
  operation TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  data TEXT NOT NULL, -- JSON of the record
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  device_id TEXT,
  synced_to_cloud BOOLEAN DEFAULT 0,
  sync_attempted_at DATETIME,
  sync_error TEXT
);

-- Branches (For multi-location support)
CREATE TABLE branches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  branch_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Settings
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_bills_date ON bills(created_at);
CREATE INDEX idx_sync_logs_synced ON sync_logs(synced_to_cloud);
CREATE INDEX idx_tables_status ON tables(status);
```

---

## 5. SYNC ARCHITECTURE

### Conflict-Free Sync Algorithm

```javascript
/**
 * Hybrid Vector Clock + Last-Write-Wins (LWW) Strategy
 * 
 * Each device maintains:
 * 1. Local timestamp
 * 2. Vector clock (device_id → version)
 * 3. Change log with causality
 */

class SyncEngine {
  constructor(deviceId, branchId) {
    this.deviceId = deviceId;
    this.branchId = branchId;
    this.vectorClock = {}; // { device_id: version }
    this.changeLog = [];
    this.syncInterval = 5000; // 5 seconds when online
  }
  
  /**
   * Track every local change
   */
  async logChange(table, operation, data, recordId) {
    const change = {
      id: this.generateChangeId(),
      deviceId: this.deviceId,
      table,
      operation, // INSERT, UPDATE, DELETE
      recordId,
      data,
      timestamp: Date.now(),
      vectorClock: { ...this.vectorClock },
      hash: this.hashData(data)
    };
    
    // Increment local version
    this.vectorClock[this.deviceId] = 
      (this.vectorClock[this.deviceId] || 0) + 1;
    
    // Save to sync_logs
    await db.run(`
      INSERT INTO sync_logs 
      (table_name, record_id, operation, data, timestamp, device_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [table, recordId, operation, JSON.stringify(data), 
        change.timestamp, this.deviceId]);
    
    this.changeLog.push(change);
    
    // Trigger sync if online
    if (this.isOnline()) {
      this.scheduleSyncSoon();
    }
  }
  
  /**
   * Sync with local server (Wi-Fi mode)
   */
  async syncWithLocalServer() {
    try {
      const unsyncedChanges = await this.getUnsyncedChanges();
      
      // Send to local server
      const response = await fetch('http://192.168.1.100:3000/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: this.deviceId,
          changes: unsyncedChanges,
          vectorClock: this.vectorClock
        })
      });
      
      const { remoteChanges, conflicts } = await response.json();
      
      // Apply remote changes
      await this.applyRemoteChanges(remoteChanges);
      
      // Resolve conflicts
      await this.resolveConflicts(conflicts);
      
      // Mark as synced
      await this.markChangesSynced(unsyncedChanges.map(c => c.id));
      
    } catch (error) {
      console.error('Sync failed:', error);
      // Will retry automatically
    }
  }
  
  /**
   * Apply changes from other devices
   */
  async applyRemoteChanges(remoteChanges) {
    for (const change of remoteChanges) {
      // Check if we've already applied this change
      if (this.hasApplied(change)) continue;
      
      // Update vector clock
      this.vectorClock[change.deviceId] = Math.max(
        this.vectorClock[change.deviceId] || 0,
        change.vectorClock[change.deviceId]
      );
      
      // Apply the change
      switch (change.operation) {
        case 'INSERT':
          await this.applyInsert(change);
          break;
        case 'UPDATE':
          await this.applyUpdate(change);
          break;
        case 'DELETE':
          await this.applyDelete(change);
          break;
      }
    }
  }
  
  /**
   * Conflict Resolution Strategy
   * 
   * Rules:
   * 1. For orders: Merge non-conflicting fields
   * 2. For bills: Latest timestamp wins
   * 3. For menu: Admin device wins
   * 4. For inventory: Sum quantities
   */
  async resolveConflicts(conflicts) {
    for (const conflict of conflicts) {
      const { local, remote } = conflict;
      
      // Rule 1: Check device priority
      if (this.getDevicePriority(remote.deviceId) > 
          this.getDevicePriority(local.deviceId)) {
        await this.acceptRemoteVersion(remote);
        continue;
      }
      
      // Rule 2: Timestamp comparison
      if (remote.timestamp > local.timestamp) {
        await this.acceptRemoteVersion(remote);
        continue;
      }
      
      // Rule 3: Merge strategy for specific tables
      if (conflict.table === 'orders') {
        await this.mergeOrderChanges(local, remote);
      } else if (conflict.table === 'menu_items') {
        // Admin always wins for menu changes
        if (remote.deviceType === 'admin') {
          await this.acceptRemoteVersion(remote);
        }
      } else {
        // Default: Latest timestamp wins
        await this.acceptRemoteVersion(remote);
      }
    }
  }
  
  /**
   * Device priority for conflict resolution
   */
  getDevicePriority(deviceId) {
    const device = this.getDeviceInfo(deviceId);
    const priorities = {
      'admin': 100,
      'cashier': 50,
      'waiter': 30,
      'kitchen': 20
    };
    return priorities[device.type] || 0;
  }
  
  /**
   * Merge order changes intelligently
   */
  async mergeOrderChanges(local, remote) {
    const merged = {
      ...remote.data,
      // Keep items from both versions
      items: this.mergeOrderItems(
        local.data.items, 
        remote.data.items
      ),
      // Use latest status
      status: remote.timestamp > local.timestamp ? 
              remote.data.status : local.data.status
    };
    
    await this.applyMergedData(local.table, local.recordId, merged);
  }
  
  /**
   * Sync to cloud (when internet available)
   */
  async syncToCloud() {
    try {
      const allChanges = await this.getAllUnsyncedToCloud();
      
      const response = await fetch('https://api.yourpos.com/v1/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'X-Branch-ID': this.branchId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          branchId: this.branchId,
          deviceId: this.deviceId,
          changes: allChanges,
          vectorClock: this.vectorClock,
          lastCloudSync: await this.getLastCloudSyncTime()
        })
      });
      
      const result = await response.json();
      
      // Mark as synced to cloud
      await this.markCloudSynced(allChanges.map(c => c.id));
      
      // Update last sync time
      await this.setLastCloudSyncTime(Date.now());
      
    } catch (error) {
      console.error('Cloud sync failed:', error);
    }
  }
}
```

### Sync Flow Diagram

```
DEVICE A (Waiter)          LOCAL SERVER          DEVICE B (Kitchen)
     │                          │                        │
     │──(1) New Order ─────────►│                        │
     │                          │                        │
     │                          │──(2) Broadcast Order ─►│
     │                          │                        │
     │                          │◄─(3) Status Update ────│
     │                          │                        │
     │◄─(4) Notify Ready ───────│                        │
     │                          │                        │
     │                          │                        │
     │                     [When Online]                 │
     │                          │                        │
     │                          │──(5) Sync to Cloud ───►│
     │                          │                        │
     │                          │◄─(6) Pull Updates ─────│
     │                          │                        │
```

---

## 6. API ENDPOINTS

### Local Server Endpoints

```javascript
// Base URL: http://192.168.1.100:3000/api

/**
 * AUTHENTICATION
 */
POST   /api/auth/login          // PIN-based login
POST   /api/auth/logout
GET    /api/auth/verify          // Verify session

/**
 * ORDERS
 */
GET    /api/orders               // List all orders
GET    /api/orders/:id           // Get single order
POST   /api/orders               // Create new order
PUT    /api/orders/:id           // Update order
DELETE /api/orders/:id           // Cancel order
POST   /api/orders/:id/items     // Add items to order
DELETE /api/orders/:id/items/:itemId
PUT    /api/orders/:id/status    // Update status

/**
 * TABLES
 */
GET    /api/tables               // List all tables
GET    /api/tables/:id           // Get table details
PUT    /api/tables/:id/status    // Update table status
POST   /api/tables/:id/merge     // Merge tables
POST   /api/tables/:id/transfer  // Transfer table

/**
 * MENU
 */
GET    /api/menu                 // Get full menu
GET    /api/menu/categories
GET    /api/menu/items
GET    /api/menu/items/:id
POST   /api/menu/items           // Add menu item
PUT    /api/menu/items/:id
DELETE /api/menu/items/:id

/**
 * KOT (Kitchen)
 */
GET    /api/kots                 // List pending KOTs
POST   /api/kots                 // Create KOT
PUT    /api/kots/:id/status
POST   /api/kots/:id/print

/**
 * BILLING
 */
POST   /api/bills/generate       // Generate bill from order
GET    /api/bills/:id
POST   /api/bills/:id/pay
POST   /api/bills/:id/split
POST   /api/bills/:id/print

/**
 * SYNC
 */
POST   /api/sync                 // Sync changes
GET    /api/sync/status
POST   /api/sync/resolve-conflict

/**
 * ANALYTICS
 */
GET    /api/analytics/sales
GET    /api/analytics/items
GET    /api/analytics/performance

/**
 * ADMIN
 */
GET    /api/admin/users
POST   /api/admin/users
GET    /api/admin/devices
GET    /api/admin/settings
PUT    /api/admin/settings
```

### Cloud API Endpoints

```javascript
// Base URL: https://api.yourpos.com/v1

/**
 * MULTI-BRANCH SYNC
 */
POST   /v1/sync                  // Sync branch data
GET    /v1/sync/conflicts
POST   /v1/sync/resolve

/**
 * CLOUD DASHBOARD
 */
GET    /v1/dashboard/overview
GET    /v1/dashboard/branches
GET    /v1/dashboard/analytics

/**
 * BACKUP & RESTORE
 */
POST   /v1/backup/create
GET    /v1/backup/list
POST   /v1/backup/restore

/**
 * AI INSIGHTS
 */
GET    /v1/ai/predictions
GET    /v1/ai/recommendations
POST   /v1/ai/analyze
```

---

## 7. UI/UX FLOWS

### Waiter Flow
```
[Login with PIN]
     ↓
[View Table Layout]
     ↓
[Select Table] ──────► [View Existing Order] ──► [Modify Order]
     ↓                        ↓
[Browse Menu]                 ↓
     ↓                        ↓
[Add Items + Quantity]        ↓
     ↓                        ↓
[Add Special Instructions]    ↓
     ↓                        ↓
[Review Order]                ↓
     ↓                        ↓
[Submit to Kitchen] ◄─────────┘
     ↓
[Receive Notification: Food Ready]
     ↓
[Serve to Table]
```

### Kitchen Flow
```
[View Pending Orders]
     ↓
[Select Order/KOT]
     ↓
[Start Cooking] ──► [Timer Starts]
     ↓                   ↓
[Monitor Progress]       ↓
     ↓                   ↓
[Mark as Ready] ────────┘
     ↓
[Notify Waiter]
     ↓
[Order Removed from Queue]
```

### Cashier Flow
```
[View Active Tables/Orders]
     ↓
[Select Table/Order]
     ↓
[Review Order Items]
     ↓
[Apply Discount?] ──► Yes ──► [Enter Discount]
     │                              ↓
     No ◄──────────────────────────┘
     ↓
[Calculate Total]
     ↓
[Select Payment Method]
     ↓
[Process Payment]
     ↓
[Print Receipt]
     ↓
[Mark Table as Available]
```

---

## 8. HARDWARE INTEGRATION

### Thermal Printer Integration
```javascript
// Using escpos library
const escpos = require('escpos');
const device = new escpos.USB();

const printReceipt = async (bill) => {
  const printer = new escpos.Printer(device);
  
  device.open(function() {
    printer
      .font('a')
      .align('ct')
      .style('bu')
      .size(2, 2)
      .text('RESTAURANT NAME')
      .size(1, 1)
      .text('Address Line 1')
      .text('Phone: 01-XXXXXXX')
      .text('--------------------------------')
      .align('lt')
      .text(`Bill No: ${bill.bill_number}`)
      .text(`Date: ${formatDate(bill.created_at)}`)
      .text(`Table: ${bill.table_number}`)
      .text(`Waiter: ${bill.waiter_name}`)
      .text('--------------------------------')
      .text('ITEM              QTY    AMOUNT')
      .text('--------------------------------');
    
    bill.items.forEach(item => {
      const line = `${item.name.padEnd(16)} ${item.quantity.toString().padEnd(6)} ${item.total}`;
      printer.text(line);
    });
    
    printer
      .text('--------------------------------')
      .text(`Subtotal:          Rs ${bill.subtotal}`)
      .text(`Service Charge:    Rs ${bill.service_charge}`)
      .text(`VAT:               Rs ${bill.vat}`)
      .text('--------------------------------')
      .style('bu')
      .size(2, 2)
      .text(`TOTAL:         Rs ${bill.grand_total}`)
      .size(1, 1)
      .style('normal')
      .text('--------------------------------')
      .align('ct')
      .text('Thank You!')
      .text('Visit Again')
      .feed(3)
      .cut()
      .close();
  });
};
```

### Barcode Scanner Integration
```javascript
// Listen for barcode scan events
document.addEventListener('keypress', function(e) {
  if (e.key === 'Enter' && barcodeScanBuffer.length > 0) {
    const barcode = barcodeScanBuffer.join('');
    handleBarcodeScanned(barcode);
    barcodeScanBuffer = [];
  } else {
    barcodeScanBuffer.push(e.key);
  }
});

const handleBarcodeScanned = async (barcode) => {
  const item = await db.menu_items
    .where('item_code')
    .equals(barcode)
    .first();
  
  if (item) {
    addToOrder(item);
  } else {
    showError('Item not found');
  }
};
```

---

## 9. AI FEATURES

### Sales Prediction Model
```python
# Cloud-based AI service (FastAPI)
from fastapi import FastAPI
from sklearn.ensemble import RandomForestRegressor
import pandas as pd

app = FastAPI()

@app.post("/ai/predict-sales")
async def predict_sales(data: dict):
    # Load historical data
    df = load_sales_data(data['branch_id'])
    
    # Feature engineering
    df['day_of_week'] = pd.to_datetime(df['date']).dt.dayofweek
    df['month'] = pd.to_datetime(df['date']).dt.month
    df['is_weekend'] = df['day_of_week'].isin([5, 6])
    
    # Train model
    model = RandomForestRegressor()
    X = df[['day_of_week', 'month', 'is_weekend', 'weather']]
    y = df['total_sales']
    model.fit(X, y)
    
    # Predict next 7 days
    predictions = model.predict(future_features)
    
    return {
        'predictions': predictions.tolist(),
        'confidence': model.score(X, y)
    }
```

### Smart Inventory Alerts
```javascript
// Client-side AI using TensorFlow.js
const predictIngredientUsage = async (ingredientId) => {
  const history = await getIngredientUsageHistory(ingredientId, 30);
  
  const model = tf.sequential({
    layers: [
      tf.layers.dense({ units: 64, activation: 'relu', inputShape: [7] }),
      tf.layers.dense({ units: 32, activation: 'relu' }),
      tf.layers.dense({ units: 1 })
    ]
  });
  
  model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
  
  // Train on historical data
  const xs = tf.tensor2d(history.map(h => h.features));
  const ys = tf.tensor2d(history.map(h => [h.usage]));
  
  await model.fit(xs, ys, { epochs: 50 });
  
  // Predict next week
  const prediction = model.predict(tf.tensor2d([getCurrentFeatures()]));
  
  return prediction.dataSync()[0];
};
```

---

## 10. SECURITY & ROLES

### Role-Based Access Control
```javascript
const permissions = {
  admin: [
    'menu.create', 'menu.edit', 'menu.delete',
    'users.create', 'users.edit', 'users.delete',
    'reports.view', 'reports.export',
    'settings.edit', 'backup.create'
  ],
  cashier: [
    'bills.create', 'bills.view', 'bills.print',
    'orders.view', 'payments.process',
    'reports.view'
  ],
  waiter: [
    'orders.create', 'orders.view', 'orders.edit',
    'tables.view', 'tables.update',
    'menu.view'
  ],
  kitchen: [
    'kots.view', 'kots.update',
    'orders.view'
  ]
};

const checkPermission = (user, permission) => {
  return permissions[user.role]?.includes(permission);
};
```

---

## 11. IMPLEMENTATION ROADMAP

### Phase 1: Core POS (4 weeks)
- ✅ Basic order taking
- ✅ Menu management
- ✅ Billing system
- ✅ Local SQLite setup
- ✅ Waiter & Cashier UI

### Phase 2: Kitchen & Real-time (3 weeks)
- ✅ KDS implementation
- ✅ WebSocket integration
- ✅ Real-time order sync
- ✅ Table management

### Phase 3: Offline Mode (3 weeks)
- ✅ IndexedDB integration
- ✅ Offline sync queue
- ✅ Conflict resolution
- ✅ PWA setup

### Phase 4: Cloud Sync (4 weeks)
- ✅ Cloud database setup
- ✅ Multi-branch support
- ✅ Automated backup
- ✅ Cloud dashboard

### Phase 5: Hardware & AI (4 weeks)
- ✅ Printer integration
- ✅ Barcode scanner
- ✅ AI analytics
- ✅ Predictions

### Phase 6: Testing & Deployment (2 weeks)
- ✅ Load testing
- ✅ Security audit
- ✅ User training
- ✅ Go-live

---

## 📱 SCREENSHOTS & WIREFRAMES

[To be created using Figma - Will provide links]

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Set up local server device
- [ ] Configure Wi-Fi router
- [ ] Install on all devices
- [ ] Configure printers
- [ ] Import menu
- [ ] Create user accounts
- [ ] Train staff
- [ ] Test offline mode
- [ ] Test cloud sync
- [ ] Monitor first week

---

**Document Version:** 1.0  
**Last Updated:** December 1, 2025  
**Contact:** [Your Contact Info]
