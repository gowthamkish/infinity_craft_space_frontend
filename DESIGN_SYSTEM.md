# 🎨 DESIGN SYSTEM QUICK REFERENCE

## Color Tokens

### Primary Colors

```css
--primary: #2563eb /* Blue - Main brand */ --primary-dark: #1d4ed8
  --primary-light: #3b82f6 --primary-subtle: rgba(37, 99, 235, 0.08);
```

### Semantic Colors

```css
--success: #10b981 /* Green - Positive actions */ --success-dark: #059669
  --success-subtle: rgba(16, 185, 129, 0.08) --danger: #dc2626
  /* Red - Destructive */ --danger-dark: #b91c1c
  --danger-subtle: rgba(220, 38, 38, 0.08) --accent: #f59e0b
  /* Orange - Warnings */ --info: #0891b2 /* Cyan - Information */;
```

### Text Colors

```css
--text-primary: #0f172a /* Main text - 1200:1 contrast */
  --text-secondary: #475569 /* Secondary text - 12:1 */ --text-muted: #78909c
  /* Tertiary - 7:1 */ --text-disabled: #b0bec5 --text-inverse: #ffffff;
```

## Spacing System (8pt Grid)

```css
--space-1: 0.25rem /*  4px */ --space-2: 0.5rem /*  8px */ --space-3: 0.75rem
  /* 12px */ --space-4: 1rem /* 16px */ --space-5: 1.25rem /* 20px */
  --space-6: 1.5rem /* 24px */ --space-8: 2rem /* 32px */ --space-10: 2.5rem
  /* 40px */ --space-12: 3rem /* 48px */;
```

**Usage Examples**:

```css
padding: var(--space-4); /* 16px */
margin-bottom: var(--space-6); /* 24px */
gap: var(--space-3); /* 12px */
```

## Typography Scale

### Font Sizes

```css
--font-size-xs: 0.75rem /* 12px */ --font-size-sm: 0.8125rem /* 13px */
  --font-size-base: 1rem /* 16px */ --font-size-md: 1.0625rem /* 17px */
  --font-size-lg: 1.125rem /* 18px */ --font-size-xl: 1.25rem /* 20px */
  --font-size-2xl: 1.5rem /* 24px */ --font-size-3xl: 1.875rem /* 30px */
  --font-size-4xl: 2.25rem /* 36px */;
```

### Font Weights

```css
--font-weight-light: 300 --font-weight-normal: 400 --font-weight-medium: 500
  --font-weight-semibold: 600 --font-weight-bold: 700
  --font-weight-extrabold: 800;
```

### Line Heights

```css
--line-height-tight: 1.25 --line-height-snug: 1.375 --line-height-normal: 1.5
  --line-height-relaxed: 1.625 --line-height-loose: 2;
```

## Shadows (Elevation System)

```css
--shadow-xs:
  0 1px 2px 0 rgb(0 0 0 / 0.04) --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.07),
  0 1px 2px -1px rgb(0 0 0 / 0.07) --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.08),
  0 2px 4px -2px rgb(0 0 0 / 0.08) --shadow-lg: 0 10px 15px -3px
    rgb(0 0 0 / 0.09),
  0 4px 6px -4px rgb(0 0 0 / 0.08) --shadow-xl: 0 20px 25px -5px
    rgb(0 0 0 / 0.1),
  0 8px 10px -6px rgb(0 0 0 / 0.08) --shadow-2xl: 0 25px 50px -12px
    rgb(0 0 0 / 0.15);
```

**Usage**: `box-shadow: var(--shadow-lg);`

## Border Radius

```css
--radius-xs: 4px --radius-sm: 6px --radius-md: 8px --radius-lg: 12px
  --radius-xl: 16px --radius-2xl: 20px --radius-full: 9999px;
```

## Animations

### Timing

```css
--transition-fast: 120ms cubic-bezier(0.4, 0, 0.2, 1) --transition-base: 200ms
  cubic-bezier(0.4, 0, 0.2, 1) --transition-slow: 300ms
  cubic-bezier(0.4, 0, 0.2, 1);
```

### Common Animations

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes cartPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.4);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(255, 0, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 0, 0, 0);
  }
}
```

## Component Patterns

### Button

```css
.btn {
  padding: var(--btn-padding-y) var(--btn-padding-x);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-fast);
  cursor: pointer;
  border: none;
}

.btn--primary {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: white;
  box-shadow: var(--shadow-sm);
}

.btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

### Card

```css
.card {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--bg-primary);
  padding: var(--card-padding);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-lg);
}
```

### Form Control

```css
.form-control {
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.5625rem 0.75rem;
  font-size: var(--font-size-base);
  color: var(--text-primary);
  background-color: var(--bg-primary);
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.form-control:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
  outline: none;
}
```

## Responsive Breakpoints

### Mobile-First Strategy

```css
/* Base/Mobile styles first */
.element {
  display: block;
}

/* Tablet */
@media (min-width: 768px) {
  .element {
    display: grid;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .element {
    display: flex;
  }
}
```

### Common Breakpoints

```
Mobile:    < 480px
Tablet:    480px - 768px
Small Desktop: 768px - 1024px
Desktop:   1024px - 1280px
Large Desktop: > 1280px
```

## Accessibility Checklist

### Focus States

```css
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
  border-radius: 2px;
}
```

### Color Contrast

- Text on background: 7:1 (AA level)
- Large text: 4.5:1 minimum
- UI components: 3:1 minimum

### Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

### Touch Targets

```css
/* Minimum 44x44px for buttons */
button {
  min-width: 44px;
  min-height: 44px;
}
```

## Usage Examples

### Color Usage

```html
<!-- Primary action -->
<button class="btn btn--primary">Continue</button>

<!-- Success action -->
<button class="btn btn--success">Add to Cart</button>

<!-- Danger action -->
<button class="btn btn--danger">Delete</button>
```

### Spacing

```css
/* Padding */
.element {
  padding: var(--space-4);
}

/* Margin -->
.element { margin-bottom: var(--space-6); }

/* Gap in flex/grid */
.container {
  gap: var(--space-3);
}
```

### Typography

```css
/* Headings */
h1 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
}
h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
}

/* Body text */
p {
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
}

/* Small text */
.caption {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}
```

### Shadows & Elevation

```css
/* Card with shadow */
.card { box-shadow: var(--shadow-md); }

/* Floating element -->
.floating { box-shadow: var(--shadow-lg); }

/* Popover/dropdown -->
.dropdown { box-shadow: var(--shadow-2xl); }
```

## Dos & Don'ts

### ✅ DO

- Use CSS variables for consistency
- Follow the 8pt grid system
- Use semantic color names
- Test focus states
- Provide sufficient touch targets
- Use proper heading hierarchy
- Implement prefers-reduced-motion

### ❌ DON'T

- Use hardcoded colors
- Mix spacing systems
- Skip focus states
- Use non-semantic colors
- Add auto-playing animations
- Create touch targets < 44px
- Skip accessibility testing

## Tips & Best Practices

1. **Consistent Spacing** - Always use spacing variables
2. **Color Accessibility** - Respect color contrast minimums
3. **Mobile First** - Start with mobile, enhance for desktop
4. **Performance** - Use hardware-accelerated properties (transform, opacity)
5. **Testing** - Test keyboard navigation and screen readers
6. **Documentation** - Comment non-obvious styling decisions
7. **Reusability** - Create component classes for common patterns

---

**Version**: 1.0  
**Updated**: April 15, 2026
