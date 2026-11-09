'use client'

// ThemeProvider simplified — dark mode removed, light only
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function useTheme() {
  return {
    theme: 'light' as const,
    setTheme: (_: string) => {},
    resolvedTheme: 'light' as const,
  }
}
