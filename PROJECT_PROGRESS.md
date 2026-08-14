# Project Progress


## Current Phase
Phase 2.1 — Font-pair decision & hero typography refinement. Implemented and verified on the development theme; not yet committed. Working on branch `Vishesh` (branched from `develop` at `5751ccd`).

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
- Visual screenshot capture was unavailable during Phase 2.1 verification (the browser preview pane would not composite frames). Verification was done through computed styles and text geometry measured in the live page — more precise for spacing than a scaled screenshot, but it does not substitute for a human look at the hero.

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
