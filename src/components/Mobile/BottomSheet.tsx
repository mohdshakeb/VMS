import { type ReactNode, useEffect } from 'react'

interface BottomSheetProps {
  mounted: boolean
  visible: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  mobileOnly?: boolean
}

export default function BottomSheet({
  mounted,
  visible,
  onClose,
  title,
  subtitle,
  children,
  footer,
  mobileOnly = true,
}: BottomSheetProps) {
  useEffect(() => {
    if (mounted) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [mounted])

  if (!mounted) return null

  const baseClass = mobileOnly ? 'md:hidden ' : ''

  return (
    <>
      <div
        onClick={onClose}
        className={`${baseClass}fixed inset-0 z-40 bg-black/40`}
        style={{
          opacity: visible ? 1 : 0,
          transition: visible ? 'opacity 240ms ease-out' : 'opacity 220ms ease-in',
        }}
      />
      <div
        className={`${baseClass}fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl flex flex-col max-h-[92dvh]`}
        style={{
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: visible
            ? 'transform 320ms cubic-bezier(0.32, 0.72, 0, 1)'
            : 'transform 240ms cubic-bezier(0.4, 0, 1, 1)',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-9 h-1 rounded-full bg-border" />
        </div>

        {(title || subtitle) && (
          <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-border-light flex-shrink-0">
            <div>
              {title && <p className="text-sm font-semibold text-text-primary">{title}</p>}
              {subtitle && <p className="text-xs text-text-tertiary mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-text-tertiary hover:bg-surface-secondary hover:text-text-primary transition-colors -mr-1"
            >
              <i className="ri-close-line text-lg" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {footer && (
          <div className="flex-shrink-0 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 border-t border-border">
            {footer}
          </div>
        )}
      </div>
    </>
  )
}
