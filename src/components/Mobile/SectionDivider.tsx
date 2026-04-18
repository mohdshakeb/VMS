interface SectionDividerProps {
  icon: string
  title: string
}

export default function SectionDivider({ icon, title }: SectionDividerProps) {
  return (
    <div className="flex items-center gap-3 -mx-1">
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/10">
          <i className={`${icon} text-brand text-sm`} />
        </div>
        <h2 className="text-sm font-semibold text-text-primary tracking-tight">{title}</h2>
      </div>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}
