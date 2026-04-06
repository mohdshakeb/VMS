import type { Visit } from '@/types/visit'
import type { Role } from '@/types/user'
import VisitCard from './VisitCard'

interface VisitColumnProps {
  title: string
  subtitle: string
  visits: Visit[]
  visitorMap: Record<string, { name: string; company?: string; avatar?: string }>
  role: Role
}

export default function VisitColumn({ title, subtitle, visits, visitorMap, role }: VisitColumnProps) {
  return (
    <div className="rounded-xl bg-white border border-zinc-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-200">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-zinc-900">{title}</p>
          <button className="flex items-center gap-0.5 text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
            Today
            <i className="ri-arrow-down-s-line text-sm" />
          </button>
        </div>
        <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
      </div>

      {/* Visit cards */}
      <div className="p-3 space-y-2">
        {visits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-zinc-300">
            <i className="ri-inbox-2-line text-3xl" />
            <p className="text-xs mt-2">No visits</p>
          </div>
        ) : (
          visits.map((visit) => {
            const visitor = visitorMap[visit.visitorId]
            return (
              <VisitCard
                key={visit.id}
                visit={visit}
                visitorName={visitor?.name ?? 'Unknown Visitor'}
                visitorCompany={visitor?.company}
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
