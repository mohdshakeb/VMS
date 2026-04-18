interface AvatarBadgeProps {
  name: string
  avatar?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: { container: 'h-5 w-5', text: 'text-[9px]' },
  md: { container: 'h-8 w-8', text: 'text-[10px]' },
  lg: { container: 'h-9 w-9', text: 'text-[10px]' },
}

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}

export default function AvatarBadge({ name, avatar, size = 'md', className = '' }: AvatarBadgeProps) {
  const { container, text } = sizeMap[size]
  const initials = getInitials(name)

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${container} rounded-full object-cover border border-border shrink-0 ${className}`}
      />
    )
  }

  return (
    <div
      className={`${container} rounded-full bg-brand-red-50 text-brand-red-500 flex items-center justify-center ${text} font-semibold leading-none select-none border border-brand-red-100 shrink-0 ${className}`}
    >
      {initials}
    </div>
  )
}

export { getInitials }
