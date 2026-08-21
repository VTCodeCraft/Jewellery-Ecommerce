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

/**
 * Back button (layout/theme.liquid renders [data-back-button] on every
 * route except the homepage). Uses browser history when the visitor
 * arrived from within the store; falls back to the homepage for direct
 * entries so the button always does something.
 */
document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest('[data-back-button]');
  if (!button) return;

  const cameFromStore = document.referrer && new URL(document.referrer).origin === location.origin;

  if (cameFromStore && history.length > 1) {
    history.back();
  } else {
    location.href = button.dataset.backFallback || '/';
  }
});
