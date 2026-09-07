# ⚖️ Rules & Architectural Laws — Pak-o-Drive

This document establishes the mandatory engineering standards, agent constraints, and architectural laws governing all development within the **Pak-o-Drive** codebase. Violations of these rules introduce regressions, hydration crashes, and security vulnerabilities.

---

## 🏛️ The 11 Core Architectural Laws

### Law 1: Cart SSR Hydration Guard (Next.js 16 & React 19)
- **Rule**: Never render client-persisted state (`localStorage`, cookies, or indexedDB) directly during initial SSR.
- **Implementation**: Every cart badge, cart drawer, checkout item counter, or persisted state consumer MUST be encapsulated by an `isMounted` or `useMounted()` guard.
```tsx
// ✅ MANDATORY PATTERN
const isMounted = useMounted();
if (!isMounted) {
  return <CartBadgeSkeleton />; // Match server HTML structure exactly
}
return <CartBadge count={cart.items.length} />;
```
- **Violation Consequence**: Severe React 19 / Next.js 16 hydration mismatch error: *“Text content does not match server-rendered HTML”*, breaking page hydration and freezing client interactivity.

---

### Law 2: WhatsApp 1-Click Ordering & Native Share
- **Rule**: Provide frictionless direct ordering via WhatsApp on all product pages.
- **Normalization**: All Pakistani telephone numbers must be normalized to standard **E.164 format** (`923XXXXXXXXX` or `+923XXXXXXXXX`). Remove leading zeros (`0300...` $\rightarrow$ `92300...`), spaces, hyphens, and parentheses.
- **Deep-Link Template**:
```typescript
const message = `Hello Pak-o-Drive! I would like to order:
- Product: ${product.title}
- SKU: ${product.sku}
- Variant: ${selectedVariant || 'Standard'}
- Price: PKR ${product.price.toLocaleString()}
Please confirm delivery details.`;
const whatsappUrl = `https://wa.me/${storeWhatsAppNumber}?text=${encodeURIComponent(message)}`;
```
- **Native Share Fallback**: Always attempt `navigator.share()` first; immediately fallback to clipboard copy with an accessible toast if unsupported.

---

### Law 3: 100% Uncropped Media Presentation
- **Rule**: Automotive replacement parts, complex electronic boards, and branded accessories must NEVER be cropped or clipped by CSS overflow.
- **Dual-Layer Layout Pattern**:
  - **Layer 1 (Ambient Blur Backdrop)**: An image scaled to fill the container with `absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 pointer-events-none`.
  - **Layer 2 (Foreground Asset)**: The pristine uncropped image with `relative z-10 w-full h-full object-contain p-2`.
- **Violation Consequence**: Missing product connectors, cut-off part numbers, customer returns due to visual ambiguity.

---

### Law 4: Typography & Glyph Clipping Prevention
- **Rule**: In multilingual environments (Urdu / English), ascenders and descenders must not be clipped by tight line heights or aggressive overflow truncation.
- **Standard**: Any single-line or clamped element (`truncate`, `line-clamp-1`, `line-clamp-2`) displaying product titles, discount badges, or PKR currency tags MUST specify:
  ```html
  class="leading-normal py-0.5 ..."
  ```
  *(NEVER use `leading-none` or `leading-tight` with `overflow-hidden` or `truncate`)*.

---

### Law 5: 2-Step OTP Verification (COD & Admin Safeguard)
- **Rule**: High-value Cash on Delivery (COD) checkouts (> PKR 10,000) and sensitive Admin operations must require 2-step verification.
- **Specifications**:
  - Auto-focusing 6-digit numeric input mask.
  - 60-second cooldown timer on resend requests.
  - Verification state machine: `IDLE` $\rightarrow$ `CODE_DISPATCHED` $\rightarrow$ `VERIFYING` $\rightarrow$ `VERIFIED` (or `EXPIRED`/`FAILED`).
  - Clear error states for expired codes and rate-limiting.

---

### Law 6: Enum Normalization & Mongoose Contract Resiliency
- **Rule**: Status strings, payment channels, and geographic entities must NOT be hardcoded across components or route handlers.
- **Single Source of Truth**: All enums must originate from `src/lib/constants.ts`:
  - **Order Statuses**: `PENDING = "Pending"`, `PROCESSING = "Processing"`, `ON_THE_WAY = "On the Way"`, `SHIPPED = "Shipped"`, `DELIVERED = "Delivered"`, `CANCELLED = "Cancelled"`.
  - **Payment Methods**: `COD = "COD"`, `JAZZCASH = "JazzCash"`, `EASYPAISA = "Easypaisa"`, `BANK_TRANSFER = "Bank Transfer"`.
- All Mongoose schema validators and API controllers must directly reference these enums.

---

### Law 7: Zero Native Browser Dialogs
- **Rule**: The use of `window.alert()`, `window.confirm()`, and `window.prompt()` is **STRICTLY PROHIBITED**.
- **Alternative**: Always employ accessible, stylized toast notifications (`sonner` or `react-hot-toast`) and custom modal primitives (`<DeleteConfirmDialog />`, `<CancelOrderDialog />`).

---

### Law 8: Zero Logic in UI & Admin Role Parity
- **Rule**: Files within `src/app/` and `src/components/` must be pure presentational views (JSX/TSX rendering only).
- **Separation of Concerns**:
  - UI components receive data and event handlers via props or custom hooks.
  - All business logic, state mutations, form validation, and API invocations reside in `src/hooks/` or `src/context/`.
  - Admin access rules (`isAdmin`) must be enforced server-side and cleanly propagated without leaking internal logic to public views.

---

### Law 9: Desktop & POS Electron Isolation
- **Rule**: The Electron desktop application in `desktop/` must strictly maintain security boundaries:
  - `contextIsolation: true`
  - `nodeIntegration: false`
- **IPC Standard**: Expose native system access (ESC/POS thermal printing, barcode scanner serial ports, OS notifications) exclusively through typed contracts in `desktop/src/preload/index.ts` via `contextBridge.exposeInMainWorld('electronAPI', ...)`.

---

### Law 10: Dynamic External Data & Tool Discovery (Monid Gateway)
- **Rule**: When integrating external scrapers, competitor pricing data, or third-party logistics tracking, agents must discover endpoints via `monid discover` and inspect schemas with `monid inspect` before crafting custom scraping logic.
- Verify health and rate limits before invoking high-frequency external endpoints.

---

### Law 11: Autonomous Agent Efficiency & Cost Optimization Protocol
- **Targeted Chunk Diffing**: Strictly use pinpoint chunk replacement (`replace_file_content`) with 3-5 lines of context anchors. Never rewrite entire files (> 50 lines) to save 80-90% output tokens and avoid git merge collisions.
- **Pre-Flight Typecheck**: Automatically run `pnpm tsc --noEmit` and verify zero errors before reporting completion on any task.
- **Dynamic Learning Maintenance**: Update `.agents/LEARNINGS.md` with every verified bug fix using the strict 3-bullet schema: `📌 Issue`, `🔍 Root Cause & Failed Attempts`, `🛠️ Verified Code Fix`.
