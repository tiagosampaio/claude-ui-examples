import { CORD, PULL_THRESHOLD, SCENE_TOP } from './content.js';
import { DustField } from './dust-field.js';
import { LampLight } from './lamp-light.js';
import { LoginCard } from './login-card.js';
import { Rope } from './rope.js';

const MAX_PULL = 230;
const MAX_FRAME_SECONDS = 1 / 30;
const IDLE_WIND = 34;
const IDLE_WIND_SPEED = 1.1;
const RADIANS_TO_DEGREES = 180 / Math.PI;
const CORD_ID = 'cord';

/**
 * Ties the scene together: dragging the cord drives the rope, releasing it past
 * the threshold flips the lamp, and the lamp's state shows or hides the card. It
 * listens only to ordinary pointer events, so the demo cursor and a real mouse
 * behave the same way.
 */
export class LampScene {
  #scene;
  #stage;
  #rope;
  #light;
  #dust;
  #card;
  #cordLine;
  #handle;
  #isGrabbed = false;
  #time = 0;
  #lastFrame = null;

  /**
   * @param {object} options What the scene needs.
   * @param {HTMLElement} options.scene The scene element.
   * @param {import('../../shared/stage.js').Stage} options.stage The stage.
   * @param {typeof import('./content.js').CONTENT} options.content The card's words.
   */
  constructor({ scene, stage, content }) {
    this.#scene = scene;
    this.#stage = stage;
    this.#rope = new Rope(CORD.anchor, CORD.length);
    this.#light = new LampLight(scene);
    this.#dust = new DustField(scene.querySelector('#dust'));
    this.#card = new LoginCard(scene.querySelector('#card'), content);
    this.#cordLine = scene.querySelector('#cordLine');
    this.#handle = scene.querySelector('#cordHandle');

    this.#handle.addEventListener('pointerdown', () => this.#grab());
    document.addEventListener('pointermove', (event) => this.#drag(event));
    document.addEventListener('pointerup', () => this.#letGo());
    requestAnimationFrame((now) => this.#tick(now));
  }

  /**
   * Finds a control by id, for the demo script to aim at.
   *
   * @param {string} id "cord", a field id, or "submit".
   * @returns {HTMLElement} The matching element.
   */
  item(id) {
    const element = id === CORD_ID ? this.#handle : this.#card.item(id);

    if (!element) {
      throw new Error(`Lamp scene has no item "${id}"`);
    }

    return element;
  }

  /**
   * Adds one character to a card field, as if typed.
   *
   * @param {string} id The field id.
   * @param {string} character The character to add.
   * @returns {void}
   */
  type(id, character) {
    this.#card.type(id, character);
  }

  /**
   * Jumps to the first frame with no animation: dark, cord hanging still.
   *
   * @returns {void}
   */
  reset() {
    this.#scene.classList.add('no-anim');
    this.#isGrabbed = false;
    this.#rope.reset();
    this.#light.reset();
    this.#card.clear();
    this.#time = 0;

    // Forces the browser to apply the jump before transitions come back on.
    void this.#scene.offsetWidth;
    this.#scene.classList.remove('no-anim');
  }

  /** @returns {void} */
  #grab() {
    this.#isGrabbed = true;
  }

  /**
   * Keeps the cord's end under the pointer, within what the cord can reach.
   *
   * @param {PointerEvent} event The pointer event.
   * @returns {void}
   */
  #drag(event) {
    if (!this.#isGrabbed) {
      return;
    }

    const point = this.#stage.toStage({ x: event.clientX, y: event.clientY });
    const lowest = CORD.anchor.y + CORD.length + MAX_PULL;

    this.#rope.pinEnd({ x: point.x, y: Math.min(point.y - SCENE_TOP, lowest) });
  }

  /**
   * Releases the cord, flipping the lamp if it was pulled far enough.
   *
   * @returns {void}
   */
  #letGo() {
    if (!this.#isGrabbed) {
      return;
    }

    const wasPulledFarEnough = this.#rope.pull >= PULL_THRESHOLD;

    this.#isGrabbed = false;
    this.#rope.pinEnd(null);

    if (wasPulledFarEnough) {
      this.#light.toggle();

      if (this.#light.isOn) {
        this.#card.clear();
      }
    }
  }

  /**
   * Shared frame loop for every effect.
   *
   * @param {number} now The frame timestamp in milliseconds.
   * @returns {void}
   */
  #tick(now) {
    const elapsed = this.#lastFrame === null ? 0 : (now - this.#lastFrame) / 1000;
    const dt = Math.min(elapsed, MAX_FRAME_SECONDS);

    this.#lastFrame = now;
    this.#time += dt;
    this.#rope.step(dt, Math.sin(this.#time * IDLE_WIND_SPEED) * IDLE_WIND);
    this.#light.update(dt);
    this.#dust.update(dt);
    this.#drawCord();
    requestAnimationFrame((next) => this.#tick(next));
  }

  /**
   * Draws a smooth line through the rope and hangs the knob from its end. Using
   * each point's midpoint with the next keeps the curve free of corners.
   *
   * @returns {void}
   */
  #drawCord() {
    const { points, end } = this.#rope;
    const [first, ...rest] = points;
    const curve = rest.slice(0, -1).map((point, index) => {
      const next = rest[index + 1];

      return `Q${point.x} ${point.y} ${(point.x + next.x) / 2} ${(point.y + next.y) / 2}`;
    });
    const beforeEnd = points.at(-2);
    const angle = Math.atan2(end.y - beforeEnd.y, end.x - beforeEnd.x) * RADIANS_TO_DEGREES - 90;

    this.#cordLine.setAttribute('d', `M${first.x} ${first.y}${curve.join('')}L${end.x} ${end.y}`);
    this.#handle.style.transform =
      `translate3d(${end.x}px, ${end.y + 16}px, 0) rotate(${angle.toFixed(2)}deg)`;
  }
}
