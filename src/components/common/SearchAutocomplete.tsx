import { useState, useRef, useEffect } from 'react'

interface SearchAutocompleteProps<T extends { id: string }> {
  items: T[]
  selectedId: string
  onSelect: (id: string) => void
  getLabel: (item: T) => string
  getSubLabel?: (item: T) => string
  filterFn?: (item: T, search: string) => boolean
  placeholder?: string
  className?: string
  emptyMessage?: string
}

export default function SearchAutocomplete<T extends { id: string }>({
  items,
  selectedId,
  onSelect,
  getLabel,
  getSubLabel,
  filterFn,
  placeholder = 'Search...',
  className = '',
  emptyMessage = 'No results found',
}: SearchAutocompleteProps<T>) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selectedItem = items.find((item) => item.id === selectedId) ?? null

  const filtered = items.filter((item) =>
    filterFn
      ? filterFn(item, search)
      : getLabel(item).toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className={`relative ${className}`} ref={ref}>
      <div className="relative">
        <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-sm" />
        <input
          type="text"
          value={selectedItem ? getLabel(selectedItem) : search}
          onChange={(e) => {
            setSearch(e.target.value)
            onSelect('')
            setOpen(true)
          }}
          onFocus={() => {
            if (!selectedId) setOpen(true)
          }}
          placeholder={placeholder}
          className={`form-input !pl-9 ${selectedId ? '!pr-9' : ''}`}
        />
        {selectedId && (
          <button
            type="button"
            onClick={() => {
              onSelect('')
              setSearch('')
              setOpen(true)
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-text-tertiary hover:text-text-primary"
          >
            <i className="ri-close-line" />
          </button>
        )}
      </div>

      {open && !selectedId && (
        <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-lg bg-white border border-border shadow-lg">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-sm text-text-tertiary">{emptyMessage}</p>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelect(item.id)
                  setSearch('')
                  setOpen(false)
                }}
                className="w-full text-left px-3 py-2 hover:bg-surface-secondary transition-colors"
              >
                <p className="text-sm font-medium text-text-primary">{getLabel(item)}</p>
                {getSubLabel && (
                  <p className="text-xs text-text-secondary">{getSubLabel(item)}</p>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
