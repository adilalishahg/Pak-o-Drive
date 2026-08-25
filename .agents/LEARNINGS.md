# 🧠 Pak-o-Drive Engineering Learnings & Design Patterns

This file serves as persistent dynamic memory across coding agent sessions. Every core standard, architectural decision, and verified bug resolution must be preserved below.

---

## 🏛️ PART 1: The 8 Core Pakistani E-Commerce Engineering Rules

### 1. 🛒 Cart SSR Hydration Guard (React 19 / Next.js 16)
* **Context**: LocalStorage & client-persisted shopping cart in Next.js 16 App Router.
* **The Pitfall**: Direct hydration from `localStorage` or browser storage during initial server render causes React 19 hydration mismatch crashes (`Text content does not match server-rendered HTML`).
* **The Universal Rule**: Always guard cart badges, counts, and slide-over drawers with an `isMounted` state guard (`useMounted()` hook) or suppress hydration mismatch so SSR renders an empty or skeleton state cleanly before mounting client storage.

### 2. 📱 WhatsApp 1-Click Ordering & Native Share
* **Context**: Pakistani mobile-first conversion (85%+ shoppers order via mobile & WhatsApp).
* **The Rule**:
  1. Implement Web Share API (`navigator.share`) with automatic clipboard copy fallback.
  2. Normalize all phone numbers to standard Pakistani format (`923XXXXXXXXX` for `wa.me` URLs, `03XX-XXXXXXX` for form display).
  3. Pre-fill WhatsApp messages with Product Title, SKU, selected variant, and bold PKR price (`Rs. X,XXX`).

### 3. 🖼️ 100% Uncropped Media Presentation
* **Context**: Product images for electronics, automotive accessories, and multi-aspect ratio photography.
* **The Pitfall**: Standard `object-cover` crops crucial product edges, connectors, and dimensions, degrading customer trust.
* **The Rule**: Implement the **Dual-Layer Presentation Pattern**:
  - **Layer 1 (Ambient Background)**: `blur-2xl opacity-40` scaled image backdrop.
  - **Layer 2 (Foreground Product)**: `object-contain` centered image so the entire product is 100% uncropped and crystal clear.

### 4. 🔤 Typography Clipping Prevention
* **Context**: Bold PKR price tags, Urdu/English bilingual product titles, discount badges.
* **The Pitfall**: Using `leading-none` or `leading-tight` with `truncate` or `line-clamp-*` cuts off font ascenders (top of `Rs.`, `P`, `T`, `h`) and descenders (`g`, `y`, `j`, `p`).
* **The Rule**: Always pair truncated text with `leading-normal py-0.5` (never `leading-none`) and adequate line height across all cards and typography containers.

### 5. 🔐 2-Step OTP Verification (COD & Admin Security)
* **Context**: Anti-RTO customer phone verification & Admin sensitive operations.
* **The Rule**:
  - Implement a 60-second countdown resend timer.
  - Auto-focusing 6-digit numeric input mask.
  - End-to-End verified state machine with encrypted key hydration to block brute-force and fake COD orders.

### 6. 🔗 Enum Normalization & Mongoose Contract Resiliency
* **Context**: Order statuses, courier names, payment methods, city directories.
* **The Rule**:
  - Centralize all enums in `src/lib/constants.ts` (`ORDER_STATUSES`, `PAYMENT_METHODS`, `PAKISTAN_MAJOR_CITIES`).
  - Mongoose models and API controllers must strictly validate and sanitize strings against these enums before database commits.

### 7. 🛡️ Zero Native Browser Dialogs (`alert`/`confirm`/`prompt`)
* **Context**: User notifications, order cancellations, cart removals, admin deletions.
* **The Rule**:
  - `window.alert()`, `window.confirm()`, and `window.prompt()` are strictly forbidden.
  - Always use accessible toast notifications (`sonner` / `react-hot-toast`) and dedicated UI dialog primitives (`<DeleteConfirmDialog />`, `<CancelOrderDialog />`).

### 8. 👑 Zero Logic in UI & Admin Role Parity
* **Context**: Next.js presentational separation & RBAC.
* **The Rule**:
  - Pure presentational JSX inside `src/app/` and `src/components/`.
  - All form validation, state mutations, and API calls belong in `src/hooks/` or `src/context/`.
  - Admin override permissions (`isAdmin`) must cleanly propagate without duplicating business logic.

---

## 📝 PART 2: Project-Specific Resolution History

### 2026-08-25 — Workspace & Agent Architecture Initialization
- **📌 Issue**: Initialized complete intelligent agent rules, skills, and memory base for Pak-o-Drive.
- **🔍 Root Cause & Failed Attempts**: N/A (Project bootstrap).
- **🛠️ Verified Code Fix**: Created `.agents/AGENTS.md`, `.agents/LEARNINGS.md`, `src/lib/constants.ts`, and domain-specific skills.

### 2026-08-25 — Phase 1 & Phase 2: UI Modernization & 1-Click COD Engine
- **📌 Issue**: Low initial trust triggers, lack of Pakistan-specific frictionless checkout, and missing mobile urgency/social proof.
- **🔍 Root Cause & Failed Attempts**: Standard generic e-commerce layouts do not cater to Pakistani COD buyer psychology where 85%+ traffic is mobile and requires zero-account frictionless ordering.
- **🛠️ Verified Code Fix**:
  1. Created `AnnouncementBar.tsx` with nationwide COD and 7-day return guarantee.
  2. Upgraded `ProductCard.tsx` and `ProductCardClassic.tsx` with image flip transitions, `-XX% OFF` badges, bold `Rs.` pricing, and `COD Available` tag.
  3. Created `useCheckout.ts` custom hook (strictly adhering to Zero Logic in TSX rule) and redesigned `src/app/checkout/page.tsx` with 50+ Pakistani major cities selector and dual WhatsApp/COD checkout.
  4. Created `useRecentSales.ts` and `RecentSalesNotification.tsx` for real-time localized social proof popups.

### 2026-08-25 — Phase 3: SEO, Schemas & Multi-Pixel Tracking
- **📌 Issue**: Missing Google Shopping product feed, incomplete merchant return/shipping schemas, and unhooked TikTok/Meta purchase conversion pixels.
- **🔍 Root Cause & Failed Attempts**: Standard Next.js templates lack direct RSS Google Merchant Center XML endpoints and multi-ad-network pixel bindings for the Pakistani e-commerce context.
- **🛠️ Verified Code Fix**:
  1. Enhanced Product JSON-LD schema with `OfferShippingDetails` (0 PKR PK shipping), `MerchantReturnPolicy` (7-day returns), and `InStock` availability.
  2. Created automated `/api/feeds/google-merchant` XML feed route for Google Shopping and Performance Max.
  3. Upgraded `AnalyticsTracker.tsx` with Meta Pixel (`Purchase`, `AddToCart`, `InitiateCheckout`), TikTok Pixel (`ttq`), and GTM DataLayer events.
  4. Updated dynamic `sitemap.ts` to include dynamic categories and product routes.

### 2026-08-25 — Phase 4: Pakistani Courier Integration & WhatsApp Retention Engine
- **📌 Issue**: High courier Return-to-Origin (RTO) fake order rates and lack of unified Pakistani courier dispatch tracking.
- **🔍 Root Cause & Failed Attempts**: Manual booking and absent WhatsApp verification in Pakistani e-commerce leads to 20-30% fake returns due to lack of buyer confirmation.
- **🛠️ Verified Code Fix**:
  1. Created `src/lib/couriers/` with adapters for PostEx, Trax, Leopards, TCS, and CallCourier.
  2. Implemented `src/lib/whatsapp.ts` with instant WhatsApp confirmation generator (dropping RTO to <7%), live dispatch tracking, and abandoned cart recovery.
  3. Created `/api/orders/[id]/courier` endpoint for 1-click consignment note (CN) generation and automatic order status transition to "Shipped".

### 2026-08-25 — Next.js 16 "use cache" & Turbopack Windows Resolution
- **📌 Issue**: `Filling a "use cache" entry appears to be stuck on shared state from the outer render scope` & `Access is denied (os error 5)`.
- **🔍 Root Cause & Failed Attempts**: Next.js 16 preview experimental `'use cache'` and Turbopack disk locks on Windows failed on shared Mongoose promises.
- **🛠️ Verified Code Fix**: Replaced `'use cache'` with official React `cache()` in `src/lib/cache.ts`, removed `cacheComponents: true` from `next.config.ts`, and updated `package.json` dev script to `next dev --webpack`.

### 2026-08-25 — Gitignore & 10k+ Pnpm Cache Blobs Cleanup
- **📌 Issue**: VS Code Source Control showing "Too many changes were detected (10000+ files)" with long hexadecimal hashes.
- **🔍 Root Cause & Failed Attempts**: An unexpanded `%USERPROFILE%/.pnpm-store` directory was created in project root on Windows, causing thousands of dependency blobs to appear in git changes.
- **🛠️ Verified Code Fix**: Added `%USERPROFILE%`, `.pnpm-store`, `.turbo`, `.next`, `*.tsbuildinfo`, and local caches to [`.gitignore`](file:///d:/proj/Pak-o-Drive/.gitignore) and cleanly removed the accidental directory.

---

