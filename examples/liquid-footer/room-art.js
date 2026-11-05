/**
 * The colours of the room for each time of day. To use photos instead, have
 * main.js pass `url("photo.webp")` values in place of roomArt().
 */
export const PALETTES = {
  day: {
    wallTop: '#efe7da', wallBottom: '#d9c8ad', panel: '#c8b08c', niche: '#6d4a2a', nicheGlow: '#f5c98a',
    shelf: '#8c5f35', floorTop: '#b98a58', floorBottom: '#7c5533', sofa: '#e6ddcd', sofaShade: '#b7a68c',
    rug: '#d9c6a6', pot: '#f3ece0', potDark: '#a65f35', leaf: '#5f7a4a', lampGlow: 0.25,
  },
  night: {
    wallTop: '#1a1e2c', wallBottom: '#262a38', panel: '#14161f', niche: '#3a2410', nicheGlow: '#ffb45e',
    shelf: '#3d2813', floorTop: '#2e2116', floorBottom: '#16100b', sofa: '#3b3a42', sofaShade: '#1f1e26',
    rug: '#35302c', pot: '#b9a98f', potDark: '#6b3a1e', leaf: '#2c3d27', lampGlow: 0.85,
  },
};

/**
 * Draws a set of shelves with lit niches and pots.
 *
 * @param {number} x The left edge.
 * @param {typeof PALETTES.day} palette The colours.
 * @returns {string} The SVG markup.
 */
function shelves(x, palette) {
  return `
    <rect x="${x}" y="0" width="280" height="430" fill="${palette.niche}"/>
    <rect x="${x + 14}" y="30" width="252" height="170" fill="url(#niche)"/>
    <rect x="${x + 14}" y="214" width="252" height="190" fill="url(#niche)"/>
    <rect x="${x}" y="200" width="280" height="14" fill="${palette.shelf}"/>
    <rect x="${x}" y="404" width="280" height="26" fill="${palette.shelf}"/>
    <ellipse cx="${x + 90}" cy="162" rx="44" ry="38" fill="${palette.pot}"/>
    <rect x="${x + 72}" y="104" width="36" height="30" rx="6" fill="${palette.pot}"/>
    <rect x="${x + 170}" y="130" width="24" height="70" fill="${palette.potDark}"/>
    <rect x="${x + 198}" y="118" width="24" height="82" fill="${palette.pot}"/>
    <rect x="${x + 226}" y="140" width="22" height="60" fill="${palette.shelf}"/>
    <path d="M${x + 150} 404q-46-6-46-70q0-34 46-46q46 12 46 46q0 64-46 70z" fill="${palette.potDark}"/>
    <ellipse cx="${x + 60}" cy="384" rx="34" ry="20" fill="${palette.pot}"/>`;
}

/**
 * Draws the room as a data URI, ready for a CSS background. The busy shapes near
 * the bottom are what show through the cut-out wordmark.
 *
 * @param {typeof PALETTES.day} palette The colours.
 * @returns {string} A CSS url() value.
 */
export function roomArt(palette) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1400" preserveAspectRatio="none">
    <defs>
      <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${palette.wallTop}"/><stop offset="1" stop-color="${palette.wallBottom}"/>
      </linearGradient>
      <linearGradient id="niche" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${palette.nicheGlow}"/><stop offset="1" stop-color="${palette.niche}"/>
      </linearGradient>
      <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${palette.floorTop}"/><stop offset="1" stop-color="${palette.floorBottom}"/>
      </linearGradient>
      <radialGradient id="lamp"><stop offset="0" stop-color="#ffd9a0"/><stop offset="1" stop-color="#ffd9a0" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="1080" height="1400" fill="url(#wall)"/>
    <rect x="360" y="0" width="360" height="760" fill="${palette.panel}"/>
    <path d="M360 0V760M480 0V760M600 0V760M720 0V760" stroke="#000" stroke-opacity="0.14" stroke-width="3"/>
    ${shelves(70, palette)}
    ${shelves(730, palette)}
    <rect x="0" y="1010" width="1080" height="390" fill="url(#floor)"/>
    <path d="M0 1090H1080M0 1190H1080M0 1300H1080M180 1010L90 1400M420 1010L380 1400M660 1010L700 1400M900 1010L990 1400" stroke="#000" stroke-opacity="0.16" stroke-width="4"/>
    <rect x="0" y="760" width="1080" height="250" fill="${palette.wallBottom}"/>
    <circle cx="140" cy="820" r="260" fill="url(#lamp)" opacity="${palette.lampGlow}"/>
    <rect x="134" y="800" width="12" height="400" fill="${palette.shelf}"/>
    <path d="M90 800h100l-24-110h-52z" fill="${palette.pot}"/>
    <ellipse cx="520" cy="1330" rx="460" ry="70" fill="${palette.rug}"/>
    <rect x="250" y="980" width="640" height="150" rx="40" fill="${palette.sofa}"/>
    <rect x="210" y="1080" width="720" height="130" rx="36" fill="${palette.sofaShade}"/>
    <rect x="240" y="1060" width="330" height="100" rx="26" fill="${palette.sofa}"/>
    <rect x="580" y="1060" width="320" height="100" rx="26" fill="${palette.sofa}"/>
    <rect x="280" y="1210" width="20" height="60" fill="${palette.shelf}"/>
    <rect x="840" y="1210" width="20" height="60" fill="${palette.shelf}"/>
    <ellipse cx="540" cy="1275" rx="170" ry="32" fill="${palette.shelf}"/>
    <rect x="530" y="1275" width="20" height="70" fill="${palette.shelf}"/>
    <path d="M505 1244q35 26 70 0l-10-74h-50z" fill="${palette.potDark}"/>
    <path d="M980 1200c-70-120-60-250-10-330c30 90 80 200 60 330zM1000 1200c10-110 60-190 90-220c10 90-20 180-50 220z" fill="${palette.leaf}"/>
    <rect x="950" y="1190" width="90" height="120" rx="10" fill="${palette.pot}"/>
  </svg>`;

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
