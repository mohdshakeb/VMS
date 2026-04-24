import { type ReactNode, useEffect } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'md' | 'lg'
}

export default function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-text-primary/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative w-full ${size === 'lg' ? 'max-w-lg' : 'max-w-md'} rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-150`}>
        {title && (
          <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-border">
            <h3 className="text-base font-semibold text-text-primary">{title}</h3>
            <button onClick={onClose} className="rounded-lg p-1 text-text-tertiary hover:bg-surface-secondary hover:text-text-primary transition-colors">
              <i className="ri-close-line text-xl" />
            </button>
          </div>
        )}
        <div className="px-5 py-3">{children}</div>
        {footer && <div className="px-5 pb-5 pt-3 border-t border-border">{footer}</div>}
      </div>
    </div>
  )
}
