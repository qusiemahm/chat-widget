# AI-Powered Popover Integration - COMPLETE ✅

## Overview

The TharwahTracker widget now includes **AI-powered popover suggestions** that analyze user behavior in real-time and display contextually relevant popovers based on engagement patterns, intent signals, and frustration indicators.

---

## ✅ What Was Built

### 1. **TharwahTracker Widget Enhancement**

Added complete popover system to `TharwahTracker-V2.js`:

**New Features:**
- ✅ Automatic AI-powered popover suggestions
- ✅ Real-time behavior analysis integration
- ✅ Popover display with animations
- ✅ Interaction tracking (views, clicks, dismissals)
- ✅ Session management (show once per session)
- ✅ Max popovers per session limit
- ✅ Configurable check intervals and delays
- ✅ Multiple color schemes and positions
- ✅ Mobile responsive design

**File Size:** ~1,270 lines (added ~320 lines for popover system)

---

## 🎯 How It Works

```
User Visits Site
      ↓
TharwahTracker initializes
      ↓
Wait 10 seconds (configurable)
      ↓
Check for popover suggestion
      ↓
Call /api/track/suggest-popover/
      ↓
AI analyzes behavior
      ↓
Returns popover suggestion
      ↓
Display popover with animation
      ↓
Track interaction (view/click/dismiss)
      ↓
Repeat every 30 seconds
```

---

## 📦 Configuration

### Basic Setup

```html
<script src="/widgets/TharwahTracker-V2.js"></script>
<script>
  window.tracker = new UniversalTracker({
    // Required
    apiEndpoint: 'http://localhost:8000/api/track/',
    projectId: 'my-website',
    
    // AI-Powered Popovers
    enablePopovers: true,
    popoverApiKey: 'org_abc123.xxxxxxxxxxxxx',
    
    // Optional Popover Settings
    popoverCheckInterval: 30000, // Check every 30 seconds
    popoverMinDelay: 10000, // Wait 10s before first check
    popoverMaxPerSession: 3 // Max 3 popovers per session
  }).init();
</script>
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enablePopovers` | boolean | `true` | Enable/disable AI popover system |
| `popoverApiKey` | string | `null` | **Required** - Organization API key |
| `popoverCheckInterval` | number | `30000` | Milliseconds between checks (30s) |
| `popoverMinDelay` | number | `10000` | Wait time before first check (10s) |
| `popoverMaxPerSession` | number | `3` | Maximum popovers to show per session |

---

## 🎨 Popover Features

### Display Features:
- ✅ **Smooth animations** - Fade in/slide up
- ✅ **Configurable positioning** - Top, bottom, left, right
- ✅ **Color schemes** - Default, info, success, warning, error
- ✅ **Icons** - Optional emoji or icon display
- ✅ **Custom CSS** - Override styles per popover
- ✅ **Auto-dismiss** - Optional timer-based dismissal
- ✅ **Delay** - Optional display delay
- ✅ **Mobile responsive** - Adapts to small screens

### Interaction Features:
- ✅ **View tracking** - Automatically tracked when displayed
- ✅ **Click tracking** - Tracks clicks on links/buttons
- ✅ **Dismiss tracking** - Tracks when user closes
- ✅ **Show once per session** - Respects session settings
- ✅ **Close button** - Easy dismissal

---

## 💡 Example Usage

### Example 1: Dashboard

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Dashboard</title>
</head>
<body>
  <div id="app"><!-- Your app --></div>
  
  <!-- Tracker with AI Popovers -->
  <script src="/widgets/TharwahTracker-V2.js"></script>
  <script>
    window.tracker = new UniversalTracker({
      projectId: 'dashboard',
      apiEndpoint: 'https://api.example.com/api/track/',
      enablePopovers: true,
      popoverApiKey: 'org_abc123.your_api_key',
      popoverCheckInterval: 45000, // Check every 45s
      popoverMaxPerSession: 2, // Max 2 popovers
      debug: true
    }).init();
  </script>
</body>
</html>
```

### Example 2: E-commerce Site

```javascript
window.tracker = new UniversalTracker({
  projectId: 'shop',
  apiEndpoint: 'https://api.shop.com/api/track/',
  enablePopovers: true,
  popoverApiKey: 'org_shop123.xxxxx',
  popoverCheckInterval: 30000,
  popoverMinDelay: 15000, // Wait 15s on product pages
  popoverMaxPerSession: 5, // Show more popovers
  trackPageViews: true,
  trackClicks: true,
  trackScrolls: true,
  trackForms: true // Track cart abandonment
}).init();
```

---

## 🎨 Popover Appearance

### Color Schemes

The widget supports 5 color schemes:

```css
/* Default - Purple */
.tharwah-popover-default { border-left: 4px solid #667eea; }

/* Info - Blue */
.tharwah-popover-info { border-left: 4px solid #4299e1; }

/* Success - Green */
.tharwah-popover-success { border-left: 4px solid #48bb78; }

/* Warning - Orange */
.tharwah-popover-warning { border-left: 4px solid #ed8936; }

/* Error - Red */
.tharwah-popover-error { border-left: 4px solid #f56565; }
```

### Positions

Supports 4 main positions:
- `bottom` (bottom-right) - Default
- `top` (top-right)
- `bottom-start` (bottom-left)
- `top-start` (top-left)

---

## 🔧 API Integration

### Step 1: Get API Key

```bash
POST /api/orgs/{org_id}/keys/
Authorization: Bearer {admin_jwt_token}

{
  "name": "Widget Popover Key",
  "scopes": ["*"],
  "expires_at": "2026-12-31T23:59:59Z"
}

# Returns: org_abc123.xxxxxxxxxxxxxxxxxxxx
```

### Step 2: Configure Widget

```javascript
window.tracker = new UniversalTracker({
  projectId: 'my-site',
  apiEndpoint: 'http://localhost:8000/api/track/',
  enablePopovers: true,
  popoverApiKey: 'org_abc123.xxxxxxxxxxxxxxxxxxxx' // ← Use your key
}).init();
```

### Step 3: Create Popovers in Dashboard

Go to Dashboard → Popovers → Create:

```
Title: "Welcome to Our Platform!"
Content: "Let us show you around..."
Trigger: Auto
Position: bottom
Delay: 2 seconds
Color Scheme: default
Icon: 👋
Show once per session: ✓
Is Active: ✓
```

---

## 📊 Tracking & Analytics

### Automatic Tracking

The widget automatically tracks:

**View Events:**
- Triggered when popover is displayed
- Sent to `/api/track/popover-interaction/`
- Increments `view_count` in database

**Click Events:**
- Triggered when user clicks links/buttons in popover
- Tracks engagement with popover content

**Dismiss Events:**
- Triggered when user clicks close button
- Tracks user dismissal behavior

### View Analytics

Check popover performance in the Dashboard:

```
Dashboard → Popovers

Statistics:
- View Count: 1,234
- Click Count: 456  (37% CTR)
- Dismiss Count: 778  (63% dismiss rate)
```

---

## 🧪 Testing

### Test Popover Suggestions

**1. Check behavior analysis:**
```bash
curl -X POST http://localhost:8000/api/track/analyze-behavior/ \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"session_id": "sess_123"}'
```

**2. Test popover suggestion:**
```bash
curl -X POST http://localhost:8000/api/track/suggest-popover/ \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "sess_123",
    "current_page": "/products"
  }'
```

**3. View in browser:**
```javascript
// Open browser console
window.tracker.getState(); // Check tracking state
window.tracker.checkForPopover(); // Manually trigger check
```

---

## 🔍 Debugging

### Enable Debug Mode

```javascript
window.tracker = new UniversalTracker({
  debug: true, // ← Enable console logging
  enablePopovers: true,
  popoverApiKey: 'YOUR_KEY'
}).init();
```

### Console Output

With debug enabled, you'll see:
```
[UniversalTracker] Tracking started successfully
[UniversalTracker] Popover system started
[UniversalTracker] Popover suggested: Welcome Guide Score: 85
[UniversalTracker] Popover displayed: Welcome Guide
[UniversalTracker] Popover interaction tracked: view 1
```

---

## ⚙️ Advanced Features

### Disable Popovers Temporarily

```javascript
// Disable
window.tracker.config.enablePopovers = false;

// Re-enable
window.tracker.config.enablePopovers = true;
```

### Manually Trigger Popover Check

```javascript
window.tracker.checkForPopover();
```

### Hide Current Popover

```javascript
window.tracker.hidePopover();
```

### Check Popover State

```javascript
console.log(window.tracker.popoverState);
// {
//   shown: Set(1) [1],  // IDs of shown popovers
//   count: 1,           // Count shown this session
//   currentPopover: {...} // Currently displayed popover
// }
```

---

## 📱 Mobile Responsive

Popovers automatically adapt for mobile:

```css
@media (max-width: 640px) {
  .tharwah-popover {
    max-width: calc(100% - 40px);
    left: 20px !important;
    right: 20px !important;
    bottom: 20px !important;
  }
}
```

---

## 🚀 Performance

### Optimizations:
- ✅ **Lazy loading** - Styles injected only when first popover appears
- ✅ **Debounced checks** - Configurable interval (default 30s)
- ✅ **Single popover** - Only one popover displayed at a time
- ✅ **Session limits** - Prevents popover fatigue
- ✅ **Async API calls** - Non-blocking
- ✅ **Minimal DOM** - Clean up on dismiss

### Bundle Size:
- **TharwahTracker-V2.js**: ~40KB (uncompressed)
- **Gzipped**: ~12KB

---

## 🔐 Security

- ✅ API key required for popover suggestions
- ✅ Organization-scoped (can only access own popovers)
- ✅ HTML sanitization (XSS protection)
- ✅ No sensitive data exposed to frontend
- ✅ Rate limiting applied (backend)

---

## 📚 Documentation

**Backend API:**
- `AI-POPOVER-SUGGESTION-API.md`
- `POPOVER-AI-SYSTEM-COMPLETE.md`

**Widget:**
- `POPOVER-WIDGET-INTEGRATION-COMPLETE.md` (this file)

**Widgets Overview:**
- `tharwah-widgets/README.md`

---

## ✅ Summary

**Completed:**
- ✅ AI-powered popover system in TharwahTracker
- ✅ Real-time behavior analysis integration
- ✅ Automatic popover display
- ✅ Interaction tracking (view/click/dismiss)
- ✅ Session management
- ✅ Mobile responsive design
- ✅ Multiple color schemes
- ✅ Configurable timing and limits
- ✅ Dashboard integration
- ✅ API key authentication

**Ready to use in production!** 🚀

**Next Step:** Replace `'YOUR_API_KEY_HERE'` in dashboard/index.html with your actual API key!
