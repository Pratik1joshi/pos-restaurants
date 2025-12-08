# Waiter App - User Guide

## Overview
The Restaurant POS Waiter App enables waiters to manage tables, take orders, and track order status efficiently.

## Features Implemented

### 1. **Waiter Dashboard** (`/waiter`)
- **Stats Cards**: Real-time view of active, completed, and total orders
- **Tables View**: 
  - Visual table layout with status indicators (Available/Occupied/Reserved/Cleaning)
  - Color-coded status badges
  - Table capacity and current order amount display
  - Click to create new order or view existing order
- **My Orders View**:
  - List of all orders assigned to the logged-in waiter
  - Order status badges (Pending/Preparing/Ready/Served)
  - Item count and total amount for each order
  - Click to view order details

### 2. **New Order Page** (`/waiter/new-order`)
- **Order Type Selection**: Dine-in or Takeaway
- **Table Selection**: Visual table picker for dine-in orders
- **Customer Information**: Name and phone for takeaway orders
- **Menu Browser**:
  - Search functionality across menu items
  - Category filtering (All, Starters, Main Course, etc.)
  - Vegetarian/Non-veg indicators
  - Real-time menu availability
- **Shopping Cart**:
  - Add items with quantity controls (+/-)
  - Special instructions per item
  - Real-time total calculation
  - Remove items functionality
- **Mobile Responsive**: Cart dialog for mobile devices
- **Order Submission**: Creates order, generates KOT, and redirects to order details

### 3. **Order Details Page** (`/waiter/order/[id]`)
- **Order Status Display**: Visual status indicator with color coding
- **Order Timeline**: Time elapsed since order creation
- **Order Items List**:
  - Item names, quantities, and prices
  - Special instructions display
  - Individual item status (Pending/Preparing/Ready/Served)
  - Subtotals and total amount
- **KOT Tracking**: View all Kitchen Order Tickets for the order
- **Status Management**:
  - Update order status (Pending → Preparing → Ready → Served)
  - Mark as served quick action
  - Cancel order functionality
- **Order Details Sidebar**:
  - Location (Table number or Takeaway)
  - Customer information
  - Waiter name
- **Quick Actions**:
  - Mark as served
  - Add more items (if order is still being prepared)
  - Cancel order
- **Auto-refresh**: Updates every 10 seconds for real-time status

## User Workflow

### Creating a New Order (Dine-in)

1. **Login**: Enter PIN on login page
2. **Dashboard**: Click "New Order" button or click on an available table
3. **Select Table**: If not already selected, choose table from dialog
4. **Browse Menu**: 
   - Use search bar to find items
   - Filter by category
   - View item details (price, description, veg/non-veg)
5. **Add Items**:
   - Click "Add" button on menu items
   - Adjust quantities in cart using +/- buttons
   - Add special instructions (e.g., "Extra spicy", "No onions")
6. **Submit Order**: Click "Submit Order" button
7. **Confirmation**: Redirected to order details page

### Creating a Takeaway Order

1. **Dashboard**: Click "New Order"
2. **Select Takeaway**: Click "Takeaway" button in header
3. **Enter Customer Details**: Name (required) and Phone number
4. **Browse & Add Items**: Same as dine-in
5. **Submit Order**: Click "Submit Order"

### Managing Existing Orders

1. **View Order**: Click on order card in "My Orders" tab
2. **Check Status**: View current order status and timeline
3. **Update Status**: Use "Update Status" button or quick actions
4. **Add Items**: Click "Add More Items" (only for pending/preparing orders)
5. **Mark as Served**: When food is delivered to customer

### Monitoring Tables

1. **Tables View**: Switch to "Tables" tab in dashboard
2. **Check Status**: View all tables with color-coded status
3. **View Order**: Click on occupied table to view its current order
4. **Start New Order**: Click on available table

## Status Workflow

### Order Status Flow
```
Pending → Preparing → Ready → Served → (Completed via Cashier)
         ↓
      Cancelled
```

### Order Status Meanings
- **Pending**: Order created, waiting for kitchen
- **Preparing**: Kitchen is cooking the items
- **Ready**: All items prepared, ready to serve
- **Served**: Food delivered to customer
- **Cancelled**: Order cancelled (with reason)

### Item Status (in Order Details)
- **Pending**: Not yet sent to kitchen
- **Preparing**: Being cooked
- **Ready**: Prepared and ready
- **Served**: Delivered to customer

## API Endpoints Used

### Authentication
- `POST /api/auth/login`: Login with PIN
- `POST /api/auth/logout`: Logout session
- `GET /api/auth/verify`: Verify active session

### Orders
- `GET /api/restaurant/orders?waiter_id={id}`: Get waiter's orders
- `POST /api/restaurant/orders`: Create new order
- `GET /api/restaurant/orders/[id]`: Get order details with items and KOTs
- `PUT /api/restaurant/orders/[id]`: Update order status
- `DELETE /api/restaurant/orders/[id]`: Cancel order

### Tables
- `GET /api/restaurant/tables`: Get all tables
- `GET /api/restaurant/tables?status=available`: Get available tables
- `GET /api/restaurant/tables/[id]`: Get single table details

### Menu
- `GET /api/restaurant/menu`: Get all menu items with availability

## Technical Features

### Authentication & Authorization
- Role-based access (waiter role required)
- Session persistence with localStorage
- Automatic token refresh
- Redirect to login if unauthorized

### Real-time Updates
- Auto-refresh on order details page (every 10s)
- Manual refresh button
- Optimistic UI updates

### Error Handling
- Toast notifications for success/error
- Proper error messages
- Network error handling

### Responsive Design
- Mobile-first design
- Desktop optimized layouts
- Touch-friendly buttons
- Swipe-friendly cards

### Performance
- Parallel API calls for faster loading
- Optimized re-renders
- Cached menu data
- Lazy loading of images

## Testing Credentials

Use these pre-configured users from seed data:

**Waiter Account**
- Username: john
- PIN: 1234
- Full Name: John Smith

**Additional Test Users**
- alice / 5678 (Admin)
- bob / 9012 (Cashier)
- charlie / 3456 (Kitchen)
- david / 7890 (Waiter)

## Common Issues & Solutions

### Issue: "Cart is empty"
**Solution**: Add items to cart before submitting

### Issue: "Please enter customer name" (Takeaway)
**Solution**: Fill in customer name field before submitting

### Issue: "Select table" dialog appears
**Solution**: Choose a table for dine-in orders

### Issue: Order not appearing in "My Orders"
**Solution**: Refresh the page or switch tabs

### Issue: Can't update order status
**Solution**: Only certain statuses can be updated (Pending/Preparing/Ready)

### Issue: Menu items not showing
**Solution**: Check if items are marked as available in database

## Next Steps

After completing waiter workflow, users can:
1. View orders in Kitchen Display System (To be implemented)
2. Generate bills in Cashier System (To be implemented)
3. View analytics in Admin Dashboard (To be implemented)

## Database Schema Reference

### Orders Table
- `order_number`: Unique identifier (ORD-timestamp-random)
- `table_id`: Foreign key to tables (NULL for takeaway)
- `waiter_id`: Foreign key to users
- `order_type`: 'dine-in', 'takeaway', 'delivery'
- `status`: Current order status
- `customer_name`: For takeaway/delivery
- `customer_phone`: Contact number

### Order Items Table
- `order_id`: Foreign key to orders
- `menu_item_id`: Foreign key to menu_items
- `quantity`: Number of items
- `unit_price`: Price per item
- `subtotal`: quantity × unit_price
- `special_instructions`: Custom notes
- `status`: Item preparation status

### KOTs Table (Kitchen Order Tickets)
- `order_id`: Foreign key to orders
- `station`: Kitchen station (grill, chinese, bar, etc.)
- `status`: KOT preparation status
- Automatically generated when order is created

## Support

For issues or feature requests, contact your system administrator.

---
**Version**: 1.0.0  
**Last Updated**: December 2024  
**Module**: Waiter App
