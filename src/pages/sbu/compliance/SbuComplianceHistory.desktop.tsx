import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore, getUnreadCount } from '@/store/notificationStore'
import PageHeader from '@/components/PageHeader'
import NotificationBell from '@/components/NotificationBell'
import SearchBar from '@/components/SearchBar'
import FacilityStatusBadge from '@/components/facility/FacilityStatusBadge'
import EmptyState from '@/components/common/EmptyState'
import type { FacilityComplianceStatus, ComplianceRecord } from '@/types/facility'
import { MONTH_NAMES, scoreChecklist } from '@/utils/facilityHelpers'

const STATUS_OPTIONS: { label: string; value: FacilityComplianceStatus | '' }[] = [
  { label: 'All statuses', value: '' },
  { label: 'Pending',      value: 'pending' },
  { label: 'Draft',        value: 'draft' },
  { label: 'Overdue',      value: 'overdue' },
  { label: 'Submitted',    value: 'submitted' },
  { label: 'Updated',      value: 'updated' },
  { label: 'Missed',       value: 'missed' },
]

const RATING_OPTIONS = [
  { label: 'All ratings', value: '' },
  { label: '5 Stars (≥90%)', value: '5' },
  { label: '4 Stars (75–89%)', value: '4' },
  { label: '3 Stars (60–74%)', value: '3' },
  { label: '2 Stars (40–59%)', value: '2' },
  { label: '1 Star (<40%)', value: '1' },
]

function formatDate(ts?: string) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
}

function answeredCount(record: ComplianceRecord) {
  return record.checklist.filter((e) => e.answer !== undefined).length
}

function totalCount(record: ComplianceRecord) {
  return record.checklist.length
}

function FilterSelect<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  const active = value !== ''
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={`w-36 text-xs border rounded-lg pl-3 pr-8 py-2 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-light transition-colors truncate ${
          active ? 'bg-brand-light text-brand border-brand' : 'bg-white border-border text-text-secondary'
        }`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <i className={`ri-arrow-down-s-line pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm ${active ? 'text-brand' : 'text-text-tertiary'}`} />
    </div>
  )
}

export default function SbuComplianceHistoryDesktop() {
  const navigate = useNavigate()
  const { currentRole, currentEmployeeId, currentSbu } = useAuthStore()
  const notifications = useNotificationStore((s) => s.notifications)
  const unreadCount = getUnreadCount(notifications, currentRole, currentRole === 'employee' ? currentEmployeeId : undefined)
  const openNotificationsModal = useNotificationStore((s) => s.openNotificationsModal)
  const allRecords = useFacilityStore((s) => s.complianceRecords)
  const facilities = useFacilityStore((s) => s.facilities)

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

  const sbuFacilities = useMemo(
    () => facilities.filter((f) => f.sbu === currentSbu),
    [facilities, currentSbu],
  )

  const locationStateMap = useMemo(
    () => Object.fromEntries(sbuFacilities.map((f) => [f.location, f.state])),
    [sbuFacilities],
  )

  const locationAdminMap = useMemo(
    () => Object.fromEntries(sbuFacilities.filter((f) => f.locationAdmin).map((f) => [f.location, f.locationAdmin!])),
    [sbuFacilities],
  )

  const uniqueAdmins = useMemo(
    () => [...new Set(sbuFacilities.filter((f) => f.locationAdmin).map((f) => f.locationAdmin!))].sort(),
    [sbuFacilities],
  )

  const locationsByState = useMemo(() => {
    const locationNames = [...new Set(baseRecords.map((r) => r.locationName))].sort()
    const map = new Map<string, string[]>()
    for (const loc of locationNames) {
      const state = locationStateMap[loc] ?? 'Other'
      if (!map.has(state)) map.set(state, [])
      map.get(state)!.push(loc)
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [baseRecords, locationStateMap])

  const periods = useMemo(() => {
    const seen = new Set<string>()
    return [...baseRecords]
      .filter((r) => {
        const k = `${r.year}-${r.month}`
        if (seen.has(k)) return false
        seen.add(k)
        return true
      })
      .sort((a, b) => b.year - a.year || b.month - a.month)
      .map((r) => ({ label: `${MONTH_NAMES[r.month - 1]} ${r.year}`, value: `${r.year}-${r.month}` }))
  }, [baseRecords])

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<FacilityComplianceStatus | ''>('')
  const [locationStateFilter, setLocationStateFilter] = useState('') // 's:State' | 'l:Location' | ''
  const [ratingFilter, setRatingFilter] = useState('')
  const [periodFilter, setPeriodFilter] = useState('')
  const [locationAdminFilter, setLocationAdminFilter] = useState('')
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    let result = [...baseRecords]
    if (statusFilter) result = result.filter((r) => r.status === statusFilter)
    if (locationStateFilter.startsWith('s:')) {
      const state = locationStateFilter.slice(2)
      result = result.filter((r) => locationStateMap[r.locationName] === state)
    } else if (locationStateFilter.startsWith('l:')) {
      const location = locationStateFilter.slice(2)
      result = result.filter((r) => r.locationName === location)
    }
    if (periodFilter) {
      const [y, m] = periodFilter.split('-').map(Number)
      result = result.filter((r) => r.year === y && r.month === m)
    }
    if (ratingFilter) {
      const targetStars = Number(ratingFilter)
      result = result.filter((r) => {
        const s = scoreChecklist(r.checklist)
        return s.maxScore > 0 && s.stars === targetStars
      })
    }
    if (locationAdminFilter) {
      result = result.filter((r) => locationAdminMap[r.locationName] === locationAdminFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((r) => r.locationName.toLowerCase().includes(q))
    }
    return result
  }, [baseRecords, statusFilter, locationStateFilter, periodFilter, ratingFilter, locationAdminFilter, locationStateMap, locationAdminMap, search])

  const hasActiveFilters =
    statusFilter !== '' || locationStateFilter !== '' || ratingFilter !== '' ||
    periodFilter !== '' || locationAdminFilter !== ''

  const allFilteredSelected = filtered.length > 0 && filtered.every((r) => selectedRecords.has(r.id))

  useEffect(() => {
    setSelectedRecords(new Set())
  }, [statusFilter, locationStateFilter, ratingFilter, periodFilter, locationAdminFilter, search])

  function toggleRecord(id: string) {
    setSelectedRecords((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelectedRecords(new Set())
    } else {
      setSelectedRecords(new Set(filtered.map((r) => r.id)))
    }
  }

  function clearFilters() {
    setStatusFilter('')
    setLocationStateFilter('')
    setRatingFilter('')
    setPeriodFilter('')
    setLocationAdminFilter('')
  }

  return (
    <div className="hidden md:flex md:flex-col h-full bg-surface-secondary">
      <PageHeader
        title="Compliance History"
        icon={<NotificationBell unreadCount={unreadCount} onClick={openNotificationsModal} />}
      />

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {/* Filters + search + export */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Combined Location / State filter */}
            <div className="relative">
              <select
                value={locationStateFilter}
                onChange={(e) => setLocationStateFilter(e.target.value)}
                className={`w-36 text-xs border rounded-lg pl-3 pr-8 py-2 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-light transition-colors truncate ${
                  locationStateFilter ? 'bg-brand-light text-brand border-brand' : 'bg-white border-border text-text-secondary'
                }`}
              >
                <option value="">Location / State</option>
                {locationsByState.map(([state, locs]) => (
                  <optgroup key={state} label={state}>
                    <option value={`s:${state}`}>All {state}</option>
                    {locs.map((l) => (
                      <option key={l} value={`l:${l}`}>{l}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <i className={`ri-arrow-down-s-line pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm ${locationStateFilter ? 'text-brand' : 'text-text-tertiary'}`} />
            </div>
            <FilterSelect
              value={ratingFilter}
              onChange={setRatingFilter}
              options={RATING_OPTIONS}
            />
            <FilterSelect
              value={statusFilter}
              onChange={setStatusFilter as (v: string) => void}
              options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
            <FilterSelect
              value={periodFilter}
              onChange={setPeriodFilter}
              options={[{ value: '', label: 'Period' }, ...periods]}
            />
            <FilterSelect
              value={locationAdminFilter}
              onChange={setLocationAdminFilter}
              options={[{ value: '', label: 'Location Admin' }, ...uniqueAdmins.map((a) => ({ value: a, label: a }))]}
            />

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

          <div className="flex items-center gap-2">
            <div className="w-60">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search location..."
                inputClassName="bg-white border border-border focus:border-brand-light"
              />
            </div>
            <button
              className={`flex items-center gap-1.5 h-8 rounded-lg bg-brand/[0.08] text-brand hover:bg-brand/[0.14] transition-colors text-sm font-medium ${selectedRecords.size > 0 ? 'px-3' : 'w-8 justify-center'}`}
              title="Export"
            >
              <i className="ri-download-line text-sm" />
              {selectedRecords.size > 0 && <span>Export ({selectedRecords.size})</span>}
            </button>
          </div>
        </div>

        {/* Desktop table */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="border-b border-border-light bg-surface/60">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-border cursor-pointer accent-brand"
                      checked={allFilteredSelected}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3 w-10">#</th>
                  {['Location', 'Period', 'Progress', 'Score & Rating', 'Status', 'Submitted By', 'Submitted Date', 'Updated Date'].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10}>
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
                    const score = scoreChecklist(record.checklist)
                    return (
                      <tr
                        key={record.id}
                        className="border-b border-border-light last:border-0 cursor-pointer hover:bg-surface-secondary/60 transition-colors"
                        onClick={() => navigate(`/sbu/compliance/record/${record.id}`)}
                      >
                        {/* Checkbox */}
                        <td
                          className="px-4 py-3.5"
                          onClick={(e) => { e.stopPropagation(); toggleRecord(record.id) }}
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-border cursor-pointer accent-brand"
                            checked={selectedRecords.has(record.id)}
                            onChange={() => toggleRecord(record.id)}
                          />
                        </td>
                        {/* # */}
                        <td className="px-4 py-3.5 text-sm text-text-tertiary tabular-nums">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        {/* Location */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-brand-red-50 shrink-0 flex items-center justify-center border border-brand-red-100">
                              <i className="ri-map-pin-2-fill text-brand" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-text-primary leading-tight whitespace-nowrap">{record.locationName}</p>
                              <p className="text-xs text-text-tertiary leading-tight mt-0.5 whitespace-nowrap">{record.facilityTypes.join(' · ')}</p>
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
                        {/* Score & Rating */}
                        <td className="px-4 py-3.5">
                          {score.maxScore > 0 ? (
                            <div>
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <i
                                    key={i}
                                    className={`ri-star-fill text-xs ${i < score.stars ? 'text-amber-400' : 'text-border'}`}
                                  />
                                ))}
                              </div>
                              <p className="text-xs text-text-tertiary mt-0.5 tabular-nums whitespace-nowrap">
                                {score.facilityScore}/{score.maxScore} · {score.percentage}%
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-text-tertiary">—</span>
                          )}
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <FacilityStatusBadge status={record.status} />
                        </td>
                        {/* Submitted By */}
                        <td className="px-4 py-3.5">
                          <p className="text-sm text-text-secondary whitespace-nowrap">{record.submittedBy ?? '—'}</p>
                        </td>
                        {/* Submitted Date */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-sm text-text-secondary">{formatDate(record.submittedAt)}</span>
                        </td>
                        {/* Updated Date */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-sm text-text-secondary">{formatDate(record.savedAt)}</span>
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
