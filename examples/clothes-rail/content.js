/**
 * The shop and what hangs on the rail. Edit this file to re-skin the example for
 * a different video. "kind" picks the drawing from garment-art.js, and the first
 * colour in each list is the one the garment starts in.
 */
export const BRAND = 'OFFCUT';

export const LABELS = {
  front: 'Front',
  back: 'Back',
  availability: 'See availability',
};

export const GARMENTS = [
  {
    kind: 'hoodie',
    name: 'Harbor Zip Hoodie',
    colors: [
      { label: 'Teal', body: '#3f7088', trim: '#2c5365', print: '#dfeaf0' },
      { label: 'Stone', body: '#b9b3a6', trim: '#8f897c', print: '#38352f' },
    ],
  },
  {
    kind: 'tank',
    name: 'Ridge Mesh Tank',
    colors: [
      { label: 'Black', body: '#1d2028', trim: '#d8dade', print: '#eef0f3' },
      { label: 'Cobalt', body: '#2147a8', trim: '#d9374a', print: '#ffffff' },
    ],
  },
  {
    kind: 'jacket',
    name: 'Field Suede Jacket',
    colors: [
      { label: 'Tan', body: '#a9713f', trim: '#7e512a', print: '#5f3c1f' },
      { label: 'Moss', body: '#5f6b45', trim: '#454e31', print: '#343b25' },
    ],
  },
  {
    kind: 'tee',
    name: 'Rally Graphic Tee',
    colors: [
      { label: 'Red', body: '#d42a2a', trim: '#a81d1d', print: '#ffffff' },
      { label: 'Ink', body: '#20232b', trim: '#14161b', print: '#f4c430' },
    ],
  },
  {
    kind: 'track',
    name: 'Tempo Track Jacket',
    colors: [
      { label: 'Black', body: '#1b1d22', trim: '#eceef1', print: '#eceef1' },
      { label: 'Forest', body: '#1f4d3a', trim: '#f0e6c8', print: '#f0e6c8' },
    ],
  },
  {
    kind: 'tank',
    name: 'Court Jersey',
    colors: [
      { label: 'Cobalt', body: '#2147a8', trim: '#e0394c', print: '#ffffff' },
      { label: 'White', body: '#eceae4', trim: '#2147a8', print: '#2147a8' },
    ],
  },
];

/** The garment facing the camera on the first frame. */
export const DEFAULT_ACTIVE = 3;
