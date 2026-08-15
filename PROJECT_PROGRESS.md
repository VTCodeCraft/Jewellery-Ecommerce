# Project Progress


## Current Phase
Phase 3.2 — Homepage section trim. Implemented and verified on the development theme; not yet committed. Working on branch `Vishesh`.

## Completed
- Established safe Git workflow: `main` = live/production (untouched), `develop` = all work, tag `phase1-baseline` as rollback point at develop HEAD.
- Added `AGENTS.md` with Shopify development rules and business context (committed as `03450bd`, not yet pushed).
- Created custom asset scaffolds for brand-specific styling/JS: `assets/custom.css`, `assets/custom.js`.
- Registered `custom.css` after `base.css` in `snippets/stylesheets.liquid`.
- Registered `custom.js` as a module in `snippets/scripts.liquid`.
- Made footer brand colors configurable via the theme's `color_palette` setting (see Phase 1 details).

- Established the Instrument Serif + Lora typography system through Shopify's native font settings (see Phase 2).
- Restructured the homepage: hero with CTAs, featured products, featured collections, brand story, best sellers (see Phase 2).

## In Progress
- Awaiting merchant configuration of the Best Sellers collection and the Featured Collections list in the theme editor.

## Pending
- Commit and push Phase 1 + Phase 2 work to `develop` (requires user approval).
- Replace the Featured Products collection (still the theme asset-pack demo collection) with a real one.
- Review the brand colour palette: `color_palette` is still the stock white/black/grey set, so the store does not yet read as "warm handmade".
- Defer: wishlist, product reviews, custom/gift jewelry features.
- Future features to implement: shop/collection pages, product pages, search, filtering/sorting, cart/checkout, about, contact, shipping & returns.

## Technical Changes
- `sections/footer-group.json`: replaced 5 hardcoded brand hexes (`#351f08`, `#f5e9dc`) with `{{ settings.color_palette.color3 }}` / `{{ settings.color_palette.color4 }}` in the email signup button, policy list, and copyright blocks.
- `config/settings_schema.json`: extended `color_palette` default with `color1`–`color4` (brand colors = `color3`, `color4`). Removed the earlier rejected custom "Brand" settings group.
- `config/settings_data.json`: added `color3: "#351f08"` and `color4: "#f5e9dc"` to `color_palette` in both `current` and `presets.Horizon`. File kept in compact single-line format.
- `snippets/stylesheets.liquid`: added `{{ 'custom.css' | asset_url | stylesheet_tag }}`.
- `snippets/scripts.liquid`: added custom.js module registration.
- `assets/custom.css`, `assets/custom.js`: new (empty) brand-scoped scaffolding.

### Phase 2
- `config/settings_data.json`: replaced the Inter typography block with Instrument Serif + Lora, and retuned every `type_size_*`, `type_line_height_*`, `type_letter_spacing_*` and `type_case_*` value. Applied to both `current` and `presets.Horizon`. Added the previously absent `type_letter_spacing_h4/h5/h6` and `type_case_h4/h5/h6` keys.
- `snippets/theme-styles-variables.liquid`: fixed the fluid font-size lookup. The sorted size array is zero-padded (`056`) but the `find_index` lookup value was not (`56`), so `index` was always `nil`, every heading ≥ 48px fell back to the largest preset, and `clamp()` collapsed to a fixed size. The lookup value is now padded the same way.
- `sections/header-group.json`: `type_font_primary_link` `heading` → `subheading` and `localization_font` `heading` → `body`, so navigation and the country/language selector use Lora rather than the display serif.
- `assets/custom.css`: h6 label tracking, `font-synthesis-weight: none` on display headings, price typography reset (no uppercase/tracking) plus tabular figures.
- `templates/index.json`: hero retuned and given supporting copy + two CTAs; featured products retuned with a centred header, description and View-all CTA; new `collection-list` section (Featured collections); new `product-list` section (Best sellers); brand-story spacing tidied and its invalid `style_class: "link"` corrected to `button-unstyled`.

### Phase 2.1
- `config/settings_data.json`: `type_letter_spacing_h1` and `type_letter_spacing_h2` `heading-tight` → `heading-normal`; `type_line_height_h1` `display-normal` → `display-loose`. Applied to `current` and `presets.Horizon`.
- `assets/custom.css`: added `word-spacing: 0.12em` on the display heading presets (h1–h3), guarded with `:not(.h4, .h5, .h6, .paragraph, .rte)`.

### Phase 3
- `sections/header-group.json`: `logo_position` `left` → `center`, `menu_position` `center` → `left`, `actions_display_style` `icon` → `text`, `menu_style` `featured_products` → `text`. All four are stock Horizon settings — no layout code was written for the navbar structure.
- `blocks/_header-menu.liquid`: added `data-menu-content-type="{{ menu_content_type }}"` on the `.menu-list` nav (one attribute, no logic change), so CSS can distinguish the text menu style from the image-led ones.
- `assets/custom.css`: header wordmark sizing/tracking, and compact flex layout for text-style submenu content.

### Phase 3.1
- `templates/index.json`: hero `section_height` `large` → `full-screen`; removed the `marquee_KN4PYb` section instance and its entry in `order`.
- `sections/header.liquid`: the transparent-header opaque state now triggers on `:has(.header__row:hover)` instead of `:has(.menu-list__link:hover)`, across all three rules that share that condition (underlay height + logo swap, row text colour, cart bubble). New hover triggers are wrapped in `@media (hover: hover)`, with `@media (hover: none)` fallbacks preserving the light-on-image text for touch.

### Phase 3.2
- `templates/index.json`: removed the two `media-with-content` section instances — `media_with_content_xMM9EF` ("Artisan craftsmanship") and `media_with_content_nrnzPh` ("Distinctive materials") — and their `order` entries.

## Design Decisions
- Brand colors: primary `#351f08` (deep brown), contrast `#f5e9dc` (cream). Currently only used in the footer (email signup button, policy list, copyright text); storefront output is visually unchanged from the original hardcoded values.
- Brand colors are configurable through the theme's native `color_palette` mechanism (editable in Theme settings → Colors). Custom `color` settings in `settings_schema.json` CANNOT be referenced from section-group JSON files — the theme editor rejects them with "'X' is not a resource setting". Only `{{ settings.color_palette.* }}` is supported, which is why the palette approach was chosen.
- Social links in the footer currently point to placeholder `@shopify` accounts.

### Typography (Phase 2)
- **Two families, not three.** Instrument Serif for display, Lora for reading. Bodoni was ruled out as instructed; Smooch Sans is not in Shopify's font library.
- **Both fonts are native.** `instrument_serif_n4` / `instrument_serif_i4` and `lora_n4`–`lora_n7` (plus italics) are in Shopify's font library, so no external font files, no third-party CDN, and merchants can still swap fonts in Theme settings → Typography. Nothing was hardcoded into CSS.
- **Role mapping** onto Horizon's four font settings:
  - `type_heading_font` = `instrument_serif_n4` → h1–h4 (hero, section headings, collection headings, editorial statements)
  - `type_accent_font` = `instrument_serif_i4` → editorial italic, available as an alternate for any heading preset
  - `type_body_font` = `lora_n4` → paragraphs, prices, descriptions, buttons (button font defaults to `body`)
  - `type_subheading_font` = `lora_n5` → h5/h6 (product titles, collection titles, eyebrows, labels), navigation, cart prices
- **Scale** (px, fluid above 48): paragraph 16 · h1 88 (48 → 88) · h2 48 (36 → 48) · h3 32 · h4 24 · h5 16 · h6 12.
- **Hierarchy**: h1 hero only; h2 major section headings; h3 sub-headings and pull quotes; h4 minor headings; h5 product/collection card titles; h6 uppercase eyebrows and labels (0.12em tracking).
- Display headings use tight tracking (-0.03em) and 1.1 leading; body copy uses loose leading (1.6) for readability in a serif.
- Instrument Serif ships regular + italic only. `font-synthesis-weight: none` prevents the browser faking a bold weight and smearing the thin strokes. Do not set a heading preset to a bold weight.
- Prices explicitly opt out of the h6 uppercase/tracking treatment via local variable overrides in `custom.css`, because several templates render prices with the h6 preset.

### Font pair decision (Phase 2.1)
- Two candidate pairs were evaluated: **Pair A** Instrument Serif + Lora, **Pair B** Galliard + Mundo Sans. **Pair A was kept.**
- **Pair B is not implementable through Shopify's native font system.** Both fonts sit in Shopify's *deprecated* font list — `itc_galliard_*` (replacement: EB Garamond) and `mundo_sans_*` (replacement: Lato). Deprecated fonts are not offered in the theme editor `font_picker`, so a merchant could never re-select or change them.
- Choosing Pair B therefore meant one of two compromises, neither acceptable:
  1. Accept Shopify's substitutes (EB Garamond + Lato) — a different pair from the one requested. Lato in particular is a ubiquitous generic UI sans with no luxury signal.
  2. Self-host the Monotype originals — requires a paid commercial web licence per domain, adds render-blocking font assets outside Shopify's CDN and preload pipeline, and removes the fonts from the theme editor entirely.
- **The hero congestion was a settings problem, not a font problem.** Measured on the live storefront before the fix: `letter-spacing: -2.64px` (-0.03em, i.e. *negative* tracking) on a face whose natural glyph advance is only 0.311em, against ~0.48–0.52em for a normal text serif. Word gaps measured 0.136em against a normal 0.25–0.33em. Instrument Serif simply draws a very narrow space glyph, and the theme was subtracting from it.
- Instrument Serif was kept on merit as well as availability: its high stroke contrast (thick/thin) is the conventional signal for fine jewellery, mirroring light on metal. EB Garamond is warm but low-contrast and reads literary/bookish rather than luxury.

### Hero typography values (Phase 2.1)
Measured on the development theme, hero heading "Wear art, tell your story":

| | before | after |
|---|---|---|
| letter-spacing | -0.03em (-2.64px) | `normal` (0) |
| word-spacing | 0 (gap 0.136em) | 0.12em (gap **0.29em**) |
| line-height | 1.1 (96.8px) | 1.2 (105.6px) |
| glyph advance | 0.311em | 0.341em |
| desktop line width | 625px in an 833px box | 733px in an 833px box |
| mobile (375px) | 1 line at 341px in a 343px box | 2 balanced lines, "Wear art, tell" / "your story" |

- The breathing room came from **word-spacing and leading, not letter-spacing**. Tracking is now exactly neutral — no stretching of the letterforms.
- The previous mobile rendering sat 2px inside its container, so any copy edit or a 360px-wide device would have wrapped unpredictably. It now wraps deliberately at a phrase boundary via `text-wrap: balance`.

### Navbar (Phase 3)
- Structure is **left navigation / centre logo / right utilities**, achieved entirely through Horizon's existing `logo_position`, `menu_position` and `actions_display_style` settings. No custom header layout code.
- **Logo centring** uses Horizon's existing `grid-template-columns: 1fr auto 1fr` on `.header__columns`. The side columns are mathematically equal, so the logo is centred on the page rather than on the midpoint between the two side contents. Stress-tested at 3, 7 and 10 left-hand links: column widths stayed identical (591.562px each) and the logo did not move. Horizon collapses surplus items into a "More" overflow slot rather than letting the left column grow.
- **Text vs icons resolved without compromise.** `actions_display_style: text` renders text labels on desktop (`mobile:hidden`) and icons on mobile (`desktop:hidden`) — this is stock Horizon behaviour, so desktop reads "Search / Account / Cart" while mobile keeps compact 44px icon targets.
- Navigation is entirely Shopify menu data (`main-menu` via the `link_list` setting). No category names, handles or product IDs appear anywhere in the theme.
- Mobile header was left untouched: Horizon already uses a 5-column grid (`44px 44px 1fr 44px 44px`) with the logo in the centre area, drawer and search left, actions right.

### Submenu interaction (Phase 3)
- **Option B — compact dropdown**, selected on the actual navigation data: `main-menu` has 3 top-level items (Home, Catalog, Contact), zero nested children and zero rendered mega-menu nodes. An image-led mega menu has nothing to display, and the store has no collection imagery configured yet (the homepage Featured Collections section still renders placeholders).
- Implemented via Horizon's native `menu_style: text`. Horizon already gates submenus on `link.links != blank`, so childless items stay plain links and a dropdown appears automatically the moment the merchant nests items in Shopify Admin.
- Hover **and** keyboard are already built in: the `<li>` carries `on:pointerenter/​pointerleave` and `on:focus/​blur` handlers, with `aria-haspopup`, `aria-controls` and `aria-expanded` on the link. No new JavaScript was written.
- The one genuine gap was visual: Horizon lays all submenu content on a six-column grid across a full-width panel, so in text mode a few links spread across the viewport with most columns empty. Measured: a 77px nav item produced a 1430px-wide panel. Fixed by packing the groups with flex inside the panel. Flex rather than grid deliberately — at 12 groups it wraps to a second row, where a single grid row would eventually overflow.

### Homepage section trim (Phase 3.2)
- The two image/text split sections were removed as **homepage instances only**, the same approach used for the marquee. `sections/media-with-content.liquid` and its blocks (`_media-without-appearance`, `_content-without-appearance`) remain in the theme, so the section is still available in the theme editor and other templates are unaffected.
- Homepage section order is now: hero → featured products → featured collections → brand story → best sellers.
- No spacing compensation was needed. Sections carry their own padding, so the ones below simply moved up: every inter-section gap measures 0px on mobile and 0–1px on desktop (sub-pixel rounding).

### Hero & navbar hover (Phase 3.1)
- The hero was only ~80% of the viewport because `section_height: large` resolves to `--section-height-large: 80svh` on desktop. Switched to Horizon's stock `full-screen` option, which sets `--hero-min-height: 100svh`. No custom height CSS was written.
- `svh` (small viewport height) is Horizon's own choice here and is the right one for mobile: it sizes against the viewport with browser chrome *expanded*, so the hero never gets cropped as the address bar collapses. `100vh` would overflow on mobile and `100dvh` would resize the hero mid-scroll.
- The hero image is a real `<img>` with `object-fit: cover`, which is Horizon's existing architecture and was left alone — the image is not stretched, and it fills the taller hero by cropping rather than distorting.
- Horizon subtracts the header height from the first section via `--hero-height-offset`, but only when the header is *not* transparent. With the transparent header overlaying the hero on the homepage the offset resolves to `0px`, so the hero spans the full viewport and the navbar sits over it with no extra vertical space.
- The marquee was removed as a **homepage section instance only**. `sections/marquee.liquid`, `blocks/_marquee.liquid` and the marquee presets remain in the theme, so the section can still be added back from the theme editor. Nothing else moved — the next section now begins exactly at the hero's bottom edge.
- **Navbar hover.** The transparent header's opaque state was gated on `:has(.menu-list__link:not([aria-haspopup]):hover)` — a *nav link* — which is why only Home/Catalog/Contact triggered it and the logo, search, account, cart and empty header space did not. The condition is now `:has(.header__row:hover)`, so the whole header row is one unified hover area. Colours, transition and appearance are unchanged; only the trigger moved. No per-link hover backgrounds were added and no navigation item is referenced by name.

### Homepage (Phase 2)
- Every section reuses a stock Horizon section — no new section or block files were created. Featured Products and Best Sellers are both the `product-list` section; Featured Collections is the `collection-list` section.
- Nothing is hardcoded: collections are chosen through the theme editor. `_product-list-button` derives its link from the selected collection and only appears when that collection holds more products than the section shows.
- Collection cards fall back to the first product's featured image when a collection has no image (stock `resource-image` behaviour), and the whole card is the link, so no per-card URL needs configuring.
- Hero CTAs use `button-custom` with palette-pinned colours. The stock secondary button inherits the page foreground, which rendered dark-on-dark over the hero photograph.
- Hero overlay raised from 8% to 30% black (gradient to top) — enough for legible text over any photograph without flattening the image.

## Known Issues
- `color_palette.color1`–`color4` are also consumed elsewhere (input text/borders, drawer/popover borders, section backgrounds). Changing a palette color in the theme editor affects all consumers of that key, not just the footer. Do not rename/reorder palette keys once live.
- The `sections/footer-group.json` file is marked auto-generated by the theme editor; manual edits may be overwritten. The same applies to `sections/header-group.json` and `templates/index.json`.
- Best Sellers and Featured Collections ship with empty resource settings, so they render placeholder cards until a collection / collection list is chosen in the theme editor. This is deliberate — hardcoded handles would break on a store that does not have them.
- Featured Products still points at the theme asset-pack demo collection (`asset-pack-…-example-products`).
- The colour palette is still stock white/black/grey. The brand hexes added in Phase 1 (`color3` deep brown, `color4` cream) are only consumed by the footer, so the storefront does not yet read as warm/handmade.
- The fluid font-size fix in `theme-styles-variables.liquid` is a change to a stock Horizon file. A theme upgrade will overwrite it; the fix must be re-applied, or every heading ≥ 48px will collapse back to a fixed size.
- Horizon has only two grid breakpoints (mobile / ≥ 750px), so a 768px tablet shows the full desktop column count. Four product cards at 768px is tight but legible; not changed, since it would override the merchant's column setting site-wide.
- Prices on the collection, search, 404, cart and product-recommendation templates use the h6 preset and therefore render at 12px. Worth raising to the paragraph preset in a later phase.
- Phase 2 is committed at `5751ccd` on `develop` (pushed). Phase 2.1 is uncommitted on branch `Vishesh`.
- Galliard and Mundo Sans cannot be reconsidered later without self-hosting — they are deprecated in Shopify's font library, not merely absent.
- Instrument Serif ships one weight (400) plus italic. All display hierarchy has to come from size, leading and tracking; there is no bold available for emphasis inside a heading.
- Visual screenshot capture was unavailable during Phase 2.1 and Phase 3 verification (the browser preview pane would not composite frames). Verification was done through computed styles and layout geometry measured in the live page — precise for spacing and positioning, but it does not substitute for a human look.
- **The dropdown cannot be fully verified until nested menu items exist.** `main-menu` currently has no children, so no submenu renders anywhere in the store. The compact layout was validated by injecting Horizon's exact submenu markup into the live DOM; the Liquid render path was verified by reading it. Re-check once the merchant nests real categories.
- Anchoring the dropdown directly under its parent nav item was attempted and deliberately reverted. It requires making the `<li>` the containing block, which changes the coordinate space that Horizon's `top` and `clip-path` are computed against — those values are set at runtime by `header-menu.js` from element measurements, and the panel landed at y=-12 (behind the header) in testing. Reworking that is feasible but not safely verifiable without nested menu data. The dropdown currently uses Horizon's full-width panel with compactly packed content.
- The navbar hover **background** could not be visually confirmed. In the preview environment `.header__underlay-closed` computes to `height: 0` with `background-image: none` — identically for the original nav-link trigger and the new header-wide trigger, so the two behave the same and only the trigger region changed. The state variables were verified to flip correctly; the painted result needs a human look.
- The header wordmark is text, not artwork: no logo image is uploaded, so Horizon falls back to the shop name. `_header-logo.liquid` hardcodes the family to the body font inline and exposes no font setting, so the size/tracking bump lives in `custom.css` and is overridden automatically once artwork is uploaded.

## Client Information Needed
- Real social media URLs (currently `@shopify` placeholders) for the footer social links.
- Store name/branding confirmation for "Studio Muse" identity.
- Product photography, about/brand story copy, shipping & returns policy details.

## Phase History
### Phase 1 — Baseline & brand color configurability
- Status: Completed (changes verified locally, awaiting commit approval)
- Summary: Set up a safe Git workflow, added AI/development guidelines, created brand-scoped custom CSS/JS scaffolding, and made the footer brand colors configurable through the theme's supported `color_palette` mechanism instead of hardcoded hexes or rejected custom settings.
- Files changed:
  - `AGENTS.md` (new, committed `03450bd`)
  - `assets/custom.css`, `assets/custom.js` (new)
  - `snippets/stylesheets.liquid`, `snippets/scripts.liquid`
  - `config/settings_schema.json`, `config/settings_data.json`
  - `sections/footer-group.json`
- Verification: `shopify theme check` — 345 files, 0 offenses. All touched JSON valid (footer-group.json validated after stripping its `/* */` header). No remaining `brand_primary` references. Brand colors render identical values to the original hardcoded hexes.

### Phase 2 — Typography system & homepage structure
- Status: Completed (verified on the development theme, awaiting commit approval)
- Summary: Replaced the Inter typography with a two-family editorial system (Instrument Serif display + Lora text) driven entirely by Shopify's native font settings, fixed the Horizon bug that disabled fluid heading sizes, and restructured the homepage out of existing Horizon sections — hero with CTAs, featured products, featured collections, brand story, best sellers, media-with-text.
- Homepage section order: hero → marquee → featured products → featured collections → brand story → best sellers → media-with-text ×2.
- Files changed:
  - `config/settings_data.json`
  - `snippets/theme-styles-variables.liquid`
  - `sections/header-group.json`
  - `assets/custom.css`
  - `templates/index.json`
- Theme editor settings exposed (all stock Horizon settings, nothing new was invented):
  - Theme settings → Typography: all four font pickers plus the full size / leading / tracking / case scale.
  - Featured Products & Best Sellers: collection picker, product count, columns, mobile columns, layout, gaps, padding, background; heading, description and CTA are editable blocks.
  - Featured Collections: collection list picker, layout, columns, mobile columns, gaps, padding, background, card image ratio and placement; heading, eyebrow, description and CTA are editable blocks.
- Verification:
  - `shopify theme check` — 345 files, 0 offenses.
  - All 18 `t:` translation keys used in `templates/index.json` resolve against `locales/en.default.schema.json`.
  - Rendered on the development theme (`#199608631377`) at 375, 768 and 1280px: no horizontal overflow at any width; grids resolve to 2 columns mobile and 4/3/4 desktop; hero h1 scales 48 → 88px; h2 scales 36 → 48px; hero CTAs are 58px tall (above the 44px touch target).
  - Fonts confirmed loading from Shopify (`Instrument Serif 400 loaded`, `Lora`); computed styles verified per preset.
  - Console errors on the preview are pre-existing store-configuration issues (missing `customer-account-main-menu`, Shop Pay iframe CSP under localhost) and unrelated to these changes.

### Phase 2.1 — Font pair decision & hero refinement
- Status: Completed (verified on the development theme, awaiting commit approval)
- Summary: Evaluated Instrument Serif + Lora against Galliard + Mundo Sans on the real storefront. Kept Pair A — Pair B is deprecated in Shopify's font library and unusable natively. Diagnosed the congested hero as negative tracking plus Instrument Serif's narrow space glyph, and fixed it with neutral tracking, wider word spacing and looser leading rather than by replacing the font.
- Font roles are unchanged from Phase 2: Instrument Serif for h1–h4 display, Lora for h5/h6, body, navigation, buttons, prices, footer.
- Files changed: `config/settings_data.json`, `assets/custom.css`, `PROJECT_PROGRESS.md`.
- Verification:
  - `shopify theme check` — 345 files, 0 offenses.
  - Fonts confirmed loading from Shopify's CDN; hero computed as Instrument Serif 400, tracking `normal`, word-spacing 0.12em, leading 1.2.
  - Role separation audited across the rendered homepage: 10 distinct Instrument Serif headings, 14 Lora elements, no cross-contamination. Navigation, body, buttons, prices, product titles and footer all resolve to Lora; h1/h2/h3 all resolve to Instrument Serif.
  - Desktop 1280px and mobile 375px: no horizontal overflow; hero wraps to 2 balanced lines on mobile at a phrase boundary.
  - Caught and fixed during verification: the dense grid-view product title (`<h3 class="h4">`, Lora 13px) was inheriting the display word-spacing. Guarded with `:not(.h4, .h5, .h6, .paragraph, .rte)` and re-verified.

### Phase 3 — Navbar layout & submenu interaction
- Status: Completed (verified on the development theme, awaiting commit approval)
- Summary: Restructured the desktop navbar to left navigation / centre logo / right text utilities, and set the submenu to the compact text style. Almost entirely configuration — Horizon already supported every part of the requested structure. One attribute was added to the menu block and the submenu content layout was made compact.
- Files changed: `sections/header-group.json`, `blocks/_header-menu.liquid`, `assets/custom.css`, `PROJECT_PROGRESS.md`.
- Theme editor settings used (all stock): Header → logo position, menu position, actions display style; Header menu block → menu style.
- Verification:
  - `shopify theme check` — 345 files, 0 offenses.
  - Desktop 1440px: columns resolve left "Home Catalog Contact" / centre "Paridhi Creation" / right "Search Account Cart"; logo centre offset 0px.
  - Logo centring stress-tested at 3, 7 and 10 left-hand nav links — zero movement.
  - Tablet 768px: logo centred (offset 0), nav links and utilities visible, no overflow.
  - Mobile 375px: grid `44px 44px 197px 44px 44px`, logo centred (offset 1px), drawer 52×52, search 44×44, actions 88×44 — all at or above the 44px touch target; utilities correctly fall back to icons.
  - Mobile drawer opens and lists the live Shopify menu; cart drawer opens; both close on Escape.
  - Keyboard tab order follows visual order: Home → Catalog → Contact → logo → Search → Cart.
  - Typography audited: every navbar element resolves to Lora (body/subheading roles). No display serif in header chrome, consistent with the Phase 2.1 system.
  - No horizontal overflow at 375, 768 or 1440px.
  - Search: markup and wiring verified structurally (correct `aria-haspopup`, target ID resolves to a `DIALOG-COMPONENT` exposing `showDialog`). Live click-through could not be exercised because the preview pane would not composite; the change only swaps which label span is visible and does not touch the control's behaviour.

### Phase 3.2 — Homepage section trim
- Status: Completed (verified on the development theme, awaiting commit approval)
- Summary: Removed the "Artisan craftsmanship" and "Distinctive materials" image/text split sections from the homepage, keeping the underlying section reusable.
- Files changed: `templates/index.json`, `PROJECT_PROGRESS.md`.
- Verification:
  - `shopify theme check` — 345 files, 0 offenses.
  - Both sections absent from the DOM at 1280px and 375px; neither heading string appears anywhere on the page.
  - No gaps left behind: inter-section gaps are 0px throughout on mobile, 0–1px on desktop. Sections stack contiguously (desktop: 0 → 800 → 1510 → 2391 → 2791 → 3463 → 3641).
  - Remaining sections keep their existing layout; hero still fills the viewport; no horizontal overflow at either width.
  - `sections/media-with-content.liquid` and its blocks confirmed still present in the theme.

### Phase 3.1 — Full-viewport hero, marquee removal, navbar hover trigger
- Status: Completed (verified on the development theme, awaiting commit approval)
- Summary: Hero now fills the viewport via Horizon's stock `full-screen` height option; the scrolling marquee instance was removed from the homepage; the transparent navbar's hover state now triggers across the whole header rather than only on a nav link.
- Files changed: `templates/index.json`, `sections/header.liquid`, `PROJECT_PROGRESS.md`.
- Verification:
  - `shopify theme check` — 345 files, 0 offenses.
  - Hero fills the viewport exactly, with zero gap before the next section, at every width tested: 1280×800, 1440×1080 (tall), 1024×600 (short), 768×1024 (tablet), 375×812 (mobile). Hero height matched viewport height to the pixel in all five.
  - Hero image keeps `object-fit: cover` at every size — box matches the viewport, aspect ratio preserved, no stretching.
  - Hero heading and both CTAs remain fully within the viewport at the shortest desktop size tested (1024×600) and on mobile.
  - Marquee absent from the DOM at all widths; section order is hero → featured products → featured collections → brand story → best sellers → media ×2.
  - No horizontal overflow at any width.
  - Navbar hover: hovering the Cart (not a nav link) now flips `--closed-underlay-height` from `0px` to `100%` and the row foreground to the opaque colour — previously only nav links did this. Measured identical to the nav-link hover path.
