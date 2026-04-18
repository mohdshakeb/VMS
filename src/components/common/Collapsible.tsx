import type { ReactNode } from 'react'

interface CollapsibleProps {
  open: boolean
  children: ReactNode
}

export default function Collapsible({ open, children }: CollapsibleProps) {
  return (
    <div
      className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
      }`}
    >
      <div className="overflow-hidden min-h-0">{children}</div>
    </div>
  )
}
