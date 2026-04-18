import type { Visit } from '@/types/visit'
import type { Role } from '@/types/user'
import VisitCard from './VisitCard'
import EmptyState from './common/EmptyState'

interface VisitColumnProps {
  title: string
  subtitle: string
  visits: Visit[]
  visitorMap: Record<string, { name: string; mobile?: string; avatar?: string }>
  role: Role
}

export default function VisitColumn({ title, subtitle, visits, visitorMap, role }: VisitColumnProps) {
  return (
    <div className="rounded-xl bg-white border border-border-light overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-light">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-text-primary">{title}</p>
          <button className="flex items-center gap-0.5 text-xs text-text-tertiary hover:text-text-secondary transition-colors">
            Today
            <i className="ri-arrow-down-s-line text-sm" />
          </button>
        </div>
        <p className="text-xs text-text-tertiary mt-0.5">{subtitle}</p>
      </div>

      {/* Visit cards */}
      <div className="p-3 space-y-2">
        {visits.length === 0 ? (
          <EmptyState icon="ri-inbox-2-line" title="No visits" iconClassName="text-3xl" />
        ) : (
          visits.map((visit) => {
            const visitor = visitorMap[visit.visitorId]
            return (
              <VisitCard
                key={visit.id}
                visit={visit}
                visitorName={visitor?.name ?? 'Unknown Visitor'}
                visitorPhone={visitor?.mobile}
                visitorAvatar={visitor?.avatar}
                role={role}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
