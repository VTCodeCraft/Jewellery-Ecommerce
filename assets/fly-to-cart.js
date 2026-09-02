import { yieldToMainThread } from '@theme/utilities';
import { Component } from '@theme/component';

/**
 * FlyToCart custom element for animating product images to cart
 * This component creates a visual effect of a product "flying" to the cart when added
 */
class FlyToCart extends Component {
  /** @type {Element} */
  source;

  /** @type {boolean} */
  useSourceSize = false;

  /** @type {Element} */
  destination;

  connectedCallback() {
    super.connectedCallback();
    const intersectionObserver = new IntersectionObserver((entries) => {
      /** @type {DOMRectReadOnly | null} */
      let sourceRect = null;
      /** @type {DOMRectReadOnly | null} */
      let destinationRect = null;

      entries.forEach((entry) => {
        if (entry.target === this.source) {
          sourceRect = entry.boundingClientRect;
        } else if (entry.target === this.destination) {
          destinationRect = entry.boundingClientRect;
        }
      });

      if (sourceRect && destinationRect) {
        this.#animate(sourceRect, destinationRect);
      }

      intersectionObserver.disconnect();
    });
    intersectionObserver.observe(this.source);
    intersectionObserver.observe(this.destination);
  }

  /**
   * Animates the flying thingy along the bezier curve.
   * @param {DOMRectReadOnly} sourceRect - The bounding client rect of the source.
   * @param {DOMRectReadOnly} destinationRect - The bounding client rect of the destination.
   */
  #animate = async (sourceRect, destinationRect) => {
    //Define bezier curve points
    const startPoint = {
      x: sourceRect.left + sourceRect.width / 2,
      y: sourceRect.top + sourceRect.height / 2,
    };

    const endPoint = {
      x: destinationRect.left + destinationRect.width / 2,
      y: destinationRect.top + destinationRect.height / 2,
    };

    // Position the flying thingy back to the start point
    if (this.useSourceSize) {
      this.style.setProperty('--width', `${sourceRect.width}px`);
      this.style.setProperty('--height', `${sourceRect.height}px`);
    }
    this.style.setProperty('--start-x', `${startPoint.x}px`);
    this.style.setProperty('--start-y', `${startPoint.y}px`);
    this.style.setProperty('--travel-x', `${endPoint.x - startPoint.x}px`);
    this.style.setProperty('--travel-y', `${endPoint.y - startPoint.y}px`);

    await yieldToMainThread();

    await Promise.allSettled(this.getAnimations().map((a) => a.finished));
    this.remove();
  };
}

if (!customElements.get('fly-to-cart')) {
  customElements.define('fly-to-cart', FlyToCart);
}

/**
 * Flies an image from one element to another using the animation above.
 *
 * This is the construction that product-form.js and sticky-add-to-cart.js were
 * each doing inline; it lives here so any new caller (the wishlist heart) gets
 * the identical element, classes, timings and cleanup rather than a second
 * implementation. Only the destination differs per caller.
 *
 * @param {Element | null | undefined} source - Element the image flies from.
 * @param {Element | null | undefined} destination - Element it flies to.
 * @param {object} options
 * @param {string | null | undefined} options.image - Image URL to fly.
 * @param {'main' | 'quick' | 'sticky'} [options.variant] - Which timing curve to use.
 * @param {boolean} [options.useSourceSize] - Start at the source's size rather than the default 40px.
 * @returns {FlyToCart | null} The element, or null when it could not run.
 */
export function flyToTarget(source, destination, { image, variant = 'main', useSourceSize = false } = {}) {
  // A missing destination is expected - the header entry is optional - so this
  // stays silent rather than throwing and interrupting the real action.
  if (!source || !destination || !image) return null;

  const flyToCartElement = /** @type {FlyToCart} */ (document.createElement('fly-to-cart'));

  flyToCartElement.classList.add(`fly-to-cart--${variant}`);
  flyToCartElement.style.setProperty('background-image', `url(${image})`);
  flyToCartElement.style.setProperty('--start-opacity', '0');
  flyToCartElement.useSourceSize = useSourceSize;
  flyToCartElement.source = source;
  flyToCartElement.destination = destination;

  document.body.appendChild(flyToCartElement);

  return flyToCartElement;
}
