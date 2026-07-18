// Shared breadcrumb renderer. Each page keeps a static container in its
// markup (<nav id="breadcrumbs" hidden><ol class="breadcrumbs__list"></ol></nav>);
// this module is the only place that builds and writes the <li> items into
// it, so no page script duplicates that rendering logic. Adding a new page
// type (Blogs, Services, Careers, ...) is just a new TRAILS entry — no
// change to renderBreadcrumbs itself.
const TRAILS = {
  projects: [
    { label: "Home", href: "index.html" },
    { label: "Projects" },
  ],
  project: [
    { label: "Home", href: "index.html" },
    { label: "Projects", href: "projects.html" },
    { dynamic: true },
  ],
};

function resolveTrail(pageType, title) {
  const trail = TRAILS[pageType];
  if (!trail) return null;

  return trail.map((crumb) => ({
    label: crumb.dynamic ? title : crumb.label,
    href: crumb.href || null,
  }));
}

function createItem(crumb, isLast) {
  const li = document.createElement("li");
  li.className = "breadcrumbs__item";

  if (crumb.href && !isLast) {
    const link = document.createElement("a");
    link.className = "breadcrumbs__link";
    link.href = crumb.href;
    link.textContent = crumb.label;
    li.appendChild(link);
  } else {
    const current = document.createElement("span");
    current.className = "breadcrumbs__current";
    current.setAttribute("aria-current", "page");
    current.textContent = crumb.label;
    li.appendChild(current);
  }

  return li;
}

/**
 * Renders a breadcrumb trail into the page's static #breadcrumbs container.
 * `pageType` selects a predefined trail from TRAILS above; `title` fills the
 * dynamic final crumb for detail pages (e.g. the current project's name) and
 * is ignored for page types whose trail is fully static.
 */
export function renderBreadcrumbs(pageType, title) {
  const nav = document.getElementById("breadcrumbs");
  if (!nav) return;

  const list = nav.querySelector(".breadcrumbs__list");
  if (!list) return;

  const trail = resolveTrail(pageType, title);
  if (!trail || trail.some((crumb) => !crumb.label)) return;

  list.innerHTML = "";
  trail.forEach((crumb, index) => {
    list.appendChild(createItem(crumb, index === trail.length - 1));
  });

  nav.hidden = false;
}
