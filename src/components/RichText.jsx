import { sanitizeRichText } from '../utils/sanitize'

export function RichText({ html, as: Tag = 'div', className }) {
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: sanitizeRichText(html) }} />
}
