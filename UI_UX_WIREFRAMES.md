# 📱 UI/UX Wireframes & User Flows

## Complete Interface Specifications

---

## 🎨 DESIGN SYSTEM

### Color Palette
```css
:root {
  /* Primary Colors */
  --primary-500: #3B82F6;      /* Blue - Primary actions */
  --primary-600: #2563EB;
  --primary-700: #1D4ED8;
  
  /* Secondary Colors */
  --secondary-500: #10B981;    /* Green - Success, Available */
  --secondary-600: #059669;
  
  /* Status Colors */
  --status-pending: #F59E0B;   /* Orange */
  --status-preparing: #3B82F6; /* Blue */
  --status-ready: #10B981;     /* Green */
  --status-urgent: #EF4444;    /* Red */
  
  /* Neutral Colors */
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-200: #E5E7EB;
  --gray-500: #6B7280;
  --gray-900: #111827;
  
  /* Background */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --bg-dark: #1F2937;
}
```

### Typography
```css
/* Font Family */
font-family: 'Inter', -apple-system, system-ui, sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
```

---

## 📱 WAITER APP SCREENS

### 1. Login Screen
```
┌─────────────────────────────────────────────┐
│                                             │
│              [LOGO/ICON]                    │
│                                             │
│         🍴 RESTAURANT POS 🍴                │
│                                             │
│    ┌───────────────────────────────┐       │
│    │  Select Your Name             │       │
│    │  [Dropdown: John Sharma ▼]    │       │
│    └───────────────────────────────┘       │
│                                             │
│    ┌───────────────────────────────┐       │
│    │  Enter PIN                    │       │
│    │  [● ● ● ●]                    │       │
│    └───────────────────────────────┘       │
│                                             │
│         [  1  ] [  2  ] [  3  ]            │
│         [  4  ] [  5  ] [  6  ]            │
│         [  7  ] [  8  ] [  9  ]            │
│         [  ←  ] [  0  ] [  ✓  ]            │
│                                             │
│    [────────  LOGIN ────────]              │
│                                             │
│    Offline Mode: ✓ Connected               │
│                                             │
└─────────────────────────────────────────────┘
```

**Implementation:**
```jsx
const WaiterLogin = () => {
  const [selectedWaiter, setSelectedWaiter] = useState(null);
  const [pin, setPin] = useState('');
  
  const handlePinInput = (digit) => {
    if (pin.length < 6) {
      setPin(prev => prev + digit);
    }
  };
  
  const handleLogin = async () => {
    const user = await authenticateUser(selectedWaiter.id, pin);
    if (user) {
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      navigation.navigate('TableLayout');
    } else {
      showError('Invalid PIN');
    }
  };
  
  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />
      
      <Select
        label="Select Your Name"
        options={waiters}
        value={selectedWaiter}
        onChange={setSelectedWaiter}
      />
      
      <PinInput
        value={pin}
        maxLength={6}
        secure
      />
      
      <NumericKeypad
        onPress={handlePinInput}
        onClear={() => setPin('')}
        onSubmit={handleLogin}
      />
      
      <ConnectionStatus online={isOnline} />
    </View>
  );
};
```

---

### 2. Table Layout Screen
```
┌─────────────────────────────────────────────────────────────┐
│  [☰]  TABLE LAYOUT               [👤 John] [🔔 3] [⚙️]    │
├─────────────────────────────────────────────────────────────┤
│  [Floor: Ground ▼]  [Section: All ▼]  [Search: 🔍]        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   WINDOW SECTION                                            │
│   ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐                      │
│   │ T-1 │  │ T-2 │  │ T-3 │  │ T-4 │                      │
│   │ 🟢  │  │ 🔴  │  │ 🟢  │  │ 🟡  │                      │
│   │ 2P  │  │ 2P  │  │ 2P  │  │ 2P  │                      │
│   └─────┘  └─────┘  └─────┘  └─────┘                      │
│                                                              │
│   CENTER SECTION                                            │
│   ┌─────┐  ┌─────┐  ┌─────┐                               │
│   │ T-5 │  │ T-6 │  │ T-7 │                               │
│   │ 🔴  │  │ 🟢  │  │ 🔴  │                               │
│   │ 4P  │  │ 4P  │  │ 6P  │                               │
│   │ 35m │  │     │  │ 12m │                               │
│   └─────┘  └─────┘  └─────┘                               │
│                                                              │
│   CORNER SECTION                                            │
│   ┌───────────┐  ┌───────────┐                            │
│   │   T-8     │  │   T-9     │                            │
│   │   🟢      │  │   🔵      │                            │
│   │   8P      │  │   6P      │                            │
│   └───────────┘  └───────────┘                            │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  Legend: 🟢 Available  🔴 Occupied  🟡 Reserved  🔵 Clean  │
│                                                              │
│  [➕ New Order]  [📋 My Orders (5)]  [📊 Today: Rs 15,240] │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Color-coded table status
- Occupied time display (e.g., "35m")
- Capacity indicator (e.g., "4P" = 4 persons)
- Filter by floor/section
- Quick search
- Notifications badge

**Implementation:**
```jsx
const TableLayout = () => {
  const [tables, setTables] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState('Ground');
  const [selectedSection, setSelectedSection] = useState('All');
  
  const getTableColor = (status) => {
    switch (status) {
      case 'available': return '#10B981';  // Green
      case 'occupied': return '#EF4444';   // Red
      case 'reserved': return '#F59E0B';   // Orange
      case 'cleaning': return '#3B82F6';   // Blue
    }
  };
  
  const getOccupiedTime = (occupiedAt) => {
    if (!occupiedAt) return null;
    const minutes = Math.floor((Date.now() - occupiedAt) / 60000);
    return `${minutes}m`;
  };
  
  const handleTablePress = (table) => {
    if (table.status === 'occupied') {
      navigation.navigate('OrderDetail', { 
        orderId: table.current_order_id 
      });
    } else if (table.status === 'available') {
      navigation.navigate('NewOrder', { 
        tableId: table.id 
      });
    }
  };
  
  return (
    <View style={styles.container}>
      <Header
        title="TABLE LAYOUT"
        user={currentUser}
        notifications={notifications}
      />
      
      <FilterBar
        floor={selectedFloor}
        section={selectedSection}
        onFloorChange={setSelectedFloor}
        onSectionChange={setSelectedSection}
      />
      
      <ScrollView style={styles.tablesContainer}>
        {sections.map(section => (
          <View key={section.name}>
            <Text style={styles.sectionTitle}>{section.name}</Text>
            <View style={styles.tablesGrid}>
              {tables
                .filter(t => t.section === section.name)
                .map(table => (
                  <TouchableOpacity
                    key={table.id}
                    style={[
                      styles.tableCard,
                      { borderColor: getTableColor(table.status) }
                    ]}
                    onPress={() => handleTablePress(table)}
                  >
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: getTableColor(table.status) }
                    ]} />
                    <Text style={styles.tableNumber}>
                      {table.table_number}
                    </Text>
                    <Text style={styles.capacity}>
                      {table.capacity}P
                    </Text>
                    {table.status === 'occupied' && (
                      <Text style={styles.timer}>
                        {getOccupiedTime(table.occupied_at)}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        ))}
      </ScrollView>
      
      <BottomActionBar>
        <Button
          icon="plus"
          label="New Order"
          onPress={() => navigation.navigate('NewOrder')}
        />
        <Button
          icon="list"
          label="My Orders"
          badge={myOrdersCount}
          onPress={() => navigation.navigate('MyOrders')}
        />
      </BottomActionBar>
    </View>
  );
};
```

---

### 3. Order Taking Screen
```
┌─────────────────────────────────────────────────────────────┐
│  [←]  NEW ORDER - Table T-5          [Save Draft] [Submit]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  CATEGORY TABS                                              │
│  [🥗 Starters] [🍲 Soups] [🍛 Main] [🍞 Breads] [More...]  │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  MENU ITEMS                              [Search: 🔍]       │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ [IMG]            │  │ [IMG]            │               │
│  │ Chicken Tikka    │  │ Paneer Tikka     │               │
│  │ 🌶️🌶️            │  │ 🌱              │               │
│  │ Rs 450           │  │ Rs 380           │               │
│  │ 20 min prep      │  │ 15 min prep      │               │
│  │ [ADD TO ORDER]   │  │ [ADD TO ORDER]   │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ [IMG]            │  │ [IMG]            │               │
│  │ Veg Momos (8)    │  │ Chicken Momos (8)│               │
│  │ 🌱              │  │                  │               │
│  │ Rs 180           │  │ Rs 220           │               │
│  │ [ADD TO ORDER]   │  │ [ADD TO ORDER]   │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  CURRENT ORDER                                [Clear All]   │
│                                                              │
│  1. Chicken Tikka x2           [−] 2 [+]        Rs 900     │
│     Note: Extra spicy              [🗑️] [✏️]              │
│                                                              │
│  2. Paneer Tikka x1            [−] 1 [+]        Rs 380     │
│                                [🗑️] [✏️]                   │
│                                                              │
│  3. Naan (Garlic) x4           [−] 4 [+]        Rs 240     │
│                                [🗑️] [✏️]                   │
│                                                              │
│  ─────────────────────────────────────────────────────     │
│  Subtotal:                                      Rs 1,520    │
│  Est. Prep Time:                                25 min      │
│                                                              │
│  [💾 SAVE DRAFT]              [🍽️ SEND TO KITCHEN]         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Item Add Modal:**
```
┌──────────────────────────────────────┐
│  ADD ITEM                        [×] │
├──────────────────────────────────────┤
│                                      │
│  [IMAGE]                             │
│                                      │
│  Chicken Tikka                       │
│  Grilled chicken marinated in spices │
│                                      │
│  🌶️🌶️ Medium Spicy                  │
│  ⏱️ 20 min preparation               │
│                                      │
│  Quantity:        [−] 2 [+]         │
│                                      │
│  Variant:                            │
│  ⚪ Full (Rs 450)                    │
│  ⚪ Half (Rs 250)                    │
│                                      │
│  Special Instructions:               │
│  ┌────────────────────────────────┐ │
│  │ Extra spicy, no onions         │ │
│  └────────────────────────────────┘ │
│                                      │
│  Total: Rs 900                       │
│                                      │
│  [    ADD TO ORDER    ]              │
│                                      │
└──────────────────────────────────────┘
```

**Implementation:**
```jsx
const OrderTakingScreen = ({ route }) => {
  const { tableId } = route.params;
  const [selectedCategory, setSelectedCategory] = useState('Starters');
  const [orderItems, setOrderItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const addItemToOrder = (item, quantity, variant, instructions) => {
    const orderItem = {
      id: Date.now(),
      menu_item_id: item.id,
      name: item.name,
      quantity,
      variant_id: variant?.id,
      variant_name: variant?.name,
      unit_price: variant ? 
        item.base_price + variant.price_modifier : 
        item.base_price,
      subtotal: (item.base_price + (variant?.price_modifier || 0)) * quantity,
      special_instructions: instructions,
      preparation_time: item.preparation_time
    };
    
    setOrderItems(prev => [...prev, orderItem]);
  };
  
  const submitOrder = async () => {
    const order = {
      table_id: tableId,
      waiter_id: currentUser.id,
      order_type: 'dine-in',
      status: 'pending',
      items: orderItems,
      notes: '',
      estimated_time: calculateTotalPrepTime(orderItems)
    };
    
    // Save offline-first
    const orderId = await saveOrderLocally(order);
    
    // Try to sync
    if (isOnline) {
      try {
        await syncOrder(orderId);
        
        // Notify kitchen via WebSocket
        socket.emit('new_order', { orderId, order });
        
        showSuccess('Order sent to kitchen!');
      } catch (error) {
        // Will sync later
        showInfo('Order saved offline, will sync when connected');
      }
    }
    
    navigation.goBack();
  };
  
  return (
    <View style={styles.container}>
      <Header
        title={`NEW ORDER - Table ${table.table_number}`}
        leftAction="back"
        rightActions={[
          { label: 'Save Draft', onPress: saveDraft },
          { label: 'Submit', onPress: submitOrder, primary: true }
        ]}
      />
      
      <CategoryTabs
        categories={categories}
        selected={selectedCategory}
        onChange={setSelectedCategory}
      />
      
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search menu items..."
      />
      
      <ScrollView style={styles.menuItems}>
        <MenuItemsGrid
          items={filteredMenuItems}
          onItemPress={(item) => setShowAddModal(item)}
        />
      </ScrollView>
      
      <OrderSummaryPanel
        items={orderItems}
        onQuantityChange={updateQuantity}
        onRemove={removeItem}
        onEdit={editItem}
        onClearAll={clearOrder}
      />
      
      <BottomActionBar>
        <Button
          icon="save"
          label="Save Draft"
          variant="secondary"
          onPress={saveDraft}
        />
        <Button
          icon="send"
          label="Send to Kitchen"
          variant="primary"
          onPress={submitOrder}
          disabled={orderItems.length === 0}
        />
      </BottomActionBar>
      
      {showAddModal && (
        <AddItemModal
          item={showAddModal}
          onAdd={addItemToOrder}
          onClose={() => setShowAddModal(null)}
        />
      )}
    </View>
  );
};
```

---

## 🍳 KITCHEN DISPLAY SYSTEM

### Main KDS Screen
```
┌─────────────────────────────────────────────────────────────────────────┐
│  KITCHEN DISPLAY SYSTEM                    [Station: All ▼]  🔊 Sound  │
├─────────────────────────────────────────────────────────────────────────┤
│  [All] [Pending: 8] [Preparing: 5] [Ready: 2]     🔔 15 Active Orders  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  PENDING ORDERS                                                         │
│                                                                          │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐          │
│  │ KOT #247       │  │ KOT #248       │  │ KOT #249       │          │
│  │ ⏱️  2m 15s     │  │ ⏱️  8m 42s     │  │ ⏱️  15m 07s ⚠️ │          │
│  │                │  │                │  │                │          │
│  │ Table: T-12    │  │ Table: T-05    │  │ Table: T-08    │          │
│  │ Waiter: John   │  │ Waiter: Ram    │  │ Waiter: John   │          │
│  │ Time: 12:45 PM │  │ Time: 12:37 PM │  │ Time: 12:30 PM │          │
│  │ ─────────────  │  │ ─────────────  │  │ ─────────────  │          │
│  │                │  │                │  │                │          │
│  │ • Chicken Tikka│  │ • Paneer Butter│  │ • Veg Momos (8)│          │
│  │   x2 🌶️🌶️     │  │   Masala x1    │  │   🌱           │          │
│  │   "Extra spicy"│  │ • Dal Makhni   │  │   "Extra spicy"│          │
│  │                │  │   x1           │  │ • Chow Mein x1 │          │
│  │ • Garlic Naan  │  │ • Butter Naan  │  │ • Fried Rice   │          │
│  │   x4           │  │   x3           │  │   x1           │          │
│  │                │  │                │  │                │          │
│  │ Est: 20 min    │  │ Est: 20 min    │  │ Est: 15 min    │          │
│  │                │  │                │  │                │          │
│  │ [START COOKING]│  │ [START COOKING]│  │ [START COOKING]│          │
│  │                │  │                │  │                │          │
│  └────────────────┘  └────────────────┘  └────────────────┘          │
│                                                                          │
│  PREPARING ORDERS                                                       │
│                                                                          │
│  ┌────────────────┐  ┌────────────────┐                               │
│  │ KOT #245 🔥    │  │ KOT #246 🔥    │                               │
│  │ ⏱️  5m 20s     │  │ ⏱️  12m 15s    │                               │
│  │                │  │                │                               │
│  │ Table: T-03    │  │ Table: T-07    │                               │
│  │ ─────────────  │  │ ─────────────  │                               │
│  │ ✓ Butter Chick │  │ ✓ Tandoori     │                               │
│  │   x2           │  │   Chicken x1   │                               │
│  │ ⏳ Naan x3     │  │ ⏳ Veg Biryani │                               │
│  │                │  │   x1           │                               │
│  │                │  │                │                               │
│  │ [  MARK READY ]│  │ [  MARK READY ]│                               │
│  │                │  │                │                               │
│  └────────────────┘  └────────────────┘                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Color Coding:**
- Green (0-5 min): Normal
- Yellow (5-10 min): Attention needed
- Orange (10-15 min): Priority
- Red (15+ min): Urgent!

**Implementation:**
```jsx
const KitchenDisplaySystem = () => {
  const [orders, setOrders] = useState([]);
  const [selectedStation, setSelectedStation] = useState('all');
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    // Listen for new orders via WebSocket
    socket.on('new_order', (order) => {
      playNotificationSound();
      setOrders(prev => [order, ...prev]);
      showToast(`New order from Table ${order.table_number}`);
    });
    
    // Update timer every second
    const interval = setInterval(() => {
      setOrders(prev => [...prev]); // Trigger re-render
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const getElapsedTime = (createdAt) => {
    const seconds = Math.floor((Date.now() - createdAt) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  const getUrgencyColor = (createdAt) => {
    const minutes = Math.floor((Date.now() - createdAt) / 60000);
    if (minutes < 5) return '#10B981';  // Green
    if (minutes < 10) return '#F59E0B'; // Yellow
    if (minutes < 15) return '#F97316'; // Orange
    return '#EF4444';                    // Red
  };
  
  const startCooking = async (kotId) => {
    await db.run(`
      UPDATE kots 
      SET status = 'preparing', started_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [kotId]);
    
    socket.emit('kot_status_update', { kotId, status: 'preparing' });
  };
  
  const markReady = async (kotId) => {
    await db.run(`
      UPDATE kots 
      SET status = 'ready', completed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [kotId]);
    
    // Notify waiter
    const kot = orders.find(o => o.id === kotId);
    socket.emit('food_ready', {
      kotId,
      tableId: kot.table_id,
      waiterId: kot.waiter_id
    });
    
    showSuccess('Waiter notified!');
  };
  
  return (
    <View style={styles.container}>
      <Header
        title="KITCHEN DISPLAY SYSTEM"
        rightActions={[
          <StationFilter 
            value={selectedStation}
            onChange={setSelectedStation}
          />,
          <SoundToggle />
        ]}
      />
      
      <FilterTabs
        filters={[
          { label: 'All', count: orders.length },
          { label: 'Pending', count: pendingOrders.length },
          { label: 'Preparing', count: preparingOrders.length },
          { label: 'Ready', count: readyOrders.length }
        ]}
        selected={filter}
        onChange={setFilter}
      />
      
      <ScrollView style={styles.ordersContainer}>
        <Section title="PENDING ORDERS">
          <View style={styles.ordersGrid}>
            {pendingOrders.map(order => (
              <KOTCard
                key={order.id}
                order={order}
                elapsedTime={getElapsedTime(order.created_at)}
                urgencyColor={getUrgencyColor(order.created_at)}
                onAction={() => startCooking(order.id)}
                actionLabel="START COOKING"
              />
            ))}
          </View>
        </Section>
        
        <Section title="PREPARING ORDERS">
          <View style={styles.ordersGrid}>
            {preparingOrders.map(order => (
              <KOTCard
                key={order.id}
                order={order}
                elapsedTime={getElapsedTime(order.started_at)}
                urgencyColor={getUrgencyColor(order.created_at)}
                onAction={() => markReady(order.id)}
                actionLabel="MARK READY"
                showProgress
              />
            ))}
          </View>
        </Section>
      </ScrollView>
    </View>
  );
};
```

---

## 💰 CASHIER/BILLING SCREEN

### Billing Interface
```
┌─────────────────────────────────────────────────────────────────────────┐
│  CASHIER - BILLING                           [Cashier: Sita] [Log Out] │
├─────────────────────────────────────────────────────────────────────────┤
│  [📋 Active Tables] [🛒 Quick Sale] [📜 History] [⚙️ Settings]        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ACTIVE TABLES                                                          │
│                                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ T-01     │  │ T-03     │  │ T-05     │  │ T-07     │              │
│  │ 45m      │  │ 25m      │  │ 1h 15m   │  │ 35m      │              │
│  │ Rs 1,250 │  │ Rs 2,450 │  │ Rs 4,200 │  │ Rs 1,850 │              │
│  │ John S.  │  │ Ram T.   │  │ John S.  │  │ Ram T.   │              │
│  │          │  │          │  │          │  │          │              │
│  │[GEN BILL]│  │[GEN BILL]│  │[GEN BILL]│  │[GEN BILL]│              │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘              │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  BILLING DETAIL - Table T-05                        Bill #: BILL-123456 │
│                                                                          │
│  Customer: Walk-in           Waiter: John Sharma    Time: 1h 15m        │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────     │
│  ITEM                      QTY        PRICE          TOTAL              │
│  ─────────────────────────────────────────────────────────────────     │
│  Chicken Tikka             2        Rs 450        Rs 900               │
│  Paneer Butter Masala      1        Rs 420        Rs 420               │
│  Dal Makhni                1        Rs 320        Rs 320               │
│  Garlic Naan               4        Rs  60        Rs 240               │
│  Butter Naan               2        Rs  45        Rs  90               │
│  Masala Tea                2        Rs  50        Rs 100               │
│  ─────────────────────────────────────────────────────────────────     │
│                                     Subtotal:     Rs 2,070              │
│                              Service Charge 10%:  Rs   207              │
│                                      VAT 13%:     Rs   296.01           │
│  ─────────────────────────────────────────────────────────────────     │
│                                                                          │
│  Discount:  [None ▼]  [Apply]                    - Rs     0            │
│  ─────────────────────────────────────────────────────────────────     │
│                                   GRAND TOTAL:    Rs 2,573.01           │
│  ─────────────────────────────────────────────────────────────────     │
│                                                                          │
│  PAYMENT METHOD                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │   💵     │  │   💳     │  │   📱     │  │   🎁     │              │
│  │  CASH    │  │  CARD    │  │ QR PAY   │  │ CREDIT   │              │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘              │
│                                                                          │
│  [🧾 PRINT & PAY]  [✂️ SPLIT BILL]  [🔄 MERGE TABLE]  [❌ CANCEL]     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Split Bill Modal:**
```
┌─────────────────────────────────────────┐
│  SPLIT BILL                         [×] │
├─────────────────────────────────────────┤
│  Total: Rs 2,573.01                     │
│                                         │
│  Split Method:                          │
│  ⚫ By Amount                            │
│  ⚪ By Items                             │
│  ⚪ By Person                            │
│                                         │
│  Number of Splits: [−] 2 [+]           │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Split 1:     Rs 1,286.50        │   │
│  │ Payment: Cash                   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Split 2:     Rs 1,286.51        │   │
│  │ Payment: Card                   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [   PROCESS SPLIT PAYMENT   ]          │
│                                         │
└─────────────────────────────────────────┘
```

**Implementation:**
```jsx
const CashierBillingScreen = () => {
  const [activeTables, setActiveTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [billDetails, setBillDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [discount, setDiscount] = useState({ type: 'none', value: 0 });
  
  const generateBill = async (tableId) => {
    const order = await db.get(`
      SELECT o.*, u.full_name as waiter_name,
             t.table_number
      FROM orders o
      JOIN users u ON o.waiter_id = u.id
      JOIN tables t ON o.table_id = t.id
      WHERE o.table_id = ? AND o.status != 'cancelled'
    `, [tableId]);
    
    const items = await db.all(`
      SELECT oi.*, mi.name
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = ?
    `, [order.id]);
    
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const serviceCharge = subtotal * 0.10;
    const taxableAmount = subtotal + serviceCharge;
    const vat = taxableAmount * 0.13;
    
    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = subtotal * (discount.value / 100);
    } else if (discount.type === 'amount') {
      discountAmount = discount.value;
    }
    
    const grandTotal = taxableAmount + vat - discountAmount;
    
    setBillDetails({
      order,
      items,
      calculations: {
        subtotal,
        serviceCharge,
        vat,
        discountAmount,
        grandTotal
      }
    });
    
    setSelectedTable(tableId);
  };
  
  const processPayment = async () => {
    const bill = {
      order_id: billDetails.order.id,
      table_id: selectedTable,
      ...billDetails.calculations,
      cashier_id: currentUser.id,
      status: 'paid'
    };
    
    const billId = await saveBill(bill);
    
    await savePayment({
      bill_id: billId,
      payment_method: paymentMethod,
      amount: bill.grandTotal
    });
    
    // Print receipt
    if (printerConnected) {
      await printReceipt(bill);
    }
    
    // Update table status
    await updateTableStatus(selectedTable, 'available');
    await updateOrderStatus(billDetails.order.id, 'served');
    
    showSuccess('Payment processed successfully!');
    
    // Reset
    setSelectedTable(null);
    setBillDetails(null);
    loadActiveTables();
  };
  
  return (
    <View style={styles.container}>
      <Header
        title="CASHIER - BILLING"
        user={currentUser}
        onLogout={handleLogout}
      />
      
      <Tabs>
        <Tab label="Active Tables" icon="list" />
        <Tab label="Quick Sale" icon="shopping-cart" />
        <Tab label="History" icon="file-text" />
        <Tab label="Settings" icon="settings" />
      </Tabs>
      
      {!selectedTable ? (
        <View style={styles.tablesGrid}>
          {activeTables.map(table => (
            <TableCard
              key={table.id}
              table={table}
              onPress={() => generateBill(table.id)}
            />
          ))}
        </View>
      ) : (
        <View style={styles.billingContainer}>
          <BillHeader
            tableNumber={billDetails.order.table_number}
            waiterName={billDetails.order.waiter_name}
            duration={getOrderDuration(billDetails.order.created_at)}
          />
          
          <ItemsList items={billDetails.items} />
          
          <BillCalculations
            calculations={billDetails.calculations}
            discount={discount}
            onDiscountChange={setDiscount}
          />
          
          <PaymentMethodSelector
            selected={paymentMethod}
            onSelect={setPaymentMethod}
          />
          
          <ActionButtons>
            <Button
              icon="printer"
              label="Print & Pay"
              variant="primary"
              onPress={processPayment}
              disabled={!paymentMethod}
            />
            <Button
              icon="scissors"
              label="Split Bill"
              onPress={() => setShowSplitModal(true)}
            />
            <Button
              icon="refresh-cw"
              label="Merge Table"
              onPress={() => setShowMergeModal(true)}
            />
            <Button
              icon="x"
              label="Cancel"
              variant="danger"
              onPress={() => setSelectedTable(null)}
            />
          </ActionButtons>
        </View>
      )}
    </View>
  );
};
```

---

## ⚙️ ADMIN DASHBOARD

### Main Admin Screen
```
┌─────────────────────────────────────────────────────────────────────────┐
│  [☰] ADMIN DASHBOARD                        [👤 Admin] [Date: Dec 1]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  TODAY'S PERFORMANCE                                                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐      │
│  │ 💰         │  │ 📦         │  │ 👥         │  │ ⭐         │      │
│  │ Sales      │  │ Orders     │  │ Customers  │  │ Avg Rating │      │
│  │ Rs 45,230  │  │ 87 orders  │  │ 142        │  │ 4.5/5.0    │      │
│  │ ↑ 15% ✓    │  │ ↑ 8% ✓     │  │ ↑ 12% ✓    │  │ ↓ 0.2 ⚠️   │      │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘      │
│                                                                          │
│  ┌──────────────────────────────────┐  ┌─────────────────────────┐    │
│  │ SALES TREND (Last 7 Days)        │  │ TOP SELLING ITEMS       │    │
│  │                                  │  │ 1. Chicken Tikka (45)   │    │
│  │      📈 Graph                    │  │ 2. Paneer Butter (38)   │    │
│  │                                  │  │ 3. Veg Momos (32)       │    │
│  │                                  │  │ 4. Dal Makhni (28)      │    │
│  └──────────────────────────────────┘  │ 5. Butter Naan (124)    │    │
│                                         └─────────────────────────┘    │
│  ┌──────────────────────────────────┐  ┌─────────────────────────┐    │
│  │ PEAK HOURS                       │  │ PAYMENT BREAKDOWN       │    │
│  │                                  │  │                         │    │
│  │ 12PM-2PM:  35% (31 orders)       │  │ 💵 Cash:     Rs 25,400  │    │
│  │ 7PM-9PM:   40% (35 orders)       │  │ 💳 Card:     Rs 12,800  │    │
│  │ 3PM-5PM:   15% (13 orders)       │  │ 📱 QR:       Rs  7,030  │    │
│  │ Other:     10% (8 orders)        │  │                         │    │
│  └──────────────────────────────────┘  └─────────────────────────┘    │
│                                                                          │
│  RECENT ORDERS                                          [View All →]   │
│  ─────────────────────────────────────────────────────────────────     │
│  #247  T-12  Rs 1,520  John S.  12:45 PM  ✓ Paid                      │
│  #248  T-05  Rs 2,450  Ram T.   12:37 PM  🕐 Pending                   │
│  #249  T-08  Rs 1,180  John S.  12:30 PM  ✓ Paid                      │
│                                                                          │
│  [📝 MENU] [👥 STAFF] [📦 INVENTORY] [📊 REPORTS] [⚙️ SETTINGS]      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

**Document Version:** 1.0  
**Last Updated:** December 1, 2025

**Next Steps:**
1. Review wireframes with stakeholders
2. Create high-fidelity mockups in Figma
3. Build interactive prototype
4. Conduct user testing
5. Iterate based on feedback
