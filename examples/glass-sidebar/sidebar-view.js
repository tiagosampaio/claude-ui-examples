import { icon } from './icons.js';

/**
 * Builds the icon column shared by every row.
 *
 * @param {string} name The icon name.
 * @param {boolean} [dot] Whether to show the collapsed notification dot.
 * @returns {string} The slot markup.
 */
function renderSlot(name, dot = false) {
  return `
    <span class="slot">
      <span class="slot__glyph">
        ${icon(name)}
        ${dot ? '<span class="slot__dot"></span>' : ''}
      </span>
    </span>`;
}

/**
 * Builds a row's right-hand detail: a count, a status dot or a chevron.
 *
 * @param {object} row A row from the content config.
 * @returns {string} The trailing markup, empty when the row has none.
 */
function renderTrail(row) {
  if (row.children) {
    return `<span class="row__trail fade-in">${icon('chevronUp', 'chevron chevron--tree')}</span>`;
  }

  if (row.count !== undefined) {
    const variant = row.accent ? ' count--accent' : '';

    return `<span class="row__trail fade-in"><span class="count${variant}">${row.count}</span></span>`;
  }

  return row.status ? '<span class="row__trail fade-in"><span class="status-dot"></span></span>' : '';
}

/**
 * Builds one navigation row, plus its nested list when it has children.
 *
 * @param {object} row A row from the content config.
 * @returns {string} The row markup.
 */
function renderRow(row) {
  const children = row.children?.map((child) => `
    <button class="row subrow" type="button" data-hover>
      <span class="subrow__dot fade-in" style="background:${child.color};color:${child.color}"></span>
      <span class="row__label fade-in">${child.label}</span>
    </button>`).join('');

  return `
    <button class="row dock-item" type="button" data-item="${row.id}" data-hover
      data-tip="${row.label}" data-count="${row.count ?? ''}">
      ${renderSlot(row.icon, row.dot)}
      <span class="row__label fade-in">${row.label}</span>
      ${renderTrail(row)}
    </button>
    ${children ? `<div class="sublist"><div class="sublist__inner">${children}</div></div>` : ''}`;
}

/**
 * Builds a section header followed by its rows.
 *
 * @param {object} section A section from the content config.
 * @returns {string} The section markup.
 */
function renderSection(section) {
  return `
    <div class="section">
      <span class="section__divider"></span>
      <span class="section__label">${section.title}</span>
    </div>
    ${section.rows.map(renderRow).join('')}`;
}

/**
 * Builds the complete sidebar. Content comes only from the local config, so
 * setting it through innerHTML is safe.
 *
 * @param {typeof import('./content.js').CONTENT} content The sidebar content.
 * @returns {string} The sidebar markup.
 */
export function renderSidebar({ brand, search, sections, night, user }) {
  return `
    <div class="sidebar__panel">
      <div class="head">
        <span class="head__logo">${brand.initial}</span>
        <span class="head__text fade-in">
          <span class="head__name">${brand.name}</span>
          <span class="head__sub">${brand.subtitle}</span>
        </span>
      </div>

      <button class="row dock-item search" type="button" data-item="${search.id}" data-hover
        data-tip="Search" data-count="${search.shortcut}">
        ${renderSlot(search.icon)}
        <span class="row__label fade-in">${search.label}</span>
        <span class="row__trail fade-in"><span class="kbd">${search.shortcut}</span></span>
      </button>

      <nav class="nav">
        <span class="pill pill--hover"></span>
        <span class="pill pill--active"></span>
        ${sections.map(renderSection).join('')}
      </nav>

      <div class="foot">
        <button class="row dock-item" type="button" data-item="${night.id}" data-hover
          data-tip="${night.label}" data-count="">
          ${renderSlot(night.icon)}
          <span class="row__label fade-in">${night.label}</span>
          <span class="row__trail fade-in"><span class="switch"></span></span>
        </button>
        <div class="foot__rule"></div>
        <button class="row user" type="button" data-hover data-tip="${user.name}" data-count="">
          <span class="slot">
            <span class="user__avatar">${user.initials}<span class="user__status"></span></span>
          </span>
          <span class="row__label user__text fade-in">
            <span class="user__name">${user.name}</span>
            <span class="user__mail">${user.email}</span>
          </span>
          <span class="row__trail fade-in">${icon('chevronsVertical', 'chevron')}</span>
        </button>
      </div>
    </div>

    <button class="toggle" type="button" data-item="toggle" aria-label="Toggle sidebar">
      ${icon('chevronRight')}
    </button>

    <div class="tooltip" role="tooltip">
      <span class="tooltip__label"></span>
      <span class="tooltip__count"></span>
    </div>`;
}
