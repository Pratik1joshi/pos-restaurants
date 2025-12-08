# API Testing Guide

## Test the API Endpoints

### 1. Start Development Server
```bash
npm run dev
```

Server will be available at: http://localhost:3000

---

## Authentication Endpoints

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"pin\":\"123456\",\"deviceId\":\"test-device\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "user_id": 1,
    "username": "admin",
    "full_name": "System Admin",
    "role": "admin"
  },
  "token": "abc123..."
}
```

**Save the token for subsequent requests!**

### Verify Session
```bash
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"YOUR_TOKEN_HERE\"}"
```

### Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"YOUR_TOKEN_HERE\"}"
```

---

## Menu Endpoints

### Get All Menu Items
```bash
curl -X GET http://localhost:3000/api/restaurant/menu \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Menu Categories
```bash
curl -X GET "http://localhost:3000/api/restaurant/menu?type=categories" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Items by Category
```bash
curl -X GET "http://localhost:3000/api/restaurant/menu?category=1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Search Menu Items
```bash
curl -X GET "http://localhost:3000/api/restaurant/menu?search=chicken" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Available Items Only
```bash
curl -X GET "http://localhost:3000/api/restaurant/menu?available=true" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Specific Item with Variants
```bash
curl -X GET "http://localhost:3000/api/restaurant/menu?id=1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Menu Item (Admin only)
```bash
curl -X POST http://localhost:3000/api/restaurant/menu \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"category_id\":1,\"name\":\"Test Dish\",\"base_price\":350,\"prep_time_minutes\":20}"
```

### Toggle Item Availability
```bash
curl -X PATCH http://localhost:3000/api/restaurant/menu \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"id\":1,\"action\":\"toggle-availability\"}"
```

---

## Table Endpoints

### Get All Tables
```bash
curl -X GET http://localhost:3000/api/restaurant/tables \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Available Tables
```bash
curl -X GET "http://localhost:3000/api/restaurant/tables?type=available" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Occupied Tables
```bash
curl -X GET "http://localhost:3000/api/restaurant/tables?type=occupied" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Filter Tables by Floor
```bash
curl -X GET "http://localhost:3000/api/restaurant/tables?floor=Ground%20Floor" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Update Table Status
```bash
curl -X PATCH http://localhost:3000/api/restaurant/tables \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"id\":1,\"action\":\"update-status\",\"status\":\"occupied\"}"
```

### Assign Waiter to Table
```bash
curl -X PATCH http://localhost:3000/api/restaurant/tables \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"id\":1,\"action\":\"assign-waiter\",\"waiter_id\":2}"
```

### Clear Table
```bash
curl -X PATCH http://localhost:3000/api/restaurant/tables \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"id\":1,\"action\":\"clear\"}"
```

---

## Order Endpoints

### Get All Orders
```bash
curl -X GET http://localhost:3000/api/restaurant/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Pending Orders
```bash
curl -X GET "http://localhost:3000/api/restaurant/orders?status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Waiter's Orders
```bash
curl -X GET "http://localhost:3000/api/restaurant/orders?waiter_id=2" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create New Order
```bash
curl -X POST http://localhost:3000/api/restaurant/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"table_id\":1,\"order_type\":\"dine-in\",\"items\":[{\"menu_item_id\":1,\"quantity\":2,\"unit_price\":450,\"subtotal\":900}]}"
```

### Update Order Status
```bash
curl -X PATCH http://localhost:3000/api/restaurant/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"id\":1,\"status\":\"preparing\"}"
```

### Cancel Order
```bash
curl -X PATCH http://localhost:3000/api/restaurant/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"id\":1,\"action\":\"cancel\",\"cancellation_reason\":\"Customer changed mind\"}"
```

---

## KOT (Kitchen Order Ticket) Endpoints

### Get All Active KOTs
```bash
curl -X GET "http://localhost:3000/api/restaurant/kots?type=active" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Pending KOTs for a Station
```bash
curl -X GET "http://localhost:3000/api/restaurant/kots?station=hot-kitchen&status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Kitchen Stats
```bash
curl -X GET "http://localhost:3000/api/restaurant/kots?type=stats" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create New KOT
```bash
curl -X POST http://localhost:3000/api/restaurant/kots \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"order_id\":1,\"station\":\"hot-kitchen\",\"items\":[{\"order_item_id\":1,\"menu_item_id\":1,\"quantity\":2}]}"
```

### Update KOT Status
```bash
curl -X PATCH http://localhost:3000/api/restaurant/kots \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"id\":1,\"status\":\"preparing\"}"
```

### Mark All Items as Complete
```bash
curl -X PATCH http://localhost:3000/api/restaurant/kots \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"id\":1,\"action\":\"complete-all\"}"
```

---

## Bill Endpoints

### Get Bill by ID
```bash
curl -X GET "http://localhost:3000/api/restaurant/bills?id=1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Today's Bills
```bash
curl -X GET "http://localhost:3000/api/restaurant/bills?type=today" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Sales Summary
```bash
curl -X GET "http://localhost:3000/api/restaurant/bills?type=summary" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create New Bill
```bash
curl -X POST http://localhost:3000/api/restaurant/bills \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"order_id\":1,\"table_id\":1,\"items\":[{\"menu_item_id\":1,\"quantity\":2,\"unit_price\":450,\"subtotal\":900}],\"subtotal\":900}"
```

### Add Payment to Bill
```bash
curl -X POST http://localhost:3000/api/restaurant/bills \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"action\":\"add-payment\",\"bill_id\":1,\"payment_method\":\"cash\",\"amount\":1200}"
```

### Mark Bill as Paid
```bash
curl -X PATCH http://localhost:3000/api/restaurant/bills \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"id\":1}"
```

---

## Role-Based Permissions

### Admin
- All permissions (full access)

### Cashier
- bills.* (all bill operations)
- orders.view (view orders)
- payments.* (all payment operations)

### Waiter
- orders.* (all order operations)
- tables.* (all table operations)
- menu.view (view menu)

### Kitchen
- kots.* (all KOT operations)
- orders.view (view orders)
- orders.update (update order status)

---

## Common Response Codes

- **200** - Success
- **201** - Created
- **400** - Bad Request (missing fields or invalid data)
- **401** - Unauthorized (invalid or missing token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **500** - Internal Server Error

---

## Tips

1. **Token Management**: Save your login token and use it in all subsequent requests
2. **Testing Tools**: Use Postman or Thunder Client VS Code extension for easier testing
3. **View Database**: Use DB Browser for SQLite to inspect `pos_restaurant.db`
4. **Logs**: Check terminal output for detailed error messages
5. **PowerShell**: Use backticks ` for line continuation in PowerShell instead of \

---

## PowerShell Examples

For PowerShell users, use this format:

```powershell
# Login
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username":"admin","pin":"123456","deviceId":"test-device"}'

$token = $response.token

# Get menu items
Invoke-RestMethod -Uri "http://localhost:3000/api/restaurant/menu" `
  -Method GET `
  -Headers @{Authorization="Bearer $token"}
```
