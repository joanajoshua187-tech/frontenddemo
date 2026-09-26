import DOMPurify from 'dompurify'

const RICH_TEXT = {
  ALLOWED_TAGS: ['b', 'strong', 'em', 'p', 'ul', 'ol', 'li', 'br'],
  ALLOWED_ATTR: [],
}

export function sanitizeRichText(html) {
  return DOMPurify.sanitize(String(html ?? ''), RICH_TEXT)
}

export function cleanText(value) {
  return DOMPurify.sanitize(String(value ?? ''), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
}
