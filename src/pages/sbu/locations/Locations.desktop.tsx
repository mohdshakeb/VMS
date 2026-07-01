import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore, getUnreadCount } from '@/store/notificationStore'
import PageHeader from '@/components/PageHeader'
import NotificationBell from '@/components/NotificationBell'
import EmptyState from '@/components/common/EmptyState'
import SearchBar from '@/components/SearchBar'
import FilterSelect from '@/components/common/FilterSelect'
import type { FacilityComplianceStatus } from '@/types/facility'
import { groupFacilitiesByLocation, getCurrentRecord, getLocationAverageRating, COMPLIANCE_LABEL, COMPLIANCE_STYLE } from '@/utils/facilityHelpers'
import { CURRENT_COMPLIANCE_PERIOD } from '@/data/facilityData'

const COMPLIANCE_OPTIONS: { value: FacilityComplianceStatus | ''; label: string }[] = [
  { value: '', label: 'Compliance' },
  { value: 'pending',   label: 'Pending' },
  { value: 'draft',     label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'updated',   label: 'Updated' },
  { value: 'overdue',   label: 'Overdue' },
  { value: 'missed',    label: 'Missed' },
]

const RATING_OPTIONS = [
  { value: '', label: 'Avg. Rating' },
  { value: '5', label: '5 Stars' },
  { value: '3plus', label: '3 Stars & Up' },
  { value: 'below3', label: 'Below 3 Stars' },
]

export default function LocationsDesktop() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { currentRole, currentSbu } = useAuthStore()
  const notifications = useNotificationStore((s) => s.notifications)
  const unreadCount = getUnreadCount(notifications, currentRole)
  const openNotificationsModal = useNotificationStore((s) => s.openNotificationsModal)
  const facilities = useFacilityStore((s) => s.facilities)
  const allRecords = useFacilityStore((s) => s.complianceRecords)

  const sbuFacilities = useMemo(() => facilities.filter((f) => f.sbu === currentSbu), [facilities, currentSbu])
  const locationGroups = useMemo(() => groupFacilitiesByLocation(sbuFacilities), [sbuFacilities])

  const currentPeriodStatusMap = useMemo(() => {
    const map = new Map<string, string>()
    locationGroups.forEach((g) => {
      const record = getCurrentRecord(allRecords, g.location)
      map.set(g.location, record?.status ?? 'pending')
    })
    return map
  }, [locationGroups, allRecords, CURRENT_COMPLIANCE_PERIOD.month, CURRENT_COMPLIANCE_PERIOD.year])

  const locationAvgRatingMap = useMemo(() => {
    const map = new Map<string, { avgPct: number | null; stars: number | null; count: number }>()
    locationGroups.forEach((g) => map.set(g.location, getLocationAverageRating(allRecords, g.location)))
    return map
  }, [locationGroups, allRecords])

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | ''>('')
  const [stateFilter, setStateFilter] = useState('')
  const [complianceFilter, setComplianceFilter] = useState<FacilityComplianceStatus | ''>('')
  const [locationAdminFilter, setLocationAdminFilter] = useState(searchParams.get('admin') ?? '')
  const [ratingFilter, setRatingFilter] = useState(() => searchParams.get('rating') ?? '')
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set())

  const [lastAdminParam, setLastAdminParam] = useState(searchParams.get('admin'))
  if (searchParams.get('admin') !== lastAdminParam) {
    setLastAdminParam(searchParams.get('admin'))
    setLocationAdminFilter(searchParams.get('admin') ?? '')
  }

  const uniqueStates = useMemo(
    () => [...new Set(locationGroups.map((g) => g.state))].sort(),
    [locationGroups]
  )
  const uniqueAdmins = useMemo(
    () => [...new Set(locationGroups.flatMap((g) => g.admins))].sort(),
    [locationGroups]
  )

  const filtered = useMemo(() => {
    let result = [...locationGroups]
    if (statusFilter) result = result.filter((g) => g.status === statusFilter)
    if (stateFilter) result = result.filter((g) => g.state === stateFilter)
    if (complianceFilter) result = result.filter((g) => currentPeriodStatusMap.get(g.location) === complianceFilter)
    if (locationAdminFilter) result = result.filter((g) => g.admins.includes(locationAdminFilter))
    if (ratingFilter === 'below3') {
      result = result.filter((g) => {
        const stars = locationAvgRatingMap.get(g.location)?.stars
        return stars !== null && stars !== undefined && stars < 3
      })
    } else if (ratingFilter === '3plus') {
      result = result.filter((g) => {
        const stars = locationAvgRatingMap.get(g.location)?.stars
        return stars !== null && stars !== undefined && stars >= 3
      })
    } else if (ratingFilter === '5') {
      result = result.filter((g) => locationAvgRatingMap.get(g.location)?.stars === 5)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter((g) => g.location.toLowerCase().includes(q))
    }
    result.sort((a, b) => a.location.localeCompare(b.location))
    return result
  }, [locationGroups, currentPeriodStatusMap, locationAvgRatingMap, statusFilter, stateFilter, complianceFilter, locationAdminFilter, ratingFilter, search])

  const hasActiveFilters = statusFilter !== '' || stateFilter !== '' || complianceFilter !== '' || locationAdminFilter !== '' || ratingFilter !== ''

  function clearFilters() {
    setStatusFilter('')
    setStateFilter('')
    setComplianceFilter('')
    setLocationAdminFilter('')
    setRatingFilter('')
  }

  useEffect(() => {
    setSelectedLocations(new Set())
  }, [statusFilter, stateFilter, complianceFilter, locationAdminFilter, ratingFilter, search])

  const allFilteredSelected = filtered.length > 0 && filtered.every((g) => selectedLocations.has(g.location))

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelectedLocations(new Set())
    } else {
      setSelectedLocations(new Set(filtered.map((g) => g.location)))
    }
  }

  function toggleLocation(location: string) {
    setSelectedLocations((prev) => {
      const next = new Set(prev)
      if (next.has(location)) next.delete(location)
      else next.add(location)
      return next
    })
  }

  return (
    <div className="hidden md:flex md:flex-col h-full bg-surface-secondary">
      <PageHeader
        title="Locations"
        icon={<NotificationBell unreadCount={unreadCount} onClick={openNotificationsModal} />}
        actions={
          <button
            onClick={() => navigate('/sbu/onboarding/new')}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-brand text-white text-xs font-medium hover:bg-brand/90 transition-colors"
          >
            <i className="ri-add-line text-sm" />
            New Location
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {/* Controls row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <FilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: '', label: 'Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
            <FilterSelect
              value={stateFilter}
              onChange={setStateFilter}
              options={[
                { value: '', label: 'State' },
                ...uniqueStates.map((s) => ({ value: s, label: s })),
              ]}
            />
            <FilterSelect
              value={complianceFilter}
              onChange={setComplianceFilter}
              options={COMPLIANCE_OPTIONS}
            />
            <FilterSelect
              value={locationAdminFilter}
              onChange={setLocationAdminFilter}
              options={[
                { value: '', label: 'Location Admin' },
                ...uniqueAdmins.map((a) => ({ value: a, label: a })),
              ]}
            />
            <FilterSelect
              value={ratingFilter}
              onChange={setRatingFilter}
              options={RATING_OPTIONS}
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
            {selectedLocations.size === 0 && (
              <div className="w-60">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Search locations..."
                  inputClassName="bg-white border border-border focus:border-brand-light"
                />
              </div>
            )}
            <button
              className={`flex items-center gap-1.5 h-8 rounded-lg bg-brand/[0.08] text-brand hover:bg-brand/[0.14] transition-colors text-sm font-medium ${selectedLocations.size > 0 ? 'px-3' : 'w-8 justify-center'}`}
              title="Export"
            >
              <i className="ri-download-line text-sm" />
              {selectedLocations.size > 0 && <span>Export ({selectedLocations.size})</span>}
            </button>
          </div>
        </div>

        {/* Desktop table */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="border-b border-border-light bg-surface/60">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-border text-brand cursor-pointer accent-brand"
                    />
                  </th>
                  <th className="text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3 w-10">#</th>
                  {['Location', 'Location Admin', 'Facility Types', 'Compliance', 'Rating'].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState
                        icon={hasActiveFilters || search ? 'ri-filter-off-line' : 'ri-map-pin-2-line'}
                        title={hasActiveFilters || search ? 'No locations match your filters' : 'No locations found'}
                        className="py-16"
                        titleClassName="text-sm"
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map((group, idx) => {
                    return (
                      <>
                        <tr
                          key={group.location}
                          onClick={() => navigate(`/sbu/locations/${encodeURIComponent(group.location)}`)}
                          className="border-b border-border-light last:border-0 hover:bg-surface/70 transition-colors cursor-pointer group"
                        >
                          <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedLocations.has(group.location)}
                              onChange={() => toggleLocation(group.location)}
                              className="w-4 h-4 rounded border-border cursor-pointer accent-brand"
                            />
                          </td>
                          <td className="px-4 py-3.5 text-sm text-text-tertiary tabular-nums">
                            {String(idx + 1).padStart(2, '0')}
                          </td>

                          {/* Location — avatar + name + state + status badge */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-brand-red-50 shrink-0 flex items-center justify-center border border-brand-red-100">
                                <i className="ri-map-pin-2-fill text-brand" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-text-primary leading-tight whitespace-nowrap group-hover:text-brand transition-colors">
                                    {group.location}
                                  </p>
                                  <span className={`flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                                    group.status === 'active'
                                      ? 'bg-green-surface text-green-fg'
                                      : 'bg-surface-secondary text-text-tertiary'
                                  }`}>
                                    {group.status === 'active' ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                                <p className="text-[11px] text-text-tertiary mt-0.5 whitespace-nowrap">{group.state}</p>
                              </div>
                            </div>
                          </td>

                          {/* Location Admin — avatar + name + empId + email · phone always visible */}
                          <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                            {group.adminDetails.length > 0 ? (
                              group.adminDetails.map((admin) => (
                                <div key={admin.name} className="flex items-start gap-2">
                                  <div className="w-5 h-5 mt-0.5 rounded-full bg-surface-secondary flex items-center justify-center flex-shrink-0">
                                    <i className="ri-user-line text-text-tertiary text-[11px]" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-sm text-text-primary whitespace-nowrap">{admin.name}</span>
                                      <span className="text-[11px] text-text-tertiary font-mono">{admin.empId}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-text-secondary whitespace-nowrap">
                                      <span>{admin.email}</span>
                                      <span className="text-text-tertiary">·</span>
                                      <span>{admin.phone}</span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <span className="text-sm text-text-tertiary">—</span>
                            )}
                          </td>

                          {/* Facility types */}
                          <td className="px-4 py-3.5">
                            <div className="flex flex-wrap gap-1">
                              {group.types.map((type) => (
                                <span
                                  key={type}
                                  className="text-[11px] bg-surface-secondary text-text-secondary px-2 py-0.5 rounded-md font-medium whitespace-nowrap"
                                >
                                  {type}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Compliance status — from current period ComplianceRecord */}
                          <td className="px-4 py-3.5">
                            {(() => {
                              const status = (currentPeriodStatusMap.get(group.location) ?? 'pending') as FacilityComplianceStatus
                              return (
                                <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${COMPLIANCE_STYLE[status]}`}>
                                  {COMPLIANCE_LABEL[status]}
                                </span>
                              )
                            })()}
                          </td>

                          {/* Rating — average across all submitted/updated compliance records to date */}
                          <td className="px-4 py-3.5">
                            {(() => {
                              const rating = locationAvgRatingMap.get(group.location)
                              if (!rating || rating.stars === null) {
                                return <span className="text-sm text-text-tertiary">—</span>
                              }
                              return (
                                <div>
                                  <div className="flex items-center gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <i
                                        key={i}
                                        className={`ri-star-fill text-xs ${i < rating.stars! ? 'text-amber-400' : 'text-border'}`}
                                      />
                                    ))}
                                  </div>
                                  <p className="text-xs text-text-tertiary mt-0.5 tabular-nums whitespace-nowrap">
                                    {rating.avgPct}% avg · {rating.count} record{rating.count !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              )
                            })()}
                          </td>
                        </tr>

                      </>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        {filtered.length > 0 && (
          <p className="text-sm text-text-secondary">{filtered.length} location{filtered.length !== 1 ? 's' : ''}</p>
        )}
      </div>
    </div>
  )
}
