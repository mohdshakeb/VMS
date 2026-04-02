import { type ReactNode, useEffect } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
}

export default function Modal({ open, onClose, title, children, footer }: ModalProps) {
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
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-150">
        {title && (
          <div className="flex items-center justify-between px-5 pt-5 pb-2">
            <h3 className="text-base font-semibold text-text-primary">{title}</h3>
            <button onClick={onClose} className="rounded-lg p-1 text-text-tertiary hover:bg-surface-secondary hover:text-text-primary transition-colors">
              <i className="ri-close-line text-xl" />
            </button>
          </div>
        )}
        <div className="px-5 py-3">{children}</div>
        {footer && <div className="px-5 pb-5 pt-2">{footer}</div>}
      </div>
    </div>
  )
}
