'use client'

import { useEffect } from 'react'

/**
 * Forces light mode on the landing page regardless of user's stored theme preference.
 * Uses a MutationObserver to prevent ThemeProvider from re-applying dark class.
 * Restores original theme on unmount.
 */
export function ForceLightMode() {
  useEffect(() => {
    const html = document.documentElement
    const wasDark = html.classList.contains('dark')

    const forceLight = () => {
      if (html.classList.contains('dark')) {
        html.classList.remove('dark')
        html.classList.add('light')
      }
    }

    forceLight()

    const observer = new MutationObserver(forceLight)
    observer.observe(html, { attributes: true, attributeFilter: ['class'] })

    return () => {
      observer.disconnect()
      if (wasDark) {
        html.classList.remove('light')
        html.classList.add('dark')
      }
    }
  }, [])

  return null
}
