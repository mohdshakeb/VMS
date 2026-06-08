import { useState, useMemo } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore, getUnreadCount } from '@/store/notificationStore'
import PageHeader from '@/components/PageHeader'
import FacilityStatusBadge from '@/components/facility/FacilityStatusBadge'
import EmptyState from '@/components/common/EmptyState'
import type { FacilityComplianceStatus, ComplianceRecord } from '@/types/facility'
import { formatComplianceDueDate, getComplianceDueDate, PROTOTYPE_NOW } from '@/data/facilityData'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const STATUS_OPTIONS: { value: FacilityComplianceStatus | ''; label: string }[] = [
  { value: '',          label: 'Status' },
  { value: 'pending',   label: 'Pending' },
  { value: 'draft',     label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'updated',   label: 'Updated' },
  { value: 'overdue',   label: 'Overdue' },
  { value: 'missed',    label: 'Missed' },
]

function formatDate(ts?: string) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
}

function answeredCount(record: ComplianceRecord) {
  return record.checklist.filter((e) => e.answer !== undefined).length
}

function isDueDatePast(record: ComplianceRecord) {
  return PROTOTYPE_NOW > getComplianceDueDate(record.month, record.year)
}

function showDueUrgency(record: ComplianceRecord) {
  return record.status !== 'submitted' && record.status !== 'updated' && isDueDatePast(record)
}

function totalCount(record: ComplianceRecord) {
  return record.checklist.length
}

export default function ComplianceHome() {
  const navigate = useNavigate()
  const { currentRole, currentEmployeeId } = useAuthStore()
  const notifications = useNotificationStore((s) => s.notifications)
  const unreadCount = getUnreadCount(notifications, currentRole, currentRole === 'employee' ? currentEmployeeId : undefined)
  const openNotificationsModal = useNotificationStore((s) => s.openNotificationsModal)
  const facilities = useFacilityStore((s) => s.facilities)
  const allRecords = useFacilityStore((s) => s.complianceRecords)

  const baseRecords = useMemo(
    () =>
      [...allRecords].sort((a, b) => {
        // Open records (pending/draft/submitted/updated) always float to top, then sort by period desc
        const aOpen = ['pending', 'draft', 'overdue', 'submitted', 'updated'].includes(a.status) ? 0 : 1
        const bOpen = ['pending', 'draft', 'overdue', 'submitted', 'updated'].includes(b.status) ? 0 : 1
        if (aOpen !== bOpen) return aOpen - bOpen
        return b.year - a.year || b.month - a.month
      }),
    [allRecords],
  )

  // Derive unique years and building names for filter dropdowns
  const years = useMemo(
    () => [...new Set(baseRecords.map((r) => r.year))].sort((a, b) => b - a),
    [baseRecords],
  )
  const facilityNames = useMemo(
    () => [...new Set(baseRecords.map((r) => r.facilityName))].sort(),
    [baseRecords],
  )

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<FacilityComplianceStatus | ''>('')
  const [yearFilter, setYearFilter] = useState<number | ''>('')
  const [facilityFilter, setFacilityFilter] = useState('')

  const filtered = useMemo(() => {
    let result = [...baseRecords]
    if (statusFilter) result = result.filter((r) => r.status === statusFilter)
    if (yearFilter !== '') result = result.filter((r) => r.year === yearFilter)
    if (facilityFilter) result = result.filter((r) => r.facilityName === facilityFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((r) => r.facilityName.toLowerCase().includes(q))
    }
    return result
  }, [baseRecords, statusFilter, yearFilter, facilityFilter, search])

  const hasActiveFilters = statusFilter !== '' || yearFilter !== '' || facilityFilter !== ''

  function clearFilters() {
    setStatusFilter('')
    setYearFilter('')
    setFacilityFilter('')
  }

  function getFacilityDetails(facilityId: string) {
    return facilities.find((f) => f.id === facilityId)
  }

  function getRecordPath(record: ComplianceRecord) {
    return `/facility/compliance/record/${record.id}`
  }

  return (
    <div className="flex flex-col h-full bg-surface-secondary">
      <PageHeader
        title="Compliance History"
        actions={
          <button onClick={openNotificationsModal} className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-surface-secondary transition-colors">
            <i className="ri-notification-3-line text-xl text-text-secondary" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-semibold text-white leading-none">
                {unreadCount}
              </span>
            )}
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5 space-y-4">
        {/* Mobile header */}
        <div className="md:hidden">
          <h2 className="text-base font-semibold text-text-primary">All Records</h2>
          <p className="text-sm text-text-secondary mt-0.5">Pending, in-progress, and completed records.</p>
        </div>

        {/* ── Controls row (desktop only) ── */}
        <div className="hidden md:flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {/* Status */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FacilityComplianceStatus | '')}
                className={`text-xs border rounded-lg pl-3 pr-8 py-2 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-light transition-colors ${statusFilter ? 'bg-brand-light text-brand border-brand' : 'bg-white border-border text-text-secondary'}`}
              >
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <i className={`ri-arrow-down-s-line pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm ${statusFilter ? 'text-brand' : 'text-text-tertiary'}`} />
            </div>

            {/* Year */}
            <div className="relative">
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value === '' ? '' : Number(e.target.value))}
                className={`text-xs border rounded-lg pl-3 pr-8 py-2 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-light transition-colors ${yearFilter !== '' ? 'bg-brand-light text-brand border-brand' : 'bg-white border-border text-text-secondary'}`}
              >
                <option value="">Year</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <i className={`ri-arrow-down-s-line pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm ${yearFilter !== '' ? 'text-brand' : 'text-text-tertiary'}`} />
            </div>

            {/* Building */}
            <div className="relative">
              <select
                value={facilityFilter}
                onChange={(e) => setFacilityFilter(e.target.value)}
                className={`text-xs border rounded-lg pl-3 pr-8 py-2 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-light transition-colors ${facilityFilter ? 'bg-brand-light text-brand border-brand' : 'bg-white border-border text-text-secondary'}`}
              >
                <option value="">Facility</option>
                {facilityNames.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <i className={`ri-arrow-down-s-line pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm ${facilityFilter ? 'text-brand' : 'text-text-tertiary'}`} />
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary px-2 py-1.5 rounded-lg hover:bg-surface-secondary transition-colors"
              >
                <i className="ri-close-circle-line text-sm" />
                Clear
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-sm pointer-events-none" />
            <input
              type="text"
              placeholder="Search facility..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-white border border-border rounded-lg w-60 focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand-light placeholder:text-text-tertiary"
            />
          </div>
        </div>

        {/* ── Mobile: card list ── */}
        <div className="md:hidden space-y-3">
          {/* Mobile search */}
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-sm pointer-events-none" />
            <input
              type="text"
              placeholder="Search facility..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-white border border-border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand-light placeholder:text-text-tertiary"
            />
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon="ri-file-list-3-line" title="No records match your search" className="py-12" titleClassName="text-sm" />
          ) : (
            filtered.map((record) => {
              const building = getFacilityDetails(record.facilityId)
              return (
                <div
                  key={record.id}
                  className="bg-white border border-border-light rounded-xl p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-150"
                  onClick={() => navigate(getRecordPath(record))}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-medium text-text-primary truncate">{record.facilityName}</p>
                    <FacilityStatusBadge status={record.status} />
                  </div>
                  <p className="text-xs text-text-secondary mb-2">{MONTH_NAMES[record.month - 1]} {record.year}</p>

                  {building && (
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="text-xs text-text-secondary bg-surface-secondary px-2 py-0.5 rounded-full">{building.type}</span>
                      <span className="text-xs text-text-tertiary">{building.city} · {building.state}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-xs border-t border-border-light pt-3">
                    <div>
                      <p className="text-text-tertiary mb-0.5">Progress</p>
                      <p className="font-medium text-text-secondary">
                        {answeredCount(record)} <span className="text-text-tertiary font-normal">/ {totalCount(record)}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-text-tertiary mb-0.5">Due Date</p>
                      <p className={`font-medium ${showDueUrgency(record) ? 'text-red-fg' : 'text-text-secondary'}`}>
                        {formatComplianceDueDate(record.month, record.year)}
                      </p>
                    </div>
                    {(record.submittedBy || record.submittedAt) && (
                      <div className="col-span-2">
                        <p className="text-text-tertiary mb-0.5">Last Updated</p>
                        {record.submittedBy && <p className="font-medium text-text-secondary">{record.submittedBy}</p>}
                        {record.submittedAt && <p className="text-text-tertiary mt-0.5">{formatDate(record.submittedAt)}</p>}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* ── Desktop: table ── */}
        <div className="hidden md:block">
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b border-border-light bg-surface/60">
                    <th className="text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3 w-10">#</th>
                    {[
                      'Facility', 'Period',
                      'Progress', 'Due Date', 'Status', 'Last Updated',
                    ].map((h) => (
                      <th key={h} className="text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <EmptyState
                          icon={hasActiveFilters || search ? 'ri-filter-off-line' : 'ri-file-list-3-line'}
                          title={hasActiveFilters || search ? 'No records match your filters' : 'No compliance records yet'}
                          className="py-16"
                          titleClassName="text-sm"
                        />
                      </td>
                    </tr>
                  ) : (
                    filtered.map((record, idx) => {
                      const building = getFacilityDetails(record.facilityId)

                      return (
                        <tr
                          key={record.id}
                          className="border-b border-border-light last:border-0 cursor-pointer hover:bg-surface-secondary/60 transition-colors"
                          onClick={() => navigate(getRecordPath(record))}
                        >
                          {/* # */}
                          <td className="px-4 py-3.5 text-sm text-text-tertiary tabular-nums">
                            {String(idx + 1).padStart(2, '0')}
                          </td>

                          {/* Building + Location */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              {building?.photoUrl ? (
                                <img
                                  src={building.photoUrl}
                                  alt={record.facilityName}
                                  className="h-10 w-10 rounded-lg object-cover shrink-0 border border-border-light"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-surface-secondary shrink-0 flex items-center justify-center border border-border-light">
                                  <i className="ri-building-2-line text-text-tertiary" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-text-primary leading-tight whitespace-nowrap">{record.facilityName}</p>
                                {building && (
                                  <p className="text-xs text-text-tertiary leading-tight mt-0.5 whitespace-nowrap">{building.city} · {building.sbu} · {building.state}</p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Period */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <p className="text-sm text-text-secondary leading-tight">{MONTH_NAMES[record.month - 1]} {record.year}</p>
                          </td>

                          {/* Progress */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="text-sm text-text-secondary">{answeredCount(record)}</span>
                            <span className="text-sm text-text-tertiary"> / {totalCount(record)}</span>
                          </td>

                          {/* Due Date */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {showDueUrgency(record) ? (
                              <span className="text-sm text-red-fg font-medium">
                                {formatComplianceDueDate(record.month, record.year)}
                              </span>
                            ) : (
                              <span className="text-sm text-text-tertiary">
                                {formatComplianceDueDate(record.month, record.year)}
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5">
                            <FacilityStatusBadge status={record.status} />
                          </td>

                          {/* Last Updated */}
                          <td className="px-4 py-3.5">
                            <p className="text-sm text-text-secondary leading-tight">{record.submittedBy ?? '—'}</p>
                            {record.submittedAt && <p className="text-xs text-text-tertiary leading-tight mt-0.5">{formatDate(record.submittedAt)}</p>}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {filtered.length > 0 && (
            <p className="text-sm text-text-secondary mt-2">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</p>
          )}
        </div>
      </div>
    </div>
  )
}
