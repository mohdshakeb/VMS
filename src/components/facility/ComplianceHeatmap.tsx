import { Fragment, useMemo } from 'react'
import type { ComplianceRecord, Facility } from '@/types/facility'
import { CURRENT_COMPLIANCE_PERIOD } from '@/data/facilityData'
import { groupFacilitiesByLocation, scoreChecklist, MONTH_SHORT } from '@/utils/facilityHelpers'

interface Props {
  facilities: Facility[]
  complianceRecords: ComplianceRecord[]
}

// Returns periods oldest-first (Jun 2025 at index 0, current month at index 11)
function getPast12Periods(current: { month: number; year: number }) {
  const periods: { month: number; year: number }[] = []
  let { month, year } = current
  for (let i = 0; i < 12; i++) {
    periods.push({ month, year })
    if (month === 1) { month = 12; year -= 1 } else { month -= 1 }
  }
  return periods.reverse()
}

function cellStyle(record: ComplianceRecord | undefined, pct: number | undefined): string {
  if (!record || record.status === 'pending' || record.status === 'draft') {
    return 'bg-gray-100'
  }
  if (record.status === 'missed') return 'bg-red-200'
  if (record.status === 'overdue') return 'bg-red-surface border border-red-border'
  if (pct === undefined) return 'bg-gray-100'
  if (pct >= 75) return 'bg-green-surface border border-green-border'
  if (pct >= 60) return 'bg-yellow-surface border border-yellow-border'
  return 'bg-red-surface border border-red-border'
}

function cellTooltip(
  locationName: string,
  period: { month: number; year: number },
  record: ComplianceRecord | undefined,
  pct: number | undefined,
): string {
  const label = `${locationName} · ${MONTH_SHORT[period.month - 1]} ${period.year}`
  if (!record || record.status === 'pending' || record.status === 'draft') {
    return `${label}: Not submitted`
  }
  if (record.status === 'missed') return `${label}: Missed`
  if (record.status === 'overdue') return `${label}: Overdue`
  return `${label}: ${pct ?? '—'}% · Submitted`
}

const LEGEND_ITEMS = [
  { label: '≥ 75%', cls: 'bg-green-surface border border-green-border' },
  { label: '60–74%', cls: 'bg-yellow-surface border border-yellow-border' },
  { label: '< 60%', cls: 'bg-red-surface border border-red-border' },
  { label: 'Overdue', cls: 'bg-red-surface border border-red-border opacity-70' },
  { label: 'Missed', cls: 'bg-red-200' },
  { label: 'Pending', cls: 'bg-gray-100' },
]

export function ComplianceLegend() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1.5">
      {LEGEND_ITEMS.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5 text-[11px] text-text-secondary">
          <span className={`w-3 h-3 rounded-sm shrink-0 ${item.cls}`} />
          {item.label}
        </span>
      ))}
    </div>
  )
}

export default function ComplianceHeatmap({ facilities, complianceRecords }: Props) {
  const periods = useMemo(() => getPast12Periods(CURRENT_COMPLIANCE_PERIOD), [])
  const locationGroups = useMemo(() => groupFacilitiesByLocation(facilities), [facilities])

  return (
    // Single CSS grid — all rows share the same column tracks, guaranteeing alignment
    <div
      className="grid gap-x-2 gap-y-1.5"
      style={{ gridTemplateColumns: '152px repeat(12, 1fr)' }}
    >
      {/* Header: spacer + month labels */}
      <div />
      {periods.map((p) => {
        const isCurrent = p.month === CURRENT_COMPLIANCE_PERIOD.month && p.year === CURRENT_COMPLIANCE_PERIOD.year
        return (
          <div
            key={`h-${p.month}-${p.year}`}
            className={`text-center text-[11px] leading-none pb-1.5 self-end ${isCurrent ? 'font-bold text-brand' : 'text-text-tertiary font-medium'}`}
          >
            {MONTH_SHORT[p.month - 1]}
          </div>
        )
      })}

      {/* Data rows */}
      {locationGroups.map((lg) => (
        <Fragment key={lg.location}>
          <div className="pr-3 self-center">
            <p className="text-xs font-medium text-text-primary truncate leading-tight">{lg.location}</p>
            <p className="text-[10px] text-text-tertiary leading-tight truncate">{lg.state}</p>
          </div>
          {periods.map((p) => {
            const record = complianceRecords.find(
              (r) => r.locationName === lg.location && r.month === p.month && r.year === p.year,
            )
            const pct = record && (record.status === 'submitted' || record.status === 'updated') && record.checklist.some((e) => e.answer)
              ? scoreChecklist(record.checklist).percentage
              : undefined
            return (
              <div
                key={`${lg.location}-${p.month}-${p.year}`}
                title={cellTooltip(lg.location, p, record, pct)}
                className={`h-9 rounded-md cursor-default transition-opacity hover:opacity-75 ${cellStyle(record, pct)}`}
              />
            )
          })}
        </Fragment>
      ))}
    </div>
  )
}
