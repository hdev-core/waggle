// Inline SVG icons for the action rail. Stroke uses currentColor so active/idle
// colouring is driven by CSS. 26px default, consistent 2px stroke.
type P = { size?: number; filled?: boolean }
const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

export function IconHeart({ size = 26, filled }: P) {
  return (
    <svg {...base(size)} fill={filled ? 'currentColor' : 'none'}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  )
}

export function IconComment({ size = 26 }: P) {
  return (
    <svg {...base(size)}>
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-4-.9L3 21l1.9-4.5A8.4 8.4 0 0 1 3.6 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z" />
    </svg>
  )
}

export function IconReblog({ size = 26 }: P) {
  return (
    <svg {...base(size)}>
      <path d="M17 2l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 22l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  )
}

export function IconFollow({ size = 26, filled }: P) {
  return (
    <svg {...base(size)}>
      <circle cx="9" cy="8" r="3.2" fill={filled ? 'currentColor' : 'none'} />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      {filled ? <path d="M17 8.5l1.6 1.6L22 6.7" /> : <><path d="M19 7v6" /><path d="M16 10h6" /></>}
    </svg>
  )
}

export function IconInfo({ size = 26 }: P) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}
