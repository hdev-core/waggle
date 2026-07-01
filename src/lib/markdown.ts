import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { proxiedImage } from './post'

// Render Hive post/comment markdown to safe HTML. Hive content mixes markdown
// with raw HTML, so we parse with marked then hard-sanitize with DOMPurify.
// Images are routed through the Hive proxy and links open in a new tab.

marked.setOptions({ gfm: true, breaks: true })

// Route images through the proxy and harden links after sanitisation.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'IMG') {
    const src = node.getAttribute('src')
    if (src && /^https?:\/\//i.test(src)) node.setAttribute('src', proxiedImage(src, 640))
    node.setAttribute('loading', 'lazy')
    node.setAttribute('decoding', 'async')
  }
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer nofollow')
  }
})

export function renderMarkdown(body: string): string {
  const raw = marked.parse(body || '', { async: false }) as string
  return DOMPurify.sanitize(raw, {
    ALLOWED_URI_REGEXP: /^(?:https?|ipfs|mailto):/i,
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input'],
    FORBID_ATTR: ['style', 'onerror', 'onload'],
  })
}
