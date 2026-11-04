const VISIBLE_CLASS = 'is-visible';

/**
 * The label beside a collapsed icon. It stays lined up with its row while the
 * dock effect moves rows around, and keeps its text while fading out.
 */
export class RowTooltip {
  #element;
  #label;
  #count;
  #parent;
  #row = null;

  /**
   * @param {HTMLElement} element The tooltip element.
   */
  constructor(element) {
    this.#element = element;
    this.#label = element.querySelector('.tooltip__label');
    this.#count = element.querySelector('.tooltip__count');
    this.#parent = element.parentElement;
  }

  /**
   * @param {HTMLElement|null} row The row to label, or null to hide.
   * @returns {void}
   */
  setTarget(row) {
    if (row === this.#row) {
      return;
    }

    this.#row = row;
    this.#element.classList.toggle(VISIBLE_CLASS, row !== null);

    if (row) {
      this.#label.textContent = row.dataset.tip;
      this.#count.textContent = row.dataset.count;
    }
  }

  /**
   * Follows the current row. The row isn't a direct child of the tooltip's
   * parent, so this measures on screen and converts back to stage pixels.
   *
   * @returns {void}
   */
  update() {
    if (!this.#row) {
      return;
    }

    const parentRect = this.#parent.getBoundingClientRect();
    const rowRect = this.#row.getBoundingClientRect();
    const scale = parentRect.width / this.#parent.offsetWidth;
    const center = rowRect.top + rowRect.height / 2 - parentRect.top;

    this.#element.style.top = `${center / scale}px`;
  }
}
