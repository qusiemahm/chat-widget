# 🌐 Language Detection & URL Structure Guide

## Overview
The TharwahChat widget automatically detects the conversation language and redirects to the appropriate language-specific pages.

---

## 🔍 **How Language is Detected**

### **Detection Order (Priority):**

```
1. Explicit Configuration
   window.tharwahChatConfig.language = 'ar'
   ↓ (if not set)

2. HTML Language Attribute
   <html lang="ar">
   ↓ (if not set)

3. Browser Language
   navigator.language = 'ar-SA'
   ↓ (if not Arabic)

4. Default
   'en'
```

---

## 📋 **Detection Logic Code**

### **Method: `detectLanguage()`** (Lines 47-60)

```javascript
detectLanguage() {
  // Priority 1: HTML lang attribute
  const htmlLang = document.documentElement.lang;
  if (htmlLang && htmlLang.toLowerCase().startsWith('ar')) {
    return 'ar';
  }
  
  // Priority 2: Browser language
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang && browserLang.toLowerCase().startsWith('ar')) {
    return 'ar';
  }
  
  // Priority 3: Default
  return 'en';
}
```

### **Constructor: `language` initialization** (Line 20)

```javascript
this.config = {
  // ...
  language: config.language || this.detectLanguage(), // ← Detection happens here
  // ...
};
```

---

## 🗂️ **URL Structure by Language**

### **English URLs:**

| Page | URL |
|------|-----|
| **Cart** | `https://academy.tharwah.net/cart/` |
| **Checkout** | `https://academy.tharwah.net/checkout/` |
| **Product** | `https://academy.tharwah.net/training-courses/course-name/` |
| **My Account** | `https://academy.tharwah.net/my-account/` |

### **Arabic URLs:**

| Page | URL |
|------|-----|
| **Cart** | `https://academy.tharwah.net/ar/السلة/` |
| **Checkout** | `https://academy.tharwah.net/ar/الدفع/` |
| **Product** | `https://academy.tharwah.net/ar/training-courses/course-name/` |
| **My Account** | `https://academy.tharwah.net/ar/my-account/` |

---

## 🔄 **Enrollment Flow**

### **Complete User Journey:**

```
┌─────────────────────────────────────────────────────┐
│ 1. User Interacts with Chat Widget                 │
│    Language: Detected (ar or en)                    │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 2. Product Card Shows in Chat                       │
│    - SHRM ACHRM Course                             │
│    - SAR 25,000                                     │
│    - [🎓 Enroll Now] button                         │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 3. Enrollment Form in Chat                          │
│    English:                   Arabic:               │
│    - Course Date*             - تاريخ الدورة*       │
│    - Location*                - الموقع*            │
│    - [🎓 Enroll Now]          - [🎓 التسجيل الآن]   │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 4. Form Submission                                  │
│    POST [language-aware URL]                        │
│    - add-to-cart: 3424                             │
│    - quantity: 1                                    │
│    - training_type: virtual                         │
│    - virtual_date: 18-1-2026                       │
│    - location: Dammam                              │
└─────────────────────────────────────────────────────┘
                        ↓
        ┌───────────────────────────────┐
        │  Language = 'ar'?             │
        └───────────────────────────────┘
         YES ↓                    ↓ NO
┌────────────────────┐   ┌──────────────────────┐
│ Opens in New Tab:  │   │ Opens in New Tab:    │
│ /ar/السلة/         │   │ /cart/               │
│ (Arabic Cart)      │   │ (English Cart)       │
└────────────────────┘   └──────────────────────┘
         ↓                         ↓
┌────────────────────┐   ┌──────────────────────┐
│ WooCommerce Cart   │   │ WooCommerce Cart     │
│ (Arabic Interface) │   │ (English Interface)  │
└────────────────────┘   └──────────────────────┘
         ↓                         ↓
         User clicks "Proceed to Checkout"
         ↓                         ↓
┌────────────────────┐   ┌──────────────────────┐
│ Auto-redirects to: │   │ Auto-redirects to:   │
│ /ar/الدفع/         │   │ /checkout/           │
│ (Arabic Checkout)  │   │ (English Checkout)   │
└────────────────────┘   └──────────────────────┘
```

---

## ⚙️ **Implementation in Widget**

### **Cart URL Selection** (Lines 3827-3831)

```javascript
// Detect if Arabic
const isArabic = this.config.language === 'ar';

// Select appropriate cart URL
const cartUrl = isArabic 
  ? 'https://academy.tharwah.net/ar/السلة/'      // Arabic cart
  : 'https://academy.tharwah.net/cart/';         // English cart
```

### **Form Submission** (Lines 3833-3865)

```javascript
// Create form with language-aware action
const hiddenForm = document.createElement('form');
hiddenForm.method = 'POST';
hiddenForm.action = cartUrl;  // ← Language-aware URL
hiddenForm.target = '_blank';  // Open in new tab

// Add form fields (language-independent)
const fields = {
  'add-to-cart': productId,
  'quantity': quantity,
  'training_type': 'virtual',
  'virtual_date': virtualDate
};

// Add location if provided
if (location) {
  fields['location'] = location;
}

// Submit form
document.body.appendChild(hiddenForm);
hiddenForm.submit();
```

---

## 📊 **Example Scenarios**

### **Scenario 1: Arabic Website**

**Setup:**
```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>أكاديمية ثروة</title>
</head>
<body>
  <script>
    window.tharwahChatConfig = {
      apiEndpoint: 'https://api.tharwah.net/api',
      apiKey: 'org_xxx.yyy',
      botId: 5
      // No language specified - will auto-detect from <html lang="ar">
    };
  </script>
  <script src="./TharwahChat-V1.js"></script>
</body>
</html>
```

**Result:**
1. Widget detects: `language = 'ar'` (from HTML lang attribute)
2. UI shows in Arabic with RTL
3. Date format: `2025-11-30` (original)
4. Enrollment submits to: `https://academy.tharwah.net/ar/السلة/` ✅
5. WooCommerce cart opens in Arabic
6. User proceeds to: `https://academy.tharwah.net/ar/الدفع/` (automatically)

---

### **Scenario 2: English Website**

**Setup:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tharwah Academy</title>
</head>
<body>
  <script>
    window.tharwahChatConfig = {
      apiEndpoint: 'https://api.tharwah.net/api',
      apiKey: 'org_xxx.yyy',
      botId: 5
      // No language specified - will auto-detect from <html lang="en">
    };
  </script>
  <script src="./TharwahChat-V1.js"></script>
</body>
</html>
```

**Result:**
1. Widget detects: `language = 'en'` (from HTML lang attribute)
2. UI shows in English
3. Date format: `Nov 30, 2025` (formatted)
4. Enrollment submits to: `https://academy.tharwah.net/cart/` ✅
5. WooCommerce cart opens in English
6. User proceeds to: `https://academy.tharwah.net/checkout/` (automatically)

---

### **Scenario 3: Explicit Language Override**

**Setup:**
```html
<!DOCTYPE html>
<html lang="en">  <!-- HTML says English -->
<head>
  <meta charset="UTF-8">
  <title>Tharwah Academy</title>
</head>
<body>
  <script>
    window.tharwahChatConfig = {
      apiEndpoint: 'https://api.tharwah.net/api',
      apiKey: 'org_xxx.yyy',
      botId: 5,
      language: 'ar'  // ← EXPLICIT OVERRIDE: Force Arabic
    };
  </script>
  <script src="./TharwahChat-V1.js"></script>
</body>
</html>
```

**Result:**
1. Widget uses: `language = 'ar'` (explicit config overrides HTML)
2. UI shows in Arabic with RTL
3. Enrollment submits to: `https://academy.tharwah.net/ar/السلة/` ✅
4. Cart and checkout open in Arabic

**Use Case:** English website but want Arabic chat widget

---

### **Scenario 4: Browser Language Detection**

**Setup:**
```html
<!DOCTYPE html>
<html>  <!-- No lang attribute -->
<head>
  <meta charset="UTF-8">
  <title>Tharwah Academy</title>
</head>
<body>
  <script>
    window.tharwahChatConfig = {
      apiEndpoint: 'https://api.tharwah.net/api',
      apiKey: 'org_xxx.yyy',
      botId: 5
      // No language specified, no HTML lang attribute
      // Will use browser language
    };
  </script>
  <script src="./TharwahChat-V1.js"></script>
</body>
</html>
```

**Browser:** `navigator.language = 'ar-SA'` (Arabic Saudi Arabia)

**Result:**
1. Widget detects: `language = 'ar'` (from browser language)
2. UI shows in Arabic
3. Enrollment submits to: `https://academy.tharwah.net/ar/السلة/` ✅

---

## 🔧 **How WooCommerce Handles Checkout**

### **Automatic Language Preservation:**

When WooCommerce detects the URL structure, it automatically maintains the language:

**From Arabic Cart:**
```
User at: https://academy.tharwah.net/ar/السلة/
Clicks: "متابعة إلى الدفع" (Proceed to Checkout)
Redirects to: https://academy.tharwah.net/ar/الدفع/
✅ Language preserved
```

**From English Cart:**
```
User at: https://academy.tharwah.net/cart/
Clicks: "Proceed to Checkout"
Redirects to: https://academy.tharwah.net/checkout/
✅ Language preserved
```

### **Why This Works:**

WooCommerce (with WPML/Polylang) recognizes the URL structure:
- URLs starting with `/ar/` → Arabic interface
- URLs without `/ar/` → English interface

The plugin automatically generates correct checkout URLs based on the current cart URL.

---

## 🎯 **Testing Language Detection**

### **Test 1: Explicit Configuration**
```javascript
window.tharwahChatConfig = {
  language: 'ar'  // Should use Arabic
};
```
**Expected:** Widget in Arabic, Cart at `/ar/السلة/`

---

### **Test 2: HTML Lang Attribute**
```html
<html lang="ar">
```
```javascript
window.tharwahChatConfig = {
  // No language specified
};
```
**Expected:** Widget in Arabic, Cart at `/ar/السلة/`

---

### **Test 3: Browser Language**
```javascript
// Set browser to Arabic
navigator.language = 'ar-SA';

window.tharwahChatConfig = {
  // No language specified
};
```
**Expected:** Widget in Arabic, Cart at `/ar/السلة/`

---

### **Test 4: Default**
```html
<html>  <!-- No lang -->
```
```javascript
// Browser set to English
navigator.language = 'en-US';

window.tharwahChatConfig = {
  // No language specified
};
```
**Expected:** Widget in English, Cart at `/cart/`

---

## 🐛 **Debugging Language Issues**

### **Check Current Language:**

Open browser console and run:
```javascript
// Check widget language
console.log('Widget Language:', window.tharwahChatWidget?.config?.language);

// Check detection sources
console.log('HTML Lang:', document.documentElement.lang);
console.log('Browser Lang:', navigator.language);
```

**Expected Output (Arabic):**
```
Widget Language: ar
HTML Lang: ar
Browser Lang: ar-SA
```

**Expected Output (English):**
```
Widget Language: en
HTML Lang: en
Browser Lang: en-US
```

---

### **Force Language for Testing:**

```javascript
// Force Arabic
window.tharwahChatConfig = {
  apiEndpoint: 'https://api.tharwah.net/api',
  apiKey: 'org_xxx.yyy',
  botId: 5,
  language: 'ar',  // ← Force Arabic
  debug: true      // ← Enable logging
};
```

Check console for:
```
[TharwahChat] Widget rendered successfully
[TharwahChat] Language: ar
[TharwahChat] Cart URL: https://academy.tharwah.net/ar/السلة/
```

---

## 📝 **Summary**

### **Language Detection:**
1. **Explicit config** (`language: 'ar'`) - Highest priority
2. **HTML lang** (`<html lang="ar">`) - Second priority
3. **Browser language** (`navigator.language`) - Third priority
4. **Default** (`'en'`) - Fallback

### **URL Routing:**
- **English:** Cart → `/cart/` → Checkout → `/checkout/`
- **Arabic:** Cart → `/ar/السلة/` → Checkout → `/ar/الدفع/`

### **Automatic Behavior:**
✅ Widget detects language automatically  
✅ Opens correct cart URL (language-specific)  
✅ WooCommerce maintains language through checkout  
✅ User sees consistent language throughout journey  

---

**Updated:** 2025-11-11  
**Version:** 1.2.0  
**Status:** ✅ Production Ready
