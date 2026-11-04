import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CONTENT, DEFAULT_ACTIVE_ROW } from '../examples/glass-sidebar/content.js';
import { playDemo, START_POINT } from '../examples/glass-sidebar/demo.js';
import { magnification } from '../examples/glass-sidebar/dock-magnifier.js';
import { stretchFor } from '../examples/glass-sidebar/spring-pill.js';
import { stepSpring } from '../shared/spring.js';

const MAX_TAKE_MS = 16000;
const CLICK_MS = 180;

const rowIds = CONTENT.sections.flatMap((section) => section.rows.map((row) => row.id));
const validIds = new Set([...rowIds, CONTENT.search.id, CONTENT.night.id, 'toggle']);

/**
 * Stands in for the cursor and sidebar, recording the script as data.
 *
 * @returns {{cursor: object, sidebar: object, steps: object[]}} The test doubles.
 */
function recordTake() {
  const steps = [];
  const cursor = {
    moveTo: async (target, duration) => steps.push({ type: 'move', target, duration }),
    wait: async (duration) => steps.push({ type: 'wait', duration }),
    click: async () => steps.push({ type: 'click', duration: CLICK_MS }),
  };
  const sidebar = {
    item(id) {
      assert.ok(validIds.has(id), `demo aims at unknown item "${id}"`);
      return id;
    },
  };

  return { cursor, sidebar, steps };
}

test('magnification peaks on the pointer and fades out at the radius', () => {
  assert.equal(magnification(0, 100, 1.5), 1.5);
  assert.equal(magnification(100, 100, 1.5), 1);
  assert.equal(magnification(500, 100, 1.5), 1);
  assert.ok(magnification(30, 100, 1.5) > magnification(60, 100, 1.5));
});

test('spring settles on its goal at the active pill settings', () => {
  let state = { value: 0, velocity: 0 };

  for (let frame = 0; frame < 240; frame += 1) {
    state = stepSpring(state, 500, 1 / 60, { stiffness: 210, damping: 19 });
  }

  assert.ok(Math.abs(state.value - 500) < 0.5);
  assert.ok(Math.abs(state.velocity) < 0.5);
});

test('spring stays stable at the longest allowed frame', () => {
  let state = { value: 0, velocity: 0 };

  for (let frame = 0; frame < 120; frame += 1) {
    state = stepSpring(state, 500, 1 / 30, { stiffness: 520, damping: 40 });
  }

  assert.ok(Math.abs(state.value - 500) < 0.5);
});

test('pill stretch is symmetric and capped', () => {
  assert.equal(stretchFor(0), 0);
  assert.equal(stretchFor(1000), stretchFor(-1000));
  assert.ok(stretchFor(1e6) <= 0.42);
});

test('default active row exists', () => {
  assert.ok(rowIds.includes(DEFAULT_ACTIVE_ROW));
});

test('take uses valid targets, fits the length and loops back to the start', async () => {
  const { cursor, sidebar, steps } = recordTake();

  await playDemo(cursor, sidebar);

  const total = steps.reduce((sum, step) => sum + step.duration, 0);
  const moves = steps.filter((step) => step.type === 'move');
  const clickTargets = steps.flatMap((step, index) => (
    step.type === 'click'
      ? [steps.slice(0, index).findLast((earlier) => earlier.type === 'move').target]
      : []
  ));
  const countClicks = (id) => clickTargets.filter((target) => target === id).length;

  assert.ok(total <= MAX_TAKE_MS, `take runs ${total}ms`);
  assert.deepEqual(moves.at(-1).target, START_POINT);
  assert.equal(countClicks('toggle') % 2, 0, 'sidebar must end collapsed');
  assert.equal(countClicks('night') % 2, 0, 'night mode must end off');
  assert.equal(countClicks('projects') % 2, 0, 'project tree must end open');
  assert.equal(clickTargets.findLast((target) => rowIds.includes(target) && target !== 'projects'), DEFAULT_ACTIVE_ROW);
});
