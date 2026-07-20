import { decodeHtmlEntities, FALLBACK_IMAGE } from "./wp-utils.js";
import {
  getProjectSlugFromQuery,
  fetchProjectBySlug,
  getProjectImage,
  UNTITLED_PROJECT_TITLE,
} from "./project-utils.js";
import { renderBreadcrumbs } from "./breadcrumbs.js";
import { initSocialShare } from "./shared/social-share.js";
import {
  setPageMeta,
  setCanonicalUrl,
  setOpenGraphTags,
  setTwitterCardTags,
  setStructuredData,
} from "./shared/seo.js";
import {
  setOptionalText,
  setSafeLink,
  setImageWithFallback,
  hasContent,
  fillMissingImageAlt,
} from "./shared/cms-validation.js";
import { showState } from "./shared/loading-state.js";
import { track } from "./shared/analytics.js";

function getRefs() {
  return {
    hero: document.querySelector(".main-content"),
    subtitleSection: document.querySelector(
      ".poised-to-disrupt-the-event-le-wrapper",
    ),
    clientName: document.getElementById("projectClientName"),
    heroSubtitle: document.getElementById("projectHeroSubtitle"),
    heroImage: document.getElementById("projectFeaturedImage"),
    shortDescription: document.getElementById("projectShortDescription"),
    content: document.getElementById("projectContent"),
    contentWrapper: document.querySelector(".article-content-wrapper"),
    servicesHeader: document.getElementById("projectServicesHeader"),
    serviceTagList: document.getElementById("projectServiceTagList"),
    websiteLink: document.getElementById("projectWebsiteLink"),
  };
}

function wrapHeadingParagraphPairs(container) {
  const children = Array.from(container.children);
  let currentGroup = null;
  let currentBody = null;

  children.forEach((child) => {
    if (child.classList.contains("wp-block-heading")) {
      currentGroup = document.createElement("div");
      currentGroup.className = "heading-paragraph-group";
      container.insertBefore(currentGroup, child);
      currentGroup.appendChild(child);

      currentBody = document.createElement("div");
      currentBody.className = "heading-paragraph-group__body";
      currentGroup.appendChild(currentBody);
    } else if (
      currentGroup &&
      currentBody &&
      (child.classList.contains("wp-block-paragraph") || child.tagName === "P")
    ) {
      currentBody.appendChild(child);
    } else {
      currentGroup = null;
      currentBody = null;
    }
  });
}

function renderServiceTags(refs, project) {
  const { servicesHeader, serviceTagList } = refs;
  if (!serviceTagList) return;

  const names = (Array.isArray(project.service_terms) ? project.service_terms : [])
    .map((term) => decodeHtmlEntities(term.name || "").trim())
    .filter(Boolean);

  serviceTagList.innerHTML = "";

  if (names.length === 0) {
    if (servicesHeader) servicesHeader.style.display = "none";
    serviceTagList.style.display = "none";
    return;
  }

  if (servicesHeader) servicesHeader.style.display = "";
  serviceTagList.style.display = "";

  names.forEach((name) => {
    const pill = document.createElement("div");
    pill.className = "backgroundborder";

    const label = document.createElement("div");
    label.className = "strategy";
    label.textContent = name;

    pill.appendChild(label);
    serviceTagList.appendChild(pill);
  });
}

function renderProject(refs, project) {
  const acf = project.acf || {};
  const title = decodeHtmlEntities(project.title?.rendered || UNTITLED_PROJECT_TITLE);
  const description = decodeHtmlEntities(acf.short_description || "");
  const heroSubtitle = decodeHtmlEntities(acf.hero_subtitle || "").trim();
  const image = getProjectImage(project);
  const url = window.location.href;
  const rawContent = project.content?.rendered || "";

  setPageMeta({ title, description });
  setCanonicalUrl(url);
  setOpenGraphTags({ title, description, image, url });
  setTwitterCardTags({ title, description, image, url });
  setStructuredData({ title, description, image, url });
  renderBreadcrumbs("project", title);

  setOptionalText(refs.clientName, decodeHtmlEntities(acf.client_name || ""));
  setOptionalText(refs.heroSubtitle, heroSubtitle);
  if (refs.subtitleSection) {
    refs.subtitleSection.style.display = heroSubtitle ? "" : "none";
  }
  setOptionalText(refs.shortDescription, description);
  setSafeLink(refs.websiteLink, decodeHtmlEntities(acf.project_website || ""));
  if (refs.websiteLink && !refs.websiteLink.hidden) {
    refs.websiteLink.addEventListener("click", () =>
      track("project_website_click", { slug: project.slug, title, destinationUrl: refs.websiteLink.href }),
    );
  }

  setImageWithFallback(refs.heroImage, image, FALLBACK_IMAGE, title);

  renderServiceTags(refs, project);

  // Rendered exactly as WordPress returns it — no stripping/sanitizing.
  if (refs.contentWrapper) {
    refs.contentWrapper.style.display = hasContent(rawContent) ? "" : "none";
  }
  refs.content.innerHTML = rawContent;
  fillMissingImageAlt(refs.content, `${title} project image`);
  wrapHeadingParagraphPairs(refs.content);

  initSocialShare({ title, description, url, image, slug: project.slug });

  track("project_page_view", { slug: project.slug, title });
}

function hideHero(refs) {
  if (refs.hero) refs.hero.style.display = "none";
  if (refs.subtitleSection) refs.subtitleSection.style.display = "none";
}

function renderNotFound(refs) {
  hideHero(refs);
  showState(
    refs.content,
    "This project doesn't exist or may have been removed.",
    { actions: [{ label: "Browse All Projects", href: "projects.html" }] },
  );
}

function renderErrorState(refs) {
  hideHero(refs);
  showState(refs.content, "We couldn’t load this project right now.", {
    actions: [{ label: "Try Again", onClick: () => window.location.reload() }],
  });
}

async function init() {
  const refs = getRefs();
  if (!refs.content) return;

  const slug = getProjectSlugFromQuery();
  if (!slug) {
    renderNotFound(refs);
    return;
  }

  showState(refs.content, "Loading project…");

  try {
    const project = await fetchProjectBySlug(slug);
    if (!project) {
      renderNotFound(refs);
      return;
    }
    renderProject(refs, project);
  } catch (err) {
    console.error("Error loading project:", err);
    renderErrorState(refs);
  }
}

document.addEventListener("DOMContentLoaded", init);
