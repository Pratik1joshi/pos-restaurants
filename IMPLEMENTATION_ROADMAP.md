# 🚀 Implementation Roadmap & Technical Guide

## Complete Development Plan for Hybrid POS System

---

## 📅 PROJECT TIMELINE

### Total Duration: **20 Weeks** (5 Months)

```
PHASE 1: Foundation (Week 1-4)        ████████░░░░░░░░░░░░  20%
PHASE 2: Core Features (Week 5-8)     ████████░░░░░░░░░░░░  40%
PHASE 3: Advanced (Week 9-12)         ████████░░░░░░░░░░░░  60%
PHASE 4: Integration (Week 13-16)     ████████░░░░░░░░░░░░  80%
PHASE 5: Testing & Launch (Week 17-20) ████████████████████ 100%
```

---

## PHASE 1: FOUNDATION (Weeks 1-4)

### Week 1: Project Setup & Architecture

**Goals:**
- Set up development environment
- Initialize project structure
- Configure databases
- Set up version control

**Tasks:**
```bash
# Day 1-2: Next.js Setup
npx create-next-app@latest pos-restaurant --typescript --tailwind --app
cd pos-restaurant

# Install core dependencies
npm install better-sqlite3 socket.io socket.io-client
npm install lucide-react clsx tailwind-merge
npm install date-fns zod
npm install @tanstack/react-query axios

# Dev dependencies
npm install -D @types/better-sqlite3 prisma
npm install -D eslint-config-prettier prettier

# Day 3: Database Setup
mkdir lib/db
touch lib/db/schema.sql
touch lib/db/seed.js
touch lib/db/migrations.js

# Initialize Git
git init
echo "node_modules/\n.next/\n*.db\n.env.local" > .gitignore
git add .
git commit -m "Initial project setup"

# Day 4-5: Project Structure
mkdir -p {app,components,lib,types,hooks,utils}
mkdir -p app/{api,admin,waiter,kitchen,cashier}
mkdir -p components/{ui,waiter,kitchen,cashier,admin}
mkdir -p lib/{db,sync,auth,hardware}
```

**Deliverables:**
- ✅ Next.js project initialized
- ✅ Folder structure created
- ✅ Git repository set up
- ✅ Database schema designed
- ✅ Development environment ready

---

### Week 2: Database & Data Layer

**Goals:**
- Implement SQLite database
- Create data access layer
- Set up migrations
- Seed initial data

**Implementation:**

```javascript
// lib/db/sqlite.js
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export class PosDatabase {
  constructor(dbPath = 'pos_local.db') {
    this.db = new Database(dbPath, {
      verbose: process.env.NODE_ENV === 'development' ? console.log : null
    });
    
    // Enable WAL mode for better concurrent access
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    
    this.initialize();
  }
  
  initialize() {
    // Run schema
    const schema = fs.readFileSync(
      path.join(process.cwd(), 'lib/db/schema.sql'),
      'utf8'
    );
    this.db.exec(schema);
  }
  
  // Helper methods
  run(sql, params = []) {
    return this.db.prepare(sql).run(params);
  }
  
  get(sql, params = []) {
    return this.db.prepare(sql).get(params);
  }
  
  all(sql, params = []) {
    return this.db.prepare(sql).all(params);
  }
  
  transaction(fn) {
    return this.db.transaction(fn);
  }
}

// Singleton instance
let dbInstance = null;

export function getDatabase() {
  if (!dbInstance) {
    dbInstance = new PosDatabase();
  }
  return dbInstance;
}
```

```javascript
// lib/db/repositories/orders.js
export class OrderRepository {
  constructor(db) {
    this.db = db;
  }
  
  create(order) {
    const insertOrder = this.db.prepare(`
      INSERT INTO orders (order_number, table_id, waiter_id, order_type, status, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const insertItem = this.db.prepare(`
      INSERT INTO order_items (order_id, menu_item_id, variant_id, quantity, unit_price, subtotal, special_instructions)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    return this.db.transaction(() => {
      const result = insertOrder.run(
        order.order_number,
        order.table_id,
        order.waiter_id,
        order.order_type,
        'pending',
        order.notes
      );
      
      const orderId = result.lastInsertRowid;
      
      for (const item of order.items) {
        insertItem.run(
          orderId,
          item.menu_item_id,
          item.variant_id,
          item.quantity,
          item.unit_price,
          item.subtotal,
          item.special_instructions
        );
      }
      
      return orderId;
    })();
  }
  
  getById(id) {
    const order = this.db.get(`
      SELECT o.*, t.table_number, u.full_name as waiter_name
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      LEFT JOIN users u ON o.waiter_id = u.id
      WHERE o.id = ?
    `, [id]);
    
    if (order) {
      order.items = this.db.all(`
        SELECT oi.*, mi.name as item_name
        FROM order_items oi
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE oi.order_id = ?
      `, [id]);
    }
    
    return order;
  }
  
  updateStatus(id, status) {
    return this.db.run(`
      UPDATE orders 
      SET status = ?,
          ${status === 'preparing' ? 'started_at = CURRENT_TIMESTAMP,' : ''}
          ${status === 'ready' ? 'ready_at = CURRENT_TIMESTAMP,' : ''}
          ${status === 'served' ? 'served_at = CURRENT_TIMESTAMP,' : ''}
      WHERE id = ?
    `, [status, id]);
  }
  
  getActiveOrders() {
    return this.db.all(`
      SELECT o.*, t.table_number, u.full_name as waiter_name,
             COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      LEFT JOIN users u ON o.waiter_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.status NOT IN ('served', 'cancelled')
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
  }
}
```

**Deliverables:**
- ✅ Database connection layer
- ✅ Repository pattern implemented
- ✅ CRUD operations for all entities
- ✅ Transaction support
- ✅ Seed data loaded

---

### Week 3: Authentication & Authorization

**Goals:**
- Implement PIN-based authentication
- Create role-based access control
- Session management
- Device registration

**Implementation:**

```javascript
// lib/auth/auth.js
import crypto from 'crypto';

export class AuthService {
  constructor(db) {
    this.db = db;
  }
  
  hashPin(pin) {
    return crypto
      .createHash('sha256')
      .update(pin)
      .digest('hex');
  }
  
  async authenticate(username, pin) {
    const user = this.db.get(`
      SELECT * FROM users 
      WHERE username = ? AND is_active = 1
    `, [username]);
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    const hashedPin = this.hashPin(pin);
    
    if (user.pin !== hashedPin) {
      return { success: false, error: 'Invalid PIN' };
    }
    
    // Create session
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    this.db.run(`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `, [user.id, sessionToken, expiresAt.toISOString()]);
    
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role
      },
      token: sessionToken
    };
  }
  
  async verifySession(token) {
    const session = this.db.get(`
      SELECT s.*, u.id as user_id, u.username, u.full_name, u.role
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ? AND s.expires_at > datetime('now')
    `, [token]);
    
    return session ? {
      id: session.user_id,
      username: session.username,
      full_name: session.full_name,
      role: session.role
    } : null;
  }
  
  hasPermission(userRole, permission) {
    const permissions = {
      admin: ['*'],
      cashier: ['bills.*', 'orders.view', 'payments.*'],
      waiter: ['orders.*', 'tables.*', 'menu.view'],
      kitchen: ['kots.*', 'orders.view']
    };
    
    const userPermissions = permissions[userRole] || [];
    
    if (userPermissions.includes('*')) return true;
    
    return userPermissions.some(p => {
      if (p.endsWith('.*')) {
        return permission.startsWith(p.slice(0, -2));
      }
      return p === permission;
    });
  }
}
```

```javascript
// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/sqlite';
import { AuthService } from '@/lib/auth/auth';

export async function POST(request) {
  try {
    const { username, pin, deviceId } = await request.json();
    
    const db = getDatabase();
    const auth = new AuthService(db);
    
    const result = await auth.authenticate(username, pin);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }
    
    // Register device
    db.run(`
      INSERT OR REPLACE INTO devices (device_id, user_id, last_seen)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `, [deviceId, result.user.id]);
    
    return NextResponse.json({
      user: result.user,
      token: result.token
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

**Deliverables:**
- ✅ PIN-based login
- ✅ Session management
- ✅ Role-based permissions
- ✅ Device tracking
- ✅ Secure password hashing

---

### Week 4: Basic UI Components

**Goals:**
- Create reusable UI components
- Implement design system
- Build authentication screens
- Create navigation

**Implementation:**

```jsx
// components/ui/button.jsx
import { clsx } from 'clsx';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  icon,
  disabled,
  loading,
  onClick,
  ...props 
}) {
  const baseStyles = 'rounded-lg font-medium transition-colors focus:outline-none focus:ring-2';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        (disabled || loading) && 'opacity-50 cursor-not-allowed'
      )}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          {icon}
          {children}
        </span>
      )}
    </button>
  );
}
```

```jsx
// components/auth/login-screen.jsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function LoginScreen() {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const handleLogin = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          pin,
          deviceId: getDeviceId()
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        
        // Route based on role
        switch (data.user.role) {
          case 'admin':
            router.push('/admin');
            break;
          case 'waiter':
            router.push('/waiter/tables');
            break;
          case 'kitchen':
            router.push('/kitchen');
            break;
          case 'cashier':
            router.push('/cashier');
            break;
        }
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePinInput = (digit) => {
    if (pin.length < 6) {
      setPin(prev => prev + digit);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        {/* Logo */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            🍴 Restaurant POS
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your credentials to continue
          </p>
        </div>
        
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        {/* PIN Display */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            PIN
          </label>
          <div className="mt-1 flex justify-center gap-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center text-2xl"
              >
                {pin[i] ? '●' : ''}
              </div>
            ))}
          </div>
        </div>
        
        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handlePinInput(num.toString())}
              className="p-4 text-xl font-semibold border-2 border-gray-300 rounded-lg hover:bg-gray-100"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setPin('')}
            className="p-4 text-xl border-2 border-gray-300 rounded-lg hover:bg-gray-100"
          >
            ←
          </button>
          <button
            onClick={() => handlePinInput('0')}
            className="p-4 text-xl font-semibold border-2 border-gray-300 rounded-lg hover:bg-gray-100"
          >
            0
          </button>
          <button
            onClick={handleLogin}
            disabled={!username || pin.length < 4}
            className="p-4 text-xl border-2 border-green-600 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            ✓
          </button>
        </div>
        
        <Button
          onClick={handleLogin}
          loading={loading}
          disabled={!username || pin.length < 4}
          className="w-full"
        >
          LOGIN
        </Button>
      </div>
    </div>
  );
}

function getDeviceId() {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}
```

**Deliverables:**
- ✅ UI component library
- ✅ Login screen
- ✅ Navigation components
- ✅ Responsive design
- ✅ Dark mode support (optional)

---

## PHASE 2: CORE FEATURES (Weeks 5-8)

### Week 5: Menu Management

**Tasks:**
- Menu CRUD operations
- Category management
- Image upload
- Variants handling

### Week 6: Order Taking (Waiter App)

**Tasks:**
- Table layout view
- Menu browsing
- Order creation
- Draft orders
- Special instructions

### Week 7: Kitchen Display System

**Tasks:**
- Real-time order display
- Status updates
- Station filtering
- Timer implementation
- Sound notifications

### Week 8: Billing System

**Tasks:**
- Bill generation
- Payment processing
- Receipt printing
- Discount application
- Split bill feature

---

## PHASE 3: ADVANCED FEATURES (Weeks 9-12)

### Week 9-10: Offline Mode

**Tasks:**
- IndexedDB integration
- Sync queue implementation
- Conflict resolution
- Background sync

### Week 11-12: Real-time Sync

**Tasks:**
- WebSocket setup
- Local server broadcasting
- Device synchronization
- Change log tracking

---

## PHASE 4: INTEGRATION & POLISH (Weeks 13-16)

### Week 13: Hardware Integration

**Tasks:**
- Thermal printer support
- Barcode scanner
- Kitchen display monitor
- Cash drawer integration

### Week 14: Cloud Sync

**Tasks:**
- Cloud database setup
- Multi-branch support
- Automated backups
- Cloud dashboard

### Week 15: AI Features

**Tasks:**
- Sales prediction
- Inventory alerts
- Menu optimization
- Performance analytics

### Week 16: Admin Panel

**Tasks:**
- User management
- Reports & analytics
- Settings configuration
- Backup & restore

---

## PHASE 5: TESTING & LAUNCH (Weeks 17-20)

### Week 17-18: Testing

**Tasks:**
- Unit testing
- Integration testing
- Load testing
- User acceptance testing
- Bug fixes

### Week 19: Training & Documentation

**Tasks:**
- User manuals
- Video tutorials
- Staff training sessions
- FAQ documentation

### Week 20: Deployment & Launch

**Tasks:**
- Production setup
- Data migration
- Go-live support
- Monitoring setup
- Post-launch support

---

## 🛠️ TECHNOLOGY STACK DETAILS

### Frontend
```json
{
  "framework": "Next.js 15+",
  "ui": "TailwindCSS + Shadcn UI",
  "state": "React Query + Zustand",
  "forms": "React Hook Form + Zod",
  "charts": "Recharts",
  "icons": "Lucide React"
}
```

### Backend
```json
{
  "runtime": "Node.js 20+",
  "framework": "Next.js API Routes",
  "database": "SQLite (Better-SQLite3)",
  "realtime": "Socket.io",
  "auth": "Custom JWT"
}
```

### DevOps
```json
{
  "hosting": "Vercel (Cloud) + Local Server",
  "ci/cd": "GitHub Actions",
  "monitoring": "Sentry",
  "analytics": "Plausible"
}
```

---

## 📦 DELIVERABLES CHECKLIST

### Documentation
- [ ] System architecture document
- [ ] Database schema
- [ ] API documentation
- [ ] UI/UX wireframes
- [ ] User manuals
- [ ] Training materials
- [ ] Deployment guide

### Software
- [ ] Web application (PWA)
- [ ] Admin panel
- [ ] Local server package
- [ ] Database setup scripts
- [ ] Seed data
- [ ] Backup utilities

### Hardware Requirements Document
- [ ] Device specifications
- [ ] Printer compatibility list
- [ ] Network requirements
- [ ] Minimum system requirements

---

## 💰 ESTIMATED COSTS

### Development (Nepal Context)
- Senior Full-stack Developer: Rs 150,000/month × 5 = Rs 750,000
- UI/UX Designer: Rs 80,000/month × 2 = Rs 160,000
- QA Tester: Rs 60,000/month × 1 = Rs 60,000
- **Total Development:** Rs 970,000

### Infrastructure (First Year)
- Cloud hosting: Rs 5,000/month × 12 = Rs 60,000
- Domain & SSL: Rs 5,000
- Backup storage: Rs 3,000/month × 12 = Rs 36,000
- **Total Infrastructure:** Rs 101,000

### Hardware (Per Restaurant)
- Local Server (Mini PC): Rs 40,000
- Wi-Fi Router: Rs 5,000
- Waiter Tablets (×3): Rs 90,000
- Kitchen Display: Rs 25,000
- Cashier Terminal: Rs 60,000
- Thermal Printer: Rs 15,000
- **Total Hardware:** Rs 235,000

### **GRAND TOTAL:** Rs 1,306,000 (~$10,000 USD)

---

## 🚀 GO-LIVE CHECKLIST

### Pre-Launch (1 Week Before)
- [ ] All features tested and approved
- [ ] User manuals ready
- [ ] Training completed
- [ ] Hardware installed
- [ ] Network configured
- [ ] Backup system tested
- [ ] Support team ready

### Launch Day
- [ ] Import initial data
- [ ] Configure settings
- [ ] Test all devices
- [ ] Brief staff
- [ ] Monitor closely
- [ ] Be available for support

### Post-Launch (First Week)
- [ ] Daily check-ins
- [ ] Gather feedback
- [ ] Fix urgent issues
- [ ] Monitor performance
- [ ] Update documentation

---

**Document Status:** Ready for Implementation  
**Approval Required:** [✓] Technical Lead [✓] Project Manager [  ] Client  
**Next Review Date:** December 15, 2025
