/**
 * The shop and what hangs on the rail. Edit this file to re-skin the example for
 * a different video. The teams are made up. The first colour in each list is the
 * one the shirt starts in, and each colour has a front and a back photo.
 */
export const BRAND = 'OFFCUT';

/** The two sides of a shirt. */
export const FACE = { FRONT: 'front', BACK: 'back' };

export const LABELS = {
  front: 'Front',
  back: 'Back',
  availability: 'See availability',
};

/**
 * Builds the photo paths for one colour, which follow the same naming pattern.
 *
 * @param {string} name The file name without its side, such as "embers".
 * @returns {{front: string, back: string}} The two paths.
 */
function photos(name) {
  return { front: `shirts/${name}-front.webp`, back: `shirts/${name}-back.webp` };
}

export const GARMENTS = [
  {
    name: 'Tidewater Jersey',
    colors: [{ label: 'Teal', tag: '#1f5a60', ink: '#ffffff', ...photos('tidewater') }],
  },
  {
    name: 'Drifters Jersey',
    colors: [
      { label: 'Cobalt', tag: '#1f4fc4', ink: '#ffffff', ...photos('drifters-cobalt') },
      { label: 'White', tag: '#f3f2ee', ink: '#1f4fc4', ...photos('drifters-white') },
    ],
  },
  {
    name: 'Embers Jersey',
    colors: [{ label: 'Orange', tag: '#c8591f', ink: '#ffffff', ...photos('embers') }],
  },
  {
    name: 'Lanterns Jersey',
    colors: [{ label: 'Black', tag: '#17181c', ink: '#d9b45f', ...photos('lanterns') }],
  },
  {
    name: 'Ironwood Jersey',
    colors: [{ label: 'Forest', tag: '#1c4a2c', ink: '#f0e6c8', ...photos('ironwood') }],
  },
  {
    name: 'Highline Jersey',
    colors: [{ label: 'Ivory', tag: '#f1eee4', ink: '#a81f2d', ...photos('highline') }],
  },
];

/** The shirt facing the camera on the first frame. */
export const DEFAULT_ACTIVE = 3;
