import { CONTENT, CORD, PULL_THRESHOLD, SCENE_TOP } from './content.js';

const TYPE_MS = 42;
const PULL_DISTANCE = PULL_THRESHOLD + 50;

/** In the empty dark, where each take starts and ends. */
export const START_POINT = { x: 700, y: 1000 };

/** Where the cursor drags the cord to, in stage pixels. */
export const PULL_POINT = {
  x: CORD.anchor.x + 12,
  y: SCENE_TOP + CORD.anchor.y + CORD.length + PULL_DISTANCE,
};

/**
 * Pulls the cord down and lets go, which flips the lamp.
 *
 * @param {import('../../shared/demo-cursor.js').DemoCursor} cursor The cursor.
 * @param {import('./lamp-scene.js').LampScene} scene The scene.
 * @returns {Promise<void>} Resolves when the cord has been released.
 */
async function pullCord(cursor, scene) {
  await cursor.moveTo(scene.item('cord'), 720);
  await cursor.wait(160);
  cursor.press();
  await cursor.moveTo(PULL_POINT, 400, 0);
  await cursor.wait(110);
  cursor.release();
}

/**
 * Clicks a field and fills it in one character at a time.
 *
 * @param {import('../../shared/demo-cursor.js').DemoCursor} cursor The cursor.
 * @param {import('./lamp-scene.js').LampScene} scene The scene.
 * @param {{id: string, demoValue: string}} field The field content.
 * @returns {Promise<void>} Resolves when typing ends.
 */
async function fillField(cursor, scene, field) {
  await cursor.moveTo(scene.item(field.id), 520);
  await cursor.click();

  for (const character of field.demoValue) {
    scene.type(field.id, character);
    await cursor.wait(TYPE_MS);
  }
}

/**
 * The take, about 11 seconds. It ends exactly where it began (dark, cursor at
 * START_POINT) so the video loops with no visible cut.
 *
 * Edit the order or durations (in milliseconds) here to re-time the video.
 *
 * @param {import('../../shared/demo-cursor.js').DemoCursor} cursor The cursor.
 * @param {import('./lamp-scene.js').LampScene} scene The scene.
 * @returns {Promise<void>} Resolves when the take ends.
 */
export async function playDemo(cursor, scene) {
  await cursor.wait(450);

  // The hook: the room goes from black to warm in one pull.
  await pullCord(cursor, scene);
  await cursor.wait(1300);

  await fillField(cursor, scene, CONTENT.email);
  await fillField(cursor, scene, CONTENT.password);

  await cursor.moveTo(scene.item('submit'), 460);
  await cursor.wait(140);
  await cursor.click();
  await cursor.wait(1500);

  // Lights out, back to the first frame for the loop.
  await pullCord(cursor, scene);
  await cursor.wait(760);
  await cursor.moveTo(START_POINT, 620);
}
