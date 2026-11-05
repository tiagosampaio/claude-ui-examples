import { FACE } from './content.js';

const ACTIVE_CLASS = 'is-active';

/**
 * The words and controls around the garments: the caption on the rail, and the
 * name, front/back switch and colour tags in the detail view.
 */
export class DetailPanel {
  #caption;
  #captionText;
  #name;
  #tags;
  #switch;
  #onColor;

  /**
   * @param {HTMLElement} scene The scene element.
   * @param {object} options What the panel shows and reports.
   * @param {typeof import('./content.js').LABELS} options.labels The fixed words.
   * @param {(face: string) => void} options.onFace Called when a side is chosen.
   * @param {(index: number) => void} options.onColor Called when a tag is chosen.
   * @param {() => void} options.onClose Called when the back arrow is clicked.
   */
  constructor(scene, { labels, onFace, onColor, onClose }) {
    this.#caption = scene.querySelector('#caption');
    this.#captionText = scene.querySelector('#captionText');
    this.#name = scene.querySelector('#detailName');
    this.#tags = scene.querySelector('#tags');
    this.#switch = scene.querySelector('#faceSwitch');
    this.#onColor = onColor;

    scene.querySelector('#availability').textContent = labels.availability;
    scene.querySelector('#detailAvailability').textContent = labels.availability;
    scene.querySelector('#faceFront').textContent = labels.front;
    scene.querySelector('#faceBack').textContent = labels.back;

    scene.querySelector('#faceFront').addEventListener('click', () => onFace(FACE.FRONT));
    scene.querySelector('#faceBack').addEventListener('click', () => onFace(FACE.BACK));
    scene.querySelector('#close').addEventListener('click', onClose);
    this.#tags.addEventListener('click', (event) => this.#chooseTag(event));
  }

  /**
   * Shows the words under the garment facing the camera.
   *
   * @param {string} text The caption.
   * @param {number} center Where to center it, in scene pixels.
   * @returns {void}
   */
  showCaption(text, center) {
    this.#captionText.textContent = text;
    this.#caption.style.transform = `translateX(${center.toFixed(2)}px)`;
  }

  /**
   * Fills the detail view with a garment.
   *
   * @param {typeof import('./content.js').GARMENTS[number]} garment The garment.
   * @param {number} colorIndex Its current colour.
   * @returns {void}
   */
  showGarment(garment, colorIndex) {
    this.#name.textContent = garment.name;
    this.#tags.innerHTML = garment.colors
      .map(({ label, tag, ink }, index) => `
        <button class="tag" type="button" data-item="tag-${index}" data-color="${index}"
          style="--tag:${tag};--tag-ink:${ink}">
          <span class="tag__label">${label}</span>
        </button>`)
      .join('');
    this.setColor(colorIndex);
  }

  /**
   * Marks the tag for the current colour.
   *
   * @param {number} index The colour's index.
   * @returns {void}
   */
  setColor(index) {
    [...this.#tags.children].forEach((tag, tagIndex) => {
      tag.classList.toggle(ACTIVE_CLASS, tagIndex === index);
    });
  }

  /**
   * Moves the switch to a side. CSS slides the thumb.
   *
   * @param {string} face A FACE value.
   * @returns {void}
   */
  setFace(face) {
    this.#switch.dataset.face = face;
  }

  /**
   * @param {MouseEvent} event The click event.
   * @returns {void}
   */
  #chooseTag(event) {
    const tag = event.target.closest('.tag');

    if (tag) {
      this.#onColor(Number(tag.dataset.color));
    }
  }
}
