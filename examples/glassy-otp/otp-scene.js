import { BOX_COUNT, PHASE } from './box-layout.js';
import { ConfettiCanvas, ConfettiField } from './confetti.js';
import { CardKick, EdgeSheen } from './glass-effects.js';
import { OtpCard } from './otp-card.js';
import { OtpCode } from './otp-code.js';
import { Timeline, VERIFY_STEPS } from './timeline.js';

const MAX_FRAME_SECONDS = 1 / 30;
const BACKSPACE_KEY = 'Backspace';

/** Where the boxes merge, in scene pixels. Matches #otp in styles.css. */
const BURST_ORIGIN = { x: 540, y: 800 };

/**
 * Ties the scene together: typing fills the code, a full code starts the
 * verification on its own, and the timeline walks the card to its success state.
 * The demo script and a real keyboard both go through the same type() path.
 */
export class OtpScene {
  #scene;
  #card;
  #code = new OtpCode(BOX_COUNT);
  #confetti = new ConfettiField();
  #confettiCanvas;
  #timeline = new Timeline();
  #sheen;
  #kick;
  #lastFrame = null;

  /**
   * @param {object} options What the scene needs.
   * @param {HTMLElement} options.scene The scene element.
   * @param {typeof import('./content.js').CONTENT} options.content The card's words.
   */
  constructor({ scene, content }) {
    const cardElement = scene.querySelector('#card');

    this.#scene = scene;
    this.#card = new OtpCard(cardElement, content);
    this.#confettiCanvas = new ConfettiCanvas(scene.querySelector('#confetti'));
    this.#sheen = new EdgeSheen(this.#card.sheenPaths);
    this.#kick = new CardKick(cardElement);

    cardElement.addEventListener('click', (event) => this.#onClick(event));
    window.addEventListener('keydown', (event) => this.#onKey(event));
    requestAnimationFrame((now) => this.#tick(now));
  }

  /**
   * Finds a control by id, for the demo script to aim at.
   *
   * @param {string} id "box-0" to "box-3", or "resend".
   * @returns {HTMLElement} The matching element.
   */
  item(id) {
    const element = this.#card.item(id);

    if (!element) {
      throw new Error(`OTP scene has no item "${id}"`);
    }

    return element;
  }

  /**
   * Enters one digit. The last one starts the verification.
   *
   * @param {string} character The typed character.
   * @returns {void}
   */
  type(character) {
    if (!this.#code.push(character)) {
      return;
    }

    this.#kick.kick();

    if (this.#code.isComplete) {
      this.#card.setDigits(this.#code.digits, null);
      this.#timeline.play(VERIFY_STEPS, (step) => this.#runStep(step));
    } else {
      this.#showCode();
    }
  }

  /**
   * Glides back to the empty card, with the glass light fading out. It ends on
   * the same picture as the first frame, so the video can loop.
   *
   * @returns {void}
   */
  clear() {
    this.#timeline.cancel();
    this.#code.clear();
    this.#sheen.fadeOut();
    this.#card.setPhase(PHASE.ENTRY);
    this.#showCode();
  }

  /**
   * Jumps to the first frame with no animation.
   *
   * @returns {void}
   */
  reset() {
    this.#scene.classList.add('no-anim');
    this.#timeline.cancel();
    this.#code.clear();
    this.#confetti.clear();
    this.#sheen.reset();
    this.#kick.reset();
    this.#card.setPhase(PHASE.ENTRY);
    this.#showCode();
    this.#scene.getBoundingClientRect();
    this.#scene.classList.remove('no-anim');
  }

  /**
   * Applies one step of the verification.
   *
   * @param {{phase?: string, wire?: number}} step The timeline step.
   * @returns {void}
   */
  #runStep({ phase, wire }) {
    if (wire !== undefined) {
      this.#card.lightWire(wire);
      return;
    }

    this.#card.setPhase(phase);

    if (phase === PHASE.VERIFIED) {
      this.#confetti.burst(BURST_ORIGIN);
      this.#kick.kick();
    }
  }

  /**
   * Shows the digits, with the caret in the next empty box.
   *
   * @returns {void}
   */
  #showCode() {
    this.#card.setDigits(this.#code.digits, this.#code.activeIndex);
  }

  /**
   * @param {MouseEvent} event The click event.
   * @returns {void}
   */
  #onClick(event) {
    if (event.target.closest('#resend')) {
      this.clear();
      this.#sheen.reset();
    }
  }

  /**
   * Real keyboard input, for ?manual mode. Backspace also clears a finished card
   * so it can be typed again.
   *
   * @param {KeyboardEvent} event The key event.
   * @returns {void}
   */
  #onKey(event) {
    if (event.key !== BACKSPACE_KEY) {
      this.type(event.key);
    } else if (this.#code.isComplete) {
      this.clear();
      this.#sheen.reset();
    } else {
      this.#code.pop();
      this.#showCode();
    }
  }

  /**
   * Frame loop: advances everything that moves continuously.
   *
   * @param {number} now The frame timestamp in milliseconds.
   * @returns {void}
   */
  #tick(now) {
    const dt = Math.min((now - (this.#lastFrame ?? now)) / 1000, MAX_FRAME_SECONDS);

    this.#lastFrame = now;
    this.#sheen.update(dt);
    this.#kick.update(dt);
    this.#confetti.step(dt);
    this.#confettiCanvas.draw(this.#confetti.particles);
    requestAnimationFrame((next) => this.#tick(next));
  }
}
