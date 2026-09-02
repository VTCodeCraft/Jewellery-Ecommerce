/**
 * Wishlist.
 *
 * Storage lives behind a single module (`WishlistStore`) so the persistence
 * layer can later be swapped for Shopify customer-account metafields without
 * touching any of the UI components below. Only product handles are stored -
 * never product objects - so entries stay small and always resolve against
 * live Shopify data.
 *
 * Components:
 *   <wishlist-button data-handle="…">  toggle on product cards and the PDP
 *   <wishlist-count>                   header count, hidden when empty
 *   <wishlist-page>                    resolves handles to real product cards
 */

import { onAnimationEnd } from '@theme/utilities';
import { flyToTarget } from '@theme/fly-to-cart';

const STORAGE_KEY = 'paridhi:wishlist';
const CHANGE_EVENT = 'wishlist:change';
/** Guards against unbounded localStorage growth. */
const MAX_ITEMS = 100;

/**
 * @typedef {object} WishlistChangeDetail
 * @property {string[]} handles - The wishlist after the change.
 */

export const WishlistStore = {
  /**
   * Every stored handle, oldest first. Always returns an array, even if
   * storage is unavailable (Safari private mode) or holds malformed JSON.
   * @returns {string[]}
   */
  get() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((handle) => typeof handle === 'string' && handle.length > 0);
    } catch {
      return [];
    }
  },

  /**
   * @param {string} handle
   * @returns {boolean}
   */
  has(handle) {
    return this.get().includes(handle);
  },

  /**
   * @returns {number}
   */
  count() {
    return this.get().length;
  },

  /**
   * Replaces the stored list and notifies every listening component.
   * @param {string[]} handles
   */
  set(handles) {
    const unique = [...new Set(handles)].slice(-MAX_ITEMS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
    } catch {
      // Storage full or blocked: keep the session working, just don't persist.
    }
    document.dispatchEvent(
      new CustomEvent(CHANGE_EVENT, { detail: /** @type {WishlistChangeDetail} */ ({ handles: unique }) })
    );
  },

  /** @param {string} handle */
  add(handle) {
    if (!handle || this.has(handle)) return;
    this.set([...this.get(), handle]);
  },

  /** @param {string} handle */
  remove(handle) {
    if (!handle) return;
    this.set(this.get().filter((stored) => stored !== handle));
  },

  /**
   * @param {string} handle
   * @returns {boolean} The state after toggling.
   */
  toggle(handle) {
    const next = !this.has(handle);
    next ? this.add(handle) : this.remove(handle);
    return next;
  },

  clear() {
    this.set([]);
  },

  /**
   * Subscribes to wishlist changes, including changes made in other tabs.
   * @param {() => void} callback
   * @returns {() => void} Unsubscribe.
   */
  subscribe(callback) {
    const onStorage = (/** @type {StorageEvent} */ event) => {
      if (event.key === STORAGE_KEY || event.key === null) callback();
    };
    document.addEventListener(CHANGE_EVENT, callback);
    window.addEventListener('storage', onStorage);
    return () => {
      document.removeEventListener(CHANGE_EVENT, callback);
      window.removeEventListener('storage', onStorage);
    };
  },
};

/**
 * Heart toggle. Renders both icon states in Liquid and swaps which one is
 * visible, so there is no icon fetch on click and no layout shift.
 */
class WishlistButton extends HTMLElement {
  /** @type {(() => void) | null} */
  #unsubscribe = null;

  connectedCallback() {
    this.button = this.querySelector('button');
    if (!this.button) return;
    this.button.addEventListener('click', this.#onClick);
    this.#unsubscribe = WishlistStore.subscribe(this.#render);
    this.#render();
  }

  disconnectedCallback() {
    this.button?.removeEventListener('click', this.#onClick);
    this.#unsubscribe?.();
  }

  get handle() {
    return this.dataset.handle || '';
  }

  /** @param {MouseEvent} event */
  #onClick = (event) => {
    // Product cards wrap the whole tile in a link; keep the click local.
    event.preventDefault();
    event.stopPropagation();

    const added = WishlistStore.toggle(this.handle);
    if (added) {
      this.button?.classList.remove('wishlist-button--pop');
      // Force a reflow so the animation replays on every add.
      void this.button?.offsetWidth;
      this.button?.classList.add('wishlist-button--pop');
      this.#flyToWishlist();
    }
  };

  /**
   * Flies the product image to the header wishlist link, reusing the theme's
   * add-to-cart animation verbatim - same <fly-to-cart> element, CSS, timings
   * and cleanup. Only the destination differs. Runs on add only, never on
   * remove, and skips silently when the header entry or an image is missing.
   */
  #flyToWishlist() {
    const destination = document.querySelector('.header-actions__wishlist');
    if (!destination) return;

    // Product cards and the product page nest the button differently; scope the
    // image lookup so a card never picks up a neighbouring card's image.
    const card = this.closest('product-card');
    const gallery = card
      ? card.querySelector('.card-gallery')
      : this.closest('product-component')?.querySelector('media-gallery');
    if (!gallery) return;

    // The slide on show, so hovering a card flies the image the shopper sees.
    const image =
      gallery.querySelector('slideshow-slide[aria-hidden="false"] img') ?? gallery.querySelector('img');
    const source = image ?? this.button ?? this;

    flyToTarget(source, destination, {
      image: image instanceof HTMLImageElement ? image.currentSrc || image.src : null,
      // Matches how add-to-cart picks its curve: the compact one on cards.
      variant: this.classList.contains('wishlist-button--overlay') ? 'quick' : 'main',
    });
  }

  #render = () => {
    if (!this.button) return;
    const active = WishlistStore.has(this.handle);
    this.button.setAttribute('aria-pressed', String(active));
    this.button.setAttribute(
      'aria-label',
      active ? this.dataset.labelRemove || 'Remove from wishlist' : this.dataset.labelAdd || 'Add to wishlist'
    );
    this.classList.toggle('wishlist-button--active', active);
  };
}

/**
 * Header count. Wraps the cart's own `cart-bubble` markup (rendered by Liquid)
 * and drives it exactly the way cart-icon.js drives the cart badge: hidden at
 * zero, blank above 99 so the bubble shrinks to a dot, and the same
 * `cart-bubble--animating` pulse on increase.
 */
class WishlistCount extends HTMLElement {
  /** @type {(() => void) | null} */
  #unsubscribe = null;
  /** @type {number} */
  #previous = 0;

  connectedCallback() {
    this.bubble = this.querySelector('.cart-bubble');
    this.bubbleText = this.querySelector('.cart-bubble__text');
    this.bubbleCount = this.querySelector('.cart-bubble__text-count');
    this.action = this.closest('.header-actions__wishlist');

    this.#update(false);
    this.#unsubscribe = WishlistStore.subscribe(() => this.#update(true));
  }

  disconnectedCallback() {
    this.#unsubscribe?.();
  }

  /**
   * @param {boolean} animate - Pulse the badge. Skipped on first paint, and
   *   when the count did not grow, matching the cart's behaviour.
   */
  #update = async (animate) => {
    const count = WishlistStore.count();
    const grew = count > this.#previous;
    this.#previous = count;

    if (!this.bubble || !this.bubbleCount) return;

    this.bubbleCount.textContent = count < 100 ? String(count) : '';
    this.bubbleCount.classList.toggle('hidden', count === 0);
    this.bubble.classList.toggle('visually-hidden', count === 0);
    this.action?.classList.toggle('header-actions__wishlist--has-items', count > 0);

    if (!animate || !grew || count === 0) return;

    // Let the visibility change paint before the animation starts.
    await new Promise((resolve) => requestAnimationFrame(resolve));

    this.bubble.classList.add('cart-bubble--animating');
    if (this.bubbleText) await onAnimationEnd(this.bubbleText);
    this.bubble.classList.remove('cart-bubble--animating');
  };
}

/**
 * Wishlist page. Resolves stored handles into real product cards using the
 * Section Rendering API, so the cards are the theme's own Liquid component -
 * correct prices, badges, sold-out state and quick add, with no duplicated
 * markup and no product data held in storage.
 */
class WishlistPage extends HTMLElement {
  /** @type {(() => void) | null} */
  #unsubscribe = null;
  /** Serialises renders so overlapping changes can't interleave. */
  #renderToken = 0;

  connectedCallback() {
    this.grid = this.querySelector('[data-wishlist-grid]');
    this.empty = this.querySelector('[data-wishlist-empty]');
    this.loading = this.querySelector('[data-wishlist-loading]');
    this.actions = this.querySelector('[data-wishlist-actions]');
    this.status = this.querySelector('[data-wishlist-status]');
    this.clearButton = this.querySelector('[data-wishlist-clear]');

    this.clearButton?.addEventListener('click', this.#onClear);
    this.#unsubscribe = WishlistStore.subscribe(this.#onChange);
    this.#render();
  }

  disconnectedCallback() {
    this.clearButton?.removeEventListener('click', this.#onClear);
    this.#unsubscribe?.();
  }

  get sectionId() {
    return this.dataset.cardSection || 'wishlist-card';
  }

  #onClear = () => {
    if (!WishlistStore.count()) return;
    const message = this.dataset.confirmClear || 'Remove all items from your wishlist?';
    if (!window.confirm(message)) return;
    WishlistStore.clear();
  };

  /**
   * Re-renders when items change. Removing a card is handled in place so the
   * remaining cards don't get refetched.
   */
  #onChange = () => {
    const handles = WishlistStore.get();
    if (!this.grid) return;

    const rendered = [...this.grid.querySelectorAll('[data-wishlist-item]')];
    const renderedHandles = rendered.map((node) => node.getAttribute('data-wishlist-item'));
    const removed = renderedHandles.filter((handle) => handle && !handles.includes(handle));
    const added = handles.filter((handle) => !renderedHandles.includes(handle));

    // Already in sync - e.g. the change was this page pruning dead handles.
    if (!removed.length && !added.length) {
      this.#syncEmptyState(handles.length);
      return;
    }

    // Only items disappeared: drop those nodes, leave the rest untouched.
    if (removed.length && !added.length) {
      for (const node of rendered) {
        const handle = node.getAttribute('data-wishlist-item');
        if (handle && removed.includes(handle)) node.remove();
      }
      this.#syncEmptyState(handles.length);
      return;
    }

    this.#render();
  };

  async #render() {
    const token = ++this.#renderToken;
    const handles = WishlistStore.get();

    if (!this.grid) return;

    if (!handles.length) {
      this.grid.replaceChildren();
      this.#syncEmptyState(0);
      return;
    }

    this.#setLoading(true);

    const results = await Promise.all(handles.map((handle) => this.#fetchCard(handle)));

    // A newer render started while these were in flight.
    if (token !== this.#renderToken) return;

    /** @type {string[]} */
    const missing = [];
    const fragment = document.createDocumentFragment();

    results.forEach(({ handle, html }) => {
      if (!html) {
        missing.push(handle);
        return;
      }
      const wrapper = document.createElement('li');
      wrapper.className = 'wishlist__item';
      wrapper.setAttribute('data-wishlist-item', handle);
      wrapper.innerHTML = html;
      fragment.append(wrapper);
    });

    this.grid.replaceChildren(fragment);
    this.#setLoading(false);
    this.#syncEmptyState(handles.length - missing.length);

    // Silently forget products that no longer exist or were unpublished.
    if (missing.length) {
      WishlistStore.set(handles.filter((handle) => !missing.includes(handle)));
    }
  }

  /**
   * @param {string} handle
   * @returns {Promise<{ handle: string, html: string | null }>}
   */
  async #fetchCard(handle) {
    try {
      const url = `${window.Shopify?.routes?.root || '/'}products/${encodeURIComponent(handle)}?section_id=${this.sectionId}`;
      const response = await fetch(url);
      if (!response.ok) return { handle, html: null };
      const html = (await response.text()).trim();
      if (!html) return { handle, html: null };

      // A missing or unpublished product still answers 200 with the section
      // wrapper around nothing, so emptiness has to be judged on content.
      const template = document.createElement('template');
      template.innerHTML = html;
      if (!template.content.querySelector('product-card')) return { handle, html: null };

      // Every response carries the same section id; drop it so the page does
      // not end up with one duplicate id per card.
      template.content.firstElementChild?.removeAttribute('id');
      return { handle, html: template.innerHTML };
    } catch {
      return { handle, html: null };
    }
  }

  /** @param {boolean} isLoading */
  #setLoading(isLoading) {
    if (this.loading) this.loading.hidden = !isLoading;
    if (isLoading) {
      this.empty && (this.empty.hidden = true);
      this.actions && (this.actions.hidden = true);
    }
  }

  /** @param {number} count */
  #syncEmptyState(count) {
    if (this.loading) this.loading.hidden = true;
    if (this.empty) this.empty.hidden = count > 0;
    if (this.actions) this.actions.hidden = count === 0;
    if (this.grid) this.grid.hidden = count === 0;
    if (this.status) {
      this.status.textContent = count
        ? `${count} ${count === 1 ? 'item' : 'items'} in your wishlist`
        : 'Your wishlist is empty';
    }
  }
}

if (!customElements.get('wishlist-button')) customElements.define('wishlist-button', WishlistButton);
if (!customElements.get('wishlist-count')) customElements.define('wishlist-count', WishlistCount);
if (!customElements.get('wishlist-page')) customElements.define('wishlist-page', WishlistPage);
