# 🌐 Use Widget on ANY Website

## ✅ YES - Works on Any Site!

Your widget is a **standalone JavaScript file** that works on ANY website - just like jQuery or Google Analytics!

---

## 🚀 Quick Integration (3 Steps)

### Step 1: Copy Widget File
```bash
# Copy this file to your website:
tharwah-widgets/dist/TharwahChat-V1.js
```

### Step 2: Add Configuration
Add this code **before closing `</body>` tag**:
```html
<!-- Chat Widget Configuration -->
<script>
  window.tharwahChatConfig = {
    // Backend API (REQUIRED)
    apiEndpoint: 'http://localhost:8000/api',
    apiKey: 'org_d2e06bbb.1hzazsqKSgpPsGB_W1q_SZwRA2rnqtE9L49HU-J2fHg',
    botId: 5,
    
    // Suggestions
    showSuggestions: true,
    suggestionsLimit: 6,
    
    // UI
    title: 'Chat with us',
    welcomeMessage: '👋 Hi! How can I help you today?',
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    
    // Optional
    debug: true
  };
</script>
```

### Step 3: Load Widget
Add this script tag **after configuration**:
```html
<!-- Load Chat Widget -->
<script src="/path/to/TharwahChat-V1.js"></script>
```

**That's it!** Widget will appear on your site! 🎉

---

## 📋 Complete Example

### For Static HTML Website
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Website</title>
</head>
<body>
    
    <!-- Your website content -->
    <h1>Welcome to My Site</h1>
    <p>Your content here...</p>
    
    
    <!-- ========== ADD WIDGET HERE ========== -->
    
    <!-- Chat Widget Configuration -->
    <script>
      window.tharwahChatConfig = {
        apiEndpoint: 'http://localhost:8000/api',
        apiKey: 'org_d2e06bbb.1hzazsqKSgpPsGB_W1q_SZwRA2rnqtE9L49HU-J2fHg',
        botId: 5,
        showSuggestions: true,
        title: 'Chat with us',
        primaryColor: '#667eea',
      };
    </script>
    
    <!-- Load Chat Widget -->
    <script src="/widgets/TharwahChat-V1.js"></script>
    
</body>
</html>
```

### For React App (in index.html)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>React App</title>
</head>
<body>
    <div id="root"></div>
    
    <!-- Widget Configuration -->
    <script>
      window.tharwahChatConfig = {
        apiEndpoint: 'http://localhost:8000/api',
        apiKey: 'org_d2e06bbb.1hzazsqKSgpPsGB_W1q_SZwRA2rnqtE9L49HU-J2fHg',
        botId: 5,
        showSuggestions: true,
      };
    </script>
    
    <!-- Load Chat Widget -->
    <script src="/widgets/TharwahChat-V1.js"></script>
    
    <!-- Load React App -->
    <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

### For WordPress
```html
<!-- Add to footer.php before </body> -->

<script>
  window.tharwahChatConfig = {
    apiEndpoint: 'https://your-api-domain.com/api',
    apiKey: 'your_api_key_here',
    botId: 5,
    showSuggestions: true,
  };
</script>
<script src="<?php echo get_template_directory_uri(); ?>/js/TharwahChat-V1.js"></script>
```

### For Vue.js App (in index.html)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Vue App</title>
</head>
<body>
    <div id="app"></div>
    
    <!-- Widget Configuration -->
    <script>
      window.tharwahChatConfig = {
        apiEndpoint: 'http://localhost:8000/api',
        apiKey: 'org_d2e06bbb.1hzazsqKSgpPsGB_W1q_SZwRA2rnqtE9L49HU-J2fHg',
        botId: 5,
        showSuggestions: true,
      };
    </script>
    
    <!-- Load Chat Widget -->
    <script src="/widgets/TharwahChat-V1.js"></script>
    
    <!-- Load Vue App -->
    <script type="module" src="/src/main.js"></script>
</body>
</html>
```

### For Shopify
```html
<!-- Add to theme.liquid before </body> -->

<script>
  window.tharwahChatConfig = {
    apiEndpoint: 'https://your-api-domain.com/api',
    apiKey: 'your_api_key_here',
    botId: 5,
    showSuggestions: true,
    title: 'Shop Assistant',
  };
</script>
<script src="{{ 'TharwahChat-V1.js' | asset_url }}"></script>
```

---

## 🌍 Works On Any Platform!

The widget works on:

- ✅ Static HTML websites
- ✅ React apps
- ✅ Vue.js apps
- ✅ Angular apps
- ✅ Next.js sites
- ✅ WordPress sites
- ✅ Shopify stores
- ✅ Wix websites
- ✅ Squarespace
- ✅ Webflow
- ✅ ANY website with HTML!

**Why?** Because it's pure JavaScript - no framework dependencies!

---

## 📂 File Structure on Your Site

```
your-website/
├── index.html                  ← Add scripts here
├── about.html                  ← Add scripts here too
├── contact.html                ← And here
├── js/
│   └── TharwahChat-V1.js      ← Put widget here
└── css/
    └── style.css
```

Or:

```
your-website/
├── public/
│   └── widgets/
│       └── TharwahChat-V1.js  ← Put widget here
└── index.html                  ← Add scripts here
```

**Note:** You can put the widget file anywhere, just update the `src` path in the script tag.

---

## 🎯 Minimal Integration (One-liner)

If widget is hosted elsewhere:

```html
<!-- Widget on CDN or external host -->
<script>window.tharwahChatConfig = {apiEndpoint:'http://localhost:8000/api',apiKey:'org_d2e06bbb.1hzazsqKSgpPsGB_W1q_SZwRA2rnqtE9L49HU-J2fHg',botId:5,showSuggestions:true};</script>
<script src="https://your-cdn.com/TharwahChat-V1.js"></script>
```

---

## 🔧 Configuration Options

### Required Settings
```javascript
{
  apiEndpoint: 'http://localhost:8000/api',  // Your backend URL
  apiKey: 'org_xxx.yyy',                      // Your API key
  botId: 5,                                   // Your bot ID
}
```

### Optional Settings
```javascript
{
  // Suggestions
  showSuggestions: true,          // Show welcome suggestions
  suggestionsLimit: 6,             // Number of suggestions
  
  // UI Customization
  title: 'Chat with us',
  subtitle: 'We reply instantly',
  welcomeMessage: '👋 Hi! How can I help?',
  buttonIcon: '💬',
  position: 'bottom-right',        // or 'bottom-left'
  primaryColor: '#667eea',
  secondaryColor: '#764ba2',
  
  // Behavior
  autoOpen: false,                 // Auto-open on load
  autoOpenDelay: 3000,             // Delay before auto-open
  debug: false,                    // Console logs
}
```

---

## 🎨 Examples for Different Sites

### E-commerce Site
```javascript
window.tharwahChatConfig = {
  apiEndpoint: 'https://api.myshop.com/api',
  apiKey: 'your_key',
  botId: 5,
  showSuggestions: true,
  title: 'Shop Assistant',
  welcomeMessage: '👋 Looking for something? I can help!',
  primaryColor: '#10b981',
  buttonIcon: '🛍️',
};
```

### Support Site
```javascript
window.tharwahChatConfig = {
  apiEndpoint: 'https://api.support.com/api',
  apiKey: 'your_key',
  botId: 5,
  showSuggestions: true,
  title: 'Support Chat',
  welcomeMessage: '👋 Need help? Ask me anything!',
  primaryColor: '#3b82f6',
  buttonIcon: '💡',
};
```

### Educational Site
```javascript
window.tharwahChatConfig = {
  apiEndpoint: 'https://api.academy.com/api',
  apiKey: 'your_key',
  botId: 5,
  showSuggestions: true,
  title: 'Learning Assistant',
  welcomeMessage: '👋 Ready to learn? Let me guide you!',
  primaryColor: '#8b5cf6',
  buttonIcon: '📚',
};
```

---

## 🚀 Production Deployment

### For Production Sites

1. **Update API Endpoint:**
   ```javascript
   apiEndpoint: 'https://your-production-api.com/api',  // Production URL
   ```

2. **Use Production API Key:**
   ```javascript
   apiKey: 'prod_your_production_key',  // Production key
   ```

3. **Disable Debug:**
   ```javascript
   debug: false,  // No console logs in production
   ```

4. **Configure CORS in Backend:**
   ```python
   # backend/.env
   CORS_ALLOWED_ORIGINS=https://yourwebsite.com,https://www.yourwebsite.com
   ```

---

## 📊 Example: Full Implementation

### File: `website/index.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Awesome Website</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    
    <!-- Header -->
    <header>
        <h1>Welcome to My Website</h1>
        <nav>
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
        </nav>
    </header>
    
    <!-- Main Content -->
    <main>
        <h2>Hello World!</h2>
        <p>This is my website content...</p>
    </main>
    
    <!-- Footer -->
    <footer>
        <p>&copy; 2025 My Website</p>
    </footer>
    
    
    <!-- ========================================= -->
    <!-- CHAT WIDGET - Add this before </body>     -->
    <!-- ========================================= -->
    
    <!-- Configure Widget -->
    <script>
      window.tharwahChatConfig = {
        // Backend (REQUIRED)
        apiEndpoint: 'http://localhost:8000/api',
        apiKey: 'org_d2e06bbb.1hzazsqKSgpPsGB_W1q_SZwRA2rnqtE9L49HU-J2fHg',
        botId: 5,
        
        // Features
        showSuggestions: true,
        suggestionsLimit: 6,
        
        // Branding
        title: 'Chat with us',
        welcomeMessage: '👋 Hi! How can I help you today?',
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        buttonIcon: '💬',
        
        // Behavior
        position: 'bottom-right',
        autoOpen: false,
        debug: true,
      };
    </script>
    
    <!-- Load Widget -->
    <script src="js/TharwahChat-V1.js"></script>
    
</body>
</html>
```

---

## ✅ Checklist for New Site

- [ ] Copy `TharwahChat-V1.js` to your site
- [ ] Add configuration script to HTML
- [ ] Add widget script tag to HTML
- [ ] Update `apiEndpoint` (if production)
- [ ] Update `apiKey` (if production)
- [ ] Update `botId` (your bot)
- [ ] Customize colors/text
- [ ] Test on your site
- [ ] Check browser console (F12)
- [ ] Try clicking suggestions

---

## 🎯 Summary

### Question: Can I use widget on any site?
**Answer:** ✅ **YES! Absolutely!**

### How?
1. Copy widget file (`TharwahChat-V1.js`)
2. Add config script to HTML
3. Add widget script tag
4. Done! 🎉

### Where does it work?
**Everywhere!** Any website with an HTML page.

### What do I need to change?
- `apiEndpoint` (your backend URL)
- `apiKey` (your organization key)
- `botId` (your bot ID)
- Optional: colors, text, etc.

---

## 🎉 It's That Simple!

The widget is a **standalone JavaScript file** - just like:
- Google Analytics
- Facebook Pixel
- Intercom
- Drift
- Any other embed widget

**Add script tags → Widget works!** 🚀

---

Last Updated: October 25, 2025  
Widget Version: V1 (28.5 KB)
