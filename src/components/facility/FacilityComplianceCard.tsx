import type { Facility, ComplianceRecord } from '@/types/facility'
import Card from '@/components/Card'
import SectionLabel from '@/components/common/SectionLabel'
import FacilityStatusBadge from '@/components/facility/FacilityStatusBadge'
import { MONTH_NAMES } from '@/utils/facilityHelpers'

function getRecordPath(base: string, record: { id: string }) {
  return `${base}/compliance/record/${record.id}`
}

function formatTs(ts?: string) {
  if (!ts) return null
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
}

type Props = {
  facility: Facility
  records: ComplianceRecord[]
  basePath: string
  onNavigate: (path: string) => void
  onTitleClick?: () => void
  hideTitle?: boolean
}

export default function FacilityComplianceCard({ facility, records, basePath, onNavigate, onTitleClick, hideTitle }: Props) {
  const facilityRecords = records
    .filter((r) => r.facilityId === facility.id)
    .sort((a, b) => b.year - a.year || b.month - a.month)

  return (
    <Card>
      {!hideTitle && (onTitleClick ? (
        <button type="button" onClick={onTitleClick} className="hover:opacity-75 transition-opacity">
          <SectionLabel icon="ri-building-2-line" title={facility.name} />
        </button>
      ) : (
        <SectionLabel icon="ri-shield-check-line" title="Compliance" />
      ))}
      {facilityRecords.length === 0 ? (
        <p className="text-sm text-text-tertiary mt-3">No compliance records yet.</p>
      ) : (
        <div className="mt-3 divide-y divide-border-light">
          {facilityRecords.map((record) => (
            <button
              key={record.id}
              onClick={() => onNavigate(getRecordPath(basePath, record))}
              className="w-full text-left py-3 first:pt-0 last:pb-0 hover:opacity-80 transition-opacity group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary">
                    {MONTH_NAMES[record.month - 1]} {record.year}
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {record.checklist.filter((e) => e.answer !== undefined).length} / {record.checklist.length} answered
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
  )
}
