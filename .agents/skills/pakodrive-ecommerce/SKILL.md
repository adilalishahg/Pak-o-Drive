---
name: pakodrive-ecommerce
description: Full-stack engineering standards for Next.js 16, React 19, MongoDB Mongoose models, and Cloudinary media management.
---

# 🚀 Pak-o-Drive Full-Stack Engineering Standards

## 1. Zero Logic in Presentational TSX (Rule #8)
- TSX files in `src/app/` and `src/components/` must be pure JSX rendering.
- Encapsulate all state, form validation, cart mutations, API requests, and side effects in custom hooks (`src/hooks/`) or context providers (`src/context/`).

## 2. Cart SSR Hydration Guard (Rule #1)
- Never directly read `localStorage` during initial SSR.
- Always guard cart badges, counts, and drawers with an `isMounted` state guard (`useMounted()`) to avoid React 19 / Next.js 16 hydration mismatch crashes.

## 3. Database & Mongoose Contract Resiliency (Rule #6)
- Standardize all enums (Order statuses, Payment methods, City names) in `src/lib/constants.ts`.
- Mongoose schemas must define explicit TypeScript interfaces (`IProduct`, `IOrder`, `ICategory`, `ISiteSettings`).
- Always reuse the cached serverless database connection from `src/lib/mongodb.ts`.

## 4. Zero Native Browser Dialogs (Rule #7)
- `window.alert()`, `window.confirm()`, and `window.prompt()` are strictly forbidden.
- Always use accessible toast notifications (`sonner` / `react-hot-toast`) and dedicated UI dialog primitives.

## 5. Security & 2-Step OTP Verification (Rule #5)
- Support 60-second resend countdown timer and auto-focus 6-digit numeric input mask for sensitive COD / Admin actions.
