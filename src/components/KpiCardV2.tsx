type Color = 'blue' | 'purple' | 'green' | 'yellow'

const colorMap: Record<Color, { iconBg: string; iconBorder: string; iconColor: string }> = {
  blue: {
    iconBg: 'bg-badge-blue-light',
    iconBorder: 'border border-badge-blue-subtle',
    iconColor: 'text-badge-blue-dark',
  },
  purple: {
    iconBg: 'bg-badge-purple-light',
    iconBorder: 'border border-badge-purple-subtle',
    iconColor: 'text-badge-purple-dark',
  },
  green: {
    iconBg: 'bg-badge-green-light',
    iconBorder: 'border border-badge-green-subtle',
    iconColor: 'text-badge-green-dark',
  },
  yellow: {
    iconBg: 'bg-badge-yellow-light',
    iconBorder: 'border border-badge-yellow-subtle',
    iconColor: 'text-badge-yellow-dark',
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
  onClick?: () => void
}

export default function KpiCardV2({
  label, info, value, icon, color = 'blue',
  trend, alertCount, alertLabel = '', alertColor = 'red', onClick,
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
        <span className={`text-xs font-medium leading-none ${cls}`}>
          {alertCount} {alertLabel}
        </span>
      )
    }

    // Trend mode (vs yesterday)
    if (trend === undefined) return null
    if (trend === 0) return (
      <span className="text-xs text-text-tertiary font-medium leading-none">— same as yesterday</span>
    )
    const up = trend > 0
    return (
      <span className={`flex items-baseline gap-1 text-xs font-medium leading-none ${up ? 'text-green-600' : 'text-red-500'}`}>
        <i className={`${up ? 'ri-arrow-right-up-line' : 'ri-arrow-right-down-line'} text-[14px]`} />
        {up ? '+' : ''}{trend} vs yesterday
      </span>
    )
  })()

  return (
    <div
      onClick={onClick}
      className={`rounded-xl bg-white border border-border-light px-4 py-4 md:px-6 md:pt-5 md:pb-5 flex flex-col gap-3 md:gap-4 transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Top row: label + subtitle aligned with icon */}
      <div className="flex items-center justify-between gap-2 md:gap-4">
        <div className="flex flex-col min-w-0">
          <p className="text-xs font-semibold text-text-primary uppercase tracking-widest leading-none">{label}</p>
          <p className="text-xs mt-1 text-text-tertiary">{info}</p>
        </div>
        <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0 ${c.iconBg} ${c.iconBorder}`}>
          <i className={`${icon} text-lg md:text-xl ${c.iconColor}`} />
        </div>
      </div>

      {/* Bottom row: count + trend/alert, baseline aligned */}
      <div className="flex items-baseline gap-1.5">
        <p className="text-2xl font-semibold text-text-primary tabular-nums leading-none">{display}</p>
        {bottomEl}
      </div>
    </div>
  )
}
