# 🌐 Language-Aware Cart & Checkout Redirect

## Summary
Updated the TharwahChat widget to redirect to **Arabic cart/checkout pages** when the conversation is in Arabic.

---

## 🔄 **Cart URL Selection**

### **English Conversation:**
```javascript
POST https://academy.tharwah.net/cart/
```

### **Arabic Conversation:**
```javascript
POST https://academy.tharwah.net/ar/السلة/
```

---

## 🎯 **How It Works**

### **Language Detection:**
```javascript
const isArabic = this.config.language === 'ar';

const cartUrl = isArabic 
  ? 'https://academy.tharwah.net/ar/السلة/'
  : 'https://academy.tharwah.net/cart/';
```

### **Language Sources:**
1. **Explicit config:** `window.tharwahChatConfig.language = 'ar'`
2. **HTML lang attribute:** `<html lang="ar">`
3. **Browser language:** `navigator.language.startsWith('ar')`
4. **Default:** `'en'`

---

## 📋 **Complete Flow by Language**

### **🇬🇧 English Flow:**

1. User selects course date (and location if needed)
2. Clicks "🎓 Enroll Now"
3. Form submits to: `https://academy.tharwah.net/cart/`
4. **Cart opens in new tab** (English version)
5. Success message: "✅ Course added to cart! Please complete checkout in the new tab."

**Form Data:**
```
POST https://academy.tharwah.net/cart/
add-to-cart: 3424
quantity: 1
training_type: virtual
virtual_date: 18-1-2026
location: Dammam
```

---

### **🇸🇦 Arabic Flow:**

1. User selects course date (and location if needed)
2. Clicks "🎓 التسجيل الآن"
3. Form submits to: `https://academy.tharwah.net/ar/السلة/`
4. **Cart opens in new tab** (Arabic version)
5. Success message: "✅ تم إضافة الدورة إلى السلة! يرجى إكمال عملية الدفع في النافذة الجديدة."

**Form Data:**
```
POST https://academy.tharwah.net/ar/السلة/
add-to-cart: 3424
quantity: 1
training_type: virtual
virtual_date: 18-1-2026
location: Dammam
```

---

## 🗂️ **URL Structure**

### **English URLs:**
```
Cart:     https://academy.tharwah.net/cart/
Checkout: https://academy.tharwah.net/checkout/
Product:  https://academy.tharwah.net/training-courses/course-name/
```

### **Arabic URLs:**
```
Cart:     https://academy.tharwah.net/ar/السلة/
Checkout: https://academy.tharwah.net/ar/الدفع/
Product:  https://academy.tharwah.net/ar/training-courses/course-name/
```

---

## 🎨 **User Experience Examples**

### **Example 1: English Widget**
```html
<script>
  window.tharwahChatConfig = {
    apiEndpoint: 'https://api.tharwah.net/api',
    apiKey: 'org_xxx.yyy',
    botId: 5,
    language: 'en'  // ← English
  };
</script>
```

**Result:**
- Widget UI in English
- Dates formatted: "Nov 30, 2025"
- Cart opens: `https://academy.tharwah.net/cart/` ✅

---

### **Example 2: Arabic Widget**
```html
<script>
  window.tharwahChatConfig = {
    apiEndpoint: 'https://api.tharwah.net/api',
    apiKey: 'org_xxx.yyy',
    botId: 5,
    language: 'ar'  // ← Arabic
  };
</script>
```

**Result:**
- Widget UI in Arabic (RTL)
- Dates formatted: "2025-11-30" (original format)
- Cart opens: `https://academy.tharwah.net/ar/السلة/` ✅

---

### **Example 3: Auto-Detect from HTML**
```html
<html lang="ar">
<head>
  <script>
    window.tharwahChatConfig = {
      apiEndpoint: 'https://api.tharwah.net/api',
      apiKey: 'org_xxx.yyy',
      botId: 5
      // No language specified - auto-detects from <html lang="ar">
    };
  </script>
</head>
```

**Result:**
- Auto-detects Arabic from HTML lang
- Cart opens: `https://academy.tharwah.net/ar/السلة/` ✅

---

## 🔧 **Implementation Details**

### **Cart URL Selection (in submitEnrollment):**
```javascript
// Line ~3827-3831
const isArabic = this.config.language === 'ar';
const cartUrl = isArabic 
  ? 'https://academy.tharwah.net/ar/السلة/'
  : 'https://academy.tharwah.net/cart/';
```

### **Form Submission:**
```javascript
// Line ~3833-3837
const hiddenForm = document.createElement('form');
hiddenForm.method = 'POST';
hiddenForm.action = cartUrl;  // Language-aware URL
hiddenForm.target = '_blank';  // Open in new tab
hiddenForm.style.display = 'none';
```

---

## 📊 **Language Detection Priority**

```
1. Explicit config.language
   ↓ (if not set)
2. HTML <html lang="ar"> attribute
   ↓ (if not set)
3. Browser language (navigator.language)
   ↓ (if not Arabic)
4. Default: 'en'
```

**Code:**
```javascript
// Line ~47-60 (detectLanguage method)
detectLanguage() {
  const htmlLang = document.documentElement.lang;
  if (htmlLang && htmlLang.toLowerCase().startsWith('ar')) {
    return 'ar';
  }
  
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang && browserLang.toLowerCase().startsWith('ar')) {
    return 'ar';
  }
  
  return 'en';
}
```

---

## 🌍 **Multi-Language Features**

### **1. UI Elements**
| Element | English | Arabic |
|---------|---------|--------|
| Enroll button | 🎓 Enroll Now | 🎓 التسجيل الآن |
| Cancel button | Cancel | إلغاء |
| Date label | Course Date * | تاريخ الدورة * |
| Location label | Location * | الموقع * |
| Loading text | ⏳ Adding to cart... | ⏳ جاري الإضافة... |
| Success message | ✅ Course added to cart! | ✅ تم إضافة الدورة إلى السلة! |

### **2. Date Formatting**
| Language | Format | Example |
|----------|--------|---------|
| English | Month DD, YYYY | Nov 30, 2025 |
| Arabic | YYYY-MM-DD | 2025-11-30 |

### **3. Cart URLs**
| Language | URL |
|----------|-----|
| English | `https://academy.tharwah.net/cart/` |
| Arabic | `https://academy.tharwah.net/ar/السلة/` |

---

## ✅ **Testing Checklist**

### **English Language:**
- [ ] Widget config with `language: 'en'`
- [ ] HTML with `<html lang="en">`
- [ ] Browser language English
- [ ] Enrollment form shows English labels
- [ ] Dates formatted as "Nov 30, 2025"
- [ ] Cart opens at `/cart/`
- [ ] Success message in English

### **Arabic Language:**
- [ ] Widget config with `language: 'ar'`
- [ ] HTML with `<html lang="ar">`
- [ ] Browser language Arabic
- [ ] Enrollment form shows Arabic labels (RTL)
- [ ] Dates show as "2025-11-30"
- [ ] Cart opens at `/ar/السلة/`
- [ ] Success message in Arabic

### **Auto-Detection:**
- [ ] No explicit language → detects from HTML lang
- [ ] No HTML lang → detects from browser
- [ ] No Arabic anywhere → defaults to English

---

## 🐛 **Troubleshooting**

### **Cart opens in wrong language:**

**Problem:** Arabic widget opens English cart

**Solution:** Check language configuration:
```javascript
console.log(window.tharwahChatWidget.config.language);
// Should be 'ar' for Arabic
```

---

### **Arabic cart URL returns 404:**

**Problem:** `/ar/السلة/` URL not working

**Possible causes:**
1. WordPress Arabic pages not configured
2. Permalink structure incorrect
3. WPML/Polylang plugin not active

**Check:**
```bash
# Test if Arabic cart exists
curl https://academy.tharwah.net/ar/السلة/
```

---

### **Language not auto-detecting:**

**Problem:** Widget stays in English despite Arabic HTML

**Solution:** Check detection order:
```javascript
// Force Arabic in config
window.tharwahChatConfig = {
  language: 'ar',  // ← Explicit override
  // ... other config
};
```

---

## 📝 **Notes**

### **WooCommerce Language Handling:**
- WooCommerce should auto-detect language from URL path
- `/ar/السلة/` → Arabic cart interface
- `/cart/` → English cart interface

### **Backend Product Data:**
- Backend returns products with `translations` metadata
- Widget doesn't need to handle product translations
- Product pages already have correct language URLs

### **Form Data:**
- Form data (add-to-cart, quantity, etc.) is **language-independent**
- Only the **destination URL** changes based on language
- WooCommerce processes the same form data regardless of cart language

---

## 🚀 **Deployment Notes**

### **Before Deploying:**
1. ✅ Verify Arabic cart page exists: `https://academy.tharwah.net/ar/السلة/`
2. ✅ Test Arabic checkout page: `https://academy.tharwah.net/ar/الدفع/`
3. ✅ Ensure WPML/Polylang is configured correctly
4. ✅ Test with both languages

### **After Deploying:**
1. Test enrollment in English → Should open `/cart/`
2. Test enrollment in Arabic → Should open `/ar/السلة/`
3. Verify cart items show correctly in both languages
4. Confirm checkout works in both languages

---

## 🎯 **Summary**

✅ **Widget now automatically:**
- Detects conversation language (EN/AR)
- Opens **Arabic cart** (`/ar/السلة/`) for Arabic conversations
- Opens **English cart** (`/cart/`) for English conversations
- Maintains all form data correctly
- Shows appropriate success messages

**Updated:** 2025-11-11  
**Version:** 1.2.0  
**Status:** ✅ Ready for Production
