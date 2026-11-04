/**
 * Small seeded random generator (mulberry32), so every take gets exactly the
 * same particles.
 *
 * @param {number} seed The starting value.
 * @returns {() => number} Returns numbers from 0 up to 1.
 */
export function createRandom(seed) {
  let state = seed;

  return () => {
    state = (state + 0x6d2b79f5) | 0;

    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);

    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;

    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}
