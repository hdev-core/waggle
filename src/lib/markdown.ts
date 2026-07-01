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

// Hive posts routinely wrap images in raw HTML (e.g. <center>![alt](url)</center>).
// CommonMark does NOT parse markdown inside HTML blocks, so those images would
// render as literal text. Pre-convert Hive's image forms to real <img> tags so
// they survive regardless of surrounding HTML — matching how Hive front ends
// (Condenser/PeakD) treat this content.
function preprocessHiveBody(body: string): string {
  let s = body
  // 1) markdown images ![alt](url "title") -> <img> (survives inside raw HTML)
  s = s.replace(
    /!\[([^\]]*)\]\((https?:\/\/[^)\s]+?)(?:\s+"[^"]*")?\)/g,
    (_m, alt: string, url) => `<img src="${url}" alt="${alt.replace(/"/g, '&quot;')}">`,
  )
  // 2) bare image URLs alone on a line -> <img> (Hive auto-embeds these)
  s = s.replace(
    /^[ \t]*(https?:\/\/[^\s<>()]+?\.(?:png|jpe?g|gif|webp|svg))[ \t]*$/gim,
    (_m, url) => `<img src="${url}">`,
  )
  // 3) @mentions -> profile links (Condenser behavior). Guarded so emails and
  //    URL fragments (preceded by a word char / '/' / '=') are left alone.
  s = s.replace(
    /(^|[\s(>])@([a-z][a-z0-9.-]{1,14}[a-z0-9])/gim,
    (_m, pre: string, user: string) => `${pre}[@${user}](https://peakd.com/@${user})`,
  )
  return s
}

export function renderMarkdown(body: string): string {
  const raw = marked.parse(preprocessHiveBody(body || ''), { async: false }) as string
  return DOMPurify.sanitize(raw, {
    ALLOWED_URI_REGEXP: /^(?:https?|ipfs|mailto):/i,
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input'],
    FORBID_ATTR: ['style', 'onerror', 'onload'],
  })
}
