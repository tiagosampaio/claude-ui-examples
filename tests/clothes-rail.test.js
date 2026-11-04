import assert from 'node:assert/strict';
import { test } from 'node:test';

import { DEFAULT_ACTIVE, GARMENTS } from '../examples/clothes-rail/content.js';
import { playDemo, START_POINT } from '../examples/clothes-rail/demo.js';
import { FACE, garmentArt } from '../examples/clothes-rail/garment-art.js';
import { detailLayout, railLayout, RAIL } from '../examples/clothes-rail/rail-layout.js';

const MAX_TAKE_MS = 15000;
const COUNT = GARMENTS.length;
const SCENE_CENTER = 540;

/**
 * @param {number[]} slots Slot widths and positions.
 * @returns {number} The total width of the slots.
 */
function totalWidth(slots) {
  return slots.reduce((sum, { width }) => sum + width, 0);
}

test('rail width stays the same whatever the garments are doing', () => {
  const cases = [
    [1, 0, 0, 0, 0, 0],
    [0.5, 0.5, 0, 0, 0, 0],
    [0.3, 0, 0.9, 0, 1.1, 0],
    [0, 0, 0, 0, 0, 0],
    [-0.1, 1.05, 0, 0, 0, 0],
  ];

  for (const focus of cases) {
    const slots = railLayout(focus);

    assert.ok(Math.abs(totalWidth(slots) - RAIL.width) < 0.001, `total for ${focus}`);
    assert.ok(slots.every(({ x, width }) => Number.isFinite(x) && width > 0));
  }
});

test('a garment facing the camera takes the widest slot', () => {
  const focus = GARMENTS.map((_, index) => (index === 2 ? 1 : 0));
  const widths = railLayout(focus).map(({ width }) => width);

  assert.equal(widths.indexOf(Math.max(...widths)), 2);
});

test('garments between two moving ones stay where they are', () => {
  const before = railLayout([1, 0, 0, 0, 0, 0]);
  const during = railLayout([0.4, 0, 0, 0.6, 0, 0]);

  assert.equal(before[4].x, during[4].x);
  assert.equal(before[5].x, during[5].x);
});

test('detail view centers the chosen garment and keeps the others to its sides', () => {
  for (let selected = 0; selected < COUNT; selected += 1) {
    const slots = detailLayout(selected, COUNT);
    const chosen = slots[selected];

    assert.equal(chosen.x + chosen.width / 2, SCENE_CENTER);
    slots.forEach((slot, index) => {
      if (index < selected) {
        assert.ok(slot.x + slot.width <= chosen.x);
      } else if (index > selected) {
        assert.ok(slot.x >= chosen.x + chosen.width);
      }
    });
  }
});

test('every garment has both sides drawn and at least two colours', () => {
  for (const { kind, colors } of GARMENTS) {
    assert.ok(colors.length >= 2, kind);
    assert.match(garmentArt(kind, FACE.FRONT, 'X'), /^\s*<svg/);
    assert.match(garmentArt(kind, FACE.BACK, 'X'), /^\s*<svg/);
  }

  assert.throws(() => garmentArt('cape', FACE.FRONT, 'X'), /No drawing/);
  assert.ok(DEFAULT_ACTIVE >= 0 && DEFAULT_ACTIVE < COUNT);
});

test('take opens a garment, uses every control, closes it and loops', async () => {
  const clicks = [];
  const targets = [];
  let elapsed = 0;
  let aim = null;
  let didReset = false;
  const cursor = {
    moveTo: async (target, duration) => {
      elapsed += duration;
      aim = target;
      targets.push(target);
    },
    wait: async (duration) => { elapsed += duration; },
    click: async () => {
      elapsed += 180;
      clicks.push(aim);
    },
  };
  const scene = {
    item: (id) => {
      const garment = id.match(/^garment-(\d+)$/);

      assert.ok(
        (garment && Number(garment[1]) < COUNT) || ['tag-1', 'front', 'back', 'close'].includes(id),
        `unknown item "${id}"`,
      );

      return id;
    },
    reset: () => { didReset = true; },
  };

  await playDemo(cursor, scene);

  assert.deepEqual(clicks, ['garment-1', 'tag-1', 'back', 'front', 'close']);
  assert.ok(targets.includes(`garment-${DEFAULT_ACTIVE}`), 'must return to the first garment');
  assert.deepEqual(targets.at(-1), START_POINT);
  assert.ok(didReset);
  assert.ok(elapsed <= MAX_TAKE_MS, `take runs ${elapsed}ms`);
});
