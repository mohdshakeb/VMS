import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  actions?: ReactNode
}

export default function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <header className="shrink-0 flex items-center gap-3 px-6 h-14 bg-white border-b border-zinc-200">
      <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
      {actions && (
        <div className="flex items-center gap-1 ml-auto">
          {actions}
        </div>
      )}
    </header>
  )
}
