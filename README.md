# 🚀 Tharwah Widgets

**Embeddable analytics tracker and AI chatbot for any website**

Two powerful widgets that work on any website with just a few lines of code:
- 📊 **TharwahTracker** - Advanced analytics and behavior tracking
- 💬 **TharwahChat** - AI-powered chat widget

---

## 🎯 Quick Start

### **All-in-One Integration** (Tracker + Chat)

Add this code before the closing `</body>` tag:

```html
<!-- Load Tracker -->
<script src="https://yourdomain.com/widgets/TharwahTracker-V2.js"></script>
<script>
  window.tracker = new UniversalTracker({
    projectId: 'your-website',
    apiEndpoint: 'https://yourdomain.com/api/track/',
    trackPageViews: true,
    trackClicks: true,
    trackScrolls: true
  }).init();
</script>

<!-- Load Chat Widget -->
<script>
  window.tharwahChatConfig = {
    title: 'Chat with us',
    welcomeMessage: '👋 Hi! How can I help you?',
    apiEndpoint: 'https://yourdomain.com/api'
  };
</script>
<script src="https://yourdomain.com/widgets/TharwahChat-V1.js"></script>
```

**That's it!** You now have:
- ✅ Full analytics tracking
- ✅ AI chatbot with floating button
- ✅ Auto-integrated (chat events tracked automatically)

---

## 📦 What's Inside

```
tharwah-widgets/
├── dist/
│   ├── TharwahTracker-V2.js    # Analytics tracker (~29KB)
│   └── TharwahChat-V1.js       # Chat widget (~12KB)
├── examples/
│   ├── basic.html              # Minimal example
│   ├── chat-only.html          # Chat widget only
│   ├── tracker-only.html       # Tracker only
│   ├── full-featured.html      # All features
│   └── custom-styling.html     # Custom colors/styling
├── docs/
│   ├── TRACKER-GUIDE.md        # Tracker documentation
│   ├── CHAT-GUIDE.md           # Chat documentation
│   └── INTEGRATION.md          # Integration guide
└── README.md                   # This file
```

---

## 📊 TharwahTracker

### **Features**
- Page view tracking
- Click tracking
- Scroll depth tracking
- Form interaction tracking
- Performance monitoring
- Error tracking
- Session management
- Event batching

### **Basic Usage**
```html
<script src="./dist/TharwahTracker-V2.js"></script>
<script>
  window.tracker = new UniversalTracker({
    projectId: 'my-website',
    apiEndpoint: 'http://localhost:8000/api/track/'
  }).init();
</script>
```

### **Configuration Options**
```javascript
{
  projectId: 'your-project-id',          // Required
  apiEndpoint: 'https://api.example.com/track/', // Required
  debug: false,                          // Enable console logs
  trackPageViews: true,                  // Track page views
  trackClicks: true,                     // Track clicks
  trackScrolls: true,                    // Track scroll depth
  trackForms: true,                      // Track form interactions
  trackErrors: true,                     // Track JavaScript errors
  trackPerformance: true,                // Track performance metrics
  batchSize: 10,                         // Events per batch
  batchInterval: 10000                   // Batch interval (ms)
}
```

### **Track Custom Events**
```javascript
// Simple event
tracker.event('button_click', { button: 'subscribe' });

// Event with data
tracker.event('product_view', {
  productId: '123',
  productName: 'Widget Pro',
  price: 99.99
});
```

### **Get Current State**
```javascript
const state = tracker.getState();
console.log(state);
// {
//   pageViews: 5,
//   totalClicks: 25,
//   maxScrollDepth: 75,
//   timeOnPage: 45,
//   engagement: 67
// }
```

---

## 💬 TharwahChat

### **Features**
- Floating chat button
- Slide-up chat window
- AI-powered responses
- Message history
- Typing indicators
- Auto-tracking integration
- Mobile responsive
- Fully customizable

### **Basic Usage**
```html
<script>
  window.tharwahChatConfig = {
    welcomeMessage: '👋 Hi! How can I help you?',
    apiEndpoint: 'http://localhost:8000/api'
  };
</script>
<script src="./dist/TharwahChat-V1.js"></script>
```

### **Configuration Options**
```javascript
{
  // Backend
  apiEndpoint: 'https://api.example.com',
  botId: 1,
  organizationId: null,
  
  // Content
  welcomeMessage: '👋 Hi! How can I help you?',
  title: 'Chat with us',
  subtitle: 'We reply instantly',
  buttonIcon: '💬',
  
  // Appearance
  position: 'bottom-right',  // or 'bottom-left'
  primaryColor: '#667eea',
  secondaryColor: '#764ba2',
  
  // Behavior
  autoOpen: false,
  autoOpenDelay: 3000,
  debug: false
}
```

### **Programmatic Control**
```javascript
// Open chat
window.tharwahChatWidget.open();

// Close chat
window.tharwahChatWidget.close();

// Send message
window.tharwahChatWidget.sendMessageProgrammatically('Hello');

// Destroy widget
window.tharwahChatWidget.destroy();
```

### **Custom Styling**
```javascript
window.tharwahChatConfig = {
  title: 'Support',
  primaryColor: '#10b981',    // Green
  secondaryColor: '#059669',
  buttonIcon: '🌟'
};
```

---

## 🎨 Examples

### **1. Minimal Setup**
```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <h1>Hello World</h1>
    
    <!-- Tharwah Chat -->
    <script>
      window.tharwahChatConfig = {
        apiEndpoint: 'http://localhost:8000/api'
      };
    </script>
    <script src="./dist/TharwahChat-V1.js"></script>
</body>
</html>
```

### **2. Full Featured**
```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <h1>Hello World</h1>
    
    <!-- Tracker -->
    <script src="./dist/TharwahTracker-V2.js"></script>
    <script>
      window.tracker = new UniversalTracker({
        projectId: 'my-site',
        apiEndpoint: 'http://localhost:8000/api/track/',
        trackPageViews: true,
        trackClicks: true,
        trackScrolls: true,
        debug: true
      }).init();
    </script>
    
    <!-- Chat -->
    <script>
      window.tharwahChatConfig = {
        title: 'Support Team',
        welcomeMessage: '👋 Need help? We\'re here!',
        apiEndpoint: 'http://localhost:8000/api',
        primaryColor: '#667eea',
        autoOpen: false
      };
    </script>
    <script src="./dist/TharwahChat-V1.js"></script>
</body>
</html>
```

### **3. Auto-Open Chat After 5 Seconds**
```html
<script>
  window.tharwahChatConfig = {
    welcomeMessage: '👋 Hi there! Need help?',
    apiEndpoint: 'http://localhost:8000/api',
    autoOpen: true,
    autoOpenDelay: 5000
  };
</script>
<script src="./dist/TharwahChat-V1.js"></script>
```

---

## 🔗 Integration Guide

### **Step 1: Host the Files**

**Option A: Self-Hosted**
```bash
# Copy files to your web server
cp dist/TharwahTracker-V2.js /var/www/html/widgets/
cp dist/TharwahChat-V1.js /var/www/html/widgets/
```

**Option B: Django Static Files**
```bash
# Copy to Django staticfiles
cp dist/*.js path/to/django/staticfiles/js/
python manage.py collectstatic
```

**Option C: CDN**
Upload to your CDN and reference via CDN URL.

### **Step 2: Add to Your Website**

```html
<!-- At the bottom of your HTML, before </body> -->
<script src="/path/to/TharwahTracker-V2.js"></script>
<script>
  window.tracker = new UniversalTracker({
    projectId: 'my-website',
    apiEndpoint: 'https://your-api.com/track/'
  }).init();
</script>

<script>
  window.tharwahChatConfig = {
    apiEndpoint: 'https://your-api.com'
  };
</script>
<script src="/path/to/TharwahChat-V1.js"></script>
```

### **Step 3: Test**

Open your website and:
1. Check browser console (F12) for any errors
2. Look for chat button in bottom-right corner
3. Click chat button to test widget
4. Check network tab for API calls

---

## 🌐 Use Cases

### **E-commerce Website**
```javascript
window.tharwahChatConfig = {
  title: 'Shopping Assistant',
  welcomeMessage: '👋 Looking for something? I can help!',
  primaryColor: '#f59e0b',
  secondaryColor: '#d97706'
};
```

### **SaaS Dashboard**
```javascript
window.tharwahChatConfig = {
  title: 'Support',
  welcomeMessage: '🚀 Need help with your account?',
  position: 'bottom-right'
};
```

### **Landing Page**
```javascript
window.tharwahChatConfig = {
  welcomeMessage: '👋 Questions? Chat with us!',
  autoOpen: true,
  autoOpenDelay: 10000  // Auto-open after 10 seconds
};
```

---

## 📱 Platforms Supported

Works on:
- ✅ Plain HTML websites
- ✅ React / Next.js / Vue / Angular
- ✅ WordPress
- ✅ Shopify
- ✅ Wix / Squarespace (with custom code injection)
- ✅ Django / Flask / Express
- ✅ Any platform that supports custom JavaScript

---

## 🔧 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📊 Tracking Events

When both tracker and chat are loaded, these events are automatically tracked:

- `chat_opened` - User opens chat
- `chat_closed` - User closes chat
- `chat_message_sent` - User sends message
- `chat_response_received` - Bot responds

You can view these in your backend analytics dashboard.

---

## 🎯 Features

### **TharwahTracker**
- ✅ Page view tracking
- ✅ Click event tracking
- ✅ Scroll depth tracking (25%, 50%, 75%, 90%, 100%)
- ✅ Form interaction tracking
- ✅ Performance monitoring
- ✅ Error tracking
- ✅ Custom event tracking
- ✅ Session management
- ✅ Event batching (efficient API calls)
- ✅ LocalStorage persistence
- ✅ Privacy-friendly (no cookies)

### **TharwahChat**
- ✅ Floating chat button
- ✅ Slide-up chat interface
- ✅ Message history
- ✅ Typing indicators
- ✅ Auto-scroll to latest message
- ✅ Keyboard shortcuts (Enter to send)
- ✅ Mobile responsive
- ✅ Customizable colors and branding
- ✅ Auto-open option
- ✅ Position control (left/right)
- ✅ Tracking integration
- ✅ Programmatic API

---

## 📚 Documentation

- **[Tracker Guide](docs/TRACKER-GUIDE.md)** - Complete tracker documentation
- **[Chat Guide](docs/CHAT-GUIDE.md)** - Complete chat documentation
- **[Integration Guide](docs/INTEGRATION.md)** - Step-by-step integration
- **[Examples](examples/)** - Working code examples

---

## 🚢 Deployment

### **Development**
```bash
# Serve locally for testing
python -m http.server 8080
# Open: http://localhost:8080/examples/basic.html
```

### **Production**

1. **Upload files to your server:**
   ```bash
   scp dist/*.js user@server:/var/www/html/widgets/
   ```

2. **Update URLs in your HTML:**
   ```html
   <script src="https://yourdomain.com/widgets/TharwahTracker-V2.js"></script>
   <script src="https://yourdomain.com/widgets/TharwahChat-V1.js"></script>
   ```

3. **Update API endpoints:**
   ```javascript
   apiEndpoint: 'https://yourdomain.com/api'
   ```

4. **Enable CORS on your backend** (if different domain)

---

## 🔐 Security

- No sensitive data is stored in widgets
- All API calls use your configured endpoint
- No external dependencies (self-contained)
- No tracking cookies (uses localStorage)
- Respects user privacy

---

## 📦 File Sizes

- **TharwahTracker-V2.js**: ~29KB (uncompressed)
- **TharwahChat-V1.js**: ~12KB (uncompressed)
- **Total**: ~41KB for both widgets

**Minified** (with gzip):
- TharwahTracker: ~8KB
- TharwahChat: ~4KB
- **Total: ~12KB** (very lightweight!)

---

## 🆘 Troubleshooting

### **Chat button not appearing?**
1. Check browser console for errors (F12)
2. Verify script URL is correct
3. Check `tharwahChatConfig` is defined before loading script
4. Clear browser cache and reload

### **Tracking not working?**
1. Check API endpoint is correct
2. Verify CORS is enabled on backend
3. Check network tab for failed requests
4. Enable `debug: true` to see console logs

### **Styling conflicts?**
The widgets use unique class names (`tharwah-*`) to avoid conflicts. If you still have issues, check CSS specificity.

---

## 🤝 Support

- **Documentation**: See `docs/` folder
- **Examples**: See `examples/` folder
- **Issues**: Contact your Tharwah support team

---

## 📄 License

Proprietary - © Tharwah 2025

---

## 🎉 Get Started Now!

1. **Copy the files** from `dist/` to your server
2. **Add the script tags** to your HTML
3. **Configure** with your settings
4. **Test** and enjoy!

It's that simple! 🚀

---

## 📞 Quick Links

- [View Examples](examples/)
- [Read Tracker Guide](docs/TRACKER-GUIDE.md)
- [Read Chat Guide](docs/CHAT-GUIDE.md)
- [Integration Guide](docs/INTEGRATION.md)

**Happy tracking and chatting!** 💬📊
