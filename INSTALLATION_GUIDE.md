# 🍽️ Restaurant POS System - Installation Guide

## Quick Setup (For Restaurant Owner)

### Option 1: Simple Zip Distribution (EASIEST)

1. **Download** the `RestaurantPOS.zip` file
2. **Extract** to any folder (e.g., `C:\RestaurantPOS`)
3. **Double-click** `Start-POS.bat`
4. **Browser opens automatically** to http://localhost:3000
5. **Done!** 🎉

### Default Login Credentials
- **Username:** `admin`
- **PIN:** `1234`

---

## For Other Devices (Tablets, Phones)

1. Find your computer's IP address (shown in the console window)
2. On tablet/phone, open browser and go to: `http://YOUR-IP:3000`
   - Example: `http://192.168.1.100:3000`

---

## System Requirements

- Windows 10/11
- 4GB RAM minimum
- 500MB free disk space
- WiFi router (for multiple devices)

---

## Firewall Setup (If other devices can't connect)

1. Press `Windows + R`
2. Type: `firewall.cpl` and press Enter
3. Click "Advanced settings"
4. Click "Inbound Rules" → "New Rule"
5. Select "Port" → Next
6. Select "TCP" → Specific local ports: `3000` → Next
7. Select "Allow the connection" → Next
8. Check all (Domain, Private, Public) → Next
9. Name: "Restaurant POS" → Finish

---

## Features

✅ Admin Dashboard with Reports
✅ Waiter Order Management
✅ Kitchen Display System (KDS)
✅ Cashier Billing System
✅ 80mm Thermal Receipt Printing
✅ Multiple Payment Methods (Cash, Card, QR, Credit)
✅ Table Management
✅ Menu Management
✅ Stock Management
✅ Customer Management
✅ Employee Management
✅ Works Offline (No Internet Required)

---

## Support

For issues or questions:
- Email: support@yourcompany.com
- Phone: +977-XXXXXXXXXX

---

## Backup Your Data

**Important:** The database file `pos_restaurant.db` contains all your data.
- Location: Same folder as the application
- Backup regularly by copying this file to a safe location
- To restore: Replace the file with your backup

---

## Troubleshooting

### Problem: Browser doesn't open automatically
**Solution:** Manually open browser and go to http://localhost:3000

### Problem: Port 3000 is already in use
**Solution:** Close other applications using port 3000 or restart computer

### Problem: Can't connect from tablet
**Solution:** 
1. Check both devices are on same WiFi
2. Check firewall settings (see above)
3. Try http://COMPUTER-IP:3000

### Problem: Application won't start
**Solution:**
1. Right-click `Start-POS.bat` → Run as Administrator
2. Check Windows Defender didn't block it
3. Ensure no antivirus is blocking the app

---

Made with ❤️ for Restaurants
