interface KpiCardProps {
  label: string
  info: string
  value: number
}

export default function KpiCard({ label, info, value }: KpiCardProps) {
  const display = value < 10 ? String(value).padStart(2, '0') : String(value)

  return (
    <div className="px-6 pt-5 pb-4">
      <p className="text-xs font-semibold text-zinc-800 uppercase tracking-wide">{label}</p>
      <p className="text-xs text-zinc-400 mt-0.5">{info}</p>
      <p className="text-2xl font-semibold text-zinc-900 mt-3 tabular-nums">{display}</p>
    </div>
  )
}
