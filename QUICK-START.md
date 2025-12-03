# 🚀 Quick Start - Tharwah Chat Widget

## ⚠️ IMPORTANT: Correct Directory

You have multiple projects in `Chatbot/` folder:

```
Chatbot/
├── chat-widget/     ← YOU ARE HERE (correct for minify)
├── chatbot/         ← Different project
├── chatbot-main/    ← Different project
└── dashboard/       ← Different project
```

---

## 📂 Always Navigate to `chat-widget` First

```powershell
# From anywhere, run this first:
cd "C:\Users\qusai\OneDrive\Desktop\Tharwah\Chatbot\chat-widget"

# Then run your commands
npm run minify
```

---

## ⚡ Quick Commands

### Build Minified Files
```powershell
cd "C:\Users\qusai\OneDrive\Desktop\Tharwah\Chatbot\chat-widget"
npm run minify
```

**Output:**
- ✅ `dist/TharwahChat-V1.min.js` - 133.44 KB
- ✅ `dist/TharwahTracker-V2.min.js` - 38.56 KB

---

### Check Git Status
```powershell
cd "C:\Users\qusai\OneDrive\Desktop\Tharwah\Chatbot\chat-widget"
git status
```

---

### Install Dependencies
```powershell
cd "C:\Users\qusai\OneDrive\Desktop\Tharwah\Chatbot\chat-widget"
npm install
```

---

### Commit Changes
```powershell
cd "C:\Users\qusai\OneDrive\Desktop\Tharwah\Chatbot\chat-widget"
git add .
git commit -m "your message"
git push origin main
```

---

## 🔍 How to Check Current Directory

```powershell
# Show current directory
pwd

# Should output:
# C:\Users\qusai\OneDrive\Desktop\Tharwah\Chatbot\chat-widget
```

If you see `chatbot` instead of `chat-widget`, you're in the wrong place!

---

## 🛠️ One-Line Commands (Copy-Paste Ready)

### Build Only
```powershell
cd "C:\Users\qusai\OneDrive\Desktop\Tharwah\Chatbot\chat-widget" ; npm run minify
```

### Build + Check Status
```powershell
cd "C:\Users\qusai\OneDrive\Desktop\Tharwah\Chatbot\chat-widget" ; npm run minify ; git status
```

### Full Workflow: Build + Commit + Push
```powershell
cd "C:\Users\qusai\OneDrive\Desktop\Tharwah\Chatbot\chat-widget" ; npm run minify ; git add dist/*.min.js ; git commit -m "build: update minified files" ; git push origin main
```

---

## 📊 Latest Build Status

**Last Successful Build:** 2025-12-03 11:06 AM

| File | Size | Status |
|------|------|--------|
| TharwahChat-V1.js | 182.79 KB | Source ✅ |
| TharwahChat-V1.min.js | 133.44 KB | Minified ✅ |
| TharwahTracker-V2.js | 59.61 KB | Source ✅ |
| TharwahTracker-V2.min.js | 38.56 KB | Minified ✅ |

---

## 💡 Pro Tips

### Create PowerShell Alias
Add to your PowerShell profile for quick access:

```powershell
# Edit profile
notepad $PROFILE

# Add this line:
function chat-widget { cd "C:\Users\qusai\OneDrive\Desktop\Tharwah\Chatbot\chat-widget" }

# Save and reload
. $PROFILE

# Now you can just type:
chat-widget
npm run minify
```

### Use VS Code Terminal
If using VS Code, open the `chat-widget` folder:

```powershell
code "C:\Users\qusai\OneDrive\Desktop\Tharwah\Chatbot\chat-widget"
```

Then all terminal commands run in the correct directory automatically!

---

## ❌ Common Mistakes

### Mistake 1: Wrong Directory
```powershell
# ❌ WRONG
PS C:\Users\qusai\OneDrive\Desktop\Tharwah\Chatbot\chatbot> npm run minify
# Error: Missing script: "minify"

# ✅ CORRECT
PS C:\Users\qusai\OneDrive\Desktop\Tharwah\Chatbot\chat-widget> npm run minify
# Success!
```

### Mistake 2: Forgetting to cd First
```powershell
# ❌ WRONG (from wrong directory)
npm run minify

# ✅ CORRECT (cd first)
cd "C:\Users\qusai\OneDrive\Desktop\Tharwah\Chatbot\chat-widget"
npm run minify
```

---

## 📝 Checklist

Before running any command:

- [ ] Check current directory: `pwd`
- [ ] Navigate to chat-widget: `cd "...\chat-widget"`
- [ ] Verify you're in the right place: `pwd` should end with `chat-widget`
- [ ] Then run your command: `npm run minify`

---

**Remember:** Always `cd` to `chat-widget` first! 🎯

**Last Updated:** 2025-12-03
