# 📄 .gitignore Guide

## What's Ignored

### ✅ Currently Ignored (Won't be Committed)

#### Node.js Dependencies
- `node_modules/` - All npm packages (can be reinstalled with `npm install`)
- `package-lock.json` - **(Currently tracked, you can ignore if needed)**

#### Temporary/Troubleshooting Files
- `wordpress-enqueue-solution.php`
- `debug-wordpress-scripts.php`
- `improved-header-integration.html`
- `SOLUTION-*.md` (like `SOLUTION-INFINITE-LOOP.md`)

#### Development Files
- `.env` files (contains secrets)
- `test-*.html`, `debug-*.html`
- Log files (`*.log`, `npm-debug.log`, etc.)
- Backup files (`*.bak`, `*.backup`, `*-old.js`)

#### IDE/Editor Files
- `.vscode/`, `.idea/`
- `*.sublime-project`, `*.sublime-workspace`
- Vim swap files (`*.swp`, `*~`)

#### OS Files
- macOS: `.DS_Store`, `._*`
- Windows: `Thumbs.db`, `Desktop.ini`
- Linux: `.directory`, `.Trash-*`

---

## ✅ What Gets Committed (Important Files)

### Source Files
- ✅ `dist/TharwahChat-V1.js` - Main chat widget source
- ✅ `dist/TharwahTracker-V2.js` - Tracker source
- ✅ `dist/TharwahChat-V1.min.js` - Minified chat widget *(for CDN)*
- ✅ `dist/TharwahTracker-V2.min.js` - Minified tracker *(for CDN)*

### Configuration
- ✅ `package.json` - Project dependencies & scripts
- ✅ `package-lock.json` - Lock file for reproducible builds

### Documentation
- ✅ `README.md`
- ✅ `BUILD-GUIDE.md`
- ✅ `GITIGNORE-GUIDE.md` (this file)
- ✅ `ENROLLMENT_FORM_UPDATE.md`
- ✅ `LANGUAGE_DETECTION_GUIDE.md`
- ✅ Other markdown docs

### Examples
- ✅ `examples/*.html` - Integration examples

---

## 🔧 Customization Options

### Option 1: Don't Commit Minified Files

If you want to build `.min.js` files on the server (not commit them):

**Uncomment these lines in `.gitignore`:**
```gitignore
# dist/*.min.js
# dist/*.min.js.map
```

**Change to:**
```gitignore
dist/*.min.js
dist/*.min.js.map
```

**Pros:**
- Smaller repository
- No binary diffs in commits

**Cons:**
- Must run `npm run minify` after every pull
- CDN (jsDelivr) won't have minified files

---

### Option 2: Ignore package-lock.json

If you're NOT publishing this as an npm package and want flexibility:

**Uncomment in `.gitignore`:**
```gitignore
# package-lock.json
```

**Change to:**
```gitignore
package-lock.json
```

**⚠️ Warning:** This can cause version inconsistencies across environments.

---

### Option 3: Ignore Local Test Files

Add custom patterns for your test files:

```gitignore
# Local test files
my-test-*.html
playground/
scratch/
```

---

## 📊 Git Status After .gitignore

### Before .gitignore:
```bash
$ git status --porcelain
M dist/TharwahChat-V1.js
?? BUILD-GUIDE.md
?? SOLUTION-INFINITE-LOOP.md
?? debug-wordpress-scripts.php
?? dist/TharwahChat-V1.min.js
?? dist/TharwahTracker-V2.min.js
?? improved-header-integration.html
?? node_modules/                    # ❌ 400+ files!
?? package-lock.json
?? wordpress-enqueue-solution.php
```

### After .gitignore:
```bash
$ git status --porcelain
M dist/TharwahChat-V1.js
?? .gitignore                       # ✅ New
?? BUILD-GUIDE.md                   # ✅ Keep
?? dist/TharwahChat-V1.min.js      # ✅ Keep (CDN needs this)
?? dist/TharwahTracker-V2.min.js   # ✅ Keep (CDN needs this)
?? package-lock.json                # ✅ Keep
# node_modules/                     # ✅ Hidden (ignored)
# wordpress-enqueue-solution.php   # ✅ Hidden (ignored)
# debug-wordpress-scripts.php      # ✅ Hidden (ignored)
# SOLUTION-INFINITE-LOOP.md        # ✅ Hidden (ignored)
```

---

## 🚀 Best Practices

### 1. Always Commit .gitignore First
```bash
git add .gitignore
git commit -m "chore: add .gitignore"
```

### 2. Verify What's Ignored
```bash
# Check what's ignored
git status --ignored

# Check specific file
git check-ignore -v node_modules/
```

### 3. Remove Previously Tracked Files
If you already committed files that should be ignored:

```bash
# Remove from git but keep locally
git rm --cached -r node_modules/
git rm --cached wordpress-enqueue-solution.php

# Commit the removal
git commit -m "chore: remove ignored files from tracking"
```

### 4. Global .gitignore for IDE Files
Create a global gitignore for personal IDE files:

```bash
# Create global gitignore
git config --global core.excludesfile ~/.gitignore_global

# Add IDE files to it
echo ".vscode/" >> ~/.gitignore_global
echo ".idea/" >> ~/.gitignore_global
```

---

## 🔍 Common Issues

### Issue 1: File Still Showing Up Despite .gitignore

**Cause:** File was already tracked before .gitignore was added.

**Solution:**
```bash
# Remove from tracking
git rm --cached path/to/file

# Or for directory
git rm --cached -r path/to/directory/

# Commit
git commit -m "chore: untrack ignored files"
```

---

### Issue 2: Want to Commit an Ignored File

**Force add specific ignored file:**
```bash
git add -f path/to/file
```

**Or create exception in .gitignore:**
```gitignore
# Ignore all .log files
*.log

# But keep this one
!important.log
```

---

### Issue 3: Test if File Would Be Ignored

```bash
# Test specific file
git check-ignore -v node_modules/package.json

# Output shows which rule ignores it:
# .gitignore:10:node_modules/    node_modules/package.json
```

---

## 📝 Quick Reference

| Command | Purpose |
|---------|---------|
| `git status` | See untracked/modified files |
| `git status --ignored` | See ignored files |
| `git check-ignore -v <file>` | Check if file is ignored & why |
| `git rm --cached <file>` | Untrack file but keep locally |
| `git add -f <file>` | Force add ignored file |
| `git clean -fdX` | Remove all ignored files |

---

## ⚙️ Recommended Setup

For this Tharwah Chat Widget project:

### Files to Commit:
✅ Source files (`dist/*.js` - non-minified)
✅ Minified files (`dist/*.min.js` - for CDN)
✅ Configuration (`package.json`, `package-lock.json`)
✅ Documentation (`*.md`)
✅ Examples (`examples/*.html`)

### Files to Ignore:
❌ Dependencies (`node_modules/`)
❌ Logs (`*.log`)
❌ IDE files (`.vscode/`, `.idea/`)
❌ OS files (`.DS_Store`, `Thumbs.db`)
❌ Temporary files (`test-*.html`, `debug-*.php`)

---

## 📦 Clean Repository Checklist

- [x] `.gitignore` created
- [ ] Remove `node_modules/` from tracking (if was committed)
- [ ] Commit `.gitignore`
- [ ] Commit source files (`dist/*.js`)
- [ ] Commit minified files (`dist/*.min.js`)
- [ ] Commit `package.json` and `package-lock.json`
- [ ] Push to remote

---

**Last Updated:** 2025-12-03  
**Status:** ✅ Ready to Use
