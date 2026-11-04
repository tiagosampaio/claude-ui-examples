/**
 * The clothes, drawn as vector art so colourways are only a CSS variable change.
 * All drawings share one 460x700 canvas, which puts every garment's shoulders on
 * the hanger. To use photos instead, return an <image> here.
 */

export const FACE = { FRONT: 'front', BACK: 'back' };

const VIEW_BOX = '0 0 460 700';
const LONG_SLEEVES = 'M165 150L85 180Q40 220 26 500L24 590L92 598L118 330V630H342V330L368 598L436 590L434 500Q420 220 375 180L295 150Q230 190 165 150Z';

const SHAPES = {
  tee: 'M160 142L70 180L12 300L84 338L118 270V640H342V270L376 338L448 300L390 180L300 142Q230 196 160 142Z',
  tank: 'M150 134Q146 220 104 266V640H356V266Q314 220 310 134H272Q230 222 188 134Z',
  hoodie: LONG_SLEEVES,
  jacket: LONG_SLEEVES,
  track: LONG_SLEEVES,
};

const SLEEVE_SEAMS = '<path class="g-seam" d="M118 330Q116 250 150 170M342 330Q344 250 310 170"/>';
const ZIP = '<path class="g-trim-line" d="M230 176V630"/>';
const HEM = '<path class="g-trim-fill" d="M118 612H342V630H118Z"/>';

/**
 * @param {string} text The words.
 * @param {number} y The baseline.
 * @param {number} size The font size.
 * @param {string} [style] Extra class, for the jersey lettering.
 * @returns {string} The centered text markup.
 */
function print(text, y, size, style = '') {
  return `<text class="g-print ${style}" x="230" y="${y}" font-size="${size}">${text}</text>`;
}

/** Details for each kind and side. Each function takes the brand's name. */
const DETAILS = {
  tee: {
    front: (brand) => `
      <path class="g-print" opacity="0.9" d="M138 372L322 300L300 356L356 340L250 450L262 396L120 456Z"/>
      ${print(brand, 500, 42)}
      <path class="g-trim-line" d="M160 142Q230 196 300 142"/>`,
    back: (brand) => `
      <path class="g-trim-line" d="M160 142Q230 164 300 142"/>
      ${print(brand, 280, 40)}`,
  },
  tank: {
    front: (brand) => `
      <path class="g-trim-line g-trim-line--wide" d="M188 134Q230 222 272 134M150 134Q146 220 104 266M310 134Q314 220 356 266"/>
      ${print(brand, 410, 50, 'g-print--script')}
      <circle class="g-print" cx="230" cy="312" r="22"/>`,
    back: (brand) => `
      <path class="g-trim-line g-trim-line--wide" d="M188 134Q230 162 272 134M150 134Q146 220 104 266M310 134Q314 220 356 266"/>
      ${print(brand, 280, 46, 'g-print--script')}
      ${print('23', 450, 170)}
      ${print('EST. 2026', 510, 24)}`,
  },
  hoodie: {
    front: (brand) => `
      <path class="g-body g-shaded" d="M165 150Q170 70 230 70Q290 70 295 150Q230 205 165 150Z"/>
      <path class="g-hood-inner" d="M190 150Q195 100 230 100Q265 100 270 150Q230 182 190 150Z"/>
      ${SLEEVE_SEAMS}${ZIP}${HEM}
      ${print(brand, 340, 58)}
      <path class="g-seam" d="M150 620L176 500H284L310 620"/>`,
    back: (brand) => `
      <path class="g-body g-shaded" d="M165 150Q170 70 230 70Q290 70 295 150Q230 240 165 150Z"/>
      ${SLEEVE_SEAMS}${HEM}
      ${print(brand, 420, 70)}`,
  },
  jacket: {
    front: () => `
      <path class="g-trim-fill" d="M165 150L230 230L295 150L270 136L230 182L190 136Z"/>
      ${SLEEVE_SEAMS}${ZIP}
      <path class="g-seam" d="M262 290H320V350H262Z"/>
      <path class="g-seam" d="M146 490L196 470M314 490L264 470"/>`,
    back: (brand) => `
      <path class="g-trim-fill" d="M165 150Q230 186 295 150L270 136Q230 152 190 136Z"/>
      ${SLEEVE_SEAMS}
      <path class="g-seam" d="M122 300H338"/>
      ${print(brand, 420, 34)}`,
  },
  track: {
    front: (brand) => `
      <path class="g-trim-fill" d="M172 146L230 186L288 146L300 170L230 214L160 170Z"/>
      <path class="g-trim-line g-trim-line--wide" d="M102 190Q58 300 48 590M116 200Q76 300 64 592M358 190Q402 300 412 590M344 200Q384 300 396 592"/>
      ${SLEEVE_SEAMS}${ZIP}${HEM}
      ${print(brand, 300, 24)}`,
    back: (brand) => `
      <path class="g-trim-fill" d="M172 146Q230 178 288 146L300 170Q230 204 160 170Z"/>
      <path class="g-trim-line g-trim-line--wide" d="M102 190Q58 300 48 590M116 200Q76 300 64 592M358 190Q402 300 412 590M344 200Q384 300 396 592"/>
      ${SLEEVE_SEAMS}${HEM}
      ${print(brand, 400, 64)}`,
  },
};

/**
 * Draws one side of a garment. The colours come from --body, --trim and --print
 * on a parent element, and the shading from the gradient in index.html.
 *
 * @param {string} kind A garment kind from content.js.
 * @param {string} face A FACE value.
 * @param {string} brand The brand's name, for the prints.
 * @returns {string} The SVG markup.
 */
export function garmentArt(kind, face, brand) {
  const shape = SHAPES[kind];
  const details = DETAILS[kind]?.[face];

  if (!shape || !details) {
    throw new Error(`No drawing for the ${face} of "${kind}"`);
  }

  return `
    <svg class="face face--${face}" viewBox="${VIEW_BOX}" aria-hidden="true">
      <path class="g-body" d="${shape}"/>
      <path fill="url(#fabricShade)" d="${shape}"/>
      <path class="g-fold" d="M150 340Q172 480 146 620M312 320Q286 480 316 620M230 240Q214 420 236 620"/>
      ${details(brand)}
    </svg>`;
}
