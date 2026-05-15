import { useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import PageHeader from '@/components/PageHeader'
import Button from '@/components/Button'
import FacilityStatusBadge from '@/components/facility/FacilityStatusBadge'

export default function MyBuildings() {
  const navigate = useNavigate()
  const buildings = useFacilityStore((s) => s.buildings)

  return (
    <div className="flex flex-col h-full bg-surface-secondary">
      <PageHeader
        title="My Buildings"
        actions={
          <Button size="md" icon="ri-add-large-fill" onClick={() => navigate('/facility/onboarding/new')}>
            New Building
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
        {/* Mobile header */}
        <div className="flex items-center justify-between mb-4 md:hidden">
          <h2 className="text-base font-semibold text-text-primary">My Buildings</h2>
          <Button size="md" icon="ri-add-large-fill" onClick={() => navigate('/facility/onboarding/new')}>
            New Building
          </Button>
        </div>

        <div className="space-y-3">
          {buildings.map((building) => (
            <button
              key={building.id}
              onClick={() => navigate(`/facility/buildings/${building.id}`)}
              className="w-full text-left bg-white border border-border-light rounded-xl px-4 py-4 hover:border-brand/30 hover:shadow-sm transition-all duration-150 group"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-secondary">
                  <i className="ri-building-2-line text-lg text-text-secondary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary">{building.name}</p>
                      <p className="text-xs text-text-tertiary mt-0.5 font-mono">{building.buildingId}</p>
                    </div>
                    <FacilityStatusBadge status={building.status} />
                  </div>

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-xs text-text-tertiary bg-surface-secondary px-2 py-0.5 rounded-full">{building.type}</span>
                    <span className="text-xs text-text-tertiary">{building.sbu} · {building.state} · {building.city}</span>
                  </div>

                  <div className="flex items-center justify-between mt-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-text-tertiary">May 2026:</span>
                      <FacilityStatusBadge status={building.complianceStatus} />
                    </div>
                    <i className="ri-arrow-right-s-line text-text-tertiary text-lg group-hover:text-brand transition-colors" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
