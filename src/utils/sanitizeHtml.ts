import DOMPurify from 'dompurify';

const purifier = DOMPurify(window);

const REMOTE_URL = /^(?:https?:)?\/\//i;

purifier.addHook('afterSanitizeAttributes', (node) => {
  // Links: always open in a new tab without leaking opener/referrer.
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }

  // Block remote content (tracking pixels, remote images). Only inline data: images stay.
  if (node.tagName === 'IMG') {
    const src = node.getAttribute('src') || '';
    if (REMOTE_URL.test(src) || !src.startsWith('data:image/')) {
      node.remove();
    }
  }
});

/**
 * Sanitizes untrusted email HTML. Scripts, event handlers, styles, forms,
 * embedded frames and remote images are removed; links get
 * rel="noopener noreferrer" and open in a new tab.
 */
export const sanitizeHtml = (dirty: string): string =>
  purifier.sanitize(dirty, {
    FORBID_TAGS: ['style', 'form', 'iframe', 'object', 'embed', 'link', 'meta', 'base', 'video', 'audio', 'source'],
    FORBID_ATTR: ['style', 'srcset', 'background'],
    ALLOW_DATA_ATTR: false,
  });
