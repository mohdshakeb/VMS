import type { ReactNode } from 'react'
import Card from '@/components/Card'
import buildingPlaceholder from '@/assets/building.png'

export type IdentityField = {
  label: string
  value: ReactNode
}

type Props = {
  photoUrl?: string
  name: string
  location?: string
  fields: IdentityField[]
  footer?: ReactNode
  hidePhoto?: boolean
  showAvatar?: boolean
}

export default function FacilityIdentityCard({ photoUrl, name, location, fields, footer, hidePhoto = false, showAvatar = false }: Props) {
  const initials = name.split(/[\s-]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('')

  return (
    <Card padding="none">
      {!hidePhoto && (
        <div className="aspect-[4/3] w-full overflow-hidden rounded-t-xl">
          <img
            src={photoUrl ?? buildingPlaceholder}
            alt={name}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = buildingPlaceholder }}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className={`${showAvatar ? 'flex items-center gap-3' : ''} mb-4`}>
          {showAvatar && (
            photoUrl ? (
              <img src={photoUrl} alt={name} className="h-12 w-12 rounded-full object-cover border border-border shrink-0" />
            ) : (
              <div className="h-12 w-12 rounded-full bg-brand-red-50 border border-brand-red-100 flex items-center justify-center text-sm font-semibold text-brand shrink-0">
                {initials}
              </div>
            )
          )}
          <div className="min-w-0">
            <p className="text-base font-semibold text-text-primary leading-tight truncate">{name}</p>
            {location && <p className="text-sm text-text-secondary mt-0.5">{location}</p>}
          </div>
        </div>

        <div className="space-y-2.5">
          {fields.map((field, i) => (
            <div key={i}>
              <p className="text-xs text-text-tertiary">{field.label}</p>
              <div className="mt-0.5">{
                typeof field.value === 'string'
                  ? <p className="text-sm font-medium text-text-primary">{field.value}</p>
                  : field.value
              }</div>
            </div>
          ))}
        </div>

        {footer && (
          <div className="mt-4 pt-3 border-t border-border-light">
            {footer}
          </div>
        )}
      </div>
    </Card>
  )
}
