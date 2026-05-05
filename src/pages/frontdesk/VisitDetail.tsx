import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useVisitStore } from '@/store/visitStore'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { useIsMobile } from '@/hooks/useIsMobile'
import { employees } from '@/data/employees'
import { locations } from '@/data/locations'
import Card from '@/components/Card'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import DetailItem from '@/components/common/DetailItem'
import SectionLabel from '@/components/common/SectionLabel'
import CheckInModal from '@/components/CheckInModal'
import CheckOutModal from '@/components/CheckOutModal'
import CheckInSheet from '@/components/Mobile/CheckInSheet'
import CheckOutSheet from '@/components/Mobile/CheckOutSheet'
import {
  formatDate,
  formatTime,
  getLocalDateString,
  getVisitTypeLabel,
  getPurposeLabel,
  getDepartmentLabel,
  getBusinessSegmentLabel,
  getVisitorPriorityLabel,
} from '@/utils/helpers'
import type { EntryPath } from '@/types/visit'
import { parseIssuedAssets } from '@/data/assets'

const ENTRY_PATH_LABELS: Record<EntryPath, string> = {
  'walk-in': 'Walk-in',
  'employee-request': 'Employee Request',
  'pre-scheduled': 'Pre-scheduled',
  'self-register': 'Self-registered',
}

export default function VisitDetail() {
  const { visitId } = useParams<{ visitId: string }>()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const visits = useVisitStore((s) => s.visits)
  const storeVisitors = useVisitStore((s) => s.visitors)
  const { approveWalkIn, rejectWalkIn, cancelVisit } = useVisitStore()
  const checkInVisitId = useUIStore((s) => s.checkInVisitId)
  const checkOutVisitId = useUIStore((s) => s.checkOutVisitId)
  const openCheckIn = useUIStore((s) => s.openCheckIn)
  const openCheckOut = useUIStore((s) => s.openCheckOut)
  const closeModals = useUIStore((s) => s.closeModals)
  const { currentRole } = useAuthStore()

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [approveSuccess, setApproveSuccess] = useState(false)

  const visit = visits.find((v) => v.id === visitId)

  if (!visit) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-sm text-text-secondary">Visit not found</p>
      </div>
    )
  }

  const visitor = storeVisitors.find((v) => v.id === visit.visitorId)
  const host = employees.find((e) => e.id === visit.hostEmployeeId)
  const location = locations.find((l) => l.id === visit.locationId)

  const photoSrc = visit.idPhotoCapture ?? visitor?.avatar ?? null
  const initials = (visitor?.name ?? 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

  const isFrontDesk = currentRole === 'front-desk'
  const canCheckIn = isFrontDesk && ['confirmed', 'scheduled'].includes(visit.status)
  const canCheckOut = isFrontDesk && visit.status === 'checked-in'
  const canApproveReject = !isFrontDesk && visit.status === 'pending-approval'
  const canCancel = !isFrontDesk && ['confirmed', 'scheduled'].includes(visit.status)

  function handleApprove() {
    approveWalkIn(visit.id)
    setApproveSuccess(true)
  }

  function handleRejectConfirm() {
    if (!rejectReason.trim()) return
    rejectWalkIn(visit.id, rejectReason.trim())
    setShowRejectModal(false)
    setRejectReason('')
  }

  function handleCancelConfirm() {
    cancelVisit(visit.id)
    setShowCancelModal(false)
  }

  return (
    <>
    <div className="flex flex-col h-full">
      {/* Desktop header */}
      <PageHeader
        title="Visit Details"
        breadcrumb={[{ label: 'Dashboard', path: isFrontDesk ? '/front-desk/dashboard' : '/employee/dashboard' }]}
        onBack={() => navigate(-1)}
        actions={
          canCheckIn ? (
            <Button size="sm" icon="ri-login-box-line" onClick={() => openCheckIn(visit.id)}>
              Check In
            </Button>
          ) : canCheckOut ? (
            <Button size="sm" variant="danger" icon="ri-logout-box-line" onClick={() => openCheckOut(visit.id)}>
              Check Out
            </Button>
          ) : canApproveReject ? (
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" icon="ri-close-line" onClick={() => setShowRejectModal(true)}>
                Reject
              </Button>
              <Button size="sm" icon="ri-check-line" onClick={handleApprove}>
                Approve
              </Button>
            </div>
          ) : canCancel ? (
            <Button size="sm" variant="secondary" icon="ri-close-circle-line" onClick={() => setShowCancelModal(true)}>
              Cancel Visit
            </Button>
          ) : undefined
        }
      />

      {/* Mobile header */}
      <header className="md:hidden shrink-0 flex items-center gap-2 px-3 py-2.5 bg-white border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-9 h-9 rounded-xl text-text-secondary active:bg-surface-secondary transition-colors -ml-1 shrink-0"
        >
          <i className="ri-arrow-left-line text-xl" />
        </button>
        <div className="flex-1 min-w-0 flex items-center gap-1 text-sm">
          <span className="text-text-tertiary truncate">Dashboard</span>
          <span className="text-text-tertiary shrink-0">·</span>
          <span className="font-medium text-text-primary shrink-0">Visit Details</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 md:px-6 py-5 max-w-lg mx-auto space-y-4">

          {/* Visitor identity */}
          <Card>
            {/* Walk-in / check-in captured photo → portrait; otherwise circular avatar */}
            {photoSrc && (visit.entryPath === 'walk-in' || visit.idPhotoCapture) ? (
              <div className="flex gap-4">
                <img
                  src={photoSrc}
                  alt={visitor?.name}
                  className="w-20 h-28 rounded-xl object-cover shrink-0 border border-border"
                />
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-text-primary leading-tight">{visitor?.name ?? 'Unknown'}</p>
                      {visitor?.company && <p className="text-sm text-text-secondary mt-0.5">{visitor.company}</p>}
                    </div>
                    <StatusBadge status={visit.status} />
                  </div>
                  <div className="grid grid-cols-1 gap-y-2 text-sm">
                    <DetailItem label="Mobile" value={visitor?.mobile ?? '—'} />
                    {visitor?.email && <DetailItem label="Email" value={visitor.email} />}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3 mb-4">
                  <div className="shrink-0">
                    {photoSrc ? (
                      <img
                        src={photoSrc}
                        alt={visitor?.name}
                        className="h-14 w-14 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-brand-red-50 flex items-center justify-center text-sm font-semibold text-brand-red-500 border border-brand-red-100">
                        {initials}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-text-primary leading-tight">{visitor?.name ?? 'Unknown'}</p>
                        {visitor?.company && <p className="text-sm text-text-secondary mt-0.5">{visitor.company}</p>}
                      </div>
                      <StatusBadge status={visit.status} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <DetailItem label="Mobile" value={visitor?.mobile ?? '—'} />
                  {visitor?.email && <DetailItem label="Email" value={visitor.email} />}
                </div>
              </>
            )}
          </Card>

          {/* Visit details */}
          <Card>
            <SectionLabel icon="ri-calendar-check-line" title="Visit Details" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mt-3">
              <DetailItem label="Entry" value={ENTRY_PATH_LABELS[visit.entryPath] ?? visit.entryPath} />
              <DetailItem label="Visitor Type" value={getVisitTypeLabel(visit.visitType)} />
              <DetailItem label="Purpose" value={getPurposeLabel(visit.purpose)} />
              <DetailItem label="Host" value={host?.name ?? '—'} />
              {visit.department && <DetailItem label="Department" value={getDepartmentLabel(visit.department)} />}
              <DetailItem label="Location" value={location?.name ?? '—'} />
              <DetailItem label="Date" value={formatDate(visit.scheduledDate)} />
              <DetailItem label="Time" value={formatTime(visit.scheduledTime)} />
              {visit.isMultiDay && visit.endDate && (
                <DetailItem label="Until" value={formatDate(visit.endDate)} />
              )}
              {visit.duration != null && (
                <DetailItem label="Duration" value={formatDuration(visit.duration)} />
              )}
              <DetailItem label="WiFi Access" value={visit.guestWifi ? 'Yes' : 'No'} />
            </div>
          </Card>

          {/* Multi-day progress */}
          {visit.isMultiDay && visit.endDate && (() => {
            const days = buildDayTimeline(visit.scheduledDate, visit.endDate)
            const visitedCount = days.filter((d) => d.status === 'visited').length
            const hasToday = days.some((d) => d.status === 'today')
            const remainingCount = days.filter((d) => d.status === 'remaining').length
            const dayLabel = hasToday
              ? `Day ${visitedCount + 1} of ${days.length}`
              : visitedCount === days.length
                ? `All ${days.length} days completed`
                : `${remainingCount} day${remainingCount !== 1 ? 's' : ''} remaining`

            return (
              <Card>
                <SectionLabel icon="ri-calendar-event-line" title="Visit Progress" />
                <div className="flex items-center gap-1.5 mt-3 mb-2">
                  {days.map((day) => (
                    <div
                      key={day.date}
                      className={[
                        'h-2 flex-1 rounded-full',
                        day.status === 'visited' && 'bg-green-500',
                        day.status === 'today' && 'bg-brand-red-500',
                        day.status === 'remaining' && 'bg-surface-tertiary',
                      ].filter(Boolean).join(' ')}
                    />
                  ))}
                </div>
                <p className="text-xs text-text-tertiary">{dayLabel}</p>
              </Card>
            )
          })()}

          {/* Check-in info */}
          {visit.checkInTime && (
            <Card>
              <SectionLabel icon="ri-login-box-line" title="Check-In" />
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mt-3">
                <DetailItem label="Badge" value={visit.badgeNumber ?? '—'} />
                <DetailItem label="Checked In" value={new Date(visit.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                <DetailItem label="ID Type" value={visit.idProofType ? idProofLabel(visit.idProofType) : '—'} />
                <DetailItem label="ID Number" value={visit.idProofNumber ?? '—'} />
                {visit.visitorInTemperature && <DetailItem label="Entry Temp." value={visit.visitorInTemperature} />}
              </div>
              {/* Items issued — always shown since it's mandatory at check-in */}
              <div className="mt-4 pt-3 border-t border-border-light">
                <p className="text-xs text-text-tertiary mb-2">Items Issued</p>
                {(visit.issueAssets === false || (visit.issueAssets === undefined && !visit.assetsIssued)) ? (
                  <p className="text-sm font-medium text-text-primary">{visit.issueAssets === false ? 'None' : '—'}</p>
                ) : (() => {
                  const assets = parseIssuedAssets(visit.assetsIssued)
                  return assets.length === 0 ? (
                    <p className="text-sm font-medium text-text-primary">{visit.assetsIssued ?? 'Yes'}</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {assets.map((asset) => (
                        <div
                          key={asset.id}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-secondary border border-border-light"
                        >
                          {asset.svg ? (
                            <img src={asset.svg} alt={asset.label} className="w-4 h-4 object-contain shrink-0" />
                          ) : (
                            <i className={`${asset.icon} text-sm text-text-secondary shrink-0`} />
                          )}
                          <span className="text-xs font-medium text-text-primary">{asset.label}</span>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
            </Card>
          )}

          {/* Check-out info */}
          {visit.checkOutTime && (
            <Card>
              <SectionLabel icon="ri-logout-box-line" title="Check-Out" />
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mt-3">
                <DetailItem label="Checked Out" value={new Date(visit.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                {visit.visitorOutTemperature && <DetailItem label="Exit Temp." value={visit.visitorOutTemperature} />}
                {visit.assetsReturned !== undefined && (
                  <DetailItem label="Assets Returned" value={visit.assetsReturned ? 'Yes' : 'No'} />
                )}
              </div>
            </Card>
          )}

          {/* Customer details */}
          {(visit.businessSegment || visit.priority || visit.model) && (
            <Card>
              <SectionLabel icon="ri-building-2-line" title="Customer Details" />
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mt-3">
                {visit.businessSegment && <DetailItem label="Segment" value={getBusinessSegmentLabel(visit.businessSegment)} />}
                {visit.priority && <DetailItem label="Priority" value={getVisitorPriorityLabel(visit.priority)} />}
                {visit.model && <DetailItem label="Model" value={visit.model} />}
                {visit.businessSegmentRemarks && (
                  <div className="col-span-2">
                    <DetailItem label="Remarks" value={visit.businessSegmentRemarks} />
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Devices & Vehicle — optional fields only, assets moved to check-in section */}
          {(visit.laptopDetails || visit.otherDeviceDetails || visit.hasVehicle !== undefined) && (
            <Card>
              <SectionLabel icon="ri-macbook-line" title="Devices & Vehicle" />
              <div className="mt-3 space-y-3 text-sm">
                {visit.laptopDetails && <DetailItem label="Laptop" value={visit.laptopDetails} />}
                {visit.otherDeviceDetails && <DetailItem label="Other Devices" value={visit.otherDeviceDetails} />}
                {visit.hasVehicle !== undefined && <DetailItem label="Vehicle" value={visit.hasVehicle ? (visit.vehicleRegistration ?? 'Yes') : 'No'} />}
              </div>
            </Card>
          )}

          {/* Notes */}
          {(visit.notes || visit.rejectionReason) && (
            <Card>
              <SectionLabel icon="ri-sticky-note-line" title="Notes" />
              {visit.notes && <p className="mt-2 text-sm text-text-secondary">{visit.notes}</p>}
              {visit.rejectionReason && (
                <p className="mt-2 text-sm text-rejected">{visit.rejectionReason}</p>
              )}
            </Card>
          )}

        </div>
      </div>

      {/* Mobile CTA bar */}
      {(canCheckIn || canCheckOut || canApproveReject || canCancel) && (
        <div className="md:hidden shrink-0 border-t border-border-light bg-white px-4 py-3">
          {canCheckIn && (
            <Button icon="ri-login-box-line" fullWidth onClick={() => openCheckIn(visit.id)}>
              Check In
            </Button>
          )}
          {canCheckOut && (
            <Button variant="danger" icon="ri-logout-box-line" fullWidth onClick={() => openCheckOut(visit.id)}>
              Check Out
            </Button>
          )}
          {canApproveReject && (
            <div className="flex gap-2">
              <Button variant="secondary" fullWidth icon="ri-close-line" onClick={() => setShowRejectModal(true)}>
                Reject
              </Button>
              <Button fullWidth icon="ri-check-line" onClick={handleApprove}>
                Approve
              </Button>
            </div>
          )}
          {canCancel && (
            <Button variant="secondary" icon="ri-close-circle-line" fullWidth onClick={() => setShowCancelModal(true)}>
              Cancel Visit
            </Button>
          )}
        </div>
      )}
    </div>

    {checkInVisitId && (
      isMobile
        ? <CheckInSheet visitId={checkInVisitId} onClose={closeModals} />
        : <CheckInModal visitId={checkInVisitId} onClose={closeModals} />
    )}
    {checkOutVisitId && (
      isMobile
        ? <CheckOutSheet visitId={checkOutVisitId} onClose={closeModals} />
        : <CheckOutModal visitId={checkOutVisitId} onClose={closeModals} />
    )}

    {/* Approve success modal */}
    {approveSuccess && (
      <Modal open onClose={() => setApproveSuccess(false)} size="md">
        <div className="py-4 flex flex-col items-center text-center gap-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-confirmed-surface)' }}>
            <i className="ri-checkbox-circle-fill text-4xl" style={{ color: 'var(--color-confirmed)' }} />
          </div>
          <div>
            <p className="text-base font-semibold text-text-primary">Walk-in Approved</p>
            <p className="text-sm text-text-secondary mt-1">{visitor?.name ?? 'Visitor'} can now proceed to check in at the front desk.</p>
          </div>
          <Button fullWidth onClick={() => setApproveSuccess(false)}>Done</Button>
        </div>
      </Modal>
    )}

    {/* Reject modal */}
    {showRejectModal && (
      <Modal
        open
        title="Reject Visit"
        onClose={() => { setShowRejectModal(false); setRejectReason('') }}
        size="md"
        footer={
          <div className="flex gap-2">
            <Button variant="danger" fullWidth disabled={!rejectReason.trim()} onClick={handleRejectConfirm}>
              Confirm Rejection
            </Button>
            <Button variant="secondary" fullWidth onClick={() => { setShowRejectModal(false); setRejectReason('') }}>
              Cancel
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4 py-2">
          <p className="text-sm text-text-secondary">Provide a reason for rejecting this visit from <span className="font-medium text-text-primary">{visitor?.name ?? 'this visitor'}</span>.</p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection…"
            rows={3}
            autoFocus
            className="w-full text-sm rounded-lg border border-border-light px-3 py-2 text-text-primary placeholder:text-text-tertiary resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 bg-white"
          />
        </div>
      </Modal>
    )}

    {/* Cancel confirmation modal */}
    {showCancelModal && (
      <Modal
        open
        title="Cancel Visit"
        onClose={() => setShowCancelModal(false)}
        size="md"
        footer={
          <div className="flex gap-2">
            <Button variant="danger" fullWidth onClick={handleCancelConfirm}>Cancel Visit</Button>
            <Button variant="secondary" fullWidth onClick={() => setShowCancelModal(false)}>Keep It</Button>
          </div>
        }
      >
        <div className="py-2">
          <p className="text-sm text-text-secondary">
            Are you sure you want to cancel the visit from <span className="font-medium text-text-primary">{visitor?.name ?? 'this visitor'}</span>? This cannot be undone.
          </p>
        </div>
      </Modal>
    )}
    </>
  )
}

function buildDayTimeline(startDate: string, endDate: string) {
  const today = getLocalDateString()
  const days: { date: string; status: 'visited' | 'today' | 'remaining' }[] = []
  const current = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  while (current <= end) {
    const y = current.getFullYear()
    const m = String(current.getMonth() + 1).padStart(2, '0')
    const d = String(current.getDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${d}`
    days.push({
      date: dateStr,
      status: dateStr < today ? 'visited' : dateStr === today ? 'today' : 'remaining',
    })
    current.setDate(current.getDate() + 1)
  }
  return days
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function idProofLabel(type: string): string {
  const map: Record<string, string> = {
    aadhar: 'Aadhar', pan: 'PAN', passport: 'Passport',
    'driving-license': 'Driving Licence', 'voter-id': 'Voter ID', other: 'Other',
  }
  return map[type] ?? type
}
