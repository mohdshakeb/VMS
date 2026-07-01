type Props = {
  stars: number | null
  size?: 'xs' | 'sm'
  className?: string
}

const SIZE_CLASS: Record<NonNullable<Props['size']>, string> = {
  xs: 'text-[11px]',
  sm: 'text-xs',
}

export default function StarRating({ stars, size = 'sm', className = '' }: Props) {
  if (stars === null) {
    return <span className="text-xs text-text-tertiary">—</span>
  }
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <i
          key={s}
          className={`${s <= stars ? 'ri-star-fill text-amber-400' : 'ri-star-line text-text-tertiary'} ${SIZE_CLASS[size]} leading-none`}
        />
      ))}
    </div>
  )
}
