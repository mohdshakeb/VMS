import { useEffect, useRef, useState, type ReactNode } from 'react'

type Props = {
  content: ReactNode
  className?: string
  align?: 'left' | 'center' | 'right'
  position?: 'inline' | 'corner'
}

const ALIGN_CLASSES: Record<NonNullable<Props['align']>, string> = {
  left: 'left-0 translate-x-0',
  center: 'left-1/2 -translate-x-1/2',
  right: 'right-0 left-auto translate-x-0',
}

export default function InfoTooltip({ content, className = '', align = 'center', position = 'inline' }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handlePointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const positionClass = position === 'corner' ? 'absolute top-1.5 right-1.5' : 'relative inline-flex'

  return (
    <div ref={ref} className={`${positionClass} ${className}`}>
      <button
        type="button"
        aria-label="More information"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center justify-center rounded-full transition-colors duration-150 ${
          open
            ? 'bg-surface-secondary text-text-secondary'
            : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
        } ${position === 'corner' ? 'w-6 h-6' : ''}`}
      >
        <i className={`ri-information-line ${position === 'corner' ? 'text-base' : 'text-sm'}`} />
      </button>
      {open && (
        <div
          role="tooltip"
          className={`absolute z-20 top-full mt-1.5 w-48 rounded-lg bg-white border border-border-light shadow-lg px-2.5 py-2 text-xs leading-snug text-text-secondary ${ALIGN_CLASSES[align]}`}
        >
          {content}
        </div>
      )}
    </div>
  )
}
