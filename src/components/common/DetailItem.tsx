interface DetailItemProps {
  label: string
  value: string
  className?: string
}

export default function DetailItem({ label, value, className }: DetailItemProps) {
  return (
    <div className={className}>
      <p className="text-xs text-text-tertiary">{label}</p>
      <p className="text-sm text-text-primary font-medium">{value}</p>
    </div>
  )
}
