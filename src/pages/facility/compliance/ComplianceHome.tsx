import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import PageHeader from '@/components/PageHeader'
import FacilityStatusBadge from '@/components/facility/FacilityStatusBadge'
import TabPills from '@/components/common/TabPills'

export default function ComplianceHome() {
  const navigate = useNavigate()
  const buildings = useFacilityStore((s) => s.buildings)

  // If only one building, skip directly to upload
  useEffect(() => {
    if (buildings.length === 1) {
      navigate(`/facility/compliance/${buildings[0].id}`, { replace: true })
    }
  }, [buildings, navigate])

  if (buildings.length === 1) return null

  return (
    <div className="flex flex-col h-full bg-surface-secondary">
      <PageHeader title="Compliance" />

      <div className="shrink-0 px-4 pt-3 pb-0 md:px-6">
        <TabPills
          tabs={[
            { label: 'Upload', value: 'upload' },
            { label: 'History', value: 'history' },
          ]}
          activeTab="upload"
          onTabChange={(v) => { if (v === 'history') navigate('/facility/compliance/history') }}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
        <div className="md:hidden mb-4">
          <h2 className="text-base font-semibold text-text-primary">May 2026</h2>
          <p className="text-sm text-text-secondary mt-0.5">Select a building to upload compliance photos.</p>
        </div>

        <div className="space-y-2">
          {buildings.map((building) => (
            <button
              key={building.id}
              onClick={() => navigate(`/facility/compliance/${building.id}`)}
              className="w-full text-left bg-white border border-border-light rounded-xl px-4 py-3.5 hover:border-brand/30 hover:shadow-sm transition-all duration-150 group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-secondary">
                  <i className="ri-building-2-line text-lg text-text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{building.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <FacilityStatusBadge status={building.complianceStatus} />
                    <span className="text-xs text-text-tertiary">{building.complianceProgress} / {building.complianceTotal} uploaded</span>
                  </div>
                </div>
                <i className="ri-arrow-right-s-line text-text-tertiary text-lg group-hover:text-brand transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
