import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface BreadcrumbItem {
  label: string
  path?: string
}

interface PageHeaderProps {
  title: string
  titleNode?: ReactNode
  breadcrumb?: BreadcrumbItem[]
  onBack?: () => void
  actions?: ReactNode
}

export default function PageHeader({ title, titleNode, breadcrumb, onBack, actions }: PageHeaderProps) {
  return (
    <header className="shrink-0 flex items-center gap-2 px-6 py-3 bg-white border-b border-border">
      {onBack && (
        <button
          onClick={onBack}
          className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors -ml-1"
          aria-label="Go back"
        >
          <i className="ri-arrow-left-line text-lg" />
        </button>
      )}
      <div className="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap">
        {breadcrumb && breadcrumb.length > 0 && breadcrumb.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-text-tertiary text-sm">·</span>}
            {item.path ? (
              <Link to={item.path} className="text-sm text-text-tertiary hover:text-text-secondary transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-sm text-text-tertiary">{item.label}</span>
            )}
            <span className="text-text-tertiary text-sm">·</span>
          </span>
        ))}
        {titleNode ?? <h2 className="text-sm font-medium text-text-primary">{title}</h2>}
      </div>
      {actions && (
        <div className="flex items-center gap-1 ml-auto">
          {actions}
        </div>
      )}
    </header>
  )
}
