# 🎓 Chat Widget Enrollment Form Update

## Summary
Updated the TharwahChat widget to handle **3 types of course enrollments** based on product metadata.

---

## 📋 Course Types

### **Type 1: Date Only** 
*Example: SHRM ACHRM Certificate*

**Criteria:**
- Has `virtual_dates` (future dates available)
- Has 0-1 `locations` (single location or location not relevant)

**Form Shows:**
- ✅ Date dropdown (only future dates)
- ❌ Location dropdown (hidden - uses default location)

**Metadata Example:**
```json
{
  "virtual_dates": ["2025-02-02", "2025-03-09", "2025-04-20"],
  "locations": ["الرياض"],  // Single location (not selectable)
  "course_type": "virtual"
}
```

---

### **Type 2: Date + Location**
*Example: Human Resources Diploma*

**Criteria:**
- Has `virtual_dates` (future dates available)
- Has 2+ `locations` (multiple locations to choose from)

**Form Shows:**
- ✅ Date dropdown (only future dates)
- ✅ Location dropdown (Dammam, Riyadh, Online, etc.)

**Metadata Example:**
```json
{
  "virtual_dates": ["2025-08-24", "2025-11-02", "2026-01-18"],
  "locations": ["Dammam", "Riyadh", "Online"],  // Multiple locations
  "course_type": "virtual"
}
```

---

### **Type 3: Direct Enrollment**
*Example: Self-paced online courses*

**Criteria:**
- No `virtual_dates` OR empty array
- Enrollment via direct link only

**Behavior:**
- Opens `enroll_link` in new tab
- No form needed
- Shows message: "✅ Opening enrollment page..."

**Metadata Example:**
```json
{
  "virtual_dates": [],  // No dates
  "locations": [],
  "enroll_link": "https://academy.tharwah.net/course/self-paced"
}
```

---

## 🔧 Technical Changes

### **1. Enhanced Enrollment Logic**

**File:** `TharwahChat-V1.js` → `showEnrollmentForm()`

```javascript
// Determine enrollment type
const requiresDate = virtualDates.length > 0;
const requiresLocation = locations.length > 1;

// Type 3: No dates - direct enrollment
if (!requiresDate) {
  window.open(enrollLink, '_blank');
  return;
}

// Type 1 & 2: Show form with appropriate fields
```

---

### **2. Date Filtering**

**Only shows future dates:**
```javascript
const today = new Date();
today.setHours(0, 0, 0, 0);

const virtualDates = allDates.filter(date => {
  const courseDate = new Date(date);
  return courseDate >= today;  // Only dates >= today
});
```

**Example:**
- Today: 2025-11-11
- Available dates: 2025-02-02, 2025-11-30, 2025-12-28
- **Filtered result:** 2025-11-30, 2025-12-28 ✅

---

### **3. Dynamic Form Fields**

**Date Field** (Always shown if dates exist):
```html
<label>
  Course Date <span style="color: #ef4444;">*</span>
</label>
<select id="virtual_date" name="virtual_date" required>
  <option value="">Select date...</option>
  <!-- Only future dates -->
  <option value="30-11-2025">Nov 30, 2025</option>
  <option value="28-12-2025">Dec 28, 2025</option>
</select>
```

**Location Field** (Only shown if 2+ locations):
```html
<!-- Only rendered if requiresLocation = true -->
<label>
  Location <span style="color: #ef4444;">*</span>
</label>
<select id="location" name="location" required>
  <option value="">Select location...</option>
  <option value="Dammam">Dammam</option>
  <option value="Riyadh">Riyadh</option>
  <option value="Online">Online</option>
</select>
```

**Hidden Location** (If only 1 location):
```html
<!-- Type 1: Single location passed as hidden field -->
<input type="hidden" name="location" value="الرياض">
```

---

### **4. Multi-Language Support**

**Arabic/English labels:**
```javascript
// Date label
${this.config.language === 'ar' ? 'تاريخ الدورة' : 'Course Date'}

// Location label
${this.config.language === 'ar' ? 'الموقع' : 'Location'}

// Buttons
${this.config.language === 'ar' ? '🎓 التسجيل الآن' : '🎓 Enroll Now'}
${this.config.language === 'ar' ? 'إلغاء' : 'Cancel'}
```

**Date formatting:**
```javascript
const displayDate = new Date(date).toLocaleDateString(
  this.config.language === 'ar' ? 'ar-SA' : 'en-US',
  { year: 'numeric', month: 'short', day: 'numeric' }
);
// AR: ٣٠ نوفمبر ٢٠٢٥
// EN: Nov 30, 2025
```

---

### **5. Form Submission Updates**

**File:** `submitEnrollment(form, messageDiv)`

**Changes:**
1. Removed `training_type` field (no longer needed)
2. Added `location` field handling
3. Location validation (if field exists and required)
4. Arabic error messages
5. Event tracking

**Validation:**
```javascript
// Check date
if (!virtualDate) {
  this.addMessage(
    this.config.language === 'ar' 
      ? '⚠️ يرجى اختيار التاريخ' 
      : '⚠️ Please select a date',
    'bot'
  );
  return;
}

// Check location (if dropdown exists)
const locationField = form.querySelector('#location');
if (locationField && !location) {
  this.addMessage(
    this.config.language === 'ar' 
      ? '⚠️ يرجى اختيار الموقع' 
      : '⚠️ Please select a location',
    'bot'
  );
  return;
}
```

**Submission:**
```javascript
const cartData = new FormData();
cartData.append('add-to-cart', productId);
cartData.append('variation_id', variationId);
cartData.append('quantity', quantity);
cartData.append('virtual_date', virtualDate);  // Always included

if (location) {
  cartData.append('location', location);  // Only if selected
  cartData.append('attribute_location', location);
}
```

---

## 🎨 UI Improvements

### **Before:**
```
┌─────────────────────────┐
│ Training Type*          │  ← Removed
│ [Select type...]  ▼     │
├─────────────────────────┤
│ Course Date*            │
│ [Select date...]  ▼     │
├─────────────────────────┤
│ [Cancel] [Add to Cart]  │
└─────────────────────────┘
```

### **After (Type 1 - Date Only):**
```
┌─────────────────────────┐
│ Course Date*            │
│ [Select date...]  ▼     │  ← Only future dates
├─────────────────────────┤
│ [Cancel] [🎓 Enroll Now]│
└─────────────────────────┘
```

### **After (Type 2 - Date + Location):**
```
┌─────────────────────────┐
│ Course Date*            │
│ [Select date...]  ▼     │
├─────────────────────────┤
│ Location*               │  ← NEW
│ [Select location...] ▼  │
├─────────────────────────┤
│ [Cancel] [🎓 Enroll Now]│
└─────────────────────────┘
```

---

## 📊 Backend Data Flow

### **Backend sends product with metadata:**
```json
{
  "id": 3082,
  "name": "SHRM ACHRM",
  "metadata": {
    "virtual_dates": ["2025-11-30", "2025-12-28"],
    "locations": ["الرياض"],
    "course_type": "virtual",
    "wp_id": 3082,
    "price": 25000,
    "currency": "SAR"
  },
  "enroll_link": "https://academy.tharwah.net/course/shrm"
}
```

### **Widget processes:**
1. Filters `virtual_dates` → Only future dates
2. Checks `locations.length` → 1 location (Type 1)
3. Shows date dropdown only
4. Passes location as hidden field

### **User submits:**
```javascript
POST https://academy.tharwah.net/cart/
FormData:
  - add-to-cart: 3082
  - variation_id: 5728
  - quantity: 1
  - virtual_date: "30-11-2025"
  - location: "الرياض"  ← Hidden field
```

---

## ✅ Testing Checklist

### **Type 1: Date Only**
- [ ] Shows only date dropdown
- [ ] No location dropdown visible
- [ ] Location passed as hidden field
- [ ] Only future dates shown
- [ ] Form validates date selection
- [ ] Successful enrollment

### **Type 2: Date + Location**
- [ ] Shows date dropdown
- [ ] Shows location dropdown
- [ ] Both fields required
- [ ] Only future dates shown
- [ ] Form validates both fields
- [ ] Successful enrollment with location

### **Type 3: Direct Enrollment**
- [ ] No form shown
- [ ] Opens enroll_link in new tab
- [ ] Shows success message
- [ ] No date/location required

### **Edge Cases**
- [ ] No future dates available → Shows error message
- [ ] Empty locations array → Type 3 behavior
- [ ] Past dates filtered out correctly
- [ ] Arabic language displays correctly
- [ ] Form submission errors handled gracefully

---

## 🚀 Deployment Steps

1. **Backup current widget:**
   ```bash
   cp chat-widget/dist/TharwahChat-V1.js chat-widget/dist/TharwahChat-V1.js.backup
   ```

2. **Deploy updated widget:**
   - Updated file is ready in `chat-widget/dist/TharwahChat-V1.js`

3. **Verify backend data:**
   - Ensure all products have correct `virtual_dates` and `locations`
   - Check date formats are consistent (YYYY-MM-DD)

4. **Test on staging:**
   ```html
   <script src="./TharwahChat-V1.js"></script>
   ```

5. **Monitor enrollment submissions:**
   - Check cart data includes date and location
   - Verify WooCommerce receives correct attributes

---

## 📝 Notes

### **Date Format:**
- **Backend sends:** `YYYY-MM-DD` (e.g., "2025-11-30")
- **Widget displays:** Localized format (e.g., "Nov 30, 2025" or "٣٠ نوفمبر ٢٠٢٥")
- **Form submits:** `DD-MM-YYYY` (e.g., "30-11-2025")

### **Location Handling:**
- Single location (`locations: ["الرياض"]`) → Hidden field
- Multiple locations → Dropdown selection
- No locations → Type 3 (direct enrollment)

### **Backwards Compatibility:**
- Old products without `virtual_dates` → Direct enrollment (Type 3)
- Old products with dates → Still works (Type 1 or 2)

---

## 🐛 Troubleshooting

### **Form not showing:**
- Check product has `virtual_dates` with future dates
- Verify `enroll_link` exists for Type 3 courses

### **Location field missing:**
- Check `locations.length >= 2` for Type 2
- Single location should be hidden field

### **Past dates showing:**
- Check system date/time is correct
- Verify date filtering logic runs before render

### **Submission fails:**
- Check network tab for form data
- Verify WooCommerce cart endpoint
- Check variation_id is correct

---

**Updated:** 2025-11-11  
**Version:** 1.1.0  
**Status:** ✅ Ready for Testing
