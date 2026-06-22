import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import { useAuthStore } from '@/store/authStore'
import PageHeader from '@/components/PageHeader'
import FacilityStatusBadge from '@/components/facility/FacilityStatusBadge'
import FacilityComplianceCard from '@/components/facility/FacilityComplianceCard'
import Modal from '@/components/Modal'
import { CURRENT_COMPLIANCE_PERIOD } from '@/data/facilityData'
import type { FacilityStatus, FacilityType } from '@/types/facility'
import buildingPlaceholder from '@/assets/building.png'

const FACILITY_TYPES: FacilityType[] = [
  'Branch Office', 'Parts Warehouse', 'CRC', 'MRC', 'Repair Center', 'Executive Office', 'HQ',
]

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
  const toggleLocationStatus = useFacilityStore((s) => s.toggleLocationStatus)
  const requestStatusChange = useFacilityStore((s) => s.requestStatusChange)
  const addFacilityToLocation = useFacilityStore((s) => s.addFacilityToLocation)
  const removeFacilityFromLocation = useFacilityStore((s) => s.removeFacilityFromLocation)

  const locationName = location ? decodeURIComponent(location) : ''
  const { month: PERIOD_MONTH, year: PERIOD_YEAR } = CURRENT_COMPLIANCE_PERIOD
  const isLocationAdmin = currentRole === 'location-admin'

  const locationFacilities = facilities.filter((f) => f.location === locationName)
  const currentRecord = allRecords.find(
    (r) => r.locationName === locationName && r.month === PERIOD_MONTH && r.year === PERIOD_YEAR,
  )

  // Manage facilities modal
  const [facilityModalOpen, setFacilityModalOpen] = useState(false)
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set())
  const [pendingNew, setPendingNew] = useState<Array<{ type: FacilityType; name: string }>>([])
  const [newType, setNewType] = useState<FacilityType>('Branch Office')
  const [newName, setNewName] = useState('')

  // Status change request modal (Location Admin only)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [statusScope, setStatusScope] = useState<'all' | 'specific'>('all')
  const [facilityTargets, setFacilityTargets] = useState<Record<string, FacilityStatus>>({})

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
  const isActive = locationFacilities.every((f) => f.status === 'active')
  const hasPendingRequest = locationFacilities.some((f) => f.pendingStatusRequest)
  const sbuAdmin = SBU_ADMIN_MAP[firstFacility.sbu]

  // ── Manage facilities handlers ────────────────────────────────────────────

  const visibleFacilities = locationFacilities.filter((f) => !removedIds.has(f.id))

  const handleAddPending = () => {
    if (!newName.trim()) return
    setPendingNew((prev) => [...prev, { type: newType, name: newName.trim() }])
    setNewName('')
  }

  const handleFacilitySave = () => {
    removedIds.forEach((id) => removeFacilityFromLocation(id))
    pendingNew.forEach((f) => addFacilityToLocation(locationName, f.type, f.name))
    setRemovedIds(new Set())
    setPendingNew([])
    setNewName('')
    setFacilityModalOpen(false)
  }

  const handleFacilityCancel = () => {
    setRemovedIds(new Set())
    setPendingNew([])
    setNewName('')
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

        {/* Facilities pills */}
        <div className="mt-4 pt-3 border-t border-border-light">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs text-text-tertiary">Facilities ({locationFacilities.length})</p>
            <button
              onClick={() => setFacilityModalOpen(true)}
              className="flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-hover transition-colors"
            >
              <i className="ri-edit-line text-sm" />
              Edit
            </button>
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

        {/* Location status toggle */}
        <div className="mt-4 pt-3 border-t border-border-light">
          {hasPendingRequest ? (
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
                onClick={isLocationAdmin ? openStatusModal : () => toggleLocationStatus(locationName)}
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
      title={isActive ? 'Request to Deactivate' : 'Request to Activate'}
      footer={
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setStatusModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStatusSend}
            className="px-4 py-2 text-sm font-medium bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors"
          >
            Send Request
          </button>
        </div>
      }
    >
      {/* Scope options */}
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

      {/* Per-facility dropdowns (specific mode only) */}
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

      <p className="text-xs text-text-tertiary mt-4">
        This request will be sent to SBU Admin for approval before taking effect.
      </p>
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
          <button onClick={handleFacilitySave} className="px-4 py-2 text-sm font-medium bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors">
            Save
          </button>
        </div>
      }
    >
      <div className="divide-y divide-border-light">
        {visibleFacilities.map((facility) => (
          <div key={facility.id} className="py-3 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{facility.name}</p>
              <p className="text-xs text-text-tertiary mt-0.5">{facility.type}</p>
            </div>
            <button
              onClick={() => setRemovedIds((prev) => new Set([...prev, facility.id]))}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-red-fg hover:bg-red-surface transition-colors shrink-0"
            >
              <i className="ri-close-line text-base" />
            </button>
          </div>
        ))}
        {pendingNew.map((f, i) => (
          <div key={`pending-${i}`} className="py-3 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{f.name}</p>
              <p className="text-xs text-text-tertiary mt-0.5">{f.type}</p>
            </div>
            <button
              onClick={() => setPendingNew((prev) => prev.filter((_, idx) => idx !== i))}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-red-fg hover:bg-red-surface transition-colors shrink-0"
            >
              <i className="ri-close-line text-base" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-2 pt-4 border-t border-border">
        <p className="text-xs text-text-tertiary mb-2">Add Facility</p>
        <div className="space-y-2">
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as FacilityType)}
            className="w-full text-sm border border-border rounded-lg px-3 py-2 text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
          >
            {FACILITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Facility name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPending()}
              className="flex-1 text-sm border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
            <button
              onClick={handleAddPending}
              disabled={!newName.trim()}
              className="px-3 py-2 text-sm font-medium bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>
      </div>
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
    </div>
  )
}
