# 📦 Pak-o-Drive — Project Context & Architecture Map

## Overview
Full-stack E-Commerce application optimized for the Pakistani retail ecosystem.

## Tech Stack
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** TailwindCSS v4
- **Database:** MongoDB + Mongoose
- **Storage:** Cloudinary
- **Emails:** Resend API
- **State Management:** React Context (`CartContext`, `WishlistContext`, `ThemeContext`)

## Directory Structure
- `src/app/` — Next.js pages and API route handlers
- `src/components/` — UI components (Storefront, Product Cards, Cart Drawer, Admin UI)
- `src/models/` — Mongoose Database Models (`Product.ts`, `Order.ts`, `Category.ts`, `SiteSettings.ts`)
- `src/lib/` — Shared utilities (`dbConnect.ts`, `constants.ts`, `cloudinary.ts`)
- `src/context/` — Global state providers
- `src/hooks/` — Custom business logic hooks
- `.agents/` — Workspace rules, dynamic memory, and project skills

## Key Routes
- **Public:** `/` (Home), `/shop` (Catalog), `/product/[id]` (Detail), `/cart` (Cart), `/checkout` (COD Checkout), `/track-order` (Tracking)
- **Admin:** `/admin` (Dashboard), `/admin/products` (Catalog), `/admin/orders` (Order Processing), `/admin/settings` (Site Settings)
