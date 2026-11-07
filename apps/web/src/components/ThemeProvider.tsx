'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef, useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark' | 'system'

type ThemeProviderContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeProviderContext = createContext<ThemeProviderContextType | undefined>(undefined)

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

// Get system preference
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Apply theme to document (pure function, no state updates)
const applyThemeToDOM = (newTheme: Theme): 'light' | 'dark' => {
  const root = document.documentElement
  const resolved = newTheme === 'system' ? getSystemTheme() : newTheme

  root.classList.remove('light', 'dark')
  root.classList.add(resolved)
  return resolved
}

// Custom hook to subscribe to media query changes
const useMediaQuery = (query: string): boolean => {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mediaQuery = window.matchMedia(query)
      mediaQuery.addEventListener('change', callback)
      return () => mediaQuery.removeEventListener('change', callback)
    },
    [query]
  )

  const getSnapshot = useCallback(() => {
    return window.matchMedia(query).matches
  }, [query])

  const getServerSnapshot = useCallback(() => false, [])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'payetavie-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [mounted, setMounted] = useState(false)
  const initializedRef = useRef(false)

  // Subscribe to system preference changes
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')

  // Calculate resolved theme
  const resolvedTheme: 'light' | 'dark' = theme === 'system'
    ? (prefersDark ? 'dark' : 'light')
    : theme

  // Initialize on mount - only runs once
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const stored = localStorage.getItem(storageKey) as Theme | null
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Necessary to hydrate theme from localStorage on mount
      setThemeState(stored)
    }
    setMounted(true)
  }, [storageKey])

  // Apply theme to DOM whenever resolvedTheme changes
  useEffect(() => {
    if (!mounted) return
    applyThemeToDOM(theme)
  }, [theme, mounted, prefersDark])

  // Update theme
  const setTheme = useCallback((newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme)
    setThemeState(newTheme)
  }, [storageKey])

  // Prevent flash by not rendering until mounted
  if (!mounted) {
    return null
  }

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
