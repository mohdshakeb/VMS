// ─────────────────────────────────────────────────────────────────────────────
// Visit History — Mobile (Android screen)
// Card-based list. No table. No responsive prefixes.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useMemo, useEffect } from 'react'
import { useVisitStore } from '@/store/visitStore'
import StatusBadge from '@/components/StatusBadge'
import { employees } from '@/data/employees'
import { formatDate, formatTime } from '@/utils/helpers'
import EmptyState from '@/components/common/EmptyState'
import AvatarBadge from '@/components/common/AvatarBadge'
import TabPills from '@/components/common/TabPills'
import type { VisitStatus } from '@/types/visit'

type FilterTab = 'all' | 'open' | 'completed' | 'cancelled-rejected'

const OPEN_STATUSES: VisitStatus[] = ['pending-approval', 'confirmed', 'scheduled', 'checked-in']
const COMPLETED_STATUSES: VisitStatus[] = ['checked-out']
const CLOSED_STATUSES: VisitStatus[] = ['cancelled', 'rejected']
const ITEMS_PER_PAGE = 10

function extractTime(iso: string): string {
  return iso.split('T')[1]?.slice(0, 5) ?? ''
}

export default function VisitHistoryMobile() {
  const visits = useVisitStore((s) => s.visits)
  const storeVisitors = useVisitStore((s) => s.visitors)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const visitorMap = useMemo(
    () => Object.fromEntries(storeVisitors.map((v) => [v.id, v])),
    [storeVisitors],
  )

  const filtered = useMemo(() => {
    let result = [...visits]
    if (activeTab === 'open') result = result.filter((v) => (OPEN_STATUSES as string[]).includes(v.status))
    else if (activeTab === 'completed') result = result.filter((v) => (COMPLETED_STATUSES as string[]).includes(v.status))
    else if (activeTab === 'cancelled-rejected') result = result.filter((v) => (CLOSED_STATUSES as string[]).includes(v.status))
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((v) => {
        const vis = visitorMap[v.visitorId]
        return vis?.name.toLowerCase().includes(q) || vis?.company?.toLowerCase().includes(q)
      })
    }
    result.sort((a, b) => {
      const da = `${a.scheduledDate}T${a.scheduledTime}`
      const db = `${b.scheduledDate}T${b.scheduledTime}`
      return db.localeCompare(da)
    })
    return result
  }, [visits, activeTab, search, visitorMap])

  useEffect(() => { setPage(1) }, [activeTab, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const start = (page - 1) * ITEMS_PER_PAGE
  const paginatedRows = filtered.slice(start, start + ITEMS_PER_PAGE)

  const tabs: { label: string; value: FilterTab; count: number }[] = [
    { label: 'All', value: 'all', count: visits.length },
    { label: 'Open', value: 'open', count: visits.filter((v) => (OPEN_STATUSES as string[]).includes(v.status)).length },
    { label: 'Done', value: 'completed', count: visits.filter((v) => (COMPLETED_STATUSES as string[]).includes(v.status)).length },
    { label: 'Cancelled', value: 'cancelled-rejected', count: visits.filter((v) => (CLOSED_STATUSES as string[]).includes(v.status)).length },
  ]

  return (
    <div className="md:hidden h-full flex flex-col">

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">

        {/* Controls — stacked */}
        <div className="flex flex-col gap-3">
          <TabPills tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Search */}
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-sm pointer-events-none" />
            <input
              type="text"
              placeholder="Search visitor or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-white border border-border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand-light placeholder:text-text-tertiary"
            />
          </div>
        </div>

        {/* Card list */}
        <div className="space-y-2">
          {paginatedRows.length === 0 ? (
            <EmptyState icon="ri-search-line" title="No visits found" className="py-16" titleClassName="text-sm" />
          ) : (
            paginatedRows.map((visit) => {
              const visitor = visitorMap[visit.visitorId]
              const host = employees.find((e) => e.id === visit.hostEmployeeId)
              const checkIn = visit.checkInTime ? formatTime(extractTime(visit.checkInTime)) : null
              const checkOut = visit.checkOutTime ? formatTime(extractTime(visit.checkOutTime)) : null

              return (
                <div key={visit.id} className="bg-white rounded-xl border border-border-light px-4 py-3.5">
                  <div className="flex items-start gap-3">
                    <AvatarBadge name={visitor?.name ?? '?'} avatar={visitor?.avatar} size="lg" className="mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate leading-tight">{visitor?.name ?? 'Unknown'}</p>
                          {visitor?.company && (
                            <p className="text-xs text-text-tertiary truncate leading-tight mt-0.5">{visitor.company}</p>
                          )}
                        </div>
                        <StatusBadge status={visit.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-2 text-xs text-text-tertiary">
                        <span>{formatDate(visit.scheduledDate)} · {formatTime(visit.scheduledTime)}</span>
                        {host && <span>· {host.name}</span>}
                        {checkIn && (
                          <span>· In {checkIn}{checkOut ? ` · Out ${checkOut}` : ''}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              {start + 1}–{Math.min(start + ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <i className="ri-arrow-left-s-line text-base leading-none" />
              </button>
              <span className="text-sm text-text-secondary tabular-nums">{page} / {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <i className="ri-arrow-right-s-line text-base leading-none" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
