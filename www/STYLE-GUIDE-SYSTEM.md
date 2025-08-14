# Sonic AI Style Guide System

A comprehensive, automated style guide management system for the Sonic AI Voice Generator App.

## 🎯 **System Overview**

This system ensures **100% consistency** across all components and pages by:
- **Centralized CSS Design System** (`sonic-ai-style-guide.css`)
- **Automated Component Validation** (`style-guide-validator.js`)
- **Master Style Guide Manager** (`style-guide-master.js`)
- **Configuration-Driven Enforcement** (`sonic-ai-style-config.json`)

## 📁 **File Structure**

```
www/
├── css/
│   └── sonic-ai-style-guide.css          # Centralized design system
├── js/
│   ├── style-guide-validator.js          # Component validation
│   └── style-guide-master.js            # Master management system
├── sonic-ai-style-config.json           # Configuration & rules
├── sonic-ai-component-library.html      # Live documentation
└── STYLE-GUIDE-SYSTEM.md               # This documentation
```

## 🎨 **Design System Components**

### **Colors**
```css
/* Brand Purple Palette */
--brand-primary: #6366F1
--brand-secondary: #8B5CF6
--brand-accent: #A855F7

/* Grayscale System */
--black-900: #000000 (Pure Black)
--black-800: #1F2937 (Dark Gray)
--black-400: #9CA3AF (Light Gray)
--black-300: #D1D5DB (Lighter Gray)
--white: #FFFFFF (Pure White)
```

### **Typography**
```css
/* Font Family */
--font-primary: 'Inter', system-ui, sans-serif

/* Font Sizes */
--font-size-xs: 12px    /* Caption 2 */
--font-size-sm: 13px    /* Caption 1 */
--font-size-md: 16px    /* Subhead */
--font-size-lg: 17px    /* Body */
--font-size-xl: 20px    /* Headline */
--font-size-2xl: 22px   /* Title 3 */
--font-size-3xl: 28px   /* Title 2 */
--font-size-4xl: 34px   /* Title 1 */
--font-size-5xl: 41px   /* Large Title */
```

### **Spacing System**
```css
--space-xs: 4px
--space-sm: 8px
--space-md: 16px
--space-lg: 24px
--space-xl: 32px
--space-2xl: 48px
```

## 🧩 **Component Standards**

### **Buttons** ✅
```html
<!-- ✅ CORRECT -->
<button class="btn btn-primary btn-lg">Primary Action</button>
<button class="btn btn-secondary btn-md">Secondary Action</button>
<button class="btn btn-ghost btn-sm">Tertiary Action</button>

<!-- ❌ DEPRECATED -->
<button class="action-button">Old Style</button>
<button class="submit-btn">Old Style</button>
```

**Required Classes:**
- **Base**: `btn`
- **Variant**: `btn-primary` | `btn-secondary` | `btn-ghost`
- **Size**: `btn-sm` | `btn-md` | `btn-lg`

**Fixed Heights**
- `btn-sm` → `var(--control-height-sm)` (40px)
- `btn-md` → `var(--control-height-md)` (48px)
- `btn-lg` → `var(--control-height-lg)` (52px)

### **Form Elements** ✅
```html
<!-- ✅ CORRECT -->
<div class="form-group">
    <label class="form-label">Username</label>
    <input type="text" class="form-input" placeholder="Enter username">
</div>

<!-- ❌ DEPRECATED -->
<div class="form-group">
    <label>Username</label>
    <input type="text" placeholder="Enter username">
</div>
```

**Required Classes:**
- **Labels**: `form-label`
- **Inputs**: `form-input`
- **Container**: `form-group`

**Sizing**
- Default input height: `var(--control-height-md)` (48px)
- For mockups like auth CTAs: use `btn btn-primary btn-lg` and keep containers transparent.

### **Cards** ✅
```html
<!-- ✅ CORRECT -->
<div class="card">
    <div class="card-header">
        <h3>Card Title</h3>
    </div>
    <div class="card-body">
        <p>Card content goes here</p>
    </div>
    <div class="card-footer">
        <button class="btn btn-primary btn-md">Action</button>
    </div>
</div>

<!-- ❌ DEPRECATED -->
<div class="panel">
    <div class="panel-body">Content</div>
</div>
```

### **Typography** ✅
```html
<!-- ✅ CORRECT -->
<h1 class="text-4xl font-bold text-white">Large Title</h1>
<h2 class="text-3xl font-semibold text-white">Section Title</h2>
<p class="text-md text-gray-400">Body text</p>

<!-- Brand Logo Special Case -->
<div class="brand-logo text-3xl">Sonic AI</div>
```

### **Notifications** ✅
```html
<!-- ✅ CORRECT -->
<div class="notification notification-success">
    <i class="fas fa-check-circle mr-sm"></i>
    Success message
</div>

<div class="notification notification-error">
    <i class="fas fa-exclamation-circle mr-sm"></i>
    Error message
</div>
```

## 🔧 **Automation Features**

### **1. Real-Time Validation**
The system automatically validates components as you code:
```javascript
// Automatically runs on page load and DOM changes
window.styleGuideValidator.validateAll();
```

### **2. Auto-Migration** (Development Only)
Deprecated classes are automatically replaced:
```javascript
// Old: <button class="action-button">
// Auto-becomes: <button class="btn btn-primary btn-lg">
```

### **3. Development Shortcuts**
- **Ctrl+Shift+V**: Validate current page
- **Ctrl+Shift+F**: Auto-fix violations
- **Ctrl+Shift+R**: Generate compliance report

### **4. Console Reporting**
```javascript
// View compliance statistics
window.styleGuideMaster.generateComplianceReport();

// Validate specific component
window.styleGuideMaster.validateComponent(element, 'buttons');
```

## 📝 **Implementation Guide**

### **1. Include Style Guide in New Pages**
```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="css/sonic-ai-style-guide.css">
</head>
<body>
    <!-- Your content here -->
    
    <!-- Style Guide System (Development Only) -->
    <script src="js/style-guide-validator.js"></script>
    <script src="js/style-guide-master.js"></script>
</body>
</html>
```

### **2. Follow Component Patterns**
Always use the standardized classes from the style guide:

```html
<!-- Buttons -->
<button class="btn btn-primary btn-md">Standard Button</button>

<!-- Forms -->
<div class="form-group">
    <label class="form-label">Field Label</label>
    <input class="form-input" type="text">
</div>

<!-- Cards -->
<div class="card">
    <div class="card-body">Content</div>
</div>

<!-- Typography -->
<h1 class="text-2xl font-semibold text-white">Heading</h1>
<p class="text-md text-gray-400">Body text</p>
```

### **3. Use Utility Classes**
```html
<!-- Layout -->
<div class="flex items-center justify-between">
<div class="grid grid-cols-2 gap-md">

<!-- Spacing -->
<div class="m-lg p-md">
<div class="text-center">

<!-- Colors -->
<p class="text-primary">Purple text</p>
<p class="text-white">White text</p>
<p class="text-gray-400">Gray text</p>
```

## 🚨 **Validation Rules**

### **Strict Enforcement**
The system enforces these rules automatically:

1. **Buttons** must have `btn` + variant + size classes
2. **Inputs** must have `form-input` class
3. **Labels** must have `form-label` class
4. **Cards** must have proper structure
5. **No deprecated classes** allowed

### **Exclusions**
Some elements are excluded from validation:
- `.brand-logo` (special styling)
- `.legacy-component` (temporary exclusion)
- `[data-ignore-style-guide]` (manual exclusion)

### **Auto-Fix Behavior**
In development mode, the system will:
- Replace deprecated classes automatically
- Add missing required classes
- Log all changes to console
- Show before/after comparisons

## 📊 **Monitoring & Reports**

### **Compliance Dashboard**
```javascript
// Generate detailed compliance report
const stats = window.styleGuideMaster.generateComplianceReport();

// Example output:
// BUTTONS:
//   Total: 15
//   Compliant: 13 (86.7%)
//   Deprecated: 2 (13.3%)
```

### **Real-Time Violation Alerts**
The console will show:
```
⚠️ Style Guide Violations Found:
BUTTON (3 issues):
  button.old-btn: Missing required .btn class
  button#submit: Missing variant class
  
💡 Fix Suggestions:
  button: <button class="btn btn-primary btn-md">Text</button>
```

## 🎯 **Migration Path**

### **From Legacy to New System**

1. **Replace deprecated classes**:
   ```html
   <!-- OLD -->
   <button class="action-button">Submit</button>
   <input class="input-field" type="text">
   
   <!-- NEW -->
   <button class="btn btn-primary btn-lg">Submit</button>
   <input class="form-input" type="text">
   ```

2. **Add missing structure**:
   ```html
   <!-- OLD -->
   <label>Username</label>
   <input type="text">
   
   <!-- NEW -->
   <div class="form-group">
       <label class="form-label">Username</label>
       <input type="text" class="form-input">
   </div>
   ```

3. **Use standardized typography**:
   ```html
   <!-- OLD -->
   <h1 style="font-size: 24px;">Title</h1>
   
   <!-- NEW -->
   <h1 class="text-2xl font-bold text-white">Title</h1>
   ```

## 🔍 **Testing & Quality Assurance**

### **Automated Testing**
```javascript
// Run full validation suite
window.styleGuideValidator.validateAll();

// Test specific component types
window.styleGuideMaster.validateComponent(document.querySelector('.my-button'), 'buttons');

// Check usage statistics
const stats = window.styleGuideMaster.getUsageStats();
```

### **Manual Testing Checklist**
- [ ] All buttons use `btn` classes
- [ ] All inputs use `form-input` class
- [ ] All labels use `form-label` class
- [ ] No deprecated classes present
- [ ] Typography uses standardized classes
- [ ] Colors use CSS variables
- [ ] Spacing uses utility classes

## 🚀 **Benefits**

1. **100% Consistency**: All components follow the same design system
2. **Automated Enforcement**: No manual checking required
3. **Developer Experience**: Clear validation and auto-fix suggestions
4. **Maintainability**: Single source of truth for all styles
5. **Scalability**: Easy to add new components and patterns
6. **Quality Assurance**: Built-in testing and compliance reporting

## 📚 **Quick Reference**

### **Common Class Combinations**
```html
<!-- Primary CTA Button -->
<button class="btn btn-primary btn-lg">Get Started</button>

<!-- Form Field -->
<div class="form-group">
    <label class="form-label">Email</label>
    <input class="form-input" type="email">
</div>

<!-- Card Component -->
<div class="card">
    <div class="card-body">
        <h3 class="text-lg font-semibold text-white">Title</h3>
        <p class="text-gray-400">Description</p>
    </div>
</div>

<!-- Success Notification -->
<div class="notification notification-success">
    <i class="fas fa-check mr-sm"></i>
    Operation successful!
</div>
```

### **CSS Variables Reference**
```css
/* Use these in custom CSS */
color: var(--brand-primary);
margin: var(--space-lg);
font-size: var(--font-size-xl);
border-radius: var(--radius-md);
```

---

**🎨 This system ensures that the Sonic AI app maintains a professional, consistent, and maintainable design across all components and pages.**
