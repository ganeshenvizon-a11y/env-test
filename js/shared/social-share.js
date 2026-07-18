// Shared "Share this" widget, used verbatim by Blog (blog-single.html /
// js/blog-share.js) and Projects (project.html / js/project.js) — same
// markup ids (#articleShare etc.) and same assets/css/components/blog-share.css
// on both pages, so this is the one place the sharing logic itself lives.

function buildShareUrls(url, title) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  return {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
  };
}

async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

function initCopyLink(button, toast, url) {
  let hideTimer = null;

  button.addEventListener('click', async () => {
    try {
      await copyToClipboard(url);
    } catch (err) {
      console.error('Error copying link:', err);
      return;
    }

    toast.hidden = false;
    toast.classList.add('is-visible');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 2000);
  });
}

function getRefs() {
  return {
    section: document.getElementById('articleShare'),
    linkedin: document.getElementById('shareLinkedIn'),
    facebook: document.getElementById('shareFacebook'),
    twitter: document.getElementById('shareTwitter'),
    copyLink: document.getElementById('shareCopyLink'),
    toast: document.getElementById('shareToast'),
  };
}

/**
 * Populates the #articleShare widget with share links for the given content
 * and reveals it. `description` and `image` are accepted so every caller
 * (blog post, project) can pass the same content shape regardless of which
 * platforms end up needing them — LinkedIn/Facebook/X/Copy Link only need
 * title and url today.
 */
export function initSocialShare({ title, url }) {
  const refs = getRefs();
  if (!refs.section) return;

  const urls = buildShareUrls(url, title);
  if (refs.linkedin) refs.linkedin.href = urls.linkedin;
  if (refs.facebook) refs.facebook.href = urls.facebook;
  if (refs.twitter) refs.twitter.href = urls.twitter;

  if (refs.copyLink && refs.toast) {
    initCopyLink(refs.copyLink, refs.toast, url);
  }

  refs.section.hidden = false;
}
