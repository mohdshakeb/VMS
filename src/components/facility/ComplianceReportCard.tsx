import type { ComplianceChecklistEntry } from '@/types/facility'
import Card from '@/components/Card'
import SectionLabel from '@/components/common/SectionLabel'
import InfoTooltip from '@/components/common/InfoTooltip'
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
        <div className="relative rounded-xl bg-surface-secondary/50 border border-border-light px-3 py-3">
          <InfoTooltip
            position="corner"
            align="right"
            content="Each applicable checklist question is worth 10 points. N/A questions are excluded. This is the sum of points across all applicable questions."
          />
          <p className="text-xs text-text-tertiary pr-6">Maximum Score</p>
          <p className="text-xl font-semibold text-text-primary mt-1 tabular-nums">{maxScore}</p>
        </div>
        <div className="relative rounded-xl bg-surface-secondary/50 border border-border-light px-3 py-3">
          <InfoTooltip
            position="corner"
            align="right"
            content="Points earned per question: Yes = 10/10, Partial = 5/10, No = 0/10. Summed across all applicable questions, then shown as a percentage of the maximum score."
          />
          <p className="text-xs text-text-tertiary pr-6">Facility Score</p>
          <p className="text-xl font-semibold text-text-primary mt-1 tabular-nums">
            {facilityScore}
            <span className="text-xs font-normal text-text-tertiary ml-1">({percentage}%)</span>
          </p>
        </div>
        <div className="relative rounded-xl bg-surface-secondary/50 border border-border-light px-3 py-3">
          <InfoTooltip
            position="corner"
            align="right"
            content="Star rating from the facility score percentage: 5★ ≥90%, 4★ 75–89%, 3★ 60–74%, 2★ 40–59%, 1★ <40%."
          />
          <p className="text-xs text-text-tertiary pr-6">Facility Rating</p>
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
