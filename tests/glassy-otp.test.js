import assert from 'node:assert/strict';
import { test } from 'node:test';

import { BOX_COUNT, boxPosition, PHASE, wireLines } from '../examples/glassy-otp/box-layout.js';
import { ConfettiField, MAX_LIFE } from '../examples/glassy-otp/confetti.js';
import { CONTENT } from '../examples/glassy-otp/content.js';
import { playDemo, START_POINT } from '../examples/glassy-otp/demo.js';
import { OtpCode } from '../examples/glassy-otp/otp-code.js';
import { roundedPolygon } from '../examples/glassy-otp/rounded-polygon.js';
import { Timeline, VERIFY_MS, VERIFY_STEPS } from '../examples/glassy-otp/timeline.js';

const MAX_TAKE_MS = 12000;
const BOX_SIZE = 124;
const FRAME = 1 / 60;
const ORIGIN = { x: 540, y: 800 };

/**
 * @param {string} phase A PHASE value.
 * @returns {{x: number, y: number}[]} Where every box sits during a phase.
 */
function positions(phase) {
  return Array.from({ length: BOX_COUNT }, (_, index) => boxPosition(phase, index));
}

test('code takes digits only and stops when it is full', () => {
  const code = new OtpCode(2);

  assert.equal(code.push('x'), false);
  assert.equal(code.push(' '), false);
  assert.equal(code.push('12'), false);
  assert.equal(code.push('1'), true);
  assert.equal(code.activeIndex, 1);
  assert.equal(code.isComplete, false);
  assert.equal(code.push('2'), true);
  assert.equal(code.isComplete, true);
  assert.equal(code.push('3'), false);
  assert.deepEqual(code.digits, ['1', '2']);

  code.pop();
  assert.deepEqual(code.digits, ['1']);

  code.clear();
  assert.equal(code.activeIndex, 0);
});

test('boxes never overlap in the row or the grid, and all meet when merged', () => {
  for (const phase of [PHASE.ENTRY, PHASE.GRID]) {
    const boxes = positions(phase);

    boxes.forEach((a, i) => {
      boxes.slice(i + 1).forEach((b) => {
        const apart = Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

        assert.ok(apart > BOX_SIZE, `${phase}: boxes ${apart}px apart`);
      });
    });
  }

  assert.ok(positions(PHASE.ENTRY).every(({ y }) => y === 0));
  assert.ok(positions(PHASE.MERGE).every(({ x, y }) => x === 0 && y === 0));
  assert.ok(positions(PHASE.VERIFIED).every(({ x, y }) => x === 0 && y === 0));
});

test('each wire runs straight between two grid boxes', () => {
  const corners = positions(PHASE.GRID);
  const isCorner = ({ x, y }) => corners.some((box) => box.x === x && box.y === y);

  for (const { from, to } of wireLines()) {
    assert.ok(isCorner(from) && isCorner(to));
    assert.ok(from.x === to.x || from.y === to.y, 'wire must be horizontal or vertical');
  }
});

test('rounded polygon has a closed path with one curve per corner', () => {
  const path = roundedPolygon([{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 100 }], 10);

  assert.ok(path.startsWith('M'));
  assert.ok(path.endsWith('Z'));
  assert.equal(path.match(/Q/g).length, 3);
  assert.ok(!path.includes('NaN'));
});

test('verification steps run in order, light every wire and end verified', () => {
  const times = VERIFY_STEPS.map(({ at }) => at);
  const wires = VERIFY_STEPS.filter(({ wire }) => wire !== undefined).map(({ wire }) => wire);
  const phases = VERIFY_STEPS.filter(({ phase }) => phase).map(({ phase }) => phase);

  assert.deepEqual(times, [...times].sort((a, b) => a - b));
  assert.deepEqual([...wires].sort(), wireLines().map((_, index) => index));
  assert.deepEqual(phases, [PHASE.GRID, PHASE.MERGE, PHASE.VERIFIED]);
  assert.equal(VERIFY_MS, times.at(-1));
});

test('timeline drops waiting steps when cancelled', async () => {
  const timeline = new Timeline();
  const ran = [];

  timeline.play([{ at: 0, name: 'soon' }, { at: 40, name: 'late' }], ({ name }) => ran.push(name));
  await new Promise((resolve) => { setTimeout(resolve, 10); });
  timeline.cancel();
  await new Promise((resolve) => { setTimeout(resolve, 60); });

  assert.deepEqual(ran, ['soon']);
});

test('confetti spreads out, is identical every burst and is gone after its life', () => {
  const run = () => {
    const field = new ConfettiField();

    field.burst(ORIGIN);

    for (let frame = 0; frame < 30; frame += 1) {
      field.step(FRAME);
    }

    return field;
  };
  const field = run();
  const spread = Math.max(...field.particles.map(({ x, y }) => Math.hypot(x - ORIGIN.x, y - ORIGIN.y)));

  assert.ok(spread > 200, `spread only ${spread}px`);
  assert.deepEqual(field.particles, run().particles);
  assert.ok(field.particles.every(({ alpha }) => alpha > 0 && alpha <= 1));

  for (let frame = 0; frame < (MAX_LIFE + 0.1) / FRAME; frame += 1) {
    field.step(FRAME);
  }

  assert.equal(field.particles.length, 0);
});

test('take types the whole code, verifies, then loops back to the empty card', async () => {
  const log = [];
  let elapsed = 0;
  const cursor = {
    moveTo: async (target, duration) => { elapsed += duration; log.push({ type: 'move', target }); },
    wait: async (duration) => { elapsed += duration; },
    click: async () => { elapsed += 180; log.push({ type: 'click' }); },
  };
  const scene = {
    item: (id) => {
      assert.match(id, /^(box-[0-3]|resend)$/);
      return id;
    },
    type: (digit) => log.push({ type: 'digit', digit, at: elapsed }),
    clear: () => log.push({ type: 'clear', at: elapsed }),
    reset: () => log.push({ type: 'reset', at: elapsed }),
  };

  await playDemo(cursor, scene);

  const digits = log.filter(({ type }) => type === 'digit');
  const clear = log.find(({ type }) => type === 'clear');
  const moves = log.filter(({ type }) => type === 'move');

  assert.equal(digits.map(({ digit }) => digit).join(''), CONTENT.code);
  assert.ok(clear.at - digits.at(-1).at >= VERIFY_MS + MAX_LIFE * 500, 'verified state needs time on screen');
  assert.equal(log.at(-1).type, 'reset');
  assert.deepEqual(moves.at(-1).target, START_POINT);
  assert.ok(elapsed <= MAX_TAKE_MS, `take runs ${elapsed}ms`);
});
