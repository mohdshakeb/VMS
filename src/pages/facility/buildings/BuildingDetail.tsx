import { useParams, useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import PageHeader from '@/components/PageHeader'
import DetailItem from '@/components/common/DetailItem'
import SectionLabel from '@/components/common/SectionLabel'
import FacilityStatusBadge from '@/components/facility/FacilityStatusBadge'

export default function BuildingDetail() {
  const { buildingId } = useParams<{ buildingId: string }>()
  const navigate = useNavigate()
  const buildings = useFacilityStore((s) => s.buildings)
  const building = buildings.find((b) => b.id === buildingId)

  if (!building) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-sm text-text-secondary">Building not found.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-surface-secondary">
      <PageHeader
        title={building.name}
        breadcrumb={[{ label: 'My Buildings', path: '/facility/buildings' }]}
        onBack={() => navigate('/facility/buildings')}
        actions={<FacilityStatusBadge status={building.status} />}
      />

      <div className="flex-1 overflow-y-auto">
        {/* Mobile header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-light md:hidden">
          <button
            onClick={() => navigate('/facility/buildings')}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-text-secondary hover:bg-surface-secondary transition-colors"
          >
            <i className="ri-arrow-left-line text-lg" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-medium text-text-primary truncate">{building.name}</h2>
          </div>
          <FacilityStatusBadge status={building.status} />
        </div>

        <div className="px-4 py-5 md:px-6 md:py-6 space-y-6 max-w-2xl">
          {/* Building ID banner */}
          <div className="flex items-center gap-3 bg-surface-secondary rounded-xl px-4 py-3">
            <i className="ri-qr-code-line text-xl text-text-secondary" />
            <div>
              <p className="text-xs text-text-tertiary">Building ID</p>
              <p className="text-sm font-mono font-medium text-text-primary">{building.buildingId}</p>
            </div>
          </div>

          {/* Section 1 — Location & Identification */}
          <section>
            <SectionLabel icon="ri-map-pin-2-line" title="Location & Identification" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 mt-3">
              <DetailItem label="Building Name" value={building.name} />
              <DetailItem label="Building Type" value={building.type} />
              <DetailItem label="SBU" value={building.sbu} />
              <DetailItem label="State" value={building.state} />
              <DetailItem label="City" value={building.city} />
              <DetailItem label="Location" value={building.location} />
              {building.storeCode && <DetailItem label="Store Code" value={building.storeCode} />}
              {building.description && <DetailItem label="Description" value={building.description} className="col-span-2" />}
            </div>
          </section>

          {/* Section 2 — Physical & Infrastructure */}
          <section>
            <SectionLabel icon="ri-building-4-line" title="Physical & Infrastructure" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 mt-3">
              <DetailItem label="Address Line 1" value={building.address1} className="col-span-2" />
              {building.address2 && <DetailItem label="Address Line 2" value={building.address2} className="col-span-2" />}
              <DetailItem label="Pin Code" value={building.pinCode} />
              <DetailItem label="Floors" value={`${building.floors}`} />
              {building.area && <DetailItem label="Total Area" value={`${building.area.toLocaleString()} sq. ft`} />}
              {building.yearOfConstruction && <DetailItem label="Year of Construction" value={`${building.yearOfConstruction}`} />}
              {building.latitude && <DetailItem label="Latitude" value={`${building.latitude}`} />}
              {building.longitude && <DetailItem label="Longitude" value={`${building.longitude}`} />}
            </div>
          </section>

          {/* Section 3 — Administration */}
          <section>
            <SectionLabel icon="ri-settings-3-line" title="Administration" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 mt-3">
              <div>
                <p className="text-xs text-text-tertiary">Building Status</p>
                <div className="mt-1">
                  <FacilityStatusBadge status={building.status} />
                </div>
              </div>
              <div>
                <p className="text-xs text-text-tertiary">May 2026 Compliance</p>
                <div className="mt-1">
                  <FacilityStatusBadge status={building.complianceStatus} />
                </div>
              </div>
              {building.remarks && <DetailItem label="Remarks" value={building.remarks} className="col-span-2" />}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
