import type { ReactNode } from 'react'

interface BottomSheetProps {
  mounted: boolean
  visible: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: ReactNode
  mobileOnly?: boolean
}

export default function BottomSheet({
  mounted,
  visible,
  onClose,
  title,
  subtitle,
  children,
  mobileOnly = true,
}: BottomSheetProps) {
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
        className={`${baseClass}fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl`}
        style={{
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: visible
            ? 'transform 320ms cubic-bezier(0.32, 0.72, 0, 1)'
            : 'transform 240ms cubic-bezier(0.4, 0, 1, 1)',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-border" />
        </div>

        {(title || subtitle) && (
          <div className="px-5 pt-2 pb-3 border-b border-border-light">
            {title && <p className="text-sm font-semibold text-text-primary">{title}</p>}
            {subtitle && <p className="text-xs text-text-tertiary mt-0.5">{subtitle}</p>}
          </div>
        )}

        {children}
      </div>
    </>
  )
}
