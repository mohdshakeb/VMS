import { useParams, useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Button from '@/components/Button'
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
        <p className="text-sm text-text-secondary">Business not found.</p>
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

  const COMPLIANCE_LABEL: Record<string, string> = {
    pending: 'Pending', draft: 'Draft', submitted: 'In Progress',
    approved: 'Completed', overdue: 'Overdue',
  }
  const COMPLIANCE_STYLE: Record<string, string> = {
    pending: 'bg-yellow-surface text-yellow-fg', draft: 'bg-surface-secondary text-text-secondary',
    submitted: 'bg-blue-surface text-blue-fg', approved: 'bg-green-surface text-green-fg',
    overdue: 'bg-red-surface text-red-fg',
  }

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
        <div className="mb-4">
          <p className="text-base font-semibold text-text-primary leading-tight">{building.name}</p>
          <p className="text-sm text-text-secondary mt-0.5">{building.location}</p>
        </div>

        <div className="space-y-2.5">
          <div>
            <p className="text-xs text-text-tertiary">State</p>
            <p className="text-sm font-medium text-text-primary">{building.state}</p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary">SBU</p>
            <p className="text-sm font-medium text-text-primary">{building.sbu}</p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary mb-1">Compliance</p>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${COMPLIANCE_STYLE[building.complianceStatus]}`}>
              {COMPLIANCE_LABEL[building.complianceStatus]}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-light">
          <div>
            <p className="text-sm font-medium text-text-primary">{isActive ? 'Active' : 'Inactive'}</p>
            <p className="text-xs text-text-tertiary mt-0.5">{isActive ? 'Business is operational' : 'Business is disabled'}</p>
          </div>
          <button
            onClick={() => toggleBuildingStatus(building.id)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${isActive ? 'bg-green-500' : 'bg-surface-tertiary'}`}
            aria-label="Toggle business status"
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>
    </Card>
  )

  const sectionCards = (
    <>
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
                      {record.checklist.filter(e => e.answer !== undefined).length} / {record.checklist.length} answered
                    </p>
                    <div className="text-xs text-text-tertiary mt-1 space-y-0.5">
                      {record.submittedAt && (
                        <p>Submitted {formatTs(record.submittedAt)}{record.submittedBy ? ` by ${record.submittedBy}` : ''}</p>
                      )}
                      {record.approvedAt && (
                        <p>Approved {formatTs(record.approvedAt)}{record.approvedBy ? ` · ${record.approvedBy}` : ''}</p>
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
        breadcrumb={[{ label: 'Businesses', path: '/facility/buildings' }]}
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
          <span className="text-text-tertiary truncate">Businesses</span>
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
