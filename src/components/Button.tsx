import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: string
  iconRight?: string
  fullWidth?: boolean
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:opacity-90 active:opacity-80',
  secondary: 'bg-surface-secondary text-text-primary border border-border hover:bg-surface-tertiary',
  ghost: 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary',
  danger: 'bg-rejected text-white hover:opacity-90 active:opacity-80',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm font-semibold gap-2',
  lg: 'px-5 py-3 text-sm gap-2',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  fullWidth,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 disabled:!bg-zinc-100 disabled:!text-zinc-400 disabled:!border-zinc-100 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {icon && <i className={`${icon} text-base`} />}
      {children}
      {iconRight && <i className={`${iconRight} text-base`} />}
    </button>
  )
}
