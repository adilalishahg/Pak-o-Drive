---
name: pak-ecommerce
description: Specialized workflows, conversion patterns, COD logic, and Pakistan-market best practices for Pak-o-Drive.
---

# 🇵🇰 Pakistani E-Commerce & COD Conversion Skill

Use this skill when developing, refactoring, or optimizing checkout flows, marketing triggers, customer trust badges, and WhatsApp integration in Pak-o-Drive.

---

## 1. High-Conversion 1-Click COD Checkout
Pakistani online shoppers value speed, transparency, and zero friction.

### Core Implementation Checklist:
- **Zero Forced Account Creation:** Never force registration or passwords.
- **Short 4-Field Form:**
  1. Full Name (`name`)
  2. Mobile / WhatsApp Number (`phone` with `03XX-XXXXXXX` and `+923XXXXXXXXX` validation)
  3. Delivery Address (`address`)
  4. City Selection (`city` with 50+ Pakistani cities dropdown from `src/lib/constants.ts`)
- **Live Fee & Delivery Preview:** Clear breakdown of COD amount, Free Shipping thresholds, and estimated city delivery times (*Karachi/Lahore: 24-48h*, *Others: 2-4 Days*).

---

## 2. WhatsApp 1-Click Ordering & Native Share
- **1-Click WhatsApp Ordering:**
  - Format: `https://wa.me/923XXXXXXXXX?text=<encoded_message>`
  - Prefilled with: Product Title, SKU, Variant, and Price in PKR (`Rs. X,XXX`).
- **Native Share Integration:**
  - Use `navigator.share()` on mobile devices with fallback to clipboard URL copy.
- **Anti-RTO Order Verification:**
  - Automated WhatsApp confirmation templates to verify buyer address before dispatch, dropping RTO rates from 25% to under 7%.

---

## 3. Media & Presentation Standards
- **100% Uncropped Dual-Layer Display:**
  - Layer 1 Ambient Blur Backdrop (`blur-2xl opacity-40`) + Layer 2 `object-contain` foreground.
- **Typography Anti-Clipping:**
  - Always use `leading-normal py-0.5` alongside `truncate` on titles and price tags (never `leading-none`).

---

## 4. Security & Courier Automation
- **2-Step OTP Verification:** 60s countdown timer and 6-digit auto-focus input mask for high-value orders and admin actions.
- **Courier API Integrations:** Unified booking adapters for PostEx, Trax, Leopards, TCS, and CallCourier.
