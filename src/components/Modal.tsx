import { type ReactNode, useEffect } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: ReactNode
  actions?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'md' | 'lg' | 'xl'
  scrollable?: boolean
}

export default function Modal({ open, onClose, title, subtitle, actions, children, footer, size = 'md', scrollable = false }: ModalProps) {
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
      <div className={`relative w-full flex flex-col ${size === 'xl' ? 'max-w-3xl' : size === 'lg' ? 'max-w-lg' : 'max-w-md'} rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-150 ${scrollable ? 'max-h-[85vh]' : ''}`}>
        {title && (
          <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-border shrink-0">
            <div className="flex-1 min-w-0 pr-3">
              <h3 className="text-base font-semibold text-text-primary">{title}</h3>
              {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {actions}
              <button onClick={onClose} className="rounded-lg p-1 text-text-tertiary hover:bg-surface-secondary hover:text-text-primary transition-colors">
                <i className="ri-close-line text-xl" />
              </button>
            </div>
          </div>
        )}
        <div className={`px-5 py-4 ${scrollable ? 'overflow-y-auto flex-1' : ''}`}>{children}</div>
        {footer && <div className="px-5 pb-5 pt-3 border-t border-border shrink-0">{footer}</div>}
      </div>
    </div>
  )
}
