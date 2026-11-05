import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CONTENT } from '../examples/liquid-footer/content.js';
import { playDemo, START_POINT } from '../examples/liquid-footer/demo.js';
import { DROP_SECONDS, dropExitPose, dropPose } from '../examples/liquid-footer/drop-path.js';
import { surfacePath, waveHeightFor } from '../examples/liquid-footer/liquid-surface.js';
import { PALETTES, roomArt } from '../examples/liquid-footer/room-art.js';

const MAX_TAKE_MS = 15000;
const LINK_COUNT = CONTENT.columns.reduce((sum, { links }) => sum + links.length, 0);
const SURFACE = { width: 1000, height: 940, radius: 44, time: 2 };
const DROP = { start: { x: 230, y: -80 }, landing: { x: 230, y: 378 }, target: { x: 400, y: 1200 } };

/**
 * @param {string} path SVG path data.
 * @returns {number[]} Every y value in the path's points.
 */
function pathNumbers(path) {
  return path.match(/-?\d+(\.\d+)?/g).map(Number);
}

test('surface is a closed path at every level, including empty and full', () => {
  for (const level of [0, 0.01, 0.5, 1]) {
    const path = surfacePath({ ...SURFACE, level, waveHeight: 20 });

    assert.ok(path.startsWith('M'));
    assert.ok(path.endsWith('Z'));
    assert.ok(pathNumbers(path).every(Number.isFinite), `level ${level}`);
  }
});

test('a full, settled surface has a flat top edge', () => {
  const path = surfacePath({ ...SURFACE, level: 1, waveHeight: waveHeightFor(0) });
  const edge = path.match(/L[\d.]+ [\d.-]+/g).slice(3);

  assert.ok(edge.every((point) => Number(point.split(' ')[1]) === 0), 'top edge must sit at y=0');
});

test('waves follow the speed of the liquid and stay within a limit', () => {
  assert.equal(waveHeightFor(0), 0);
  assert.ok(waveHeightFor(0.5) > waveHeightFor(0.1));
  assert.equal(waveHeightFor(-0.5), waveHeightFor(0.5));
  assert.ok(waveHeightFor(100) <= 40);
});

test('drop falls straight, then hops to the dot and comes to rest there', () => {
  assert.deepEqual(dropPose(0, DROP), { ...DROP.start, squash: 0 });
  assert.equal(dropPose(0.3, DROP).x, DROP.start.x);
  assert.deepEqual(dropPose(DROP_SECONDS + 1, DROP), { ...DROP.target, squash: 0 });
});

test('drop moves smoothly with no jumps between frames', () => {
  let previous = dropPose(0, DROP);

  for (let elapsed = 1 / 60; elapsed < DROP_SECONDS + 0.2; elapsed += 1 / 60) {
    const pose = dropPose(elapsed, DROP);
    const jump = Math.hypot(pose.x - previous.x, pose.y - previous.y);

    assert.ok(jump < 60, `jump of ${jump}px at ${elapsed.toFixed(2)}s`);
    previous = pose;
  }
});

test('drop falls out of the scene when the liquid drains', () => {
  assert.ok(dropExitPose(1, DROP.target).y > 1400);
});

test('both room palettes draw a usable background', () => {
  for (const palette of Object.values(PALETTES)) {
    const art = roomArt(palette);

    assert.match(art, /^url\("data:image\/svg\+xml,/);
    assert.ok(!art.includes('undefined'));
  }
});

test('take pours, uses links, returns to daytime, drains and loops', async () => {
  const log = [];
  let elapsed = 0;
  let aim = null;
  const cursor = {
    moveTo: async (target, duration) => {
      elapsed += duration;
      aim = target;
      log.push({ type: 'move', target });
    },
    wait: async (duration) => { elapsed += duration; },
    click: async () => {
      elapsed += 180;
      log.push({ type: 'click', target: aim });
    },
  };
  const scene = {
    item: (id) => {
      const link = id.match(/^link-(\d+)$/);

      assert.ok(id === 'theme' || (link && Number(link[1]) < LINK_COUNT), `unknown item "${id}"`);

      return id;
    },
    pour: () => log.push({ type: 'pour' }),
    drain: () => log.push({ type: 'drain' }),
    reset: () => log.push({ type: 'reset' }),
  };

  await playDemo(cursor, scene);

  const types = log.map(({ type }) => type);
  const toggles = log.filter(({ type, target }) => type === 'click' && target === 'theme');
  const moves = log.filter(({ type }) => type === 'move');

  assert.equal(types[0], 'pour');
  assert.equal(toggles.length % 2, 0, 'must end in daytime');
  assert.ok(toggles.length > 0);
  assert.ok(types.indexOf('drain') > types.lastIndexOf('click'));
  assert.equal(types.at(-1), 'reset');
  assert.deepEqual(moves.at(-1).target, START_POINT);
  assert.ok(elapsed <= MAX_TAKE_MS, `take runs ${elapsed}ms`);
});
