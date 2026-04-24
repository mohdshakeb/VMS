import { useParams, useNavigate } from 'react-router-dom'
import { useVisitStore } from '@/store/visitStore'
import { useUIStore } from '@/store/uiStore'
import { useIsMobile } from '@/hooks/useIsMobile'
import { employees } from '@/data/employees'
import { locations } from '@/data/locations'
import Card from '@/components/Card'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import Button from '@/components/Button'
import DetailItem from '@/components/common/DetailItem'
import SectionLabel from '@/components/common/SectionLabel'
import CheckInModal from '@/components/CheckInModal'
import CheckOutModal from '@/components/CheckOutModal'
import CheckInSheet from '@/components/Mobile/CheckInSheet'
import CheckOutSheet from '@/components/Mobile/CheckOutSheet'
import {
  formatDate,
  formatTime,
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
  const checkInVisitId = useUIStore((s) => s.checkInVisitId)
  const checkOutVisitId = useUIStore((s) => s.checkOutVisitId)
  const openCheckIn = useUIStore((s) => s.openCheckIn)
  const openCheckOut = useUIStore((s) => s.openCheckOut)
  const closeModals = useUIStore((s) => s.closeModals)

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

  const canCheckIn = ['pending-approval', 'confirmed', 'scheduled'].includes(visit.status)
  const canCheckOut = visit.status === 'checked-in'

  return (
    <>
    <div className="flex flex-col h-full">
      {/* Desktop header */}
      <PageHeader
        title="Visit Details"
        breadcrumb={[{ label: 'Dashboard', path: '/front-desk/dashboard' }]}
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
              {visit.guestWifi && <DetailItem label="Guest WiFi" value="Requested" />}
            </div>
          </Card>

          {/* Check-in info */}
          {visit.checkInTime && (
            <Card>
              <SectionLabel icon="ri-login-box-line" title="Check-In" />
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mt-3">
                <DetailItem label="Badge" value={visit.badgeNumber ?? '—'} />
                <DetailItem label="Checked In" value={new Date(visit.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                {visit.idProofType && (
                  <DetailItem
                    label="ID Proof"
                    value={[idProofLabel(visit.idProofType), visit.idProofNumber].filter(Boolean).join(' · ')}
                  />
                )}
                {visit.visitorInTemperature && <DetailItem label="Entry Temp." value={visit.visitorInTemperature} />}
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

          {/* Other details */}
          {(visit.laptopDetails || visit.otherDeviceDetails || visit.hasVehicle !== undefined || visit.issueAssets !== undefined) && (
            <Card>
              <SectionLabel icon="ri-shield-check-line" title="Other Details" />
              <div className="mt-3 space-y-3 text-sm">
                {visit.laptopDetails && <DetailItem label="Laptop" value={visit.laptopDetails} />}
                {visit.otherDeviceDetails && <DetailItem label="Other Devices" value={visit.otherDeviceDetails} />}
                {visit.hasVehicle !== undefined && <DetailItem label="Vehicle" value={visit.hasVehicle ? (visit.vehicleRegistration ?? 'Yes') : 'No'} />}
                {visit.issueAssets !== undefined && (
                  <div>
                    <p className="text-xs text-text-tertiary mb-2">Assets Issued</p>
                    {!visit.issueAssets ? (
                      <p className="text-sm font-medium text-text-primary">None</p>
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
                )}
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
      {(canCheckIn || canCheckOut) && (
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
    </>
  )
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
