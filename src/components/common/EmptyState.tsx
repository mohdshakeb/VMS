interface EmptyStateProps {
  icon: string
  title: string
  className?: string
  iconClassName?: string
  titleClassName?: string
}

export default function EmptyState({
  icon,
  title,
  className = 'py-10',
  iconClassName = 'text-2xl',
  titleClassName = 'text-xs',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 text-text-tertiary ${className}`}>
      <i className={`${icon} ${iconClassName}`} />
      <p className={titleClassName}>{title}</p>
    </div>
  )
}
