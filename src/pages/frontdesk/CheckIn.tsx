import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useVisitStore } from '@/store/visitStore'
import { employees } from '@/data/employees'
import { locations } from '@/data/locations'
import Card from '@/components/Card'
import Button from '@/components/Button'
import StatusBadge from '@/components/StatusBadge'
import { formatTime, getVisitTypeLabel, getPurposeLabel, generateBadgeNumber } from '@/utils/helpers'

export default function CheckIn() {
  const { visitId } = useParams<{ visitId: string }>()
  const navigate = useNavigate()
  const visits = useVisitStore((s) => s.visits)
  const storeVisitors = useVisitStore((s) => s.visitors)
  const checkIn = useVisitStore((s) => s.checkIn)

  const visit = visits.find((v) => v.id === visitId)
  const [badgeNumber, setBadgeNumber] = useState(() => generateBadgeNumber())

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

  function handleCheckIn() {
    checkIn(visit!.id, badgeNumber)
    navigate('/front-desk/dashboard')
  }

  return (
    <div className="px-4 md:px-6 py-5 max-w-lg mx-auto space-y-5">
      <div>
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-3">
          <i className="ri-arrow-left-s-line text-lg" />Back
        </button>
        <h2 className="text-lg font-semibold text-text-primary">Check In Visitor</h2>
      </div>

      {/* Visit details */}
      <Card>
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-base font-semibold text-text-primary">{visitor?.name ?? 'Unknown'}</p>
            {visitor?.company && <p className="text-sm text-text-secondary">{visitor.company}</p>}
          </div>
          <StatusBadge status={visit.status} />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <Detail label="Host" value={host?.name ?? 'Unknown'} />
          <Detail label="Time" value={formatTime(visit.scheduledTime)} />
          <Detail label="Purpose" value={getPurposeLabel(visit.purpose)} />
          <Detail label="Type" value={getVisitTypeLabel(visit.visitType)} />
          <Detail label="Location" value={location?.name ?? ''} />
          <Detail label="Mobile" value={visitor?.mobile ?? ''} />
        </div>

        {visit.notes && (
          <div className="mt-3 pt-3 border-t border-border-light">
            <p className="text-xs text-text-tertiary">Notes</p>
            <p className="text-sm text-text-secondary mt-0.5">{visit.notes}</p>
          </div>
        )}
      </Card>

      {/* Badge assignment */}
      <Card>
        <h3 className="text-sm font-semibold text-text-primary mb-3">Assign Badge</h3>
        <label className="block">
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

      {/* Simulated pass preview */}
      <Card className="overflow-hidden !p-0">
        <div className="bg-brand px-5 py-3">
          <p className="text-xs text-white/70 font-medium uppercase tracking-wider">Visitor Pass</p>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-lg font-bold text-text-primary">{visitor?.name}</p>
              {visitor?.company && <p className="text-sm text-text-secondary">{visitor.company}</p>}
            </div>
            {/* Placeholder QR */}
            <div className="w-16 h-16 rounded-lg bg-surface-secondary border border-border flex items-center justify-center shrink-0">
              <i className="ri-qr-code-line text-2xl text-text-tertiary" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-text-tertiary">Badge</p>
              <p className="font-semibold text-text-primary">{badgeNumber}</p>
            </div>
            <div>
              <p className="text-text-tertiary">Host</p>
              <p className="font-semibold text-text-primary">{host?.name}</p>
            </div>
            <div>
              <p className="text-text-tertiary">Date</p>
              <p className="font-semibold text-text-primary">{new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Action */}
      <Button fullWidth icon="ri-login-box-line" onClick={handleCheckIn} disabled={!badgeNumber.trim()}>
        Issue Pass & Check In
      </Button>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-text-tertiary">{label}</p>
      <p className="text-sm text-text-primary font-medium">{value}</p>
    </div>
  )
}
