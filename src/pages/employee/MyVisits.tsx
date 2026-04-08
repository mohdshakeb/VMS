import { useState } from 'react'
import { useVisitStore, getPendingApprovals } from '@/store/visitStore'
import { useAuthStore } from '@/store/authStore'
import VisitCard from '@/components/VisitCard'
import TabBar from '@/components/TabBar'
import PageHeader from '@/components/PageHeader'
import { getLocalDateString } from '@/utils/helpers'

type VisitTab = 'upcoming' | 'pending' | 'past'

export default function MyVisits() {
  const [activeTab, setActiveTab] = useState<VisitTab>('pending')
  const visits = useVisitStore((s) => s.visits)
  const storeVisitors = useVisitStore((s) => s.visitors)
  const employeeId = useAuthStore((s) => s.currentEmployeeId)

  const myVisits = visits.filter((v) => v.hostEmployeeId === employeeId)
  const today = getLocalDateString()

  const pending = getPendingApprovals(visits, employeeId)
  const upcoming = myVisits.filter((v) =>
    ['confirmed', 'scheduled'].includes(v.status) && v.scheduledDate >= today
  )
  const past = myVisits.filter((v) =>
    ['checked-out', 'rejected', 'cancelled'].includes(v.status)
  )

  const tabs = [
    { label: 'Pending', value: 'pending' as const, count: pending.length },
    { label: 'Upcoming', value: 'upcoming' as const, count: upcoming.length },
    { label: 'Past', value: 'past' as const, count: past.length },
  ]

  const activeVisits = activeTab === 'pending' ? pending : activeTab === 'upcoming' ? upcoming : past

  const visitorMap = Object.fromEntries(storeVisitors.map((v) => [v.id, v]))

  return (
    <div className="h-full flex flex-col">
      <PageHeader title="My Visits" />

      <div className="px-4 md:px-6 pt-3">
        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={(v) => setActiveTab(v as VisitTab)} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
        {activeVisits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
            <i className="ri-inbox-line text-3xl mb-2" />
            <p className="text-sm">No visits</p>
          </div>
        ) : (
          <div className="space-y-2 max-w-lg">
            {activeVisits.map((visit) => {
              const visitor = visitorMap[visit.visitorId]
              return (
                <VisitCard
                  key={visit.id}
                  visit={visit}
                  visitorName={visitor?.name ?? 'Unknown'}
                  visitorPhone={visitor?.mobile}
                  visitorAvatar={visitor?.avatar}
                  role="employee"
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
