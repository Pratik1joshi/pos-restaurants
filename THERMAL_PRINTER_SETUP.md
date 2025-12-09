# Thermal Printer Setup Guide

## 🖨️ Why Bills Were Printing Incorrectly

Your bill was printing **twice** with long blank gaps because of:

1. ❌ **Double print triggers** - Code was calling `window.print()` twice
2. ❌ **No print prevention** - Both `onload` and `setTimeout` fired
3. ⚠️ **Possible printer misconfiguration**

---

## ✅ FIXES APPLIED

### 1. Fixed JavaScript Double Print Issue

**Before:**
```javascript
window.onload = function() {
  window.print();  // First print
};

setTimeout(() => {
  window.print();  // Second print (backup)
}, 100);
```

**After:**
```javascript
let printed = false;

window.onload = function() {
  if (!printed) {
    printed = true;
    window.focus();
    window.print();  // Only prints ONCE
  }
};
```

---

## 🔧 PRINTER CONFIGURATION CHECKLIST

### Step 1: Check Paper Size
Your system is configured for **80mm thermal paper**.

**Windows Printer Settings:**
1. Open `Control Panel` → `Devices and Printers`
2. Right-click your thermal printer → `Printing Preferences`
3. Set paper size: **80mm x 297mm** (or 80mm roll)
4. Set margin: **0mm**
5. Click **Apply**

### Step 2: Disable Duplicate Printing

**In Windows:**
1. Go to printer `Properties` → `Device Settings`
2. Set `Copies`: **1**
3. Disable `Auto Copy` or `Duplicate Print`

**Physical Printer (DIP Switches):**
- Check under your printer for physical switches
- Make sure these are **OFF**:
  - Double Print
  - Copy Mode
  - Demo Mode

### Step 3: Configure Browser Print Settings

**Chrome/Edge (Recommended):**
1. When print dialog opens, click **More Settings**
2. Set:
   - Paper size: **80mm**
   - Margins: **None**
   - Scale: **100%**
   - Pages per sheet: **1**
3. Save as default

**Firefox:**
1. Print → Print Settings
2. Paper: **Custom (80mm width)**
3. Margins: **None**

### Step 4: Test Print

1. Log into admin or cashier
2. Create a test bill
3. Click **Print Bill**
4. Should print **only once** with correct width

---

## 🚨 TROUBLESHOOTING

### Problem: Still Printing Twice

**Solution 1: Clear Browser Cache**
```
Chrome: Ctrl+Shift+Delete → Clear cached images
```

**Solution 2: Check React Strict Mode**
If using dev mode, strict mode can cause double renders.
```javascript
// In production build this is already disabled
npm run build
npm start
```

**Solution 3: Check Printer Driver**
- Update printer driver from manufacturer website
- Some old drivers have bugs causing duplicates

### Problem: Bill Too Narrow (58mm on 80mm printer)

**Solution:**
```css
/* Already set in code */
body {
  width: 80mm;  /* Matches your printer */
}

@page {
  size: 80mm auto;  /* Critical setting */
}
```

### Problem: Extra Blank Space After Bill

**Causes:**
1. Auto paper feed enabled
2. Cutter mode wrong
3. Extra line breaks in template

**Solution:**
1. In printer properties → disable "Auto Feed"
2. Set cutter mode: "Partial Cut"
3. Code already optimized (no extra `\n`)

### Problem: Bill Not Auto-Printing

**Solution:**
- Allow pop-ups in browser
- Chrome: Settings → Site Settings → Pop-ups → Allow for `localhost`

---

## 📋 RECOMMENDED PRINTER MODELS

These work best with this system:

### Budget (Rs 5,000 - 8,000)
- **RP80** - 80mm thermal
- **XPrinter XP-N160II** - Reliable USB

### Mid-Range (Rs 8,000 - 15,000)
- **Epson TM-T20II** - Industry standard
- **HPRT TP805** - Fast print speed

### Professional (Rs 15,000+)
- **Epson TM-T82II** - Auto-cutter
- **Star TSP143IIIU** - USB + Ethernet

---

## ⚙️ TECHNICAL DETAILS

### Print Format Specifications
- Paper width: **80mm (576px)**
- Font: Courier New, monospace
- Font size: 12px
- Line spacing: 1.4
- Margins: 5mm padding

### Print Flow
1. User clicks "Print Bill"
2. Opens new window (300x600px)
3. Loads thermal template
4. `window.onload` triggers print dialog
5. Prints once
6. Closes after 500ms

### Supported Payment Methods
All payment types print correctly:
- Cash (shows change)
- Card
- QR (eSewa/Bank)
- Credit
- Split payments (shows breakdown)

---

## 🔐 SECURITY NOTES

**Network Printing:**
If using network printer (WiFi/Ethernet):
1. Keep printer on same network as POS
2. Set static IP for printer
3. Test from tablets/phones if using cashier app

**USB Printing:**
- More reliable for single station
- No network issues
- Faster print speed

---

## 📞 SUPPORT

If issues persist:
1. Check printer LED indicators
2. Print test page from printer itself (hold feed button)
3. Try different USB port/cable
4. Update Windows to latest version

**Test Command:**
```javascript
// Open browser console (F12)
window.print();
// Should open print dialog only once
```

---

## ✅ FINAL CHECKLIST

Before going live:
- [ ] Printer paper size set to 80mm
- [ ] Print copies set to 1
- [ ] DIP switches configured correctly
- [ ] Browser allows pop-ups
- [ ] Test print shows single bill
- [ ] No extra blank space
- [ ] Bill width fills paper correctly
- [ ] Auto-cutter works (if available)

---

**System Version:** Restaurant POS v1.0
**Last Updated:** December 2025
**Print Engine:** Browser-based (window.print())
