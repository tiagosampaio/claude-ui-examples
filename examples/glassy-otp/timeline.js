import { PHASE } from './box-layout.js';

/**
 * What happens after the last digit, in milliseconds. A step either moves the
 * card to a new phase or lights one of the lines between the grid boxes. Edit
 * these to re-time the verification.
 */
export const VERIFY_STEPS = [
  { at: 240, phase: PHASE.GRID },
  { at: 880, wire: 0 },
  { at: 1120, wire: 1 },
  { at: 1360, wire: 2 },
  { at: 1600, wire: 3 },
  { at: 2240, phase: PHASE.MERGE },
  { at: 2720, phase: PHASE.VERIFIED },
];

/** When the last step fires. */
export const VERIFY_MS = VERIFY_STEPS.at(-1).at;

/**
 * Runs a list of timed steps and can drop whatever hasn't fired yet, so a
 * restart can't be overwritten by a step from the previous take.
 */
export class Timeline {
  #timers = [];

  /**
   * Starts the steps, replacing any that are still waiting.
   *
   * @template {{at: number}} Step
   * @param {Step[]} steps The steps to run.
   * @param {(step: Step) => void} run Called as each step comes due.
   * @returns {void}
   */
  play(steps, run) {
    this.cancel();
    this.#timers = steps.map((step) => setTimeout(() => run(step), step.at));
  }

  /**
   * Drops every step that hasn't fired yet.
   *
   * @returns {void}
   */
  cancel() {
    this.#timers.forEach(clearTimeout);
    this.#timers = [];
  }
}
