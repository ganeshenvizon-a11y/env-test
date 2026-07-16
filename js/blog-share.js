import { decodeHtmlEntities } from './wp-utils.js';

function buildShareUrls(pageUrl, title) {
    const encodedUrl = encodeURIComponent(pageUrl);
    const encodedTitle = encodeURIComponent(title);
    return {
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
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

function renderShare(refs, post) {
    const title = decodeHtmlEntities(post.title?.rendered || '');
    const url = window.location.href;
    const urls = buildShareUrls(url, title);

    refs.linkedin.href = urls.linkedin;
    refs.facebook.href = urls.facebook;
    refs.twitter.href = urls.twitter;

    initCopyLink(refs.copyLink, refs.toast, url);

    refs.section.hidden = false;
}

function init() {
    const refs = {
        section: document.getElementById('articleShare'),
        linkedin: document.getElementById('shareLinkedIn'),
        facebook: document.getElementById('shareFacebook'),
        twitter: document.getElementById('shareTwitter'),
        copyLink: document.getElementById('shareCopyLink'),
        toast: document.getElementById('shareToast')
    };
    if (!refs.section) return;

    window.addEventListener('blog:article-loaded', (event) => {
        renderShare(refs, event.detail.post);
    }, { once: true });
}

document.addEventListener('DOMContentLoaded', init);
