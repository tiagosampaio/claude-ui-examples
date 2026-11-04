/** The stages the card moves through. CSS reads them from data-phase. */
export const PHASE = {
  ENTRY: 'entry',
  GRID: 'grid',
  MERGE: 'merge',
  VERIFIED: 'verified',
};

export const BOX_COUNT = 4;

const ROW_PITCH = 144;
const GRID_HALF_WIDTH = 132;
const GRID_HALF_HEIGHT = 112;

/**
 * Lines between grid boxes, in the order they light up. Each pair holds box
 * indexes: top, left, right, then bottom.
 */
const WIRE_PAIRS = [[0, 2], [0, 1], [2, 3], [1, 3]];

/**
 * Where a box sits in the 2x2 grid. Boxes fill it column by column, so the row
 * reads down the left side and then down the right.
 *
 * @param {number} index The box index.
 * @returns {{x: number, y: number}} Its offset from the group's center.
 */
function gridPosition(index) {
  return {
    x: index < BOX_COUNT / 2 ? -GRID_HALF_WIDTH : GRID_HALF_WIDTH,
    y: index % 2 === 0 ? -GRID_HALF_HEIGHT : GRID_HALF_HEIGHT,
  };
}

/**
 * Where one box sits during a phase.
 *
 * @param {string} phase A PHASE value.
 * @param {number} index The box index.
 * @returns {{x: number, y: number}} Its offset from the group's center.
 */
export function boxPosition(phase, index) {
  if (phase === PHASE.ENTRY) {
    return { x: (index - (BOX_COUNT - 1) / 2) * ROW_PITCH, y: 0 };
  }

  return phase === PHASE.GRID ? gridPosition(index) : { x: 0, y: 0 };
}

/**
 * The lines that connect the grid boxes.
 *
 * @returns {{from: {x: number, y: number}, to: {x: number, y: number}}[]} The
 *   lines in lighting order, as offsets from the group's center.
 */
export function wireLines() {
  return WIRE_PAIRS.map(([from, to]) => ({
    from: gridPosition(from),
    to: gridPosition(to),
  }));
}
