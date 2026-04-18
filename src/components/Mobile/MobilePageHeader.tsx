import type { ReactNode } from 'react'

interface MobilePageHeaderProps {
  title: string
  onBack: () => void
  onCancel?: () => void
  cancelLabel?: string
  children?: ReactNode
}

export default function MobilePageHeader({
  title,
  onBack,
  onCancel,
  cancelLabel = 'Cancel',
  children,
}: MobilePageHeaderProps) {
  return (
    <header className="relative shrink-0 bg-white border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors -ml-1 px-1 py-1 rounded-md"
        >
          <i className="ri-arrow-left-line text-lg" />
          <span className="font-medium">{title}</span>
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-brand hover:opacity-75 transition-opacity px-1 py-1"
          >
            {cancelLabel}
          </button>
        )}
      </div>

      {children && (
        <div className="border-t border-border flex justify-center px-4 py-3">
          {children}
        </div>
      )}
    </header>
  )
}
