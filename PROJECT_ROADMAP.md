# Jewellery Ecommerce — Project Roadmap

> Master working document for the Paridhi Creation Shopify store.
> Audit performed against the repository at commit `5b4f3db` (branch `Vishesh`) and against the live development theme `#199608631377` on `paridhi-creation-3.myshopify.com`.
> Status keys: ✅ COMPLETE · 🟡 PARTIAL · 🔴 MISSING · ⚠️ NEEDS IMPROVEMENT · ❌ BROKEN

---

## 1. Project Overview

**Business.** Paridhi Creation — a small handmade/home-made jewellery brand with roughly 100 existing customers, moving to online sales. Store currency is INR. Target buyers want everyday jewellery, gifts, wedding/occasion pieces and custom work.

**Current scale.** Small. The roadmap is deliberately sized for a business that must run the store without a developer on retainer: low recurring cost, low maintenance, minimal custom code.

**Shopify architecture.**
- Theme: **Horizon 4.1.3** (Shopify first-party, Online Store 2.0).
- Repository contents: 13 templates, 42 sections, 95 blocks, 138 snippets, 126 assets, 51 locales, 2 layouts, 2 config files.
- Checkout, payments, orders, inventory, customers and customer accounts are Shopify-hosted. There are **no `templates/customers/*` files** — the store uses Shopify's new hosted customer accounts, which is correct and should not be rebuilt in the theme.
- Store repo: `github.com/VTCodeCraft/Jewellery-Ecommerce-`.

**Development approach.** Modify Horizon in place, prefer native theme settings over custom code, keep everything merchant-editable in the Theme Editor, never hardcode products or collections.

**Goals.** A storefront that reads as a real premium handmade jewellery brand, converts reliably, and is fully manageable from Shopify Admin.

---

## 2. Current Project Status

Percentages are grounded in the audit below, not estimated from feel.

| Area | % | Basis |
|---|---|---|
| **Frontend / theme** | **65%** | Homepage, header, hero, typography system done. Product/collection/cart/search work but are stock-Horizon, not yet brand-styled. About/FAQ pages do not exist. |
| **Commerce** | **35%** | Shopify native plumbing is sound, but the catalogue is 4 demo products, all sold out, 1 variant and 1 image each. No real inventory, sizes or materials. |
| **Customer experience** | **30%** | 3 of 4 required policy pages 404. No reviews, trust signals, jewellery care/material info, or size guidance. |
| **Operations** | **15%** | Payments, COD, shipping rates, tracking and email notifications are all unconfigured/unverified. |
| **SEO** | **40%** | Native meta tags, canonical URLs and Product/Organization JSON-LD are present and correct. No real content, no category structure, thin product copy. |
| **Performance** | **70%** | Stock Horizon is well optimised — lazy loading present, modules deferred, no bloat added by us. Not yet measured against real imagery. |
| **Accessibility** | **60%** | Semantic headings, single H1, alt attributes present, 44px touch targets, logical tab order. Not yet audited with a screen reader; no breadcrumbs. |
| **Production readiness** | **25%** | Multiple hard launch blockers (see §22 / Launch Checklist). |

**Overall: ~38% complete.**

> The single most important conclusion of this audit: **the theme is in materially better shape than the store.** The bottleneck is catalogue, content and Shopify configuration — not code. Building more sections right now would be premature.

---

## 3. What We Have Already Built

Verified present and working in the repository / live dev theme.

### Design system
- ✅ **Typography system finalised** — Instrument Serif (display) + Lora (body/UI), both native Shopify fonts, no external loading. Full scale, leading, tracking and case set via theme settings. Documented in `PROJECT_PROGRESS.md`.
- ✅ **Fluid heading sizes fixed** — repaired a Horizon bug in `snippets/theme-styles-variables.liquid` where a zero-padding mismatch made `find_index` always fail, collapsing every heading ≥48px to a fixed size.
- ✅ **Brand-scoped CSS/JS scaffolding** — `assets/custom.css` and `assets/custom.js` registered after `base.css`.
- 🟡 **Colour palette** — brand hexes (`#351f08` brown, `#f5e9dc` cream) exist in `color_palette` but are **only consumed by the footer**. Page palette is still stock white/black/#333/#DFDFDF.

### Homepage (`templates/index.json`)
Order: Hero → Collections → Best Sellers → Featured Products → brand story.
- ✅ **Hero** — full viewport (`100svh` via Horizon's `full-screen` option), image `object-fit: cover`, editorial heading, supporting copy, two palette-pinned CTAs, transparent overlaying navbar.
- ✅ **Collections** — `collection-list` section, 4 columns, square imagery, off-white ground, merchant-selectable collection list.
- ✅ **Best Sellers** — `product-list` section, left-aligned browse grid.
- ✅ **Featured Products** — `product-list` section, centred editorial grid.
- ✅ **Brand story** — pull-quote section.
- ✅ Marquee and the two image/text split sections removed (instances only; sections remain reusable).

### Header / navigation
- ✅ **Left nav / centre logo / right utilities**, all via stock Horizon settings.
- ✅ **Logo optically centred** — `1fr auto 1fr` grid; verified stable at 3, 7 and 10 nav links.
- ✅ **Text utilities on desktop, icons on mobile** (`actions_display_style: text` is responsive in Horizon).
- ✅ **Unified navbar hover** — transparent-header opaque state now triggers on `:has(.header__row:hover)` rather than a nav link, guarded for touch.
- ✅ **Compact text submenu** — `menu_style: text`, content packed with flex; submenus render only when a menu item has children.
- ✅ **Mobile drawer** — stock Horizon, opens with live menu data, 44px+ touch targets.

### Storefront functionality (stock Horizon, verified working)
- ✅ Cart drawer (`cart_type: drawer`), cart page, cart quantity updates, cross-sell product list in cart.
- ✅ Collection page with **native filters and sorting** (`filters` block present).
- ✅ Search page with filters; search header with input.
- ✅ Product page: media gallery with zoom, title, price, variant picker block, quantity selector, add-to-cart, accelerated checkout, disclosures.
- ✅ Product recommendations section on the product template.
- ✅ 404 template with a product list.
- ✅ Contact page with native contact form.
- ✅ Blog and article templates.
- ✅ Password page.
- ✅ Newsletter capture (`email-signup`) in the footer.
- ✅ Footer policy list (renders Shopify policies automatically) and copyright.
- ✅ **Structured data** — Product and Organization JSON-LD confirmed rendering on the product page; also present in header, blog post and featured-product sections.
- ✅ **SEO basics** — canonical URL, meta description, Open Graph and Twitter card tags via `snippets/meta-tags.liquid`.
- ✅ **Shopify Analytics** (trekkie) active.
- ✅ 15 sections accept `@app` blocks — app-ready without code changes.
- ✅ `blocks/review.liquid` exists and reads `product.metafields.reviews.*` — ready to wire to a reviews app.

### Workflow
- ✅ Git remote on GitHub, branches `main` / `develop` / `Vishesh`.
- ✅ `AGENTS.md` (development rules) and `PROJECT_PROGRESS.md` (running log) maintained.
- ✅ `shopify theme check` clean — **345 files, 0 offenses** at every commit.

---

## 4. What Is Partially Built

| Feature | Current state | What's missing / to fix |
|---|---|---|
| 🟡 **Collections section** | Section built, 4-up square grid, fully configurable | `collection_list` is **empty** → renders placeholder tiles. Needs real collections selected. |
| 🟡 **Best Sellers** | Section built, browse grid | `collection` setting is **empty** → placeholder cards. Needs a best-seller collection. |
| 🟡 **Featured Products** | Section built, editorial grid | Still points at the demo `asset-pack-…-example-products` collection. |
| 🟡 **Brand colours** | Defined in `color_palette` | Only the footer consumes them. Store still reads as a grey/white template, not a warm handmade brand. |
| 🟡 **Logo** | Renders as text (shop name, Lora 20px) | No logo image uploaded; `_header-logo.liquid` hardcodes the font family inline. Upload artwork in Theme settings → Logo. |
| 🟡 **Navigation** | Works, fully dynamic | Only Home / Catalog / Contact. **No category structure**, so the compact dropdown never appears and Collections has nothing to link to. |
| 🟡 **Product page** | All core blocks present | No care/materials/shipping accordion, no size guide, no trust badges, no reviews, no breadcrumbs. |
| 🟡 **Brand identity** | Store name is "Paridhi Creation" | Homepage brand-story copy still says **"Studio Muse"**. Inconsistent. |
| 🟡 **Accessibility** | Semantics and touch targets good | Not screen-reader tested; 5 images render with empty `alt`; no breadcrumbs. |
| 🟡 **Analytics** | Shopify Analytics active | No GA4, no Meta Pixel, no conversion tracking. |
| 🟡 **Blog** | Templates exist | No posts, not linked from navigation. |

---

## 5. What Is Missing

### 🔴 Catalogue & merchandising (highest priority)
- Real products. Current catalogue is **4 Shopify asset-pack demo products, all `available: false`**, each with 1 image and 1 variant.
- Real collections. Only `frontpage` and the demo collection exist; **neither has a collection image**.
- Category structure (Earrings / Necklaces / Bracelets / Rings / Gifts / New Arrivals).
- Product variants — sizes (ring/bangle), materials, finishes, chain lengths.
- Multiple images per product; on-model and scale shots.
- Product descriptions written for jewellery buyers.
- Inventory quantities.

### 🔴 Required pages
- About / brand story page (`/pages/about` → **404**).
- FAQ page (`/pages/faq` → **404**).
- Refund/Return policy (`/policies/refund-policy` → **404**).
- Shipping policy (`/policies/shipping-policy` → **404**).
- Terms of service (`/policies/terms-of-service` → **404**).
- *(Privacy policy exists.)*
- Size guide / measurement help.
- Jewellery care instructions.

### 🔴 Trust & conversion
- Customer reviews / ratings.
- Trust badges (secure payment, authenticity, hallmark).
- Shipping timeline messaging on product pages.
- Return window messaging.
- Social proof / Instagram feed.
- Testimonials.

### 🔴 Jewellery-specific product data
No metafields exist for: material, purity/karat, gross & net weight, dimensions, stone details, certification, hallmark, warranty, care instructions, made-to-order lead time.

### 🔴 Operations
- Payment gateway configuration (Razorpay / Shopify Payments).
- COD configuration.
- Shipping zones and rates.
- Order tracking.
- Email notification branding.
- Returns process.

### 🔴 Marketing / retention
- Abandoned cart recovery.
- Email marketing (Shopify Email).
- WhatsApp support / order updates.
- Discount strategy.
- Wishlist.

### 🔴 Store setup
- Favicon.
- Logo artwork.
- Real social media URLs — currently **`@shopify` placeholders** (Instagram, YouTube, TikTok, Twitter, Threads all point at Shopify's own accounts).
- Announcement bar (section exists in the theme; **no instance in `sections/header-group.json`**).
- Footer navigation menu (footer has newsletter + policies + social only, no shop/help links).
- Custom domain.

### 🔴 Repo hygiene
- No `.gitignore`.
- No `.github/` workflows / Shopify GitHub integration.
- `README.md` is a one-line stub.

---

## 6. Shopify-Native Features — Use These, Do Not Build Them

| Capability | How to use |
|---|---|
| Products, variants, inventory | Shopify Admin. Use variant options for size/material. |
| Collections | Manual + automated (rule-based) collections. |
| Orders, fulfilment, refunds | Shopify Admin. |
| **Checkout** | Shopify-hosted. Not themeable on Basic; do not attempt custom checkout. |
| Payments | Shopify Payments / Razorpay / UPI via Admin. |
| **Customer accounts** | New customer accounts are Shopify-hosted — **no theme templates needed**. Already correctly wired. |
| Discounts & coupons | Admin → Discounts. Automatic + code-based. |
| Filtering & sorting | **Search & Discovery** app (free, Shopify-built). Theme already renders `filters`. |
| Predictive search | Native; theme has predictive-search sections. |
| Policies | Admin → Settings → Policies. Auto-published at `/policies/*` and auto-listed in the footer. |
| Email notifications | Admin → Settings → Notifications. Branded templates. |
| Abandoned checkout recovery | Native in Admin. |
| Analytics | Shopify Analytics active; add GA4/Meta via Admin, not theme code. |
| Sitemap / robots | Auto-generated. |
| Structured data | Already emitted by Horizon. |
| Gift cards | Native product type; template exists. |
| Multi-currency / markets | Shopify Markets. |

---

## 7. Third-Party Integrations (only what's genuinely needed)

| Feature | Recommended solution | Why | Complexity | When |
|---|---|---|---|---|
| **Filtering/sorting** | Shopify **Search & Discovery** (free) | Theme already supports it; zero code | Low | Phase 3 |
| **Reviews** | **Judge.me** (free tier) or Shopify Product Reviews successor | Critical trust signal; `blocks/review.liquid` already reads `metafields.reviews.*` | Low | Phase 5 |
| **Payments (India)** | **Razorpay** or Shopify Payments + UPI | Local methods, UPI/netbanking essential in India | Low (config) | Phase 5 |
| **COD** | Shopify Cash on Delivery + COD-capable courier | Large share of Indian jewellery orders | Low (config) | Phase 5 |
| **Shipping + tracking** | **Shiprocket** / Delhivery | Aggregated couriers, COD remittance, tracking pages | Medium | Phase 5 |
| **WhatsApp order updates** | Shiprocket built-in, or Interakt/Wati | Highest-open-rate channel in India | Low–Medium | Phase 9 |
| **Email marketing** | **Shopify Email** (free tier covers this scale) | No extra vendor; abandoned cart is native | Low | Phase 5 |
| **Analytics** | GA4 + Meta Pixel via Admin | Needed before any paid marketing | Low | Phase 6 |
| **Wishlist** | Defer. Consider a free app post-launch | Not a launch blocker at 100 customers | Low | Phase 9 |
| **Instagram feed** | Free app or manual image section | Social proof; manual is fine at this scale | Low | Phase 9 |

**Explicitly NOT recommended:** custom checkout, custom review system, custom wishlist backend, custom search engine, headless/Hydrogen, custom loyalty system, custom subscription logic. All either Shopify-native, app-solved, or unjustifiable at this scale.

---

## 8. Pages Required

| Page | Status | Notes |
|---|---|---|
| Homepage | ✅ | Built and refined |
| Collection | 🟡 | Template + filters ready; needs real collections |
| Product | 🟡 | Core blocks ready; needs jewellery info blocks |
| Cart | ✅ | Drawer + page working |
| Search | ✅ | Working with filters |
| List collections | ✅ | Template exists |
| About / brand story | 🔴 | 404 — must create |
| Contact | ✅ | Native form working |
| FAQ | 🔴 | 404 — must create |
| Shipping policy | 🔴 | 404 — must create |
| Refund/Return policy | 🔴 | 404 — must create |
| Terms of service | 🔴 | 404 — must create |
| Privacy policy | ✅ | Exists |
| Size guide | 🔴 | Needed for rings/bangles |
| Jewellery care | 🔴 | Trust/retention content |
| Customer account / login / orders | ✅ | Shopify-hosted, no theme work |
| 404 | ✅ | Template exists |
| Password | ✅ | Template exists |
| Blog | 🟡 | Templates exist, no content |

---

## 9. Components / Sections Required

**Existing and reusable (do not rebuild):** `hero`, `product-list`, `collection-list`, `section`, `media-with-content`, `marquee`, `slideshow`, `layered-slideshow`, `featured-product`, `product-recommendations`, `main-collection`, `main-product`, `main-cart`, `search-results`, `header`, `footer`, `header-announcements`, `product-hotspots`, `featured-blog-posts`, `collection-links`, `quick-order-list`, plus 95 blocks and 138 snippets.

**To add (only where genuinely needed):**
- [ ] Announcement bar instance in `header-group.json` (section already exists)
- [ ] Footer navigation menu block
- [ ] Product accordion: materials / care / shipping & returns (Horizon has `accordion` blocks)
- [ ] Trust-badge row (product page + cart)
- [ ] Size guide (page + product-page link/modal)
- [ ] Reviews block wiring (`blocks/review.liquid` → app metafields)
- [ ] Instagram / social proof section *(post-launch)*
- [ ] Recently viewed products *(post-launch)*

---

## 10. Customer Journey

**New visitor**
1. Lands on homepage → full-screen hero establishes the brand.
2. Browses Collections (4-up categories) — *blocked: no real collections*.
3. Or uses search / navigation — *blocked: nav has no categories*.
4. Collection page → filters by material/price/availability — *needs Search & Discovery*.
5. Product page → multiple images, zoom, variant/size selection, price, availability, materials, care, shipping estimate, returns, reviews — *most jewellery info missing*.
6. Add to cart → cart drawer.
7. Checkout → Shopify-hosted.
8. Payment: UPI / card / netbanking / **COD** — *unconfigured*.
9. Order confirmation email — *unbranded*.
10. Shipping + tracking — *unconfigured*.
11. Delivery → review request — *no reviews system*.

**Returning customer**
1. Login → Shopify-hosted customer account ✅
2. Order history / reorder ✅ native
3. Wishlist 🔴 *(post-launch)*
4. Offers / discounts — native, needs a strategy
5. Retention: email + WhatsApp 🔴

**Gaps blocking the journey today:** steps 2, 3, 5, 8, 9, 10, 11.

---

## 11. Admin Journey (business owner, no developer)

| Task | Can the owner do it today? |
|---|---|
| Add/edit products, prices, inventory | ✅ Shopify Admin |
| Create collections | ✅ Admin |
| Change homepage collections/products | ✅ Theme Editor (all sections use pickers) |
| Reorder/hide homepage sections | ✅ Theme Editor |
| Edit hero image, headings, CTAs | ✅ Theme Editor |
| Edit navigation | ✅ Admin → Navigation |
| Edit policies | ✅ Admin → Settings → Policies |
| Manage orders, refunds, customers | ✅ Admin |
| Create discounts | ✅ Admin |
| Change fonts/colours | ✅ Theme settings |
| Upload logo/favicon | ✅ Theme settings |
| Edit footer social links | ✅ Theme Editor |
| **Change the header wordmark font** | ⚠️ Requires code (`_header-logo.liquid` hardcodes it) — resolved by uploading logo artwork |

**Verdict: admin usability is good.** No unnecessary code dependencies were introduced. Everything merchant-facing is Theme Editor–driven.

---

## 12. SEO Checklist

- [x] Canonical URLs
- [x] Meta description support
- [x] Open Graph / Twitter cards
- [x] Product + Organization JSON-LD
- [x] Single H1 per page
- [x] Semantic heading hierarchy
- [ ] Unique, keyword-aware product titles & descriptions **(P0)**
- [ ] Collection descriptions **(P1)**
- [ ] Descriptive image alt text — 5 images currently render empty `alt` **(P1)**
- [ ] Category URL structure via real collections **(P0)**
- [ ] Breadcrumbs + BreadcrumbList schema **(P1)**
- [ ] Custom domain + HTTPS **(P0)**
- [ ] Google Search Console + sitemap submission **(P1)**
- [ ] Local/India business schema **(P2)**
- [ ] Blog content for organic reach **(P3)**

---

## 13. Performance Checklist

- [x] Lazy loading on below-fold images (7 of 9 on product page)
- [x] Deferred JS modules, `fetchpriority` hints
- [x] Font preloading via `snippets/fonts.liquid`
- [x] Only 2 font families, Shopify CDN hosted
- [x] No third-party scripts added
- [ ] Compress/resize source photography before upload **(P0)** — biggest real-world risk
- [ ] Lighthouse audit on desktop + mobile with real imagery **(P1)**
- [ ] Verify hero image `sizes`/`srcset` at full-screen **(P1)**
- [ ] Audit app script weight after installing reviews/shipping apps **(P1)**
- [ ] Core Web Vitals check post-content **(P1)**

---

## 14. Accessibility Checklist

- [x] Semantic HTML, single H1
- [x] All images carry an `alt` attribute
- [x] Touch targets ≥44px
- [x] Logical keyboard tab order in header
- [x] Submenus open on focus as well as hover
- [x] `visually-hidden` labels where needed
- [ ] Meaningful alt text (not just present) **(P1)**
- [ ] Colour contrast audit once brand palette lands **(P0)**
- [ ] Screen reader pass (NVDA/VoiceOver) **(P1)**
- [ ] Visible focus indicators throughout **(P1)**
- [ ] Breadcrumbs **(P2)**
- [ ] `prefers-reduced-motion` honoured **(P2)**

---

## 15. Mobile Checklist

- [x] Hero uses `100svh` (no crop as browser chrome collapses)
- [x] No horizontal overflow at 375px on any audited page
- [x] Mobile drawer navigation with live menu data
- [x] Icons (not text) for header utilities on mobile
- [x] 2-column product/collection grids
- [x] Cart drawer works on mobile
- [ ] Real-device testing (iOS Safari, Android Chrome) **(P0)**
- [ ] Tap-target audit on product page **(P1)**
- [ ] Mobile checkout run-through **(P0)**
- [ ] Image weight on mobile data **(P1)**

---

## 16. Jewellery-Specific Requirements

Implement as **Shopify metafields** (Admin → Settings → Custom data → Products), then surface via theme blocks. No custom database, no app required.

| Field | Type | Priority |
|---|---|---|
| Material (gold/silver/brass/vermeil) | Single line / list | P0 |
| Purity / karat / hallmark | Single line | P0 |
| Gross & net weight | Weight | P1 |
| Dimensions (length/width/diameter) | Dimension | P1 |
| Stone / bead details | Multi-line | P1 |
| Care instructions | Rich text | P0 |
| Certification / authenticity | Rich text / file | P1 |
| Warranty | Rich text | P2 |
| Made-to-order lead time | Single line | P0 |
| Gift-wrap available | Boolean | P2 |

**Plus:** size guide for rings/bangles, on-model and scale photography, zoomable images (✅ already present), variant options for size/material, shipping timeline on product page, return window messaging.

---

## 17. Integrations & Operations

| Area | Status | Action |
|---|---|---|
| Payments | 🔴 | Configure Shopify Payments and/or Razorpay; enable UPI, cards, netbanking |
| COD | 🔴 | Enable COD; set order-value limits and serviceable pincodes |
| Shipping | 🔴 | Define zones/rates; integrate Shiprocket or Delhivery |
| Tracking | 🔴 | Courier tracking + tracking emails |
| Email | 🟡 | Shopify notifications work but are unbranded; brand them + enable abandoned checkout |
| WhatsApp | 🔴 | Post-launch; via Shiprocket or Interakt |
| Returns | 🔴 | Publish policy, define process in Admin |
| Analytics | 🟡 | Shopify Analytics live; add GA4 + Meta Pixel |
| Support | 🔴 | Contact form ✅; add WhatsApp/phone/response-time expectations |

---

## 18. Development Phases

### Phase 0 — Audit & Foundation ✅ COMPLETE
Objective: understand the codebase and set a safe workflow.
Done: Git workflow, `AGENTS.md`, `PROJECT_PROGRESS.md`, brand-colour scaffolding, this roadmap.

### Phase 1 — Design System ✅ COMPLETE
Objective: establish typography and brand foundations.
Done: Instrument Serif + Lora, full type scale, hero refinement, fluid-size bug fix.
Outstanding: brand colour palette application (moved to Phase 2).

### Phase 2 — Core Storefront 🟡 IN PROGRESS
Objective: brand-consistent homepage, header, footer.
Done: homepage sections, header restructure, submenu, hero.
Tasks: apply brand palette store-wide · upload logo + favicon · fix social links · announcement bar · footer navigation · resolve "Studio Muse" vs "Paridhi Creation".
Dependencies: brand assets from client.
Complete when: store reads as Paridhi Creation, not a template.

### Phase 3 — Catalogue & Merchandising 🔴 **CRITICAL PATH — NOT STARTED**
Objective: put a real store behind the storefront.
Tasks: create collections · add real products with variants, inventory and photography · write descriptions · define jewellery metafields · build navigation · install Search & Discovery · configure the three homepage sections.
Dependencies: **client product data and photography.**
Complete when: a customer can browse real categories and reach a real, purchasable product.
> Nothing downstream can be validated until this phase lands.

### Phase 4 — Product & Collection Experience 🔴
Objective: make the product page sell jewellery.
Tasks: materials/care/shipping accordion · metafield display blocks · size guide · trust badges · shipping & returns messaging · breadcrumbs · collection page styling.
Dependencies: Phase 3.

### Phase 5 — Commerce & Operations 🔴
Objective: a customer can actually buy and receive an order.
Tasks: payments · COD · shipping zones/rates · courier integration · tracking · branded emails · abandoned checkout · reviews app · returns process.
Dependencies: business/legal decisions from the client.
Complete when: a real test order completes end-to-end, including COD and refund.

### Phase 6 — SEO & Performance 🔴
Tasks: product/collection SEO copy · alt text · image compression · Lighthouse · GA4 + Meta Pixel · Search Console · custom domain.
Dependencies: Phases 3–5.

### Phase 7 — Testing 🔴
Tasks: cross-browser · real devices · full journey tests · COD test · refund test · accessibility pass · contrast audit · broken-link sweep.

### Phase 8 — Launch 🔴
Tasks: publish theme · domain live · remove password page · final client sign-off. See §21.

### Phase 9 — Post-Launch 🔴
Tasks: WhatsApp notifications · wishlist · Instagram feed · recently viewed · loyalty · advanced analytics · blog content.

---

## 19. Priority System

- **P0 — Launch blocker.** Store cannot go live without it.
- **P1 — Important.** Needed for a professional launch; can trail slightly.
- **P2 — Nice to have.** Improves experience, not blocking.
- **P3 — Future.** Post-launch growth.

---

## 20. Master Task Checklist

### Phase 2 — Core Storefront
- [ ] **P0** Apply brand colour palette store-wide (currently footer-only)
- [ ] **P0** Upload logo artwork (Theme settings → Logo)
- [ ] **P0** Upload favicon
- [ ] **P0** Replace `@shopify` placeholder social URLs (or remove the block)
- [ ] **P0** Resolve brand name: "Studio Muse" copy vs "Paridhi Creation" store
- [ ] **P1** Add announcement bar instance to `header-group.json`
- [ ] **P1** Add footer navigation menu
- [ ] **P2** Colour-contrast audit after palette lands

### Phase 3 — Catalogue & Merchandising ← **START HERE**
- [ ] **P0** Create real collections (Earrings, Necklaces, Bracelets, Rings, Gifts, New Arrivals)
- [ ] **P0** Upload real products with descriptions and inventory
- [ ] **P0** Add multiple images per product (incl. on-model / scale shots)
- [ ] **P0** Configure product variants (size, material, finish)
- [ ] **P0** Add collection images
- [ ] **P0** Build main navigation with categories
- [ ] **P0** Select collections in the homepage Collections section
- [ ] **P0** Set the Best Sellers collection
- [ ] **P0** Replace the demo collection in Featured Products
- [ ] **P0** Remove the 4 Shopify asset-pack demo products
- [ ] **P0** Define jewellery metafields (material, purity, weight, care, lead time)
- [ ] **P1** Install & configure Search & Discovery
- [ ] **P1** Write collection descriptions

### Phase 4 — Product & Collection Experience
- [ ] **P0** Materials / care / shipping & returns accordion on product page
- [ ] **P0** Display jewellery metafields on the product page
- [ ] **P0** Shipping timeline + return window messaging
- [ ] **P1** Size guide page + product-page link
- [ ] **P1** Trust badges (secure payment, authenticity)
- [ ] **P1** Style collection page to brand
- [ ] **P2** Breadcrumbs + BreadcrumbList schema

### Phase 5 — Commerce & Operations
- [ ] **P0** Configure payment gateway (Razorpay / Shopify Payments + UPI)
- [ ] **P0** Configure COD (limits, serviceable pincodes)
- [ ] **P0** Set shipping zones and rates
- [ ] **P0** Publish Refund, Shipping and Terms policies *(3 of 4 currently 404)*
- [ ] **P0** Create About page
- [ ] **P0** Create FAQ page
- [ ] **P0** Brand order/shipping notification emails
- [ ] **P1** Integrate courier (Shiprocket/Delhivery) + tracking
- [ ] **P1** Install reviews app and wire `blocks/review.liquid`
- [ ] **P1** Enable abandoned checkout recovery
- [ ] **P1** Define returns process
- [ ] **P2** Care-instructions page

### Phase 6 — SEO & Performance
- [ ] **P0** Compress/resize all photography before upload
- [ ] **P0** Connect custom domain + HTTPS
- [ ] **P1** Product & collection SEO copy
- [ ] **P1** Meaningful image alt text
- [ ] **P1** GA4 + Meta Pixel
- [ ] **P1** Google Search Console + sitemap
- [ ] **P1** Lighthouse audit (desktop + mobile)

### Phase 7 — Testing
- [ ] **P0** Full journey test: browse → cart → checkout → payment → confirmation
- [ ] **P0** COD test order
- [ ] **P0** Refund test
- [ ] **P0** Real-device testing (iOS Safari, Android Chrome)
- [ ] **P1** Cross-browser testing
- [ ] **P1** Screen reader pass
- [ ] **P1** Broken-link sweep

### Phase 8 — Launch
- [ ] **P0** Merge `develop` → `main`, publish theme
- [ ] **P0** Remove password protection
- [ ] **P0** Verify live payments
- [ ] **P0** Client sign-off

### Phase 9 — Post-Launch
- [ ] **P2** WhatsApp order notifications
- [ ] **P2** Wishlist
- [ ] **P2** Instagram / social proof section
- [ ] **P3** Recently viewed products
- [ ] **P3** Loyalty programme
- [ ] **P3** Blog content

### Repo hygiene (anytime)
- [ ] **P2** Add `.gitignore`
- [ ] **P2** Expand `README.md` (setup, workflow, deployment)
- [ ] **P2** Decide on Shopify GitHub integration (see §9 of workflow)

---

## 21. Launch Checklist

**Catalogue** — [ ] Real products live · [ ] Prices correct · [ ] Inventory accurate · [ ] Variants correct · [ ] All images optimised · [ ] Demo products deleted

**Commerce** — [ ] Payments live-tested · [ ] COD tested · [ ] Shipping rates correct · [ ] Tax configured · [ ] Test order placed · [ ] Refund tested · [ ] Tracking works

**Content** — [ ] About · [ ] FAQ · [ ] Contact · [ ] Refund policy · [ ] Shipping policy · [ ] Terms · [ ] Privacy · [ ] Size guide · [ ] Care instructions

**Experience** — [ ] Mobile verified on real devices · [ ] Tablet · [ ] Desktop · [ ] Cart & checkout on mobile · [ ] No broken links · [ ] 404 page sensible

**Technical** — [ ] Custom domain + HTTPS · [ ] Analytics firing · [ ] SEO metadata · [ ] Sitemap submitted · [ ] Lighthouse acceptable · [ ] Accessibility pass · [ ] `shopify theme check` clean

**Business** — [ ] Notification emails branded · [ ] Support channel live · [ ] Return process documented · [ ] Social links real · [ ] Client final approval

---

## 22. Post-Launch (must NOT block launch)

Wishlist · advanced product recommendations · loyalty/referrals · advanced analytics dashboards · marketing automation beyond abandoned cart · Instagram feed automation · recently viewed products · blog content programme · multi-currency/Markets · subscription or made-to-order deposits · AR/virtual try-on · additional language locales.

---

## Appendix — Git & Development Workflow (Phase 9 of the audit brief)

**Current state:** `main`, `develop`, `Vishesh` on GitHub. No `.gitignore`, no CI, no Shopify GitHub integration.

**Recommended (deliberately simple, for two developers):**

```
main      → production. Protected. Only merges from develop.
develop   → integration. Default working branch.
feature/* → one branch per task, branched from develop.
```

1. `git checkout develop && git pull`
2. `git checkout -b feature/product-page-accordion`
3. Develop against a **development theme** via `shopify theme dev` (never the live theme).
4. `shopify theme check` must pass before pushing.
5. Open a PR into `develop`; the other developer reviews.
6. Merge to `develop`; verify on a shared preview theme.
7. When a milestone is ready, PR `develop` → `main` and publish.

**Rules that matter for two devs on a Shopify theme:**
- **Only one person edits the Theme Editor at a time.** `templates/*.json` and `sections/*-group.json` are auto-generated — concurrent editor changes silently overwrite each other. Agree who "owns" the editor per task.
- Pull before every editor session; commit editor-produced JSON promptly.
- Keep custom CSS in `assets/custom.css`, not in stock section files, to reduce merge conflicts.
- Note in `PROJECT_PROGRESS.md` any edit to a stock Horizon file — those are the ones a theme upgrade will overwrite. Currently: `snippets/theme-styles-variables.liquid`, `sections/header.liquid`, `blocks/_header-menu.liquid`.

**Rollback:** tags at milestones (`phase1-baseline` exists). To roll back production, republish the previous theme version in Admin — faster and safer than a git revert.

**Shopify GitHub integration:** optional. It auto-syncs a branch to a theme, but it also pushes Theme Editor changes back as commits, which can surprise two developers. **Recommendation: skip it for now**; keep using `shopify theme dev` + `shopify theme push` to a named theme, and revisit once the workflow is settled.
