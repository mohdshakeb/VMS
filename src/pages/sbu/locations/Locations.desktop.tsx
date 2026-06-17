import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore, getUnreadCount } from '@/store/notificationStore'
import PageHeader from '@/components/PageHeader'
import NotificationBell from '@/components/NotificationBell'
import EmptyState from '@/components/common/EmptyState'
import SearchBar from '@/components/SearchBar'
import type { FacilityComplianceStatus } from '@/types/facility'
import { groupFacilitiesByLocation, COMPLIANCE_LABEL, COMPLIANCE_STYLE } from '@/utils/facilityHelpers'

const COMPLIANCE_OPTIONS: { value: FacilityComplianceStatus | ''; label: string }[] = [
  { value: '', label: 'Compliance' },
  { value: 'pending',   label: 'Pending' },
  { value: 'draft',     label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'updated',   label: 'Updated' },
  { value: 'overdue',   label: 'Overdue' },
]

export default function LocationsDesktop() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { currentRole, currentSbu } = useAuthStore()
  const notifications = useNotificationStore((s) => s.notifications)
  const unreadCount = getUnreadCount(notifications, currentRole)
  const openNotificationsModal = useNotificationStore((s) => s.openNotificationsModal)
  const facilities = useFacilityStore((s) => s.facilities)

  const sbuFacilities = useMemo(() => facilities.filter((f) => f.sbu === currentSbu), [facilities, currentSbu])
  const locationGroups = useMemo(() => groupFacilitiesByLocation(sbuFacilities), [sbuFacilities])

  const [search, setSearch] = useState('')
  const [adminFilter, setAdminFilter] = useState(searchParams.get('admin') ?? '')
  const [complianceFilter, setComplianceFilter] = useState<FacilityComplianceStatus | ''>('')
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set())

  // Re-sync the admin filter when ?admin= changes after mount (e.g. navigating here from the dashboard roster)
  const [lastAdminParam, setLastAdminParam] = useState(searchParams.get('admin'))
  if (searchParams.get('admin') !== lastAdminParam) {
    setLastAdminParam(searchParams.get('admin'))
    setAdminFilter(searchParams.get('admin') ?? '')
  }

  const filtered = useMemo(() => {
    let result = [...locationGroups]
    if (adminFilter) result = result.filter((g) => g.admins.includes(adminFilter))
    if (complianceFilter) result = result.filter((g) => (g.statusCounts[complianceFilter] ?? 0) > 0)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter((g) => g.location.toLowerCase().includes(q))
    }
    result.sort((a, b) => a.location.localeCompare(b.location))
    return result
  }, [locationGroups, adminFilter, complianceFilter, search])

  const hasActiveFilters = adminFilter !== '' || complianceFilter !== ''

  function clearFilters() {
    setAdminFilter('')
    setComplianceFilter('')
  }

  useEffect(() => {
    setSelectedLocations(new Set())
  }, [adminFilter, complianceFilter, search])

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
      />

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {/* Controls row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
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

          <div className="flex items-center gap-2">
            <div className="w-60">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search locations..."
                inputClassName="bg-white border border-border focus:border-brand-light"
              />
            </div>
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
            <table className="w-full min-w-[800px]">
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
                  {['Location', 'State', 'Location Admin', 'Facilities', 'Compliance'].map((h) => (
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
                    const pendingDraftBadges = (['pending', 'draft'] as FacilityComplianceStatus[]).filter(
                      (s) => (group.statusCounts[s] ?? 0) > 0
                    )
                    return (
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
                        <td className="px-4 py-3.5">
                          <p className="text-sm font-medium text-text-primary leading-tight group-hover:text-brand transition-colors">{group.location}</p>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <p className="text-sm text-text-secondary">{group.state}</p>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <p className="text-sm text-text-secondary">{group.admins.length > 0 ? group.admins.join(', ') : '—'}</p>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-sm text-text-secondary">
                            {group.facilities.length} facilit{group.facilities.length !== 1 ? 'ies' : 'y'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap gap-1.5">
                            {pendingDraftBadges.length > 0 ? (
                              pendingDraftBadges.map((status) => (
                                <span
                                  key={status}
                                  className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${COMPLIANCE_STYLE[status]}`}
                                >
                                  {group.statusCounts[status]} {COMPLIANCE_LABEL[status]}
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] font-medium text-text-secondary">All submitted</span>
                            )}
                          </div>
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
          <p className="text-sm text-text-secondary">{filtered.length} location{filtered.length !== 1 ? 's' : ''}</p>
        )}
      </div>
    </div>
  )
}
