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
import { groupFacilitiesByLocation, COMPLIANCE_LABEL, COMPLIANCE_STYLE } from '@/utils/facilityHelpers'
import type { FacilityComplianceStatus } from '@/types/facility'

export default function LocationsMobile() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { currentSbu } = useAuthStore()
  const facilities = useFacilityStore((s) => s.facilities)

  const sbuFacilities = useMemo(() => facilities.filter((f) => f.sbu === currentSbu), [facilities, currentSbu])
  const adminFilter = searchParams.get('admin') ?? ''

  const [search, setSearch] = useState('')

  const locationGroups = useMemo(() => {
    let groups = groupFacilitiesByLocation(sbuFacilities)
    if (adminFilter) groups = groups.filter((g) => g.admins.includes(adminFilter))
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      groups = groups.filter((g) => g.location.toLowerCase().includes(q))
    }
    return groups.sort((a, b) => a.location.localeCompare(b.location))
  }, [sbuFacilities, adminFilter, search])

  return (
    <div className="md:hidden h-full flex flex-col bg-surface-secondary">
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-3 pb-10 flex flex-col gap-3">

          <MobileSearchInput value={search} onChange={setSearch} placeholder="Search locations..." />

          {locationGroups.length === 0 ? (
            <EmptyState icon="ri-map-pin-2-line" title={search ? 'No locations match your search' : 'No locations in this SBU'} className="py-12" titleClassName="text-sm" />
          ) : (
            locationGroups.map((group) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  )
}
