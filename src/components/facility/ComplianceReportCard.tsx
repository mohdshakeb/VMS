import type { ComplianceChecklistEntry } from '@/types/facility'
import Card from '@/components/Card'
import SectionLabel from '@/components/common/SectionLabel'
import { scoreChecklist } from '@/utils/facilityHelpers'

type Props = {
  checklist: ComplianceChecklistEntry[]
}

export default function ComplianceReportCard({ checklist }: Props) {
  const { sections, maxScore, facilityScore, percentage, stars } = scoreChecklist(checklist)

  return (
    <Card>
      <SectionLabel icon="ri-bar-chart-2-line" title="Report Card" />

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-surface-secondary/50 border border-border-light px-3 py-3">
          <p className="text-xs text-text-tertiary">Maximum Score</p>
          <p className="text-xl font-semibold text-text-primary mt-1 tabular-nums">{maxScore}</p>
        </div>
        <div className="rounded-xl bg-surface-secondary/50 border border-border-light px-3 py-3">
          <p className="text-xs text-text-tertiary">Facility Score</p>
          <p className="text-xl font-semibold text-text-primary mt-1 tabular-nums">
            {facilityScore}
            <span className="text-xs font-normal text-text-tertiary ml-1">({percentage}%)</span>
          </p>
        </div>
        <div className="rounded-xl bg-surface-secondary/50 border border-border-light px-3 py-3">
          <p className="text-xs text-text-tertiary">Facility Rating</p>
          <div className="flex items-center gap-0.5 mt-1.5">
            {Array.from({ length: 5 }, (_, i) => (
              <i
                key={i}
                className={`text-base ${i < stars ? 'ri-star-fill text-amber-400' : 'ri-star-line text-text-tertiary'}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border-light space-y-2.5">
        {sections.map((s) => (
          <div key={s.section} className="flex items-center gap-3">
            <p className="text-xs text-text-secondary w-40 shrink-0 truncate">{s.section}</p>
            <div className="flex-1 h-1.5 rounded-full bg-surface-secondary overflow-hidden">
              <div className="h-full rounded-full bg-brand" style={{ width: `${s.pct}%` }} />
            </div>
            <p className="text-xs text-text-tertiary w-10 shrink-0 text-right tabular-nums">{s.pct}%</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
