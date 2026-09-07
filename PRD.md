# 📄 Product Requirements Document (PRD) — Pak-o-Drive

## 1. Executive Summary & Vision
**Pak-o-Drive** is an enterprise-grade, high-performance retail, automotive parts, and consumer electronics marketplace engineered specifically for the Pakistani commercial ecosystem. The platform bridges digital e-commerce with in-store physical retail through a unified **4-in-1 Architecture**:
1. **Public Web Storefront**: A mobile-first Next.js 16 / React 19 web application optimized for conversion, localized payment channels, and uncropped media presentation.
2. **Admin Management Suite**: A centralized management interface (`/admin`) for inventory management, multi-stage order dispatch, and financial analytics.
3. **Desktop POS Client**: An Electron.js desktop application running in physical storefronts with hardware thermal receipt printing and cloud database synchronization.
4. **Autonomous WhatsApp Bot**: An always-on conversational assistant built on Baileys multi-device sockets and Google Gemini AI (`@google/generative-ai`) for customer inquiries, status lookups, and auto-invoicing.

---

## 2. Market Dynamics & Pakistan-Specific Commercial Requirements
E-commerce in Pakistan exhibits distinct operational constraints that dictate our core architecture:
- **Dominance of Cash on Delivery (COD)**: Over 75% of domestic transactions settle via COD. High Return-to-Origin (RTO) rates require multi-stage verification (SMS/WhatsApp OTP) on high-ticket orders.
- **Mobile-First & WhatsApp-Centric Flow**: The primary commercial interaction layer is WhatsApp. Direct click-to-WhatsApp order triggers with pre-populated cart SKUs, PKR amounts, and variants significantly improve checkout conversion compared to complex multi-step web checkouts.
- **Alternative Digital Wallets**: Native checkout must accommodate JazzCash and Easypaisa direct payments alongside manual slip uploads and digital gateway validation.
- **Network Constraints**: Low bandwidth in tier-2/tier-3 cities requires aggressive asset optimization, uncropped dual-layer image presentation without layout shift, and resilient offline queuing on POS hardware.

---

## 3. Core Architecture Modules

### Module 1: Public Web Storefront
- **Responsive Catalog Engine**: High-velocity search and faceted filtering across automotive components, electrical accessories, and gadgets.
- **Dual-Layer Media Presentation**: Zero-crop display system featuring an ambient blurred background (`blur-2xl opacity-40`) layered behind an `object-contain` foreground image to ensure automotive parts and hardware specifications are never visually clipped.
- **Cart & Hydration Resilience**: Client-persisted shopping cart fully shielded by React 19 / Next.js 16 hydration guards (`isMounted` verification) to eradicate SSR hydration mismatch crashes.
- **Pakistani Checkout Pipeline**:
  - Cash on Delivery (COD) with automated city-tiered shipping rate calculators.
  - JazzCash & Easypaisa mobile wallet payment integrations.
  - 1-Click WhatsApp Direct Ordering (`923XXXXXXXXX` E.164 normalization) with automated SKU/title/PKR price deep links.
  - 2-Step OTP Verification state machine triggered on high-ticket orders (> PKR 10,000) or suspicious delivery addresses to suppress fake orders.

### Module 2: Admin Management Suite (`/admin`)
- **Order Lifecycle State Machine**:
  $$\text{Pending} \longrightarrow \text{Processing} \longrightarrow \text{On the Way} \longrightarrow \text{Delivered} \; (\text{or } \text{Cancelled})$$
  Enforces strict forward-only transitions, automated customer notifications, and immutable audit logs.
- **Interactive Financial Analytics**: Revenue, order volume, and AOV visualizations powered by Recharts, featuring real-time Pakistani Rupee (PKR) formatting.
- **Catalog & Inventory Control**: Real-time stock counters, low-inventory threshold triggers, and bulk pricing updates.
- **Site Configuration Hub**: Dynamic control over banner campaigns, free shipping thresholds, delivery zone surcharges, and WhatsApp bot operating parameters.

### Module 3: Desktop POS Client (`desktop/`)
- **Hardware Integration**: Direct communication with 58mm / 80mm ESC/POS thermal receipt printers via low-level serial/USB pipelines.
- **Security & Isolation**: Strict Electron process isolation (`contextIsolation: true`, `nodeIntegration: false`) exposing only typed IPC channels via `window.electronAPI`.
- **Offline Queuing**: Local SQLite/JSON buffering allowing retail cashiers to record counter sales during internet outages, syncing automatically back to the cloud MongoDB instance upon connection restoration.
- **Rapid Barcode Scanning**: Keyboard wedge barcode input capture for sub-second SKU lookups and checkout counter velocity.

### Module 4: Autonomous WhatsApp Bot (`src/worker/bot.mjs`)
- **Multi-Device Socket Engine**: Persistent socket connection powered by `@whiskeysockets/baileys` with automated session restoration and QR-code pairing.
- **Gemini AI Conversational Core**: Integrated with Google Gemini AI (`@google/generative-ai`) to parse natural language Urdu/English product questions, recommend matching vehicle/tech accessories, and provide accurate stock checks.
- **Automated Order Tracking**: Direct order status lookups via WhatsApp when a customer texts their tracking ID or registered phone number.
- **Invoice Delivery via Resend**: Triggered transactional PDF receipt generation and email dispatch through the Resend API upon order confirmation.

---

## 4. User Personas

| Persona | Role | Primary Goals | Key Pain Points |
| :--- | :--- | :--- | :--- |
| **Retail Consumer (Pakistan)** | Car owner / Tech enthusiast | Quickly find compatible parts, verify authenticity, order via WhatsApp or COD without credit card. | High shipping fraud, cut-off product specs on low-end screens, clunky checkouts. |
| **Store Dispatcher** | Warehouse Manager | Rapidly process incoming orders, transition tracking statuses, filter pending COD verifications. | Missed shipments, unconfirmed phone numbers, duplicate orders. |
| **Physical POS Cashier** | Store Counter Operator | Scan product barcodes, accept cash/JazzCash, print 80mm thermal receipts instantly. | Internet dropouts halting retail checkout queues. |
| **Store Executive / Owner** | Business Director | Monitor gross revenue, track RTO rates, manage product inventory and promotional banners. | Scattered data across paper receipts, WhatsApp chats, and web portals. |

---

## 5. Non-Functional Requirements & Performance Targets
- **Core Web Vitals**: Largest Contentful Paint (LCP) $\le 1.8\text{s}$, Interaction to Next Paint (INP) $\le 100\text{ms}$, Cumulative Layout Shift (CLS) $\le 0.05$.
- **Zero Hydration Errors**: Strictly 0 hydration mismatches across mobile and desktop environments.
- **Availability**: 99.9% uptime on web storefront; offline fault tolerance on desktop POS.
- **Security**: Zero access to privileged Node.js APIs in Electron renderer; all admin mutations guarded by session validation; all client inputs sanitized against injection attacks.
- **Localization Resilience**: Native layout stability for English and Urdu text across all viewports without ascender/descender clipping (`leading-normal py-0.5`).
