import { Component } from '@theme/component';
import { DialogOpenEvent, DialogCloseEvent } from '@theme/dialog';
import { isClickedOutside, lockScroll, unlockScroll } from '@theme/utilities';
import { StandardEvents, CartLinesUpdateEvent } from '@shopify/events';
import { formatMoney } from '@theme/money-formatting';

/**
 * RecommendedProductsPopup
 *
 * A modal that opens after a successful add-to-cart action,
 * presenting curated complementary jewellery pieces that can be added
 * directly to the bag.
 *
 * Uses the theme's component events and scroll locks with a native <dialog>.
 */
class RecommendedProductsPopup extends Component {
  requiredRefs = ['dialog', 'closeButton', 'content'];

  /** @type {AbortController} */
  #abortController = new AbortController();

  /** @type {HTMLElement | null} */
  #previousFocusedElement = null;

  /** @type {string | null} */
  #currentAddedProductId = null;

  /** @type {boolean} */
  #isOpening = false;

  #loadVersion = 0;

  connectedCallback() {
    super.connectedCallback();

    this.#abortController.abort();
    this.#abortController = new AbortController();
    const { signal } = this.#abortController;
    this.refs.dialog.addEventListener('click', this.#handleBackdropClick, { signal });
    this.refs.dialog.addEventListener('cancel', this.#handleCancel, { signal });
    this.refs.dialog.addEventListener('close', this.#handleNativeClose, { signal });

    document.addEventListener(
      StandardEvents.cartLinesUpdate,
      this.#handleCartLinesUpdate,
      { signal: this.#abortController.signal }
    );
  }

  disconnectedCallback() {
    this.closeDialog();
    this.#abortController.abort();
    super.disconnectedCallback();
  }

  /**
   * Listens for standard cart line updates.
   * Only triggers on successful 'add' actions and opens the recommendation popup.
   *
   * @param {CartLinesUpdateEvent} event
   */
  #handleCartLinesUpdate = (event) => {
    // Only handle 'add' actions
    if (event.action !== 'add') return;

    // Ignore events that originate from this popup itself to prevent loop
    if (event.context === 'recommendations-popup' || this.contains(event.target)) {
      return;
    }

    // Save previous active element for focus restoration upon close
    this.#previousFocusedElement = /** @type {HTMLElement | null} */ (document.activeElement);

    // Coordinate with cart drawer: prevent it from competing for focus
    this.#suppressCartDrawer();

    // Wait for the add-to-cart promise to confirm success
    event.promise
      ?.then(async ({ detail, cart }) => {
        // Do not open if the add operation failed
        if (detail?.didError || !this.isConnected) return;

        // Extra check: coordinate again right before opening
        this.#suppressCartDrawer();

        // Determine the product ID that was added
        const addedProductId =
          detail?.productId ||
          cart?.items?.[0]?.product_id ||
          event.target?.dataset?.productId ||
          null;

        this.#currentAddedProductId = addedProductId ? String(addedProductId) : null;

        // Open popup with recommendations
        await this.openWithRecommendations(this.#currentAddedProductId);
      })
      .catch((error) => {
        if (error?.name !== 'AbortError') {
          console.debug('[recommendations-popup] Add to cart promise error:', error);
        }
      });
  };

  /**
   * Closes or suppresses the existing theme cart drawer so the two overlays
   * do not compete for focus or visual priority.
   */
  #suppressCartDrawer() {
    const cartDrawer = document.getElementById('cart-drawer');
    if (cartDrawer && typeof cartDrawer.close === 'function') {
      cartDrawer.close();
    }
    if (cartDrawer?.hasAttribute('open')) {
      cartDrawer.removeAttribute('open');
    }
  }

  /**
   * Opens the dialog and loads recommended products.
   *
   * @param {string | null} productId
   */
  async openWithRecommendations(productId) {
    if (this.#isOpening) return;
    this.#isOpening = true;
    const loadVersion = ++this.#loadVersion;

    // Render skeleton placeholders immediately for smooth perceptual load
    this.#renderSkeletons();

    try {
      this.showDialog();
      const products = await this.#fetchRecommendations(productId);
      if (loadVersion !== this.#loadVersion || !this.refs.dialog.open) return;

      if (!products || products.length === 0) {
        this.#renderEmptyState();
      } else {
        this.#renderProducts(products);
      }
    } catch (err) {
      if (loadVersion !== this.#loadVersion || !this.refs.dialog.open) return;
      console.error('[recommendations-popup] Failed to load recommendations:', err);
      this.#renderEmptyState();
    } finally {
      if (loadVersion === this.#loadVersion) this.#isOpening = false;
    }
  }

  showDialog() {
    const { dialog } = this.refs;
    if (dialog.open) return;

    if (!this.#previousFocusedElement) {
      this.#previousFocusedElement = /** @type {HTMLElement | null} */ (document.activeElement);
    }
    dialog.showModal();
    lockScroll(dialog);
    this.dispatchEvent(new DialogOpenEvent());
  }

  /** All dismissal controls use this synchronous close path. */
  closeDialog = () => {
    const { dialog } = this.refs;
    if (!dialog.open) return;

    dialog.close();
    this.#finishClose();
  };

  #finishClose() {
    ++this.#loadVersion;
    this.#isOpening = false;
    unlockScroll(this.refs.dialog);

    const previousFocus = this.#previousFocusedElement;
    this.#previousFocusedElement = null;
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    this.dispatchEvent(new DialogCloseEvent());
  }

  #handleBackdropClick = (event) => {
    const { dialog } = this.refs;
    if (event.target === dialog && isClickedOutside(event, dialog)) this.closeDialog();
  };

  #handleCancel = (event) => {
    event.preventDefault();
    this.closeDialog();
  };

  #handleNativeClose = () => {
    // Native close events are queued; ignore one from an earlier opening.
    if (!this.refs.dialog.open && this.#previousFocusedElement) this.#finishClose();
  };

  /**
   * Fetches complementary products with intelligent fallbacks:
   * 1. Shopify Complementary Recommendations
   * 2. Shopify Related Recommendations
   * 3. Catalog collection fallback (/collections/all/products.json)
   *
   * @param {string | null} productId
   * @returns {Promise<Array<object>>}
   */
  async #fetchRecommendations(productId) {
    let list = [];

    // 1. Try Complementary intent first
    if (productId) {
      try {
        const res = await fetch(
          `/recommendations/products.json?product_id=${productId}&limit=6&intent=complementary`
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.products) && data.products.length > 0) {
            list = data.products;
          }
        }
      } catch (e) {
        console.debug('[recommendations-popup] Complementary API:', e);
      }

      // 2. Fall back to Related intent if < 3 products
      if (list.length < 3) {
        try {
          const res = await fetch(
            `/recommendations/products.json?product_id=${productId}&limit=6&intent=related`
          );
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.products) && data.products.length > 0) {
              const existingIds = new Set(list.map((p) => String(p.id)));
              for (const p of data.products) {
                if (!existingIds.has(String(p.id))) {
                  list.push(p);
                }
              }
            }
          }
        } catch (e) {
          console.debug('[recommendations-popup] Related API:', e);
        }
      }
    }

    // 3. Fall back to store collection if still < 3
    if (list.length < 3) {
      try {
        const res = await fetch('/collections/all/products.json?limit=12');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.products)) {
            const existingIds = new Set(list.map((p) => String(p.id)));
            for (const p of data.products) {
              if (!existingIds.has(String(p.id))) {
                list.push(p);
              }
            }
          }
        }
      } catch (_) {
        try {
          const res = await fetch('/products.json?limit=12');
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.products)) {
              const existingIds = new Set(list.map((p) => String(p.id)));
              for (const p of data.products) {
                if (!existingIds.has(String(p.id))) {
                  list.push(p);
                }
              }
            }
          }
        } catch (_) {}
      }
    }

    // Filter out:
    // a) The product just added
    // b) Unavailable products
    const filtered = list.filter((p) => {
      if (productId && String(p.id) === String(productId)) return false;
      if (p.available === false) return false;
      if (Array.isArray(p.variants) && !p.variants.some((v) => v.available)) return false;
      return true;
    });

    // Curate 3 to 4 items
    return filtered.slice(0, 4);
  }

  /**
   * Formats raw prices into currency string using the store's money format.
   *
   * @param {number | string | null | undefined} rawPrice
   * @returns {string}
   */
  formatPrice(rawPrice) {
    if (rawPrice === null || rawPrice === undefined) return '';

    let num = Number(rawPrice);
    if (isNaN(num)) return String(rawPrice);

    // If decimal string (e.g. "1499.00" or float), convert to minor units (cents)
    if (typeof rawPrice === 'string' && rawPrice.includes('.')) {
      num = Math.round(parseFloat(rawPrice) * 100);
    } else if (num < 10000 && !String(num).endsWith('00')) {
      num = Math.round(num * 100);
    }

    const moneyFormat = this.dataset.moneyFormat || window.Theme?.moneyFormat || '₹{{amount}}';
    const currency = this.dataset.currency || window.Shopify?.currency?.active || 'INR';

    try {
      if (typeof formatMoney === 'function') {
        return formatMoney(num, moneyFormat, currency);
      }
    } catch (_) {}

    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0,
      }).format(num / 100);
    } catch {
      return `₹${Math.round(num / 100).toLocaleString('en-IN')}`;
    }
  }

  /**
   * Renders skeleton loading state.
   */
  #renderSkeletons() {
    if (!this.refs.content) return;

    const grid = document.createElement('div');
    grid.className = 'recommended-products-modal__grid recommended-products-modal__grid--skeleton';

    for (let i = 0; i < 3; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'recommendation-card recommendation-card--skeleton';
      skeleton.innerHTML = `
        <div class="recommendation-card__image-box skeleton-shimmer"></div>
        <div class="recommendation-card__info">
          <div class="skeleton-line skeleton-line--title skeleton-shimmer"></div>
          <div class="skeleton-line skeleton-line--price skeleton-shimmer"></div>
          <div class="skeleton-btn skeleton-shimmer"></div>
        </div>
      `;
      grid.appendChild(skeleton);
    }

    this.refs.content.replaceChildren(grid);
  }

  /**
   * Renders the product cards into the modal grid.
   *
   * @param {Array<object>} products
   */
  #renderProducts(products) {
    if (!this.refs.content) return;

    const grid = document.createElement('div');
    grid.className = 'recommended-products-modal__grid';

    products.forEach((product) => {
      const card = this.#createProductCard(product);
      grid.appendChild(card);
    });

    this.refs.content.replaceChildren(grid);
  }

  /**
   * Creates a single recommended product card.
   *
   * @param {object} product
   * @returns {HTMLElement}
   */
  #createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'recommendation-card';

    // Resolve product image
    let imgSrc = '';
    if (product.featured_image) {
      imgSrc =
        typeof product.featured_image === 'string'
          ? product.featured_image
          : product.featured_image.src || product.featured_image.url || '';
    } else if (Array.isArray(product.images) && product.images[0]) {
      imgSrc =
        typeof product.images[0] === 'string'
          ? product.images[0]
          : product.images[0].src || product.images[0].url || '';
    }

    // Optimization: request a medium image size if Shopify CDN URL
    if (imgSrc && imgSrc.includes('cdn.shopify.com') && !imgSrc.includes('_400x')) {
      imgSrc = imgSrc.replace(/(\.[a-z]+)(\?.*)?$/i, '_400x400$1$2');
    }

    const availableVariants = (product.variants || []).filter((v) => v.available);
    const defaultVariant = availableVariants[0] || product.variants?.[0] || {};
    const hasMultipleVariants = availableVariants.length > 1;

    const titleEscaped = this.#escapeHtml(product.title);
    const productUrl = `/products/${product.handle}`;

    const currentPriceFormatted = this.formatPrice(defaultVariant.price ?? product.price);
    const comparePriceFormatted =
      defaultVariant.compare_at_price &&
      Number(defaultVariant.compare_at_price) > Number(defaultVariant.price)
        ? this.formatPrice(defaultVariant.compare_at_price)
        : '';

    card.innerHTML = `
      <a href="${productUrl}" class="recommendation-card__image-link" tabindex="-1" aria-hidden="true">
        <div class="recommendation-card__image-box">
          ${
            imgSrc
              ? `<img
                  src="${imgSrc}"
                  alt="${titleEscaped}"
                  loading="lazy"
                  class="recommendation-card__image"
                />`
              : `<div class="recommendation-card__placeholder">Jewellery</div>`
          }
        </div>
      </a>
      <div class="recommendation-card__info">
        <a href="${productUrl}" class="recommendation-card__title" title="${titleEscaped}">
          ${titleEscaped}
        </a>
        <div class="recommendation-card__price-wrapper">
          <span class="recommendation-card__price">${currentPriceFormatted}</span>
          ${
            comparePriceFormatted
              ? `<span class="recommendation-card__compare-price">${comparePriceFormatted}</span>`
              : ''
          }
        </div>
        ${
          hasMultipleVariants
            ? `
          <div class="recommendation-card__variant-wrapper">
            <select
              class="recommendation-card__variant-select"
              aria-label="Select option for ${titleEscaped}"
            >
              ${availableVariants
                .map(
                  (v) => `
                <option
                  value="${v.id}"
                  data-price="${v.price}"
                  data-compare-price="${v.compare_at_price || ''}"
                >
                  ${this.#escapeHtml(v.title)}
                </option>
              `
                )
                .join('')}
            </select>
          </div>
        `
            : ''
        }
        <div class="recommendation-card__actions">
          <button
            type="button"
            class="button recommendation-card__add-btn"
            data-variant-id="${defaultVariant.id || ''}"
            aria-label="Add ${titleEscaped} to bag"
          >
            <span class="recommendation-card__btn-text">Add to Bag</span>
          </button>
        </div>
        <div class="recommendation-card__error hidden" role="alert" aria-live="polite"></div>
      </div>
    `;

    // Handle variant selection dropdown
    const select = card.querySelector('.recommendation-card__variant-select');
    const addBtn = card.querySelector('.recommendation-card__add-btn');
    const priceEl = card.querySelector('.recommendation-card__price');
    const comparePriceEl = card.querySelector('.recommendation-card__compare-price');

    if (select && addBtn) {
      select.addEventListener('change', () => {
        const selectedOption = select.options[select.selectedIndex];
        if (!selectedOption) return;

        addBtn.dataset.variantId = selectedOption.value;

        // Update displayed prices
        const vPrice = selectedOption.dataset.price;
        const vComparePrice = selectedOption.dataset.comparePrice;

        if (priceEl && vPrice) {
          priceEl.textContent = this.formatPrice(vPrice);
        }

        if (comparePriceEl) {
          if (vComparePrice && Number(vComparePrice) > Number(vPrice)) {
            comparePriceEl.textContent = this.formatPrice(vComparePrice);
            comparePriceEl.classList.remove('hidden');
          } else {
            comparePriceEl.textContent = '';
            comparePriceEl.classList.add('hidden');
          }
        }
      });
    }

    // Handle Add to Cart click
    if (addBtn) {
      addBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const variantId = addBtn.dataset.variantId;
        if (!variantId) return;

        this.#addRecommendedItem(variantId, addBtn, card);
      });
    }

    return card;
  }

  /**
   * Adds a recommended product variant directly to the Shopify cart.
   *
   * @param {string} variantId
   * @param {HTMLButtonElement} buttonElement
   * @param {HTMLElement} cardElement
   */
  async #addRecommendedItem(variantId, buttonElement, cardElement) {
    if (buttonElement.disabled || buttonElement.dataset.loading === 'true') return;

    const originalHtml = buttonElement.innerHTML;
    buttonElement.disabled = true;
    buttonElement.dataset.loading = 'true';
    buttonElement.classList.add('recommendation-card__add-btn--loading');
    buttonElement.innerHTML = `
      <span class="recommendation-spinner" aria-hidden="true"></span>
      <span class="recommendation-card__btn-text">Adding...</span>
    `;

    const errorEl = cardElement.querySelector('.recommendation-card__error');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }

    let deferredPromise = null;

    try {
      if (typeof CartLinesUpdateEvent?.createPromise === 'function') {
        deferredPromise = CartLinesUpdateEvent.createPromise();
        document.dispatchEvent(
          new CartLinesUpdateEvent({
            action: 'add',
            context: 'recommendations-popup',
            lines: [{ merchandiseId: String(variantId), quantity: 1 }],
            promise: deferredPromise.promise,
          })
        );
      }
    } catch (e) {
      console.debug('[recommendations-popup] Event dispatch setup error:', e);
    }

    try {
      const addUrl = window.Theme?.routes?.cart_add_url || '/cart/add.js';
      const response = await fetch(addUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ id: Number(variantId), quantity: 1 }),
      });

      const data = await response.json();

      if (!response.ok || data.status) {
        const errorMsg = data.description || data.message || 'Unable to add item';
        throw new Error(errorMsg);
      }

      // Fetch fresh cart state to resolve promise and update counts
      const cartUrl = window.Theme?.routes?.cart_url
        ? `${window.Theme.routes.cart_url}.js`
        : '/cart.js';
      const cartRes = await fetch(cartUrl);
      const ajaxCart = await cartRes.json();

      if (deferredPromise) {
        const cartPayload =
          typeof CartLinesUpdateEvent?.createCartFromAjaxResponse === 'function'
            ? CartLinesUpdateEvent.createCartFromAjaxResponse(ajaxCart)
            : ajaxCart;

        deferredPromise.resolve({
          cart: cartPayload,
          detail: {
            didError: false,
            itemCount: ajaxCart.item_count,
            items: ajaxCart.items,
            source: 'recommendations-popup',
          },
        });
      }

      // Inline success feedback
      buttonElement.dataset.loading = 'false';
      buttonElement.classList.remove('recommendation-card__add-btn--loading');
      buttonElement.classList.add('recommendation-card__add-btn--added');
      buttonElement.innerHTML = `
        <span class="recommendation-checkmark" aria-hidden="true">✓</span>
        <span class="recommendation-card__btn-text">Added</span>
      `;

      // Allow adding again after 2.5 seconds
      setTimeout(() => {
        buttonElement.classList.remove('recommendation-card__add-btn--added');
        buttonElement.disabled = false;
        buttonElement.innerHTML = originalHtml;
      }, 2500);
    } catch (err) {
      console.error('[recommendations-popup] Add to cart error:', err);

      if (deferredPromise) {
        deferredPromise.reject(err);
      }

      buttonElement.disabled = false;
      buttonElement.dataset.loading = 'false';
      buttonElement.classList.remove('recommendation-card__add-btn--loading');
      buttonElement.innerHTML = originalHtml;

      if (errorEl) {
        errorEl.textContent = err.message || 'Item unavailable';
        errorEl.classList.remove('hidden');
      }
    }
  }

  /**
   * Renders fallback when no products are available.
   */
  #renderEmptyState() {
    if (!this.refs.content) return;

    this.refs.content.innerHTML = `
      <div class="recommended-products-modal__empty">
        <p class="recommended-products-modal__empty-text">
          Explore our full jewellery collections to discover your next favourite piece.
        </p>
        <a href="/collections/all" class="button button-primary recommended-products-modal__shop-all-btn">
          Explore All Jewellery
        </a>
      </div>
    `;
  }

  /**
   * Helper to escape HTML characters.
   *
   * @param {string} str
   * @returns {string}
   */
  #escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

if (!customElements.get('recommended-products-popup')) {
  customElements.define('recommended-products-popup', RecommendedProductsPopup);
}
