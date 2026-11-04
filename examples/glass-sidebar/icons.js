const ICON_PATHS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/>',
  grid: '<circle cx="7.5" cy="7.5" r="3.5"/><circle cx="16.5" cy="7.5" r="3.5"/><circle cx="7.5" cy="16.5" r="3.5"/><circle cx="16.5" cy="16.5" r="3.5"/>',
  bolt: '<path d="M13 2 4.5 13.5H11L10 22l9-12h-6.5z"/>',
  wallet: '<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10h18M6 6l1-2h10l1 2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01"/>',
  chat: '<path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.6-5.2A8.5 8.5 0 1 1 21 11.5z"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 12.5 9 5 9-5M3 16.5l9 5 9-5"/>',
  bars: '<path d="M4 20h16M7 16V11M12 16V5M17 16V8"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3 7 7M17 17l1.7 1.7M18.7 5.3 17 7M7 17l-1.7 1.7"/><circle cx="12" cy="12" r="7"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3 7 7M17 17l1.7 1.7M18.7 5.3 17 7M7 17l-1.7 1.7"/>',
  chevronRight: '<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>',
  chevronUp: '<path d="m6 15 6-6 6 6"/>',
  chevronsVertical: '<path d="m8 9 4-4 4 4M8 15l4 4 4-4"/>',
};

/**
 * Builds an inline stroke icon that inherits the surrounding text color.
 *
 * @param {keyof typeof ICON_PATHS} name The icon to draw.
 * @param {string} [className] Optional class for the svg element.
 * @returns {string} The svg markup.
 */
export function icon(name, className = '') {
  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name]}</svg>`;
}
