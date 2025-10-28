# ⚡ Popover Request Control - Quick Summary

## Problem You Reported
"Every time it sends request for suggest popover..."

You were seeing **too many popover requests** because the system had TWO sources:
1. **Periodic checks** - Every 30 seconds automatically
2. **Event-based checks** - When exit_intent, rage_click, etc. happen

This could cause:
- ❌ Too many API requests
- ❌ Unexpected popover appearances  
- ❌ Higher costs (if using AI endpoint)
- ❌ Confusion about when popovers trigger

---

## Solution Added ✅

### **New Configuration Option:**

```javascript
popoverEnablePeriodicChecks: false // Disable periodic background checks
```

### **Result:**
- ✅ Popovers requested **ONLY when specific events happen**
- ✅ No more automatic background checks every 30 seconds
- ✅ Full control over when popover requests occur
- ✅ Clear logging showing request source

---

## Quick Fix for Your Issue

### **Option 1: Event-Based Only (RECOMMENDED)**

```javascript
window.tracker = new UniversalTracker({
  apiEndpoint: 'http://localhost:8000/api/track/',
  enablePopovers: true,
  popoverApiKey: 'your-api-key',
  
  // ⚡ KEY CHANGE: Disable periodic checks
  popoverEnablePeriodicChecks: false,
  
  // Only these events will trigger popover requests:
  immediatePopoverEvents: [
    'exit_intent',      // User tries to leave
    'rage_click',       // User is frustrated
    'form_abandon'      // User abandons form
  ]
}).init();
```

**Result:** Popover requests happen **ONLY** when:
- User moves cursor to leave page (exit_intent)
- User clicks rapidly showing frustration (rage_click)
- User starts but doesn't submit form (form_abandon)

---

### **Option 2: Keep Both (If You Want)**

```javascript
window.tracker = new UniversalTracker({
  apiEndpoint: 'http://localhost:8000/api/track/',
  enablePopovers: true,
  popoverApiKey: 'your-api-key',
  
  // Enable periodic checks
  popoverEnablePeriodicChecks: true,
  popoverCheckInterval: 60000, // Increase to 60 seconds (less frequent)
  popoverMinDelay: 20000, // Wait 20s before first check
  
  // Plus event-based
  immediatePopoverEvents: ['exit_intent', 'rage_click']
}).init();
```

**Result:** Requests happen:
- Every 60 seconds (periodic)
- PLUS when events occur (immediate)

---

## See Which Type of Request

With `debug: true`, console will show:

```javascript
// Periodic check:
[UniversalTracker] 🔍 checkForPopover() called [trigger: periodic]

// Event-based check:
[UniversalTracker] 🔍 checkForPopover() called [trigger: event:exit_intent]

// Manual check:
[UniversalTracker] 🔍 checkForPopover() called [trigger: manual]
```

---

## Comparison

| Configuration | When Requests Happen | Requests/Session |
|---------------|---------------------|------------------|
| **Periodic Only** | Every 30s automatically | ~10-20 |
| **Event-Based Only** | Only on specific events | 1-3 |
| **Both** | Every 30s + events | 10-25+ |

---

## Recommended Setup

For most websites:

```javascript
{
  enablePopovers: true,
  popoverApiKey: 'your-key',
  popoverUseFastEndpoint: true, // Fast = 5ms, $0
  
  // ⚡ Disable periodic, use events only
  popoverEnablePeriodicChecks: false,
  
  // Only critical moments
  immediatePopoverEvents: [
    'exit_intent',
    'form_abandon',
    'rage_click'
  ],
  
  popoverMaxPerSession: 3 // Max 3 popovers total
}
```

**Benefits:**
- ✅ Targeted, contextual popovers
- ✅ Lower API usage
- ✅ Better user experience
- ✅ No unexpected popover appearances

---

## Files Modified

1. **`TharwahTracker-V2.js`**
   - Added `popoverEnablePeriodicChecks` option
   - Added trigger tracking to `checkForPopover()`
   - Added logs showing request source

2. **`POPOVER-REQUEST-CONTROL.md`** (NEW)
   - Complete guide with all options
   - Use case examples
   - Configuration recommendations

3. **`POPOVER-CONTROL-SUMMARY.md`** (THIS FILE)
   - Quick reference
   - Problem + solution summary

---

## Quick Test

1. **Update your code:**
   ```javascript
   popoverEnablePeriodicChecks: false, // Add this line
   ```

2. **Enable debug:**
   ```javascript
   debug: true,
   ```

3. **Trigger exit intent:**
   - Move mouse to top of browser
   - OR click button to simulate

4. **Check console:**
   ```
   Should see ONLY:
   [trigger: event:exit_intent]
   
   Should NOT see:
   [trigger: periodic]
   ```

---

## Need More Control?

See the complete guide: **`POPOVER-REQUEST-CONTROL.md`**

It covers:
- All configuration options
- Multiple use cases
- Performance comparisons
- Troubleshooting tips
- Best practices

---

**Status:** ✅ **FIXED**  
**Version:** 2.0.2  
**Date:** October 2025
