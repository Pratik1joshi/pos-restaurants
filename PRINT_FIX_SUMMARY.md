# Thermal Printing Fix - Summary

## Problem Identified
Your thermal bills were printing **twice** with long gaps due to:
- JavaScript code had TWO print triggers firing
- `window.onload` called `window.print()`
- `setTimeout` also called `window.print()` as "backup"
- Result: Bill printed twice, causing duplicate receipts and wasted paper

## Solution Applied

### Fixed Files:
1. **app/admin/billing/page.jsx** - Admin billing thermal print
2. **app/cashier/bill/[id]/page.jsx** - Cashier payment thermal print

### Code Change:
```javascript
// BEFORE (BAD - prints twice)
window.onload = function() {
  window.print();  // First print
};
setTimeout(() => {
  window.print();  // Second print
}, 100);

// AFTER (GOOD - prints once)
let printed = false;
window.onload = function() {
  if (!printed) {
    printed = true;
    window.focus();
    window.print();  // Only once
  }
};
```

## Testing Instructions

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Test Admin Billing:**
   - Login as admin (admin/1234)
   - Go to Admin → Billing
   - Add items to cart
   - Complete payment
   - Check: Bill should print ONCE

3. **Test Cashier:**
   - Login as cashier
   - Select a table with order
   - Process payment
   - Check: Bill should print ONCE

## Additional Setup Required

### Printer Configuration
See **THERMAL_PRINTER_SETUP.md** for:
- Windows printer settings (paper size: 80mm)
- DIP switch configuration
- Browser print settings
- Troubleshooting guide

### Quick Printer Check:
1. Control Panel → Printers
2. Right-click your thermal printer → Printing Preferences
3. Set:
   - Paper: 80mm
   - Copies: 1
   - Margins: None

## Verification

✅ Code fixed - no double print triggers
✅ Print prevention flag added (`printed` variable)
✅ Reduced close timeout (1000ms → 500ms)
✅ Both admin and cashier printing fixed
✅ Documentation created

## If Still Having Issues

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Check printer driver** - set copies to 1
3. **Disable printer's auto-copy mode**
4. **Test in production build** (not dev mode):
   ```bash
   npm run build
   npm start
   ```

## Files Modified
- `app/admin/billing/page.jsx` (line ~403)
- `app/cashier/bill/[id]/page.jsx` (line ~449)

## Files Created
- `THERMAL_PRINTER_SETUP.md` - Complete printer configuration guide

---

**Status:** ✅ FIXED
**Date:** December 9, 2025
