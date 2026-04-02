import { useState, useEffect } from 'react'

interface SearchBarProps {
  placeholder?: string
  value?: string
  onChange: (value: string) => void
  debounceMs?: number
  inputClassName?: string
}

export default function SearchBar({ placeholder = 'Search...', value: controlledValue, onChange, debounceMs = 200, inputClassName }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(controlledValue ?? '')
  const [prevControlledValue, setPrevControlledValue] = useState(controlledValue)

  if (controlledValue !== prevControlledValue) {
    setLocalValue(controlledValue ?? '')
    setPrevControlledValue(controlledValue)
  }

  useEffect(() => {
    const timer = setTimeout(() => onChange(localValue), debounceMs)
    return () => clearTimeout(timer)
  }, [localValue, debounceMs, onChange])

  return (
    <div className="relative">
      <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-brand/20 transition-shadow duration-150 ${inputClassName ?? 'bg-surface-secondary'}`}
      />
    </div>
  )
}
