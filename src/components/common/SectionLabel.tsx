interface SectionLabelProps {
  icon: string
  title: string
  required?: boolean
}

export default function SectionLabel({ icon, title, required }: SectionLabelProps) {
  return (
    <div className="flex items-center gap-2.5">
      <i className={`${icon} text-brand text-lg shrink-0`} />
      <span className="text-sm font-medium text-text-primary tracking-tight">
        {title}
        {required && <span className="text-rejected ml-0.5">*</span>}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}
