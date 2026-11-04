import { stepSpring } from '../../shared/spring.js';
import { DetailPanel } from './detail-panel.js';
import { FACE } from './garment-art.js';
import { GarmentItem } from './garment-item.js';
import { detailLayout, EDGE_ON_DEGREES, mix, railLayout } from './rail-layout.js';

const MAX_FRAME_SECONDS = 1 / 30;
const FOCUS_SPRING = { stiffness: 130, damping: 17 };
const DETAIL_SPRING = { stiffness: 80, damping: 15 };
const FLIP_SPRING = { stiffness: 62, damping: 11 };
const SWING_PER_SPEED = 1.5;
const MAX_SWING = 7;
const DETAIL_SCALE = 1.2;
const DETAIL_LIFT = 60;
const FULL_TURN = 180;
const CAPTION_MARGIN = 230;
const SCENE_WIDTH = 1080;
const DETAIL_CLASS = 'is-detail';

/** @returns {{value: number, velocity: number}} A spring at rest. */
function springAt(value) {
  return { value, velocity: 0 };
}

/**
 * Ties the scene together. Hovering turns a garment to the camera, clicking opens
 * it, and the detail view changes its side and colour. Every moving number is a
 * spring advanced here, which keeps the motion in step when it's interrupted. It
 * listens only to ordinary pointer events, so the demo cursor and a real mouse
 * behave the same way.
 */
export class ClosetScene {
  #scene;
  #garments;
  #defaultActive;
  #items;
  #panel;
  #active;
  #selected = null;
  #face = FACE.FRONT;
  #colors;
  #focus;
  #detail = springAt(0);
  #flip = springAt(0);
  #lastFrame = null;

  /**
   * @param {object} options What the scene needs.
   * @param {HTMLElement} options.scene The scene element.
   * @param {string} options.brand The brand's name.
   * @param {typeof import('./content.js').GARMENTS} options.garments The clothes.
   * @param {typeof import('./content.js').LABELS} options.labels The fixed words.
   * @param {number} options.defaultActive The garment facing the camera at first.
   */
  constructor({ scene, brand, garments, labels, defaultActive }) {
    const rack = scene.querySelector('#rack');

    this.#scene = scene;
    this.#garments = garments;
    this.#defaultActive = defaultActive;
    this.#items = garments.map((garment, index) => new GarmentItem(garment, index, brand));
    this.#items.forEach((item) => rack.append(item.element));
    this.#panel = new DetailPanel(scene, {
      labels,
      onFace: (face) => this.#setFace(face),
      onColor: (index) => this.#setColor(index),
      onClose: () => this.close(),
    });
    scene.querySelector('#brand').textContent = brand;

    rack.addEventListener('pointermove', (event) => this.#hover(event));
    rack.addEventListener('click', (event) => this.#open(event));
    this.reset();
    requestAnimationFrame((now) => this.#tick(now));
  }

  /**
   * Finds a control by id, for the demo script to aim at.
   *
   * @param {string} id "garment-0", "tag-0", "front", "back" or "close".
   * @returns {HTMLElement} The matching element.
   */
  item(id) {
    const element = this.#scene.querySelector(`[data-item="${id}"]`);

    if (!element) {
      throw new Error(`Closet scene has no item "${id}"`);
    }

    return element;
  }

  /**
   * Leaves the detail view and returns the garment to its first colour and front
   * side, so the rail is back to how it started.
   *
   * @returns {void}
   */
  close() {
    if (this.#selected === null) {
      return;
    }

    this.#items[this.#selected].setSelected(false);
    this.#selected = null;
    this.#scene.classList.remove(DETAIL_CLASS);
    this.#setFace(FACE.FRONT);
    this.#colors = this.#garments.map(() => 0);
    this.#applyColors();
  }

  /**
   * Jumps to the first frame with no animation.
   *
   * @returns {void}
   */
  reset() {
    this.#scene.classList.add('no-anim');
    this.close();
    this.#active = this.#defaultActive;
    this.#focus = this.#garments.map((_, index) => springAt(index === this.#active ? 1 : 0));
    this.#detail = springAt(0);
    this.#flip = springAt(0);
    this.#setFace(FACE.FRONT);
    this.#colors = this.#garments.map(() => 0);
    this.#applyColors();
    this.#draw();
    this.#scene.getBoundingClientRect();
    this.#scene.classList.remove('no-anim');
  }

  /**
   * @param {PointerEvent} event The pointer event.
   * @returns {void}
   */
  #hover(event) {
    const item = event.target.closest('.item');

    if (item && this.#selected === null) {
      this.#active = Number(item.dataset.index);
    }
  }

  /**
   * @param {MouseEvent} event The click event.
   * @returns {void}
   */
  #open(event) {
    const item = event.target.closest('.item');

    if (!item || this.#selected !== null) {
      return;
    }

    this.#selected = Number(item.dataset.index);
    this.#active = this.#selected;
    this.#items[this.#selected].setSelected(true);
    this.#panel.showGarment(this.#garments[this.#selected], this.#colors[this.#selected]);
    this.#scene.classList.add(DETAIL_CLASS);
  }

  /**
   * @param {string} face A FACE value.
   * @returns {void}
   */
  #setFace(face) {
    this.#face = face;
    this.#panel.setFace(face);
  }

  /**
   * @param {number} index The colour's index for the open garment.
   * @returns {void}
   */
  #setColor(index) {
    this.#colors[this.#selected] = index;
    this.#panel.setColor(index);
    this.#applyColors();
  }

  /**
   * Gives every garment its current colourway.
   *
   * @returns {void}
   */
  #applyColors() {
    this.#items.forEach((item, index) => {
      item.setColor(this.#garments[index].colors[this.#colors[index]]);
    });
  }

  /**
   * Advances every spring by one step.
   *
   * @param {number} dt Elapsed time in seconds.
   * @returns {void}
   */
  #advance(dt) {
    this.#focus = this.#focus.map((spring, index) => (
      stepSpring(spring, index === this.#active ? 1 : 0, dt, FOCUS_SPRING)
    ));
    this.#detail = stepSpring(this.#detail, this.#selected === null ? 0 : 1, dt, DETAIL_SPRING);
    this.#flip = stepSpring(this.#flip, this.#face === FACE.BACK ? 1 : 0, dt, FLIP_SPRING);
  }

  /**
   * Turns the springs into a pose for every garment, blending between the rail
   * and the detail view.
   *
   * @returns {void}
   */
  #draw() {
    const open = Math.min(Math.max(this.#detail.value, 0), 1.05);
    const rail = railLayout(this.#focus.map(({ value }) => value));
    const detail = detailLayout(this.#active, this.#items.length);

    this.#items.forEach((item, index) => {
      const facing = Math.min(Math.max(this.#focus[index].value, 0), 1);
      const isChosen = index === this.#active;
      const swing = this.#focus[index].velocity * SWING_PER_SPEED;

      item.draw({
        x: mix(rail[index].x, detail[index].x, open),
        width: mix(rail[index].width, detail[index].width, open),
        lift: isChosen ? DETAIL_LIFT * open : 0,
        scale: isChosen ? mix(1, DETAIL_SCALE, open) : 1,
        turn: (1 - facing) * EDGE_ON_DEGREES,
        swing: Math.max(-MAX_SWING, Math.min(MAX_SWING, swing)),
        flip: isChosen ? this.#flip.value * FULL_TURN : 0,
      });
    });

    this.#drawCaption(rail[this.#active]);
  }

  /**
   * Keeps the caption under the garment facing the camera.
   *
   * @param {{x: number, width: number}} slot That garment's slot on the rail.
   * @returns {void}
   */
  #drawCaption(slot) {
    const garment = this.#garments[this.#active];
    const { label } = garment.colors[this.#colors[this.#active]];
    const center = slot.x + slot.width / 2;
    const kept = Math.max(CAPTION_MARGIN, Math.min(SCENE_WIDTH - CAPTION_MARGIN, center));

    this.#panel.showCaption(`${garment.name} — ${label}`, kept);
  }

  /**
   * Frame loop.
   *
   * @param {number} now The frame timestamp in milliseconds.
   * @returns {void}
   */
  #tick(now) {
    const dt = Math.min((now - (this.#lastFrame ?? now)) / 1000, MAX_FRAME_SECONDS);

    this.#lastFrame = now;
    this.#advance(dt);
    this.#draw();
    requestAnimationFrame((next) => this.#tick(next));
  }
}
