import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore, getUnreadCount } from '@/store/notificationStore'
import PageHeader from '@/components/PageHeader'
import SearchBar from '@/components/SearchBar'
import FacilityStatusBadge from '@/components/facility/FacilityStatusBadge'
import EmptyState from '@/components/common/EmptyState'
import type { FacilityComplianceStatus, ComplianceRecord } from '@/types/facility'
import { formatComplianceDueDate, getComplianceDueDate, PROTOTYPE_NOW } from '@/data/facilityData'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const STATUS_OPTIONS: { label: string; value: FacilityComplianceStatus | '' }[] = [
  { label: 'All statuses', value: '' },
  { label: 'Pending',      value: 'pending' },
  { label: 'Draft',        value: 'draft' },
  { label: 'Overdue',      value: 'overdue' },
  { label: 'Submitted',    value: 'submitted' },
  { label: 'Updated',      value: 'updated' },
  { label: 'Missed',       value: 'missed' },
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

export default function ComplianceHomeDesktop() {
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
        const aOpen = ['pending', 'draft', 'overdue', 'submitted', 'updated'].includes(a.status) ? 0 : 1
        const bOpen = ['pending', 'draft', 'overdue', 'submitted', 'updated'].includes(b.status) ? 0 : 1
        if (aOpen !== bOpen) return aOpen - bOpen
        return b.year - a.year || b.month - a.month
      }),
    [allRecords],
  )

  const years = useMemo(
    () => [...new Set(baseRecords.map((r) => r.year))].sort((a, b) => b - a),
    [baseRecords],
  )
  const facilityNames = useMemo(
    () => [...new Set(baseRecords.map((r) => r.facilityName))].sort(),
    [baseRecords],
  )
  const locations = useMemo(() => {
    const locs = baseRecords
      .map((r) => facilities.find((f) => f.id === r.facilityId)?.location)
      .filter((l): l is string => Boolean(l))
    return [...new Set(locs)].sort()
  }, [baseRecords, facilities])

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<FacilityComplianceStatus | ''>('')
  const [yearFilter, setYearFilter] = useState<number | ''>('')
  const [facilityFilter, setFacilityFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')

  const filtered = useMemo(() => {
    let result = [...baseRecords]
    if (statusFilter) result = result.filter((r) => r.status === statusFilter)
    if (yearFilter !== '') result = result.filter((r) => r.year === yearFilter)
    if (facilityFilter) result = result.filter((r) => r.facilityName === facilityFilter)
    if (locationFilter) result = result.filter((r) => {
      const f = facilities.find((fac) => fac.id === r.facilityId)
      return f?.location === locationFilter
    })
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((r) => r.facilityName.toLowerCase().includes(q))
    }
    return result
  }, [baseRecords, statusFilter, yearFilter, facilityFilter, locationFilter, search, facilities])

  const hasActiveFilters = statusFilter !== '' || yearFilter !== '' || facilityFilter !== '' || locationFilter !== ''

  function clearFilters() {
    setStatusFilter('')
    setYearFilter('')
    setFacilityFilter('')
    setLocationFilter('')
  }

  function getFacilityDetails(facilityId: string) {
    return facilities.find((f) => f.id === facilityId)
  }

  return (
    <div className="hidden md:flex md:flex-col h-full bg-surface-secondary">
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

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {/* Filters + search */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
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

            {/* Location */}
            <div className="relative">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className={`text-xs border rounded-lg pl-3 pr-8 py-2 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-light transition-colors ${locationFilter ? 'bg-brand-light text-brand border-brand' : 'bg-white border-border text-text-secondary'}`}
              >
                <option value="">Location</option>
                {locations.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <i className={`ri-arrow-down-s-line pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm ${locationFilter ? 'text-brand' : 'text-text-tertiary'}`} />
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

            {/* Facility */}
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

          <div className="w-60">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search facility..."
              inputClassName="bg-white border border-border focus:border-brand-light"
            />
          </div>
        </div>

        {/* Desktop table */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-border-light bg-surface/60">
                  <th className="text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3 w-10">#</th>
                  {['Facility', 'Period', 'Progress', 'Due Date', 'Status', 'Last Updated'].map((h) => (
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
                        onClick={() => navigate(`/facility/compliance/record/${record.id}`)}
                      >
                        <td className="px-4 py-3.5 text-sm text-text-tertiary tabular-nums">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            {building?.photoUrl ? (
                              <img
                                src={building.photoUrl}
                                alt={record.facilityName}
                                className="h-10 w-10 rounded-lg object-cover shrink-0 border border-border-light"
                                loading="lazy"
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
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <p className="text-sm text-text-secondary leading-tight">{MONTH_NAMES[record.month - 1]} {record.year}</p>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-sm text-text-secondary">{answeredCount(record)}</span>
                          <span className="text-sm text-text-tertiary"> / {totalCount(record)}</span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {showDueUrgency(record) ? (
                            <span className="text-sm text-red-fg font-medium">{formatComplianceDueDate(record.month, record.year)}</span>
                          ) : (
                            <span className="text-sm text-text-tertiary">{formatComplianceDueDate(record.month, record.year)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <FacilityStatusBadge status={record.status} />
                        </td>
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
          <p className="text-sm text-text-secondary">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</p>
        )}
      </div>
    </div>
  )
}
