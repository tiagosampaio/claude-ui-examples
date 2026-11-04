import { DEFAULT_ACTIVE } from './content.js';

/** Below the clothes, where each take starts and ends. */
export const START_POINT = { x: 860, y: 1540 };

/** The garment the take opens. It needs a second colour, and they all have one. */
const OPENED = 1;

/**
 * Moves onto a garment and pauses so it can swing round.
 *
 * @param {import('../../shared/demo-cursor.js').DemoCursor} cursor The cursor.
 * @param {import('./closet-scene.js').ClosetScene} scene The scene.
 * @param {number} index The garment's index.
 * @param {number} pause How long to stay, in milliseconds.
 * @returns {Promise<void>} Resolves when the pause ends.
 */
async function browse(cursor, scene, index, pause) {
  await cursor.moveTo(scene.item(`garment-${index}`), 620);
  await cursor.wait(pause);
}

/**
 * Moves to a control and clicks it.
 *
 * @param {import('../../shared/demo-cursor.js').DemoCursor} cursor The cursor.
 * @param {import('./closet-scene.js').ClosetScene} scene The scene.
 * @param {string} id The control's id.
 * @returns {Promise<void>} Resolves when the click ends.
 */
async function press(cursor, scene, id) {
  await cursor.moveTo(scene.item(id), 480);
  await cursor.wait(90);
  await cursor.click();
}

/**
 * The take, about 13 seconds. It ends on the same picture it began with (the
 * first garment facing the camera, cursor at START_POINT) so the video loops with
 * no visible cut.
 *
 * Edit the order or durations (in milliseconds) here to re-time the video.
 *
 * @param {import('../../shared/demo-cursor.js').DemoCursor} cursor The cursor.
 * @param {import('./closet-scene.js').ClosetScene} scene The scene.
 * @returns {Promise<void>} Resolves when the take ends.
 */
export async function playDemo(cursor, scene) {
  await cursor.wait(350);

  // The hook: clothes swing round as the cursor runs along the rail.
  await browse(cursor, scene, 2, 420);
  await browse(cursor, scene, 0, 420);
  await browse(cursor, scene, OPENED, 300);

  await cursor.click();
  await cursor.wait(1000);

  await press(cursor, scene, 'tag-1');
  await cursor.wait(800);

  await press(cursor, scene, 'back');
  await cursor.wait(1200);

  await press(cursor, scene, 'front');
  await cursor.wait(800);

  await press(cursor, scene, 'close');
  await cursor.wait(700);

  // Back to the first frame for the loop.
  await browse(cursor, scene, DEFAULT_ACTIVE, 500);
  await cursor.moveTo(START_POINT, 620);
  await cursor.wait(240);
  scene.reset();
}
