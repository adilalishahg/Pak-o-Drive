# 🎨 Design System & Visual Standards — Pak-o-Drive

## 1. Design Philosophy: High-Conversion Commercial Precision
Pak-o-Drive's design system is engineered to inspire trust, drive immediate conversions, and accommodate the distinct characteristics of the Pakistani retail market. The visual interface pairs sleek modern aesthetics with aggressive clarity, ensuring automotive parts, electronics specifications, and pricing terms are instantly digestible.

---

## 2. Core Color Palette & Design Tokens (Tailwind CSS v4)

```css
@theme {
  /* Brand Identity */
  --color-brand-primary: #0f172a;       /* Deep Slate / Industrial Midnight */
  --color-brand-accent: #16a34a;        /* High-Trust Emerald Green (COD/Success) */
  --color-brand-accent-hover: #15803d;
  --color-brand-amber: #f59e0b;         /* Warning / High-Ticket Attention */
  --color-brand-danger: #dc2626;        /* Stock Out / Cancellation */

  /* Pakistani Payment Identity Tokens */
  --color-payment-cod: #15803d;         /* Cash on Delivery Trust Green */
  --color-payment-jazzcash: #b91c1c;    /* JazzCash Deep Red */
  --color-payment-easypaisa: #059669;   /* Easypaisa Vibrant Teal/Green */
  --color-payment-whatsapp: #25d366;    /* Official WhatsApp Green */

  /* Neutral Surface System */
  --color-surface-background: #f8fafc;  /* Clean Off-White */
  --color-surface-card: #ffffff;        /* Pure Card White */
  --color-surface-border: #e2e8f0;      /* Subtle Neutral Border */
  --color-surface-dark: #090d16;        /* Admin Dashboard & POS Header Dark */
}
```

---

## 3. Typography & Glyph Clipping Prevention Rules

### Font Stacks
- **Primary Latin Font**: Inter / Outfit (`font-sans` for high legibility on hardware specifications and numbers).
- **Pakistani Localization & Urdu**: `Noto Nastaliq Urdu`, `Jameel Noori Nastaleeq`, or system-ui fallback.

### Ascender & Descender Preservation Rule
Urdu text and uppercase English badges with diacritics or descenders (`p`, `y`, `j`, `g`, `ے`, `ی`, `ق`) are frequently clipped when wrapped in `leading-none` or `overflow-hidden`.
- **Mandatory Utility Rule**: Any single-line or multi-line clamped title, badge, or price tag MUST use:
  ```html
  class="leading-normal py-0.5 ..."
  ```
- **Prohibited**: Never apply `leading-none` or `leading-tight` on truncated elements.

---

## 4. Media Presentation: 100% Uncropped Dual-Layer Standard

In automotive e-commerce, cut-off images result in incorrect part purchases and elevated return rates. All product media frames must adhere to the **Dual-Layer Presentation Pattern**:

```
+-------------------------------------------------------------+
| Container: relative overflow-hidden bg-slate-100 rounded-xl |
|                                                             |
|  [ Layer 1: Ambient Blur Backdrop ]                         |
|  - absolute inset-0 w-full h-full                           |
|  - object-cover blur-2xl opacity-40 scale-125               |
|  - Creates seamless, color-matched ambient atmosphere       |
|                                                             |
|         +-----------------------------------------+         |
|         | [ Layer 2: Uncropped Product Asset ]     |         |
|         | - relative z-10 w-full h-full            |         |
|         | - object-contain p-3                     |         |
|         | - 100% of product dimensions visible     |         |
|         +-----------------------------------------+         |
+-------------------------------------------------------------+
```

### Reference Implementation
```tsx
export function ProductImageFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-900/5">
      {/* Layer 1: Ambient Backdrop */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl opacity-35 pointer-events-none"
      />
      {/* Layer 2: Foreground Product Asset */}
      <img
        src={src}
        alt={alt}
        className="relative z-10 h-full w-full object-contain p-3 transition-transform duration-300 hover:scale-105"
        loading="lazy"
      />
    </div>
  );
}
```

---

## 5. Localized Badges & Payment Channel Signifiers

| Channel / Indicator | Visual Specs | Example Preview |
| :--- | :--- | :--- |
| **Cash on Delivery** | Emerald border, soft green pill, banknote icon. | `[💵 Cash on Delivery Available]` |
| **1-Click WhatsApp** | `#25D366` background, white text, WhatsApp brand icon. | `[💬 Order via WhatsApp]` |
| **JazzCash Payment** | `#b91c1c` border/text, subtle ruby badge. | `[🔴 JazzCash Verified]` |
| **Easypaisa Payment**| `#059669` border/text, emerald teal badge. | `[🟢 Easypaisa Direct]` |
| **Urgent Low Stock** | Amber background, pulse animation indicator. | `[⚠️ Only 2 units left in Karachi]` |

---

## 6. Micro-Interactions & Animation Guidelines
- **Checkout Completion Confetti**: Upon receiving a 200 OK from the order submission action, trigger `canvas-confetti` explosion with dual bursts from both bottom corners.
- **Cart Drawer Slide & Backdrop**: 200ms ease-out entrance with backdrop blur (`backdrop-blur-sm bg-black/40`).
- **Interactive Numeric Mask**: Auto-advancing 6-digit OTP inputs with subtle border scale on focus (`focus:scale-105 transition-transform`).
- **Admin Analytics Hover Tooltips**: Recharts customized tooltips with dark slate background, rounded corners, and formatted PKR values (`PKR 125,000`).
