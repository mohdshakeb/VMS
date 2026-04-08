import type { ReactNode, HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'sm' | 'md' | 'lg' | 'none'
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
}

export default function Card({ children, padding = 'md', className = '', onClick, ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl bg-white border border-border-light ${paddingClasses[padding]} ${
        onClick ? 'cursor-pointer hover:border-border transition-colors duration-150' : ''
      } ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}
