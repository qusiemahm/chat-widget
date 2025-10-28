# 🎛️ Popover Request Control Guide

## 📊 Understanding Popover Request Types

The tracker has **TWO different ways** to request popovers:

### 1. **Periodic Checks** (Background)
- Runs automatically every X seconds (default: 30s)
- Starts after initial delay (default: 10s)
- Good for: General engagement, time-based offers
- **Can be disabled** if you only want event-based popovers

### 2. **Event-Based Checks** (Immediate)
- Triggered immediately when specific events occur
- Examples: exit_intent, rage_click, form_abandon
- Good for: Contextual, behavior-driven interventions
- **Always runs** when configured events happen

---

## ⚙️ Configuration Options

### **Option 1: Event-Based Only** (RECOMMENDED)

Use this if you want popovers **only when users do something specific** (exit intent, rage clicks, etc.):

```javascript
window.tracker = new UniversalTracker({
  apiEndpoint: 'http://localhost:8000/api/track/',
  debug: true,
  
  // Popover configuration
  enablePopovers: true,
  popoverApiKey: 'your-api-key-here',
  popoverUseFastEndpoint: true,
  
  // ⚡ KEY SETTING: Disable periodic checks
  popoverEnablePeriodicChecks: false, // Only event-based requests
  
  // Events that trigger immediate popover requests
  immediatePopoverEvents: [
    'exit_intent',      // User tries to leave
    'rage_click',       // User is frustrated
    'form_abandon',     // User abandons form
    'form_start',       // User starts filling form
    'scroll_depth'      // User scrolls to milestone
  ]
}).init();
```

**Result:** Popovers are requested **only when these events happen**. No background requests.

---

### **Option 2: Both Periodic + Event-Based**

Use this for **maximum engagement** - periodic checks PLUS immediate event responses:

```javascript
window.tracker = new UniversalTracker({
  apiEndpoint: 'http://localhost:8000/api/track/',
  debug: true,
  
  enablePopovers: true,
  popoverApiKey: 'your-api-key-here',
  
  // ✅ Enable both types
  popoverEnablePeriodicChecks: true, // Enable periodic checks
  popoverCheckInterval: 30000, // Check every 30 seconds
  popoverMinDelay: 10000, // Wait 10s before first periodic check
  
  // Immediate event triggers
  immediatePopoverEvents: [
    'exit_intent',
    'rage_click',
    'form_abandon'
  ]
}).init();
```

**Result:** 
- Periodic check at 10s after page load
- Then every 30s automatically
- PLUS immediate checks when events happen

---

### **Option 3: Periodic Only**

Use this for **time-based engagement** without event triggers:

```javascript
window.tracker = new UniversalTracker({
  apiEndpoint: 'http://localhost:8000/api/track/',
  
  enablePopovers: true,
  popoverApiKey: 'your-api-key-here',
  
  // Enable periodic checks
  popoverEnablePeriodicChecks: true,
  popoverCheckInterval: 45000, // Every 45 seconds
  popoverMinDelay: 15000, // Wait 15s before first check
  
  // ⚡ Disable immediate triggers
  immediatePopoverEvents: [] // Empty array = no immediate checks
}).init();
```

**Result:** Only time-based periodic checks, no event-based triggers.

---

## 📋 Configuration Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `popoverEnablePeriodicChecks` | boolean | `true` | Enable/disable periodic background checks |
| `popoverCheckInterval` | number | `30000` | Milliseconds between periodic checks |
| `popoverMinDelay` | number | `10000` | Delay before first periodic check (ms) |
| `immediatePopoverEvents` | array | See below | Events that trigger immediate checks |
| `popoverMaxPerSession` | number | `3` | Max popovers to show per session |

**Default Immediate Events:**
```javascript
[
  'exit_intent',
  'rage_click',
  'form_abandon',
  'form_start',
  'scroll_depth'
]
```

---

## 🔍 Console Logs - Understanding Request Sources

When `debug: true`, you'll see logs indicating the source of each request:

### **Periodic Check:**
```
[UniversalTracker] 🔍 checkForPopover() called [trigger: periodic]
[UniversalTracker] 📡 Requesting popover from: http://localhost:8000/api/track/suggest-popover-fast/
```

### **Event-Based Check:**
```
[UniversalTracker] ✅ Event triggers immediate popover check: exit_intent
[UniversalTracker] ⚡ Requesting popover for event: exit_intent
[UniversalTracker] 🔍 checkForPopover() called [trigger: event:exit_intent]
[UniversalTracker] 📡 Requesting popover from: http://localhost:8000/api/track/suggest-popover-fast/
```

### **Manual Check:**
```
[UniversalTracker] 🔍 checkForPopover() called [trigger: manual]
```

---

## 🎯 Common Use Cases

### **Use Case 1: High-Value Event-Based Interventions**

**Goal:** Only show popovers for critical moments (exit intent, abandonment)

```javascript
{
  enablePopovers: true,
  popoverEnablePeriodicChecks: false, // ❌ No periodic checks
  immediatePopoverEvents: [
    'exit_intent',      // High-value retention
    'form_abandon',     // Conversion recovery
    'rage_click'        // Frustration help
  ],
  popoverMaxPerSession: 2 // Only 2 high-impact popovers
}
```

---

### **Use Case 2: Gentle Time-Based Engagement**

**Goal:** Periodically check if user needs help, no aggressive event triggers

```javascript
{
  enablePopovers: true,
  popoverEnablePeriodicChecks: true, // ✅ Periodic only
  popoverCheckInterval: 60000, // Every 60 seconds (gentle)
  popoverMinDelay: 20000, // Wait 20s before first
  immediatePopoverEvents: [], // ❌ No immediate triggers
  popoverMaxPerSession: 2
}
```

---

### **Use Case 3: Aggressive Multi-Channel Engagement**

**Goal:** Maximum engagement - both periodic AND event-based

```javascript
{
  enablePopovers: true,
  popoverEnablePeriodicChecks: true, // ✅ Periodic checks
  popoverCheckInterval: 20000, // Every 20s (aggressive)
  popoverMinDelay: 5000, // Quick first check
  immediatePopoverEvents: [
    'exit_intent',
    'rage_click',
    'form_abandon',
    'form_start',
    'scroll_depth'
  ],
  popoverMaxPerSession: 5 // Allow more popovers
}
```

---

### **Use Case 4: Scroll-Based Content Recommendations**

**Goal:** Show popovers only at scroll milestones

```javascript
{
  enablePopovers: true,
  popoverEnablePeriodicChecks: false, // ❌ No periodic
  immediatePopoverEvents: [
    'scroll_depth' // ✅ Only scroll events
  ],
  popoverMaxPerSession: 3 // One per scroll milestone
}
```

---

## 🚫 Rate Limiting & Protection

The system automatically prevents **over-requesting**:

### **Built-in Protection:**
1. **Max Popovers Per Session** - Default: 3
   ```javascript
   popoverMaxPerSession: 3 // Won't request after 3 shown
   ```

2. **No Duplicate While Showing** - Won't request if popover is currently displayed
   ```javascript
   // Automatically checks:
   if (this.popoverState.currentPopover) {
     return; // Skip check
   }
   ```

3. **Show Once Per Session** - Backend can configure popovers to show only once
   ```python
   # Backend setting
   show_once_per_session = True
   ```

4. **Cooldown Between Requests** - Built-in delays
   - Periodic: `popoverCheckInterval` (default 30s)
   - Immediate: 100ms delay after event

---

## 🧪 Testing Different Configurations

### **Test 1: See Only Event-Based Requests**

```javascript
window.tracker = new UniversalTracker({
  apiEndpoint: 'http://localhost:8000/api/track/',
  debug: true, // ⚠️ Enable logging
  
  enablePopovers: true,
  popoverApiKey: 'your-key',
  popoverEnablePeriodicChecks: false, // Disable periodic
  
  immediatePopoverEvents: ['exit_intent']
}).init();

// Trigger exit intent
const event = new MouseEvent('mouseout', { clientY: -10 });
document.dispatchEvent(event);

// Check console - should see ONLY:
// "checkForPopover() called [trigger: event:exit_intent]"
```

### **Test 2: See Periodic Requests**

```javascript
window.tracker = new UniversalTracker({
  debug: true,
  enablePopovers: true,
  popoverApiKey: 'your-key',
  popoverEnablePeriodicChecks: true,
  popoverCheckInterval: 10000, // 10 seconds for testing
  popoverMinDelay: 5000, // 5 seconds delay
  immediatePopoverEvents: []
}).init();

// Wait and watch console - should see:
// After 5s: "checkForPopover() called [trigger: periodic]"
// After 15s: "checkForPopover() called [trigger: periodic]"
// After 25s: "checkForPopover() called [trigger: periodic]"
```

---

## 📊 Request Flow Diagram

```
Page Load
    │
    ├─ popoverEnablePeriodicChecks = true?
    │  ├─ YES → Wait popoverMinDelay (10s)
    │  │         │
    │  │         └─ Check every popoverCheckInterval (30s)
    │  │            ├─ Request: [trigger: periodic]
    │  │            └─ Loop...
    │  │
    │  └─ NO → Skip periodic checks
    │
    └─ User Events
       │
       ├─ exit_intent → In immediatePopoverEvents?
       │  └─ YES → Immediate Request: [trigger: event:exit_intent]
       │
       ├─ rage_click → In immediatePopoverEvents?
       │  └─ YES → Immediate Request: [trigger: event:rage_click]
       │
       └─ Other events...
```

---

## 💡 Recommendations

### **For Most Websites:**
```javascript
{
  popoverEnablePeriodicChecks: false, // ❌ Disable periodic
  immediatePopoverEvents: [
    'exit_intent',
    'form_abandon',
    'rage_click'
  ]
}
```
✅ **Best for:** User experience, targeted interventions, lower API costs

### **For High-Engagement Content Sites:**
```javascript
{
  popoverEnablePeriodicChecks: true, // ✅ Enable periodic
  popoverCheckInterval: 45000, // 45s (not too aggressive)
  immediatePopoverEvents: [
    'scroll_depth',
    'exit_intent'
  ]
}
```
✅ **Best for:** News sites, blogs, educational content

### **For E-Commerce:**
```javascript
{
  popoverEnablePeriodicChecks: false, // ❌ Disable periodic
  immediatePopoverEvents: [
    'exit_intent',
    'form_abandon', // Cart abandonment
    'rage_click'
  ],
  popoverMaxPerSession: 2 // Don't annoy shoppers
}
```
✅ **Best for:** Conversion optimization, cart recovery

---

## 📈 Performance Impact

| Configuration | Requests/Session | API Cost (Fast) | Best For |
|---------------|------------------|-----------------|----------|
| **Event-Only** | 1-3 (as needed) | $0 | User experience |
| **Periodic (60s)** | ~1 per minute | $0 | Gentle engagement |
| **Periodic (30s)** | ~2 per minute | $0 | Active engagement |
| **Both** | 2-5+ | $0 | Maximum conversion |

*Cost assumes using fast rule-based endpoint (popoverUseFastEndpoint: true)*

---

## 🐛 Troubleshooting

### **Too Many Requests?**
```javascript
// Solution 1: Disable periodic checks
popoverEnablePeriodicChecks: false

// Solution 2: Increase interval
popoverCheckInterval: 60000 // 60 seconds

// Solution 3: Lower max per session
popoverMaxPerSession: 2
```

### **Not Enough Requests?**
```javascript
// Solution 1: Enable periodic checks
popoverEnablePeriodicChecks: true

// Solution 2: Add more event triggers
immediatePopoverEvents: [
  'exit_intent',
  'rage_click',
  'form_abandon',
  'form_start',
  'scroll_depth'
]

// Solution 3: Increase max per session
popoverMaxPerSession: 5
```

### **Can't Tell Which Type of Request?**
```javascript
// Enable debug mode
debug: true

// Then check console for:
// [trigger: periodic] = background check
// [trigger: event:exit_intent] = event-based check
```

---

## 🎉 Summary

**New Control Added:**
- ✅ `popoverEnablePeriodicChecks` - Enable/disable periodic requests
- ✅ Trigger tracking in logs - See exactly why each request happened
- ✅ Better control over request frequency

**Recommended Configuration:**
```javascript
{
  popoverEnablePeriodicChecks: false, // Event-based only
  immediatePopoverEvents: ['exit_intent', 'rage_click', 'form_abandon']
}
```

**This gives you:**
- 🎯 Targeted, contextual popovers
- 💰 Lower API costs
- ⚡ Better user experience
- 📊 Clear visibility into request sources

---

**Last Updated:** October 2025  
**Version:** 2.0.2  
**Status:** ✅ **Production Ready**
