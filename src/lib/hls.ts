// Pure HLS-manifest helpers, extracted from HlsVideo for testability.

// Choose a single variant (media playlist) from an HLS master. We deliberately
// bypass the master's CODECS attribute: many 3Speak masters declare only the
// audio codec (e.g. CODECS="mp4a.40.2", no avc1), which makes players build an
// audio-only pipeline → sound but no picture. A media playlist carries no codec
// hint, so hls.js reads the real codec from the (muxed H.264+AAC) segments.
// Prefer the highest rendition <=720p (feed-friendly), else the smallest.
export function pickVariant(master: string, baseUrl: string): string | null {
  const lines = master.split(/\r?\n/)
  const variants: { h: number; uri: string }[] = []
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('#EXT-X-STREAM-INF')) {
      const m = lines[i].match(/RESOLUTION=\d+x(\d+)/i)
      const uri = lines[i + 1]?.trim()
      if (uri && !uri.startsWith('#')) variants.push({ h: m ? parseInt(m[1], 10) : 0, uri })
    }
  }
  if (!variants.length) return null
  const le720 = variants.filter((v) => v.h && v.h <= 720).sort((a, b) => b.h - a.h)
  const chosen = le720[0] || [...variants].sort((a, b) => a.h - b.h)[0]
  try {
    return new URL(chosen.uri, baseUrl).href
  } catch {
    return null
  }
}

// Safety net for master playlists that declare only the audio codec (no avc1) —
// inject a generic H.264 codec so hls.js builds a video track instead of an
// audio-only pipeline. No-op for media playlists (no EXT-X-STREAM-INF) and for
// masters that already list a video codec.
export function fixMasterCodecs(text: string): string {
  if (typeof text !== 'string' || !text.includes('#EXT-X-STREAM-INF')) return text
  return text.replace(/CODECS="([^"]*)"/g, (m, codecs: string) =>
    /avc1|avc3|hvc1|hev1|vp0?9|av01/i.test(codecs) ? m : `CODECS="avc1.4d401f,${codecs}"`,
  )
}
