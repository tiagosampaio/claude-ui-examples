/**
 * Advances a damped spring by one time step. Pure, so it can be unit tested
 * and later driven by a fixed clock when rendering frame by frame.
 *
 * @param {{value: number, velocity: number}} state The current spring state.
 * @param {number} goal The value the spring is pulled towards.
 * @param {number} dt Elapsed time in seconds.
 * @param {{stiffness: number, damping: number}} config The spring settings.
 * @returns {{value: number, velocity: number}} The next spring state.
 */
export function stepSpring({ value, velocity }, goal, dt, { stiffness, damping }) {
  const acceleration = stiffness * (goal - value) - damping * velocity;
  const nextVelocity = velocity + acceleration * dt;

  return { value: value + nextVelocity * dt, velocity: nextVelocity };
}
