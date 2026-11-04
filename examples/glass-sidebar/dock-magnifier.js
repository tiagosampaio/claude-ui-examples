const RADIUS = 190;
const MAX_SCALE = 1.45;
const SMOOTHING = 18;
const SETTLE_EPSILON = 0.001;

/**
 * How large an icon should be, given how far the pointer is from it.
 *
 * @param {number} distance Distance from the pointer in stage pixels.
 * @param {number} [radius] Distance at which the effect fades out completely.
 * @param {number} [maxScale] Scale when the pointer is directly on the icon.
 * @returns {number} The scale, from 1 up to maxScale.
 */
export function magnification(distance, radius = RADIUS, maxScale = MAX_SCALE) {
  if (distance >= radius) {
    return 1;
  }

  const falloff = Math.cos((distance / radius) * (Math.PI / 2));

  return 1 + (maxScale - 1) * falloff * falloff;
}

/**
 * The macOS Dock effect for the collapsed sidebar.
 *
 * Each item gets a --m custom property, which the CSS uses for both the row
 * height and the icon scale. Row height drives layout, so neighbours are
 * pushed apart and the panel itself grows with no extra code.
 */
export class DockMagnifier {
  #items;
  #getScale;
  #pointerY = null;

  /**
   * @param {HTMLElement[]} items The elements to magnify.
   * @param {() => number} getScale Returns client pixels per stage pixel.
   */
  constructor(items, getScale) {
    this.#items = items.map((element) => ({ element, value: 1 }));
    this.#getScale = getScale;
  }

  /**
   * @param {number|null} clientY The pointer height, or null when it is away.
   * @returns {void}
   */
  setPointer(clientY) {
    this.#pointerY = clientY;
  }

  /**
   * Returns every item to full rest immediately.
   *
   * @returns {void}
   */
  reset() {
    this.#pointerY = null;

    for (const item of this.#items) {
      item.value = 1;
      item.element.style.setProperty('--m', '1');
    }
  }

  /**
   * Eases every item towards the size the pointer position calls for.
   *
   * @param {number} dt Elapsed time in seconds.
   * @returns {void}
   */
  update(dt) {
    const blend = 1 - Math.exp(-SMOOTHING * dt);
    const goals = this.#items.map(({ element }) => this.#goalFor(element));

    this.#items.forEach((item, index) => {
      const goal = goals[index];

      if (Math.abs(goal - item.value) < SETTLE_EPSILON) {
        if (item.value !== goal) {
          item.value = goal;
          item.element.style.setProperty('--m', goal.toFixed(4));
        }

        return;
      }

      item.value += (goal - item.value) * blend;
      item.element.style.setProperty('--m', item.value.toFixed(4));
    });
  }

  /**
   * @param {HTMLElement} element An item.
   * @returns {number} The scale this item should be heading for.
   */
  #goalFor(element) {
    if (this.#pointerY === null) {
      return 1;
    }

    const rect = element.getBoundingClientRect();
    const center = rect.top + rect.height / 2;

    return magnification(Math.abs(center - this.#pointerY) / this.#getScale());
  }
}
