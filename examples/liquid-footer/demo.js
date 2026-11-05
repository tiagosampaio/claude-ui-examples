/** Above the glass, where each take starts and ends. */
export const START_POINT = { x: 900, y: 560 };

/**
 * Moves onto a link and stays while its ripple spreads.
 *
 * @param {import('../../shared/demo-cursor.js').DemoCursor} cursor The cursor.
 * @param {import('./liquid-scene.js').LiquidScene} scene The scene.
 * @param {number} index The link's number, counted through the columns.
 * @param {number} pause How long to stay, in milliseconds.
 * @returns {Promise<void>} Resolves when the pause ends.
 */
async function hoverLink(cursor, scene, index, pause) {
  await cursor.moveTo(scene.item(`link-${index}`), 460);
  await cursor.wait(pause);
}

/**
 * Moves to the time-of-day switch and clicks it.
 *
 * @param {import('../../shared/demo-cursor.js').DemoCursor} cursor The cursor.
 * @param {import('./liquid-scene.js').LiquidScene} scene The scene.
 * @returns {Promise<void>} Resolves when the click ends.
 */
async function toggleTheme(cursor, scene) {
  await cursor.moveTo(scene.item('theme'), 560);
  await cursor.wait(120);
  await cursor.click();
}

/**
 * The take, about 13 seconds. It ends on the same picture it began with (an empty
 * blurred room, cursor at START_POINT) so the video loops with no visible cut.
 *
 * Edit the order or durations (in milliseconds) here to re-time the video.
 *
 * @param {import('../../shared/demo-cursor.js').DemoCursor} cursor The cursor.
 * @param {import('./liquid-scene.js').LiquidScene} scene The scene.
 * @returns {Promise<void>} Resolves when the take ends.
 */
export async function playDemo(cursor, scene) {
  await cursor.wait(350);

  // The hook: the glass pours in and the drop lands on the wordmark.
  scene.pour();
  await cursor.wait(2900);

  await hoverLink(cursor, scene, 0, 420);
  await hoverLink(cursor, scene, 1, 420);
  await hoverLink(cursor, scene, 2, 620);

  await toggleTheme(cursor, scene);
  await cursor.wait(1300);

  await hoverLink(cursor, scene, 10, 800);

  await toggleTheme(cursor, scene);
  await cursor.wait(800);

  // Back to the first frame for the loop.
  await cursor.moveTo(START_POINT, 520);
  scene.drain();
  await cursor.wait(1700);
  scene.reset();
}
