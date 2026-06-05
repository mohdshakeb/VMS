import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/common/EmptyState'
import Button from '@/components/Button'
import type { ComplianceRecord, FacilityComplianceStatus, BuildingStatus } from '@/types/facility'

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const COMPLIANCE_LABEL: Record<FacilityComplianceStatus, string> = {
  pending:   'Pending',
  draft:     'Draft',
  submitted: 'In Progress',
  approved:  'Completed',
  overdue:   'Overdue',
}

const COMPLIANCE_STYLE: Record<FacilityComplianceStatus, string> = {
  pending:   'bg-yellow-surface text-yellow-fg',
  draft:     'bg-surface-secondary text-text-secondary',
  submitted: 'bg-blue-surface text-blue-fg',
  approved:  'bg-green-surface text-green-fg',
  overdue:   'bg-red-surface text-red-fg',
}

const now = new Date()
const CURRENT_MONTH = now.getMonth() + 1
const CURRENT_YEAR = now.getFullYear()

const STATUS_OPTIONS: { value: BuildingStatus | ''; label: string }[] = [
  { value: '', label: 'Status' },
  { value: 'active',   label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const COMPLIANCE_OPTIONS: { value: FacilityComplianceStatus | ''; label: string }[] = [
  { value: '', label: 'Compliance' },
  { value: 'pending',   label: 'Pending' },
  { value: 'draft',     label: 'Draft' },
  { value: 'submitted', label: 'In Progress' },
  { value: 'approved',  label: 'Completed' },
]

function getLastCompliance(records: ComplianceRecord[], buildingId: string) {
  return [...records]
    .filter((r) => r.buildingId === buildingId && ['submitted', 'approved'].includes(r.status))
    .sort((a, b) => b.year - a.year || b.month - a.month)[0] ?? null
}

function getCurrentRecord(records: ComplianceRecord[], buildingId: string) {
  return records.find((r) => r.buildingId === buildingId && r.month === CURRENT_MONTH && r.year === CURRENT_YEAR) ?? null
}

function getNextDue(last: ComplianceRecord | null) {
  if (!last) return null
  return last.month === 12
    ? { month: 1, year: last.year + 1 }
    : { month: last.month + 1, year: last.year }
}

function isDueThisMonth(next: { month: number; year: number } | null) {
  return next?.month === CURRENT_MONTH && next?.year === CURRENT_YEAR
}

export default function MyBuildings() {
  const navigate = useNavigate()
  const buildings = useFacilityStore((s) => s.buildings)
  const complianceRecords = useFacilityStore((s) => s.complianceRecords)

  const [search, setSearch] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<BuildingStatus | ''>('')
  const [complianceFilter, setComplianceFilter] = useState<FacilityComplianceStatus | ''>('')

  const locationOptions = useMemo(() => {
    const unique = [...new Set(buildings.map((b) => b.location))].sort()
    return [{ value: '', label: 'Location' }, ...unique.map((l) => ({ value: l, label: l }))]
  }, [buildings])

  const filtered = useMemo(() => {
    let result = [...buildings]
    if (locationFilter) result = result.filter((b) => b.location === locationFilter)
    if (statusFilter) result = result.filter((b) => b.status === statusFilter)
    if (complianceFilter) result = result.filter((b) => b.complianceStatus === complianceFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (b) => b.name.toLowerCase().includes(q) || b.buildingId.toLowerCase().includes(q)
      )
    }
    return result
  }, [buildings, locationFilter, statusFilter, complianceFilter, search])

  const hasActiveFilters = locationFilter !== '' || statusFilter !== '' || complianceFilter !== ''

  function clearFilters() {
    setLocationFilter('')
    setStatusFilter('')
    setComplianceFilter('')
  }

  return (
    <div className="flex flex-col h-full bg-surface-secondary">
      <PageHeader title="Businesses" />

      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5 space-y-4">
        {/* Mobile header */}
        <div className="md:hidden">
          <h2 className="text-base font-semibold text-text-primary">Businesses</h2>
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

            {/* Status */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as BuildingStatus | '')}
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
              placeholder="Search name or ID..."
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
              placeholder="Search name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-white border border-border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand-light placeholder:text-text-tertiary"
            />
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon="ri-building-2-line" title="No businesses match your search" className="py-12" titleClassName="text-sm" />
          ) : (
            filtered.map((building) => {
              const last = getLastCompliance(complianceRecords, building.id)
              const nextDue = getNextDue(last)
              const dueNow = isDueThisMonth(nextDue)
              const isPending = building.complianceStatus === 'pending'
              const isDraft = building.complianceStatus === 'draft'
              const currentRecord = getCurrentRecord(complianceRecords, building.id)

              return (
                <div
                  key={building.id}
                  onClick={() => navigate(`/facility/buildings/${building.id}`)}
                  className="bg-white border border-border-light rounded-xl p-4 cursor-pointer hover:shadow-sm transition-all duration-150"
                >
                  <div className="mb-1">
                    <p className="text-sm font-medium text-text-primary truncate">{building.name}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{building.location}</p>
                  </div>

                  <div className="flex items-center gap-2 mt-2 mb-3 flex-wrap">
                    <span className="text-xs text-text-secondary bg-surface-secondary px-2 py-0.5 rounded-full">{building.sbu}</span>
                    <span className="text-xs text-text-tertiary">{building.location} · {building.city}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs border-t border-border-light pt-3">
                    <div>
                      <p className="text-text-tertiary mb-0.5">Last Compliance</p>
                      <p className="font-medium text-text-secondary">
                        {last ? `${MONTH_SHORT[last.month - 1]} ${last.year}` : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-tertiary mb-0.5">Next Due</p>
                      {nextDue ? (
                        <p className={`font-medium ${dueNow ? 'text-pending' : 'text-text-secondary'}`}>
                          {MONTH_SHORT[nextDue.month - 1]} {nextDue.year}
                          {dueNow && <span className="ml-1 text-[10px] bg-pending-surface text-pending px-1.5 py-0.5 rounded-full font-semibold">Due</span>}
                        </p>
                      ) : (
                        <p className="text-text-tertiary">—</p>
                      )}
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
                    {['Business', 'Location', 'State', 'SBU', 'Last Compliance', 'Next Due', 'Compliance'].map((h) => (
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
                          title={hasActiveFilters || search ? 'No businesses match your filters' : 'No businesses found'}
                          className="py-16"
                          titleClassName="text-sm"
                        />
                      </td>
                    </tr>
                  ) : (
                    filtered.map((building, idx) => {
                      const last = getLastCompliance(complianceRecords, building.id)
                      const nextDue = getNextDue(last)
                      const dueNow = isDueThisMonth(nextDue)

                      return (
                        <tr
                          key={building.id}
                          onClick={() => navigate(`/facility/buildings/${building.id}`)}
                          className="border-b border-border-light last:border-0 hover:bg-surface/70 transition-colors cursor-pointer group"
                        >
                          {/* # */}
                          <td className="px-4 py-3.5 text-sm text-text-tertiary tabular-nums">
                            {String(idx + 1).padStart(2, '0')}
                          </td>

                          {/* Business */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              {building.photoUrl ? (
                                <img
                                  src={building.photoUrl}
                                  alt={building.name}
                                  className="h-10 w-10 rounded-lg object-cover shrink-0 border border-border-light"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-surface-secondary shrink-0 flex items-center justify-center border border-border-light">
                                  <i className="ri-building-2-line text-text-tertiary" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-text-primary leading-tight whitespace-nowrap group-hover:text-brand transition-colors">{building.name}</p>
                                <p className={`text-xs font-medium leading-tight mt-0.5 whitespace-nowrap ${building.status === 'active' ? 'text-green-fg' : 'text-red-fg'}`}>
                                  {building.status === 'active' ? 'Active' : 'Inactive'}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Location */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <p className="text-sm text-text-primary leading-tight">{building.location}</p>
                          </td>

                          {/* State */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <p className="text-sm text-text-secondary">{building.state}</p>
                          </td>

                          {/* SBU */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <p className="text-sm text-text-secondary">{building.sbu}</p>
                          </td>

                          {/* Last Compliance */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {last ? (
                              <>
                                <p className="text-sm text-text-primary leading-tight">{MONTH_SHORT[last.month - 1]} {last.year}</p>
                                {last.submittedAt && (
                                  <p className="text-xs text-text-tertiary leading-tight mt-0.5">
                                    {new Date(last.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                  </p>
                                )}
                              </>
                            ) : (
                              <span className="text-sm text-text-tertiary">—</span>
                            )}
                          </td>

                          {/* Next Due */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {nextDue ? (
                              <span className={`inline-flex items-center gap-1.5 text-sm ${dueNow ? 'text-pending font-medium' : 'text-text-secondary'}`}>
                                {MONTH_SHORT[nextDue.month - 1]} {nextDue.year}
                                {dueNow && (
                                  <span className="inline-flex items-center rounded-full bg-pending-surface text-pending text-[10px] font-semibold px-1.5 py-0.5 leading-none">
                                    Due
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="text-sm text-text-tertiary">—</span>
                            )}
                          </td>

                          {/* Compliance */}
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${COMPLIANCE_STYLE[building.complianceStatus]}`}>
                              {COMPLIANCE_LABEL[building.complianceStatus]}
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
            <p className="text-sm text-text-secondary mt-2">{filtered.length} business{filtered.length !== 1 ? 'es' : ''}</p>
          )}
        </div>
      </div>
    </div>
  )
}
