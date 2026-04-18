import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useVisitStore } from '@/store/visitStore'
import { employees } from '@/data/employees'
import { locations } from '@/data/locations'
import Card from '@/components/Card'
import Button from '@/components/Button'
import StatusBadge from '@/components/StatusBadge'
import PageHeader from '@/components/PageHeader'
import DetailItem from '@/components/common/DetailItem'
import SectionLabel from '@/components/common/SectionLabel'
import {
  formatDate,
  formatTime,
  getVisitTypeLabel,
  getPurposeLabel,
  getDepartmentLabel,
  getBusinessSegmentLabel,
  getVisitorPriorityLabel,
  generateBadgeNumber,
} from '@/utils/helpers'

export default function CheckIn() {
  const { visitId } = useParams<{ visitId: string }>()
  const navigate = useNavigate()
  const visits = useVisitStore((s) => s.visits)
  const storeVisitors = useVisitStore((s) => s.visitors)
  const checkIn = useVisitStore((s) => s.checkIn)

  const visit = visits.find((v) => v.id === visitId)
  const [badgeNumber, setBadgeNumber] = useState(() => visit?.badgeId ?? generateBadgeNumber())

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

  const hasDevices = visit.laptopDetails || visit.otherDeviceDetails
  const hasCustomerInfo = visit.businessSegment || visit.priority || visit.model || visit.businessSegmentRemarks
  const hasDelegates = visit.delegates && visit.delegates.length > 0

  function handleCheckIn() {
    checkIn(visit!.id, badgeNumber)
    navigate('/front-desk/dashboard')
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Check In Visitor"
        breadcrumb={[{ label: 'Dashboard', path: '/front-desk/dashboard' }]}
        onBack={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto">
      <div className="px-4 md:px-6 py-5 max-w-lg mx-auto space-y-4">

        {/* Visitor identity */}
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-base font-semibold text-text-primary">{visitor?.name ?? 'Unknown'}</p>
              {visitor?.company && <p className="text-sm text-text-secondary">{visitor.company}</p>}
            </div>
            <StatusBadge status={visit.status} />
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
            <DetailItem label="Pass Type" value={getVisitTypeLabel(visit.visitType)} />
            <DetailItem label="Purpose" value={getPurposeLabel(visit.purpose)} />
            <DetailItem label="Host" value={host?.name ?? '—'} />
            {visit.department && <DetailItem label="Department" value={getDepartmentLabel(visit.department)} />}
            <DetailItem label="Location" value={location?.name ?? '—'} />
            <DetailItem label="Date" value={formatDate(visit.scheduledDate)} />
            <DetailItem label="Time" value={formatTime(visit.scheduledTime)} />
            {visit.duration != null && (
              <DetailItem label="Duration" value={formatDuration(visit.duration)} />
            )}
          </div>
        </Card>

        {/* Delegates */}
        {hasDelegates && (
          <Card>
            <SectionLabel icon="ri-group-line" title={`Group Visit · ${visit.delegates!.length + 1} visitors`} />
            <div className="mt-3 space-y-2">
              {/* Primary visitor */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-primary font-medium">{visitor?.name}</span>
                <span className="text-xs text-text-tertiary">Primary</span>
              </div>
              {/* Delegates */}
              {visit.delegates!.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-text-primary">{d.name}</span>
                  <span className="text-text-secondary text-xs">{d.mobile}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Customer details */}
        {hasCustomerInfo && (
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

        {/* Security & devices */}
        {hasDevices && (
          <Card>
            <SectionLabel icon="ri-shield-check-line" title="Devices Declared" />
            <div className="mt-3 space-y-3 text-sm">
              {visit.laptopDetails && <DetailItem label="Laptop" value={visit.laptopDetails} />}
              {visit.otherDeviceDetails && <DetailItem label="Other Devices" value={visit.otherDeviceDetails} />}
            </div>
          </Card>
        )}

        {/* Notes */}
        {visit.notes && (
          <Card>
            <SectionLabel icon="ri-sticky-note-line" title="Notes" />
            <p className="mt-2 text-sm text-text-secondary">{visit.notes}</p>
          </Card>
        )}

        {/* Badge assignment */}
        <Card>
          <SectionLabel icon="ri-nfc-line" title="Assign Badge" />
          <label className="block mt-3">
            <span className="text-xs text-text-secondary">Badge Number</span>
            <input
              type="text"
              value={badgeNumber}
              onChange={(e) => setBadgeNumber(e.target.value)}
              className="form-input mt-1"
            />
            <p className="text-xs text-text-tertiary mt-1">Auto-generated. Edit if using a different physical badge.</p>
          </label>
        </Card>

        {/* Visitor pass preview */}
        <Card padding="none" className="overflow-hidden">
          <div className="bg-surface-secondary border-b border-border px-5 py-3">
            <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">Visitor Pass Preview</p>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-semibold text-text-primary">{visitor?.name}</p>
                {visitor?.company && <p className="text-sm text-text-secondary">{visitor.company}</p>}
              </div>
              <div className="w-16 h-16 rounded-lg bg-surface-secondary border border-border flex items-center justify-center shrink-0">
                <i className="ri-qr-code-line text-2xl text-text-tertiary" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-text-tertiary">Badge</p>
                <p className="font-medium text-text-primary">{badgeNumber}</p>
              </div>
              <div>
                <p className="text-text-tertiary">Host</p>
                <p className="font-medium text-text-primary">{host?.name}</p>
              </div>
              <div>
                <p className="text-text-tertiary">Date</p>
                <p className="font-semibold text-text-primary">{new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </Card>

        <Button fullWidth icon="ri-login-box-line" onClick={handleCheckIn} disabled={!badgeNumber.trim()}>
          Issue Pass & Check In
        </Button>
      </div>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

