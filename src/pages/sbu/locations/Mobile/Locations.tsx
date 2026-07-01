// ─────────────────────────────────────────────────────────────────────────────
// Locations — Mobile
// No PageHeader — AppLayout's MobileTopBar provides the chrome.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import { useAuthStore } from '@/store/authStore'
import EmptyState from '@/components/common/EmptyState'
import MobileSearchInput from '@/components/Mobile/MobileSearchInput'
import StarRating from '@/components/common/StarRating'
import { groupFacilitiesByLocation, getLocationAverageRating, COMPLIANCE_LABEL, COMPLIANCE_STYLE } from '@/utils/facilityHelpers'
import type { FacilityComplianceStatus } from '@/types/facility'

const RATING_OPTIONS = [
  { label: 'All ratings', value: '' },
  { label: '5 Stars', value: '5' },
  { label: '3 Stars & Up', value: '3plus' },
  { label: 'Below 3 Stars', value: 'below3' },
]

export default function LocationsMobile() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { currentSbu } = useAuthStore()
  const facilities = useFacilityStore((s) => s.facilities)
  const allRecords = useFacilityStore((s) => s.complianceRecords)

  const sbuFacilities = useMemo(() => facilities.filter((f) => f.sbu === currentSbu), [facilities, currentSbu])
  const adminFilter = searchParams.get('admin') ?? ''

  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState(() => searchParams.get('rating') ?? '')

  const allLocationGroups = useMemo(() => groupFacilitiesByLocation(sbuFacilities), [sbuFacilities])

  const locationAvgRatingMap = useMemo(() => {
    const map = new Map<string, { avgPct: number | null; stars: number | null; count: number }>()
    allLocationGroups.forEach((g) => map.set(g.location, getLocationAverageRating(allRecords, g.location)))
    return map
  }, [allLocationGroups, allRecords])

  const locationGroups = useMemo(() => {
    let groups = allLocationGroups
    if (adminFilter) groups = groups.filter((g) => g.admins.includes(adminFilter))
    if (ratingFilter === 'below3') {
      groups = groups.filter((g) => {
        const stars = locationAvgRatingMap.get(g.location)?.stars
        return stars !== null && stars !== undefined && stars < 3
      })
    } else if (ratingFilter === '3plus') {
      groups = groups.filter((g) => {
        const stars = locationAvgRatingMap.get(g.location)?.stars
        return stars !== null && stars !== undefined && stars >= 3
      })
    } else if (ratingFilter === '5') {
      groups = groups.filter((g) => locationAvgRatingMap.get(g.location)?.stars === 5)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      groups = groups.filter((g) => g.location.toLowerCase().includes(q))
    }
    return [...groups].sort((a, b) => a.location.localeCompare(b.location))
  }, [allLocationGroups, adminFilter, ratingFilter, locationAvgRatingMap, search])

  return (
    <div className="md:hidden h-full flex flex-col bg-surface-secondary">
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-3 pb-10 flex flex-col gap-3">

          <MobileSearchInput value={search} onChange={setSearch} placeholder="Search locations..." />

          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
            <div className="relative shrink-0">
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className={`text-xs border rounded-lg pl-3 pr-7 py-2 appearance-none cursor-pointer focus:outline-none transition-colors ${ratingFilter ? 'bg-brand-light text-brand border-brand' : 'bg-white border-border text-text-secondary'}`}
              >
                {RATING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {ratingFilter ? (
                <button
                  type="button"
                  aria-label="Clear rating filter"
                  onClick={(e) => { e.stopPropagation(); setRatingFilter('') }}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-brand"
                >
                  <i className="ri-close-circle-fill text-sm" />
                </button>
              ) : (
                <i className="ri-arrow-down-s-line pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-sm text-text-tertiary" />
              )}
            </div>

            {ratingFilter && (
              <button
                onClick={() => setRatingFilter('')}
                className="shrink-0 flex items-center gap-1 text-xs text-text-secondary px-2 py-1.5 rounded-lg border border-border bg-white"
              >
                <i className="ri-close-circle-line text-sm" />
                Clear
              </button>
            )}
          </div>

          {locationGroups.length === 0 ? (
            <EmptyState icon="ri-map-pin-2-line" title={search ? 'No locations match your search' : 'No locations in this SBU'} className="py-12" titleClassName="text-sm" />
          ) : (
            locationGroups.map((group) => {
              const rating = locationAvgRatingMap.get(group.location)
              return (
              <div
                key={group.location}
                onClick={() => navigate(`/sbu/locations/${encodeURIComponent(group.location)}`)}
                className="bg-white border border-border-light rounded-xl p-4 cursor-pointer active:shadow-sm transition-all duration-150"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{group.location}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{group.state}</p>
                  </div>
                  <span className="shrink-0 text-xs text-text-secondary bg-surface-secondary px-2 py-0.5 rounded-full">
                    {group.facilities.length} facilit{group.facilities.length !== 1 ? 'ies' : 'y'}
                  </span>
                </div>
                <p className="text-xs text-text-tertiary mb-2">{group.admins.length > 0 ? group.admins.join(', ') : 'Unassigned'}</p>
                <div className="flex items-center gap-2 mb-2">
                  <StarRating stars={rating?.stars ?? null} size="xs" className="shrink-0" />
                  {rating?.avgPct !== null && rating?.avgPct !== undefined && (
                    <span className="text-[11px] text-text-tertiary">{rating.avgPct}% avg</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(group.statusCounts) as FacilityComplianceStatus[]).map((status) => (
                    <span
                      key={status}
                      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${COMPLIANCE_STYLE[status]}`}
                    >
                      {group.statusCounts[status]} {COMPLIANCE_LABEL[status]}
                    </span>
                  ))}
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
