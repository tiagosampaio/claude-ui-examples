/**
 * Scales a fixed 1080x1920 canvas to fit the window, so examples are authored
 * in real output pixels and always frame the same way regardless of screen.
 */
export class Stage {
  static WIDTH = 1080;
  static HEIGHT = 1920;

  #element;
  #scale = 1;
  #offsetX = 0;
  #offsetY = 0;

  /**
   * @param {HTMLElement} element The stage root.
   */
  constructor(element) {
    this.#element = element;
    this.#fit();
    window.addEventListener('resize', () => this.#fit());
  }

  /** @returns {HTMLElement} The stage root. */
  get element() {
    return this.#element;
  }

  /** @returns {number} Client pixels per stage pixel. */
  get scale() {
    return this.#scale;
  }

  /**
   * Converts a stage position to window coordinates.
   *
   * @param {{x: number, y: number}} point A position in stage pixels.
   * @returns {{x: number, y: number}} The same position in client pixels.
   */
  toClient({ x, y }) {
    return {
      x: this.#offsetX + x * this.#scale,
      y: this.#offsetY + y * this.#scale,
    };
  }

  /**
   * Converts a window position to stage coordinates.
   *
   * @param {{x: number, y: number}} point A position in client pixels.
   * @returns {{x: number, y: number}} The same position in stage pixels.
   */
  toStage({ x, y }) {
    return {
      x: (x - this.#offsetX) / this.#scale,
      y: (y - this.#offsetY) / this.#scale,
    };
  }

  /**
   * Recomputes the scale and centers the stage in the window. A window with no
   * size (a pane that is still opening, say) keeps the last scale, because a
   * scale of 0 would make toStage() divide by zero. The window reports a resize
   * once it has a real size.
   */
  #fit() {
    const { innerWidth, innerHeight } = window;

    if (innerWidth === 0 || innerHeight === 0) {
      return;
    }

    this.#scale = Math.min(innerWidth / Stage.WIDTH, innerHeight / Stage.HEIGHT);
    this.#offsetX = (innerWidth - Stage.WIDTH * this.#scale) / 2;
    this.#offsetY = (innerHeight - Stage.HEIGHT * this.#scale) / 2;
    this.#element.style.transform =
      `translate(${this.#offsetX}px, ${this.#offsetY}px) scale(${this.#scale})`;
  }
}
