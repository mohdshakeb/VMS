// ─────────────────────────────────────────────────────────────────────────────
// SBU Compliance History — Mobile
// No PageHeader — AppLayout's MobileTopBar provides the chrome.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import { useAuthStore } from '@/store/authStore'
import MobileSearchInput from '@/components/Mobile/MobileSearchInput'
import FacilityStatusBadge from '@/components/facility/FacilityStatusBadge'
import EmptyState from '@/components/common/EmptyState'
import type { FacilityComplianceStatus } from '@/types/facility'
import { formatComplianceDueDate } from '@/data/facilityData'
import { MONTH_NAMES, scoreChecklist } from '@/utils/facilityHelpers'

const STATUS_OPTIONS: { label: string; value: FacilityComplianceStatus | '' }[] = [
  { label: 'All statuses', value: '' },
  { label: 'Pending',      value: 'pending' },
  { label: 'Draft',        value: 'draft' },
  { label: 'Overdue',      value: 'overdue' },
  { label: 'Submitted',    value: 'submitted' },
  { label: 'Missed',       value: 'missed' },
]

const RATING_OPTIONS = [
  { label: 'All ratings', value: '' },
  { label: '5 Stars', value: '5' },
  { label: '4 Stars', value: '4' },
  { label: '3 Stars', value: '3' },
  { label: '2 Stars', value: '2' },
  { label: '1 Star', value: '1' },
]

function formatDate(ts?: string) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
}

function answeredCount(record: { checklist: { answer?: unknown }[] }) {
  return record.checklist.filter((e) => e.answer !== undefined).length
}

function totalCount(record: { checklist: unknown[] }) {
  return record.checklist.length
}

export default function SbuComplianceHistoryMobile() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { currentSbu } = useAuthStore()
  const allRecords = useFacilityStore((s) => s.complianceRecords)

  const baseRecords = useMemo(
    () =>
      [...allRecords]
        .filter((r) => r.sbu === currentSbu)
        .sort((a, b) => {
          const aOpen = ['pending', 'draft', 'overdue', 'submitted', 'updated'].includes(a.status) ? 0 : 1
          const bOpen = ['pending', 'draft', 'overdue', 'submitted', 'updated'].includes(b.status) ? 0 : 1
          if (aOpen !== bOpen) return aOpen - bOpen
          return b.year - a.year || b.month - a.month
        }),
    [allRecords, currentSbu],
  )

  const locationNames = useMemo(
    () => [...new Set(baseRecords.map((r) => r.locationName))].sort(),
    [baseRecords],
  )

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<FacilityComplianceStatus | ''>(
    () => (searchParams.get('status') as FacilityComplianceStatus | null) ?? '',
  )
  const [locationFilter, setLocationFilter] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')

  const filtered = useMemo(() => {
    let result = [...baseRecords]
    if (statusFilter) result = result.filter((r) => r.status === statusFilter)
    if (locationFilter) result = result.filter((r) => r.locationName === locationFilter)
    if (ratingFilter) {
      const targetStars = Number(ratingFilter)
      result = result.filter((r) => {
        const s = scoreChecklist(r.checklist)
        return s.maxScore > 0 && s.stars === targetStars
      })
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((r) => r.locationName.toLowerCase().includes(q))
    }
    return result
  }, [baseRecords, statusFilter, locationFilter, ratingFilter, search])

  return (
    <div className="md:hidden h-full flex flex-col bg-surface-secondary">
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-3 pb-10 flex flex-col gap-3">

          <MobileSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search location..."
          />

          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
            <div className="relative shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FacilityComplianceStatus | '')}
                className={`text-xs border rounded-lg pl-3 pr-7 py-2 appearance-none cursor-pointer focus:outline-none transition-colors ${statusFilter ? 'bg-brand-light text-brand border-brand' : 'bg-white border-border text-text-secondary'}`}
              >
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {statusFilter ? (
                <button type="button" aria-label="Clear status filter" onClick={(e) => { e.stopPropagation(); setStatusFilter('') }} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-brand">
                  <i className="ri-close-circle-fill text-sm" />
                </button>
              ) : (
                <i className="ri-arrow-down-s-line pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-sm text-text-tertiary" />
              )}
            </div>

            <div className="relative shrink-0">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className={`text-xs border rounded-lg pl-3 pr-7 py-2 appearance-none cursor-pointer focus:outline-none transition-colors ${locationFilter ? 'bg-brand-light text-brand border-brand' : 'bg-white border-border text-text-secondary'}`}
              >
                <option value="">Location</option>
                {locationNames.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              {locationFilter ? (
                <button type="button" aria-label="Clear location filter" onClick={(e) => { e.stopPropagation(); setLocationFilter('') }} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-brand">
                  <i className="ri-close-circle-fill text-sm" />
                </button>
              ) : (
                <i className="ri-arrow-down-s-line pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-sm text-text-tertiary" />
              )}
            </div>

            <div className="relative shrink-0">
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className={`text-xs border rounded-lg pl-3 pr-7 py-2 appearance-none cursor-pointer focus:outline-none transition-colors ${ratingFilter ? 'bg-brand-light text-brand border-brand' : 'bg-white border-border text-text-secondary'}`}
              >
                {RATING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {ratingFilter ? (
                <button type="button" aria-label="Clear rating filter" onClick={(e) => { e.stopPropagation(); setRatingFilter('') }} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-brand">
                  <i className="ri-close-circle-fill text-sm" />
                </button>
              ) : (
                <i className="ri-arrow-down-s-line pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-sm text-text-tertiary" />
              )}
            </div>

            {(statusFilter || locationFilter || ratingFilter) && (
              <button
                onClick={() => { setStatusFilter(''); setLocationFilter(''); setRatingFilter('') }}
                className="shrink-0 flex items-center gap-1 text-xs text-text-secondary px-2 py-1.5 rounded-lg border border-border bg-white"
              >
                <i className="ri-close-circle-line text-sm" />
                Clear
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon="ri-file-list-3-line" title="No records match your search" className="py-12" titleClassName="text-sm" />
          ) : (
            filtered.map((record) => (
              <div
                key={record.id}
                className="bg-white border border-border-light rounded-xl p-4 cursor-pointer active:shadow-md transition-all duration-150"
                onClick={() => navigate(`/sbu/compliance/record/${record.id}`)}
              >
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <p className="text-sm font-medium text-text-primary truncate">{record.locationName}</p>
                  <FacilityStatusBadge status={record.status} />
                </div>
                <p className="text-xs text-text-secondary mb-2">{record.facilityTypes.join(' · ')}</p>
                <p className="text-xs text-text-tertiary mb-3">{MONTH_NAMES[record.month - 1]} {record.year}</p>

                <div className="grid grid-cols-2 gap-3 text-xs border-t border-border-light pt-3">
                  <div>
                    <p className="text-text-tertiary mb-0.5">Progress</p>
                    <p className="font-medium text-text-secondary">
                      {answeredCount(record)} <span className="text-text-tertiary font-normal">/ {totalCount(record)}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-text-tertiary mb-0.5">Due Date</p>
                    <p className="font-medium text-text-secondary">
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
            ))
          )}
        </div>
      </div>
    </div>
  )
}
