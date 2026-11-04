import { DockMagnifier } from './dock-magnifier.js';
import { RowTooltip } from './row-tooltip.js';
import { renderSidebar } from './sidebar-view.js';
import { SpringPill } from './spring-pill.js';

const ACTIVE_SPRING = { stiffness: 210, damping: 19 };
const HOVER_SPRING = { stiffness: 520, damping: 40 };
const MAX_FRAME_SECONDS = 1 / 30;
const TOGGLE_ID = 'toggle';
const NIGHT_ID = 'night';
const PROJECTS_ID = 'projects';

/**
 * Ties the sidebar together: owns its state and passes pointer input on to the
 * smaller effects (dock magnifier, spring pills, tooltip). It listens only to
 * ordinary pointer and click events, so the demo cursor and a real mouse behave
 * the same way.
 */
export class Sidebar {
  #root;
  #scene;
  #content;
  #defaultActive;
  #magnifier;
  #activePill;
  #hoverPill;
  #tooltip;
  #nav;
  #lastFrame = null;

  /**
   * @param {object} options What the sidebar needs.
   * @param {HTMLElement} options.root The element to render into.
   * @param {HTMLElement} options.scene The scene behind it, dimmed in night mode.
   * @param {import('../../shared/stage.js').Stage} options.stage The stage.
   * @param {typeof import('./content.js').CONTENT} options.content The content.
   * @param {string} options.defaultActive The row selected on reset.
   */
  constructor({ root, scene, stage, content, defaultActive }) {
    this.#root = root;
    this.#scene = scene;
    this.#content = content;
    this.#defaultActive = defaultActive;
    this.#root.innerHTML = renderSidebar(content);
    this.#nav = root.querySelector('.nav');
    this.#magnifier = new DockMagnifier(
      [...root.querySelectorAll('.dock-item')],
      () => stage.scale,
    );
    this.#activePill = new SpringPill(root.querySelector('.pill--active'), ACTIVE_SPRING);
    this.#hoverPill = new SpringPill(root.querySelector('.pill--hover'), HOVER_SPRING);
    this.#tooltip = new RowTooltip(root.querySelector('.tooltip'));

    document.addEventListener('pointermove', (event) => this.#onPointerMove(event));
    this.#root.addEventListener('click', (event) => this.#onClick(event));
    requestAnimationFrame((now) => this.#tick(now));
  }

  /**
   * Finds a control by id, for the demo script to aim at.
   *
   * @param {string} id A row id from the content config, or "toggle".
   * @returns {HTMLElement} The matching element.
   */
  item(id) {
    const element = this.#root.querySelector(`[data-item="${id}"]`);

    if (!element) {
      throw new Error(`Sidebar has no item "${id}"`);
    }

    return element;
  }

  /**
   * Jumps to the first frame with no animation, so restarts look clean.
   *
   * @returns {void}
   */
  reset() {
    const animated = [this.#root, this.#scene];

    animated.forEach((element) => element.classList.add('no-anim'));
    this.#root.classList.remove('is-expanded');
    this.#root.classList.add('projects-open');
    this.#scene.classList.remove('is-night');
    this.#magnifier.reset();
    this.#hoverPill.setTarget(null);
    this.#tooltip.setTarget(null);
    this.#setActive(this.#defaultActive);
    this.#activePill.snap();

    // Forces the browser to apply the jump before transitions come back on.
    void this.#root.offsetWidth;
    animated.forEach((element) => element.classList.remove('no-anim'));
  }

  /** @returns {boolean} Whether the sidebar is open. */
  get #isExpanded() {
    return this.#root.classList.contains('is-expanded');
  }

  /**
   * @param {string} id The row to select.
   * @returns {void}
   */
  #setActive(id) {
    this.#activePill.setTarget(this.item(id));
  }

  /**
   * Routes the pointer to the effect that suits the current state: tooltips and
   * magnification when collapsed, the hover pill when expanded.
   *
   * @param {PointerEvent} event The pointer event.
   * @returns {void}
   */
  #onPointerMove(event) {
    const inside = this.#root.contains(event.target);
    const hovered = inside ? event.target.closest('[data-hover]') : null;

    if (this.#isExpanded) {
      this.#magnifier.setPointer(null);
      this.#tooltip.setTarget(null);
      this.#hoverPill.setTarget(this.#nav.contains(hovered) ? hovered : null);
      return;
    }

    this.#magnifier.setPointer(inside ? event.clientY : null);
    this.#tooltip.setTarget(hovered);
    this.#hoverPill.setTarget(null);
  }

  /**
   * @param {MouseEvent} event The click event.
   * @returns {void}
   */
  #onClick(event) {
    const id = event.target.closest('[data-item]')?.dataset.item;

    if (id === TOGGLE_ID) {
      this.#root.classList.toggle('is-expanded');
    } else if (id === NIGHT_ID) {
      this.#scene.classList.toggle('is-night');
    } else if (id === PROJECTS_ID) {
      this.#root.classList.toggle('projects-open');
    } else if (this.#isNavRow(id)) {
      this.#setActive(id);
    }
  }

  /**
   * @param {string|undefined} id A clicked item's id.
   * @returns {boolean} Whether it is a row that can be selected.
   */
  #isNavRow(id) {
    return this.#content.sections.some(
      (section) => section.rows.some((row) => row.id === id),
    );
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
    this.#magnifier.update(dt);
    this.#activePill.update(dt);
    this.#hoverPill.update(dt);
    this.#tooltip.update();
    requestAnimationFrame((next) => this.#tick(next));
  }
}
