// ─────────────────────────────────────────────────────────────────────────────
// My Visits — Mobile (employee)
// Card-based list. No table. No responsive prefixes.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVisitStore } from '@/store/visitStore'
import { useAuthStore } from '@/store/authStore'
import { visitors as seedVisitors } from '@/data/visitors'
import BottomSheet from '@/components/Mobile/BottomSheet'
import MobileSearchInput from '@/components/Mobile/MobileSearchInput'
import StatusBadge from '@/components/StatusBadge'
import { formatDate, formatTime, getVisitTypeLabel, getLocalDateString } from '@/utils/helpers'
import EmptyState from '@/components/common/EmptyState'
import AvatarBadge from '@/components/common/AvatarBadge'
import type { VisitStatus } from '@/types/visit'

type StatusFilter = '' | 'open' | 'completed' | 'cancelled' | 'rejected'
type DateRange = '' | 'today' | 'last-week' | 'last-month'
type ActiveSheet = 'status' | 'visitType' | 'date' | null

const OPEN_STATUSES: VisitStatus[] = ['pending-approval', 'confirmed', 'scheduled', 'checked-in']
const ITEMS_PER_PAGE = 10

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rejected', label: 'Rejected' },
]

const VISIT_TYPE_OPTIONS = [
  { value: '', label: 'All' },
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

export default function MyVisitsMobile() {
  const visits = useVisitStore((s) => s.visits)
  const storeVisitors = useVisitStore((s) => s.visitors)
  const employeeId = useAuthStore((s) => s.currentEmployeeId)
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('')
  const [visitTypeFilter, setVisitTypeFilter] = useState('')
  const [dateRange, setDateRange] = useState<DateRange>('')
  const [page, setPage] = useState(1)

  // Bottom sheet
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null)
  const [sheetVisible, setSheetVisible] = useState(false)

  useEffect(() => {
    if (activeSheet) {
      requestAnimationFrame(() => { requestAnimationFrame(() => setSheetVisible(true)) })
    } else {
      setSheetVisible(false)
    }
  }, [activeSheet])

  function openSheet(filter: Exclude<ActiveSheet, null>) {
    setActiveSheet(filter)
  }

  function closeSheet() {
    setSheetVisible(false)
    setTimeout(() => setActiveSheet(null), 260)
  }

  const myVisits = useMemo(
    () => visits.filter((v) => v.hostEmployeeId === employeeId),
    [visits, employeeId],
  )

  const visitorMap = useMemo(
    () => Object.fromEntries([...seedVisitors, ...storeVisitors].map((v) => [v.id, v])),
    [storeVisitors],
  )

  const filtered = useMemo(() => {
    let result = [...myVisits]
    if (statusFilter === 'open') result = result.filter((v) => (OPEN_STATUSES as string[]).includes(v.status))
    else if (statusFilter === 'completed') result = result.filter((v) => v.status === 'checked-out')
    else if (statusFilter === 'cancelled') result = result.filter((v) => v.status === 'cancelled')
    else if (statusFilter === 'rejected') result = result.filter((v) => v.status === 'rejected')
    if (visitTypeFilter) result = result.filter((v) => v.visitType === visitTypeFilter)
    if (dateRange) result = result.filter((v) => matchesDateRange(v.scheduledDate, dateRange))
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
  }, [myVisits, statusFilter, visitTypeFilter, dateRange, search, visitorMap])

  useEffect(() => { setPage(1) }, [statusFilter, visitTypeFilter, dateRange, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const start = (page - 1) * ITEMS_PER_PAGE
  const paginatedRows = filtered.slice(start, start + ITEMS_PER_PAGE)

  const hasActiveFilters = statusFilter !== '' || visitTypeFilter !== '' || dateRange !== ''

  // Derived pill labels
  const statusLabel = statusFilter
    ? (STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label ?? 'Status')
    : 'Status'
  const visitTypeLabel = visitTypeFilter
    ? (VISIT_TYPE_OPTIONS.find((o) => o.value === visitTypeFilter)?.label ?? 'Visit Type')
    : 'Visit Type'
  const dateLabel = dateRange
    ? (DATE_RANGE_OPTIONS.find((o) => o.value === dateRange)?.label ?? 'Period')
    : 'Period'

  // Sheet options based on which filter is open
  const sheetOptions =
    activeSheet === 'status' ? STATUS_OPTIONS
    : activeSheet === 'visitType' ? VISIT_TYPE_OPTIONS
    : activeSheet === 'date' ? DATE_RANGE_OPTIONS
    : []

  const sheetValue =
    activeSheet === 'status' ? statusFilter
    : activeSheet === 'visitType' ? visitTypeFilter
    : activeSheet === 'date' ? dateRange
    : ''

  const sheetTitle =
    activeSheet === 'status' ? 'Status'
    : activeSheet === 'visitType' ? 'Visit Type'
    : activeSheet === 'date' ? 'Date Range'
    : ''

  function handleSheetSelect(value: string) {
    if (activeSheet === 'status') setStatusFilter(value as StatusFilter)
    else if (activeSheet === 'visitType') setVisitTypeFilter(value)
    else if (activeSheet === 'date') setDateRange(value as DateRange)
    closeSheet()
  }

  return (
    <div className="md:hidden h-full flex flex-col bg-surface-secondary">

      <div className="flex-1 overflow-y-auto">

        {/* Search + filters — sticky header area */}
        <div className="bg-surface-secondary px-4 pt-4 pb-3 space-y-3">

          {/* Search */}
          <MobileSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search visitor or company..."
          />

          {/* Filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status pill */}
            <button
              onClick={() => openSheet('status')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                statusFilter
                  ? 'bg-brand-light text-brand border-brand'
                  : 'bg-white text-text-secondary border-border'
              }`}
            >
              {statusLabel}
              <i className={`ri-arrow-down-s-line text-sm ${statusFilter ? 'text-brand' : 'text-text-tertiary'}`} />
            </button>

            {/* Visit Type pill */}
            <button
              onClick={() => openSheet('visitType')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                visitTypeFilter
                  ? 'bg-brand-light text-brand border-brand'
                  : 'bg-white text-text-secondary border-border'
              }`}
            >
              {visitTypeLabel}
              <i className={`ri-arrow-down-s-line text-sm ${visitTypeFilter ? 'text-brand' : 'text-text-tertiary'}`} />
            </button>

            {/* Date pill */}
            <button
              onClick={() => openSheet('date')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                dateRange
                  ? 'bg-brand-light text-brand border-brand'
                  : 'bg-white text-text-secondary border-border'
              }`}
            >
              {dateLabel}
              <i className={`ri-arrow-down-s-line text-sm ${dateRange ? 'text-brand' : 'text-text-tertiary'}`} />
            </button>

            {/* Clear — text only */}
            {hasActiveFilters && (
              <button
                onClick={() => { setStatusFilter(''); setVisitTypeFilter(''); setDateRange('') }}
                className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Card list */}
        <div className="px-4 pb-4 space-y-2">
          {paginatedRows.length === 0 ? (
            <EmptyState
              icon={hasActiveFilters || search ? 'ri-filter-off-line' : 'ri-calendar-line'}
              title={hasActiveFilters || search ? 'No visits match your filters' : 'No visits found'}
              className="py-16"
              titleClassName="text-sm"
            />
          ) : (
            paginatedRows.map((visit) => {
              const visitor = visitorMap[visit.visitorId]

              return (
                <button
                  key={visit.id}
                  onClick={() => navigate(`/employee/visit/${visit.id}`)}
                  className="w-full text-left bg-white rounded-xl border border-border-light px-4 py-3.5 active:bg-surface transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <AvatarBadge name={visitor?.name ?? '?'} avatar={visitor?.avatar} size="lg" className="mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      {/* Top: name + mobile + status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate leading-tight">{visitor?.name ?? 'Unknown'}</p>
                          {visitor?.mobile && (
                            <p className="text-xs text-text-tertiary truncate leading-tight mt-0.5">{visitor.mobile}</p>
                          )}
                        </div>
                        <StatusBadge status={visit.status} />
                      </div>
                      {/* Bottom: icon+text detail row */}
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-xs text-text-tertiary min-w-0">
                        <span className="inline-flex items-center gap-1 shrink-0">
                          <i className="ri-calendar-line shrink-0 text-text-tertiary/80" />
                          <span className="text-text-secondary">{formatDate(visit.scheduledDate)}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 shrink-0">
                          <i className="ri-time-line shrink-0 text-text-tertiary/80" />
                          <span className="text-text-secondary">{formatTime(visit.scheduledTime)}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 shrink-0">
                          <i className="ri-id-card-line shrink-0 text-text-tertiary/80" />
                          <span className="text-text-secondary">{getVisitTypeLabel(visit.visitType)}</span>
                        </span>
                        {visitor?.company && (
                          <span className="inline-flex items-center gap-1 min-w-0">
                            <i className="ri-briefcase-line shrink-0 text-text-tertiary/80" />
                            <span className="truncate min-w-0 text-text-secondary">{visitor.company}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })
          )}

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between pt-1">
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

      {/* Filter bottom sheet */}
      <BottomSheet
        mounted={!!activeSheet}
        visible={sheetVisible}
        onClose={closeSheet}
        title={sheetTitle}
      >
        <div className="py-2">
          {sheetOptions.map((opt) => {
            const isSelected = opt.value === sheetValue
            return (
              <button
                key={opt.value}
                onClick={() => handleSheetSelect(opt.value)}
                className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors ${
                  isSelected ? 'bg-brand-light' : 'hover:bg-surface'
                }`}
              >
                <span className={`text-sm font-medium ${isSelected ? 'text-brand' : 'text-text-primary'}`}>
                  {opt.label}
                </span>
                {isSelected && <i className="ri-check-line text-brand text-base" />}
              </button>
            )
          })}
        </div>
      </BottomSheet>
    </div>
  )
}
