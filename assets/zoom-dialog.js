import { Component } from '@theme/component';
import { preloadImage } from '@theme/utilities';
import { ZoomMediaSelectedEvent } from '@theme/events';
import { DialogCloseEvent } from '@theme/dialog';

/**
 * Premium lightbox carousel — one image at a time, bounded viewer.
 * @typedef {object} Refs
 * @property {HTMLDialogElement} dialog
 * @property {HTMLElement[]} media
 * @property {HTMLElement} thumbnails
 * @property {HTMLElement} gallery
 * @property {HTMLElement} stage
 * @property {HTMLElement} counter
 * @extends Component<Refs>
 */
export class ZoomDialog extends Component {
  requiredRefs = ['dialog', 'media'];

  #activeIndex = 0;
  #highResImagesLoaded = new Set();
  #boundKeyHandler = null;
  #boundWheelHandler = null;
  #touchStartX = 0;
  #touchStartY = 0;

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#unbindEvents();
  }

  #bindEvents() {
    this.#boundKeyHandler = this.#handleKeyDownGlobal.bind(this);
    this.#boundWheelHandler = this.#handleWheel.bind(this);
    document.addEventListener('keydown', this.#boundKeyHandler);
    this.refs.dialog.addEventListener('wheel', this.#boundWheelHandler, { passive: false });
    this.refs.dialog.addEventListener('click', this.#handleBackdropClick);
    this.refs.stage?.addEventListener('touchstart', this.#handleTouchStart, { passive: true });
    this.refs.stage?.addEventListener('touchend', this.#handleTouchEnd, { passive: true });
  }

  #unbindEvents() {
    if (this.#boundKeyHandler) document.removeEventListener('keydown', this.#boundKeyHandler);
    if (this.#boundWheelHandler) this.refs.dialog?.removeEventListener('wheel', this.#boundWheelHandler);
    this.refs.dialog?.removeEventListener('click', this.#handleBackdropClick);
    this.refs.stage?.removeEventListener('touchstart', this.#handleTouchStart);
    this.refs.stage?.removeEventListener('touchend', this.#handleTouchEnd);
    this.#boundKeyHandler = null;
    this.#boundWheelHandler = null;
  }

  #handleTouchStart = (e) => {
    const t = e.touches[0];
    if (!t) return;
    this.#touchStartX = t.clientX;
    this.#touchStartY = t.clientY;
  };

  #handleTouchEnd = (e) => {
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - this.#touchStartX;
    const dy = t.clientY - this.#touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) this.next();
      else this.prev();
    }
  };

  #handleWheel = (e) => {
    if (this.refs.dialog.open) e.preventDefault();
  };

  #handleBackdropClick = (e) => {
    if (e.target === this.refs.dialog) this.close();
  };

  #handleKeyDownGlobal = (e) => {
    if (!this.refs.dialog.open) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.prev();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
    }
  };

  // Legacy handler for dialog on:keydown
  handleKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  async open(index, event) {
    if (event) event.preventDefault();
    const { dialog, media } = this.refs;
    if (!media || media.length === 0) return;
    const safeIndex = Math.max(0, Math.min(index, media.length - 1));
    this.#activeIndex = safeIndex;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    this.#showSlide(this.#activeIndex);
    this.#bindEvents();
    this.#animateFrom(event);
  }

  /**
   * FLIP entrance: measure the thumbnail that was clicked and play the viewer
   * image from that exact rect to its final one, so the piece appears to grow
   * out of the gallery instead of a panel appearing over it. Falls back to a
   * plain fade when there is no source element or motion is not wanted.
   * @param {Event} [event] - The click that opened the viewer.
   */
  #animateFrom(event) {
    const slide = this.refs.media?.[this.#activeIndex];
    const target = slide?.querySelector('img');
    if (!target) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const source = /** @type {Element | null} */ (
      event?.target instanceof Element ? event.target.closest('.product-media-container') : null
    );
    const from = source?.querySelector('img')?.getBoundingClientRect();
    const to = target.getBoundingClientRect();

    if (reduced || !from || !to.width || !to.height) {
      this.refs.dialog?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: 'ease-out' });
      return;
    }

    this.refs.dialog?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' });
    target.animate(
      [
        {
          transformOrigin: 'top left',
          transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${
            from.height / to.height
          })`,
        },
        { transformOrigin: 'top left', transform: 'none' },
      ],
      { duration: 320, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)' }
    );
  }

  #showSlide(index) {
    const { media, counter } = this.refs;
    if (!media || media.length === 0) return;
    const total = media.length;
    let idx = index;
    if (idx < 0) idx = total - 1;
    if (idx >= total) idx = 0;
    this.#activeIndex = idx;
    media.forEach((el, i) => {
      const isActive = i === idx;
      el.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      el.style.display = isActive ? 'grid' : 'none';
      if (isActive) {
        el.style.opacity = '1';
        this.loadHighResolutionImage(el);
      }
    });
    if (counter) {
      counter.textContent = `${idx + 1} / ${total}`;
      counter.style.display = total > 1 ? '' : 'none';
    }
    const prevBtn = this.refs.dialog.querySelector('.lightbox-prev');
    const nextBtn = this.refs.dialog.querySelector('.lightbox-next');
    if (prevBtn) prevBtn.style.display = total > 1 ? '' : 'none';
    if (nextBtn) nextBtn.style.display = total > 1 ? '' : 'none';
    const thumbs = this.refs.thumbnails?.querySelectorAll('button');
    thumbs?.forEach((b, i) => b.setAttribute('aria-selected', `${i === idx}`));
    this.dispatchEvent(new ZoomMediaSelectedEvent(idx));
    // Preload adjacent
    const nextIdx = (idx + 1) % total;
    const prevIdx = (idx - 1 + total) % total;
    if (media[nextIdx]) this.loadHighResolutionImage(media[nextIdx]);
    if (media[prevIdx]) this.loadHighResolutionImage(media[prevIdx]);
  }

  next() {
    this.#showSlide(this.#activeIndex + 1);
  }

  prev() {
    this.#showSlide(this.#activeIndex - 1);
  }

  // Keep for thumbnail clicks (hidden but for compatibility)
  async handleThumbnailClick(index) {
    this.#showSlide(index);
  }

  async handleThumbnailPointerEnter(index) {
    const m = this.refs.media[index];
    if (m) this.loadHighResolutionImage(m);
  }

  // No scroll-based selection
  handleScroll = () => {};

  async selectThumbnail(index) {
    this.#showSlide(index);
  }

  getMostVisibleElement() {
    return this.refs.media[this.#activeIndex];
  }

  loadHighResolutionImage(mediaContainer) {
    if (!mediaContainer.classList.contains('product-media-container--image')) return false;
    const image = mediaContainer.querySelector('img.product-media__image');
    if (!image || !(image instanceof HTMLImageElement)) return false;
    const highResolutionUrl = image.getAttribute('data_max_resolution');
    if (!highResolutionUrl || this.#highResImagesLoaded.has(highResolutionUrl)) return false;
    preloadImage(highResolutionUrl);
    const newImage = new Image();
    newImage.className = image.className;
    newImage.alt = image.alt;
    newImage.setAttribute('data_max_resolution', highResolutionUrl);
    newImage.setAttribute('ref', 'image');
    newImage.onload = () => {
      image.replaceWith(newImage);
      this.#highResImagesLoaded.add(highResolutionUrl);
    };
    newImage.src = highResolutionUrl;
    return true;
  }

  async close() {
    const { dialog } = this.refs;
    if (!dialog.open) return;
    this.closeDialog();
  }

  closeDialog() {
    const { dialog } = this.refs;
    dialog.close();
    document.body.style.overflow = '';
    this.#unbindEvents();
    window.dispatchEvent(new DialogCloseEvent());
  }
}

if (!customElements.get('zoom-dialog')) {
  customElements.define('zoom-dialog', ZoomDialog);
}
