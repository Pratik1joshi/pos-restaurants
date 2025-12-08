# 🗄️ Database Schema - Complete Reference

## Entity Relationship Diagram

```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ PK id           │
│    username     │
│    pin          │
│    full_name    │
│    role         │───────┐
│    email        │       │
│    phone        │       │
└─────────────────┘       │
         │                │
         │                │
         │                │
┌─────────┴────────┐      │
│    DEVICES       │      │
├──────────────────┤      │
│ PK id            │      │
│ FK user_id       │◄─────┘
│    device_id     │
│    device_type   │
│    ip_address    │
└──────────────────┘

┌──────────────────┐         ┌─────────────────────┐
│     TABLES       │         │   MENU_CATEGORIES   │
├──────────────────┤         ├─────────────────────┤
│ PK id            │         │ PK id               │
│    table_number  │         │    name             │
│    floor         │         │    display_order    │
│    section       │         │    icon             │
│    capacity      │         └─────────────────────┘
│    status        │                    │
│ FK current_order │                    │
│ FK waiter_id     │                    │
└──────────────────┘                    │
         │                              │
         │                              │
         │                              ▼
         │                    ┌─────────────────────┐
         │                    │    MENU_ITEMS       │
         │                    ├─────────────────────┤
         │                    │ PK id               │
         │                    │ FK category_id      │◄────┐
         │                    │    item_code        │     │
         │                    │    name             │     │
         │                    │    description      │     │
         │                    │    base_price       │     │
         │                    │    preparation_time │     │
         │                    │    is_vegetarian    │     │
         │                    │    is_available     │     │
         │                    └─────────────────────┘     │
         │                              │                 │
         │                              │                 │
         │                              ▼                 │
         │                    ┌─────────────────────┐     │
         │                    │ MENU_ITEM_VARIANTS  │     │
         │                    ├─────────────────────┤     │
         │                    │ PK id               │     │
         │                    │ FK menu_item_id     │─────┘
         │                    │    variant_name     │
         │                    │    price_modifier   │
         │                    └─────────────────────┘
         │
         │
         ▼
┌──────────────────┐
│     ORDERS       │◄───────────┐
├──────────────────┤            │
│ PK id            │            │
│ FK table_id      │            │
│ FK waiter_id     │            │
│    order_number  │            │
│    order_type    │            │
│    status        │            │
│    customer_name │            │
│    notes         │            │
└──────────────────┘            │
         │                      │
         │                      │
         │                      │
         ▼                      │
┌──────────────────┐            │
│  ORDER_ITEMS     │            │
├──────────────────┤            │
│ PK id            │            │
│ FK order_id      │────────────┘
│ FK menu_item_id  │
│ FK variant_id    │
│    quantity      │
│    unit_price    │
│    subtotal      │
│    special_instr │
│    status        │
└──────────────────┘
         │
         │
         ▼
┌──────────────────┐
│      KOTS        │
├──────────────────┤
│ PK id            │
│ FK order_id      │
│    kot_number    │
│    station       │
│    status        │
│    printed_at    │
└──────────────────┘
         │
         │
         ▼
┌──────────────────┐
│   KOT_ITEMS      │
├──────────────────┤
│ PK id            │
│ FK kot_id        │
│ FK order_item_id │
│    quantity      │
│    status        │
└──────────────────┘

┌──────────────────┐
│      BILLS       │
├──────────────────┤
│ PK id            │
│ FK order_id      │
│ FK table_id      │
│ FK cashier_id    │
│    bill_number   │
│    subtotal      │
│    service_charge│
│    tax           │
│    discount      │
│    grand_total   │
│    status        │
└──────────────────┘
         │
         │
         ▼
┌──────────────────┐
│ BILL_PAYMENTS    │
├──────────────────┤
│ PK id            │
│ FK bill_id       │
│    payment_method│
│    amount        │
│    reference_no  │
└──────────────────┘

┌──────────────────┐         ┌─────────────────────┐
│   INGREDIENTS    │         │  RECIPE_INGREDIENTS │
├──────────────────┤         ├─────────────────────┤
│ PK id            │◄────────│ PK id               │
│    name          │         │ FK menu_item_id     │
│    unit          │         │ FK ingredient_id    │
│    current_stock │         │    quantity_required│
│    min_stock     │         └─────────────────────┘
│    cost_per_unit │
└──────────────────┘

┌──────────────────┐
│   SYNC_LOGS      │
├──────────────────┤
│ PK id            │
│    table_name    │
│    record_id     │
│    operation     │
│    data          │
│    timestamp     │
│    device_id     │
│    synced        │
└──────────────────┘

┌──────────────────┐
│    BRANCHES      │
├──────────────────┤
│ PK id            │
│    branch_code   │
│    name          │
│    address       │
│    is_active     │
└──────────────────┘
```

---

## Table Details with Constraints

### USERS
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  pin TEXT NOT NULL CHECK(length(pin) >= 4 AND length(pin) <= 6),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'cashier', 'waiter', 'kitchen')),
  email TEXT UNIQUE,
  phone TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Triggers
CREATE TRIGGER update_users_timestamp 
AFTER UPDATE ON users
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
```

### TABLES
```sql
CREATE TABLE tables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_number TEXT UNIQUE NOT NULL,
  floor TEXT DEFAULT 'Ground' CHECK(floor IN ('Ground', 'First', 'Second', 'Rooftop')),
  section TEXT,
  capacity INTEGER DEFAULT 4 CHECK(capacity > 0 AND capacity <= 20),
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  status TEXT DEFAULT 'available' 
    CHECK(status IN ('available', 'occupied', 'reserved', 'cleaning')),
  current_order_id INTEGER,
  waiter_id INTEGER,
  occupied_at DATETIME,
  FOREIGN KEY (current_order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (waiter_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_tables_status ON tables(status);
CREATE INDEX idx_tables_floor_section ON tables(floor, section);
CREATE INDEX idx_tables_waiter ON tables(waiter_id);

-- Business rule: Can't assign table to non-waiter
CREATE TRIGGER check_waiter_role
BEFORE UPDATE ON tables
WHEN NEW.waiter_id IS NOT NULL
BEGIN
  SELECT RAISE(ABORT, 'Invalid waiter: User is not a waiter')
  WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE id = NEW.waiter_id AND role = 'waiter'
  );
END;
```

### MENU_CATEGORIES
```sql
CREATE TABLE menu_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  icon TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_categories_order ON menu_categories(display_order);

-- Sample Data
INSERT INTO menu_categories (name, display_order, icon) VALUES
  ('Starters', 1, '🥗'),
  ('Soups', 2, '🍲'),
  ('Main Course', 3, '🍛'),
  ('Breads', 4, '🍞'),
  ('Rice & Noodles', 5, '🍜'),
  ('Desserts', 6, '🍰'),
  ('Beverages', 7, '☕'),
  ('Specials', 8, '⭐');
```

### MENU_ITEMS
```sql
CREATE TABLE menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_id INTEGER NOT NULL,
  base_price REAL NOT NULL CHECK(base_price > 0),
  image_url TEXT,
  preparation_time INTEGER DEFAULT 15 CHECK(preparation_time > 0),
  is_vegetarian BOOLEAN DEFAULT 0,
  is_vegan BOOLEAN DEFAULT 0,
  is_spicy BOOLEAN DEFAULT 0,
  spice_level INTEGER DEFAULT 0 CHECK(spice_level BETWEEN 0 AND 5),
  is_available BOOLEAN DEFAULT 1,
  tags TEXT, -- JSON array: ["popular", "chef-special"]
  allergens TEXT, -- JSON array: ["nuts", "dairy"]
  calories INTEGER,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE RESTRICT
);

-- Indexes
CREATE INDEX idx_menuitems_category ON menu_items(category_id);
CREATE INDEX idx_menuitems_available ON menu_items(is_available);
CREATE INDEX idx_menuitems_code ON menu_items(item_code);
CREATE UNIQUE INDEX idx_menuitems_name_category ON menu_items(name, category_id);

-- Full-text search
CREATE VIRTUAL TABLE menu_items_fts USING fts5(
  name, description, tags,
  content='menu_items',
  content_rowid='id'
);

-- Triggers
CREATE TRIGGER update_menuitems_timestamp 
AFTER UPDATE ON menu_items
BEGIN
  UPDATE menu_items SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER menu_items_fts_insert 
AFTER INSERT ON menu_items
BEGIN
  INSERT INTO menu_items_fts(rowid, name, description, tags)
  VALUES (NEW.id, NEW.name, NEW.description, NEW.tags);
END;
```

### ORDERS
```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT UNIQUE NOT NULL,
  table_id INTEGER,
  waiter_id INTEGER,
  order_type TEXT DEFAULT 'dine-in' 
    CHECK(order_type IN ('dine-in', 'takeaway', 'delivery')),
  customer_name TEXT,
  customer_phone TEXT,
  status TEXT DEFAULT 'pending' 
    CHECK(status IN ('pending', 'preparing', 'ready', 'served', 'cancelled')),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME,
  ready_at DATETIME,
  served_at DATETIME,
  cancelled_at DATETIME,
  cancel_reason TEXT,
  synced BOOLEAN DEFAULT 0,
  sync_version INTEGER DEFAULT 1,
  FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE SET NULL,
  FOREIGN KEY (waiter_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_table ON orders(table_id);
CREATE INDEX idx_orders_waiter ON orders(waiter_id);
CREATE INDEX idx_orders_synced ON orders(synced);

-- Auto-generate order number
CREATE TRIGGER generate_order_number
AFTER INSERT ON orders
WHEN NEW.order_number IS NULL
BEGIN
  UPDATE orders 
  SET order_number = 'ORD-' || strftime('%Y%m%d', 'now') || '-' || 
      printf('%05d', NEW.id)
  WHERE id = NEW.id;
END;

-- Update table status when order is created
CREATE TRIGGER order_created_update_table
AFTER INSERT ON orders
WHEN NEW.table_id IS NOT NULL AND NEW.order_type = 'dine-in'
BEGIN
  UPDATE tables 
  SET status = 'occupied', 
      current_order_id = NEW.id,
      occupied_at = CURRENT_TIMESTAMP
  WHERE id = NEW.table_id;
END;

-- Clear table when order is served/cancelled
CREATE TRIGGER order_completed_clear_table
AFTER UPDATE ON orders
WHEN NEW.status IN ('served', 'cancelled') AND OLD.table_id IS NOT NULL
BEGIN
  UPDATE tables 
  SET status = 'available', 
      current_order_id = NULL,
      occupied_at = NULL
  WHERE id = OLD.table_id;
END;
```

### ORDER_ITEMS
```sql
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  menu_item_id INTEGER NOT NULL,
  variant_id INTEGER,
  quantity INTEGER DEFAULT 1 CHECK(quantity > 0),
  unit_price REAL NOT NULL CHECK(unit_price > 0),
  subtotal REAL NOT NULL CHECK(subtotal > 0),
  special_instructions TEXT,
  status TEXT DEFAULT 'pending'
    CHECK(status IN ('pending', 'preparing', 'ready', 'served')),
  kot_printed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT,
  FOREIGN KEY (variant_id) REFERENCES menu_item_variants(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_orderitems_order ON order_items(order_id);
CREATE INDEX idx_orderitems_menuitem ON order_items(menu_item_id);
CREATE INDEX idx_orderitems_status ON order_items(status);

-- Auto-calculate subtotal
CREATE TRIGGER calculate_order_item_subtotal
BEFORE INSERT ON order_items
BEGIN
  UPDATE NEW SET subtotal = NEW.quantity * NEW.unit_price;
END;

-- Log change for sync
CREATE TRIGGER order_items_sync_log
AFTER INSERT ON order_items
BEGIN
  INSERT INTO sync_logs (table_name, record_id, operation, data)
  VALUES ('order_items', NEW.id, 'INSERT', json_object(
    'id', NEW.id,
    'order_id', NEW.order_id,
    'menu_item_id', NEW.menu_item_id,
    'quantity', NEW.quantity,
    'unit_price', NEW.unit_price
  ));
END;
```

### KOTS (Kitchen Order Tickets)
```sql
CREATE TABLE kots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kot_number TEXT UNIQUE NOT NULL,
  order_id INTEGER NOT NULL,
  station TEXT CHECK(station IN ('grill', 'chinese', 'bar', 'dessert', 'main', 'all')),
  status TEXT DEFAULT 'pending'
    CHECK(status IN ('pending', 'preparing', 'ready', 'served')),
  printed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME,
  completed_at DATETIME,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_kots_status ON kots(status);
CREATE INDEX idx_kots_station ON kots(station);
CREATE INDEX idx_kots_printed ON kots(printed_at DESC);

-- Auto-generate KOT number
CREATE TRIGGER generate_kot_number
AFTER INSERT ON kots
WHEN NEW.kot_number IS NULL
BEGIN
  UPDATE kots 
  SET kot_number = 'KOT-' || strftime('%Y%m%d%H%M', 'now') || '-' || 
      printf('%04d', NEW.id)
  WHERE id = NEW.id;
END;
```

### BILLS
```sql
CREATE TABLE bills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bill_number TEXT UNIQUE NOT NULL,
  order_id INTEGER NOT NULL,
  table_id INTEGER,
  subtotal REAL NOT NULL CHECK(subtotal >= 0),
  service_charge REAL DEFAULT 0 CHECK(service_charge >= 0),
  service_charge_percent REAL DEFAULT 10,
  tax REAL DEFAULT 0 CHECK(tax >= 0),
  tax_percent REAL DEFAULT 13, -- VAT in Nepal
  discount_amount REAL DEFAULT 0 CHECK(discount_amount >= 0),
  discount_type TEXT CHECK(discount_type IN ('amount', 'percentage', NULL)),
  discount_reason TEXT,
  grand_total REAL NOT NULL CHECK(grand_total >= 0),
  status TEXT DEFAULT 'unpaid' CHECK(status IN ('unpaid', 'paid', 'cancelled')),
  cashier_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
  FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE SET NULL,
  FOREIGN KEY (cashier_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_created ON bills(created_at DESC);
CREATE INDEX idx_bills_cashier ON bills(cashier_id);

-- Auto-calculate totals
CREATE TRIGGER calculate_bill_totals
BEFORE INSERT ON bills
BEGIN
  UPDATE NEW SET
    service_charge = NEW.subtotal * (NEW.service_charge_percent / 100),
    tax = (NEW.subtotal + NEW.service_charge) * (NEW.tax_percent / 100),
    grand_total = NEW.subtotal + 
                  (NEW.subtotal * NEW.service_charge_percent / 100) +
                  ((NEW.subtotal + NEW.subtotal * NEW.service_charge_percent / 100) * 
                   NEW.tax_percent / 100) - 
                  NEW.discount_amount;
END;

-- Generate bill number
CREATE TRIGGER generate_bill_number
AFTER INSERT ON bills
WHEN NEW.bill_number IS NULL
BEGIN
  UPDATE bills 
  SET bill_number = 'BILL-' || strftime('%Y%m%d', 'now') || '-' || 
      printf('%05d', NEW.id)
  WHERE id = NEW.id;
END;
```

### SYNC_LOGS
```sql
CREATE TABLE sync_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  record_id INTEGER NOT NULL,
  operation TEXT NOT NULL CHECK(operation IN ('INSERT', 'UPDATE', 'DELETE')),
  data TEXT NOT NULL, -- JSON
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  device_id TEXT,
  synced_to_local BOOLEAN DEFAULT 0,
  synced_to_cloud BOOLEAN DEFAULT 0,
  sync_attempted_at DATETIME,
  sync_error TEXT,
  vector_clock TEXT -- JSON object
);

-- Indexes
CREATE INDEX idx_synclogs_synced_local ON sync_logs(synced_to_local);
CREATE INDEX idx_synclogs_synced_cloud ON sync_logs(synced_to_cloud);
CREATE INDEX idx_synclogs_timestamp ON sync_logs(timestamp);
CREATE INDEX idx_synclogs_table_record ON sync_logs(table_name, record_id);

-- Auto-purge old synced logs (keep 30 days)
CREATE TRIGGER purge_old_sync_logs
AFTER INSERT ON sync_logs
BEGIN
  DELETE FROM sync_logs
  WHERE synced_to_cloud = 1 
    AND timestamp < datetime('now', '-30 days');
END;
```

---

## Sample Data Generation

```sql
-- Sample users
INSERT INTO users (username, pin, full_name, role, phone) VALUES
  ('admin', '123456', 'System Admin', 'admin', '9801234567'),
  ('john', '1234', 'John Sharma', 'waiter', '9801234568'),
  ('ram', '4567', 'Ram Thapa', 'waiter', '9801234569'),
  ('sita', '7890', 'Sita Gurung', 'cashier', '9801234570'),
  ('chef', '1111', 'Chef Kumar', 'kitchen', '9801234571');

-- Sample tables
INSERT INTO tables (table_number, floor, section, capacity, position_x, position_y) VALUES
  ('T-01', 'Ground', 'Window', 2, 100, 100),
  ('T-02', 'Ground', 'Window', 2, 200, 100),
  ('T-03', 'Ground', 'Center', 4, 300, 200),
  ('T-04', 'Ground', 'Center', 4, 400, 200),
  ('T-05', 'Ground', 'Corner', 6, 500, 300),
  ('T-06', 'First', 'Terrace', 8, 100, 100);

-- Sample menu categories (already inserted above)

-- Sample menu items
INSERT INTO menu_items (item_code, name, description, category_id, base_price, preparation_time, is_vegetarian, is_spicy, spice_level) VALUES
  ('ITM001', 'Chicken Tikka', 'Grilled chicken marinated in spices', 1, 450, 20, 0, 1, 3),
  ('ITM002', 'Paneer Tikka', 'Cottage cheese cubes with tandoori masala', 1, 380, 15, 1, 1, 2),
  ('ITM003', 'Veg Momos', 'Steamed dumplings with mixed vegetables', 1, 180, 15, 1, 0, 0),
  ('ITM004', 'Chicken Momos', 'Steamed dumplings with minced chicken', 1, 220, 15, 0, 0, 0),
  ('ITM005', 'Chicken Soup', 'Hot and sour chicken soup', 2, 250, 10, 0, 1, 1),
  ('ITM006', 'Butter Chicken', 'Creamy tomato-based chicken curry', 3, 520, 25, 0, 0, 1),
  ('ITM007', 'Dal Makhni', 'Black lentils in creamy gravy', 3, 320, 20, 1, 0, 0),
  ('ITM008', 'Paneer Butter Masala', 'Cottage cheese in rich tomato gravy', 3, 420, 20, 1, 0, 1),
  ('ITM009', 'Naan', 'Leavened flatbread', 4, 45, 5, 1, 0, 0),
  ('ITM010', 'Garlic Naan', 'Naan with garlic topping', 4, 60, 5, 1, 0, 0),
  ('ITM011', 'Veg Fried Rice', 'Stir-fried rice with vegetables', 5, 280, 15, 1, 0, 0),
  ('ITM012', 'Chicken Chowmein', 'Stir-fried noodles with chicken', 5, 320, 15, 0, 1, 2),
  ('ITM013', 'Gulab Jamun', 'Deep-fried milk balls in sugar syrup', 6, 120, 5, 1, 0, 0),
  ('ITM014', 'Lassi', 'Yogurt-based drink', 7, 80, 3, 1, 0, 0),
  ('ITM015', 'Masala Tea', 'Spiced milk tea', 7, 50, 3, 1, 0, 0);

-- Sample variants
INSERT INTO menu_item_variants (menu_item_id, variant_name, price_modifier, is_default) VALUES
  (14, 'Small', -20, 1),
  (14, 'Large', 20, 0),
  (15, 'Small', 0, 1),
  (15, 'Large', 20, 0);

-- Settings
INSERT INTO settings (key, value, description) VALUES
  ('business_name', 'Himalayan Restaurant', 'Restaurant name'),
  ('address', 'Thamel, Kathmandu', 'Business address'),
  ('phone', '01-4123456', 'Contact number'),
  ('tax_rate', '13', 'VAT percentage'),
  ('service_charge', '10', 'Service charge percentage'),
  ('currency', 'NPR', 'Currency code'),
  ('receipt_footer', 'Thank you! Visit again', 'Receipt footer message');
```

---

## Data Migration Scripts

### From old product-based schema to restaurant schema
```sql
-- Migrate products to menu_items
INSERT INTO menu_items (
  item_code, name, description, category_id, base_price, is_available
)
SELECT 
  item_code,
  name,
  description,
  1 as category_id, -- Default to first category
  price as base_price,
  is_available
FROM products;

-- Migrate transactions to orders
INSERT INTO orders (
  order_number, order_type, status, created_at
)
SELECT
  'ORD-' || id as order_number,
  'takeaway' as order_type,
  'served' as status,
  created_at
FROM transactions;
```

---

## Backup & Restore

### Backup Script
```javascript
const backup = async () => {
  const db = new Database('pos_local.db');
  
  const tables = [
    'users', 'tables', 'menu_categories', 'menu_items',
    'orders', 'order_items', 'bills', 'bill_payments'
  ];
  
  const backupData = {};
  
  for (const table of tables) {
    backupData[table] = db.prepare(`SELECT * FROM ${table}`).all();
  }
  
  const filename = `backup_${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(backupData, null, 2));
  
  return filename;
};
```

### Restore Script
```javascript
const restore = async (backupFile) => {
  const db = new Database('pos_local.db');
  const data = JSON.parse(fs.readFileSync(backupFile));
  
  db.exec('BEGIN TRANSACTION');
  
  try {
    for (const [table, rows] of Object.entries(data)) {
      // Clear existing data
      db.prepare(`DELETE FROM ${table}`).run();
      
      // Insert backup data
      for (const row of rows) {
        const columns = Object.keys(row).join(', ');
        const placeholders = Object.keys(row).map(() => '?').join(', ');
        const values = Object.values(row);
        
        db.prepare(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`)
          .run(values);
      }
    }
    
    db.exec('COMMIT');
    console.log('Restore completed successfully');
  } catch (error) {
    db.exec('ROLLBACK');
    console.error('Restore failed:', error);
  }
};
```

---

## Performance Optimization

### Query Optimization Tips
```sql
-- Use EXPLAIN QUERY PLAN to analyze queries
EXPLAIN QUERY PLAN
SELECT o.*, oi.* 
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.status = 'pending'
ORDER BY o.created_at DESC;

-- Add composite indexes for common queries
CREATE INDEX idx_orders_status_created 
ON orders(status, created_at DESC);

-- Use covering indexes
CREATE INDEX idx_menuitems_lookup 
ON menu_items(item_code, name, base_price, is_available);

-- Partial indexes for specific conditions
CREATE INDEX idx_active_tables 
ON tables(table_number) 
WHERE status = 'available';
```

---

## Data Integrity Checks

```sql
-- Check for orders without items
SELECT o.* 
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE oi.id IS NULL AND o.status != 'cancelled';

-- Check for bills with mismatched totals
SELECT b.*,
  (SELECT SUM(subtotal) FROM order_items WHERE order_id = b.order_id) as calculated_subtotal
FROM bills b
WHERE ABS(b.subtotal - calculated_subtotal) > 0.01;

-- Check for orphaned records
SELECT * FROM order_items
WHERE order_id NOT IN (SELECT id FROM orders);

-- Check table consistency
SELECT * FROM tables
WHERE status = 'occupied' AND current_order_id IS NULL;
```

---

**Document Version:** 1.0  
**Last Updated:** December 1, 2025
