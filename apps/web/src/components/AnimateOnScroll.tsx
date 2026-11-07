'use client'
import { useEffect, useRef, type ReactNode } from 'react'

export function AnimateOnScroll({ children, className = '', delay = 0 }: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.style.animationPlayState = 'running'; observer.unobserve(el) } },
      { threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} className={`animate-slide-up h-full ${className}`}
      style={{ opacity: 0, animationPlayState: 'paused', animationDelay: `${delay}s` }}>
      {children}
    </div>
  )
}
