import { useParams, useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Button from '@/components/Button'
import DetailItem from '@/components/common/DetailItem'
import SectionLabel from '@/components/common/SectionLabel'
import FacilityStatusBadge from '@/components/facility/FacilityStatusBadge'
import buildingPlaceholder from '@/assets/building.png'

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

function getRecordPath(record: { id: string }) {
  return `/facility/compliance/record/${record.id}`
}

function formatTs(ts?: string) {
  if (!ts) return null
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
}

export default function BuildingDetail() {
  const { buildingId } = useParams<{ buildingId: string }>()
  const navigate = useNavigate()
  const buildings = useFacilityStore((s) => s.buildings)
  const allRecords = useFacilityStore((s) => s.complianceRecords)
  const toggleBuildingStatus = useFacilityStore((s) => s.toggleBuildingStatus)

  const building = buildings.find((b) => b.id === buildingId)

  if (!building) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-sm text-text-secondary">Building not found.</p>
      </div>
    )
  }

  const photoSrc = building.photoUrl ?? buildingPlaceholder
  const isComplianceDue = building.complianceStatus === 'pending' || building.complianceStatus === 'overdue'
  const isActive = building.status === 'active'

  const buildingRecords = allRecords
    .filter((r) => r.buildingId === building.id)
    .sort((a, b) => b.year - a.year || b.month - a.month)

  const now = new Date()
  const currentRecord = allRecords.find(
    (r) => r.buildingId === building.id && r.month === now.getMonth() + 1 && r.year === now.getFullYear()
  )

  const identityCard = (
    <Card padding="none">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-t-xl">
        <img
          src={photoSrc}
          alt={building.name}
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = buildingPlaceholder }}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="mb-3">
          <p className="text-base font-semibold text-text-primary leading-tight">{building.name}</p>
          <p className="text-sm text-text-secondary mt-0.5">{building.type}</p>
        </div>

        <div className="space-y-2">
          <div>
            <p className="text-xs text-text-tertiary">SBU</p>
            <p className="text-sm font-medium text-text-primary">{building.sbu}</p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary">Building ID</p>
            <p className="text-sm font-medium text-text-primary break-all">{building.buildingId}</p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary">Compliance Status</p>
            <div className="mt-1">
              <FacilityStatusBadge status={building.complianceStatus} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-light">
          <div>
            <p className="text-sm font-medium text-text-primary">
              {isActive ? 'Active' : 'Inactive'}
            </p>
            <p className="text-xs text-text-tertiary mt-0.5">
              {isActive ? 'Building is operational' : 'Building is disabled'}
            </p>
          </div>
          <button
            onClick={() => toggleBuildingStatus(building.id)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${
              isActive ? 'bg-green-500' : 'bg-surface-tertiary'
            }`}
            aria-label="Toggle building status"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </Card>
  )

  const sectionCards = (
    <>
      {/* Location & Identification */}
      <Card>
        <SectionLabel icon="ri-map-pin-2-line" title="Location & Identification" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mt-3">
          <DetailItem label="State" value={building.state} />
          <DetailItem label="City" value={building.city} />
          <DetailItem label="Location" value={building.location} />
          {building.storeCode && <DetailItem label="Store Code" value={building.storeCode} />}
          {building.description && (
            <DetailItem label="Description" value={building.description} className="col-span-2" />
          )}
        </div>
      </Card>

      {/* Physical & Infrastructure */}
      <Card>
        <SectionLabel icon="ri-building-4-line" title="Physical & Infrastructure" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mt-3">
          <DetailItem label="Address Line 1" value={building.address1} className="col-span-2" />
          {building.address2 && (
            <DetailItem label="Address Line 2" value={building.address2} className="col-span-2" />
          )}
          <DetailItem label="Pin Code" value={building.pinCode} />
          <DetailItem label="Floors" value={`${building.floors}`} />
          {building.area && (
            <DetailItem label="Total Area" value={`${building.area.toLocaleString()} sq. ft`} />
          )}
          {building.yearOfConstruction && (
            <DetailItem label="Year of Construction" value={`${building.yearOfConstruction}`} />
          )}
          {building.latitude && <DetailItem label="Latitude" value={`${building.latitude}`} />}
          {building.longitude && <DetailItem label="Longitude" value={`${building.longitude}`} />}
        </div>
      </Card>

      {/* Administration */}
      <Card>
        <SectionLabel icon="ri-settings-3-line" title="Administration" />
        <div className="mt-3 space-y-4">

          {/* Remarks / Notes */}
          <div>
            <p className="text-xs text-text-tertiary">Remarks / Notes</p>
            <p className="text-sm text-text-primary mt-0.5">{building.remarks || '—'}</p>
          </div>

          {/* Documents */}
          <div className="grid grid-cols-2 gap-3">
            {/* Floor Plan */}
            <div className="flex items-start justify-between gap-2 rounded-lg border border-border-light px-3 py-2.5">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-medium text-text-primary">Floor Plan</p>
                  {building.layoutPlanName && (
                    <span className="text-xs text-text-tertiary">· 1 file</span>
                  )}
                </div>
                {building.layoutPlanName ? (
                  <p className="text-xs text-text-tertiary truncate mt-0.5" title={building.layoutPlanName}>
                    {building.layoutPlanName}
                  </p>
                ) : (
                  <p className="text-xs text-text-tertiary mt-0.5">Not uploaded</p>
                )}
              </div>
              {building.layoutPlanName && (
                <button className="shrink-0 text-text-tertiary hover:text-text-primary transition-colors mt-0.5">
                  <i className="ri-download-2-line text-base" />
                </button>
              )}
            </div>

            {/* Compliance Doc */}
            <div className="flex items-start justify-between gap-2 rounded-lg border border-border-light px-3 py-2.5">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-medium text-text-primary">Compliance Doc</p>
                  {building.complianceDocName && (
                    <span className="text-xs text-text-tertiary">· 1 file</span>
                  )}
                </div>
                {building.complianceDocName ? (
                  <p className="text-xs text-text-tertiary truncate mt-0.5" title={building.complianceDocName}>
                    {building.complianceDocName}
                  </p>
                ) : (
                  <p className="text-xs text-text-tertiary mt-0.5">Not uploaded</p>
                )}
              </div>
              {building.complianceDocName && (
                <button className="shrink-0 text-text-tertiary hover:text-text-primary transition-colors mt-0.5">
                  <i className="ri-download-2-line text-base" />
                </button>
              )}
            </div>
          </div>

          {/* Remarks */}
          {building.remarks && (
            <div>
              <p className="text-xs text-text-tertiary">Remarks / Notes</p>
              <p className="text-sm text-text-primary mt-0.5">{building.remarks}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Compliance audit trail */}
      <Card>
        <SectionLabel icon="ri-shield-check-line" title="Compliance" />
        {buildingRecords.length === 0 ? (
          <p className="text-sm text-text-tertiary mt-3">No compliance records yet.</p>
        ) : (
          <div className="mt-3 divide-y divide-border-light">
            {buildingRecords.map((record) => (
              <button
                key={record.id}
                onClick={() => navigate(getRecordPath(record))}
                className="w-full text-left py-3 first:pt-0 last:pb-0 hover:opacity-80 transition-opacity group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      {MONTH_NAMES[record.month - 1]} {record.year}
                    </p>
                    <p className="text-xs text-text-tertiary mt-0.5">
                      {record.totalMandatory} mandatory · {record.totalOptional} optional
                    </p>
                    <div className="text-xs text-text-tertiary mt-1 space-y-0.5">
                      {record.submittedAt && (
                        <p>Submitted {formatTs(record.submittedAt)}{record.submittedBy ? ` by ${record.submittedBy}` : ''}</p>
                      )}
                      {record.approvedAt && (
                        <p>Approved {formatTs(record.approvedAt)}{record.approvedBy ? ` · ${record.approvedBy}` : ''}</p>
                      )}
                      {record.rejectionReason && (
                        <p className="text-red-500">Rejected: {record.rejectionReason}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <FacilityStatusBadge status={record.status} />
                    <i className="ri-arrow-right-s-line text-base text-text-tertiary group-hover:text-text-secondary transition-colors" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>
    </>
  )

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={building.name}
        breadcrumb={[{ label: 'My Buildings', path: '/facility/buildings' }]}
        onBack={() => navigate('/facility/buildings')}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" icon="ri-edit-line">
              Edit
            </Button>
            {isComplianceDue && currentRecord && (
              <Button
                size="sm"
                icon="ri-shield-check-line"
                onClick={() => navigate(`/facility/compliance/record/${currentRecord.id}`)}
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
          onClick={() => navigate('/facility/buildings')}
          className="flex items-center justify-center w-9 h-9 rounded-xl text-text-secondary active:bg-surface-secondary transition-colors -ml-1 shrink-0"
        >
          <i className="ri-arrow-left-line text-xl" />
        </button>
        <div className="flex-1 min-w-0 flex items-center gap-1 text-sm">
          <span className="text-text-tertiary truncate">My Buildings</span>
          <span className="text-text-tertiary shrink-0">·</span>
          <span className="font-medium text-text-primary shrink-0">{building.name}</span>
        </div>
        {isComplianceDue && currentRecord && (
          <button
            onClick={() => navigate(`/facility/compliance/record/${currentRecord.id}`)}
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
        <div className="hidden md:flex gap-6 px-6 py-6 max-w-5xl mx-auto items-start">
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
