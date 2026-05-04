import type { CSSProperties } from 'react'

interface CountBadgeProps {
  count: number
  className?: string
  style?: CSSProperties
}

export default function CountBadge({ count, className, style }: CountBadgeProps) {
  return (
    <span
      className={`text-[11px] font-semibold rounded-full px-2 py-0.5 ${className ?? 'text-text-tertiary bg-surface-secondary'}`}
      style={style}
    >
      {count}
    </span>
  )
}
