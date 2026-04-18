interface SectionLabelProps {
  icon: string
  title: string
}

export default function SectionLabel({ icon, title }: SectionLabelProps) {
  return (
    <div className="flex items-center gap-2">
      <i className={`${icon} text-sm text-text-tertiary`} />
      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{title}</span>
    </div>
  )
}
