import { stepSpring } from '../../shared/spring.js';
import { dropExitPose, dropPose } from './drop-path.js';
import { FooterView } from './footer-view.js';
import { surfacePath, waveHeightFor } from './liquid-surface.js';

const MAX_FRAME_SECONDS = 1 / 30;
const SCENE_WIDTH = 1080;
const RISE_SPRING = { stiffness: 22, damping: 7.5 };
/** The glass in scene pixels. Matches .glass in styles.css. */
const GLASS = { left: 40, top: 380, width: 1000, height: 980, radius: 44 };
const REVEAL_LEVEL = 0.75;
const DROP_DELAY = 0.45;
const DROP_RADIUS = 32;
const DROP_START = { x: 230, y: -80 };
const DROP_LANDING = { x: 230, y: GLASS.top - DROP_RADIUS };
const DOT_GAP = 8;
/** How far the top of a lowercase letter sits above the line's middle, in ems. */
const X_HEIGHT_ABOVE_MIDDLE = 0.182;
const NIGHT_CLASS = 'is-night';
const RISEN_CLASS = 'is-risen';

/**
 * Ties the scene together. Pouring raises the glass with a spring and lets the
 * drop go, and the drop's resting place is measured from the real wordmark.
 * Hovering a link ripples the glass, and the toggle changes the time of day. It
 * listens only to ordinary pointer events, so the demo cursor and a real mouse
 * behave the same way.
 */
export class LiquidScene {
  #scene;
  #footer;
  #clip;
  #edge;
  #drop;
  #level = { value: 0, velocity: 0 };
  #goal = 0;
  #time = 0;
  #sincePour = null;
  #sinceDrain = null;
  #dropTarget = { x: 0, y: 0 };
  #activeLink = null;
  #lastFrame = null;

  /**
   * @param {object} options What the scene needs.
   * @param {HTMLElement} options.scene The scene element.
   * @param {typeof import('./content.js').CONTENT} options.content The words.
   * @param {{day: string, night: string}} options.rooms CSS backgrounds for the room.
   */
  constructor({ scene, content, rooms }) {
    this.#scene = scene;
    this.#footer = new FooterView(scene.querySelector('#footer'), content);
    this.#clip = scene.querySelector('#glass');
    this.#edge = scene.querySelector('#edge');
    this.#drop = scene.querySelector('#drop');
    scene.style.setProperty('--room-day', rooms.day);
    scene.style.setProperty('--room-night', rooms.night);

    const footer = scene.querySelector('#footer');

    footer.addEventListener('pointermove', (event) => this.#hover(event));
    footer.addEventListener('click', (event) => this.#click(event));
    this.reset();
    requestAnimationFrame((now) => this.#tick(now));
  }

  /**
   * Finds a control by id, for the demo script to aim at.
   *
   * @param {string} id "link-0" and up, or "theme".
   * @returns {HTMLElement} The matching element.
   */
  item(id) {
    const element = this.#footer.item(id);

    if (!element) {
      throw new Error(`Liquid scene has no item "${id}"`);
    }

    return element;
  }

  /**
   * Raises the glass and lets the drop go.
   *
   * @returns {void}
   */
  pour() {
    this.#dropTarget = this.#measureDot();
    this.#goal = 1;
    this.#sincePour = -DROP_DELAY;
    this.#sinceDrain = null;
  }

  /**
   * Lets the glass run back down and the drop fall away.
   *
   * @returns {void}
   */
  drain() {
    this.#goal = 0;
    this.#sinceDrain = 0;
    this.#setActiveLink(null);
  }

  /**
   * Jumps to the first frame with no animation: daytime, an empty blurred room.
   *
   * @returns {void}
   */
  reset() {
    this.#scene.classList.add('no-anim');
    this.#scene.classList.remove(NIGHT_CLASS, RISEN_CLASS);
    this.#level = { value: 0, velocity: 0 };
    this.#goal = 0;
    this.#sincePour = null;
    this.#sinceDrain = null;
    this.#setActiveLink(null);
    this.#footer.clearRipples();
    this.#draw(0);
    this.#scene.getBoundingClientRect();
    this.#scene.classList.remove('no-anim');
  }

  /**
   * Finds the dot's place above the dotless "i" by measuring the real letter, so
   * it stays right if the words or font change.
   *
   * @returns {{x: number, y: number}} The drop's center, in scene pixels.
   */
  #measureDot() {
    const letter = this.#footer.dotlessLetter;
    const sceneBox = this.#scene.getBoundingClientRect();
    const box = letter.getBoundingClientRect();
    const scale = sceneBox.width / SCENE_WIDTH;
    const style = getComputedStyle(letter);
    const fontSize = parseFloat(style.fontSize);
    const middle = (this.#footer.wordmarkTop - sceneBox.top) / scale + parseFloat(style.lineHeight) / 2;

    return {
      x: (box.left + box.width / 2 - sceneBox.left) / scale,
      y: middle - fontSize * X_HEIGHT_ABOVE_MIDDLE - DROP_RADIUS - DOT_GAP,
    };
  }

  /**
   * @param {PointerEvent} event The pointer event.
   * @returns {void}
   */
  #hover(event) {
    const link = event.target.closest('.link');

    if (link === this.#activeLink) {
      return;
    }

    this.#setActiveLink(link);

    if (link) {
      const box = this.#clip.getBoundingClientRect();
      const scale = box.width / GLASS.width;

      this.#footer.ripple({
        x: (event.clientX - box.left) / scale,
        y: (event.clientY - box.top) / scale,
      });
    }
  }

  /**
   * @param {MouseEvent} event The click event.
   * @returns {void}
   */
  #click(event) {
    if (event.target.closest('.toggle')) {
      this.#scene.classList.toggle(NIGHT_CLASS);
    }
  }

  /**
   * @param {Element|null} link The link under the pointer.
   * @returns {void}
   */
  #setActiveLink(link) {
    this.#activeLink = link;
    this.#footer.setActiveLink(link);
  }

  /**
   * Draws the glass, the room's blur and the drop for this frame.
   *
   * @param {number} dt Elapsed time in seconds.
   * @returns {void}
   */
  #draw(dt) {
    const level = Math.min(Math.max(this.#level.value, 0), 1);
    const path = surfacePath({
      width: GLASS.width,
      height: GLASS.height,
      level,
      waveHeight: waveHeightFor(this.#level.velocity),
      time: this.#time,
      radius: GLASS.radius,
    });

    this.#clip.style.clipPath = `path('${path}')`;
    this.#edge.setAttribute('d', path);
    this.#scene.style.setProperty('--level', level.toFixed(3));
    this.#scene.classList.toggle(RISEN_CLASS, this.#goal === 1 && level > REVEAL_LEVEL);
    this.#drawDrop(dt);
  }

  /**
   * @param {number} dt Elapsed time in seconds.
   * @returns {void}
   */
  #drawDrop(dt) {
    const path = { start: DROP_START, landing: DROP_LANDING, target: this.#dropTarget };
    let pose = { ...DROP_START, squash: 0 };

    if (this.#sinceDrain !== null) {
      this.#sinceDrain += dt;
      pose = dropExitPose(this.#sinceDrain, this.#dropTarget);
    } else if (this.#sincePour !== null) {
      this.#sincePour += dt;
      pose = dropPose(this.#sincePour, path);
    }

    const scaleX = 1 + pose.squash;
    const scaleY = 1 - pose.squash;

    this.#drop.style.transform = `translate3d(${pose.x.toFixed(1)}px, ${pose.y.toFixed(1)}px, 0) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`;
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
    this.#time += dt;
    this.#level = stepSpring(this.#level, this.#goal, dt, RISE_SPRING);
    this.#draw(dt);
    requestAnimationFrame((next) => this.#tick(next));
  }
}
