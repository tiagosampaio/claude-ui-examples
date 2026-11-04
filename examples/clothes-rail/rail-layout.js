/** The rail in scene pixels. The left and top values match styles.css. */
export const RAIL = { left: 60, width: 960, top: 240 };

/** How far a garment on the rail is turned away from the camera. */
export const EDGE_ON_DEGREES = 78;

const REST_WIDTH = 88;
const SELECTED = { x: 280, width: 520 };
const NEIGHBOUR_GAP = 42;
const TAGS_GAP = 160;

/**
 * Blends two numbers.
 *
 * @param {number} from The value at 0.
 * @param {number} to The value at 1.
 * @param {number} amount Progress from 0 to 1.
 * @returns {number} The blended value.
 */
export function mix(from, to, amount) {
  return from + (to - from) * amount;
}

/**
 * Shares the rail's width out between the garments. Every garment keeps a narrow
 * slot and they split the rest by how far they are turned towards the camera.
 *
 * The total never changes, so when one garment grows and another shrinks the
 * ones between them stay put. That also keeps the pointer over the garment it
 * just picked, instead of shifting it onto a neighbour.
 *
 * @param {number[]} focus How far each garment faces the camera, from 0 to 1.
 * @returns {{x: number, width: number}[]} Each garment's slot in scene pixels.
 */
export function railLayout(focus) {
  const weights = focus.map((value) => Math.max(value, 0));
  const total = weights.reduce((sum, value) => sum + value, 0);
  const spare = RAIL.width - focus.length * REST_WIDTH;
  let x = RAIL.left;

  return weights.map((weight) => {
    const share = total > 0 ? weight / total : 1 / focus.length;
    const slot = { x, width: REST_WIDTH + spare * share };

    x += slot.width;

    return slot;
  });
}

/**
 * Places the garments for the detail view: the chosen one in the middle and the
 * others out to its sides, leaving room for the colour tags on the right.
 *
 * @param {number} selected The chosen garment's index.
 * @param {number} count How many garments there are.
 * @returns {{x: number, width: number}[]} Each garment's slot in scene pixels.
 */
export function detailLayout(selected, count) {
  const pitch = REST_WIDTH + NEIGHBOUR_GAP;

  return Array.from({ length: count }, (_, index) => {
    if (index === selected) {
      return { ...SELECTED };
    }

    const x = index < selected
      ? SELECTED.x - (selected - index) * pitch
      : SELECTED.x + SELECTED.width + TAGS_GAP + (index - selected - 1) * pitch;

    return { x, width: REST_WIDTH };
  });
}
