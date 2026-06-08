import { useParams, useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Button from '@/components/Button'
import SectionLabel from '@/components/common/SectionLabel'
import FacilityStatusBadge from '@/components/facility/FacilityStatusBadge'
import FacilityIdentityCard from '@/components/facility/FacilityIdentityCard'
import { PROTOTYPE_NOW } from '@/data/facilityData'

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

function getRecordPath(record: { id: string }) {
  return `/facility/compliance/record/${record.id}`
}

function formatTs(ts?: string) {
  if (!ts) return null
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
}

export default function FacilityDetail() {
  const { facilityId } = useParams<{ facilityId: string }>()
  const navigate = useNavigate()
  const facilities = useFacilityStore((s) => s.facilities)
  const allRecords = useFacilityStore((s) => s.complianceRecords)
  const toggleFacilityStatus = useFacilityStore((s) => s.toggleFacilityStatus)

  const facility = facilities.find((f) => f.id === facilityId)

  if (!facility) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-sm text-text-secondary">Facility not found.</p>
      </div>
    )
  }

  const isComplianceDue = facility.complianceStatus === 'pending' || facility.complianceStatus === 'overdue'
  const isActive = facility.status === 'active'

  const facilityRecords = allRecords
    .filter((r) => r.facilityId === facility.id)
    .sort((a, b) => b.year - a.year || b.month - a.month)

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
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">{isActive ? 'Active' : 'Inactive'}</p>
            <p className="text-xs text-text-tertiary mt-0.5">{isActive ? 'Facility is operational' : 'Facility is disabled'}</p>
          </div>
          <button
            onClick={() => toggleFacilityStatus(facility.id)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${isActive ? 'bg-green-500' : 'bg-surface-tertiary'}`}
            aria-label="Toggle facility status"
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      }
    />
  )

  const sectionCards = (
    <>
      {/* Compliance audit trail */}
      <Card>
        <SectionLabel icon="ri-shield-check-line" title="Compliance" />
        {facilityRecords.length === 0 ? (
          <p className="text-sm text-text-tertiary mt-3">No compliance records yet.</p>
        ) : (
          <div className="mt-3 divide-y divide-border-light">
            {facilityRecords.map((record) => (
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
        title={facility.name}
        breadcrumb={[{ label: 'Facilities', path: '/facility/facilities' }]}
        onBack={() => navigate('/facility/facilities')}
        actions={
          <div className="flex items-center gap-2">
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
          onClick={() => navigate('/facility/facilities')}
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
