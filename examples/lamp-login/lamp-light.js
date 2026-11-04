/** Brightness over time as a bulb stutters into life: [milliseconds, level]. */
const TURN_ON_CURVE = [[0, 0], [60, 0.85], [110, 0.2], [180, 0.95], [240, 0.55], [420, 1]];

/** Brightness over time as it dies, with one small flare. */
const TURN_OFF_CURVE = [[0, 1], [60, 0.25], [90, 0.5], [320, 0]];

/**
 * Reads a brightness from a curve, blending between its keyframes.
 *
 * @param {number} elapsed Milliseconds since the switch was pulled.
 * @param {boolean} isOn Whether the lamp was switched on or off.
 * @returns {number} The light level, from 0 to 1.
 */
export function lightLevel(elapsed, isOn) {
  const curve = isOn ? TURN_ON_CURVE : TURN_OFF_CURVE;
  const nextIndex = curve.findIndex(([time]) => time > elapsed);

  if (nextIndex === -1) {
    return curve.at(-1)[1];
  }

  const [startTime, startLevel] = curve[nextIndex - 1];
  const [endTime, endLevel] = curve[nextIndex];
  const progress = (elapsed - startTime) / (endTime - startTime);

  return startLevel + (endLevel - startLevel) * progress;
}

/**
 * Owns the lamp's on/off state. It publishes brightness as the --light custom
 * property, which all the lit CSS layers read, and toggles the is-lit class that
 * brings in the card.
 */
export class LampLight {
  #scene;
  #isOn = false;
  #elapsed = Infinity;

  /**
   * @param {HTMLElement} scene The element that receives --light and is-lit.
   */
  constructor(scene) {
    this.#scene = scene;
  }

  /** @returns {boolean} Whether the lamp is switched on. */
  get isOn() {
    return this.#isOn;
  }

  /**
   * Flips the switch and starts the matching flicker.
   *
   * @returns {void}
   */
  toggle() {
    this.#isOn = !this.#isOn;
    this.#elapsed = 0;
    this.#scene.classList.toggle('is-lit', this.#isOn);
  }

  /**
   * Turns the lamp off at once, with no flicker.
   *
   * @returns {void}
   */
  reset() {
    this.#isOn = false;
    this.#elapsed = Infinity;
    this.#scene.classList.remove('is-lit');
    this.#scene.style.setProperty('--light', '0');
  }

  /**
   * Advances the flicker.
   *
   * @param {number} dt Elapsed time in seconds.
   * @returns {void}
   */
  update(dt) {
    this.#elapsed += dt * 1000;
    this.#scene.style.setProperty('--light', lightLevel(this.#elapsed, this.#isOn).toFixed(3));
  }
}
