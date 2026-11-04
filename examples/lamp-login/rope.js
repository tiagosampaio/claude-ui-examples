const SEGMENTS = 14;
const FIXED_STEP = 1 / 120;
const GRAVITY = 1500;
const RETENTION = 0.992;
const CONSTRAINT_PASSES = 10;
const MAX_CATCH_UP_STEPS = 8;

/**
 * A hanging cord simulated with Verlet integration.
 *
 * The cord is a chain of points. Each step moves points by their last motion
 * plus gravity, then repeatedly nudges neighbours back to the right spacing.
 * Pulling past the cord's length stretches its spacing, so letting go makes it
 * snap back and swing on its own, with no separate recoil animation.
 *
 * It runs in fixed steps so the motion doesn't depend on the display's refresh
 * rate, and has no DOM access so it can be unit tested.
 */
export class Rope {
  #anchor;
  #length;
  #points;
  #pin = null;
  #pending = 0;

  /**
   * @param {{x: number, y: number}} anchor The fixed top of the cord.
   * @param {number} length The cord's resting length.
   */
  constructor(anchor, length) {
    this.#anchor = anchor;
    this.#length = length;
    this.#points = [];
    this.reset();
  }

  /** @returns {Array<{x: number, y: number}>} The chain, from the top down. */
  get points() {
    return this.#points;
  }

  /** @returns {{x: number, y: number}} The free end of the cord. */
  get end() {
    return this.#points.at(-1);
  }

  /** @returns {number} How far the end is below where it hangs at rest. */
  get pull() {
    return this.end.y - (this.#anchor.y + this.#length);
  }

  /**
   * Hangs the cord straight down, motionless.
   *
   * @returns {void}
   */
  reset() {
    this.#pin = null;
    this.#pending = 0;
    this.#points = Array.from({ length: SEGMENTS + 1 }, (_, index) => {
      const y = this.#anchor.y + (this.#length * index) / SEGMENTS;

      return { x: this.#anchor.x, y, previousX: this.#anchor.x, previousY: y };
    });
  }

  /**
   * Holds the end at a point, or lets it go when given null.
   *
   * @param {{x: number, y: number}|null} point Where to hold the end.
   * @returns {void}
   */
  pinEnd(point) {
    this.#pin = point;
  }

  /**
   * Advances the simulation.
   *
   * @param {number} dt Elapsed time in seconds.
   * @param {number} [wind] Sideways acceleration, for a gentle idle sway.
   * @returns {void}
   */
  step(dt, wind = 0) {
    this.#pending = Math.min(this.#pending + dt, MAX_CATCH_UP_STEPS * FIXED_STEP);

    while (this.#pending >= FIXED_STEP) {
      this.#integrate(wind);
      this.#applyConstraints();
      this.#pending -= FIXED_STEP;
    }
  }

  /**
   * Moves every free point by its momentum plus gravity and wind.
   *
   * @param {number} wind Sideways acceleration.
   * @returns {void}
   */
  #integrate(wind) {
    for (const point of this.#points.slice(1)) {
      const velocityX = (point.x - point.previousX) * RETENTION;
      const velocityY = (point.y - point.previousY) * RETENTION;

      point.previousX = point.x;
      point.previousY = point.y;
      point.x += velocityX + wind * FIXED_STEP * FIXED_STEP;
      point.y += velocityY + GRAVITY * FIXED_STEP * FIXED_STEP;
    }
  }

  /**
   * Restores the spacing between neighbours, keeping the ends in place.
   *
   * @returns {void}
   */
  #applyConstraints() {
    const spacing = this.#currentSpacing();

    for (let pass = 0; pass < CONSTRAINT_PASSES; pass += 1) {
      this.#holdEnds();

      for (let index = 0; index < SEGMENTS; index += 1) {
        const first = this.#points[index];
        const second = this.#points[index + 1];
        const deltaX = second.x - first.x;
        const deltaY = second.y - first.y;
        const distance = Math.hypot(deltaX, deltaY) || spacing;
        const correction = (distance - spacing) / distance / 2;

        first.x += deltaX * correction;
        first.y += deltaY * correction;
        second.x -= deltaX * correction;
        second.y -= deltaY * correction;
      }
    }

    this.#holdEnds();
  }

  /** @returns {number} The target gap, widened while pulled past full length. */
  #currentSpacing() {
    const resting = this.#length / SEGMENTS;

    if (!this.#pin) {
      return resting;
    }

    const reach = Math.hypot(this.#pin.x - this.#anchor.x, this.#pin.y - this.#anchor.y);

    return Math.max(resting, reach / SEGMENTS);
  }

  /**
   * Puts the anchored top, and the end if held, back where they belong.
   *
   * @returns {void}
   */
  #holdEnds() {
    Object.assign(this.#points[0], this.#anchor);

    if (this.#pin) {
      Object.assign(this.end, this.#pin);
    }
  }
}
