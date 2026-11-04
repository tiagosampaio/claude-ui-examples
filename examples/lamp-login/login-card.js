const LOADING_MS = 800;
const LOADING_CLASS = 'is-loading';
const DONE_CLASS = 'is-done';
const FOCUSED_CLASS = 'is-focused';

/**
 * Builds a labelled input.
 *
 * @param {{id: string, label: string, placeholder: string}} field The field content.
 * @param {string} type The input type.
 * @param {number} index Its position in the card's stagger.
 * @param {string} [extra] Extra markup inside the box.
 * @returns {string} The field markup.
 */
function renderField({ id, label, placeholder }, type, index, extra = '') {
  return `
    <div class="field card__item" style="--i:${index}" data-field="${id}">
      <label class="field__label" for="${id}">${label}</label>
      <div class="field__box" data-item="${id}">
        <input class="field__input" id="${id}" type="${type}" placeholder="${placeholder}"
          autocomplete="off" spellcheck="false">
        ${extra}
      </div>
    </div>`;
}

/**
 * The login form that appears when the light comes on. It's a prop: signing in
 * only plays the button's animation, and nothing is sent anywhere.
 */
export class LoginCard {
  #form;
  #submit;
  #timer = null;

  /**
   * @param {HTMLFormElement} form The element to render into.
   * @param {typeof import('./content.js').CONTENT} content The card's words.
   */
  constructor(form, content) {
    this.#form = form;
    this.#form.innerHTML = this.#render(content);
    this.#submit = form.querySelector('.submit');
    this.#form.addEventListener('click', (event) => this.#onClick(event));
    this.#form.addEventListener('submit', (event) => event.preventDefault());
  }

  /**
   * Finds a control by id, for the demo script to aim at.
   *
   * @param {string} id A field id, or "submit".
   * @returns {HTMLElement|null} The matching element.
   */
  item(id) {
    return this.#form.querySelector(`[data-item="${id}"]`);
  }

  /**
   * Adds one character to a field, as if typed.
   *
   * @param {string} id The field id.
   * @param {string} character The character to add.
   * @returns {void}
   */
  type(id, character) {
    this.#form.querySelector(`#${id}`).value += character;
  }

  /**
   * Empties the form and returns the button to its first state.
   *
   * @returns {void}
   */
  clear() {
    clearTimeout(this.#timer);
    this.#form.querySelectorAll('.field__input').forEach((input) => {
      input.value = '';
    });
    this.#submit.classList.remove(LOADING_CLASS, DONE_CLASS);
    this.#setFocus(null);
  }

  /**
   * @param {MouseEvent} event The click event.
   * @returns {void}
   */
  #onClick(event) {
    const { target } = event;

    if (target.closest('.field__show')) {
      this.#togglePasswordVisibility(target.closest('.field__show'));
    } else if (target.closest('.submit')) {
      this.#signIn();
    } else {
      this.#setFocus(target.closest('[data-field]'));
    }
  }

  /**
   * Plays the button's loading and success states.
   *
   * @returns {void}
   */
  #signIn() {
    if (this.#submit.classList.contains(LOADING_CLASS)) {
      return;
    }

    this.#setFocus(null);
    this.#submit.classList.remove(DONE_CLASS);
    this.#submit.classList.add(LOADING_CLASS);
    this.#timer = setTimeout(() => {
      this.#submit.classList.replace(LOADING_CLASS, DONE_CLASS);
    }, LOADING_MS);
  }

  /**
   * Highlights one field. The class stands in for :focus because a synthetic
   * click doesn't move browser focus, and the demo needs to look the same.
   *
   * @param {HTMLElement|null} field The field wrapper to highlight.
   * @returns {void}
   */
  #setFocus(field) {
    this.#form.querySelectorAll(`.${FOCUSED_CLASS}`).forEach((element) => {
      element.classList.remove(FOCUSED_CLASS);
    });
    field?.classList.add(FOCUSED_CLASS);
    field?.querySelector('input')?.focus();
  }

  /**
   * @param {HTMLElement} button The show/hide button.
   * @returns {void}
   */
  #togglePasswordVisibility(button) {
    const input = button.parentElement.querySelector('input');
    const isHidden = input.type === 'password';

    input.type = isHidden ? 'text' : 'password';
    button.textContent = isHidden ? 'Hide' : 'Show';
  }

  /**
   * @param {typeof import('./content.js').CONTENT} content The card's words.
   * @returns {string} The form markup.
   */
  #render(content) {
    const showButton = '<button class="field__show" type="button">Show</button>';
    const alternatives = content.alternatives
      .map((label) => `<button class="alt" type="button">${label}</button>`)
      .join('');

    return `
      <p class="card__eyebrow card__item" style="--i:0">${content.eyebrow}</p>
      <h2 class="card__heading card__item" style="--i:1">
        ${content.heading}<em>${content.headingAccent}</em>
      </h2>
      ${renderField(content.email, 'email', 2)}
      ${renderField(content.password, 'password', 3, showButton)}
      <div class="card__row card__item" style="--i:4">
        <label class="check">
          <input type="checkbox" checked>
          <span class="check__box"></span>
          ${content.remember}
        </label>
        <span class="card__link">${content.forgot}</span>
      </div>
      <div class="card__item" style="--i:5">
        <button class="submit" type="button" data-item="submit">
          <span class="submit__label">${content.submit}</span>
          <span class="submit__spinner"></span>
          <span class="submit__done">${content.submitDone}</span>
        </button>
      </div>
      <div class="divider card__item" style="--i:6">${content.divider}</div>
      <div class="card__alts card__item" style="--i:7">${alternatives}</div>
      <p class="card__foot card__item" style="--i:8">${content.footer}</p>`;
  }
}
