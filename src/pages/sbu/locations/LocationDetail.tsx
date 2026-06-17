import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import { useAuthStore } from '@/store/authStore'
import PageHeader from '@/components/PageHeader'
import FacilityIdentityCard from '@/components/facility/FacilityIdentityCard'
import FacilityComplianceCard from '@/components/facility/FacilityComplianceCard'
import TabBar from '@/components/common/TabBar'
import { COMPLIANCE_LABEL, COMPLIANCE_STYLE } from '@/utils/facilityHelpers'
import type { FacilityComplianceStatus } from '@/types/facility'

export default function LocationDetail() {
  const { location } = useParams<{ location: string }>()
  const navigate = useNavigate()
  const facilities = useFacilityStore((s) => s.facilities)
  const allRecords = useFacilityStore((s) => s.complianceRecords)
  const { currentSbu } = useAuthStore()

  const locationName = location ? decodeURIComponent(location) : ''
  const locationFacilities = facilities.filter((f) => f.sbu === currentSbu && f.location === locationName)

  const [activeIdx, setActiveIdx] = useState(0)

  if (locationFacilities.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-sm text-text-secondary">Location not found.</p>
      </div>
    )
  }

  const state = locationFacilities[0].state
  const admins = [...new Set(locationFacilities.map((f) => f.locationAdmin).filter((n): n is string => Boolean(n)))]
  const statusCounts = locationFacilities.reduce<Partial<Record<FacilityComplianceStatus, number>>>((acc, f) => {
    acc[f.complianceStatus] = (acc[f.complianceStatus] ?? 0) + 1
    return acc
  }, {})

  const identityCard = (
    <FacilityIdentityCard
      name={locationName}
      fields={[
        { label: 'State', value: state },
        { label: 'SBU', value: currentSbu },
        { label: 'Location Admin', value: admins.length > 0 ? admins.join(', ') : '—' },
        { label: 'Facilities', value: `${locationFacilities.length} facilit${locationFacilities.length !== 1 ? 'ies' : 'y'}` },
      ]}
      footer={
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(statusCounts) as FacilityComplianceStatus[]).map((status) => (
            <span
              key={status}
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${COMPLIANCE_STYLE[status]}`}
            >
              {statusCounts[status]} {COMPLIANCE_LABEL[status]}
            </span>
          ))}
        </div>
      }
    />
  )

  const activeFacility = locationFacilities[Math.min(activeIdx, locationFacilities.length - 1)]

  const sectionCards = (
    <div className="space-y-4">
      <TabBar
        tabs={locationFacilities.map((f) => ({ id: f.id, label: f.name }))}
        active={activeFacility.id}
        onChange={(id) => setActiveIdx(locationFacilities.findIndex((f) => f.id === id))}
      />

      <FacilityComplianceCard
        key={activeFacility.id}
        facility={activeFacility}
        records={allRecords}
        basePath="/sbu"
        onNavigate={navigate}
        hideTitle
      />
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={locationName}
        breadcrumb={[{ label: 'Locations', path: '/sbu/locations' }]}
        onBack={() => navigate('/sbu/locations')}
      />

      {/* Mobile header */}
      <header className="md:hidden shrink-0 flex items-center gap-2 px-3 py-2.5 bg-white border-b border-border">
        <button
          onClick={() => navigate('/sbu/locations')}
          className="flex items-center justify-center w-9 h-9 rounded-xl text-text-secondary active:bg-surface-secondary transition-colors -ml-1 shrink-0"
        >
          <i className="ri-arrow-left-line text-xl" />
        </button>
        <div className="flex-1 min-w-0 flex items-center gap-1 text-sm">
          <span className="text-text-tertiary truncate">Locations</span>
          <span className="text-text-tertiary shrink-0">·</span>
          <span className="font-medium text-text-primary shrink-0 truncate">{locationName}</span>
        </div>
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
    </div>
  )
}
