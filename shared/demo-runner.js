import { DemoCancelled } from './demo-cursor.js';

const RESTART_KEY = ' ';
const MANUAL_PARAM = 'manual';

/**
 * Plays an example's script on a loop, ready to screen record.
 *
 * - Press Space to restart from the first frame, which is handy just after
 *   hitting record.
 * - Add ?manual to the URL to hide the fake cursor and use a real mouse.
 *
 * @param {object} options The demo to run.
 * @param {import('./demo-cursor.js').DemoCursor} options.cursor The fake cursor.
 * @param {() => void} options.reset Puts the example back in its first frame.
 * @param {() => Promise<void>} options.play Performs the script once.
 * @returns {Promise<void>} Only settles if the demo fails or in manual mode.
 */
export async function runDemo({ cursor, reset, play }) {
  if (new URLSearchParams(window.location.search).has(MANUAL_PARAM)) {
    document.body.classList.add('is-manual');
    cursor.disable();
    reset();
    return;
  }

  window.addEventListener('keydown', (event) => {
    if (event.key === RESTART_KEY) {
      event.preventDefault();
      cursor.cancel();
    }
  });

  reset();

  for (;;) {
    try {
      await play();
    } catch (error) {
      if (!(error instanceof DemoCancelled)) {
        console.error('Demo stopped:', error);
        return;
      }

      reset();
    }
  }
}
