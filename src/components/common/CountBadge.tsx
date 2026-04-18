interface CountBadgeProps {
  count: number
}

export default function CountBadge({ count }: CountBadgeProps) {
  return (
    <span className="text-[11px] font-semibold text-text-tertiary bg-surface-secondary rounded-full px-2 py-0.5">
      {count}
    </span>
  )
}
