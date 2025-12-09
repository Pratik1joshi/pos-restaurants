import BetterSqlite3 from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Initializing Restaurant POS Database...\n');

const dbPath = path.join(process.cwd(), 'pos_restaurant.db');
const db = new BetterSqlite3(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Read and execute schema
const schemaPath = path.join(process.cwd(), 'lib', 'db', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

console.log('📋 Creating database schema...');
db.exec(schema);
console.log('✓ Schema created successfully\n');

// Seed initial data
console.log('🌱 Seeding initial data...\n');

// Create admin user
console.log('👤 Creating admin user...');
db.prepare(`
  INSERT OR IGNORE INTO users (username, pin, full_name, role, email)
  VALUES ('admin', '1234', 'Administrator', 'admin', 'admin@restaurant.com')
`).run();
console.log('✓ Admin user created (username: admin, pin: 1234)\n');

// Create sample menu categories
console.log('📂 Creating menu categories...');
const categories = [
  'Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Specials'
];
categories.forEach(cat => {
  db.prepare(`INSERT OR IGNORE INTO menu_categories (name) VALUES (?)`).run(cat);
});
console.log(`✓ Created ${categories.length} categories\n`);

// Create sample menu items
console.log('🍽️  Creating menu items...');
const menuItems = [
  { code: 'APP001', name: 'Spring Rolls', category: 'Appetizers', price: 250 },
  { code: 'APP002', name: 'Chicken Wings', category: 'Appetizers', price: 350 },
  { code: 'MAIN001', name: 'Chicken Momo', category: 'Main Course', price: 180 },
  { code: 'MAIN002', name: 'Veg Momo', category: 'Main Course', price: 150 },
  { code: 'MAIN003', name: 'Chicken Chowmein', category: 'Main Course', price: 200 },
  { code: 'MAIN004', name: 'Veg Chowmein', category: 'Main Course', price: 180 },
  { code: 'MAIN005', name: 'Dal Bhat', category: 'Main Course', price: 250 },
  { code: 'DES001', name: 'Ice Cream', category: 'Desserts', price: 100 },
  { code: 'DES002', name: 'Gulab Jamun', category: 'Desserts', price: 80 },
  { code: 'BEV001', name: 'Soft Drink', category: 'Beverages', price: 50 },
  { code: 'BEV002', name: 'Fresh Juice', category: 'Beverages', price: 120 },
  { code: 'BEV003', name: 'Tea', category: 'Beverages', price: 30 },
  { code: 'BEV004', name: 'Coffee', category: 'Beverages', price: 60 },
];

menuItems.forEach(item => {
  const catId = db.prepare('SELECT id FROM menu_categories WHERE name = ?').get(item.category)?.id;
  if (catId) {
    db.prepare(`
      INSERT OR IGNORE INTO menu_items (item_code, name, category_id, base_price)
      VALUES (?, ?, ?, ?)
    `).run(item.code, item.name, catId, item.price);
  }
});
console.log(`✓ Created ${menuItems.length} menu items\n`);

// Create sample tables
console.log('🪑 Creating tables...');
const tables = [
  { number: 'T1', type: 'regular', floor: 'Ground', capacity: 4 },
  { number: 'T2', type: 'regular', floor: 'Ground', capacity: 4 },
  { number: 'T3', type: 'regular', floor: 'Ground', capacity: 6 },
  { number: 'T4', type: 'vip', floor: 'First', capacity: 8, section: 'VIP-A' },
  { number: 'T5', type: 'vip', floor: 'First', capacity: 6, section: 'VIP-A' },
  { number: 'T6', type: 'outdoor', floor: 'Rooftop', capacity: 4 },
  { number: 'T7', type: 'outdoor', floor: 'Rooftop', capacity: 4 },
  { number: 'T8', type: 'event', floor: 'Second', capacity: 20, section: 'Hall' },
];

tables.forEach(t => {
  db.prepare(`
    INSERT OR IGNORE INTO tables (table_number, table_type, floor, section, capacity, min_capacity)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(t.number, t.type, t.floor, t.section || null, t.capacity, Math.max(1, Math.floor(t.capacity / 2)));
});
console.log(`✓ Created ${tables.length} tables\n`);

db.close();

console.log('✅ Database initialization complete!');
console.log('\n📝 Login credentials:');
console.log('   Username: admin');
console.log('   PIN: 1234');
console.log('\n🎉 You can now start the application with: npm run dev\n');
