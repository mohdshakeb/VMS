import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore, getNotificationsForRole, getUnreadCount } from '@/store/notificationStore'
import type { Notification } from '@/types/notification'
import type { FacilityType } from '@/types/facility'
import KpiCardV2 from '@/components/KpiCardV2'
import PageHeader from '@/components/PageHeader'
import NotificationBell from '@/components/NotificationBell'
import Button from '@/components/Button'
import SbuComplianceCard from '@/components/facility/SbuComplianceCard'
import EmptyState from '@/components/common/EmptyState'
import CountBadge from '@/components/common/CountBadge'
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

export default function SbuAdminDashboardDesktop() {
  const navigate = useNavigate()
  const facilities = useFacilityStore((s) => s.facilities)
  const complianceRecords = useFacilityStore((s) => s.complianceRecords)
  const { currentRole, currentSbu } = useAuthStore()
  const notifications = useNotificationStore((s) => s.notifications)
  const markAsRead = useNotificationStore((s) => s.markAsRead)
  const markAllRead = useNotificationStore((s) => s.markAllRead)
  const openNotificationsModal = useNotificationStore((s) => s.openNotificationsModal)

  function handleNotificationClick(n: Notification) {
    markAsRead(n.id)
    if (n.type === 'compliance-submitted' || n.type === 'sbu-edited' || n.type === 'compliance-overdue' || n.type === 'compliance-missed') {
      navigate(n.recordId ? `/sbu/compliance/record/${n.recordId}` : '/sbu/compliance')
    } else if (n.type === 'compliance-window-open' || n.type === 'compliance-deadline-reminder') {
      navigate('/sbu/compliance')
    } else if (n.type === 'facility-status-requested' || n.type === 'facility-status-approved' || n.type === 'facility-status-rejected') {
      navigate(n.facilityId ? `/sbu/facilities/${n.facilityId}` : '/sbu/locations')
    }
  }

  const sbuFacilities = facilities.filter((f) => f.sbu === currentSbu)
  const sbuNotifications = getNotificationsForRole(notifications, currentRole)
  const unreadCount = getUnreadCount(notifications, currentRole)

  const dueThisMonth = sbuFacilities.filter((f) => f.complianceStatus === 'pending' || f.complianceStatus === 'draft').length
  const overdue = sbuFacilities.filter((f) => f.complianceStatus === 'overdue').length

  // Score per facility — only meaningful once at least one checklist item has been answered.
  const scoreByFacility = useMemo(() => {
    const map = new Map<string, number>()
    sbuFacilities.forEach((f) => {
      if (f.complianceProgress > 0) {
        const record = getCurrentRecord(complianceRecords, f.location)
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

  return (
    <div className="hidden md:flex md:flex-col h-full bg-surface-secondary">
      <PageHeader
        title="Dashboard"
        icon={<NotificationBell unreadCount={unreadCount} onClick={openNotificationsModal} />}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon="ri-shield-check-line" onClick={() => navigate('/sbu/compliance')}>
              Review compliance
            </Button>
            <Button variant="primary" size="sm" icon="ri-add-line" onClick={() => navigate('/sbu/onboarding/new')}>
              New Location
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-6 pb-10 flex flex-col gap-5 min-h-full">

          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCardV2
              label="Facilities"
              info={`${currentSbu} SBU`}
              value={sbuFacilities.length}
              icon="ri-building-2-line"
              color="blue"
            />
            <KpiCardV2
              label="Avg Compliance Score"
              info={`${scoreByFacility.size} of ${sbuFacilities.length} scored`}
              value={avgScore !== null ? `${avgScore}%` : '—'}
              icon="ri-bar-chart-2-line"
              color="purple"
            />
            <KpiCardV2
              label="Due this month"
              info="Pending or draft"
              value={dueThisMonth}
              icon="ri-calendar-close-line"
              color="yellow"
            />
            <KpiCardV2
              label="Overdue"
              info="Past cut-off date"
              value={overdue}
              icon="ri-alarm-warning-line"
              color="red"
            />
          </div>

          {/* Two-column layout: Compliance (3) + Notifications (2) */}
          <div className="flex flex-col lg:grid lg:grid-cols-5 gap-5">

            {/* Compliance — left column */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border-light">
                  <i className="ri-shield-check-line text-text-tertiary text-base shrink-0" />
                  <p className="text-sm font-semibold text-text-primary flex-1">Compliance — {MONTH_LABEL}</p>
                  <CountBadge count={filteredFacilities.length} />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-light flex-wrap">
                  <div className="relative">
                    <select
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className={`text-xs border rounded-lg pl-3 pr-8 py-2 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-light transition-colors ${locationFilter ? 'bg-brand-light text-brand border-brand' : 'bg-white border-border text-text-secondary'}`}
                    >
                      <option value="">Location</option>
                      {locationOptions.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                    <i className={`ri-arrow-down-s-line pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm ${locationFilter ? 'text-brand' : 'text-text-tertiary'}`} />
                  </div>

                  <div className="relative">
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as FacilityType | '')}
                      className={`text-xs border rounded-lg pl-3 pr-8 py-2 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-light transition-colors ${typeFilter ? 'bg-brand-light text-brand border-brand' : 'bg-white border-border text-text-secondary'}`}
                    >
                      <option value="">Facility Type</option>
                      {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <i className={`ri-arrow-down-s-line pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm ${typeFilter ? 'text-brand' : 'text-text-tertiary'}`} />
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

                <div className="p-3 space-y-2">
                  {filteredFacilities.length === 0 ? (
                    <EmptyState
                      icon={hasActiveFilters ? 'ri-filter-off-line' : 'ri-shield-check-line'}
                      title={hasActiveFilters ? 'No facilities match your filters' : 'No facilities in this SBU'}
                    />
                  ) : (
                    filteredFacilities.map((facility) => {
                      const record = getCurrentRecord(complianceRecords, facility.location)
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
            </div>

            {/* Notifications — right column, sticky */}
            <div className="lg:col-span-2 lg:sticky lg:top-4 lg:self-start">
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border-light shrink-0">
                  <i className="ri-notification-3-line text-text-tertiary text-base shrink-0" />
                  <p className="text-sm font-semibold text-text-primary flex-1">Notifications</p>
                  {unreadCount > 0 && <CountBadge count={unreadCount} />}
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllRead(currentRole)}
                      className="text-xs text-brand font-medium hover:text-brand-hover transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
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
                              onClick={() => handleNotificationClick(notification)}
                              className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface ${!notification.read ? 'bg-brand-light/20' : ''}`}
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
                                {notification.actionRequired && !notification.read && (
                                  <p className="text-[11px] text-brand font-medium mt-1">
                                    <i className="ri-arrow-right-s-line" /> Action required
                                  </p>
                                )}
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
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-brand hover:text-brand-hover transition-colors py-1"
                  >
                    Show all <i className="ri-arrow-right-s-line text-sm" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
