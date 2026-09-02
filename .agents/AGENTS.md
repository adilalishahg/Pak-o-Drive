# Workspace Rules — Pak-o-Drive (E-Commerce Platform)

## Scope: Modern Next.js 16 + React 19 + MongoDB E-Commerce
This repository contains the full-stack Pak-o-Drive application. All work must follow these strict Pakistani E-Commerce & Full-Stack standards:
- **Stack:** Next.js 16 (App Router), React 19, TypeScript, TailwindCSS v4, MongoDB, Mongoose, Cloudinary, Resend.

## Mandatory 8 Core Engineering & Architecture Rules

1. 🛒 **Cart SSR Hydration Guard (React 19 / Next.js 16)**:
   - Never render `localStorage` or persisted client cart state directly during initial SSR.
   - Always encapsulate cart badges, drawers, and totals with an `isMounted` / `useMounted()` guard to prevent Next.js 16 / React 19 hydration mismatch crashes (`Text content does not match server-rendered HTML`).

2. 📱 **WhatsApp 1-Click Ordering & Native Share**:
   - Support Web Share API (`navigator.share`) with instant fallback to clipboard copy.
   - Always normalize Pakistani phone numbers into E.164 (`923XXXXXXXXX` / `+923XXXXXXXXX`).
   - Deep-link 1-click WhatsApp order buttons with pre-filled product SKU, title, variant, and PKR price templates.

3. 🖼️ **100% Uncropped Media Presentation**:
   - Product gallery cards, carousels, and banners must preserve uncropped product dimensions.
   - Use dual-layer presentation: **Layer 1 Ambient Blur Backdrop** (`blur-2xl opacity-40`) + **Layer 2 `object-contain`** so automotive parts, gadgets, and accessories are never clipped.

4. 🔤 **Typography Clipping Prevention**:
   - Any single-line or clamped product titles, discount badges, and PKR price tags using `truncate` or `line-clamp-*` MUST use `leading-normal py-0.5` (NEVER `leading-none` or `leading-tight`) to avoid Urdu/English ascender and descender clipping.

5. 🔐 **2-Step OTP Verification (COD & Admin)**:
   - High-value COD orders and Admin operations must support 2-step verification.
   - Implement state machine with 60-second countdown resend timer, auto-focus 6-digit numeric input mask, and secure key hydration.

6. 🔗 **Enum Normalization & Mongoose Contract Resiliency**:
   - Order statuses (`"Pending"`, `"Processing"`, `"On the Way"`, `"Shipped"`, `"Delivered"`, `"Cancelled"`), payment methods (`"COD"`, `"JazzCash"`, `"Easypaisa"`), and Pakistani major cities must be normalized in `src/lib/constants.ts` and validated across Mongoose models and API controllers.

7. 🛡️ **Zero Native Browser Dialogs (`alert`/`confirm`/`prompt`)**:
   - `window.alert()`, `window.confirm()`, and `window.prompt()` are STRICTLY FORBIDDEN.
   - Always use toast notifications (`sonner` / `react-hot-toast`) and custom modal primitives (`<DeleteConfirmDialog />`, `<CancelOrderDialog />`).

8. 👑 **Zero Logic in UI & Admin Role Parity**:
   - Files in `src/app/` and `src/components/` must be pure presentational views (JSX rendering only).
   - ALL business logic, form state, cart mutations, API requests, and side-effects must reside in custom hooks in `src/hooks/` or context providers in `src/context/`.
   - Admin override flags (`isAdmin`) must cleanly propagate across access control boundaries.

9. 🖥️ **Desktop & POS Electron Isolation**:
   - All desktop logic in `desktop/` must strictly maintain `contextIsolation: true` and `nodeIntegration: false`.
   - Expose native functionalities (POS thermal receipt printing, WhatsApp external deep linking, local state storage) only via typed `window.electronAPI` bridge in `desktop/src/preload/index.ts`.

10. 🌐 **Dynamic External Data & Tool Discovery (Monid Gateway)**:
   - For ad-hoc web scraping, competitor pricing intelligence, social media data, or multi-provider API enrichment, proactively discover endpoints via `monid discover` and inspect schemas with `monid inspect` before building custom scrapers from scratch.
   - Maintain API key authentication through `monid keys add` and verify health/cost metrics before running paid endpoints.

11. ⚡ **Autonomous Agent Efficiency & Cost Optimization Protocol**:
   - **Targeted Chunk Diffing**: Strictly use chunk replacements (`replace_file_content`) over full-file rewrites to preserve 80-90% output tokens.
   - **Self-Healing Typecheck**: Automatically run `pnpm tsc --noEmit` and resolve all type/build errors before finalizing any task.
   - **Smart Tool & Skill Activation**: Dynamically load specialized skills from `.agents/skills/` and suggest appropriate model/slash command modes (`/goal`, `/grill-me`, `/learn`) when task complexity demands it.

---

## Dynamic Memory & Changelog Directive
- Update `.agents/LEARNINGS.md` in 3-bullet resolution format (`Issue`, `Root Cause`, `Verified Fix`) with date-stamped entries on every completed task.
- Run `graft build` after architectural or knowledge updates to ensure the graph and code build pass with 0 errors.


