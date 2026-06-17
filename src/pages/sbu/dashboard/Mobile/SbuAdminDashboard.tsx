// ─────────────────────────────────────────────────────────────────────────────
// SBU Admin Dashboard — Mobile
// No PageHeader — AppLayout's MobileTopBar provides the chrome.
// No responsive prefixes — every class here describes the mobile layout as-is.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore, getNotificationsForRole } from '@/store/notificationStore'
import type { FacilityType } from '@/types/facility'
import KpiCardV2 from '@/components/KpiCardV2'
import SbuComplianceCard from '@/components/facility/SbuComplianceCard'
import EmptyState from '@/components/common/EmptyState'
import CountBadge from '@/components/common/CountBadge'
import BottomSheet from '@/components/Mobile/BottomSheet'
import Button from '@/components/Button'
import { formatRelativeTime } from '@/utils/helpers'
import { PROTOTYPE_NOW } from '@/data/facilityData'
import { getCurrentRecord, scoreChecklist } from '@/utils/facilityHelpers'

const TYPE_ICONS: Record<string, string> = {
  'compliance-window-open':        'ri-calendar-check-line',
  'compliance-deadline-reminder':  'ri-alarm-warning-line',
  'compliance-submitted':          'ri-shield-check-line',
  'compliance-overdue':            'ri-error-warning-line',
  'compliance-missed':             'ri-close-circle-line',
  'sbu-edited':                    'ri-edit-2-line',
  'facility-status-requested':     'ri-toggle-line',
  'facility-status-approved':      'ri-check-double-line',
  'facility-status-rejected':      'ri-close-circle-line',
}

const TYPE_COLORS: Record<string, string> = {
  'compliance-window-open':        'text-active bg-active-surface',
  'compliance-deadline-reminder':  'text-pending bg-pending-surface',
  'compliance-submitted':          'text-confirmed bg-confirmed-surface',
  'compliance-overdue':            'text-rejected bg-rejected-surface',
  'compliance-missed':             'text-rejected bg-rejected-surface',
  'sbu-edited':                    'text-pending bg-pending-surface',
  'facility-status-requested':     'text-pending bg-pending-surface',
  'facility-status-approved':      'text-confirmed bg-confirmed-surface',
  'facility-status-rejected':      'text-rejected bg-rejected-surface',
}

const MONTH_LABEL = PROTOTYPE_NOW.toLocaleString('default', { month: 'long', year: 'numeric' })

const FACILITY_TYPE_ORDER: FacilityType[] = ['Branch Office', 'Parts Warehouse', 'CRC', 'MRC', 'Repair Center', 'Executive Office', 'HQ']

export default function SbuAdminDashboardMobile() {
  const navigate = useNavigate()
  const facilities = useFacilityStore((s) => s.facilities)
  const complianceRecords = useFacilityStore((s) => s.complianceRecords)
  const { currentRole, currentSbu } = useAuthStore()
  const notifications = useNotificationStore((s) => s.notifications)
  const markAsRead = useNotificationStore((s) => s.markAsRead)
  const openNotificationsModal = useNotificationStore((s) => s.openNotificationsModal)

  const sbuFacilities = facilities.filter((f) => f.sbu === currentSbu)
  const sbuNotifications = getNotificationsForRole(notifications, currentRole)

  const dueThisMonth = sbuFacilities.filter((f) => f.complianceStatus === 'pending' || f.complianceStatus === 'draft').length
  const overdue = sbuFacilities.filter((f) => f.complianceStatus === 'overdue').length

  const scoreByFacility = useMemo(() => {
    const map = new Map<string, number>()
    sbuFacilities.forEach((f) => {
      if (f.complianceProgress > 0) {
        const record = getCurrentRecord(complianceRecords, f.id)
        if (record) map.set(f.id, scoreChecklist(record.checklist).percentage)
      }
    })
    return map
  }, [sbuFacilities, complianceRecords])

  const avgScore = useMemo(() => {
    const scores = [...scoreByFacility.values()]
    return scores.length > 0 ? Math.round(scores.reduce((sum, p) => sum + p, 0) / scores.length) : null
  }, [scoreByFacility])

  const [locationFilter, setLocationFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<FacilityType | ''>('')

  const locationOptions = useMemo(() => [...new Set(sbuFacilities.map((f) => f.location))].sort(), [sbuFacilities])
  const typeOptions = useMemo(
    () => FACILITY_TYPE_ORDER.filter((t) => sbuFacilities.some((f) => f.type === t)),
    [sbuFacilities]
  )

  const hasActiveFilters = locationFilter !== '' || typeFilter !== ''

  function clearFilters() {
    setLocationFilter('')
    setTypeFilter('')
  }

  const filteredFacilities = useMemo(() => {
    let result = sbuFacilities
    if (locationFilter) result = result.filter((f) => f.location === locationFilter)
    if (typeFilter) result = result.filter((f) => f.type === typeFilter)
    return result
  }, [sbuFacilities, locationFilter, typeFilter])

  const [filterSheetMounted, setFilterSheetMounted] = useState(false)
  const [filterSheetVisible, setFilterSheetVisible] = useState(false)

  function openFilterSheet() {
    setFilterSheetMounted(true)
    requestAnimationFrame(() => { requestAnimationFrame(() => setFilterSheetVisible(true)) })
  }

  function closeFilterSheet() {
    setFilterSheetVisible(false)
    setTimeout(() => setFilterSheetMounted(false), 260)
  }

  return (
    <div className="md:hidden h-full flex flex-col bg-surface-secondary">
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-3 pb-10 flex flex-col gap-4">

          {/* Header actions */}
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon="ri-shield-check-line" fullWidth onClick={() => navigate('/sbu/compliance')}>
              Review compliance
            </Button>
            <Button variant="primary" size="sm" icon="ri-add-line" fullWidth onClick={() => navigate('/sbu/onboarding/new')}>
              New Location
            </Button>
          </div>

          {/* KPI cards — horizontal scroll */}
          <div className="overflow-x-auto scrollbar-none -mx-4 px-4">
            <div className="flex gap-2.5">
              <div className="w-[40vw] shrink-0">
                <KpiCardV2
                  label="Facilities"
                  info={`${currentSbu} SBU`}
                  value={sbuFacilities.length}
                  icon="ri-building-2-line"
                  color="blue"
                  showInfo
                />
              </div>
              <div className="w-[40vw] shrink-0">
                <KpiCardV2
                  label="Avg Compliance Score"
                  info={`${scoreByFacility.size} of ${sbuFacilities.length} scored`}
                  value={avgScore !== null ? `${avgScore}%` : '—'}
                  icon="ri-bar-chart-2-line"
                  color="purple"
                  showInfo
                />
              </div>
              <div className="w-[40vw] shrink-0">
                <KpiCardV2
                  label="Due this month"
                  info="Pending or draft"
                  value={dueThisMonth}
                  icon="ri-calendar-close-line"
                  color="yellow"
                  showInfo
                />
              </div>
              <div className="w-[40vw] shrink-0">
                <KpiCardV2
                  label="Overdue"
                  info="Past cut-off date"
                  value={overdue}
                  icon="ri-alarm-warning-line"
                  color="red"
                  showInfo
                />
              </div>
              <div className="w-4 shrink-0" />
            </div>
          </div>

          {/* Compliance */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border-light">
              <i className="ri-shield-check-line text-text-tertiary text-base shrink-0" />
              <p className="text-sm font-semibold text-text-primary flex-1">Compliance — {MONTH_LABEL}</p>
              <CountBadge count={filteredFacilities.length} />
              <button
                onClick={openFilterSheet}
                className={`relative flex items-center justify-center w-8 h-8 rounded-lg border transition-colors ${hasActiveFilters ? 'bg-brand-light border-brand text-brand' : 'bg-white border-border text-text-secondary'}`}
              >
                <i className="ri-filter-3-line text-sm" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-brand text-[9px] font-semibold text-white flex items-center justify-center">
                    {[locationFilter, typeFilter].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
            <div className="p-3 space-y-2">
              {filteredFacilities.length === 0 ? (
                <EmptyState
                  icon={hasActiveFilters ? 'ri-filter-off-line' : 'ri-shield-check-line'}
                  title={hasActiveFilters ? 'No facilities match your filters' : 'No facilities in this SBU'}
                />
              ) : (
                filteredFacilities.map((facility) => {
                  const record = getCurrentRecord(complianceRecords, facility.id)
                  return (
                    <SbuComplianceCard
                      key={facility.id}
                      facility={facility}
                      recordId={record?.id}
                      submittedAt={record?.submittedAt}
                      submittedBy={record?.submittedBy}
                      month={record?.month}
                      year={record?.year}
                      percentage={scoreByFacility.get(facility.id)}
                    />
                  )
                })
              )}
            </div>
          </div>

          {/* Recent notifications */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border-light">
              <i className="ri-notification-3-line text-text-tertiary text-base shrink-0" />
              <p className="text-sm font-semibold text-text-primary flex-1">Notifications</p>
            </div>
            <div>
              {sbuNotifications.length === 0 ? (
                <EmptyState icon="ri-notification-off-line" title="No notifications" />
              ) : (
                [...sbuNotifications]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 4)
                  .map((notification, idx) => {
                    const icon = TYPE_ICONS[notification.type] ?? 'ri-notification-3-line'
                    const colorClass = TYPE_COLORS[notification.type] ?? 'text-text-secondary bg-surface-secondary'
                    return (
                      <div key={notification.id}>
                        {idx > 0 && <div className="h-px bg-surface-secondary mx-4" />}
                        <button
                          onClick={() => {
                            markAsRead(notification.id)
                            if (notification.type === 'compliance-submitted' || notification.type === 'sbu-edited' || notification.type === 'compliance-overdue' || notification.type === 'compliance-missed') {
                              navigate(notification.recordId ? `/sbu/compliance/record/${notification.recordId}` : '/sbu/compliance')
                            } else if (notification.type === 'compliance-window-open' || notification.type === 'compliance-deadline-reminder') {
                              navigate('/sbu/compliance')
                            } else if (notification.type === 'facility-status-requested' || notification.type === 'facility-status-approved' || notification.type === 'facility-status-rejected') {
                              navigate(notification.facilityId ? `/sbu/facilities/${notification.facilityId}` : '/sbu/locations')
                            }
                          }}
                          className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors active:bg-surface ${!notification.read ? 'bg-brand-light/20' : ''}`}
                        >
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
                            <i className={`${icon} text-base`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-xs ${!notification.read ? 'font-semibold' : 'font-medium'} text-text-primary leading-tight`}>
                                {notification.title}
                              </p>
                              <span className="text-[10px] text-text-tertiary whitespace-nowrap shrink-0">
                                {formatRelativeTime(notification.createdAt)}
                              </span>
                            </div>
                            <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-2">{notification.message}</p>
                          </div>
                          {!notification.read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0 mt-1.5" />
                          )}
                        </button>
                      </div>
                    )
                  })
              )}
            </div>
            <div className="border-t border-border-light px-4 py-2.5">
              <button
                onClick={openNotificationsModal}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-brand py-1"
              >
                Show all <i className="ri-arrow-right-s-line text-sm" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Filter sheet */}
      {filterSheetMounted && (
        <BottomSheet
          mounted={filterSheetMounted}
          visible={filterSheetVisible}
          onClose={closeFilterSheet}
          title="Filter Compliance"
          footer={
            <div className="flex gap-2">
              {hasActiveFilters && (
                <Button size="md" variant="secondary" fullWidth onClick={() => { clearFilters(); closeFilterSheet() }}>
                  Clear all
                </Button>
              )}
              <Button size="md" fullWidth onClick={closeFilterSheet}>
                Done
              </Button>
            </div>
          }
        >
          <div className="px-5 py-4 space-y-5">
            {/* Location */}
            <div>
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Location</p>
              <div className="flex flex-wrap gap-2">
                {['', ...locationOptions].map((val) => (
                  <button
                    key={val}
                    onClick={() => setLocationFilter(val)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${locationFilter === val ? 'bg-brand-light text-brand border-brand' : 'bg-white border-border text-text-secondary'}`}
                  >
                    {val === '' ? 'All' : val}
                  </button>
                ))}
              </div>
            </div>

            {/* Facility Type */}
            <div>
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Facility Type</p>
              <div className="flex flex-wrap gap-2">
                {(['', ...typeOptions] as (FacilityType | '')[]).map((val) => (
                  <button
                    key={val}
                    onClick={() => setTypeFilter(val)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${typeFilter === val ? 'bg-brand-light text-brand border-brand' : 'bg-white border-border text-text-secondary'}`}
                  >
                    {val === '' ? 'All' : val}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </BottomSheet>
      )}
    </div>
  )
}
