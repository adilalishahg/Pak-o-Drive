# 🧠 Project Memory & Technical Knowledge Base — Pak-o-Drive

This document serves as the persistent memory register for the **Pak-o-Drive** codebase. It tracks active tasks, documents resolved technical challenges using the standardized 3-bullet resolution schema, and provides a curated operational knowledge base.

---

## 📋 Active Task & Architectural Status Register

| Module | Status | Active Scope | Blockers / Next Milestones |
| :--- | :--- | :--- | :--- |
| **Web Storefront** | Active / Stable | React 19 Hydration Guards, 2-Layer Media, Cart Drawer. | Multi-variant pricing sync under edge cases. |
| **Checkout & Payments** | Active | COD validation, E.164 normalization, 2-Step OTP state machine. | Automated JazzCash IPN webhook verification. |
| **Admin Control Suite** | Active | Recharts revenue visualization, status transitions, low-stock alerts. | Multi-warehouse inventory dispatch. |
| **Desktop POS Client** | In Development | Electron isolation, typed preload IPC bridge, ESC/POS generator. | Physical USB thermal printer buffer serialization. |
| **WhatsApp AI Bot** | In Development | Baileys multi-device socket worker (`bot.mjs`), Gemini AI NLP parser. Hosted on European server (`alwaysdata.com`). | Socket reconnect loop handling on credential refresh. |

---

## 📓 Dynamic Learning Ledger (3-Bullet Resolution Format)

### Entry 1: React 19 / Next.js 16 Client Cart Hydration Crash
- 📌 **Issue**: Storefront threw fatal client error: `Hydration failed because the server-rendered HTML didn't match the client`.
- 🔍 **Root Cause & Failed Attempts**: Attempting to read `localStorage.getItem("pakodrive_cart")` directly in the initial state initializer of `CartContext.tsx`. During server-side rendering, `localStorage` is undefined (or returns null), but on the client it loaded existing items, producing an HTML discrepancy. Attempting `suppressHydrationWarning` on root divs merely masked the problem without fixing interactive desyncs.
- 🛠️ **Verified Code Fix**: Abstracted client hydration behind an `isMounted` state gate via `useMounted()` hook. Render a zero-item or skeleton cart structure until `useEffect` executes on the client, synchronizing local storage safely without SSR mismatches.

---

### Entry 2: Electron Thermal Printer Buffer Serialization Failure
- 📌 **Issue**: Passing raw binary ESC/POS buffer arrays from the Electron renderer process to the main process via IPC crashed the application with an IPC clone error.
- 🔍 **Root Cause & Failed Attempts**: Electron's structured clone algorithm in `contextBridge` cannot serialize certain complex class instances or native printer device handles directly between isolated execution contexts. Attempting to attach raw printer handles to `window` threw security exceptions due to `contextIsolation: true`.
- 🛠️ **Verified Code Fix**: Formatted the receipt data into a pure JSON payload (strings, numbers, simple arrays) in the renderer. The payload is passed through `window.electronAPI.printReceipt(jsonPayload)`. The Electron main process receives the JSON, compiles the ESC/POS binary byte array locally using Node.js `Buffer`, and writes directly to the printer interface.

---

### Entry 3: Baileys Multi-Device Socket Infinite Reconnect Loop
- 📌 **Issue**: Running `node src/worker/bot.mjs` entered an aggressive reconnect loop, generating thousands of socket connection attempts and exhausting system ports.
- 🔍 **Root Cause & Failed Attempts**: On socket closure with status code `DisconnectReason.loggedOut` or `428 (Precondition Required)`, the script blindly attempted `makeWASocket` without clearing corrupted authentication keys in `.whatsapp_auth/` or evaluating the restart status code.
- 🛠️ **Verified Code Fix**: Implemented an exponential backoff reconnect policy. If the disconnect status equals `DisconnectReason.loggedOut` (401), the bot halts reconnects, wipes `.whatsapp_auth/`, and emits a fresh pairing QR code to terminal/logs. Normal network timeouts (515) retry with an exponential delay (2s, 4s, 8s, up to 30s).

---

### Entry 4: Next.js 16 Server Action Request Body Size Limit with Receipts
- 📌 **Issue**: Submitting bank transfer or JazzCash payment receipt screenshots via Server Actions resulted in HTTP 413: *“Payload Too Large”*.
- 🔍 **Root Cause & Failed Attempts**: Next.js 16 Server Actions enforce a default body size limit of 1MB. High-resolution mobile camera screenshots routinely exceed 3MB to 5MB.
- 🛠️ **Verified Code Fix**: Configured `experimental.serverActions.bodySizeLimit: '10mb'` in `next.config.ts`. Additionally, implemented client-side thumbnail downsampling using HTML canvas prior to upload, routing large binary payloads directly to Cloudinary via client unsigned upload presets.

---

## 🏛️ Curated Knowledge Base & Critical Gotchas

### 1. Pakistani Phone E.164 Sanitization Regex
Customers input phone numbers in diverse formats (`0300-1234567`, `0300 1234567`, `+923001234567`, `923001234567`). Always normalize using:
```typescript
export function normalizePakistaniPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("92") && digits.length === 12) {
    return digits;
  }
  if (digits.startsWith("03") && digits.length === 11) {
    return "92" + digits.slice(1);
  }
  if (digits.startsWith("3") && digits.length === 10) {
    return "92" + digits;
  }
  return digits;
}
```

### 2. Mongoose 9.x Connection Caching in Next.js App Router
Avoid multiple active connections during Next.js hot-reloading:
```typescript
// src/lib/dbConnect.ts
declare global {
  var mongooseCache: { conn: any; promise: any };
}
let cached = global.mongooseCache || { conn: null, promise: null };
// Reuse cached.conn across HMR cycles
```

### 3. Pakistani Rupee (PKR) Formatting Standard
Always format currency with commas and explicit prefix:
```typescript
export const formatPKR = (amount: number) => `PKR ${amount.toLocaleString('en-PK')}`;
```
