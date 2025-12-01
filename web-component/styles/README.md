# TharwahChat Web Component - Styles

This directory contains all the CSS styles for the TharwahChat Web Component, organized into modular, maintainable files.

## 📁 File Structure

```
styles/
├── README.md                   # This file
├── loader.js                   # Style loader utility
├── main.css                    # Main entry point (imports all other styles)
├── variables.css               # CSS variables and design system
├── base2.css                   # Base styles and reset
├── utilities.css               # Utility classes
├── vanilla-theme.css           # Vanilla renderer styles
└── assistant-ui-theme.css      # Assistant UI renderer styles
```

## 🎨 Design System

### CSS Variables (`variables.css`)

All styling is built on a comprehensive CSS variable system:

```css
:root {
  /* Primary Colors */
  --tharwah-primary: #007bff;
  --tharwah-secondary: #0056b3;

  /* Theme Variants */
  /* [data-theme="blue"], [data-theme="green"], etc. */

  /* Spacing */
  --tharwah-spacing-sm: 0.5rem;
  --tharwah-spacing-md: 0.75rem;
  --tharwah-spacing-lg: 1rem;

  /* Typography */
  --tharwah-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, ...;
  --tharwah-font-size-sm: 0.875rem;
  --tharwah-font-size-base: 1rem;

  /* Component-specific */
  --tharwah-chat-width: 380px;
  --tharwah-chat-height: 600px;
  --tharwah-chat-button-size: 60px;
}
```

### Theme Variants

Multiple color themes are available:

```html
<!-- Default Blue Theme -->
<div data-theme="blue">

<!-- Green Theme -->
<div data-theme="green">

<!-- Purple Theme -->
<div data-theme="purple">

<!-- Red Theme -->
<div data-theme="red">

<!-- Orange Theme -->
<div data-theme="orange">

<!-- Teal Theme -->
<div data-theme="teal">
```

## 🔧 Usage

### Option 1: Single File (Self-Contained)
```html
<script src="tharwah-chat-webcomponent.min.js"></script>
```
The component includes fallback inline styles when external files can't be loaded.

### Option 2: Separate Styles (Better Performance)
```html
<link rel="stylesheet" href="styles/main.css">
<script src="tharwah-chat-webcomponent.min.js"></script>
```

### Option 3: Individual Styles
```html
<link rel="stylesheet" href="styles/variables.css">
<link rel="stylesheet" href="styles/base2.css">
<link rel="stylesheet" href="styles/vanilla-theme.css">
<link rel="stylesheet" href="styles/utilities.css">
<script src="tharwah-chat-webcomponent.min.js"></script>
```

## 🎯 Customization

### Override Variables
```css
:root {
  --tharwah-primary: #your-brand-color;
  --tharwah-secondary: #your-brand-secondary;
  --tharwah-chat-border-radius: 12px;
}
```

### Use Utility Classes
```html
<div class="tharwah-chat-widget">
  <div class="text-primary font-semibold">Custom text</div>
  <div class="bg-gray-100 rounded-lg p-4">Custom container</div>
</div>
```

### Dark Mode Support
```css
@media (prefers-color-scheme: dark) {
  :root {
    --tharwah-white: #1a1a1a;
    --tharwah-gray-50: #212529;
    /* ... */
  }
}
```

## 📱 Responsive Design

The styles include comprehensive responsive breakpoints:

- **Desktop** (default): Full functionality
- **Tablet** (≤768px): Adjusted sizing and spacing
- **Mobile** (≤480px): Optimized for touch screens
- **Small Mobile** (≤374px): Compact layout
- **Landscape** (height ≤500px): Adjusted for landscape orientation

## ♿ Accessibility Features

- **High Contrast Mode**: Enhanced borders and focus styles
- **Reduced Motion**: Disabled animations when `prefers-reduced-motion`
- **RTL Support**: Automatic right-to-left text handling
- **Focus Management**: Clear focus indicators and keyboard navigation
- **Screen Reader**: Proper ARIA labels and semantic markup

## 🎭 Animations

Available animation classes:

- `animate-pulse`: Subtle pulsing effect
- `animate-spin`: Continuous rotation
- `animate-bounce`: Bouncing effect
- `animate-ping": Ripple effect

Animation variables:
- `--tharwah-animation-bounce-subtle`: 2s ease-in-out infinite
- `--tharwah-animation-slide-in-up`: 0.3s ease-out
- `--tharwah-animation-fade-in-up`: 0.3s ease-out

## 🔍 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- iOS Safari 14+
- Chrome Android 90+

## 🛠 Development

### Adding New Variables

1. Add to `variables.css`:
```css
:root {
  --tharwah-new-variable: value;
}
```

2. Use in components:
```css
.component {
  property: var(--tharwah-new-variable);
}
```

### Creating New Themes

1. Add to `variables.css`:
```css
[data-theme="new-theme"] {
  --tharwah-primary: #new-color;
  --tharwah-secondary: #new-secondary;
}
```

### Adding Utility Classes

Extend `utilities.css` with new utility classes following the existing pattern.

## 📦 Performance

- **Modular Loading**: Only loads needed styles
- **CSS Variables**: Dynamic theming without recompilation
- **Optimized Selectors**: Efficient CSS selectors
- **Minimal Repaints**: Optimized animations and transitions
- **File Size**: ~15KB total (uncompressed)

## 🔄 Maintenance

When updating styles:

1. **Variables**: Update `variables.css` for design changes
2. **Themes**: Update theme-specific variables
3. **Components**: Update specific theme files
4. **Utilities**: Add new utility classes to `utilities.css`
5. **Rebuild**: Run `npm run build` to update distribution

## 🎨 Integration

The style system is designed to work seamlessly with:

- **Web Components**: Shadow DOM isolation
- **CSS Modules**: Local scope support
- **CSS-in-JS**: Variable access via `getPropertyValue()`
- **Build Tools**: PostCSS, Sass, etc. compatibility

## 🚀 Advanced Features

### CSS Custom Properties API
```javascript
const element = document.querySelector('.tharwah-chat-widget');
const primaryColor = getComputedStyle(element).getPropertyValue('--tharwah-primary');
```

### Dynamic Theme Switching
```javascript
document.documentElement.setAttribute('data-theme', 'dark');
```

### Style Inheritance
```css
.custom-chat {
  --tharwah-primary: #custom-blue;
}
```

This modular style system provides maximum flexibility while maintaining consistency and performance across the TharwahChat Web Component.