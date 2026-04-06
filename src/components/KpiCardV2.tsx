type Color = 'blue' | 'purple' | 'green' | 'yellow'

const colorMap: Record<Color, { iconBg: string; iconBorder: string; iconColor: string }> = {
  blue: {
    iconBg: 'bg-[var(--color-badge-blue-light)]',
    iconBorder: 'border border-[var(--color-badge-blue-subtle)]',
    iconColor: 'text-[var(--color-badge-blue-dark)]',
  },
  purple: {
    iconBg: 'bg-[var(--color-badge-purple-light)]',
    iconBorder: 'border border-[var(--color-badge-purple-subtle)]',
    iconColor: 'text-[var(--color-badge-purple-dark)]',
  },
  green: {
    iconBg: 'bg-[var(--color-badge-green-light)]',
    iconBorder: 'border border-[var(--color-badge-green-subtle)]',
    iconColor: 'text-[var(--color-badge-green-dark)]',
  },
  yellow: {
    iconBg: 'bg-[var(--color-badge-yellow-light)]',
    iconBorder: 'border border-[var(--color-badge-yellow-subtle)]',
    iconColor: 'text-[var(--color-badge-yellow-dark)]',
  },
}

interface KpiCardV2Props {
  label: string
  info: string
  value: number
  icon: string
  color?: Color
  /** Trend vs yesterday — positive/negative/zero. Shown with graph-direction icons. */
  trend?: number
  /** Alert count (e.g. overdue, delayed). If 0, renders nothing. */
  alertCount?: number
  alertLabel?: string
  alertColor?: 'red' | 'orange'
}

export default function KpiCardV2({
  label, info, value, icon, color = 'blue',
  trend, alertCount, alertLabel = '', alertColor = 'red',
}: KpiCardV2Props) {
  const display = value < 10 ? String(value).padStart(2, '0') : String(value)
  const c = colorMap[color]

  const bottomEl = (() => {
    // Alert mode (overdue / delayed) — takes priority
    if (alertCount !== undefined) {
      if (alertCount === 0) return null
      const cls = alertColor === 'orange'
        ? 'text-orange-500'
        : 'text-red-500'
      return (
        <span className={`text-xs font-semibold leading-none ${cls}`}>
          {alertCount} {alertLabel}
        </span>
      )
    }

    // Trend mode (vs yesterday)
    if (trend === undefined) return null
    if (trend === 0) return (
      <span className="text-xs text-zinc-400 font-medium leading-none">— same as yesterday</span>
    )
    const up = trend > 0
    return (
      <span className={`flex items-baseline gap-0.5 text-xs font-semibold leading-none ${up ? 'text-green-600' : 'text-red-500'}`}>
        <i className={`${up ? 'ri-arrow-right-up-line' : 'ri-arrow-right-down-line'} text-[11px]`} />
        {up ? '+' : ''}{trend} vs yesterday
      </span>
    )
  })()

  return (
    <div className="px-6 pt-5 pb-5 flex flex-col gap-4">
      {/* Top row: label + subtitle aligned with icon */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <p className="text-xs font-bold text-zinc-900 uppercase tracking-widest leading-none">{label}</p>
          <p className="text-xs mt-1 text-zinc-400">{info}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${c.iconBg} ${c.iconBorder}`}>
          <i className={`${icon} text-xl ${c.iconColor}`} />
        </div>
      </div>

      {/* Bottom row: count + trend/alert, baseline aligned */}
      <div className="flex items-baseline gap-2.5">
        <p className="text-2xl font-bold text-zinc-900 tabular-nums leading-none">{display}</p>
        {bottomEl}
      </div>
    </div>
  )
}
