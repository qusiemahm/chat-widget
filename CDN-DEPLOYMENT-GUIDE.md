# CDN Deployment Guide for Tharwah Widgets

## Current Status: ⚠️ NOT CDN-Ready Yet

The widget files are **functional** but need preparation for CDN deployment (jsDelivr, unpkg, etc.)

---

## What's Needed for jsDelivr/CDN Deployment

### Option 1: GitHub + jsDelivr (Recommended)

**Requirements:**
1. ✅ Widget files ready (`TharwahChat-V1.js`, `TharwahTracker-V2.js`)
2. ❌ Public GitHub repository
3. ❌ Version tags (e.g., v1.0.0, v1.0.1)
4. ❌ Files committed to repository
5. ⚠️ Optional: Minified versions for faster loading

**Steps to Enable:**

1. **Push files to GitHub:**
   ```bash
   git add dist/
   git commit -m "Add widget files for CDN deployment"
   git push origin main
   ```

2. **Create a version tag:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. **Use jsDelivr URLs:**
   ```html
   <!-- Latest version -->
   <script src="https://cdn.jsdelivr.net/gh/username/chatbot-widget@latest/dist/TharwahChat-V1.js"></script>
   
   <!-- Specific version (recommended for production) -->
   <script src="https://cdn.jsdelivr.net/gh/username/chatbot-widget@1.0.0/dist/TharwahChat-V1.js"></script>
   ```

---

### Option 2: NPM + jsDelivr/unpkg

**Requirements:**
1. Create `package.json`
2. Publish to npm registry
3. Use npm-based CDNs

**Steps:**

1. **Create package.json:**
   ```json
   {
     "name": "@softylus/chat-widget",
     "version": "1.0.0",
     "description": "Softylus Chat Widget",
     "main": "dist/TharwahChat-V1.js",
     "files": ["dist/"],
     "keywords": ["chatbot", "widget", "ai"],
     "author": "Softylus",
     "license": "MIT"
   }
   ```

2. **Publish to npm:**
   ```bash
   npm publish --access public
   ```

3. **Use CDN URLs:**
   ```html
   <!-- jsDelivr -->
   <script src="https://cdn.jsdelivr.net/npm/@tharwah/chat-widget@1.0.0/dist/TharwahChat-V1.js"></script>
   
   <!-- unpkg -->
   <script src="https://unpkg.com/@tharwah/chat-widget@1.0.0/dist/TharwahChat-V1.js"></script>
   ```

---

### Option 3: Self-Hosted CDN (Quick Solution)

**If you have a web server:**

1. **Upload files to your server:**
   ```bash
   scp dist/*.js user@yourserver.com:/var/www/widgets/
   ```

2. **Enable CORS (nginx example):**
   ```nginx
   location /widgets/ {
       add_header Access-Control-Allow-Origin *;
       add_header Cache-Control "public, max-age=31536000";
   }
   ```

3. **Use your URLs:**
   ```html
   <script src="https://yourdomain.com/widgets/TharwahChat-V1.js"></script>
   ```

---

## Current File Sizes

| File | Size | Gzipped (est.) |
|------|------|----------------|
| TharwahChat-V1.js | ~41 KB | ~12 KB |
| TharwahTracker-V2.js | ~45 KB | ~13 KB |
| TharwahTracker-V2-NEW-POPOVER.js | ~7 KB | ~3 KB |

---

## Optimization Recommendations

### 1. Create Minified Versions

**Using Terser (JavaScript minifier):**

```bash
# Install terser
npm install -g terser

# Minify files
terser dist/TharwahChat-V1.js -o dist/TharwahChat-V1.min.js -c -m
terser dist/TharwahTracker-V2.js -o dist/TharwahTracker-V2.min.js -c -m
```

**Expected savings:**
- Original: ~41 KB → Minified: ~25 KB → Gzipped: ~8 KB

### 2. Add Version Info

Add to the top of each file:
```javascript
/**
 * TharwahChat Widget
 * @version 1.0.0
 * @license MIT
 * @author Tharwah
 */
```

### 3. Add Integrity Hashes (SRI)

Generate SRI hashes for security:
```bash
# Linux/Mac
cat dist/TharwahChat-V1.js | openssl dgst -sha384 -binary | openssl base64 -A

# PowerShell
Get-FileHash -Algorithm SHA384 dist/TharwahChat-V1.js | Select-Object -ExpandProperty Hash
```

Usage:
```html
<script 
  src="https://cdn.example.com/TharwahChat-V1.js"
  integrity="sha384-HASH_HERE"
  crossorigin="anonymous"
></script>
```

---

## Quick Start: Self-Hosted (Immediate Solution)

**If you want to use it NOW without CDN:**

1. **Copy files to Django static folder:**
   ```bash
   cp dist/*.js ../chatbot/staticfiles/js/widgets/
   ```

2. **Collect static files:**
   ```bash
   cd ../chatbot
   python manage.py collectstatic --noinput
   ```

3. **Use in HTML:**
   ```html
   <!-- Assuming Django serves at yourdomain.com -->
   <script src="https://yourdomain.com/static/js/widgets/TharwahChat-V1.js"></script>
   ```

---

## Recommended Deployment Path

For **production-ready CDN deployment**, follow this order:

### Phase 1: Current State (Self-Hosted)
1. ✅ Widget files are functional
2. ✅ Can be self-hosted immediately
3. ⚠️ Need to commit `dist/` folder
4. ⚠️ Need to push to repository

### Phase 2: Basic CDN Ready
1. Commit and push dist/ files
2. Create version tags
3. If using GitHub, enable jsDelivr access
4. Test CDN URLs

### Phase 3: Optimized CDN
1. Create minified versions
2. Add SRI hashes
3. Set up versioning strategy
4. Create npm package (optional)

---

## Testing CDN Deployment

**Test checklist:**
- [ ] Files load without CORS errors
- [ ] Widget initializes correctly
- [ ] API calls work (check authentication)
- [ ] Styles render properly
- [ ] No console errors
- [ ] Works on different domains
- [ ] Mobile responsive

**Test HTML:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Widget CDN Test</title>
</head>
<body>
    <h1>CDN Test Page</h1>
    
    <!-- Your CDN URL -->
    <script>
      window.tharwahChatConfig = {
        apiEndpoint: 'https://api.yourdomain.com',
        apiKey: 'your-api-key-here',
        botId: 1
      };
    </script>
    <script src="YOUR_CDN_URL_HERE/TharwahChat-V1.js"></script>
</body>
</html>
```

---

## Security Considerations

1. **API Key Protection:**
   - Widget exposes API key in client-side code
   - Use widget-specific API keys with limited scopes
   - Implement rate limiting on backend

2. **CORS Configuration:**
   - Configure allowed origins on backend
   - Don't use wildcard (*) in production

3. **Content Security Policy:**
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="script-src 'self' https://cdn.jsdelivr.net;">
   ```

---

## Next Steps

**To make widget CDN-ready NOW:**

```bash
# 1. Commit the dist folder
cd C:\Users\qusai\OneDrive\Desktop\Tharwah\ChatBot\chatbot-widget
git add dist/
git add README.md
git commit -m "Add CDN-ready widget files with updated chat button design"

# 2. Create version tag
git tag -a v1.0.0 -m "Release v1.0.0 - Initial CDN release"

# 3. Push to repository
git push origin main
git push origin v1.0.0
```

**After pushing:**
- Repository: `git.softylus.com/tharwah/chatbot-widget`
- If repository is **public**, jsDelivr will auto-discover it
- If **private**, you need self-hosting or npm publishing

---

## Support

For issues:
1. Check browser console for errors
2. Verify API endpoint is accessible
3. Check CORS headers on server
4. Ensure API key has correct permissions

**Contact:** Your development team
