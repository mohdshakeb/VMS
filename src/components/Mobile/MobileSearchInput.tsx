interface MobileSearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function MobileSearchInput({ value, onChange, placeholder = 'Search…' }: MobileSearchInputProps) {
  return (
    <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 h-10 focus-within:ring-2 focus-within:ring-brand-light focus-within:border-brand-light transition-shadow">
      <i className="ri-search-line text-text-tertiary shrink-0 text-base" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none min-w-0"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="shrink-0 text-text-tertiary hover:text-text-secondary transition-colors"
        >
          <i className="ri-close-line text-base" />
        </button>
      )}
    </div>
  )
}
