import { useEffect, useRef, useState } from 'react'

// Tracks whether an element is at/near the viewport. rootMargin lets us start
// loading a slide's media one screen early so swiping feels instant, while
// off-screen slides stay cheap (no heavy image/iframe mounted).
export function useInView<T extends Element>(rootMargin = '150% 0px') {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setInView(true), // latch on; never unload once seen-near
      { rootMargin, threshold: 0 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin])

  return { ref, inView }
}
