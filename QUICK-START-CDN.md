# Quick Start: Widget Deployment Options

## ⚡ TL;DR - Use It NOW

The widget is **ready to use** but NOT on jsDelivr yet. Here are your options:

---

## ✅ Option 1: Self-Host (Immediate - No CDN)

**Best for:** Immediate deployment, full control

### Step 1: Upload Widget Files

```bash
# Upload to your web server
scp dist/TharwahChat-V1.js user@yourserver.com:/var/www/html/widgets/
scp dist/TharwahTracker-V2.js user@yourserver.com:/var/www/html/widgets/
```

### Step 2: Enable CORS (if serving from different domain)

**Nginx:**
```nginx
location /widgets/ {
    add_header Access-Control-Allow-Origin *;
    add_header Cache-Control "public, max-age=31536000";
    expires 1y;
}
```

**Apache (.htaccess):**
```apache
<FilesMatch "\.(js)$">
    Header set Access-Control-Allow-Origin "*"
    Header set Cache-Control "public, max-age=31536000"
</FilesMatch>
```

### Step 3: Use in HTML

```html
<script>
  window.tharwahChatConfig = {
    apiEndpoint: 'https://api.yourdomain.com',
    apiKey: 'your-api-key',
    botId: 1
  };
</script>
<script src="https://yourdomain.com/widgets/TharwahChat-V1.js"></script>
```

**✅ WORKS NOW** - No waiting, no CDN needed!

---

## ⏳ Option 2: jsDelivr (Coming Soon)

**Best for:** Free global CDN, auto-caching, fast delivery

### Current Status: ❌ NOT Available Yet

**Why?**
- Repository is on `git.softylus.com` (private GitLab)
- jsDelivr requires **public GitHub repository**
- Need to create version tags

### To Enable:

#### Option A: Mirror to Public GitHub

```bash
# 1. Create public GitHub repo: github.com/username/tharwah-widget

# 2. Add GitHub as remote
git remote add github git@github.com:username/tharwah-widget.git

# 3. Commit dist files
git add dist/
git commit -m "Add widget files for CDN"

# 4. Create version tag
git tag v1.0.0

# 5. Push to GitHub
git push github main
git push github v1.0.0
```

#### Option B: Make Current Repo Public

```bash
# On git.softylus.com:
# Settings → General → Visibility → Public

# Then commit and tag:
git add dist/
git commit -m "Add widget files"
git tag v1.0.0
git push origin main
git push origin v1.0.0

# jsDelivr URL format:
# https://cdn.jsdelivr.net/gh/tharwah/chatbot-widget@1.0.0/dist/TharwahChat-V1.js
```

**⏳ Availability:** 12-24 hours after pushing to public GitHub

---

## 📦 Option 3: NPM + unpkg

**Best for:** Versioned releases, npm ecosystem integration

### Current Status: ❌ NOT Published Yet

### To Enable:

```bash
# 1. Install npm (if not installed)
# Download from: https://nodejs.org/

# 2. Publish to npm
npm login
npm publish --access public

# 3. Use unpkg CDN
# https://unpkg.com/@tharwah/chat-widget@1.0.0/dist/TharwahChat-V1.js
```

**⏳ Availability:** Immediate after `npm publish`

---

## 🎯 Recommended Path for Your Use Case

### For Development/Testing
```
✅ Use Option 1 (Self-Host)
```

### For Production (Small Scale)
```
✅ Use Option 1 (Self-Host) with your Django backend
```

### For Production (Large Scale / Multiple Sites)
```
⏳ Wait for Option 2 (jsDelivr) - Global CDN, faster delivery
```

---

## 💻 Implementation Example (Self-Hosted)

### Full Working Example:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
</head>
<body>
    <h1>Welcome to My Site</h1>
    <p>Content goes here...</p>

    <!-- Tharwah Chat Widget -->
    <script>
      window.tharwahChatConfig = {
        apiEndpoint: 'https://api.yourdomain.com',
        apiKey: 'org_abc123.xxxxxxxxxxx', // Your API key
        botId: 1,
        welcomeMessage: '👋 Hi! How can I help you?',
        position: 'bottom-right',
        showSuggestions: true
      };
    </script>
    <script src="https://yourdomain.com/widgets/TharwahChat-V1.js"></script>
</body>
</html>
```

---

## 📊 Quick Comparison

| Method | Available | Speed | Cost | Setup Time |
|--------|-----------|-------|------|------------|
| **Self-Host** | ✅ Now | Medium | Server cost | 5 min |
| **jsDelivr** | ❌ Soon | Fast | Free | 1-2 days |
| **unpkg (npm)** | ❌ Soon | Fast | Free | 30 min |

---

## 🚀 Quick Deploy to Django (Recommended Now)

If your Django backend is already running:

```bash
# 1. Copy files
cp dist/TharwahChat-V1.js ../chatbot/staticfiles/js/widgets/
cp dist/TharwahTracker-V2.js ../chatbot/staticfiles/js/widgets/

# 2. Collect static
cd ../chatbot
python manage.py collectstatic --noinput

# 3. Use in HTML
# https://yourdomain.com/static/js/widgets/TharwahChat-V1.js
```

**✅ Works immediately** with your existing infrastructure!

---

## 🔑 Getting API Key

```bash
# In Django shell
python manage.py shell

# Create API key for widget
from apps.api_keys.models import ApiKey
from apps.organizations.models import Organization

org = Organization.objects.first()
key = ApiKey.objects.create(
    organization=org,
    name="Widget API Key",
    scopes=['chat:write', 'chat:read']
)
print(f"API Key: {key.plaintext_key}")
# Save this key! It won't be shown again.
```

Or use the Django admin: `/admin/api_keys/apikey/`

---

## ✅ Final Answer to Your Question

### "Is it ready to use with jsDelivr?"

**NO, not yet.** But you have working alternatives:

1. **NOW:** Self-host on your domain ✅
2. **SOON:** Push to public GitHub → jsDelivr auto-indexes it
3. **LATER:** Publish to npm → Use unpkg

### Fastest Way to Use It:

```html
<!-- Copy file to your server, then: -->
<script>
  window.tharwahChatConfig = {
    apiEndpoint: 'https://your-api.com',
    apiKey: 'your-key',
    botId: 1
  };
</script>
<script src="https://yourdomain.com/widgets/TharwahChat-V1.js"></script>
```

**Works in 5 minutes!** 🚀

---

## 📞 Need Help?

- Check `CDN-DEPLOYMENT-GUIDE.md` for detailed instructions
- Check `CDN-INTEGRATION-EXAMPLES.html` for code examples
- Contact your development team for API keys
