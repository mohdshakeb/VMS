import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore, getUnreadCount } from '@/store/notificationStore'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import Button from '@/components/Button'
import type { ComplianceRecord, FacilityComplianceStatus, FacilityStatus } from '@/types/facility'
import { getComplianceDueDate, CURRENT_COMPLIANCE_PERIOD } from '@/data/facilityData'

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const COMPLIANCE_LABEL: Record<FacilityComplianceStatus, string> = {
  pending:   'Pending',
  draft:     'Draft',
  submitted: 'Submitted',
  updated:   'Updated',
  overdue:   'Overdue',
  missed:    'Missed',
}

const COMPLIANCE_STYLE: Record<FacilityComplianceStatus, string> = {
  pending:   'bg-yellow-surface text-yellow-fg',
  draft:     'bg-surface-secondary text-text-secondary',
  submitted: 'bg-blue-surface text-blue-fg',
  updated:   'bg-purple-surface text-purple-fg',
  overdue:   'bg-red-surface text-red-fg',
  missed:    'bg-surface-secondary text-text-tertiary',
}

const { month: PERIOD_MONTH, year: PERIOD_YEAR } = CURRENT_COMPLIANCE_PERIOD

const SBU_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'SBU' },
  { value: 'North', label: 'North' },
  { value: 'South', label: 'South' },
  { value: 'East',  label: 'East' },
  { value: 'West',  label: 'West' },
]

const STATUS_OPTIONS: { value: FacilityStatus | ''; label: string }[] = [
  { value: '', label: 'Status' },
  { value: 'active',   label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const COMPLIANCE_OPTIONS: { value: FacilityComplianceStatus | ''; label: string }[] = [
  { value: '', label: 'Compliance' },
  { value: 'pending',   label: 'Pending' },
  { value: 'draft',     label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'updated',   label: 'Updated' },
]

const SUBMITTED_STATUSES = ['submitted', 'updated', 'approved']

// Deadline for May's compliance = June 7 (7th of month following the period)
const DUE_DEADLINE = getComplianceDueDate(PERIOD_MONTH, PERIOD_YEAR)

// Deadline for the next period (June compliance = July 7)
const NEXT_PERIOD_MONTH = PERIOD_MONTH === 12 ? 1 : PERIOD_MONTH + 1
const NEXT_PERIOD_YEAR  = PERIOD_MONTH === 12 ? PERIOD_YEAR + 1 : PERIOD_YEAR
const NEXT_DEADLINE = getComplianceDueDate(NEXT_PERIOD_MONTH, NEXT_PERIOD_YEAR)

function isSubmitted(status: FacilityComplianceStatus) {
  return status === 'submitted' || status === 'updated'
}

function getLastCompliance(records: ComplianceRecord[], facilityId: string) {
  return [...records]
    .filter((r) => r.facilityId === facilityId && SUBMITTED_STATUSES.includes(r.status))
    .sort((a, b) => b.year - a.year || b.month - a.month)[0] ?? null
}

function getCurrentRecord(records: ComplianceRecord[], facilityId: string) {
  return records.find((r) => r.facilityId === facilityId && r.month === PERIOD_MONTH && r.year === PERIOD_YEAR) ?? null
}

export default function MyFacilities() {
  const navigate = useNavigate()
  const { currentRole, currentEmployeeId } = useAuthStore()
  const notifications = useNotificationStore((s) => s.notifications)
  const unreadCount = getUnreadCount(notifications, currentRole, currentRole === 'employee' ? currentEmployeeId : undefined)
  const openNotificationsModal = useNotificationStore((s) => s.openNotificationsModal)
  const facilities = useFacilityStore((s) => s.facilities)
  const complianceRecords = useFacilityStore((s) => s.complianceRecords)

  const [search, setSearch] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [sbuFilter, setSbuFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<FacilityStatus | ''>('')
  const [complianceFilter, setComplianceFilter] = useState<FacilityComplianceStatus | ''>('')

  const locationOptions = useMemo(() => {
    const unique = [...new Set(facilities.map((f) => f.location))].sort()
    return [{ value: '', label: 'Location' }, ...unique.map((l) => ({ value: l, label: l }))]
  }, [facilities])

  const filtered = useMemo(() => {
    let result = [...facilities]
    if (locationFilter) result = result.filter((f) => f.location === locationFilter)
    if (sbuFilter) result = result.filter((f) => f.sbu === sbuFilter)
    if (statusFilter) result = result.filter((f) => f.status === statusFilter)
    if (complianceFilter) result = result.filter((f) => f.complianceStatus === complianceFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((f) => f.name.toLowerCase().includes(q))
    }
    // Not-submitted (due/overdue) on top, submitted below
    result.sort((a, b) => Number(isSubmitted(a.complianceStatus)) - Number(isSubmitted(b.complianceStatus)))
    return result
  }, [facilities, locationFilter, sbuFilter, statusFilter, complianceFilter, search])

  const hasActiveFilters = locationFilter !== '' || sbuFilter !== '' || statusFilter !== '' || complianceFilter !== ''

  function clearFilters() {
    setLocationFilter('')
    setSbuFilter('')
    setStatusFilter('')
    setComplianceFilter('')
  }

  return (
    <div className="flex flex-col h-full bg-surface-secondary">
      <PageHeader
        title="Facilities"
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
          <h2 className="text-base font-semibold text-text-primary">Facilities</h2>
        </div>

        {/* ── Controls row (desktop only) ── */}
        <div className="hidden md:flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {/* Location */}
            <div className="relative">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className={`text-xs border rounded-lg pl-3 pr-8 py-2 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-light transition-colors ${locationFilter ? 'bg-brand-light text-brand border-brand' : 'bg-white border-border text-text-secondary'}`}
              >
                {locationOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <i className={`ri-arrow-down-s-line pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm ${locationFilter ? 'text-brand' : 'text-text-tertiary'}`} />
            </div>

            {/* SBU */}
            <div className="relative">
              <select
                value={sbuFilter}
                onChange={(e) => setSbuFilter(e.target.value)}
                className={`text-xs border rounded-lg pl-3 pr-8 py-2 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-light transition-colors ${sbuFilter ? 'bg-brand-light text-brand border-brand' : 'bg-white border-border text-text-secondary'}`}
              >
                {SBU_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <i className={`ri-arrow-down-s-line pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm ${sbuFilter ? 'text-brand' : 'text-text-tertiary'}`} />
            </div>

            {/* Status */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FacilityStatus | '')}
                className={`text-xs border rounded-lg pl-3 pr-8 py-2 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-light transition-colors ${statusFilter ? 'bg-brand-light text-brand border-brand' : 'bg-white border-border text-text-secondary'}`}
              >
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <i className={`ri-arrow-down-s-line pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm ${statusFilter ? 'text-brand' : 'text-text-tertiary'}`} />
            </div>

            {/* Compliance */}
            <div className="relative">
              <select
                value={complianceFilter}
                onChange={(e) => setComplianceFilter(e.target.value as FacilityComplianceStatus | '')}
                className={`text-xs border rounded-lg pl-3 pr-8 py-2 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-light transition-colors ${complianceFilter ? 'bg-brand-light text-brand border-brand' : 'bg-white border-border text-text-secondary'}`}
              >
                {COMPLIANCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <i className={`ri-arrow-down-s-line pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm ${complianceFilter ? 'text-brand' : 'text-text-tertiary'}`} />
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
              placeholder="Search facilities..."
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
              placeholder="Search facilities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-white border border-border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand-light placeholder:text-text-tertiary"
            />
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon="ri-building-2-line" title="No facilities match your search" className="py-12" titleClassName="text-sm" />
          ) : (
            filtered.map((facility) => {
              const last = getLastCompliance(complianceRecords, facility.id)
              const submitted = isSubmitted(facility.complianceStatus)
              const isPending = facility.complianceStatus === 'pending'
              const isDraft = facility.complianceStatus === 'draft'
              const currentRecord = getCurrentRecord(complianceRecords, facility.id)

              return (
                <div
                  key={facility.id}
                  onClick={() => navigate(`/facility/facilities/${facility.id}`)}
                  className="bg-white border border-border-light rounded-xl p-4 cursor-pointer hover:shadow-sm transition-all duration-150"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{facility.name}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{facility.location}</p>
                    </div>
                    <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${facility.status === 'active' ? 'bg-green-surface text-green-fg' : 'bg-red-surface text-red-fg'}`}>
                      {facility.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-xs text-text-secondary bg-surface-secondary px-2 py-0.5 rounded-full">{facility.sbu}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs border-t border-border-light pt-3">
                    <div>
                      <p className="text-text-tertiary mb-0.5">Last Compliance</p>
                      <p className="font-medium text-text-secondary">
                        {last
                          ? last.submittedAt
                            ? new Date(last.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : `${MONTH_SHORT[last.month - 1]} ${last.year}`
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-tertiary mb-0.5">Next Due</p>
                      <p className={`font-medium ${!submitted ? 'text-pending' : 'text-text-secondary'}`}>
                        {(!submitted ? DUE_DEADLINE : NEXT_DEADLINE).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {!submitted && <span className="ml-1 text-[10px] bg-pending-surface text-pending px-1.5 py-0.5 rounded-full font-semibold">Due</span>}
                      </p>
                    </div>
                  </div>

                  {(isPending || isDraft) && currentRecord && (
                    <div className="mt-3 pt-3 border-t border-border-light" onClick={(e) => e.stopPropagation()}>
                      {isPending && (
                        <Button size="sm" variant="primary" fullWidth onClick={() => navigate(`/facility/compliance/record/${currentRecord.id}`)}>
                          Start Compliance
                        </Button>
                      )}
                      {isDraft && (
                        <Button size="sm" variant="secondary" fullWidth onClick={() => navigate(`/facility/compliance/record/${currentRecord.id}`)}>
                          Resume Compliance
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* ── Desktop: table ── */}
        <div className="hidden md:block">
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-border-light bg-surface/60">
                    <th className="text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3 w-10">#</th>
                    {['Facility', 'Location', 'State', 'SBU', 'Last Compliance', 'Next Due', 'Compliance'].map((h) => (
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
                          icon={hasActiveFilters || search ? 'ri-filter-off-line' : 'ri-building-2-line'}
                          title={hasActiveFilters || search ? 'No facilities match your filters' : 'No facilities found'}
                          className="py-16"
                          titleClassName="text-sm"
                        />
                      </td>
                    </tr>
                  ) : (
                    filtered.map((facility, idx) => {
                      const last = getLastCompliance(complianceRecords, facility.id)
                      const submitted = isSubmitted(facility.complianceStatus)

                      return (
                        <tr
                          key={facility.id}
                          onClick={() => navigate(`/facility/facilities/${facility.id}`)}
                          className="border-b border-border-light last:border-0 hover:bg-surface/70 transition-colors cursor-pointer group"
                        >
                          {/* # */}
                          <td className="px-4 py-3.5 text-sm text-text-tertiary tabular-nums">
                            {String(idx + 1).padStart(2, '0')}
                          </td>

                          {/* Facility */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              {facility.photoUrl ? (
                                <img
                                  src={facility.photoUrl}
                                  alt={facility.name}
                                  className="h-10 w-10 rounded-lg object-cover shrink-0 border border-border-light"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-surface-secondary shrink-0 flex items-center justify-center border border-border-light">
                                  <i className="ri-building-2-line text-text-tertiary" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-text-primary leading-tight whitespace-nowrap group-hover:text-brand transition-colors">{facility.name}</p>
                                <p className={`text-xs font-medium leading-tight mt-0.5 whitespace-nowrap ${facility.status === 'active' ? 'text-green-fg' : 'text-red-fg'}`}>
                                  {facility.status === 'active' ? 'Active' : 'Inactive'}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Location */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <p className="text-sm text-text-primary leading-tight">{facility.location}</p>
                          </td>

                          {/* State */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <p className="text-sm text-text-secondary">{facility.state}</p>
                          </td>

                          {/* SBU */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <p className="text-sm text-text-secondary">{facility.sbu}</p>
                          </td>

                          {/* Last Compliance */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {last ? (
                              <p className="text-sm text-text-primary leading-tight">
                                {last.submittedAt
                                  ? new Date(last.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                  : `${MONTH_SHORT[last.month - 1]} ${last.year}`}
                              </p>
                            ) : (
                              <span className="text-sm text-text-tertiary">—</span>
                            )}
                          </td>

                          {/* Next Due */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 text-sm ${!submitted ? 'text-pending font-medium' : 'text-text-secondary'}`}>
                              {(!submitted ? DUE_DEADLINE : NEXT_DEADLINE).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              {!submitted && (
                                <span className="inline-flex items-center rounded-full bg-pending-surface text-pending text-[10px] font-semibold px-1.5 py-0.5 leading-none">
                                  Due
                                </span>
                              )}
                            </span>
                          </td>

                          {/* Compliance */}
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${COMPLIANCE_STYLE[facility.complianceStatus]}`}>
                              {COMPLIANCE_LABEL[facility.complianceStatus]}
                            </span>
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
            <p className="text-sm text-text-secondary mt-2">{filtered.length} facilit{filtered.length !== 1 ? 'ies' : 'y'}</p>
          )}
        </div>
      </div>
    </div>
  )
}
