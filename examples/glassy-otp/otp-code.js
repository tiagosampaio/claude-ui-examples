/**
 * The digits entered so far. Holds no DOM, so the rules can be unit tested.
 */
export class OtpCode {
  #length;
  #digits = [];

  /**
   * @param {number} length How many digits make a complete code.
   */
  constructor(length) {
    this.#length = length;
  }

  /** @returns {string[]} The digits entered so far. */
  get digits() {
    return [...this.#digits];
  }

  /** @returns {number} The position of the next digit. */
  get activeIndex() {
    return this.#digits.length;
  }

  /** @returns {boolean} Whether every position is filled. */
  get isComplete() {
    return this.#digits.length === this.#length;
  }

  /**
   * Adds a digit, ignoring anything else or any input past the last position.
   *
   * @param {string} character The typed character.
   * @returns {boolean} Whether the digit was accepted.
   */
  push(character) {
    if (this.isComplete || !/^\d$/.test(character)) {
      return false;
    }

    this.#digits.push(character);

    return true;
  }

  /**
   * Removes the last digit.
   *
   * @returns {void}
   */
  pop() {
    this.#digits.pop();
  }

  /**
   * Removes every digit.
   *
   * @returns {void}
   */
  clear() {
    this.#digits = [];
  }
}
