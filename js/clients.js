/* Trusted By Growing Brands Worldwide — marker rendering + click-to-update details */

const LOCATIONS = [
  {
    id: "toronto-canada",
    label: "Toronto, Canada",
    x: 25,
    y: 26,
    detail: "Placeholder detail copy — serving ambitious brands across North America's competitive tech and retail markets.",
  },
  {
    id: "dusseldorf-germany",
    label: "Düsseldorf, Germany",
    x: 55,
    y: 22,
    detail: "Placeholder detail copy — a key partner base in Central Europe, spanning industrial and consumer brands.",
  },
  {
    id: "luxembourg",
    label: "Luxembourg",
    x: 48,
    y: 30,
    detail: "Placeholder detail copy — supporting finance and logistics clients from the heart of the EU.",
  },
  {
    id: "hyderabad-india",
    label: "Hyderabad, India",
    x: 71,
    y: 48,
    detail: "Placeholder detail copy — home turf, where Envizon Studio is headquartered and grows alongside local innovators.",
  },
  {
    id: "fiji-islands",
    label: "Fiji Islands",
    x: 97,
    y: 79,
    detail: "Placeholder detail copy — extending our reach into the Pacific, partnering with tourism and hospitality brands.",
  },
];

function renderMarkers(container) {
  container.innerHTML = "";

  LOCATIONS.forEach((location) => {
    const marker = document.createElement("button");
    marker.type = "button";
    marker.className = "location-marker";
    marker.style.left = `${location.x}%`;
    marker.style.top = `${location.y}%`;
    marker.dataset.id = location.id;
    marker.setAttribute("role", "listitem");
    marker.setAttribute("aria-label", location.label);
    marker.setAttribute("aria-pressed", "false");

    marker.innerHTML = `
      <span class="location-label">${location.label}</span>
      <span class="location-marker__ring" aria-hidden="true"></span>
    `;

    container.appendChild(marker);
  });
}

function updateDetails(details, location) {
  const title = details.querySelector(".trusted-brands__details-title");
  const text = details.querySelector(".trusted-brands__details-text");

  details.classList.add("is-updating");
  window.setTimeout(() => {
    title.textContent = location.label;
    text.textContent = location.detail;
    details.classList.remove("is-updating");
  }, 150);
}

function setActiveMarker(container, details, id) {
  const markers = container.querySelectorAll(".location-marker");

  markers.forEach((marker) => {
    const isActive = marker.dataset.id === id;
    marker.classList.toggle("is-active", isActive);
    marker.setAttribute("aria-pressed", String(isActive));
  });

  const location = LOCATIONS.find((item) => item.id === id);
  if (location && details) {
    updateDetails(details, location);
  }
}

function initMarkerInteractions(container, details) {
  container.addEventListener("click", (event) => {
    const marker = event.target.closest(".location-marker");
    if (!marker) return;
    setActiveMarker(container, details, marker.dataset.id);
  });
}

function initIntersectionObserver(section) {
  if (!("IntersectionObserver" in window)) {
    section.classList.add("is-visible");
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          section.classList.add("is-visible");
          observer.unobserve(section);
        }
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(section);
}

function initTrustedBrands() {
  const section = document.getElementById("trustedBrands");
  if (!section) return;

  const markerContainer = document.getElementById("trustedBrandsMarkers");
  const details = document.getElementById("trustedBrandsDetails");

  if (markerContainer) {
    renderMarkers(markerContainer);
    initMarkerInteractions(markerContainer, details);
    setActiveMarker(markerContainer, details, LOCATIONS[0].id);
  }

  initIntersectionObserver(section);
}

document.addEventListener("DOMContentLoaded", initTrustedBrands);
