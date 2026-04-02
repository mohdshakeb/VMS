import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useVisitStore } from '@/store/visitStore'
import { locations } from '@/data/locations'
import Card from '@/components/Card'
import Button from '@/components/Button'
import StatusBadge from '@/components/StatusBadge'
import { formatTime, getVisitTypeLabel, getPurposeLabel } from '@/utils/helpers'

export default function ApproveWalkIn() {
  const { visitId } = useParams<{ visitId: string }>()
  const navigate = useNavigate()
  const visits = useVisitStore((s) => s.visits)
  const storeVisitors = useVisitStore((s) => s.visitors)
  const { approveWalkIn, rejectWalkIn } = useVisitStore()

  const visit = visits.find((v) => v.id === visitId)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  if (!visit) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-sm text-text-secondary">Visit not found</p>
      </div>
    )
  }

  const visitor = storeVisitors.find((v) => v.id === visit.visitorId)
  const location = locations.find((l) => l.id === visit.locationId)

  function handleApprove() {
    approveWalkIn(visit!.id)
    navigate('/employee/visits')
  }

  function handleReject() {
    if (!rejectReason.trim()) return
    rejectWalkIn(visit!.id, rejectReason.trim())
    navigate('/employee/visits')
  }

  const isTerminal = visit.status === 'rejected' || visit.status === 'confirmed' || visit.status === 'checked-in'

  return (
    <div className="px-4 md:px-6 py-5 max-w-lg mx-auto space-y-5">
      <div>
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-3">
          <i className="ri-arrow-left-s-line text-lg" />Back
        </button>
        <h2 className="text-lg font-semibold text-text-primary">Walk-in Approval</h2>
        <p className="text-sm text-text-secondary mt-0.5">A visitor is at the front desk asking for you</p>
      </div>

      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-base font-semibold text-text-primary">{visitor?.name ?? 'Unknown'}</p>
            {visitor?.company && <p className="text-sm text-text-secondary">{visitor.company}</p>}
          </div>
          <StatusBadge status={visit.status} />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <Detail label="Mobile" value={visitor?.mobile ?? ''} />
          <Detail label="Time" value={formatTime(visit.scheduledTime)} />
          <Detail label="Purpose" value={getPurposeLabel(visit.purpose)} />
          <Detail label="Type" value={getVisitTypeLabel(visit.visitType)} />
          <Detail label="Location" value={location?.name ?? ''} />
          <Detail label="Created by" value="Front Desk" />
        </div>

        {visit.notes && (
          <div className="mt-3 pt-3 border-t border-border-light">
            <p className="text-xs text-text-tertiary">Notes</p>
            <p className="text-sm text-text-secondary mt-0.5">{visit.notes}</p>
          </div>
        )}
      </Card>

      {/* Actions */}
      {!isTerminal && !showRejectForm && (
        <div className="flex gap-3">
          <Button fullWidth icon="ri-check-line" onClick={handleApprove}>
            Approve
          </Button>
          <Button fullWidth variant="danger" icon="ri-close-line" onClick={() => setShowRejectForm(true)}>
            Reject
          </Button>
        </div>
      )}

      {/* Reject form */}
      {showRejectForm && (
        <Card>
          <h3 className="text-sm font-semibold text-text-primary mb-2">Rejection Reason</h3>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Why are you rejecting this visit?"
            rows={3}
            className="form-input resize-none mb-3"
            autoFocus
          />
          <div className="flex gap-2">
            <Button variant="danger" onClick={handleReject} disabled={!rejectReason.trim()}>
              Confirm Rejection
            </Button>
            <Button variant="ghost" onClick={() => { setShowRejectForm(false); setRejectReason('') }}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {isTerminal && (
        <div className="text-center py-4">
          <p className="text-sm text-text-secondary">
            This visit has already been {visit.status === 'rejected' ? 'rejected' : 'processed'}.
          </p>
        </div>
      )}
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
