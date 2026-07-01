import type { ReactNode } from 'react'

type Option<T extends string> = { value: T; label: string }

type Props<T extends string> = {
  value: T
  onChange: (v: T) => void
  options?: Option<T>[]
  children?: ReactNode
  className?: string
}

export default function FilterSelect<T extends string>({
  value,
  onChange,
  options,
  children,
  className = 'w-36',
}: Props<T>) {
  const active = value !== ''
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={`${className} text-xs border rounded-lg pl-3 pr-8 py-2 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-light transition-colors truncate ${
          active ? 'bg-brand-light text-brand border-brand' : 'bg-white border-border text-text-secondary'
        }`}
      >
        {children ?? options?.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {active ? (
        <button
          type="button"
          aria-label="Clear filter"
          onClick={(e) => { e.stopPropagation(); onChange('' as T) }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-brand hover:text-brand/70 transition-colors"
        >
          <i className="ri-close-circle-fill text-sm" />
        </button>
      ) : (
        <i className="ri-arrow-down-s-line pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm text-text-tertiary" />
      )}
    </div>
  )
}
