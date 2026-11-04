import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import { Stage } from '../shared/stage.js';

/**
 * Stands in for the browser window.
 *
 * @param {number} innerWidth The window width.
 * @param {number} innerHeight The window height.
 * @returns {{resize: (width: number, height: number) => void}} Resizes the window.
 */
function fakeWindow(innerWidth, innerHeight) {
  const listeners = [];

  globalThis.window = {
    innerWidth,
    innerHeight,
    addEventListener: (_, listener) => listeners.push(listener),
  };

  return {
    resize(width, height) {
      globalThis.window.innerWidth = width;
      globalThis.window.innerHeight = height;
      listeners.forEach((listener) => listener());
    },
  };
}

afterEach(() => {
  delete globalThis.window;
});

test('stage positions convert both ways', () => {
  fakeWindow(540, 1200);

  const stage = new Stage({ style: {} });
  const point = { x: 300, y: 700 };

  assert.equal(stage.scale, 0.5);
  assert.deepEqual(stage.toStage(stage.toClient(point)), point);
});

test('stage stays usable in a window with no size, then fits once it has one', () => {
  const { resize } = fakeWindow(0, 0);
  const stage = new Stage({ style: {} });
  const { x, y } = stage.toStage({ x: 100, y: 100 });

  assert.ok(Number.isFinite(x) && Number.isFinite(y));

  resize(1080, 1920);
  assert.equal(stage.scale, 1);

  resize(0, 500);
  assert.equal(stage.scale, 1);
});
