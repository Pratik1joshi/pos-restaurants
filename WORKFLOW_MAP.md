# 🔄 Restaurant Workflow Map

## Complete Operational Flow

---

## 📋 WORKFLOW OVERVIEW

### Customer Journey
```
Customer Arrives → Waiter Seats → Menu Browsing → Order Placement
                                                        ↓
Customer Leaves ← Payment ← Food Served ← Cooking ← Kitchen Receives Order
```

### Detailed Process Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER ARRIVAL                              │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  WAITER: Check Table Availability                                   │
│  • Open POS app                                                     │
│  • View table layout                                                │
│  • Select available table                                           │
│  • Mark table as occupied                                           │
│  System: Table status → "Occupied"                                  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  WAITER: Present Menu & Take Order                                  │
│  • Browse menu categories                                           │
│  • Search items if needed                                           │
│  • Add items with quantities                                        │
│  • Add special instructions                                         │
│  • Review order summary                                             │
│  • Submit order                                                     │
│  System: Generate KOT, save order                                   │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  SYSTEM: Route Order to Kitchen                                     │
│  • Create KOT with unique number                                    │
│  • Assign items to appropriate stations:                            │
│    - Grill station: Tikka, Kebabs                                   │
│    - Main course: Curries, Dal                                      │
│    - Chinese: Momos, Chowmein                                       │
│    - Bar: Beverages                                                 │
│  • Broadcast via WebSocket to KDS                                   │
│  • Print KOT at each station (if printer available)                 │
│  • Sound notification                                               │
│  System: Order status → "Pending"                                   │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  KITCHEN: Receive & Acknowledge                                     │
│  • KOT appears on KDS screen                                        │
│  • Chef reviews order details                                       │
│  • Clicks "Start Cooking"                                           │
│  System: Order status → "Preparing", timer starts                   │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  KITCHEN: Prepare Food                                              │
│  • Cook items per recipe                                            │
│  • Monitor preparation time                                         │
│  • Check quality                                                    │
│  • Plate the dish                                                   │
│  • Click "Mark as Ready"                                            │
│  System: Order status → "Ready", notify waiter                      │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  WAITER: Receive Notification                                       │
│  • Push notification: "Table X food ready"                          │
│  • Navigate to kitchen/pickup area                                  │
│  • Collect dishes                                                   │
│  • Verify items match order                                         │
│  • Serve to table                                                   │
│  • Click "Served"                                                   │
│  System: Order status → "Served"                                    │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  CUSTOMER: Dining Experience                                        │
│  • Enjoy meal                                                       │
│  • Request modifications (if needed)                                │
│  • Additional orders (if needed) → Goes back to order flow          │
│  • Request bill                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  CASHIER: Generate Bill                                             │
│  • Select table from active tables list                             │
│  • Review order items                                               │
│  • System auto-calculates:                                          │
│    - Subtotal                                                       │
│    - Service charge (10%)                                           │
│    - VAT (13%)                                                      │
│  • Apply discount if any                                            │
│  • Show grand total                                                 │
│  System: Generate bill number                                       │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  CASHIER: Process Payment                                           │
│  • Customer selects payment method:                                 │
│    - Cash: Calculate change                                         │
│    - Card: Process card payment                                     │
│    - QR: Scan eSewa/Khalti/Fonepay                                  │
│    - Split: Divide bill                                             │
│  • Record payment                                                   │
│  • Print receipt                                                    │
│  • Option to email/SMS receipt                                      │
│  System: Bill status → "Paid"                                       │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  SYSTEM: Post-Payment Actions                                       │
│  • Update table status → "Available"                                │
│  • Save transaction to database                                     │
│  • Update daily sales                                               │
│  • Update inventory (if tracking)                                   │
│  • Sync to cloud (if online)                                        │
│  • Add to analytics data                                            │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                     CUSTOMER DEPARTURE                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔀 ALTERNATIVE WORKFLOWS

### 1. Takeaway Order Flow
```
Customer Calls/Arrives
         ↓
Cashier Takes Order (No table assignment)
         ↓
Order → Kitchen (Order type: "Takeaway")
         ↓
Kitchen Prepares
         ↓
Cashier Notified When Ready
         ↓
Customer Arrives (if called ahead)
         ↓
Payment Processed
         ↓
Order Handed Over
```

### 2. Delivery Order Flow
```
Order Received (Phone/Online)
         ↓
Cashier Enters Order
• Add customer name & phone
• Add delivery address
• Note delivery time
         ↓
Order → Kitchen (Order type: "Delivery")
         ↓
Kitchen Prepares
         ↓
Package Food
         ↓
Assign to Delivery Person
         ↓
Mark as "Out for Delivery"
         ↓
Payment on Delivery / Prepaid
         ↓
Mark as "Delivered"
```

### 3. Modify Order Flow
```
Customer Requests Change
         ↓
Waiter Opens Existing Order
         ↓
Check Kitchen Status:
• If NOT started → Modify freely
• If PREPARING → Check with kitchen
• If READY → Cannot modify
         ↓
Add/Remove Items
         ↓
Generate Additional KOT
         ↓
Kitchen Processes Changes
         ↓
Serve Modified Order
```

### 4. Cancel Order Flow
```
Cancel Request
         ↓
Check Order Status:
• Pending → Cancel immediately
• Preparing → Requires manager approval
• Ready/Served → Cannot cancel
         ↓
Manager Enters PIN
         ↓
Select Cancel Reason:
• Customer changed mind
• Item unavailable
• Kitchen error
• Customer left
         ↓
Update Order Status → "Cancelled"
         ↓
Notify Kitchen (Stop preparation)
         ↓
Update Table Status
         ↓
No Billing
```

### 5. Split Bill Flow
```
Customer Requests Split
         ↓
Cashier Opens Bill
         ↓
Select Split Method:
• By Amount (e.g., 50-50)
• By Items (Person A: Items 1,2 | Person B: Items 3,4)
• By Person (e.g., 4 equal parts)
         ↓
System Creates Multiple Bills
         ↓
Each Person Pays Separately
         ↓
Record Each Payment
         ↓
Print Separate Receipts
         ↓
All Splits Paid → Complete Transaction
```

### 6. Table Transfer Flow
```
Customer Requests Table Change
         ↓
Waiter Opens Current Table Order
         ↓
Click "Transfer Table"
         ↓
Select New Table
         ↓
Confirm Transfer
         ↓
System Updates:
• Old table → "Available"
• New table → "Occupied"
• Order linked to new table
         ↓
Notify Kitchen (if needed)
```

### 7. Merge Tables Flow
```
Multiple Tables for Same Party
         ↓
Cashier/Waiter Selects Tables
         ↓
Click "Merge Tables"
         ↓
Select Primary Table
         ↓
System Combines:
• All orders into one
• Calculate total time from earliest
• Merge item lists
         ↓
Single Bill Generated
         ↓
Process Payment
         ↓
All Tables → "Available"
```

---

## 📊 STATE MACHINE DIAGRAMS

### Order State Machine
```
[NEW]
  ↓
  | Waiter submits order
  ↓
[PENDING]
  ↓
  | Kitchen clicks "Start Cooking"
  ↓
[PREPARING]
  ↓
  | Kitchen clicks "Mark Ready"
  ↓
[READY]
  ↓
  | Waiter clicks "Served"
  ↓
[SERVED]
  ↓
  | Cashier processes payment
  ↓
[COMPLETED]

From any state → [CANCELLED] (with manager approval)
```

### Table State Machine
```
[AVAILABLE]
  ↓
  | Waiter assigns customer
  ↓
[OCCUPIED]
  ↓
  | Order served & paid
  ↓
[CLEANING]
  ↓
  | Staff cleans table
  ↓
[AVAILABLE]

[AVAILABLE] → [RESERVED] (for advance booking)
[RESERVED] → [OCCUPIED] (when customer arrives)
[RESERVED] → [AVAILABLE] (if no-show)
```

### Bill State Machine
```
[DRAFT]
  ↓
  | Generate from order
  ↓
[UNPAID]
  ↓
  | Customer pays
  ↓
[PAID]

[UNPAID] → [CANCELLED] (if order cancelled)
```

---

## 🕐 TIMING DIAGRAMS

### Normal Dine-In Timing
```
0:00  Customer arrives, seated
0:05  Order taken
0:07  Order sent to kitchen
0:08  Kitchen starts cooking
0:25  Food ready
0:27  Food served
0:55  Customer requests bill
0:57  Bill generated
1:00  Payment completed
1:02  Customer leaves

Total Time: ~60 minutes
```

### Fast Takeaway Timing
```
0:00  Customer orders at counter
0:02  Order sent to kitchen
0:03  Kitchen starts cooking
0:18  Food ready & packed
0:20  Customer pays
0:22  Customer leaves with food

Total Time: ~22 minutes
```

---

## 🚨 ERROR HANDLING WORKFLOWS

### Kitchen Out of Stock
```
Kitchen Realizes Item Unavailable
         ↓
Chef Clicks on Item → "Mark Unavailable"
         ↓
System Notifies Waiter
         ↓
Waiter Informs Customer
         ↓
Customer Chooses:
• Replace with similar item
• Remove item & adjust bill
• Cancel entire order
         ↓
Waiter Updates Order
         ↓
Continue Normal Flow
```

### Payment Failed (Card/QR)
```
Customer Attempts Payment
         ↓
Payment Gateway Returns Error
         ↓
Cashier Sees Error Message
         ↓
Offer Alternatives:
• Retry payment
• Use different card
• Switch to cash
• Split payment
         ↓
Retry Until Successful
         ↓
Complete Transaction
```

### Power Outage During Order
```
Power Goes Out
         ↓
Devices Switch to Battery
         ↓
Local SQLite Data Intact
         ↓
Continue Operations Offline
         ↓
Orders Queued for Sync
         ↓
Power Restored
         ↓
Auto-Sync All Changes
```

### Internet Disconnection
```
Internet Lost
         ↓
System Detects Offline Mode
         ↓
Show "Offline" Indicator
         ↓
Continue Using Local Server (Wi-Fi Mode)
         ↓
Or Fall Back to Device-Only Mode
         ↓
Queue All Changes
         ↓
Internet Restored
         ↓
Background Sync Starts
         ↓
All Changes Uploaded
```

---

## 📅 DAILY OPERATIONS WORKFLOW

### Opening Procedure
```
[MORNING - 9:00 AM]

Manager Arrives
         ↓
1. Turn on Local Server Device
         ↓
2. Turn on Wi-Fi Router
         ↓
3. Login to Admin Panel
         ↓
4. Check System Status:
   • Database integrity
   • Last night's backup
   • Pending sync items
   • Device connectivity
         ↓
5. Review Yesterday's Reports
         ↓
6. Check Inventory (if enabled)
         ↓
7. Update Menu Availability
   • Mark unavailable items
   • Update prices (if needed)
   • Add daily specials
         ↓
8. Brief Staff:
   • Special instructions
   • Menu changes
   • Expected reservations
         ↓
9. Distribute Devices:
   • Waiters get tablets
   • Kitchen gets display
   • Cashier logs in
         ↓
10. Test Equipment:
   • Printers
   • Scanners
   • Network
         ↓
[READY FOR BUSINESS - 10:00 AM]
```

### Shift Change Procedure
```
[SHIFT CHANGE - 2:00 PM]

Outgoing Waiter
         ↓
1. Complete Pending Orders
         ↓
2. Transfer Active Tables:
   • List all occupied tables
   • Handover notes
         ↓
3. Submit Day Report:
   • Orders taken
   • Sales amount
   • Issues faced
         ↓
4. Log Out
         ↓

Incoming Waiter
         ↓
1. Log In with PIN
         ↓
2. Review Assigned Tables
         ↓
3. Check Active Orders
         ↓
4. Read Handover Notes
         ↓
5. Start Taking Orders
```

### Closing Procedure
```
[CLOSING - 10:00 PM]

1. Stop Taking New Orders
         ↓
2. Complete Pending Orders
         ↓
3. Process All Payments
         ↓
4. Clear All Tables
         ↓
5. Generate End-of-Day Report:
   • Total sales
   • Order count
   • Payment breakdown
   • Top items sold
   • Cancelled orders
         ↓
6. Reconcile Cash:
   • Count physical cash
   • Match with system records
   • Record any discrepancies
         ↓
7. Backup Database:
   • Local backup
   • Cloud sync
   • USB backup (optional)
         ↓
8. Kitchen Cleanup:
   • Update inventory usage
   • Note wastage
   • Prepare for tomorrow
         ↓
9. Device Management:
   • Collect all devices
   • Charge overnight
   • Check for damage
         ↓
10. System Shutdown:
   • All staff log out
   • Close admin panel
   • Keep server running (for cloud sync)
         ↓
[CLOSED - 11:00 PM]
```

---

## 🔐 SECURITY WORKFLOWS

### Manager Approval Required
```
Sensitive Action Attempted:
• Cancel preparing order
• Apply large discount (>20%)
• Delete bill
• Modify closed order
• Access reports
         ↓
System Prompts: "Manager Approval Required"
         ↓
Manager Enters PIN
         ↓
System Verifies:
• User has 'admin' role
• PIN matches
         ↓
If Valid → Allow Action
If Invalid → Deny & Log Attempt
```

### Suspicious Activity Detection
```
System Monitors:
• Multiple failed login attempts
• Large discounts applied
• High cancellation rate
• Bill modifications
• Off-hours access
         ↓
Threshold Exceeded
         ↓
Generate Alert:
• Notify manager
• Log incident
• Lock account (if severe)
         ↓
Manager Reviews & Takes Action
```

---

## 📈 REPORTING WORKFLOWS

### Real-Time Dashboard
```
Admin Opens Dashboard
         ↓
System Aggregates Data:
• Current day sales (live)
• Active orders count
• Table occupancy rate
• Average order value
• Top selling items
         ↓
Display Charts & Metrics
         ↓
Auto-Refresh Every 30 Seconds
```

### End-of-Day Report
```
Closing Time
         ↓
System Generates Report:
• Sales summary
  - Total revenue
  - Order count
  - Average bill
• Payment breakdown
  - Cash
  - Card
  - QR
• Category-wise sales
• Item-wise sales
• Waiter performance
• Peak hours analysis
• Cancelled orders
         ↓
Save as PDF
         ↓
Email to Owner/Manager
         ↓
Upload to Cloud
```

### Monthly Analysis
```
First Day of Month
         ↓
System Compiles:
• 30-day sales trend
• Month-over-month growth
• Best performing items
• Slow moving items
• Busiest days/times
• Staff performance
• Customer feedback ratings
         ↓
Generate Insights:
• Revenue forecast
• Inventory recommendations
• Menu optimization
• Staffing suggestions
         ↓
Present to Management
```

---

## 🔄 SYNC WORKFLOWS

### Continuous Sync (Wi-Fi Mode)
```
[Every 5 Seconds]

Device Checks for Changes
         ↓
Any New/Modified Records?
         ↓
Yes → Package Changes
         ↓
Send to Local Server via WebSocket
         ↓
Server Receives & Validates
         ↓
Server Broadcasts to Other Devices
         ↓
Other Devices Apply Changes
         ↓
Send Acknowledgment
         ↓
Mark as Synced
```

### Offline-to-Online Sync
```
Device Goes Offline
         ↓
Queue All Changes Locally
         ↓
Store in IndexedDB Sync Queue
         ↓
Continue Operations
         ↓
[Connection Restored]
         ↓
Detect Online Status
         ↓
Retrieve Sync Queue
         ↓
Sort by Timestamp
         ↓
Send Oldest First
         ↓
Server Receives & Checks for Conflicts
         ↓
If Conflict → Apply Resolution Strategy
         ↓
If No Conflict → Apply Changes
         ↓
Send Confirmation
         ↓
Remove from Queue
         ↓
Repeat Until Queue Empty
```

### Cloud Sync (Scheduled)
```
[Every Hour or On-Demand]

Check Internet Connection
         ↓
Connected → Start Sync
         ↓
Collect Local Changes Since Last Sync
         ↓
Compress Data
         ↓
Send HTTPS Request to Cloud
         ↓
Cloud Validates & Stores
         ↓
Cloud Sends Back New Changes
         ↓
Apply Cloud Changes Locally
         ↓
Update Last Sync Timestamp
         ↓
Complete
```

---

## 📞 SUPPORT WORKFLOWS

### Technical Issue Resolution
```
User Encounters Problem
         ↓
Check Issue Type:

Printer Not Working:
• Check USB connection
• Check paper/ink
• Restart printer service
• Test print

App Crashed:
• Force close app
• Clear cache
• Restart device
• Reinstall if needed

Sync Issues:
• Check network
• View sync logs
• Manual sync trigger
• Contact support

Data Mismatch:
• View conflict logs
• Export data
• Contact support
• Restore from backup
         ↓
If Resolved → Resume Operations
If Not Resolved → Escalate
```

---

**Document Version:** 1.0  
**Last Updated:** December 1, 2025

**Next Actions:**
1. Train staff on these workflows
2. Create quick reference cards
3. Conduct dry runs
4. Gather feedback
5. Refine processes
