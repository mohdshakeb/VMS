import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import { useAuthStore } from '@/store/authStore'
import PageHeader from '@/components/PageHeader'
import FacilityStatusBadge from '@/components/facility/FacilityStatusBadge'
import FacilityComplianceCard from '@/components/facility/FacilityComplianceCard'
import Modal from '@/components/Modal'
import StarRating from '@/components/common/StarRating'
import InfoTooltip from '@/components/common/InfoTooltip'
import { CURRENT_COMPLIANCE_PERIOD } from '@/data/facilityData'
import { getLocationAverageRating } from '@/utils/facilityHelpers'
import type { FacilityStatus, FacilityType } from '@/types/facility'
import buildingPlaceholder from '@/assets/building.png'

const PREDEFINED_FACILITY_NAMES = [
  'Branch Office', 'Parts Warehouse', 'CRC', 'MRC', 'Repair Center', 'Executive Office', 'HQ',
]

const KNOWN_TYPES = new Set<string>(PREDEFINED_FACILITY_NAMES)

function nameToType(name: string): FacilityType {
  return KNOWN_TYPES.has(name) ? (name as FacilityType) : 'Branch Office'
}

const SBU_ADMIN_MAP: Record<string, { name: string; email: string }> = {
  South: { name: 'Suresh Nair', email: 'sbuadmin@gmmco.com' },
}

type Props = { backPath: string; backLabel: string; basePath: string }

export default function LocationDetailView({ backPath, backLabel, basePath }: Props) {
  const { location } = useParams<{ location: string }>()
  const navigate = useNavigate()
  const { currentRole } = useAuthStore()
  const facilities = useFacilityStore((s) => s.facilities)
  const allRecords = useFacilityStore((s) => s.complianceRecords)
  const facilityChangeRequests = useFacilityStore((s) => s.facilityChangeRequests)
  const toggleLocationStatus = useFacilityStore((s) => s.toggleLocationStatus)
  const toggleFacilityStatus = useFacilityStore((s) => s.toggleFacilityStatus)
  const requestStatusChange = useFacilityStore((s) => s.requestStatusChange)
  const submitFacilityChangeRequest = useFacilityStore((s) => s.submitFacilityChangeRequest)
  const resolveFacilityChangeRequest = useFacilityStore((s) => s.resolveFacilityChangeRequest)
  const addFacilityToLocation = useFacilityStore((s) => s.addFacilityToLocation)
  const removeFacilityFromLocation = useFacilityStore((s) => s.removeFacilityFromLocation)

  const locationName = location ? decodeURIComponent(location) : ''
  const { month: PERIOD_MONTH, year: PERIOD_YEAR } = CURRENT_COMPLIANCE_PERIOD
  const isLocationAdmin = currentRole === 'location-admin'

  const locationFacilities = facilities.filter((f) => f.location === locationName)
  const currentRecord = allRecords.find(
    (r) => r.locationName === locationName && r.month === PERIOD_MONTH && r.year === PERIOD_YEAR,
  )

  const pendingChangeRequest = facilityChangeRequests.find(
    (r) => r.locationName === locationName && r.status === 'pending',
  )

  // Manage facilities modal
  const [facilityModalOpen, setFacilityModalOpen] = useState(false)
  const [requestDetailsOpen, setRequestDetailsOpen] = useState(false)
  const [stagedRemovals, setStagedRemovals] = useState<Set<string>>(new Set())
  const [pendingNew, setPendingNew] = useState<Array<{ name: string; type: FacilityType }>>([])
  const [selectedName, setSelectedName] = useState<string>(PREDEFINED_FACILITY_NAMES[0])
  const [customName, setCustomName] = useState('')

  // Status change modal (both roles — Location Admin submits request, SBU Admin applies directly)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [statusScope, setStatusScope] = useState<'all' | 'specific'>('all')
  const [facilityTargets, setFacilityTargets] = useState<Record<string, FacilityStatus>>({})

  // Facility changes confirmation modal (SBU Admin only)
  const [facilityConfirmOpen, setFacilityConfirmOpen] = useState(false)

  if (locationFacilities.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-sm text-text-secondary">Location not found.</p>
      </div>
    )
  }

  const firstFacility = locationFacilities[0]
  const admins = [
    ...new Set(locationFacilities.map((f) => f.locationAdmin).filter((n): n is string => Boolean(n))),
  ]
  const locationRating = getLocationAverageRating(allRecords, locationName)
  const isActive = locationFacilities.every((f) => f.status === 'active')
  const hasPendingStatusRequest = locationFacilities.some((f) => f.pendingStatusRequest)
  const sbuAdmin = SBU_ADMIN_MAP[firstFacility.sbu]

  // ── Manage facilities handlers ────────────────────────────────────────────

  const hasChanges = stagedRemovals.size > 0 || pendingNew.length > 0

  const handleAddPending = () => {
    const name = selectedName === 'Other' ? customName.trim() : selectedName
    if (!name) return
    if (pendingNew.some((f) => f.name === name)) return
    setPendingNew((prev) => [...prev, { name, type: nameToType(name) }])
    setCustomName('')
    setSelectedName(PREDEFINED_FACILITY_NAMES[0])
  }

  const handleSubmitRequest = () => {
    const toAdd = pendingNew
    const toRemove = Array.from(stagedRemovals)
    submitFacilityChangeRequest(locationName, toAdd, toRemove, admins[0] ?? 'Location Admin')
    setStagedRemovals(new Set())
    setPendingNew([])
    setCustomName('')
    setSelectedName(PREDEFINED_FACILITY_NAMES[0])
    setFacilityModalOpen(false)
  }

  const handleFacilityCancel = () => {
    setStagedRemovals(new Set())
    setPendingNew([])
    setCustomName('')
    setSelectedName(PREDEFINED_FACILITY_NAMES[0])
    setFacilityModalOpen(false)
  }

  const handleSbuDirectApply = () => {
    stagedRemovals.forEach((id) => removeFacilityFromLocation(id))
    pendingNew.forEach((f) => addFacilityToLocation(locationName, f.type, f.name))
    setStagedRemovals(new Set())
    setPendingNew([])
    setCustomName('')
    setSelectedName(PREDEFINED_FACILITY_NAMES[0])
    setFacilityModalOpen(false)
  }

  // ── Status change request handlers ────────────────────────────────────────

  const openStatusModal = () => {
    const targets: Record<string, FacilityStatus> = {}
    locationFacilities.forEach((f) => { targets[f.id] = f.status })
    setFacilityTargets(targets)
    setStatusScope('all')
    setStatusModalOpen(true)
  }

  const handleStatusSend = () => {
    if (statusScope === 'all') {
      const target = isActive ? 'inactive' : 'active'
      locationFacilities.forEach((f) => requestStatusChange(f.id, target, admins[0] ?? 'Location Admin'))
    } else {
      locationFacilities.forEach((f) =>
        requestStatusChange(f.id, facilityTargets[f.id] ?? f.status, admins[0] ?? 'Location Admin')
      )
    }
    setStatusModalOpen(false)
  }

  const handleSbuStatusApply = () => {
    if (statusScope === 'all') {
      toggleLocationStatus(locationName)
    } else {
      locationFacilities.forEach((f) => {
        const target = facilityTargets[f.id] ?? f.status
        if (target !== f.status) toggleFacilityStatus(f.id)
      })
    }
    setStatusModalOpen(false)
  }

  // ── Location card ─────────────────────────────────────────────────────────

  const locationCard = (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-t-xl">
        <img src={buildingPlaceholder} alt={locationName} className="w-full h-full object-cover" />
      </div>

      <div className="p-4">
        <div className="mb-4">
          <div className="flex items-start justify-between gap-2">
            <p className="text-base font-semibold text-text-primary leading-tight">{locationName}</p>
            {currentRecord
              ? <div className="shrink-0 mt-0.5"><FacilityStatusBadge status={currentRecord.status} /></div>
              : null}
          </div>
          <p className="text-sm text-text-secondary mt-0.5">{firstFacility.state}</p>
        </div>

        <div className="space-y-2.5">
          <div>
            <p className="text-xs text-text-tertiary">SBU</p>
            <p className="text-sm font-medium text-text-primary mt-0.5">{firstFacility.sbu}</p>
          </div>

          <div>
            <div className="flex items-center gap-1">
              <p className="text-xs text-text-tertiary">Avg. Rating</p>
              <InfoTooltip
                align="left"
                content="Average of star ratings across all submitted compliance records for this location, to date. 5★ ≥90%, 4★ 75–89%, 3★ 60–74%, 2★ 40–59%, 1★ <40%."
              />
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <StarRating stars={locationRating.stars} size="sm" />
              {locationRating.stars !== null && (
                <span className="text-xs text-text-tertiary tabular-nums">
                  {locationRating.avgPct}% · {locationRating.count} record{locationRating.count !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Location Admin — shown to SBU Admin */}
          {!isLocationAdmin && (
            <div>
              <p className="text-xs text-text-tertiary">Location Admin</p>
              <p className="text-sm font-medium text-text-primary mt-0.5">
                {admins.length > 0 ? admins.join(', ') : '—'}
              </p>
            </div>
          )}

          {/* SBU Admin — shown to Location Admin */}
          {isLocationAdmin && sbuAdmin && (
            <div>
              <p className="text-xs text-text-tertiary">SBU Admin</p>
              <p className="text-sm font-medium text-text-primary mt-0.5">{sbuAdmin.name}</p>
              <p className="text-xs text-text-tertiary mt-0.5">{sbuAdmin.email}</p>
            </div>
          )}
        </div>

        {/* Facilities section */}
        <div className="mt-4 pt-3 border-t border-border-light">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs text-text-tertiary">Facilities ({locationFacilities.length})</p>
            {isLocationAdmin ? (
              pendingChangeRequest ? (
                <button
                  onClick={() => setRequestDetailsOpen(true)}
                  className="flex items-center gap-1 text-xs font-medium text-yellow-fg hover:underline transition-colors"
                >
                  <i className="ri-time-line text-sm" />
                  Requested
                </button>
              ) : (
                <button
                  onClick={() => setFacilityModalOpen(true)}
                  className="flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-hover transition-colors"
                >
                  <i className="ri-edit-line text-sm" />
                  Edit
                </button>
              )
            ) : (
              <button
                onClick={() => setFacilityModalOpen(true)}
                className="flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-hover transition-colors"
              >
                <i className="ri-edit-line text-sm" />
                Edit
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {locationFacilities.map((facility) => (
              <span
                key={facility.id}
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  facility.status === 'active'
                    ? 'bg-brand-light text-brand'
                    : 'bg-surface-secondary text-text-tertiary opacity-60'
                }`}
              >
                {facility.name}
              </span>
            ))}
          </div>
        </div>

        {/* Pending facility change request — shown to SBU Admin */}
        {!isLocationAdmin && pendingChangeRequest && (
          <div className="mt-4 pt-3 border-t border-border-light">
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3 space-y-3">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 shrink-0 h-5 w-5 rounded-full bg-yellow-surface flex items-center justify-center">
                  <i className="ri-git-pull-request-line text-[11px] text-yellow-fg" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">Facility Change Request</p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {pendingChangeRequest.requestedBy} · {new Date(pendingChangeRequest.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {pendingChangeRequest.toAdd.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-text-secondary mb-1">To add</p>
                  <ul className="space-y-0.5">
                    {pendingChangeRequest.toAdd.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-xs text-text-primary">
                        <i className="ri-add-circle-line text-green-600 text-sm" />
                        {f.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {pendingChangeRequest.toRemove.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-text-secondary mb-1">To remove</p>
                  <ul className="space-y-0.5">
                    {pendingChangeRequest.toRemove.map((id) => {
                      const f = locationFacilities.find((x) => x.id === id)
                      return (
                        <li key={id} className="flex items-center gap-1.5 text-xs text-text-primary">
                          <i className="ri-close-circle-line text-red-fg text-sm" />
                          {f?.name ?? id}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => resolveFacilityChangeRequest(pendingChangeRequest.id, 'rejected', sbuAdmin?.name ?? 'SBU Admin')}
                  className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg text-text-secondary hover:bg-surface-secondary transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => resolveFacilityChangeRequest(pendingChangeRequest.id, 'approved', sbuAdmin?.name ?? 'SBU Admin')}
                  className="px-3 py-1.5 text-xs font-medium bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Location status toggle */}
        <div className="mt-4 pt-3 border-t border-border-light">
          {hasPendingStatusRequest ? (
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 shrink-0 h-5 w-5 rounded-full bg-yellow-surface flex items-center justify-center">
                <i className="ri-time-line text-[11px] text-yellow-fg" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">Request pending</p>
                <p className="text-xs text-text-tertiary mt-0.5">
                  Status change sent to SBU Admin{sbuAdmin ? ` (${sbuAdmin.name})` : ''}. Awaiting approval.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-text-tertiary">Location Status</p>
                <p className="text-sm font-medium text-text-primary mt-0.5">{isActive ? 'Active' : 'Inactive'}</p>
              </div>
              <button
                onClick={openStatusModal}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-brand' : 'bg-surface-tertiary'}`}
                aria-label={isActive ? 'Set location inactive' : 'Set location active'}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // ── Compliance trail ─────────────────────────────────────────────────────

  const complianceTrail = (
    <FacilityComplianceCard
      facility={firstFacility}
      records={allRecords}
      basePath={basePath}
      onNavigate={navigate}
    />
  )

  // ── Status change request modal ───────────────────────────────────────────

  const statusChangeModal = (
    <Modal
      open={statusModalOpen}
      onClose={() => setStatusModalOpen(false)}
      title={
        isLocationAdmin
          ? (isActive ? 'Request to Deactivate' : 'Request to Activate')
          : (isActive ? 'Deactivate Location' : 'Activate Location')
      }
      footer={
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setStatusModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={isLocationAdmin ? handleStatusSend : handleSbuStatusApply}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              !isLocationAdmin && isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-brand hover:bg-brand-hover'
            }`}
          >
            {isLocationAdmin ? 'Send Request' : (isActive ? 'Deactivate' : 'Activate')}
          </button>
        </div>
      }
    >
      <div className="space-y-2 mb-5">
        {(['all', 'specific'] as const).map((scope) => (
          <label
            key={scope}
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
              statusScope === scope ? 'border-brand bg-brand-light' : 'border-border hover:bg-surface-secondary'
            }`}
          >
            <input
              type="radio"
              name="statusScope"
              checked={statusScope === scope}
              onChange={() => setStatusScope(scope)}
              className="mt-0.5 accent-brand shrink-0"
            />
            <div>
              <p className="text-sm font-medium text-text-primary">
                {scope === 'all' ? 'Entire location' : 'Specific facilities'}
              </p>
              <p className="text-xs text-text-tertiary mt-0.5">
                {scope === 'all'
                  ? 'Apply the change to all facilities at this location'
                  : 'Choose the target status for each facility individually'}
              </p>
            </div>
          </label>
        ))}
      </div>

      {statusScope === 'specific' && (
        <div className="border border-border rounded-xl overflow-hidden divide-y divide-border-light">
          {locationFacilities.map((facility) => (
            <div key={facility.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <p className="text-sm font-medium text-text-primary truncate">{facility.name}</p>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-text-tertiary">
                  {(facilityTargets[facility.id] ?? facility.status) === 'active' ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => {
                    const current = facilityTargets[facility.id] ?? facility.status
                    setFacilityTargets((prev) => ({ ...prev, [facility.id]: current === 'active' ? 'inactive' : 'active' }))
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    (facilityTargets[facility.id] ?? facility.status) === 'active' ? 'bg-brand' : 'bg-surface-tertiary'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                    (facilityTargets[facility.id] ?? facility.status) === 'active' ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isLocationAdmin && (
        <p className="text-xs text-text-tertiary mt-4">
          This request will be sent to SBU Admin for approval before taking effect.
        </p>
      )}
    </Modal>
  )

  // ── Manage facilities modal ───────────────────────────────────────────────

  const manageFacilitiesModal = (
    <Modal
      open={facilityModalOpen}
      onClose={handleFacilityCancel}
      title="Manage Facilities"
      footer={
        <div className="flex justify-end gap-2">
          <button onClick={handleFacilityCancel} className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
            Cancel
          </button>
          <button
            onClick={isLocationAdmin ? handleSubmitRequest : () => setFacilityConfirmOpen(true)}
            disabled={!hasChanges}
            className="px-4 py-2 text-sm font-medium bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLocationAdmin ? 'Submit Request' : 'Apply Changes'}
          </button>
        </div>
      }
    >
      {/* Current facilities */}
      <div>
        <p className="text-xs text-text-tertiary mb-2">Current Facilities</p>
        <div className="border border-border rounded-xl overflow-hidden divide-y divide-border-light">
          {locationFacilities.map((facility) => {
            const isStaged = stagedRemovals.has(facility.id)
            return (
              <div
                key={facility.id}
                className={`flex items-center justify-between gap-2 px-3 py-2.5 transition-colors ${isStaged ? 'bg-surface-secondary' : ''}`}
              >
                <p className={`text-sm font-medium truncate ${isStaged ? 'line-through text-text-tertiary' : 'text-text-primary'}`}>
                  {facility.name}
                </p>
                {isStaged ? (
                  <button
                    onClick={() => setStagedRemovals((prev) => { const next = new Set(prev); next.delete(facility.id); return next })}
                    className="text-xs text-brand hover:text-brand-hover shrink-0 transition-colors"
                  >
                    Undo
                  </button>
                ) : (
                  <button
                    onClick={() => setStagedRemovals((prev) => new Set([...prev, facility.id]))}
                    className="flex items-center justify-center w-7 h-7 rounded-lg text-red-fg hover:bg-red-surface transition-colors shrink-0"
                  >
                    <i className="ri-close-line text-base" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Staged additions */}
      {pendingNew.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-text-tertiary mb-2">To be added</p>
          <div className="border border-border rounded-xl overflow-hidden divide-y divide-border-light">
            {pendingNew.map((f, i) => (
              <div key={`pending-${i}`} className="flex items-center justify-between gap-2 px-3 py-2.5 bg-brand-light">
                <p className="text-sm font-medium text-text-primary truncate">{f.name}</p>
                <button
                  onClick={() => setPendingNew((prev) => prev.filter((_, idx) => idx !== i))}
                  className="flex items-center justify-center w-7 h-7 rounded-lg text-red-fg hover:bg-red-surface transition-colors shrink-0"
                >
                  <i className="ri-close-line text-base" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add facility */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-text-tertiary mb-2">Add Facility</p>
        <div className="space-y-2">
          <select
            value={selectedName}
            onChange={(e) => { setSelectedName(e.target.value); setCustomName('') }}
            className="w-full text-sm border border-border rounded-lg px-3 py-2 text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
          >
            {PREDEFINED_FACILITY_NAMES.map((n) => {
              const alreadyExists = locationFacilities.some((f) => f.name === n) || pendingNew.some((f) => f.name === n)
              return <option key={n} value={n} disabled={alreadyExists}>{n}{alreadyExists ? ' (already added)' : ''}</option>
            })}
            <option value="Other">Other</option>
          </select>

          {selectedName === 'Other' && (
            <input
              type="text"
              placeholder="Enter facility name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPending()}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
          )}

          <button
            onClick={handleAddPending}
            disabled={selectedName === 'Other' ? !customName.trim() : false}
            className="w-full py-2 text-sm font-medium border border-brand text-brand rounded-lg hover:bg-brand-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLocationAdmin ? '+ Add to request' : '+ Add'}
          </button>
        </div>
      </div>

      {isLocationAdmin && (
        <p className="text-xs text-text-tertiary mt-4">
          Changes will be submitted as a request to SBU Admin for approval before taking effect.
        </p>
      )}
    </Modal>
  )

  // ── Page shell ────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={locationName}
        breadcrumb={[{ label: backLabel, path: backPath }]}
        onBack={() => navigate(backPath)}
      />

      <header className="md:hidden shrink-0 flex items-center gap-2 px-3 py-2.5 bg-white border-b border-border">
        <button
          onClick={() => navigate(backPath)}
          className="flex items-center justify-center w-9 h-9 rounded-xl text-text-secondary active:bg-surface-secondary transition-colors -ml-1 shrink-0"
        >
          <i className="ri-arrow-left-line text-xl" />
        </button>
        <div className="flex-1 min-w-0 flex items-center gap-1 text-sm">
          <span className="text-text-tertiary truncate">{backLabel}</span>
          <span className="text-text-tertiary shrink-0">·</span>
          <span className="font-medium text-text-primary shrink-0 truncate">{locationName}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-surface-secondary">
        <div className="md:hidden px-4 py-5 space-y-4">
          {locationCard}
          {complianceTrail}
        </div>
        <div className="hidden md:flex gap-6 px-6 py-6 items-start">
          <div className="w-80 shrink-0 sticky top-6 self-start">{locationCard}</div>
          <div className="flex-1 min-w-0">{complianceTrail}</div>
        </div>
      </div>

      {statusChangeModal}
      {manageFacilitiesModal}

      {/* SBU Admin — facility changes confirmation */}
      <Modal
        open={facilityConfirmOpen}
        onClose={() => setFacilityConfirmOpen(false)}
        title="Confirm Changes"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setFacilityConfirmOpen(false)}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { setFacilityConfirmOpen(false); handleSbuDirectApply() }}
              className="px-4 py-2 text-sm font-medium bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors"
            >
              Confirm
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          {stagedRemovals.size > 0 && (
            <div>
              <p className="text-xs font-medium text-text-secondary mb-1.5">Removing</p>
              <div className="border border-border rounded-xl overflow-hidden divide-y divide-border-light">
                {Array.from(stagedRemovals).map((id) => {
                  const f = locationFacilities.find((x) => x.id === id)
                  return (
                    <div key={id} className="flex items-center gap-2 px-3 py-2.5 bg-surface-secondary">
                      <i className="ri-close-circle-line text-red-fg text-sm shrink-0" />
                      <p className="text-sm font-medium line-through text-text-tertiary">{f?.name ?? id}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {pendingNew.length > 0 && (
            <div>
              <p className="text-xs font-medium text-text-secondary mb-1.5">Adding</p>
              <div className="border border-border rounded-xl overflow-hidden divide-y divide-border-light">
                {pendingNew.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2.5 bg-brand-light">
                    <i className="ri-add-circle-line text-brand text-sm shrink-0" />
                    <p className="text-sm font-medium text-text-primary">{f.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="text-xs text-text-tertiary pt-1">These changes will take effect immediately.</p>
        </div>
      </Modal>

      {/* Request details modal (Location Admin — view pending request) */}
      {pendingChangeRequest && (
        <Modal
          open={requestDetailsOpen}
          onClose={() => setRequestDetailsOpen(false)}
          title="Facility Change Request"
          footer={
            <div className="flex justify-end">
              <button
                onClick={() => setRequestDetailsOpen(false)}
                className="px-4 py-2 text-sm font-medium bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-text-tertiary">
              <i className="ri-user-line" />
              <span>Submitted to <span className="font-medium text-text-primary">{sbuAdmin?.name ?? 'SBU Admin'}</span></span>
              <span>·</span>
              <span>{new Date(pendingChangeRequest.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-surface text-yellow-fg">Awaiting SBU approval</span>
            </div>

            {pendingChangeRequest.toAdd.length > 0 && (
              <div>
                <p className="text-xs font-medium text-text-secondary mb-2">To be added</p>
                <div className="border border-border rounded-xl overflow-hidden divide-y divide-border-light">
                  {pendingChangeRequest.toAdd.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2.5 bg-brand-light">
                      <i className="ri-add-circle-line text-brand text-sm shrink-0" />
                      <p className="text-sm font-medium text-text-primary">{f.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingChangeRequest.toRemove.length > 0 && (
              <div>
                <p className="text-xs font-medium text-text-secondary mb-2">To be removed</p>
                <div className="border border-border rounded-xl overflow-hidden divide-y divide-border-light">
                  {pendingChangeRequest.toRemove.map((id) => {
                    const f = locationFacilities.find((x) => x.id === id)
                    return (
                      <div key={id} className="flex items-center gap-2 px-3 py-2.5 bg-surface-secondary">
                        <i className="ri-close-circle-line text-text-tertiary text-sm shrink-0" />
                        <p className="text-sm font-medium line-through text-text-tertiary">{f?.name ?? id}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
