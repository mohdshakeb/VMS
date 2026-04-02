import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface BreadcrumbItem {
  label: string
  path?: string
}

interface PageHeaderProps {
  title: string
  breadcrumb?: BreadcrumbItem[]
  onBack?: () => void
  actions?: ReactNode
}

export default function PageHeader({ title, breadcrumb, onBack, actions }: PageHeaderProps) {
  return (
    <header className="shrink-0 flex items-center gap-2 px-4 py-3 bg-white border-b border-zinc-200">
      {onBack && (
        <button
          onClick={onBack}
          className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors -ml-1"
          aria-label="Go back"
        >
          <i className="ri-arrow-left-line text-lg" />
        </button>
      )}
      <div className="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap">
        {breadcrumb && breadcrumb.length > 0 && breadcrumb.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-zinc-400 text-sm">·</span>}
            {item.path ? (
              <Link to={item.path} className="text-sm text-zinc-400 hover:text-zinc-500 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-sm text-zinc-400">{item.label}</span>
            )}
            <span className="text-zinc-400 text-sm">·</span>
          </span>
        ))}
        <h2 className="text-sm font-semibold text-zinc-700">{title}</h2>
      </div>
      {actions && (
        <div className="flex items-center gap-1 ml-auto">
          {actions}
        </div>
      )}
    </header>
  )
}
