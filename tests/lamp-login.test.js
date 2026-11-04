import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CONTENT, CORD, PULL_THRESHOLD, SCENE_TOP } from '../examples/lamp-login/content.js';
import { playDemo, PULL_POINT, START_POINT } from '../examples/lamp-login/demo.js';
import { lightLevel } from '../examples/lamp-login/lamp-light.js';
import { Rope } from '../examples/lamp-login/rope.js';

const MAX_TAKE_MS = 15000;
const FRAME = 1 / 60;
const VALID_IDS = new Set(['cord', 'submit', CONTENT.email.id, CONTENT.password.id]);

/**
 * Advances a rope by a number of frames.
 *
 * @param {Rope} rope The rope.
 * @param {number} frames How many frames to run.
 * @returns {void}
 */
function run(rope, frames) {
  for (let frame = 0; frame < frames; frame += 1) {
    rope.step(FRAME);
  }
}

/**
 * Stands in for the cursor and scene, recording the script as data.
 *
 * @returns {{cursor: object, scene: object, steps: object[], typed: object}} The doubles.
 */
function recordTake() {
  const steps = [];
  const typed = {};
  const cursor = {
    moveTo: async (target, duration) => steps.push({ type: 'move', target, duration }),
    wait: async (duration) => steps.push({ type: 'wait', duration }),
    click: async () => steps.push({ type: 'click', duration: 180 }),
    press: () => steps.push({ type: 'press', duration: 0 }),
    release: () => steps.push({ type: 'release', duration: 0 }),
  };
  const scene = {
    item(id) {
      assert.ok(VALID_IDS.has(id), `demo aims at unknown item "${id}"`);
      return id;
    },
    type(id, character) {
      typed[id] = (typed[id] ?? '') + character;
    },
  };

  return { cursor, scene, steps, typed };
}

test('rope hangs at its full length without drifting', () => {
  const rope = new Rope(CORD.anchor, CORD.length);

  run(rope, 300);

  assert.ok(Math.abs(rope.end.x - CORD.anchor.x) < 1);
  assert.ok(Math.abs(rope.pull) < 6, `end sits ${rope.pull}px from rest`);
});

test('rope end follows the pointer past full length, then recoils when let go', () => {
  const rope = new Rope(CORD.anchor, CORD.length);
  const held = { x: CORD.anchor.x + 12, y: CORD.anchor.y + CORD.length + 140 };

  rope.pinEnd(held);
  run(rope, 30);
  assert.deepEqual({ x: rope.end.x, y: rope.end.y }, held);
  assert.ok(rope.pull >= PULL_THRESHOLD);

  rope.pinEnd(null);
  run(rope, 600);
  assert.ok(Math.abs(rope.pull) < 6, `end settled ${rope.pull}px from rest`);
  assert.ok(rope.points.every(({ x, y }) => Number.isFinite(x) && Number.isFinite(y)));
});

test('light flickers on and off and always ends fully settled', () => {
  assert.equal(lightLevel(0, true), 0);
  assert.equal(lightLevel(5000, true), 1);
  assert.equal(lightLevel(0, false), 1);
  assert.equal(lightLevel(5000, false), 0);
  assert.equal(lightLevel(Infinity, false), 0);
  assert.ok(lightLevel(110, true) < lightLevel(60, true), 'dips during the flicker');
});

test('light stays within range at every moment', () => {
  for (let elapsed = 0; elapsed < 600; elapsed += 5) {
    for (const isOn of [true, false]) {
      const level = lightLevel(elapsed, isOn);

      assert.ok(level >= 0 && level <= 1, `level ${level} at ${elapsed}ms`);
    }
  }
});

test('take pulls past the threshold, types everything and loops back to dark', async () => {
  const { cursor, scene, steps, typed } = recordTake();

  await playDemo(cursor, scene);

  const total = steps.reduce((sum, step) => sum + step.duration, 0);
  const moves = steps.filter((step) => step.type === 'move');
  const pulls = moves.filter((step) => step.target === PULL_POINT);
  const presses = steps.filter((step) => step.type === 'press');
  const releases = steps.filter((step) => step.type === 'release');
  const restingY = SCENE_TOP + CORD.anchor.y + CORD.length;

  assert.ok(total <= MAX_TAKE_MS, `take runs ${total}ms`);
  assert.equal(pulls.length % 2, 0, 'lamp must end switched off');
  assert.ok(pulls.length > 0);
  assert.equal(presses.length, releases.length);
  assert.ok(PULL_POINT.y - restingY >= PULL_THRESHOLD);
  assert.deepEqual(moves.at(-1).target, START_POINT);
  assert.equal(typed[CONTENT.email.id], CONTENT.email.demoValue);
  assert.equal(typed[CONTENT.password.id], CONTENT.password.demoValue);
});
