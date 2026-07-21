'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/*
  Scroll-triggered reveal. IntersectionObserver flips data-visible on first
  intersection; the CSS animation (see editable-global.css) plays after mount
  so nothing is hidden on server render. `index` staggers the delay so a
  cluster of adjacent reveals cascades. Reduced motion is honoured in CSS.
*/
type Props = {
  children: ReactNode
  index?: number
  as?: 'div' | 'section' | 'article' | 'header' | 'footer' | 'aside' | 'span' | 'li'
  className?: string
  style?: CSSProperties
  once?: boolean
  delayMs?: number
  step?: number
  threshold?: number
}

export function EditableReveal({
  children,
  index = 0,
  as: Tag = 'div',
  className = '',
  style,
  once = true,
  delayMs = 60,
  step = 90,
  threshold = 0.12,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            if (once) io.unobserve(entry.target)
          } else if (!once) {
            setVisible(false)
          }
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [mounted, once, threshold])

  const revealStyle: CSSProperties = {
    ...style,
    ['--reveal-delay' as string]: `${delayMs + Math.max(0, index) * step}ms`,
  }

  return (
    <Tag
      ref={ref as never}
      className={`editable-reveal ${className}`}
      data-visible={mounted && visible ? 'true' : 'false'}
      style={revealStyle}
    >
      {children}
    </Tag>
  )
}
