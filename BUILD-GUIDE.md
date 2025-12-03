# 🔨 Build Guide - Tharwah Chat Widget

## Quick Build Command

```bash
npm run minify
```

This single command minifies both files:
- `TharwahChat-V1.js` → `TharwahChat-V1.min.js`
- `TharwahTracker-V2.js` → `TharwahTracker-V2.min.js`

---

## 📊 File Sizes (After Latest Build)

| File | Original | Minified | Compression |
|------|----------|----------|-------------|
| **TharwahChat-V1.js** | 182.7 KB | 133.44 KB | **27% smaller** |
| **TharwahTracker-V2.js** | 59.61 KB | 38.56 KB | **35% smaller** |

---

## 🛠️ Build Process Explained

### What the minify script does:

```json
{
  "scripts": {
    "minify": "terser dist/TharwahChat-V1.js -o dist/TharwahChat-V1.min.js -c -m && terser dist/TharwahTracker-V2.js -o dist/TharwahTracker-V2.min.js -c -m"
  }
}
```

**Terser flags:**
- `-c` (compress) - Removes dead code, simplifies expressions
- `-m` (mangle) - Shortens variable/function names
- `-o` (output) - Specifies output file

---

## 📦 Step-by-Step Instructions

### 1. First Time Setup

If you haven't installed dependencies yet:

```bash
cd C:\Users\qusai\OneDrive\Desktop\Tharwah\Chatbot\chat-widget
npm install
```

This installs `terser@^5.30.0` (already done in your case).

---

### 2. Make Changes to Source Files

Edit the source files in `dist/`:
- `dist/TharwahChat-V1.js`
- `dist/TharwahTracker-V2.js`

---

### 3. Build Minified Versions

```bash
npm run minify
```

**Output:**
```
> @tharwah/chat-widget@1.0.0 minify
> terser dist/TharwahChat-V1.js -o dist/TharwahChat-V1.min.js -c -m && terser dist/TharwahTracker-V2.js -o dist/TharwahTracker-V2.min.js -c -m

✅ Build complete!
```

---

### 4. Verify Build

```bash
ls dist/*.min.js
```

Should show:
- ✅ `TharwahChat-V1.min.js`
- ✅ `TharwahTracker-V2.min.js`

---

## 🌐 Using Minified Files in Production

### CDN (jsDelivr)

After pushing to GitHub:

```html
<!-- Minified versions -->
<script src="https://cdn.jsdelivr.net/gh/qusiemahm/chat-widget@main/dist/TharwahTracker-V2.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/qusiemahm/chat-widget@main/dist/TharwahChat-V1.min.js"></script>
```

### Local/Self-Hosted

```html
<!-- Minified versions -->
<script src="/path/to/dist/TharwahTracker-V2.min.js"></script>
<script src="/path/to/dist/TharwahChat-V1.min.js"></script>
```

---

## 🧪 Advanced Build Options

### Build Individual Files

**Chat widget only:**
```bash
npx terser dist/TharwahChat-V1.js -o dist/TharwahChat-V1.min.js -c -m
```

**Tracker only:**
```bash
npx terser dist/TharwahTracker-V2.js -o dist/TharwahTracker-V2.min.js -c -m
```

---

### Custom Terser Options

**Maximum compression (slower build):**
```bash
npx terser dist/TharwahChat-V1.js -o dist/TharwahChat-V1.min.js \
  -c passes=3,drop_console=true,drop_debugger=true \
  -m toplevel=true
```

**With source maps (for debugging):**
```bash
npx terser dist/TharwahChat-V1.js -o dist/TharwahChat-V1.min.js \
  -c -m --source-map "url='TharwahChat-V1.min.js.map'"
```

---

## 🔄 Automated Build Workflow

### Option 1: Watch Mode (auto-rebuild on changes)

Install `nodemon`:
```bash
npm install --save-dev nodemon
```

Add to `package.json`:
```json
{
  "scripts": {
    "minify": "terser dist/TharwahChat-V1.js -o dist/TharwahChat-V1.min.js -c -m && terser dist/TharwahTracker-V2.js -o dist/TharwahTracker-V2.min.js -c -m",
    "watch": "nodemon --watch dist/*.js --ext js --exec npm run minify"
  }
}
```

Then run:
```bash
npm run watch
```

Now any changes to source files will auto-trigger minification!

---

### Option 2: Pre-commit Hook (auto-build before commit)

Install `husky`:
```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm run minify && git add dist/*.min.js"
```

Now minified files are automatically built and committed!

---

## 📝 Checklist Before Deployment

- [ ] Edit source files (`TharwahChat-V1.js`, `TharwahTracker-V2.js`)
- [ ] Run `npm run minify`
- [ ] Test minified files locally
- [ ] Commit both source and minified files
- [ ] Push to GitHub
- [ ] Update CDN links if using specific commit hash
- [ ] Clear CDN cache if needed

---

## ❓ Troubleshooting

### "terser: command not found"

**Solution:**
```bash
npm install
```

### "Cannot find module 'terser'"

**Solution:**
```bash
npm install --save-dev terser
```

### Minified file is broken/not working

**Check source file syntax:**
```bash
node -c dist/TharwahChat-V1.js
```

If syntax error found, fix the source file first, then re-run minify.

### Minified file is too large

**Use aggressive compression:**
```bash
npx terser dist/TharwahChat-V1.js -o dist/TharwahChat-V1.min.js \
  -c passes=3,drop_console=true,unsafe=true \
  -m toplevel=true
```

**Note:** This removes all `console.log()` statements.

---

## 📊 Compression Analysis

To see detailed compression stats:

```bash
npx terser dist/TharwahChat-V1.js -o dist/TharwahChat-V1.min.js -c -m --verbose
```

---

## 🎯 Best Practices

1. **Always minify before deployment** to production
2. **Keep source files** (non-minified) in version control
3. **Test minified files** locally before pushing
4. **Use source maps** for debugging production issues
5. **Don't edit `.min.js` files directly** - edit source, then rebuild

---

## 🚀 Quick Reference

| Task | Command |
|------|---------|
| Build all | `npm run minify` |
| Build chat only | `npx terser dist/TharwahChat-V1.js -o dist/TharwahChat-V1.min.js -c -m` |
| Build tracker only | `npx terser dist/TharwahTracker-V2.js -o dist/TharwahTracker-V2.min.js -c -m` |
| Check syntax | `node -c dist/TharwahChat-V1.js` |
| Install deps | `npm install` |

---

**Last Build:** 2025-12-03  
**Terser Version:** 5.30.0  
**Status:** ✅ Build Successful
