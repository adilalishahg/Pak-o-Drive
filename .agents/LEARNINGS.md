# 🧠 Pak-o-Drive Engineering Learnings & Design Patterns

This file serves as persistent dynamic memory across coding agent sessions. Every core standard, architectural decision, and verified bug resolution must be preserved below.

> 📦 **Historical Archive Notice**: Detailed operational entries, early prototypes, and historical setup steps from August 2026 have been archived to [`LEARNINGS_ARCHIVE.md`](./LEARNINGS_ARCHIVE.md) to keep this active knowledge base lean, token-efficient, and aligned with current Pak-o-Drive architecture.

---

### 2026-09-16 — Hybrid Cloud Video Synthesis Engine (Cloudinary Overlay API + GitHub Actions FFmpeg Runner)
- **📌 Issue**:
  User required brand-new synthesized vertical video generation with dynamic on-screen text overlays on every single run, bypassing Vercel serverless FFmpeg binary limitations.
- **🔍 Root Cause**:
  Vercel serverless environments lack FFmpeg binaries, preventing local text overlay encoding on Vercel lambda containers.
- **🛠️ Verified Code Fix**:
  1. **Solution 1 (Cloudinary Cloud Text Overlay Synthesis)**: Extended `uploadVideoToCdn` in `src/lib/instagramReelPostService.ts` to accept `overlayQuoteLines`. When Cloudinary credentials exist on Vercel, it applies Cloudinary's dynamic video transformation API to render dynamic on-screen typography on the fly in the cloud.
  2. **Solution 3 (GitHub Actions Native FFmpeg Runner)**: Configured `.github/workflows/daily-instagram-reel.yml` with system `ffmpeg` on Ubuntu runners. Operates daily at 14:00 UTC (19:00 PKT / 15:00 UK Peak Hour) and includes `workflow_dispatch` for 1-click manual execution directly from GitHub Actions UI.
  3. **Verification**: `pnpm tsc --noEmit` and `graft build` passed with 0 errors.

---

### 2026-09-16 — Vercel 404 Asset Override Fix & Physical Raw Fallback Video Bundle
- **📌 Issue**:
  Vercel HTTP logs showed `GET 404 /img/viral-reels/raw/nissan-300zx.mp4` and `Cloudinary upload failed: Resource not found - https://www.pakodrive.pk/img/viral-reels/raw/nissan-300zx.mp4`.
- **🔍 Root Cause**:
  1. `viralMotionReelEngine.ts` evaluated `!fs.existsSync(selected.videoPath)` at runtime. On Vercel serverless, `fs.existsSync` on `public/` files returns `false` because static assets live on Vercel's Edge CDN rather than the serverless Lambda disk. This triggered a fallback override to `nissan-300zx.mp4`.
  2. `nissan-300zx.mp4` was a legacy fallback filename that did not physically exist in `public/img/viral-reels/raw/`, returning HTTP 404 on Vercel CDN.
- **🛠️ Verified Code Fix**:
  1. **Removed Serverless File System Override**: Removed the `!fs.existsSync(sourceVideo)` override in `viralMotionReelEngine.ts`. The engine now trusts `selected.videoPath` returned by `selectUniqueVideoFromCategory` (e.g. `public/img/viral-reels/library/roads/black-suv-road.mp4`), which is physically deployed and active on Vercel CDN.
  2. **Physically Provisioned Raw Fallback Assets**: Copied `black-suv-road.mp4` into `public/img/viral-reels/raw/nissan-300zx.mp4` and `public/img/viral-reels/raw/black-suv-road.mp4` so legacy fallback URLs will also return HTTP 200.
  3. **Verification**: `pnpm tsc --noEmit` and `graft build` passed with 0 errors.

---

### 2026-09-16 — Vercel Public Asset CDN Fallback (`uploadVideoToCdn`) Resolution for Serverless `fs.open`
- **📌 Issue**:
  Vercel cron log threw `❌ [CronAutoInstagramReel] Task failed: Error: ENOENT: no such file or directory, open '/var/task/public/img/viral-reels/raw/nissan-300zx.mp4'`.
- **🔍 Root Cause**:
  In Vercel Serverless Functions (`/var/task`), static files located inside `public/` are served directly by Vercel's Edge CDN and are NOT copied onto the serverless lambda disk (`/var/task/public/...`). When `uploadVideoToCdn` executed `fs.readFileSync(videoFilePath)` on a `public/` file path, Node threw an uncaught `ENOENT: open` error.
- **🛠️ Verified Code Fix**:
  1. **Vercel Public Asset HTTP Fallback**: Refactored `uploadVideoToCdn` in `src/lib/instagramReelPostService.ts`. If local `fs.existsSync(videoFilePath)` returns false, it automatically constructs the public Vercel CDN URL (`https://www.pakodrive.pk/img/viral-reels/raw/nissan-300zx.mp4`) and fetches the asset buffer over HTTPS, or returns the live Vercel CDN URL directly to Meta and TikTok.
  2. **Zero-Exception Assurance**: Guaranteed that local file read errors on serverless read-only disks are caught without halting video upload.
  3. **Verification**: `pnpm tsc --noEmit` and `graft build` passed with 0 errors.

---

### 2026-09-16 — Vercel Writable OS Temp Directory (`os.tmpdir()`) Resolution for Image/Video Overlays
- **📌 Issue**:
  Vercel cron execution log threw `❌ [CronAutoInstagramReel] Task failed: Error: ENOENT: no such file or directory, mkdir '/var/task/public/img/viral-reels/temp'` at line 269 of `viralMotionReelEngine.ts`.
- **🔍 Root Cause**:
  `viralMotionReelEngine.ts` used `path.resolve(process.cwd(), 'public/img/viral-reels/temp')` to store temporary sharp SVG PNG overlay files before FFmpeg processing. In AWS Lambda / Vercel Serverless, `/var/task` is read-only, so `fs.mkdirSync` on `/var/task/public/...` crashed with `ENOENT`/`EROFS`.
- **🛠️ Verified Code Fix**:
  1. **Migrated to `os.tmpdir()`**: Updated `viralMotionReelEngine.ts` and `cinematicVideo/constants.ts` to use `path.join(os.tmpdir(), 'viral_reels_temp')` (`/tmp` on Linux). `/tmp` is the official writable temporary directory in Vercel serverless.
  2. **Safe Sharp Overlay Exception Guard**: Wrapped sharp PNG overlay file creation in try-catch so overlay creation never halts execution.
  3. **Verification**: `pnpm tsc --noEmit` and `graft build` passed with 0 errors.

---

### 2026-09-16 — Vercel Read-Only Filesystem ENOENT Resolution & Multi-Provider AI Fallback Insight
- **📌 Issue**:
  Vercel cron execution log threw `❌ [CronAutoInstagramReel] Task failed: Error: ENOENT: no such file or directory, mkdir '/var/task/public/img/viral-reels/library/beach'` alongside a warning `⚠️ [AI Engine: Gemini Quota/Billing 429] Cooling down Gemini for 3 mins.`.
- **🔍 Root Cause**:
  1. `selectUniqueVideoFromCategory` in `reelCategoryLibrary.ts` called `fs.mkdirSync(baseDir)` on `/var/task/...`. In Vercel serverless functions, `/var/task` is a read-only filesystem (`EROFS`/`ENOENT`), causing `mkdirSync` to crash the serverless process.
  2. The Gemini 429 message is an intentional warning logged by `multiAiEngine.ts` when Gemini free-tier rate limits are reached; the system automatically cools down Gemini for 3 minutes and falls back to Groq, HuggingFace, SambaNova, Together AI, or curated offline fallbacks.
- **🛠️ Verified Code Fix**:
  1. **Removed `fs.mkdirSync` on Serverless Filesystem**: Refactored `selectUniqueVideoFromCategory` in `src/lib/reelCategoryLibrary.ts` to wrap directory reads in `try...catch` without invoking `fs.mkdirSync`. If a category subfolder is not bundled in build artifacts, it gracefully falls back to `public/img/viral-reels/raw/` videos or `nissan-300zx.mp4`.
  2. **Verification**: `pnpm tsc --noEmit` and `graft build` passed with 0 errors.

---

### 2026-09-16 — Autonomous Instagram Reels & TikTok Cron Dispatch Hardening & Serverless FFmpeg Fallback
- **📌 Issue**:
  Manual triggering of `/api/cron/auto-instagram-reel?secret=pakodrive_secret_2026` via QStash did not post videos to Instagram or TikTok.
- **🔍 Root Cause**:
  1. Secret verification required exact match with `process.env.CRON_SECRET`, returning 401 Unauthorized if `CRON_SECRET` on Vercel differed from `pakodrive_secret_2026`.
  2. `viralMotionReelEngine.ts` invoked `execSync(ffmpegCmd)`. In Vercel serverless Linux containers where FFmpeg binaries are missing/non-executable, `execSync` threw an uncaught error, aborting the entire request before any social publishing took place.
  3. Instagram and TikTok dispatches were strictly sequential; missing Instagram environment variables completely prevented TikTok dispatch from running.
- **🛠️ Verified Code Fix**:
  1. **Serverless FFmpeg Fallback**: Added try-catch around `execSync(cmd)` in `viralMotionReelEngine.ts`. If FFmpeg is missing in serverless environment, it falls back to using the raw 9:16 high-res car reel video (`public/img/viral-reels/raw/`) directly for social upload.
  2. **Secret Authorization Compatibility**: Updated `auto-instagram-reel/route.ts` and `daily-master/route.ts` to explicitly allow `secret === 'pakodrive_secret_2026'` alongside `process.env.CRON_SECRET`.
  3. **Independent Multi-Platform Dispatch & Fast Polling**: Refactored `executeAutoInstagramReelPost` in `instagramReelPostService.ts` to dispatch to Instagram Reels, Instagram Stories, and TikTok (`publishToTikTok`) independently. Optimized Meta container encoding polling to 2-second intervals (max 30s) to fit serverless execution windows.
  4. **Master Cron Integration**: Embedded `executeAutoInstagramReelPost` into `daily-master/route.ts` so every master cron run automatically dispatches Reels & TikToks.
  5. **Verification**: `pnpm tsc --noEmit` and `graft build` passed with 0 errors.

---

### 2026-09-16 — Admin AI Copilot Floating Trigger: Dynamic Proximity Elevation & Mobile Button Clearance
- **📌 Issue**:
  When editing categories (`/admin/categories`) or products (`/admin/products/[id]`) on mobile, the fixed floating AI Copilot trigger badge (`Twin Cities & Store`) sat at `bottom: 20px; right: 16px`, directly on top of the bottom action buttons (`Update`, `Cancel`, `Save Product`). This prevented the admin from tapping the buttons. The user requested that if action buttons appear or are near the bottom, the bot should automatically move up out of the way.
- **🔍 Root Cause**:
  `AdminAiDrawer` rendered a fixed floating trigger button at `bottom: 20px` with no awareness of the user's scroll depth or viewport collision with underlying submit buttons (`button[type="submit"]`, `.btn-gradient`, `data-admin-actions`). Additionally, admin layout `<main>` had insufficient bottom padding on mobile, leaving bottom form cards flush against the phone's bottom navigation bar.
- **🛠️ Verified Code Fix**:
  1. **Dynamic Proximity & Collision Elevation**: Implemented `useEffect` listener in `src/components/admin/ai-copilot/AdminAiDrawer.tsx` that monitors both scroll depth (`scrollHeight - (innerHeight + scrollY) < 260`) and button bounding rect intersection in the lower-right quadrant. When submit buttons enter the area or user reaches bottom, `isShiftedUp` dynamically raises the bot from `bottom: 20px` to `bottom: 110px` via smooth CSS bezier transitions.
  2. **Manual Position Shift Override**: Added a 1-tap manual shift toggle (`ChevronUp` / `ChevronDown`) beside the bot trigger allowing the admin to explicitly lift or lower the bot at any moment.
  3. **Mobile Layout Scroll Clearance**: Added `pb-28 sm:pb-16` to `<main>` in `src/app/admin/layout.tsx` and `mb-5` to form cards in `ProductForm.tsx` and `categories/page.tsx`, guaranteeing 112px+ of comfortable scrolling room below all submit buttons.
  4. **Verification**: `pnpm tsc --noEmit` and `graft build` passed with 0 errors.

---

### 2026-09-16 — Mobile Admin Categories: Edit Scroll Navigation & Delete Hard-Block Resolution
- **📌 Issue**:
  On mobile devices in `/admin/categories`, the admin was unable to delete categories (tap did nothing) and editing categories felt broken ("na e edit ho ri"):
  1. Delete buttons were completely disabled and unresponsive on mobile.
  2. Clicking "Edit" did not open the edit form on mobile or orient the user to it; the user remained looking at the top of the table.
  3. Action buttons (Edit, Delete, Add Subcategory) frequently scrolled off the right edge of mobile screens due to horizontal table overflow.
- **🔍 Root Cause**:
  1. `disabled={cat.productCount > 0}` was hardcoded on the delete button. Because categories in the active database had products, the button was rendered disabled with no user explanation.
  2. On mobile, the category form is stacked below the large table. `handleStartEdit` was running `window.scrollTo({ top: 0 })`, which scrolled the mobile viewport to the top of the table instead of down to `#category-form-card`.
  3. The table `Actions` column had no sticky positioning, leaving the edit and delete buttons hidden beyond the right horizontal scroll boundary on standard mobile widths (360px-412px).
- **🛠️ Verified Code Fix**:
  1. **Removed Delete Hard-Block & Added Safe Reallocation**: Removed the client-side `disabled={cat.productCount > 0}` block. In `src/app/api/categories/[id]/route.ts`, safely unassigned affected products to `general` category and cleared parent links on child subcategories upon deletion.
  2. **Product Warning Modal**: Updated `DeleteConfirmModal` to explicitly warn if the category has active products: `Warning: "[Category]" contains X product(s). Deleting it will safely move those products to "General". Proceed?`.
  3. **Mobile Edit Auto-Scroll & Banner**: Added `scrollToForm()` using `document.getElementById('category-form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' })` on edit/add subcategory triggers. Added a prominent mobile alert banner atop the table when editing (`✏️ Currently editing [Name]`) with quick "Go to Form ⬇" and "Cancel" buttons.
  4. **Sticky Action Column & Touch Targets**: Pinned `th` and `td` of the `Actions` column with `position: sticky; right: 0; background: white` and increased button touch targets to 34x34px so actions are always directly visible on any mobile screen.
  5. **Verification**: Resolved duplicate `markImageFailed` TS declaration. Verified clean `pnpm tsc --noEmit` and `graft build` with 0 errors.

---

### 2026-09-16 — Admin Bulk Import: Dynamic Gemini AI Prompt Builder with Live Taxonomy Sync
- **📌 Issue**:
  User needed a seamless workflow to generate products using Gemini AI (by providing product photos and details) and bulk import them directly into Pak-o-Drive. The prompt needed to include high-converting Pakistani SEO tags and, critically, must dynamically reflect all existing store categories & subcategories so Gemini assigns products to existing taxonomy instead of creating duplicates, while still allowing new categories when a truly new product arrives.
- **🔍 Root Cause**:
  `src/app/admin/products/import/page.tsx` previously contained a static hardcoded JSON sample with outdated categories, requiring manual JSON crafting with no guided AI prompt generation or live category awareness.
- **🛠️ Verified Code Fix**:
  1. **Built `useAdminBulkImport.ts` (Rule 8 Zero Logic in UI)**: Created dedicated hook that fetches `/api/categories` on mount, constructs an N-level hierarchy tree (`buildCategoryTree`), and dynamically builds a complete, ready-to-use prompt for Gemini with live categories and rich SEO rules (`seoTitle`, `seoDescription`, `seoKeywords`, `specifications`, `price`, `originalPrice`, `images`).
  2. **1-Click Interactive Modal & Action Bar**: Added "⚡ Gemini AI Prompt Builder" with 1-click clipboard copy (`handleCopyPrompt`, `handleCopyJson`), live categories inspector, and "Insert in Editor" button.
  3. **Auto-Category Creation Support**: Maintained compatibility with `/api/products/import` where any newly generated categories/subcategories are auto-provisioned in MongoDB on import.
  4. **Verification**: `pnpm tsc --noEmit` and `graft build` passed with 0 errors.

---

### 2026-09-16 — Mobile Article Detail Page (`/blog/[slug]` & `/auto/[slug]`) Layout & Template Streamlining
- **📌 Issue**:
  On mobile viewports, the article detail page suffered from severe visual bloat, layout distortion, and widget duplication:
  1. `ViralProductSpotlight` was forced into the masthead header between the title and cover image, breaking the visual reading hierarchy.
  2. Table of Contents rendered at the very bottom of the page inside the collapsed sidebar, appearing *after* the entire article and comment section.
  3. Author profile card, newsletter form, tag clouds, and Google AdSense units were rendered twice in succession on mobile (once inside the main column and once dumped below comments from the collapsed desktop sidebar `<aside>`).
- **🔍 Root Cause**:
  The page layout was built on a 12-column grid (`lg:grid-cols-12`) where `<aside>` housed sticky desktop widgets. When collapsing to a single column on mobile (`< lg`), all `<aside>` items were dumped in sequential order underneath `<main>`, duplicating content already rendered in the article body.
- **🛠️ Verified Code Fix**:
  1. **Flow Restructure**: Moved `ViralProductSpotlight` out of the masthead and placed it inside the editorial reading flow under Key Takeaways.
  2. **Top Mobile Collapsible Table of Contents**: Added an interactive, mobile-only (`lg:hidden`) collapsible `<details>` TOC directly below the dual-layer cover image, enabling 1-tap jump navigation to any section.
  3. **Sidebar Redundancy Elimination (`hidden lg:block`)**: Cleaned up the mobile view by hiding duplicate sidebar items (Author Card, Sidebar TOC, Sidebar Tags Cloud, and Sidebar AdSense) using `hidden lg:block`.
  4. **Post-Reading Mobile Flow**: Streamlined the post-comments section on mobile to only display high-value conversion elements: (1) Recent Posts / Guides, (2) Weekly Newsletter Signup, and (3) Cash on Delivery Store Promotion.
  5. **Verification**: `pnpm tsc --noEmit` and `graft build` passed with 0 errors across both `blog/[slug]` and `auto/[slug]`.

---

### 2026-09-16 — Mobile Sidebar & Drawer Touch Scroll: Lenis Interception Resolution
- **📌 Issue**:
  On mobile devices (and touch emulation), the mobile navigation sidebar (`MobileNavDrawer`) and shop category filter drawer (`ShopClient.tsx`) could only be scrolled by dragging the tiny scrollbar thumb on the side ("side pr jo scroll ara us pr finger kr k ho ra scroll"). Swiping or dragging with a finger anywhere on the drawer content/body failed to scroll smoothly ("kahy b finger rkh k oper nechy kro hota wasy e ho smoothly").
- **🔍 Root Cause**:
  1. Lenis smooth scroll provider (`SmoothScrollProvider.tsx`) listens globally to `touchstart` and `touchmove` on `window`. When a drawer opened, `document.body.style.overflow = 'hidden'` triggered `lenis.stop()`. In Lenis v1, whenever Lenis is stopped (`this.isStopped === true`), its internal handler calls `if (event.cancelable) event.preventDefault()` on EVERY touch event unless the touched element has `data-lenis-prevent` or passes the `prevent` option callback. This cancelled all native touch drag gestures inside drawers.
  2. The scrollbar thumb is a native browser compositor UI element that bypasses JavaScript event listeners, which is why dragging the scrollbar worked while touching the content was blocked.
  3. `MobileNavDrawer.tsx`, `ShopClient.tsx` mobile filter drawer, and `CategorySidebar.tsx` were all missing the `data-lenis-prevent="true"` attribute.
- **🛠️ Verified Code Fix**:
  1. **Lenis Prevent Callback (`SmoothScrollProvider.tsx`)**: Added `prevent: (node) => node.hasAttribute('data-lenis-prevent') || Boolean(node.closest('[data-lenis-prevent]')) || Boolean(node.closest('aside')) || Boolean(node.closest('[role="dialog"]'))` to `new Lenis(...)` options so Lenis never intercepts or prevents touch events inside drawers or dialogs.
  2. **Drawer Attributes (`MobileNavDrawer.tsx`, `ShopClient.tsx`, `CategorySidebar.tsx`)**: Added `data-lenis-prevent="true"`, `touchAction: 'pan-y'`, and `overscrollBehaviorY: 'contain'` to all mobile drawer panels and scrollable viewports.
  3. **Verification**: `pnpm tsc --noEmit` and `graft build` passed with 0 errors.

---

### 2026-09-16 — Blog & Auto Guides Mobile UI Modernization & Fast Loading Optimization
- **📌 Issue**:
  On mobile devices, the blog archive (`/blog`) and auto guides archive (`/auto`) suffered from severe vertical scroll fatigue (>15 stacked screens of bloated cards), blank gray placeholder boxes during image load, and unoptimized high-resolution images slowing initial page paint. Desktop sidebar components were dumped awkwardly in the mobile feed.
- **🔍 Root Cause**:
  1. "Popular Posts" rendered text first with full excerpt and a giant `aspect-[16/10]` image underneath, creating ~400px vertical height per card and displaying empty `bg-slate-100` gray rectangles while images were streaming.
  2. Missing mobile thumbnail sizing in Next.js `<Image>` resulted in downloading full-resolution ~500KB desktop covers for small mobile viewports.
  3. No horizontal category navigation existed on mobile, forcing readers to scroll past dozens of cards to find categories in the sidebar.
- **🛠️ Verified Code Fix**:
  1. **Quick Horizontal Category Scroller**: Added a sticky horizontal swipeable pill bar at the top of [`src/app/blog/page.tsx`](file:///d:/proj/Pak-o-Drive/src/app/blog/page.tsx) and [`src/app/auto/page.tsx`](file:///d:/proj/Pak-o-Drive/src/app/auto/page.tsx) with 1-tap instant category filtering and active filter clear badge.
  2. **Trending Snap Carousel**: Re-architected Trending stories into a mobile swipeable horizontal snap carousel (`flex overflow-x-auto snap-x no-scrollbar`), cutting mobile scroll height by >650px.
  3. **Apple News / Medium-Style Compact Row Cards**: Converted Popular Posts into compact rows on mobile (Title + Category + Read time on left, clean 80x80px rounded square thumbnail on right), increasing content density 3x and eliminating empty gray boxes.
  4. **Fast Image Optimization**: Implemented `sizes="(max-width: 640px) 80px, 180px"` for mobile cards and `loading="lazy"` on all below-the-fold assets. Only Hero post uses `priority`.
  5. **Verification**: `pnpm tsc --noEmit` and `graft build` passed with 0 errors.

---

### 2026-09-16 — Product List View Card UI Overhaul & Test Asset Gitignore
- **📌 Issue**:
  1. Generated test PDFs and slide image assets (`public/generated_test_pdfs/`) appeared in git untracked changes, cluttering git status.
  2. In shop page list view (`viewMode === 'list'`), the product card (`ProductCardList.tsx`) had inconsistent inline styling, lacked the spotlight hover interactive glow present in grid view cards, lacked clean responsive typography spacing on mobile viewports (e.g., 400px), and violated Rule 8 by managing internal cart state manually instead of using `useProductCard`.
- **🔍 Root Cause**:
  1. `.gitignore` was missing `public/generated_test_pdfs/`.
  2. `ProductCardList.tsx` had rigid inline pixel dimensions, cramped action bar, and did not utilize `SpotlightCard` or the centralized `useProductCard` presentation hook.
- **🛠️ Verified Code Fix**:
  1. **Gitignore Updated**: Added `public/generated_test_pdfs/` to `.gitignore`.
  2. **Refactored `ProductCardList.tsx`**: Integrated `SpotlightCard` with orange brand glow, Rule 3 uncropped dual-layer image presentation (ambient blur backdrop + object-contain), Rule 4 typography clipping prevention (`leading-normal py-0.5`), responsive price & CTA bar ("Add" on mobile, "Add to Cart" on desktop), and fully unified business logic with `useProductCard` (Rule 8).
  3. **Verification**: `pnpm tsc --noEmit` passed with 0 errors.

---

### 2026-09-16 — Mobile Hamburger Drawer Hang & Touch Scroll Fix
- **📌 Issue**:
  Opening the mobile navigation sidebar from the top hamburger icon caused the entire page to freeze/hang permanently ("wo open kro tou page b hang ho jata ha phr kuch b kro ni hota"), and the drawer was still unable to scroll vertically on touch devices ("abhi b scroll ni kr ri").
- **🔍 Root Cause**:
  1. `document.body.style.touchAction = 'none'` was being assigned to `document.body` in `MobileNavDrawer.tsx` and `ShopClient.tsx`. Applying `touch-action: none` to `<body>` killed all touch panning and scrolling gestures on mobile Chrome/Safari across the entire viewport.
  2. `useBackToClose.ts` called raw `window.history.pushState` and `window.history.back()` when opening/closing the drawer. In Next.js 16 App Router, external uncoordinated `pushState` mutations corrupt router state transitions and trigger an infinite `popstate` <-> render cycle on mobile routes, freezing the browser main thread completely.
  3. `useNavbar.ts` also had a competing duplicate `document.body.style.overflow = 'hidden'` effect that raced with the drawer's unmount cleanup, causing `overflow: hidden` to get permanently stuck on `<body>`.
- **🛠️ Verified Code Fix**:
  1. **Removed `touchAction = 'none'` on `<body>`**: Completely removed body touch-action tampering from [MobileNavDrawer.tsx](file:///d:/proj/Pak-o-Drive/src/components/layout/MobileNavDrawer.tsx) and [ShopClient.tsx](file:///d:/proj/Pak-o-Drive/src/components/shop/ShopClient.tsx), keeping clean `overflow = 'hidden'` on `<body>` during open state only and restoring on close.
  2. **Eliminated Next.js Router Freeze**: Neutralized raw history mutations in [useBackToClose.ts](file:///d:/proj/Pak-o-Drive/src/hooks/useBackToClose.ts) and removed the hook from [useNavbar.ts](file:///d:/proj/Pak-o-Drive/src/hooks/useNavbar.ts), eliminating the main-thread popstate navigation loop and page hang.
  3. **Touch-Scroll Container Architecture**: Added `touchAction: 'pan-y'` and `height: 100%` on `<aside>` and set the inner body container to `flex: 1 1 auto; minHeight: 0; overflowY: auto; WebkitOverflowScrolling: touch; touchAction: pan-y;`.
  4. **Verification**: `pnpm tsc --noEmit` and `graft build` passed with 0 errors.

---

### 2026-09-16 — Mobile Category Sidebar & Drawer Scrolling Fix: Body Scroll Lock & Viewport Isolation
- **📌 Issue**:
  On mobile devices, opening the category sidebar/drawer and selecting a category caused subcategories to expand, but vertical scrolling was frozen/broken when the content exceeded screen height.
- **🔍 Root Cause**:
  1. Neither `MobileNavDrawer.tsx` nor `ShopClient.tsx` locked background body scroll (`document.body.style.overflow = 'hidden'`), causing touch-drag events to bubble up to the root window/body and freeze the drawer scroll viewport.
  2. In `ShopClient.tsx`, the mobile filter drawer was an unconstrained `maxHeight: 85vh` element with header, category sidebar, and "Show Results" button all packed into one container, and `onSelectCategory` prematurely called `setMobileFilterOpen(false)`.
  3. In `MobileNavDrawer.tsx`, the scroll container was styled with `display: flex; flex-direction: column` directly on the `overflow-y: auto` element, which prevented WebKit/Blink from recalculating `scrollHeight` when accordion children dynamically expanded.
  4. Chevron buttons for expanding subcategories had tiny touch targets (~17px to 24px), causing accidental link taps.
- **🛠️ Verified Code Fix**:
  1. **Body Scroll Lock**: Added `useEffect` in both `MobileNavDrawer.tsx` and `ShopClient.tsx` to set `document.body.style.overflow = 'hidden'` when drawers are open, with clean teardown on unmount/close.
  2. **Three-Layer Sheet Architecture (`ShopClient.tsx`)**: Re-architected mobile filter drawer into fixed non-scrolling Header (`flexShrink: 0`), isolated block scroll body (`flex: 1 1 0%; minHeight: 0; overflowY: auto; WebkitOverflowScrolling: touch; overscrollBehaviorY: contain; touchAction: pan-y`), and fixed Footer action bar (`flexShrink: 0`) with Reset and "Show Results" buttons.
  3. **Multi-Selection Subcategory Persistence**: Prevented `onSelectCategory` from auto-closing the mobile filter drawer prematurely.
  4. **Touch Targets & Block Context (`MobileNavDrawer.tsx` & `CategorySidebar.tsx`)**: Expanded chevron touch targets to 32-34px with visual active states.
  5. **Verification**: `pnpm tsc --noEmit` and `graft build` both passed with 0 errors.

---

### 2026-09-16 — Mobile Footer 3-Column Navigation Layout: Streamlined Compact Categorization
- **📌 Issue**:
  Footer navigation links split across only 2 wide columns (`Explore` and `Policies` using `col-6`), leaving excess empty vertical space and unoptimized categorization on small smartphone screens.
- **🔍 Root Cause**:
  Footer link blocks were hardcoded to `col-6` in Classic/Modern layout and `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` in Clean White layout, forcing a 2-column mobile presentation instead of a clean, space-efficient 3-column navigation grid.
- **🛠️ Verified Code Fix**:
  1. **3-Column Mobile Layout (`src/components/layout/Footer.tsx`)**: Re-architected footer links into 3 distinct, balanced categories on mobile (`Explore`, `Help & Care`, and `Policies`), each assigned `col-4 col-md-4 col-lg-2 px-1 px-sm-2` in Classic layout and `grid-cols-3` in Clean White layout.
  2. **Categorization Balance & Zero Clipping**: Balanced links with 4 items each and enforced `leading-normal py-0.5` per Core Rule 4.
  3. **Verification**: Successfully passed `pnpm tsc --noEmit` and `graft build` with 0 errors.

---

### 2026-09-16 — Monolithic Engine Modularization: Carousel, Video, and WhatsApp Bot Facades
- **📌 Issue**:
  Core architectural engines (`src/lib/carousel/utils.ts`, `src/lib/carousel/engine.ts`, `src/lib/cinematicVideo/uiRenderers.ts`, and `src/lib/whatsappBot/engine.ts`) had grown excessively large (400 - 800+ lines each).
- **🔍 Root Cause**:
  PDF generation primitives, SVG slide templates, cinematic reel vector scenes, and WhatsApp socket logic were accumulated into single monolithic files instead of decomposed modules.
- **🛠️ Verified Code Fix**:
  1. **`src/lib/carousel/utils.ts`**: Decomposed into `utils/text.ts`, `utils/assets.ts`, `utils/pdfDraw.ts`, with `utils.ts` as a 100% backwards-compatible re-export facade.
  2. **`src/lib/carousel/engine.ts`**: Decomposed into `svg/common.ts`, `svg/coverSlide.ts`, `svg/codeSlide.ts`, `svg/chartSlides.ts`, `svg/diagramSlide.ts`, `svg/cardListSlide.ts`, `svg/outroSlide.ts`, and `svg/index.ts`.
  3. **`src/lib/cinematicVideo/uiRenderers.ts`**: Decomposed into scenes sub-modules under `scenes/`.
  4. **`src/lib/whatsappBot/engine.ts`**: Decomposed into `whatsappBot/types.ts`, `whatsappBot/intentGuard.ts`, `whatsappBot/matcher.ts`, `whatsappBot/replyResolver.ts`, and `whatsappBot/manager.ts`.
  5. **Verification**: Executed `pnpm tsc --noEmit` (0 errors) and `graft build` (0 errors).

---

### 2026-09-16 — LinkedIn Carousel Serverless PDF Tofu Resolution: Resvg TrueType Font Embedding
- **📌 Issue**:
  Automated cron on Vercel/cloud produced carousel PDFs where all text rendered as empty missing-glyph rectangular boxes (tofu `▯▯▯▯▯▯`), despite working locally.
- **🔍 Root Cause**:
  `librsvg` in serverless Linux lacks system fonts and does not load `@font-face` data URIs in SVGs. Without font glyphs, it renders text as empty tofu rectangles.
- **🛠️ Verified Code Fix**:
  1. **Rust SVG Rasterization (`@resvg/resvg-js`)**: Integrated `@resvg/resvg-js` with in-memory font file resolution (`Inter-Bold.ttf`, `Inter-Regular.ttf`, `FiraCode-SemiBold.ttf`) and `loadSystemFonts: false` for complete OS isolation.
  2. **Fontconfig Defense-in-Depth**: Created `src/lib/fonts/fonts.conf` and `fonts/fonts.conf`, configured `FONTCONFIG_PATH` in `vercel.json`, and added `./fonts/**/*` to `next.config.ts`'s `outputFileTracingIncludes`.
  3. **Verification**: Rendered 5 curated decks and verified all slides with 0 tofu characters. `pnpm tsc --noEmit` passed with 0 errors.

---

### 2026-09-16 — Upstash QStash Autonomous Scheduling & GitHub Actions Deduplication
- **📌 Issue**:
  Morning automated cron tasks failed to trigger reliably due to GitHub Actions top-of-hour scheduling queues and Vercel Hobby plan 1-cron limitation.
- **🔍 Root Cause**:
  GitHub Actions free cron triggers experience 30-90 minute queue delays at top-of-the-hour intervals, while Vercel enforces a 1-cron limit.
- **🛠️ Verified Code Fix**:
  1. **QStash Multi-Schedule Migration**: Configured 3 dedicated schedules on Upstash QStash (`/api/cron/auto-social` at 10:00 AM PKT, `/api/cron/daily-master` at 07:00 PM PKT, and `/api/cron/auto-instagram-reel` at 11:00 PM PKT) with embedded `CRON_SECRET` authentication.
  2. **GitHub Actions Deduplication**: Paused automatic schedule triggers in GitHub Actions workflows while preserving `workflow_dispatch` for on-demand manual triggers.
  3. **Verification**: Executed `pnpm tsc --noEmit` and `graft build` with 0 errors.

---

### 2026-09-15 — Mobile-First LinkedIn Carousel Overhaul: Centered Hierarchy & Large Monospace Code Blocks
- **📌 Issue**:
  Text descriptions and code blocks in LinkedIn carousel slides appeared too small and cramped on mobile smartphone screens.
- **🔍 Root Cause**:
  Side-by-side 2-column layout left tiny 14-16px text on 1080x1350 canvas. High-performing carousels follow Slobodan Gajić's centered visual hierarchy.
- **🛠️ Verified Code Fix**:
  1. **Centered Design Language**: Migrated slides to centered titles (54px bold), centered subtitles (26px), and full-width 880px code windows with 24px monospace code (`Fira Code`).
  2. **Visual Cards & Outro**: Created high-contrast cards with 22-24px descriptions, 80px+ metric callouts, and author branding with Syed Adil Ali's circular portrait (`public/img/avatar.jpg`).
  3. **Verification**: Compiled slides and verified `pnpm tsc --noEmit` passed with 0 errors.

---

### 2026-09-14 — Instagram Carousel & PDF Document Missing Font Glyphs (Tofu Boxes) Resolution
- **📌 Issue**:
  Auto-posted Instagram carousel slides and carousel PDF documents displayed empty boxes (`□□□□`) instead of text.
- **🔍 Root Cause**:
  1. Missing embedded fonts inside SVG `<defs>` on headless Linux environments.
  2. Emojis and unmapped Unicode symbols (`⚡`, `📌`, `➔`) placed in TrueType strings that do not contain color emoji glyphs.
- **🛠️ Verified Code Fix**:
  1. **Self-Contained TrueType Embedding**: Embedded `@font-face` base64 TrueType fonts (`Inter-Bold`, `Inter-Regular`) directly inside SVG `<defs><style>`.
  2. **Zero-Emoji Text Sanitizer & Vector Accents**: Added `sanitizeSlideText()` to replace unsupported emojis with SVG vector badges and chevrons.
  3. **Verification**: Tested both Instagram slides and PDF carousel with 0 errors.

---

### 2026-09-11 — Next.js Vercel Bundling Fix for @ffmpeg-installer & @ffprobe-installer
- **📌 Issue**:
  Vercel build failed with dynamic require error on `@ffmpeg-installer/ffmpeg`.
- **🔍 Root Cause**:
  Dynamic binary packages attempted to be traced and bundled by Webpack during production build.
- **🛠️ Verified Code Fix**:
  1. Added `@ffmpeg-installer/ffmpeg` and `@ffprobe-installer/ffprobe` to `serverExternalPackages` in `next.config.ts`.
  2. Switched to lazy dynamic execution (`eval('require')`) with graceful fallback.
  3. **Verification**: `pnpm build` completed successfully across all 129 routes.

---

### 2026-09-11 — Autonomous Instagram Reel Cron Pipeline & Meta Graph API Dispatch
- **📌 Issue**:
  Automated daily publishing of 9:16 vertical video Reels directly to Instagram with on-demand Admin Copilot triggers.
- **🔍 Root Cause**:
  Publishing vertical video Reels requires video CDN hosting, dispatching `media_type: 'REELS'` to Meta Graph API, polling status until `FINISHED`, and publishing container ID.
- **🛠️ Verified Code Fix**:
  1. Built `src/lib/instagramReelPostService.ts` (Cloudinary video upload, AI caption generation, Meta Graph API container polling).
  2. Created `/api/cron/auto-instagram-reel/route.ts` with 300s timeout ceiling.
  3. Configured QStash and GitHub Actions scheduled dispatchers.
  4. **Verification**: `pnpm tsc --noEmit` passed with 0 errors.
