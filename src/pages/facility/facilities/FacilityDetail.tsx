import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import { useAuthStore } from '@/store/authStore'
import { employees } from '@/data/employees'
import PageHeader from '@/components/PageHeader'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import FacilityIdentityCard from '@/components/facility/FacilityIdentityCard'
import FacilityComplianceCard from '@/components/facility/FacilityComplianceCard'
import { PROTOTYPE_NOW } from '@/data/facilityData'

export default function FacilityDetail() {
  const { facilityId } = useParams<{ facilityId: string }>()
  const navigate = useNavigate()
  const facilities = useFacilityStore((s) => s.facilities)
  const allRecords = useFacilityStore((s) => s.complianceRecords)
  const toggleFacilityStatus = useFacilityStore((s) => s.toggleFacilityStatus)
  const requestStatusChange = useFacilityStore((s) => s.requestStatusChange)
  const resolveStatusChange = useFacilityStore((s) => s.resolveStatusChange)
  const { currentRole, currentEmployeeId } = useAuthStore()

  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestReason, setRequestReason] = useState('')

  const facility = facilities.find((f) => f.id === facilityId)

  if (!facility) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-sm text-text-secondary">Facility not found.</p>
      </div>
    )
  }

  const isSbuAdmin = currentRole === 'sbu-admin'
  const basePath = isSbuAdmin ? '/sbu' : '/facility'
  const currentEmployee = employees.find((e) => e.id === currentEmployeeId)
  const pendingRequest = facility.pendingStatusRequest

  const handleToggleClick = () => {
    if (isSbuAdmin) {
      toggleFacilityStatus(facility.id)
    } else {
      setRequestReason('')
      setShowRequestModal(true)
    }
  }

  const handleConfirmRequest = () => {
    requestStatusChange(
      facility.id,
      facility.status === 'active' ? 'inactive' : 'active',
      currentEmployee?.name ?? 'Location Admin',
      requestReason.trim() || undefined,
    )
    setShowRequestModal(false)
  }

  const isComplianceDue = facility.complianceStatus === 'pending' || facility.complianceStatus === 'overdue'
  const isActive = facility.status === 'active'

  const currentRecord = allRecords.find(
    (r) => r.facilityId === facility.id && r.month === PROTOTYPE_NOW.getMonth() + 1 && r.year === PROTOTYPE_NOW.getFullYear()
  )

  const COMPLIANCE_LABEL: Record<string, string> = {
    pending: 'Pending', draft: 'Draft', submitted: 'Submitted', updated: 'Updated',
    overdue: 'Overdue',
  }
  const COMPLIANCE_STYLE: Record<string, string> = {
    pending: 'bg-yellow-surface text-yellow-fg', draft: 'bg-surface-secondary text-text-secondary',
    submitted: 'bg-blue-surface text-blue-fg', updated: 'bg-purple-surface text-purple-fg',
    overdue: 'bg-red-surface text-red-fg',
  }

  const address = [facility.address1, facility.address2].filter(Boolean).join(', ') + ', ' + facility.city + ' – ' + facility.pinCode

  const identityCard = (
    <FacilityIdentityCard
      photoUrl={facility.photoUrl}
      name={facility.name}
      location={facility.location}
      fields={[
        { label: 'State', value: facility.state },
        { label: 'SBU', value: facility.sbu },
        { label: 'Address', value: address },
        {
          label: 'Compliance',
          value: (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${COMPLIANCE_STYLE[facility.complianceStatus]}`}>
              {COMPLIANCE_LABEL[facility.complianceStatus]}
            </span>
          ),
        },
      ]}
      footer={
        <div className="space-y-3">
          {pendingRequest && (
            <div className="rounded-lg bg-yellow-surface border border-yellow-fg/30 px-3 py-2.5">
              <p className="text-xs font-medium text-yellow-fg">
                {pendingRequest.requestedBy} requested to mark this facility {pendingRequest.requestedStatus === 'active' ? 'Active' : 'Inactive'}
              </p>
              {pendingRequest.reason && (
                <p className="text-xs text-text-secondary mt-1">&ldquo;{pendingRequest.reason}&rdquo;</p>
              )}
              <p className="text-[11px] text-text-tertiary mt-1">
                {new Date(pendingRequest.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              {isSbuAdmin ? (
                <div className="flex gap-2 mt-2.5">
                  <Button size="sm" variant="secondary" fullWidth onClick={() => resolveStatusChange(facility.id, 'rejected')}>Reject</Button>
                  <Button size="sm" fullWidth onClick={() => resolveStatusChange(facility.id, 'approved')}>Approve</Button>
                </div>
              ) : (
                <p className="text-[11px] text-text-tertiary mt-1.5 flex items-center gap-1">
                  <i className="ri-time-line" /> Awaiting SBU approval
                </p>
              )}
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">{isActive ? 'Active' : 'Inactive'}</p>
              <p className="text-xs text-text-tertiary mt-0.5">{isActive ? 'Facility is operational' : 'Facility is disabled'}</p>
            </div>
            {!pendingRequest && (
              <button
                onClick={handleToggleClick}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${isActive ? 'bg-green-500' : 'bg-surface-tertiary'}`}
                aria-label="Toggle facility status"
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            )}
          </div>
        </div>
      }
    />
  )

  const sectionCards = (
    <FacilityComplianceCard
      facility={facility}
      records={allRecords}
      basePath={basePath}
      onNavigate={navigate}
    />
  )

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={facility.name}
        breadcrumb={[{ label: 'Facilities', path: `${basePath}/facilities` }]}
        onBack={() => navigate(`${basePath}/facilities`)}
        actions={
          <div className="flex items-center gap-2">
            {isComplianceDue && currentRecord && (
              <Button
                size="sm"
                icon="ri-shield-check-line"
                onClick={() => navigate(`${basePath}/compliance/record/${currentRecord.id}`)}
              >
                Start Compliance
              </Button>
            )}
          </div>
        }
      />

      {/* Mobile header */}
      <header className="md:hidden shrink-0 flex items-center gap-2 px-3 py-2.5 bg-white border-b border-border">
        <button
          onClick={() => navigate(`${basePath}/facilities`)}
          className="flex items-center justify-center w-9 h-9 rounded-xl text-text-secondary active:bg-surface-secondary transition-colors -ml-1 shrink-0"
        >
          <i className="ri-arrow-left-line text-xl" />
        </button>
        <div className="flex-1 min-w-0 flex items-center gap-1 text-sm">
          <span className="text-text-tertiary truncate">Facilities</span>
          <span className="text-text-tertiary shrink-0">·</span>
          <span className="font-medium text-text-primary shrink-0">{facility.name}</span>
        </div>
        {isComplianceDue && currentRecord && (
          <button
            onClick={() => navigate(`${basePath}/compliance/record/${currentRecord.id}`)}
            className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl text-brand-red-500 active:bg-surface-secondary transition-colors"
          >
            <i className="ri-shield-check-line text-lg" />
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Mobile: single column */}
        <div className="md:hidden px-4 py-5 space-y-4 max-w-lg mx-auto">
          {identityCard}
          {sectionCards}
        </div>

        {/* Desktop: two columns */}
        <div className="hidden md:flex gap-6 px-6 py-6 items-start">
          <div className="w-80 shrink-0 sticky top-6 self-start">
            {identityCard}
          </div>
          <div className="flex-1 min-w-0 space-y-4">
            {sectionCards}
          </div>
        </div>
      </div>

      {/* Request status change — Location Admin only */}
      <Modal
        open={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="Request Status Change"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setShowRequestModal(false)}>Cancel</Button>
            <Button fullWidth onClick={handleConfirmRequest}>Send Request</Button>
          </div>
        }
      >
        <p className="text-sm text-text-secondary mb-3">
          Request to mark this facility as <strong>{isActive ? 'Inactive' : 'Active'}</strong>. The SBU Admin will need to approve this change before it takes effect.
        </p>
        <textarea
          value={requestReason}
          onChange={(e) => setRequestReason(e.target.value)}
          placeholder="Reason (optional)…"
          rows={3}
          className="w-full text-sm px-3 py-2 rounded-xl border border-border bg-surface-secondary/30 focus:outline-none focus:ring-2 focus:ring-border resize-none"
        />
      </Modal>
    </div>
  )
}
