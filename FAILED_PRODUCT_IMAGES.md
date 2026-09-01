# Product image import — failure log

Import run: 2026-09-01, source: paridhi_shopify_product_import_with_metafields.csv (66 images).

## Final state: ALL RESOLVED — 66/66 images READY on Shopify CDN.

Three images failed on the first attempt with Shopify error
`IMAGE_DOWNLOAD_FAILURE` (Shopify's fetcher was transiently rate-limited by
Google Drive; the files themselves were verified intact, 4–14 MB PNGs).
Each was deleted, re-fetched, and reordered back to image position 1:

| Product | Handle | Position | Outcome |
|---|---|---|---|
| NECKLACE SET WITH EARRINGS | necklace-set-with-earrings | 1 | retried → READY, reordered to 1 |
| GLASS KUNDAN NECKLACE SET | glass-kundan-necklace-set | 1 | retried → READY, reordered to 1 |
| LONG RAANI HAAR STYLE NECK PIECE WITH EARRINGS & MAANG TIKA | long-raani-haar-style-neck-piece-with-earrings-maang-tika | 1 | retried → READY, reordered to 1 |

No manual action required.
