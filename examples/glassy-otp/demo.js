import { CONTENT } from './content.js';
import { VERIFY_MS } from './timeline.js';

const TYPE_MS = 210;

/** Clear of the card, where each take starts and ends. */
export const START_POINT = { x: 880, y: 1560 };

/**
 * The take, about 9 seconds. It ends on the same picture it began with (empty
 * card, cursor at START_POINT) so the video loops with no visible cut.
 *
 * Edit the order or durations (in milliseconds) here to re-time the video. The
 * steps after the last digit are in timeline.js.
 *
 * @param {import('../../shared/demo-cursor.js').DemoCursor} cursor The cursor.
 * @param {import('./otp-scene.js').OtpScene} scene The scene.
 * @returns {Promise<void>} Resolves when the take ends.
 */
export async function playDemo(cursor, scene) {
  await cursor.wait(380);

  await cursor.moveTo(scene.item('box-0'), 560);
  await cursor.wait(80);
  await cursor.click();
  await cursor.moveTo(START_POINT, 460);

  for (const digit of CONTENT.code) {
    scene.type(digit);
    await cursor.wait(TYPE_MS);
  }

  // The card verifies itself from here. The hook is the box grid and the burst.
  await cursor.wait(VERIFY_MS - TYPE_MS);
  await cursor.wait(2500);

  // Back to the empty card for the loop.
  scene.clear();
  await cursor.wait(860);
  scene.reset();
}
