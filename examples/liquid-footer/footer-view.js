const ICONS = [
  '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 8l9 6 9-6"/>',
  '<path d="M5 19a1 1 0 1 0 0-.1zM5 11a8 8 0 0 1 8 8M5 5a14 14 0 0 1 14 14"/>',
  '<path d="M12 21s7-6.4 7-11.5a7 7 0 1 0-14 0C5 14.600 12 21 12 21z"/><circle cx="12" cy="9.500" r="2.400"/>',
];
const ACTIVE_CLASS = 'is-active';
const RIPPLE_CLASS = 'ripple';
const REVEAL_STEP_COUNT = { brand: 0, headline: 1, form: 2, note: 3, links: 4, meta: 5, wordmark: 6 };

/**
 * @param {string} name A reveal step.
 * @returns {string} The attributes that stagger an element into view.
 */
function reveal(name) {
  return `style="--i:${REVEAL_STEP_COUNT[name]}"`;
}

/**
 * Draws the footer's contents and shows what it's told to. The rules about what
 * happens when live in LiquidScene.
 */
export class FooterView {
  #root;

  /**
   * @param {HTMLElement} root The element to fill.
   * @param {typeof import('./content.js').CONTENT} content The footer's words.
   */
  constructor(root, content) {
    this.#root = root;
    this.#root.innerHTML = this.#render(content);
  }

  /**
   * Finds a control, for the demo script to aim at.
   *
   * @param {string} id "link-0" and up, or "theme".
   * @returns {HTMLElement|null} The matching element.
   */
  item(id) {
    return this.#root.querySelector(`[data-item="${id}"]`);
  }

  /** @returns {HTMLElement} The dotless "i" in the wordmark. */
  get dotlessLetter() {
    return this.#root.querySelector('.wordmark__dotless');
  }

  /** @returns {number} The wordmark's top edge, in window pixels. */
  get wordmarkTop() {
    return this.#root.querySelector('.wordmark').getBoundingClientRect().top;
  }

  /**
   * Highlights one link, or none.
   *
   * @param {Element|null} link The link to highlight.
   * @returns {void}
   */
  setActiveLink(link) {
    this.#root.querySelectorAll(`.link.${ACTIVE_CLASS}`).forEach((element) => {
      element.classList.remove(ACTIVE_CLASS);
    });
    link?.classList.add(ACTIVE_CLASS);
  }

  /**
   * Sends one ripple across the glass. It removes itself when it's done.
   *
   * @param {{x: number, y: number}} point Its center, in footer pixels.
   * @returns {void}
   */
  ripple({ x, y }) {
    const ripple = document.createElement('span');

    ripple.className = RIPPLE_CLASS;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.addEventListener('animationend', () => ripple.remove());
    this.#root.append(ripple);
  }

  /**
   * Removes any ripples still running.
   *
   * @returns {void}
   */
  clearRipples() {
    this.#root.querySelectorAll(`.${RIPPLE_CLASS}`).forEach((ripple) => ripple.remove());
  }

  /**
   * @param {typeof import('./content.js').CONTENT} content The footer's words.
   * @returns {string} The footer's markup.
   */
  #render(content) {
    const { before, dotless, after } = content.wordmark;
    const letters = `${before}<span class="wordmark__dotless">${dotless}</span>${after}`;
    const icons = ICONS
      .map((icon) => `<span class="meta__icon"><svg viewBox="0 0 24 24">${icon}</svg></span>`)
      .join('');

    return `
      <div class="brand reveal" ${reveal('brand')}>
        <span class="brand__tile">${content.brand[0]}</span>${content.brand}
      </div>
      <h2 class="headline reveal" ${reveal('headline')}>${content.headline.join('<br>')}</h2>
      <div class="form reveal" ${reveal('form')}>
        <span class="form__field">${content.placeholder}</span>
        <span class="form__submit">${content.subscribe}</span>
      </div>
      <p class="note reveal" ${reveal('note')}>${content.note}</p>
      <nav class="links reveal" ${reveal('links')}>${this.#renderColumns(content.columns)}</nav>
      <div class="meta reveal" ${reveal('meta')}>
        <span class="meta__status"><i class="meta__dot"></i>${content.status}</span>
        <span class="meta__icons">${icons}</span>
        <button class="toggle" type="button" data-item="theme">
          ${content.theme}<span class="toggle__track"><span class="toggle__thumb"></span></span>
        </button>
      </div>
      <p class="copyright reveal" ${reveal('meta')}>${content.copyright}</p>
      <div class="wordmark reveal" ${reveal('wordmark')} aria-hidden="true">
        <span class="wordmark__layer wordmark__layer--day">${letters}</span>
        <span class="wordmark__layer wordmark__layer--night">${letters}</span>
      </div>`;
  }

  /**
   * Numbers the links straight through the columns, so the demo can aim at them.
   *
   * @param {typeof import('./content.js').CONTENT['columns']} columns The columns.
   * @returns {string} The columns' markup.
   */
  #renderColumns(columns) {
    let index = 0;

    return columns.map(({ title, links }) => {
      const items = links.map((label) => {
        const link = `<button class="link" type="button" data-item="link-${index}">${label}</button>`;

        index += 1;

        return link;
      }).join('');

      return `<div class="links__column"><h3 class="links__title">${title}</h3>${items}</div>`;
    }).join('');
  }
}
