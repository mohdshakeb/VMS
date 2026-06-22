import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore, getNotificationsForRole, getUnreadCount } from '@/store/notificationStore'
import type { Notification } from '@/types/notification'
import type { FacilityComplianceStatus, FacilityType } from '@/types/facility'
import Button from '@/components/Button'
import PageHeader from '@/components/PageHeader'
import NotificationBell from '@/components/NotificationBell'
import FacilityStatusBadge from '@/components/facility/FacilityStatusBadge'
import EmptyState from '@/components/common/EmptyState'
import CountBadge from '@/components/common/CountBadge'
import { formatRelativeTime } from '@/utils/helpers'
import { PROTOTYPE_NOW, CURRENT_COMPLIANCE_PERIOD, formatComplianceDueDate } from '@/data/facilityData'
import { LOCATION_ADMIN_LOCATIONS, groupFacilitiesByLocation, type LocationGroup } from '@/utils/facilityHelpers'
import type { ComplianceRecord } from '@/types/facility'

const TYPE_ICONS: Record<string, string> = {
  'walk-in-approval':              'ri-walk-line',
  'visit-confirmed':               'ri-check-double-line',
  'visit-rejected':                'ri-close-circle-line',
  'visitor-arrived':               'ri-map-pin-user-line',
  'visitor-checked-out':           'ri-logout-box-line',
  'new-pending-request':           'ri-file-add-line',
  'compliance-window-open':        'ri-calendar-check-line',
  'compliance-deadline-reminder':  'ri-alarm-warning-line',
  'compliance-submitted':          'ri-shield-check-line',
  'compliance-overdue':            'ri-error-warning-line',
  'compliance-missed':             'ri-close-circle-line',
  'sbu-edited':                    'ri-edit-2-line',
}

const TYPE_COLORS: Record<string, string> = {
  'walk-in-approval':              'text-pending bg-pending-surface',
  'visit-confirmed':               'text-confirmed bg-confirmed-surface',
  'visit-rejected':                'text-rejected bg-rejected-surface',
  'visitor-arrived':               'text-on-premises bg-on-premises-surface',
  'visitor-checked-out':           'text-completed bg-completed-surface',
  'new-pending-request':           'text-active bg-active-surface',
  'compliance-window-open':        'text-active bg-active-surface',
  'compliance-deadline-reminder':  'text-pending bg-pending-surface',
  'compliance-submitted':          'text-confirmed bg-confirmed-surface',
  'compliance-overdue':            'text-rejected bg-rejected-surface',
  'compliance-missed':             'text-rejected bg-rejected-surface',
  'sbu-edited':                    'text-pending bg-pending-surface',
}

const MONTH_LABEL = PROTOTYPE_NOW.toLocaleString('default', { month: 'long', year: 'numeric' })

function getCtaLabel(status?: FacilityComplianceStatus): string | null {
  if (!status || status === 'pending') return 'Start Compliance'
  if (status === 'draft') return 'Continue'
  if (status === 'overdue') return 'Submit Now'
  if (status === 'submitted' || status === 'updated') return 'View Submission'
  return null
}

// ─── Single-location card (tall, identity-card style) ───────────────────────
function SingleLocationCard({
  group,
  record,
  onCompliance,
  onDetail,
}: {
  group: LocationGroup
  record: ComplianceRecord | undefined
  onCompliance: () => void
  onDetail: () => void
}) {
  const firstFacility = group.facilities[0]
  const ctaLabel = getCtaLabel(record?.status)
  const answered = record?.checklist.filter((e) => e.answer !== undefined).length ?? 0
  const total = record?.checklist.length ?? 0
  const types: FacilityType[] = record?.facilityTypes ?? ([...new Set(group.facilities.map((f) => f.type))] as FacilityType[])
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0

  const initials = group.location
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')

  return (
    <div className="bg-white rounded-xl border border-border-light flex flex-col flex-1">
      {/* Header: avatar + name + status */}
      <div className="p-5 flex items-start gap-4 border-b border-border-light">
        <div className="h-14 w-14 rounded-full bg-brand-red-50 border border-brand-red-100 flex items-center justify-center shrink-0">
          <span className="text-base font-semibold text-brand">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-text-primary leading-tight truncate">{group.location}</p>
          <p className="text-sm text-text-secondary mt-0.5">{firstFacility.city} · {firstFacility.state}</p>
        </div>
        {record && (
          <div className="shrink-0">
            <FacilityStatusBadge status={record.status} />
          </div>
        )}
      </div>

      {/* Identity fields */}
      <div className="px-5 pt-5 pb-4 flex-1 space-y-4">
        <div>
          <p className="text-xs text-text-tertiary mb-0.5">Location Admin</p>
          <p className="text-sm font-medium text-text-primary">{group.admins.join(', ') || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-text-tertiary mb-0.5">Facility Types</p>
          <p className="text-sm font-medium text-text-primary">{types.join(' · ')}</p>
        </div>
        <div>
          <p className="text-xs text-text-tertiary mb-0.5">Facilities</p>
          <p className="text-sm font-medium text-text-primary">
            {group.facilities.length} facilit{group.facilities.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>

        {record && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs text-text-tertiary">{MONTH_LABEL} compliance</p>
              <span className="text-xs text-text-secondary">{answered} / {total}</span>
            </div>
            <div className="h-1.5 bg-surface-secondary rounded-full overflow-hidden">
              <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            {record.month && (
              <p className="text-xs text-text-tertiary mt-1.5">
                Due {formatComplianceDueDate(record.month, record.year)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-5 pb-5 pt-4 border-t border-border-light flex gap-2">
        {ctaLabel && (
          <Button onClick={onCompliance} variant="primary" size="md" className="flex-1">
            {ctaLabel}
          </Button>
        )}
        <Button onClick={onDetail} variant="secondary" size="md" className="flex-1">
          View Detail
        </Button>
      </div>
    </div>
  )
}

// ─── Compact location card (no hover/shadow/click — buttons only) ────────────
function CompactLocationCard({
  group,
  record,
  onCompliance,
  onDetail,
}: {
  group: LocationGroup
  record: ComplianceRecord | undefined
  onCompliance: () => void
  onDetail: () => void
}) {
  const firstFacility = group.facilities[0]
  const ctaLabel = getCtaLabel(record?.status)
  const answered = record?.checklist.filter((e) => e.answer !== undefined).length ?? 0
  const total = record?.checklist.length ?? 0
  const types: FacilityType[] = record?.facilityTypes ?? ([...new Set(group.facilities.map((f) => f.type))] as FacilityType[])

  return (
    <div className="bg-white rounded-xl border border-border-light">
      {/* Top: icon + location name + status */}
      <div className="px-4 pt-4 pb-2 flex gap-3 items-start">
        <div className="shrink-0 h-10 w-10 rounded-full bg-brand-red-50 flex items-center justify-center border border-brand-red-100">
          <i className="ri-map-pin-2-fill text-brand text-[15px]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{group.location}</p>
          <p className="text-xs text-text-secondary truncate mt-0.5">{types.join(' · ')}</p>
        </div>
        {record && (
          <div className="shrink-0">
            <FacilityStatusBadge status={record.status} />
          </div>
        )}
      </div>

      {/* Footer: meta + buttons right-aligned (VisitCard pattern) */}
      <div className="pl-[4.25rem] pr-4 pb-3 flex items-center gap-x-3 text-xs text-text-secondary">
        <span className="inline-flex items-center gap-1">
          <i className="ri-map-pin-line text-text-tertiary/80" />
          {firstFacility.city} · {firstFacility.state}
        </span>
        {record && (
          <span className="inline-flex items-center gap-1">
            <i className="ri-list-check text-text-tertiary/80" />
            {answered} / {total}
          </span>
        )}
        {record?.month && (
          <span className="inline-flex items-center gap-1">
            <i className="ri-calendar-line text-text-tertiary/80" />
            Due {formatComplianceDueDate(record.month, record.year)}
          </span>
        )}
        <div className="ml-auto flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="secondary" onClick={onDetail}>View Detail</Button>
          {ctaLabel && (
            <Button size="sm" variant="primary" onClick={onCompliance}>{ctaLabel}</Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export default function LocationAdminDashboardDesktop() {
  const navigate = useNavigate()
  const allFacilities = useFacilityStore((s) => s.facilities)
  const allRecords = useFacilityStore((s) => s.complianceRecords)
  const { month: PERIOD_MONTH, year: PERIOD_YEAR } = CURRENT_COMPLIANCE_PERIOD

  const locationGroups = useMemo(
    () => groupFacilitiesByLocation(allFacilities.filter((f) => LOCATION_ADMIN_LOCATIONS.includes(f.location))),
    [allFacilities],
  )
  const currentMonthRecords = useMemo(
    () => allRecords.filter(
      (r) => LOCATION_ADMIN_LOCATIONS.includes(r.locationName) && r.month === PERIOD_MONTH && r.year === PERIOD_YEAR,
    ),
    [allRecords],
  )

  const [previewSingle, setPreviewSingle] = useState(false)
  const displayedGroups = previewSingle ? locationGroups.slice(0, 1) : locationGroups

  const { currentRole } = useAuthStore()
  const notifications = useNotificationStore((s) => s.notifications)
  const markAsRead = useNotificationStore((s) => s.markAsRead)
  const markAllRead = useNotificationStore((s) => s.markAllRead)
  const openNotificationsModal = useNotificationStore((s) => s.openNotificationsModal)
  const facilityNotifications = getNotificationsForRole(notifications, currentRole)
  const unreadCount = getUnreadCount(notifications, currentRole)

  function handleNotificationClick(n: Notification) {
    markAsRead(n.id)
    if (['compliance-submitted', 'sbu-edited', 'compliance-overdue', 'compliance-missed'].includes(n.type)) {
      navigate(n.recordId ? `/facility/compliance/record/${n.recordId}` : '/facility/compliance')
    } else if (['compliance-window-open', 'compliance-deadline-reminder'].includes(n.type)) {
      navigate('/facility/compliance')
    }
  }

  function getRecord(locationName: string) {
    return currentMonthRecords.find((r) => r.locationName === locationName)
  }

  function compliancePath(record?: ComplianceRecord) {
    return record ? `/facility/compliance/record/${record.id}` : '/facility/compliance'
  }

  const isSingle = displayedGroups.length === 1

  return (
    <div className="hidden md:flex md:flex-col h-full bg-surface-secondary">
      <PageHeader
        title="Dashboard"
        icon={<NotificationBell unreadCount={unreadCount} onClick={openNotificationsModal} />}
      />

      <div className="flex-1 overflow-y-auto">
        <div className={`px-6 py-6 flex gap-5 ${isSingle ? 'items-stretch' : 'items-start'}`}>

          {/* Left: location cards */}
          <div className={`flex-1 min-w-0 flex flex-col gap-3 ${isSingle ? 'self-stretch' : ''}`}>
            {isSingle ? (
              <SingleLocationCard
                group={displayedGroups[0]}
                record={getRecord(displayedGroups[0].location)}
                onCompliance={() => navigate(compliancePath(getRecord(displayedGroups[0].location)))}
                onDetail={() => navigate(`/facility/locations/${encodeURIComponent(displayedGroups[0].location)}`)}
              />
            ) : (
              displayedGroups.map((group) => {
                const record = getRecord(group.location)
                return (
                  <CompactLocationCard
                    key={group.location}
                    group={group}
                    record={record}
                    onCompliance={() => navigate(compliancePath(record))}
                    onDetail={() => navigate(`/facility/locations/${encodeURIComponent(group.location)}`)}
                  />
                )
              })
            )}
          </div>

          {/* Right: notifications (fixed width) */}
          <div className={`w-80 shrink-0 ${isSingle ? 'flex flex-col self-stretch' : 'sticky top-4 self-start'}`}>
            <div className={`bg-white rounded-xl border border-border overflow-hidden ${isSingle ? 'flex flex-col h-full' : ''}`}>
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

              <div className={isSingle ? 'flex-1 overflow-y-auto' : ''}>
                {facilityNotifications.length === 0 ? (
                  <EmptyState icon="ri-notification-off-line" title="No notifications" />
                ) : (
                  [...facilityNotifications]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5)
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

              <div className="border-t border-border-light px-4 py-2.5 shrink-0">
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

      {/* ── Demo toggle (not part of prototype) ── */}
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-1 bg-white/95 backdrop-blur border border-dashed border-border rounded-xl px-3 py-2 shadow-lg">
        <i className="ri-test-tube-line text-text-tertiary text-sm mr-1" />
        <span className="text-[11px] font-medium text-text-tertiary mr-1.5">Demo</span>
        <button
          onClick={() => setPreviewSingle(true)}
          className={`text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors ${previewSingle ? 'bg-brand text-white' : 'text-text-secondary hover:bg-surface-secondary'}`}
        >
          1 location
        </button>
        <button
          onClick={() => setPreviewSingle(false)}
          className={`text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors ${!previewSingle ? 'bg-brand text-white' : 'text-text-secondary hover:bg-surface-secondary'}`}
        >
          3 locations
        </button>
      </div>
    </div>
  )
}
