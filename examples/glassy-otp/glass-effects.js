import { stepSpring } from '../../shared/spring.js';

const SHEEN_SECONDS_PER_LAP = 5.5;
const SHEEN_FADE_PER_SECOND = 2.6;
const PATH_LENGTH = 100;
const KICK_SPRING = { stiffness: 190, damping: 13 };
const KICK_IMPULSE = 11;
const TILT_DEGREES = 1.1;
const PUSH_PIXELS = 7;

/**
 * The streak of light that travels around the glass edge. It runs off the take's
 * clock and is invisible at the first frame, so the loop has no jump in it.
 */
export class EdgeSheen {
  #paths;
  #time = 0;
  #opacity = 0;
  #goal = 1;

  /**
   * @param {SVGElement[]} paths The strokes to move. Each needs pathLength="100".
   */
  constructor(paths) {
    this.#paths = paths;
  }

  /**
   * Starts fading out, ready for the take to end.
   *
   * @returns {void}
   */
  fadeOut() {
    this.#goal = 0;
  }

  /**
   * Returns to the first frame: invisible and at the start of its lap.
   *
   * @returns {void}
   */
  reset() {
    this.#time = 0;
    this.#opacity = 0;
    this.#goal = 1;
  }

  /**
   * @param {number} dt Elapsed time in seconds.
   * @returns {void}
   */
  update(dt) {
    const step = SHEEN_FADE_PER_SECOND * dt;

    this.#time += dt;
    this.#opacity += Math.max(-step, Math.min(step, this.#goal - this.#opacity));

    const offset = PATH_LENGTH - ((this.#time / SHEEN_SECONDS_PER_LAP) % 1) * PATH_LENGTH;

    for (const path of this.#paths) {
      path.style.strokeDashoffset = offset.toFixed(2);
      path.style.opacity = this.#opacity.toFixed(3);
    }
  }
}

/**
 * The small physical nudge the card gets from each key press. It's a spring, so
 * it always settles back to rest by itself.
 */
export class CardKick {
  #element;
  #spring = { value: 0, velocity: 0 };
  #direction = 1;

  /**
   * @param {HTMLElement} element The element to move.
   */
  constructor(element) {
    this.#element = element;
  }

  /**
   * Nudges the card, alternating sides so typing feels alive.
   *
   * @returns {void}
   */
  kick() {
    this.#spring.velocity += KICK_IMPULSE * this.#direction;
    this.#direction *= -1;
  }

  /**
   * Stops all movement.
   *
   * @returns {void}
   */
  reset() {
    this.#spring = { value: 0, velocity: 0 };
    this.#direction = 1;
  }

  /**
   * @param {number} dt Elapsed time in seconds.
   * @returns {void}
   */
  update(dt) {
    this.#spring = stepSpring(this.#spring, 0, dt, KICK_SPRING);

    const { value } = this.#spring;
    const push = Math.abs(value) * PUSH_PIXELS;
    const tilt = value * TILT_DEGREES;

    this.#element.style.transform = `perspective(1800px) translateY(${push.toFixed(2)}px) rotateY(${tilt.toFixed(3)}deg)`;
  }
}
