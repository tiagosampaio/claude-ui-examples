import { FACE, garmentArt } from './garment-art.js';

const HANGER = `
  <svg class="hanger" viewBox="0 0 460 700" aria-hidden="true">
    <path class="hanger__hook" d="M230 76C230 50 256 44 256 22C256 4 232 -6 216 4C208 9 204 16 204 24"/>
    <path class="hanger__arm" d="M112 148Q230 56 348 148"/>
  </svg>`;

/**
 * One garment on the rail: its slot, hanger and two printed sides. It only draws
 * the numbers it is given, so all the motion can stay in ClosetScene.
 */
export class GarmentItem {
  #element;
  #swing;
  #turn;
  #sides;

  /**
   * @param {typeof import('./content.js').GARMENTS[number]} garment What to draw.
   * @param {number} index Its position on the rail.
   * @param {string} brand The brand's name, for the prints.
   */
  constructor(garment, index, brand) {
    this.#element = document.createElement('button');
    this.#element.type = 'button';
    this.#element.className = 'item';
    this.#element.dataset.item = `garment-${index}`;
    this.#element.dataset.index = String(index);
    this.#element.setAttribute('aria-label', garment.name);
    this.#element.innerHTML = `
      <div class="item__swing">
        <div class="item__turn">
          ${HANGER}
          <div class="item__sides">
            ${garmentArt(garment.kind, FACE.FRONT, brand)}
            ${garmentArt(garment.kind, FACE.BACK, brand)}
          </div>
        </div>
      </div>`;
    this.#swing = this.#element.querySelector('.item__swing');
    this.#turn = this.#element.querySelector('.item__turn');
    this.#sides = this.#element.querySelector('.item__sides');
  }

  /** @returns {HTMLButtonElement} The garment's root element. */
  get element() {
    return this.#element;
  }

  /**
   * Applies a colourway. CSS fades the fills.
   *
   * @param {{body: string, trim: string, print: string}} color The colours.
   * @returns {void}
   */
  setColor({ body, trim, print }) {
    this.#element.style.setProperty('--body', body);
    this.#element.style.setProperty('--trim', trim);
    this.#element.style.setProperty('--print', print);
  }

  /**
   * Marks whether this is the garment open in the detail view.
   *
   * @param {boolean} isSelected Whether it is.
   * @returns {void}
   */
  setSelected(isSelected) {
    this.#element.classList.toggle('is-selected', isSelected);
  }

  /**
   * Draws one frame.
   *
   * @param {object} pose The garment's pose.
   * @param {number} pose.x Left edge of its slot, in scene pixels.
   * @param {number} pose.width Width of its slot, in scene pixels.
   * @param {number} pose.lift How far it rises, in scene pixels.
   * @param {number} pose.scale Its size, where 1 is its size on the rail.
   * @param {number} pose.turn Rotation away from the camera, in degrees.
   * @param {number} pose.swing Sideways swing from the hook, in degrees.
   * @param {number} pose.flip Rotation of the garment off its hanger, in degrees.
   * @returns {void}
   */
  draw({ x, width, lift, scale, turn, swing, flip }) {
    this.#element.style.transform = `translate3d(${x.toFixed(2)}px, ${(-lift).toFixed(2)}px, 0)`;
    this.#element.style.width = `${width.toFixed(2)}px`;
    this.#swing.style.transform = `rotate(${swing.toFixed(3)}deg) scale(${scale.toFixed(4)})`;
    this.#turn.style.transform = `perspective(1500px) rotateY(${turn.toFixed(2)}deg)`;
    this.#sides.style.transform = `rotateY(${flip.toFixed(2)}deg)`;
  }
}
