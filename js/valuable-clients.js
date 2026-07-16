document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('valuableClientsToggle');
  const more = document.getElementById('valuableClientsMore');
  if (!toggle || !more) return;

  const label = toggle.querySelector('.valuable-clients__toggle-label');

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    more.classList.toggle('is-open', open);
    more.style.maxHeight = open ? `${more.scrollHeight}px` : '0px';
    if (label) label.textContent = open ? 'View less' : 'View more';
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  window.addEventListener('resize', () => {
    if (more.classList.contains('is-open')) {
      more.style.maxHeight = `${more.scrollHeight}px`;
    }
  });
});
