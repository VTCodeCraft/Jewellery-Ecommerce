/**
 * Studio Muse - Custom theme behaviour.
 * Loaded as a module in snippets/scripts.liquid.
 * Kept separate from the stock Horizon modules so future
 * brand-specific functionality can be added without touching
 * theme files.
 */

/**
 * Suppress the native link/image drag ghost on collection and product
 * cards. custom.css handles WebKit browsers via -webkit-user-drag;
 * Firefox has no CSS equivalent, so the dragstart is cancelled here.
 * Scoped to cards so links elsewhere stay draggable (e.g. to bookmarks).
 */
document.addEventListener('dragstart', (event) => {
  if (!(event.target instanceof Element)) return;
  if (event.target.closest('.collection-card, .product-card')) {
    event.preventDefault();
  }
});
