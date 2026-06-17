type Tab<T extends string> = { id: T; label: string }

type Props<T extends string> = {
  tabs: Tab<T>[]
  active: T
  onChange: (id: T) => void
  className?: string
}

export default function TabBar<T extends string>({ tabs, active, onChange, className = '' }: Props<T>) {
  return (
    <div className={`flex border-b border-border ${className}`}>
      {tabs.map(({ id, label }) => {
        const isActive = id === active
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`relative px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
              isActive ? 'text-brand' : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            {label}
            {isActive && (
              <span
                className="absolute left-0 right-0 h-0.5 rounded-full"
                style={{ bottom: '-1px', backgroundColor: 'var(--color-brand)' }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
