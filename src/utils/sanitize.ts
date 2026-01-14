import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Uses DOMPurify which is a trusted, well-maintained library
 */
export const sanitizeHtml = (dirty: string | null | undefined): string => {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'b', 'i', 'em', 'strong', 'u', 's', 'strike',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'img', 'blockquote', 'pre', 'code',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span', 'hr'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'id',
      'width', 'height', 'style'
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
    // Force all links to open in new tab with noopener
    FORCE_BODY: true
  });
};

/**
 * Sanitize HTML and strip all tags - returns plain text only
 */
export const stripHtmlTags = (dirty: string | null | undefined): string => {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
};

export default sanitizeHtml;
