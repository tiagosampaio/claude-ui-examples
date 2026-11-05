const FALL_SECONDS = 0.55;
const HOP_SECONDS = 0.8;
const SETTLE_SECONDS = 0.6;
const HOP_HEIGHT = 170;
const SQUASH = 0.22;
const EXIT_GRAVITY = 1500;

/** How long the drop takes to reach the wordmark. */
export const DROP_SECONDS = FALL_SECONDS + HOP_SECONDS + SETTLE_SECONDS;

/**
 * Where the glass drop is as it falls, bounces off the glass and lands as the dot
 * of the "i". Pure, so each stage can be tested without a browser.
 *
 * @param {number} elapsed Seconds since it was let go.
 * @param {object} path The path to follow, in scene pixels.
 * @param {{x: number, y: number}} path.start Where it's let go.
 * @param {{x: number, y: number}} path.landing Where it hits the glass.
 * @param {{x: number, y: number}} path.target Where it comes to rest.
 * @returns {{x: number, y: number, squash: number}} Its position and squash.
 */
export function dropPose(elapsed, { start, landing, target }) {
  if (elapsed < FALL_SECONDS) {
    const progress = Math.max(elapsed, 0) / FALL_SECONDS;

    return {
      x: start.x,
      y: start.y + (landing.y - start.y) * progress * progress,
      squash: 0,
    };
  }

  if (elapsed < FALL_SECONDS + HOP_SECONDS) {
    const progress = (elapsed - FALL_SECONDS) / HOP_SECONDS;
    const eased = progress * progress * (3 - 2 * progress);

    return {
      x: landing.x + (target.x - landing.x) * eased,
      y: landing.y + (target.y - landing.y) * progress - HOP_HEIGHT * Math.sin(Math.PI * progress),
      squash: 0,
    };
  }

  const progress = Math.min((elapsed - FALL_SECONDS - HOP_SECONDS) / SETTLE_SECONDS, 1);
  const wobble = progress < 1 ? Math.sin(progress * Math.PI * 3) * (1 - progress) : 0;

  return { x: target.x, y: target.y, squash: wobble * SQUASH };
}

/**
 * Where the drop is as it falls out of the scene when the liquid drains.
 *
 * @param {number} elapsed Seconds since it started to fall.
 * @param {{x: number, y: number}} from Where it was resting.
 * @returns {{x: number, y: number, squash: number}} Its position and squash.
 */
export function dropExitPose(elapsed, from) {
  return { x: from.x, y: from.y + EXIT_GRAVITY * elapsed * elapsed, squash: 0 };
}
