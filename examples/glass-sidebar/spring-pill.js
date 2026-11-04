import { stepSpring } from '../../shared/spring.js';

const STRETCH_PER_VELOCITY = 0.00018;
const MAX_STRETCH = 0.42;
const WIDTH_SHARE_OF_STRETCH = 0.12;
const VISIBLE_CLASS = 'is-visible';

/**
 * How much the pill deforms at a given speed. It lengthens as it travels and
 * returns to its normal shape as it settles, which gives the liquid-glass feel.
 *
 * @param {number} velocity Vertical speed in stage pixels per second.
 * @returns {number} Extra vertical scale, from 0 up to MAX_STRETCH.
 */
export function stretchFor(velocity) {
  return Math.min(Math.abs(velocity) * STRETCH_PER_VELOCITY, MAX_STRETCH);
}

/**
 * A highlight that springs between rows.
 *
 * The target row is measured every frame instead of once per move, so the pill
 * keeps fitting its row while the sidebar expands, collapses or magnifies.
 * Measurements use offset values, which are in stage pixels and ignore the
 * stage's scale transform. The row's offsetParent must be the pill's parent.
 */
export class SpringPill {
  #element;
  #config;
  #target = null;
  #state = null;

  /**
   * @param {HTMLElement} element The pill element.
   * @param {{stiffness: number, damping: number}} config The spring settings.
   */
  constructor(element, config) {
    this.#element = element;
    this.#config = config;
  }

  /**
   * Sets the row to highlight. Null hides the pill, and it then appears in
   * place on the next target rather than sliding in from the previous one.
   *
   * @param {HTMLElement|null} row The row to highlight.
   * @returns {void}
   */
  setTarget(row) {
    this.#target = row;
    this.#element.classList.toggle(VISIBLE_CLASS, row !== null);

    if (row === null) {
      this.#state = null;
    }
  }

  /**
   * Places the pill on its target with no motion.
   *
   * @returns {void}
   */
  snap() {
    this.#state = null;
  }

  /**
   * Advances the spring and draws the pill.
   *
   * @param {number} dt Elapsed time in seconds.
   * @returns {void}
   */
  update(dt) {
    const row = this.#target;

    if (!row) {
      return;
    }

    const goal = row.offsetTop;

    this.#state = this.#state === null
      ? { value: goal, velocity: 0 }
      : stepSpring(this.#state, goal, dt, this.#config);

    const stretch = stretchFor(this.#state.velocity);
    const scaleY = 1 + stretch;
    const scaleX = 1 + stretch * WIDTH_SHARE_OF_STRETCH;

    this.#element.style.width = `${row.offsetWidth}px`;
    this.#element.style.height = `${row.offsetHeight}px`;
    this.#element.style.transform =
      `translate3d(${row.offsetLeft}px, ${this.#state.value}px, 0) scale(${scaleX}, ${scaleY})`;
  }
}
