// Shared loading/error/empty-state UI builder. The one place that renders a
// ".loading-state" message box (see assets/css/components/loading-state.css)
// with zero or more actions — used for "Loading…", "couldn't load, Try
// Again", "not found, Browse All Projects", and "no results, Clear Filters"
// across both project.js and projects.js so neither duplicates the markup.

/**
 * @param {HTMLElement} container - cleared and filled with the state box
 * @param {string} message
 * @param {Object} [options]
 * @param {Array<{label: string, onClick?: Function, href?: string}>} [options.actions]
 *   Each action renders as a <button> (needs onClick) or an <a> (needs href).
 */
export function showState(container, message, { actions = [] } = {}) {
  container.innerHTML = "";
  const state = document.createElement("div");
  state.className = "loading-state";
  state.setAttribute("role", "status");
  state.textContent = message;

  actions.forEach(({ label, onClick, href }) => {
    const el = document.createElement(href ? "a" : "button");
    el.className = "btn btn-secondary";
    el.textContent = label;
    if (href) {
      el.href = href;
    } else {
      el.type = "button";
      el.addEventListener("click", onClick);
    }
    state.appendChild(document.createElement("br"));
    state.appendChild(el);
  });

  container.appendChild(state);
}
