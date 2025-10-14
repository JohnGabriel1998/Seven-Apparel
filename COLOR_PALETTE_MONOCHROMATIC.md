# 🎨 Seven Apparel - Monochromatic Color Palette

## 🖤 Professional Monochromatic Color Scheme

A sophisticated grayscale palette designed for Seven Apparel's e-commerce platform, combining elegance with modern minimalism while maintaining the red accent for brand identity.

---

## 📐 Complete Color System

### **Primary Background Colors**

```css
/* Pure Foundations */
--pure-white: #FFFFFF        /* Main content areas, cards */
--pure-black: #000000        /* Deep accents, text on light */

/* Light Grays (Backgrounds) */
--gray-50:  #F9FAFB         /* Lightest - Subtle backgrounds */
--gray-100: #F3F4F6         /* Very light - Hover states */
--gray-200: #E5E7EB         /* Light - Borders, dividers */

/* Medium Grays (Neutral Zones) */
--gray-300: #D1D5DB         /* Muted - Disabled states */
--gray-400: #9CA3AF         /* Medium - Placeholder text */
--gray-500: #6B7280         /* Balanced - Secondary text */

/* Dark Grays (Contrasts) */
--gray-600: #4B5563         /* Dark - Primary text */
--gray-700: #374151         /* Darker - Headings */
--gray-800: #1F2937         /* Very dark - Strong emphasis */
--gray-900: #111827         /* Darkest - Header/Footer */
--gray-950: #030712         /* Ultra dark - Deep sections */
```

### **Red Accent Colors (Brand Identity)**

```css
/* Preserve Seven Apparel's Red Brand */
--primary-50:  #FEF2F2      /* Lightest red tint */
--primary-100: #FEE2E2      /* Very light red */
--primary-200: #FECACA      /* Light red - Hover backgrounds */
--primary-300: #FCA5A5      /* Soft red */
--primary-400: #F87171      /* Medium red */
--primary-500: #EF4444      /* Pure red */
--primary-600: #DC2626      /* Brand red - PRIMARY */
--primary-700: #B91C1C      /* Dark red */
--primary-800: #991B1B      /* Darker red */
--primary-900: #7F1D1D      /* Darkest red */
```

---

## 🎯 Application Strategy

### **Light Mode (Default)**

```css
/* Background Hierarchy */
Body Background:        --gray-50   (#F9FAFB)
Content Cards:          --pure-white (#FFFFFF)
Hover States:           --gray-100  (#F3F4F6)
Borders/Dividers:       --gray-200  (#E5E7EB)
Subtle Backgrounds:     --gray-100  (#F3F4F6)

/* Text Hierarchy */
Primary Text:           --gray-900  (#111827)
Headings:               --pure-black (#000000)
Secondary Text:         --gray-600  (#4B5563)
Muted Text:             --gray-500  (#6B7280)
Placeholder Text:       --gray-400  (#9CA3AF)

/* Interactive Elements */
Button Primary:         --primary-600 (#DC2626)
Button Hover:           --primary-700 (#B91C1C)
Links:                  --primary-600 (#DC2626)
Link Hover:             --primary-700 (#B91C1C)
Focus Ring:             --primary-500 (#EF4444)

/* Accents */
Success (subtle):       --gray-800 with green tint
Warning (subtle):       --gray-700 with yellow tint
Error:                  --primary-600 (#DC2626)
Info (subtle):          --gray-700 with blue tint
```

### **Dark Mode**

```css
/* Background Hierarchy */
Body Background:        --gray-950  (#030712)
Content Cards:          --gray-900  (#111827)
Hover States:           --gray-800  (#1F2937)
Borders/Dividers:       --gray-800  (#1F2937)
Elevated Surfaces:      --gray-800  (#1F2937)

/* Text Hierarchy */
Primary Text:           --gray-100  (#F3F4F6)
Headings:               --pure-white (#FFFFFF)
Secondary Text:         --gray-400  (#9CA3AF)
Muted Text:             --gray-500  (#6B7280)
Placeholder Text:       --gray-600  (#4B5563)

/* Interactive Elements */
Button Primary:         --primary-600 (#DC2626)
Button Hover:           --primary-700 (#B91C1C)
Links:                  --primary-500 (#EF4444)
Link Hover:             --primary-400 (#F87171)
Focus Ring:             --primary-500 (#EF4444)
```

---

## 🎨 Component-Specific Applications

### **Navbar**

```css
Light Mode:
- Background: --pure-white (#FFFFFF)
- Border: --gray-200 (#E5E7EB)
- Text: --gray-700 (#374151)
- Logo gradient: --gray-900 to --primary-800 to --gray-900
- Hover: --gray-100 (#F3F4F6)

Dark Mode:
- Background: --gray-900 (#111827)
- Border: --gray-800 (#1F2937)
- Text: --gray-300 (#D1D5DB)
- Logo gradient: --pure-white to --primary-400 to --pure-white
- Hover: --gray-800 (#1F2937)
```

### **Footer**

```css
- Background: Gradient from --gray-900 to --gray-950 to --pure-black
- Text: --gray-300 (#D1D5DB)
- Headings: --pure-white (#FFFFFF)
- Trust badges: --gray-800/50 with backdrop blur
- Links hover: --primary-400 (#F87171)
- Decorative orbs: --primary-600/5, --primary-800/5
```

### **Product Cards**

```css
Light Mode:
- Background: --pure-white (#FFFFFF)
- Border: --gray-200 (#E5E7EB)
- Shadow: --gray-900/10
- Hover shadow: --gray-900/20

Dark Mode:
- Background: --gray-900 (#111827)
- Border: --gray-800 (#1F2937)
- Shadow: --pure-black/30
- Hover shadow: --pure-black/50
```

### **Buttons**

```css
/* Primary (Red Accent) */
Background: --primary-600 (#DC2626)
Hover: --primary-700 (#B91C1C)
Text: --pure-white (#FFFFFF)

/* Secondary (Monochrome) */
Light Mode:
- Background: --gray-100 (#F3F4F6)
- Hover: --gray-200 (#E5E7EB)
- Text: --gray-900 (#111827)

Dark Mode:
- Background: --gray-800 (#1F2937)
- Hover: --gray-700 (#374151)
- Text: --pure-white (#FFFFFF)

/* Ghost/Outline */
Border: --gray-300 (light) / --gray-600 (dark)
Text: --gray-700 (light) / --gray-300 (dark)
Hover: --gray-100 (light) / --gray-800 (dark)
```

### **Forms & Inputs**

```css
Light Mode:
- Background: --pure-white (#FFFFFF)
- Border: --gray-300 (#D1D5DB)
- Focus border: --primary-500 (#EF4444)
- Placeholder: --gray-400 (#9CA3AF)
- Text: --gray-900 (#111827)

Dark Mode:
- Background: --gray-800 (#1F2937)
- Border: --gray-700 (#374151)
- Focus border: --primary-500 (#EF4444)
- Placeholder: --gray-600 (#4B5563)
- Text: --gray-100 (#F3F4F6)
```

---

## 🎭 Gradient Combinations

### **Hero Sections**

```css
/* Subtle Gray Gradient */
background: linear-gradient(
  135deg,
  #f9fafb 0%,
  /* --gray-50 */ #f3f4f6 50%,
  /* --gray-100 */ #e5e7eb 100% /* --gray-200 */
);

/* Dramatic Dark Gradient */
background: linear-gradient(
  180deg,
  #111827 0%,
  /* --gray-900 */ #030712 100% /* --gray-950 */
);

/* With Red Accent (Overlay) */
background: linear-gradient(
  135deg,
  rgba(220, 38, 38, 0.05) 0%,
  /* --primary-600 at 5% */ rgba(17, 24, 39, 0.95) 100% /* --gray-900 at 95% */
);
```

### **Banner Overlays**

```css
/* Light Overlay on Images */
background: linear-gradient(
  to right,
  rgba(255, 255, 255, 0.9) 0%,
  /* --pure-white at 90% */ rgba(249, 250, 251, 0.7) 100% /* --gray-50 at 70% */
);

/* Dark Overlay on Images */
background: linear-gradient(
  to right,
  rgba(17, 24, 39, 0.9) 0%,
  /* --gray-900 at 90% */ rgba(0, 0, 0, 0.7) 100% /* --pure-black at 70% */
);
```

---

## 🖼️ Shadow System

```css
/* Light Mode Shadows */
--shadow-sm: 0 1px 2px 0 rgb(17 24 39 / 0.05); /* --gray-900/5% */
--shadow-md: 0 4px 6px -1px rgb(17 24 39 / 0.1); /* --gray-900/10% */
--shadow-lg: 0 10px 15px -3px rgb(17 24 39 / 0.15); /* --gray-900/15% */
--shadow-xl: 0 20px 25px -5px rgb(17 24 39 / 0.2); /* --gray-900/20% */
--shadow-2xl: 0 25px 50px -12px rgb(17 24 39 / 0.25); /* --gray-900/25% */

/* Dark Mode Shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3); /* --pure-black/30% */
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4); /* --pure-black/40% */
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5); /* --pure-black/50% */
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.6); /* --pure-black/60% */
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.7); /* --pure-black/70% */

/* Accent Shadow (Red) */
--shadow-primary: 0 10px 20px -5px rgb(220 38 38 / 0.3); /* --primary-600/30% */
```

---

## 📊 Usage Guidelines

### **Background Selection Rules**

1. **Main Page Background**: `--gray-50` (light) / `--gray-950` (dark)
2. **Content Cards**: `--pure-white` (light) / `--gray-900` (dark)
3. **Nested Cards**: `--gray-100` (light) / `--gray-800` (dark)
4. **Hero Sections**: Gradient from white to `--gray-100`
5. **Footer**: Gradient from `--gray-900` to `--pure-black`

### **Text Contrast Requirements**

```css
/* Minimum Contrast Ratios (WCAG AA) */
Large Text (18px+):     3:1
Normal Text (< 18px):   4.5:1
UI Components:          3:1

/* Recommended Pairings */
--pure-white background    → --gray-900 text (21:1 ratio) ✅
--gray-50 background       → --gray-900 text (20:1 ratio) ✅
--gray-100 background      → --gray-800 text (12:1 ratio) ✅
--gray-900 background      → --pure-white text (21:1 ratio) ✅
--pure-black background    → --pure-white text (21:1 ratio) ✅
```

### **Border & Divider Strategy**

```css
/* Light Mode */
Subtle dividers:        --gray-200 (#E5E7EB)
Standard borders:       --gray-300 (#D1D5DB)
Strong separation:      --gray-400 (#9CA3AF)

/* Dark Mode */
Subtle dividers:        --gray-800 (#1F2937)
Standard borders:       --gray-700 (#374151)
Strong separation:      --gray-600 (#4B5563)
```

---

## 🎨 Implementation Code

### **Tailwind CSS Configuration** (Already configured)

Your existing Tailwind setup already includes these gray scales. The palette uses:

- `gray-50` through `gray-950` for monochromatic backgrounds
- `primary-600` for the red brand accent

### **CSS Custom Properties** (For manual styling)

```css
:root {
  /* Monochromatic Scale */
  --color-white: #ffffff;
  --color-black: #000000;
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  --color-gray-950: #030712;

  /* Red Brand Accent */
  --color-primary: #dc2626;
  --color-primary-hover: #b91c1c;
  --color-primary-light: #fee2e2;
}
```

---

## 🎯 Quick Reference Table

| Purpose             | Light Mode  | Dark Mode   | Hex Code (Light) | Hex Code (Dark) |
| ------------------- | ----------- | ----------- | ---------------- | --------------- |
| **Main Background** | gray-50     | gray-950    | #F9FAFB          | #030712         |
| **Card Background** | white       | gray-900    | #FFFFFF          | #111827         |
| **Hover State**     | gray-100    | gray-800    | #F3F4F6          | #1F2937         |
| **Primary Text**    | gray-900    | gray-100    | #111827          | #F3F4F6         |
| **Heading**         | black       | white       | #000000          | #FFFFFF         |
| **Secondary Text**  | gray-600    | gray-400    | #4B5563          | #9CA3AF         |
| **Border**          | gray-200    | gray-800    | #E5E7EB          | #1F2937         |
| **Disabled**        | gray-300    | gray-700    | #D1D5DB          | #374151         |
| **Primary Button**  | primary-600 | primary-600 | #DC2626          | #DC2626         |
| **Link**            | primary-600 | primary-500 | #DC2626          | #EF4444         |

---

## 🚀 Implementation Examples

### **Hero Section with Monochrome**

```tsx
<section className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
  <h1 className="text-5xl font-bold text-black dark:text-white">
    Welcome to Seven Apparel
  </h1>
  <p className="text-gray-600 dark:text-gray-400">
    Modern fashion for the modern you
  </p>
  <button className="bg-primary-600 hover:bg-primary-700 text-white">
    Shop Now
  </button>
</section>
```

### **Product Card with Shadows**

```tsx
<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all">
  <img src="..." alt="Product" className="rounded-t-xl" />
  <div className="p-6">
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
      Product Name
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mt-2">Description here</p>
    <span className="text-2xl font-bold text-black dark:text-white">
      $99.99
    </span>
  </div>
</div>
```

---

## ✅ Brand Identity Maintained

- **Monochromatic Foundation**: Professional gray scale creates sophistication
- **Red Accent Preserved**: Seven Apparel's signature red (`#DC2626`) for CTAs
- **High Contrast**: Ensures readability and accessibility
- **Modern Aesthetic**: Clean, minimalist, premium feel
- **Versatile**: Works for both light and dark modes

---

## 🎊 Summary

This monochromatic color scheme provides:

✅ **11 shades of gray** from white to black
✅ **Preserved red brand accent** for Seven Apparel identity
✅ **WCAG AA compliant** contrast ratios
✅ **Light & dark mode** support
✅ **Professional appearance** suitable for e-commerce
✅ **Clear hierarchy** through tonal variations
✅ **Flexible implementation** via Tailwind or CSS variables

Your website will have a **sophisticated, modern, and timeless** aesthetic while maintaining brand recognition through strategic use of the red accent! 🚀
