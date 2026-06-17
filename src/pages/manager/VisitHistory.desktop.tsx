// ─────────────────────────────────────────────────────────────────────────────
// Visit History — Desktop (Branch Admin)
// Scoped to selected location(s). Adds a Location column when "All Locations" is active.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useVisitStore } from '@/store/visitStore'
import { useAuthStore } from '@/store/authStore'
import { visitors as seedVisitors } from '@/data/visitors'
import { employees } from '@/data/employees'
import { locations } from '@/data/locations'
import PageHeader from '@/components/PageHeader'
import NotificationBell from '@/components/NotificationBell'
import { useNotificationStore, getUnreadCount } from '@/store/notificationStore'
import Button from '@/components/Button'
import { formatDate, formatTime, getStatusColor, getStatusLabel, getVisitTypeLabel, getLocalDateString } from '@/utils/helpers'
import EmptyState from '@/components/common/EmptyState'
import AvatarBadge from '@/components/common/AvatarBadge'

type StatusFilter = '' | 'open' | 'completed' | 'cancelled' | 'rejected'
type DateRange = '' | 'today' | 'last-week' | 'last-month'

const OPEN_STATUSES = ['pending-approval', 'confirmed', 'scheduled', 'checked-in']
const ITEMS_PER_PAGE = 10

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: '', label: 'Status' },
  { value: 'open', label: 'Open' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rejected', label: 'Rejected' },
]

const VISIT_TYPE_OPTIONS = [
  { value: '', label: 'Visit Type' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'customer', label: 'Customer' },
  { value: 'government-official', label: 'Govt. Official' },
  { value: 'cat-officials', label: 'CAT Officials' },
  { value: 'employee-other-branch', label: 'Other Branch' },
  { value: 'general-visitor', label: 'General Visitor' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'other', label: 'Other' },
]

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: '', label: 'Period' },
  { value: 'today', label: 'Today' },
  { value: 'last-week', label: 'Last Week' },
  { value: 'last-month', label: 'Last Month' },
]

function matchesDateRange(scheduledDate: string, range: DateRange): boolean {
  if (!range) return true
  const today = new Date()
  const visitDate = new Date(scheduledDate + 'T00:00:00')
  if (range === 'today') return scheduledDate === getLocalDateString()
  if (range === 'last-week') {
    const cutoff = new Date(today); cutoff.setDate(today.getDate() - 7)
    return visitDate >= cutoff
  }
  if (range === 'last-month') {
    const cutoff = new Date(today); cutoff.setDate(today.getDate() - 30)
    return visitDate >= cutoff
  }
  return true
}

function extractTime(iso: string): string {
  return iso.split('T')[1]?.slice(0, 5) ?? ''
}

export default function ManagerVisitHistoryDesktop() {
  const visits = useVisitStore((s) => s.visits)
  const storeVisitors = useVisitStore((s) => s.visitors)
  const { currentLocationId, currentRole } = useAuthStore()
  const notifications = useNotificationStore((s) => s.notifications)
  const unreadCount = getUnreadCount(notifications, currentRole)
  const navigate = useNavigate()
  const isAllLocations = currentLocationId === 'all'

  const { state: routeState } = useLocation()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>((routeState as { statusFilter?: StatusFilter } | null)?.statusFilter ?? '')
  const [visitTypeFilter, setVisitTypeFilter] = useState('')
  const [dateRange, setDateRange] = useState<DateRange>((routeState as { dateRange?: DateRange } | null)?.dateRange ?? '')
  const [locationFilter, setLocationFilter] = useState('')
  const [page, setPage] = useState(1)

  const visitorMap = useMemo(
    () => Object.fromEntries([...seedVisitors, ...storeVisitors].map((v) => [v.id, v])),
    [storeVisitors],
  )

  const filtered = useMemo(() => {
    let result = [...visits]
    // Location scope
    if (!isAllLocations) {
      result = result.filter((v) => v.locationId === currentLocationId)
    } else if (locationFilter) {
      result = result.filter((v) => v.locationId === locationFilter)
    }
    if (statusFilter === 'open') result = result.filter((v) => OPEN_STATUSES.includes(v.status))
    else if (statusFilter === 'completed') result = result.filter((v) => v.status === 'checked-out')
    else if (statusFilter === 'cancelled') result = result.filter((v) => v.status === 'cancelled')
    else if (statusFilter === 'rejected') result = result.filter((v) => v.status === 'rejected')
    if (visitTypeFilter) result = result.filter((v) => v.visitType === visitTypeFilter)
    if (dateRange) result = result.filter((v) => matchesDateRange(v.scheduledDate, dateRange))
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((v) => {
        const vis = visitorMap[v.visitorId]
        return vis?.name.toLowerCase().includes(q) || vis?.mobile?.toLowerCase().includes(q)
      })
    }
    result.sort((a, b) => {
      const da = `${a.scheduledDate}T${a.scheduledTime}`
      const db = `${b.scheduledDate}T${b.scheduledTime}`
      return db.localeCompare(da)
    })
    return result
  }, [visits, currentLocationId, isAllLocations, locationFilter, statusFilter, visitTypeFilter, dateRange, search, visitorMap])

  useEffect(() => { setPage(1) }, [statusFilter, visitTypeFilter, dateRange, search, locationFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const start = (page - 1) * ITEMS_PER_PAGE
  const paginatedRows = filtered.slice(start, start + ITEMS_PER_PAGE)

  const hasActiveFilters = statusFilter !== '' || visitTypeFilter !== '' || dateRange !== '' || locationFilter !== ''

  function clearFilters() {
    setStatusFilter('')
    setVisitTypeFilter('')
    setDateRange('')
    setLocationFilter('')
  }

  const colCount = isAllLocations ? 8 : 7

  return (
    <div className="hidden md:flex flex-col h-full bg-surface-secondary">
      <PageHeader
        title="Visit History"
        icon={<NotificationBell unreadCount={unreadCount} to="/notifications" />}
        actions={
          <>
            <Button size="md" icon="ri-add-large-fill" onClick={() => navigate('/employee/create-visit')} className="ml-1">
              Create Visit
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

        {/* Controls row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">

            {/* Location filter — only when "All Locations" is active */}
            {isAllLocations && (
              <div className="relative">
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className={`text-xs border rounded-lg pl-3 pr-8 py-2 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-light transition-colors ${
                    locationFilter
                      ? 'bg-brand-light text-brand border-brand'
                      : 'bg-white border-border text-text-secondary'
                  }`}
                >
                  <option value="">All Locations</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
                <i className={`ri-arrow-down-s-line pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm ${locationFilter ? 'text-brand' : 'text-text-tertiary'}`} />
              </div>
            )}

            <div className="relative">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className={`text-xs border rounded-lg pl-3 pr-8 py-2 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-light transition-colors ${statusFilter ? 'bg-brand-light text-brand border-brand' : 'bg-white border-border text-text-secondary'}`}
              >
                {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <i className={`ri-arrow-down-s-line pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm ${statusFilter ? 'text-brand' : 'text-text-tertiary'}`} />
            </div>

            <div className="relative">
              <select value={visitTypeFilter} onChange={(e) => setVisitTypeFilter(e.target.value)}
                className={`text-xs border rounded-lg pl-3 pr-8 py-2 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-light transition-colors ${visitTypeFilter ? 'bg-brand-light text-brand border-brand' : 'bg-white border-border text-text-secondary'}`}
              >
                {VISIT_TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <i className={`ri-arrow-down-s-line pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm ${visitTypeFilter ? 'text-brand' : 'text-text-tertiary'}`} />
            </div>

            <div className="relative">
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value as DateRange)}
                className={`text-xs border rounded-lg pl-3 pr-8 py-2 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-light transition-colors ${dateRange ? 'bg-brand-light text-brand border-brand' : 'bg-white border-border text-text-secondary'}`}
              >
                {DATE_RANGE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <i className={`ri-arrow-down-s-line pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm ${dateRange ? 'text-brand' : 'text-text-tertiary'}`} />
            </div>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary px-2 py-1.5 rounded-lg hover:bg-surface-secondary transition-colors">
                <i className="ri-close-circle-line text-sm" />
                Clear
              </button>
            )}
          </div>

          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-sm pointer-events-none" />
            <input
              type="text"
              placeholder="Search visitor or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-white border border-border rounded-lg w-60 focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand-light placeholder:text-text-tertiary"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border-light">
            <p className="text-sm font-semibold text-text-primary flex-1">Visit Records</p>
            <span className="text-xs text-text-tertiary tabular-nums">{filtered.length} results</span>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/[0.08] text-brand hover:bg-brand/[0.14] transition-colors ml-1" title="Export">
              <i className="ri-download-line text-sm" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-border-light bg-surface/60">
                  <th className="text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3 w-10">#</th>
                  <th className="text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">Visitor</th>
                  <th className="text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">Date & Time</th>
                  <th className="text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">Host</th>
                  {isAllLocations && (
                    <th className="text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">Location</th>
                  )}
                  <th className="text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">Visit Type</th>
                  <th className="text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">Check In / Out</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={colCount}>
                      <EmptyState
                        icon={hasActiveFilters ? 'ri-filter-off-line' : 'ri-calendar-line'}
                        title={hasActiveFilters ? 'No visits match your filters' : 'No visits found'}
                        className="py-16"
                        titleClassName="text-sm"
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((visit, idx) => {
                    const visitor = visitorMap[visit.visitorId]
                    const host = employees.find((e) => e.id === visit.hostEmployeeId)
                    const location = locations.find((l) => l.id === visit.locationId)
                    const rowNum = start + idx + 1
                    const statusColors = getStatusColor(visit.status)
                    const checkIn = visit.checkInTime ? formatTime(extractTime(visit.checkInTime)) : null
                    const checkOut = visit.checkOutTime ? formatTime(extractTime(visit.checkOutTime)) : null

                    return (
                      <tr
                        key={visit.id}
                        onClick={() => navigate(`/front-desk/visit/${visit.id}`)}
                        className="border-b border-border-light last:border-0 hover:bg-surface/70 transition-colors cursor-pointer group"
                      >
                        <td className="px-4 py-3.5 text-sm text-text-tertiary tabular-nums">{String(rowNum).padStart(2, '0')}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <AvatarBadge name={visitor?.name ?? '?'} avatar={visitor?.avatar} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-text-primary truncate leading-tight group-hover:text-brand transition-colors">{visitor?.name ?? 'Unknown'}</p>
                              {visitor?.mobile && <p className="text-xs text-text-tertiary truncate leading-tight mt-0.5">{visitor.mobile}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-sm text-text-primary leading-tight">{formatDate(visit.scheduledDate)}</p>
                          <p className="text-xs text-text-tertiary leading-tight mt-0.5">{formatTime(visit.scheduledTime)}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-sm text-text-primary leading-tight">{host?.name ?? '—'}</p>
                          {host?.department && <p className="text-xs text-text-tertiary leading-tight mt-0.5">{host.department}</p>}
                        </td>
                        {isAllLocations && (
                          <td className="px-4 py-3.5">
                            <p className="text-sm text-text-secondary truncate">{location?.name ?? '—'}</p>
                          </td>
                        )}
                        <td className="px-4 py-3.5 text-sm text-text-secondary">{getVisitTypeLabel(visit.visitType)}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                            {getStatusLabel(visit.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {checkIn ? (
                            <>
                              <p className="text-sm text-text-primary leading-tight">{checkIn}</p>
                              {checkOut && <p className="text-xs text-text-tertiary leading-tight mt-0.5">{checkOut}</p>}
                            </>
                          ) : (
                            <span className="text-sm text-text-tertiary">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              {start + 1}–{Math.min(start + ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button disabled={page === 1} onClick={(e) => { e.stopPropagation(); setPage((p) => p - 1) }}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <i className="ri-arrow-left-s-line text-base leading-none" />
              </button>
              <span className="text-sm text-text-secondary tabular-nums">{page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={(e) => { e.stopPropagation(); setPage((p) => p + 1) }}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <i className="ri-arrow-right-s-line text-base leading-none" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
