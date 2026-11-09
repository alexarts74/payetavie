'use client'

import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  variant?: Variant
  size?: Size
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-[#235037] hover:bg-[#1a3d2a] text-white disabled:opacity-50',
  secondary: 'bg-white border border-[#E8E8E8] text-[#1a2e22] hover:bg-[#EEF7F1] disabled:opacity-50',
  ghost: 'text-[#5A6B61] hover:text-[#1a2e22] hover:bg-[#EEF7F1] disabled:opacity-50',
  danger: 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 disabled:opacity-50',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-sm rounded-xl',
}

export default function Button({
  loading = false,
  variant = 'primary',
  size = 'md',
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />}
      {children}
    </button>
  )
}
