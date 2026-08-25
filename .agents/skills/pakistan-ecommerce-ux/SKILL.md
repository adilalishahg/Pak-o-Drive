---
name: pakistan-ecommerce-ux
description: Conversion Rate Optimization (CRO) and UX patterns tailored for the Pakistani e-commerce market (COD, WhatsApp, Urgency triggers).
---

# 🇵🇰 Pakistan E-Commerce UX & CRO Guidelines

## 1. Frictionless COD Checkout (CRO Standard)
- Short form fields (Name, Phone/WhatsApp, Address, City dropdown).
- Support standard Pakistani phone formats (`03001234567`, `0300-1234567`, `+923001234567`).
- Zero mandatory sign-up or complex password creation steps.
- Dual-action CTAs: `Complete Order (Cash On Delivery)` and `Order via WhatsApp (1-Click)`.

## 2. 100% Uncropped Media & Typography Polish
- Dual-layer product cards: Layer 1 ambient blur background (`blur-2xl opacity-40`) + Layer 2 `object-contain` center image.
- Avoid text clipping: Use `leading-normal py-0.5` with `truncate` or `line-clamp-*` (never `leading-none`).

## 3. Trust, Urgency & Social Proof Badges
- **7-Day Replacement Guarantee:** Visible on header bar, product details, and checkout.
- **Estimated Delivery Timelines:** City delivery matrix (Karachi/Lahore 1-2 days, other cities 2-4 days).
- **Live Social Proof Popups:** Toast notifications for real-time orders from Pakistani cities.
- **Zero Native Dialogs:** Use Sonner / Hot-Toast and custom modal primitives instead of browser `alert`/`confirm`.
