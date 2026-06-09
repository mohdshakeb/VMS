// ─────────────────────────────────────────────────────────────────────────────
// Compliance History — Mobile
// No PageHeader — AppLayout's MobileTopBar provides the chrome.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import MobileSearchInput from '@/components/Mobile/MobileSearchInput'
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

export default function ComplianceHomeMobile() {
  const navigate = useNavigate()
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

  const locations = useMemo(() => {
    const locs = baseRecords
      .map((r) => facilities.find((f) => f.id === r.facilityId)?.location)
      .filter((l): l is string => Boolean(l))
    return [...new Set(locs)].sort()
  }, [baseRecords, facilities])

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<FacilityComplianceStatus | ''>('')
  const [locationFilter, setLocationFilter] = useState('')

  const filtered = useMemo(() => {
    let result = [...baseRecords]
    if (statusFilter) result = result.filter((r) => r.status === statusFilter)
    if (locationFilter) result = result.filter((r) => {
      const f = facilities.find((fac) => fac.id === r.facilityId)
      return f?.location === locationFilter
    })
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((r) => r.facilityName.toLowerCase().includes(q))
    }
    return result
  }, [baseRecords, statusFilter, locationFilter, search, facilities])

  function getFacilityDetails(facilityId: string) {
    return facilities.find((f) => f.id === facilityId)
  }

  return (
    <div className="md:hidden h-full flex flex-col bg-surface-secondary">
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-3 pb-10 flex flex-col gap-3">

          {/* Search */}
          <MobileSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search facility..."
          />

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
            <div className="relative shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FacilityComplianceStatus | '')}
                className={`text-xs border rounded-lg pl-3 pr-7 py-2 appearance-none cursor-pointer focus:outline-none transition-colors ${statusFilter ? 'bg-brand-light text-brand border-brand' : 'bg-white border-border text-text-secondary'}`}
              >
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <i className={`ri-arrow-down-s-line pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-sm ${statusFilter ? 'text-brand' : 'text-text-tertiary'}`} />
            </div>

            <div className="relative shrink-0">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className={`text-xs border rounded-lg pl-3 pr-7 py-2 appearance-none cursor-pointer focus:outline-none transition-colors ${locationFilter ? 'bg-brand-light text-brand border-brand' : 'bg-white border-border text-text-secondary'}`}
              >
                <option value="">Location</option>
                {locations.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <i className={`ri-arrow-down-s-line pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-sm ${locationFilter ? 'text-brand' : 'text-text-tertiary'}`} />
            </div>

            {(statusFilter || locationFilter) && (
              <button
                onClick={() => { setStatusFilter(''); setLocationFilter('') }}
                className="shrink-0 flex items-center gap-1 text-xs text-text-secondary px-2 py-1.5 rounded-lg border border-border bg-white"
              >
                <i className="ri-close-circle-line text-sm" />
                Clear
              </button>
            )}
          </div>

          {/* Records */}
          {filtered.length === 0 ? (
            <EmptyState icon="ri-file-list-3-line" title="No records match your search" className="py-12" titleClassName="text-sm" />
          ) : (
            filtered.map((record) => {
              const building = getFacilityDetails(record.facilityId)
              return (
                <div
                  key={record.id}
                  className="bg-white border border-border-light rounded-xl p-4 cursor-pointer active:shadow-md transition-all duration-150"
                  onClick={() => navigate(`/facility/compliance/record/${record.id}`)}
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
      </div>
    </div>
  )
}
