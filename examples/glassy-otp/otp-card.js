import { BOX_COUNT, boxPosition, PHASE, wireLines } from './box-layout.js';
import { roundedPolygon } from './rounded-polygon.js';

const CARD = { width: 880, height: 980, chamfer: 150, radius: 44 };
const CHIP = { size: 118, radius: 18 };
const ACTIVE_CLASS = 'is-active';
const FILLED_CLASS = 'is-filled';
const WIRED_CLASS = 'is-wired';
const WIRE_LIT_CLASS = 'is-lit';

/**
 * The glass shapes in card pixels: the card with two cut corners, and the small
 * triangle chips that sit in those corners.
 *
 * @returns {{card: string, chipStart: string, chipEnd: string}} The path data.
 */
function glassPaths() {
  const { width, height, chamfer, radius } = CARD;
  const { size, radius: chipRadius } = CHIP;

  return {
    card: roundedPolygon([
      { x: chamfer, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height - chamfer },
      { x: width - chamfer, y: height },
      { x: 0, y: height },
      { x: 0, y: chamfer },
    ], radius),
    chipStart: roundedPolygon([
      { x: 0, y: 0 },
      { x: size, y: 0 },
      { x: 0, y: size },
    ], chipRadius),
    chipEnd: roundedPolygon([
      { x: width, y: height },
      { x: width - size, y: height },
      { x: width, y: height - size },
    ], chipRadius),
  };
}

/**
 * Draws the OTP card. It only knows how to show a state it is given, so the
 * rules about what happens when live in OtpScene.
 */
export class OtpCard {
  #card;
  #boxes;
  #wires;

  /**
   * @param {HTMLElement} card The card element.
   * @param {typeof import('./content.js').CONTENT} content The card's words.
   */
  constructor(card, content) {
    this.#card = card;
    this.#renderGlass();
    this.#renderCopy(content);
    this.#renderBoxes();
    this.#boxes = [...card.querySelectorAll('.box')];
    this.#wires = [...card.querySelectorAll('.wire')];
  }

  /**
   * Finds a control, for the demo script to aim at.
   *
   * @param {string} id "box-0" to "box-3", or "resend".
   * @returns {HTMLElement|null} The matching element.
   */
  item(id) {
    return this.#card.querySelector(`[data-item="${id}"]`);
  }

  /** @returns {SVGElement[]} The strokes that carry the moving light. */
  get sheenPaths() {
    return [...this.#card.querySelectorAll('.outline__sheen')];
  }

  /**
   * Moves the card to a phase. The boxes glide there through their CSS transition.
   *
   * @param {string} phase A PHASE value.
   * @returns {void}
   */
  setPhase(phase) {
    this.#card.dataset.phase = phase;
    this.#boxes.forEach((box, index) => {
      const { x, y } = boxPosition(phase, index);

      box.style.setProperty('--x', `${x}px`);
      box.style.setProperty('--y', `${y}px`);
    });

    if (phase !== PHASE.GRID) {
      this.#wires.forEach((wire) => wire.classList.remove(WIRE_LIT_CLASS));
      this.#boxes.forEach((box) => box.classList.remove(WIRED_CLASS));
    }
  }

  /**
   * Shows the digits and which box takes the next one.
   *
   * @param {string[]} digits The digits entered so far.
   * @param {number|null} activeIndex The box with the caret, or null for none.
   * @returns {void}
   */
  setDigits(digits, activeIndex) {
    this.#boxes.forEach((box, index) => {
      box.querySelector('.box__digit').textContent = digits[index] ?? '';
      box.classList.toggle(FILLED_CLASS, index < digits.length);
      box.classList.toggle(ACTIVE_CLASS, index === activeIndex);
    });
  }

  /**
   * Draws one of the lines between the grid boxes.
   *
   * @param {number} index Which line, in lighting order.
   * @returns {void}
   */
  lightWire(index) {
    this.#wires[index].classList.add(WIRE_LIT_CLASS);
    this.#boxes[index].classList.add(WIRED_CLASS);
  }

  /**
   * Draws the glass shapes and their edges.
   *
   * @returns {void}
   */
  #renderGlass() {
    const { card, chipStart, chipEnd } = glassPaths();
    const shapes = [card, chipStart, chipEnd];
    const glass = shapes
      .map((path) => `<div class="glass" style="clip-path: path('${path}')"></div>`)
      .join('');
    const edges = shapes.map((path) => `<path class="outline__edge" d="${path}"/>`).join('');
    const sheens = shapes
      .map((path) => `<path class="outline__sheen" pathLength="100" d="${path}"/>`)
      .join('');

    this.#card.insertAdjacentHTML('afterbegin', `${glass}
      <svg class="outline" viewBox="0 0 ${CARD.width} ${CARD.height}" aria-hidden="true">
        ${edges}${sheens}
      </svg>`);
  }

  /**
   * @param {typeof import('./content.js').CONTENT} content The card's words.
   * @returns {void}
   */
  #renderCopy({ entry, done }) {
    const copy = (words, modifier) => `
      <div class="copy copy--${modifier}">
        <h2 class="copy__heading">${words.heading} <span class="copy__accent">${words.headingAccent}</span></h2>
        <p class="copy__body">${words.body}</p>
      </div>`;

    this.#card.querySelector('#copy').innerHTML = copy(entry, 'entry') + copy(done, 'done');
    this.#card.querySelector('#prompt').prepend(`${entry.prompt} `);
    this.#card.querySelector('#resend').textContent = entry.resend;
    this.#card.querySelector('#badgeText').textContent = done.badge;
  }

  /**
   * Draws the digit boxes and the lines that connect them in the grid.
   *
   * @returns {void}
   */
  #renderBoxes() {
    const wires = wireLines()
      .map(({ from, to }) => `<line class="wire" pathLength="1" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"/>`)
      .join('');
    const boxes = Array.from({ length: BOX_COUNT }, (_, index) => `
      <button class="box" type="button" data-item="box-${index}" style="--i:${index}">
        <span class="box__digit"></span>
        <span class="box__caret"></span>
      </button>`).join('');

    this.#card.querySelector('#otp').insertAdjacentHTML('afterbegin', `
      <svg class="wires" viewBox="-300 -200 600 400" aria-hidden="true">${wires}</svg>
      ${boxes}`);
  }
}
