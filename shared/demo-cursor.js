const ARROW_SVG = `
  <svg class="demo-cursor__glyph demo-cursor__glyph--arrow" viewBox="0 0 24 24">
    <path d="M4 2v18l5-4.5 3.5 6.5 3-1.5-3.5-6h6.5z"
      fill="#fff" stroke="#111" stroke-width="1.3" stroke-linejoin="round"/>
  </svg>`;

const HAND_SVG = `
  <svg class="demo-cursor__glyph demo-cursor__glyph--hand" viewBox="0 0 24 24"
    fill="#fff" stroke="#111" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-6-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15V4a2 2 0 1 1 4 0v5a2 2 0 1 1 3 1 2 2 0 1 1 4 1z"/>
  </svg>`;

const PRESS_MS = 90;
const DEFAULT_ARC = 28;

/** Raised to unwind a running demo when it is restarted. */
export class DemoCancelled extends Error {}

/**
 * Smooth start and stop for cursor travel.
 *
 * @param {number} t Progress from 0 to 1.
 * @returns {number} Eased progress.
 */
export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/**
 * A scripted mouse cursor for perfectly repeatable takes.
 *
 * It sends real pointermove and click events to whatever sits under it, so an
 * example only needs ordinary event handlers: the same code responds to this
 * cursor and to a real mouse. All demo timing goes through this class, which
 * means cancelling the current step stops the whole script.
 */
export class DemoCursor {
  #stage;
  #element;
  #position = { x: 0, y: 0 };
  #motion = null;
  #enabled = true;

  /**
   * @param {import('./stage.js').Stage} stage The stage to move on.
   */
  constructor(stage) {
    this.#stage = stage;
    this.#element = document.createElement('div');
    this.#element.className = 'demo-cursor';
    this.#element.innerHTML = ARROW_SVG + HAND_SVG;
    stage.element.append(this.#element);
    requestAnimationFrame((now) => this.#tick(now));
  }

  /**
   * Stops sending events for good, so a real mouse can take over.
   *
   * @returns {void}
   */
  disable() {
    this.#enabled = false;
  }

  /**
   * Places the cursor immediately.
   *
   * @param {{x: number, y: number}} point A position in stage pixels.
   * @returns {void}
   */
  jumpTo(point) {
    this.#position = { ...point };
    this.#render();
  }

  /**
   * Glides to a point or to the center of an element. An element's center is
   * re-measured every frame, so the cursor still lands on it if layout shifts
   * during the move.
   *
   * @param {Element|{x: number, y: number}} target Where to go.
   * @param {number} duration Travel time in milliseconds.
   * @param {number} [arc] How far the path curves, in stage pixels.
   * @returns {Promise<void>} Resolves on arrival.
   */
  moveTo(target, duration, arc = DEFAULT_ARC) {
    const start = { ...this.#position };

    return this.#run(duration, (progress) => {
      const end = this.#resolve(target);
      const eased = easeInOutCubic(progress);
      const bend = Math.sin(Math.PI * progress) * arc;

      this.#position = {
        x: start.x + (end.x - start.x) * eased + bend,
        y: start.y + (end.y - start.y) * eased,
      };
    });
  }

  /**
   * Holds still. Pointer events keep firing, so hover state stays accurate.
   *
   * @param {number} duration Pause in milliseconds.
   * @returns {Promise<void>} Resolves when the pause ends.
   */
  wait(duration) {
    return this.#run(duration);
  }

  /**
   * Holds the button down on whatever is under the cursor, for drags.
   *
   * @returns {void}
   */
  press() {
    this.#element.classList.add('is-pressed');
    this.#dispatch(new PointerEvent('pointerdown', this.#eventInit()));
  }

  /**
   * Lets the button back up.
   *
   * @returns {void}
   */
  release() {
    this.#dispatch(new PointerEvent('pointerup', this.#eventInit()));
    this.#element.classList.remove('is-pressed');
  }

  /**
   * Presses and releases on whatever is under the cursor.
   *
   * @returns {Promise<void>} Resolves when the button is back up.
   */
  async click() {
    this.press();
    await this.wait(PRESS_MS);
    this.#dispatch(new MouseEvent('click', this.#eventInit()));
    this.release();
    await this.wait(PRESS_MS);
  }

  /**
   * Aborts the running step, which rejects with DemoCancelled.
   *
   * @returns {void}
   */
  cancel() {
    const motion = this.#motion;

    this.#motion = null;
    this.#element.classList.remove('is-pressed');
    motion?.reject(new DemoCancelled());
  }

  /**
   * Starts a timed step that the frame loop advances.
   *
   * @param {number} duration Length in milliseconds.
   * @param {(progress: number) => void} [onFrame] Called with progress 0 to 1.
   * @returns {Promise<void>} Resolves when the step ends.
   */
  #run(duration, onFrame) {
    return new Promise((resolve, reject) => {
      this.#motion = { startedAt: null, duration, onFrame, resolve, reject };
    });
  }

  /**
   * @param {Element|{x: number, y: number}} target A point or an element.
   * @returns {{x: number, y: number}} The target position in stage pixels.
   */
  #resolve(target) {
    if (!(target instanceof Element)) {
      return target;
    }

    const rect = target.getBoundingClientRect();

    return this.#stage.toStage({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  }

  /**
   * Frame loop: advances the current step, then reports the pointer position.
   *
   * @param {number} now The frame timestamp in milliseconds.
   * @returns {void}
   */
  #tick(now) {
    if (!this.#enabled) {
      return;
    }

    const motion = this.#motion;

    if (motion) {
      motion.startedAt ??= now;

      const progress = motion.duration > 0
        ? Math.min((now - motion.startedAt) / motion.duration, 1)
        : 1;

      motion.onFrame?.(progress);

      if (progress === 1) {
        this.#motion = null;
        motion.resolve();
      }
    }

    this.#render();
    requestAnimationFrame((next) => this.#tick(next));
  }

  /**
   * Draws the cursor and tells the element under it where the pointer is.
   *
   * @returns {void}
   */
  #render() {
    const { x, y } = this.#position;

    this.#element.style.transform = `translate3d(${x}px, ${y}px, 0)`;

    const under = this.#elementUnder();

    this.#element.classList.toggle('is-pointer', Boolean(under?.closest('button, label')));
    this.#dispatch(new PointerEvent('pointermove', this.#eventInit()));
  }

  /** @returns {Element|null} The topmost element under the cursor. */
  #elementUnder() {
    const { x, y } = this.#stage.toClient(this.#position);

    return document.elementFromPoint(x, y);
  }

  /** @returns {{bubbles: boolean, clientX: number, clientY: number}} Event settings. */
  #eventInit() {
    const { x, y } = this.#stage.toClient(this.#position);

    return { bubbles: true, clientX: x, clientY: y };
  }

  /**
   * Sends an event to the element under the cursor.
   *
   * @param {Event} event The event to send.
   * @returns {void}
   */
  #dispatch(event) {
    this.#elementUnder()?.dispatchEvent(event);
  }
}
