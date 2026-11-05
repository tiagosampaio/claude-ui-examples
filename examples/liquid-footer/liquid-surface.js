const WAVE_POINTS = 44;
const MAX_WAVE_HEIGHT = 34;
const WAVE_PER_SPEED = 42;

/**
 * The height of the water at one point. Two sine waves that drift in opposite
 * directions look less mechanical than one.
 *
 * @param {number} x The horizontal position in pixels.
 * @param {number} time The time in seconds.
 * @returns {number} The offset, from about -1 to 1.
 */
function waveAt(x, time) {
  return Math.sin(x * 0.011 + time * 2.1) * 0.6 + Math.sin(x * 0.027 - time * 3.3) * 0.4;
}

/**
 * How choppy the surface should be. It follows the speed of the liquid, so the
 * waves die away by themselves as it settles and the edge ends up perfectly flat.
 *
 * @param {number} speed How fast the level is changing.
 * @returns {number} The wave height in pixels.
 */
export function waveHeightFor(speed) {
  return Math.min(Math.abs(speed) * WAVE_PER_SPEED, MAX_WAVE_HEIGHT);
}

/**
 * Builds the shape of the glass at a given fill level. The same path clips the
 * glass and draws its edge, so they always match.
 *
 * @param {object} surface The shape to draw.
 * @param {number} surface.width The full width in pixels.
 * @param {number} surface.height The full height in pixels.
 * @param {number} surface.level How full it is, from 0 to 1.
 * @param {number} surface.waveHeight The wave height in pixels.
 * @param {number} surface.time The time in seconds.
 * @param {number} surface.radius The corner radius in pixels.
 * @returns {string} SVG path data.
 */
export function surfacePath({ width, height, level, waveHeight, time, radius }) {
  const top = height * (1 - level);
  const corner = Math.min(radius, (height - top) / 2);
  const span = width - corner * 2;
  const points = [];

  for (let step = WAVE_POINTS; step >= 0; step -= 1) {
    const share = step / WAVE_POINTS;
    const x = corner + span * share;
    // Fades the waves out at the sides so they meet the corners cleanly.
    const taper = Math.sin(Math.PI * share);

    points.push(`L${x.toFixed(1)} ${(top + waveAt(x, time) * waveHeight * taper).toFixed(1)}`);
  }

  return [
    `M0 ${height - corner}Q0 ${height} ${corner} ${height}`,
    `L${width - corner} ${height}Q${width} ${height} ${width} ${height - corner}`,
    `L${width} ${top + corner}Q${width} ${top} ${width - corner} ${top}`,
    points.join(''),
    `Q0 ${top} 0 ${top + corner}Z`,
  ].join('');
}
