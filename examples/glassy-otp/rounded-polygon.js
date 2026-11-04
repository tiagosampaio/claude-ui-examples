/**
 * Moves from one point towards another by a fixed distance.
 *
 * @param {{x: number, y: number}} from The start.
 * @param {{x: number, y: number}} to The direction to move in.
 * @param {number} distance How far to move.
 * @returns {{x: number, y: number}} The new point.
 */
function moveTowards(from, to, distance) {
  const length = Math.hypot(to.x - from.x, to.y - from.y);

  return {
    x: from.x + ((to.x - from.x) / length) * distance,
    y: from.y + ((to.y - from.y) / length) * distance,
  };
}

/**
 * Builds an SVG path for a polygon with softened corners. The same string works
 * for a CSS clip-path and for an SVG outline, so the glass and its edge always
 * match.
 *
 * @param {{x: number, y: number}[]} points The corners in drawing order.
 * @param {number} radius How far each corner is cut back, in pixels.
 * @returns {string} The path data.
 */
export function roundedPolygon(points, radius) {
  const commands = points.map((point, index) => {
    const previous = points[(index + points.length - 1) % points.length];
    const next = points[(index + 1) % points.length];
    const entry = moveTowards(point, previous, radius);
    const exit = moveTowards(point, next, radius);
    const verb = index === 0 ? 'M' : 'L';

    return `${verb}${entry.x} ${entry.y}Q${point.x} ${point.y} ${exit.x} ${exit.y}`;
  });

  return `${commands.join('')}Z`;
}
