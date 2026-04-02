import { useParams, useNavigate } from 'react-router-dom'
import { useVisitStore } from '@/store/visitStore'
import { employees } from '@/data/employees'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { formatTime } from '@/utils/helpers'

export default function CheckOut() {
  const { visitId } = useParams<{ visitId: string }>()
  const navigate = useNavigate()
  const visits = useVisitStore((s) => s.visits)
  const storeVisitors = useVisitStore((s) => s.visitors)
  const checkOut = useVisitStore((s) => s.checkOut)

  const visit = visits.find((v) => v.id === visitId)

  if (!visit) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-sm text-text-secondary">Visit not found</p>
      </div>
    )
  }

  const visitor = storeVisitors.find((v) => v.id === visit.visitorId)
  const host = employees.find((e) => e.id === visit.hostEmployeeId)

  // Calculate duration
  const checkInTime = visit.checkInTime ? new Date(visit.checkInTime) : null
  const durationMin = checkInTime ? Math.floor((Date.now() - checkInTime.getTime()) / 60000) : 0
  const hours = Math.floor(durationMin / 60)
  const mins = durationMin % 60
  const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`

  function handleCheckOut() {
    checkOut(visit!.id)
    navigate('/front-desk/dashboard')
  }

  return (
    <div className="px-4 md:px-6 py-5 max-w-lg mx-auto space-y-5">
      <div>
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-3">
          <i className="ri-arrow-left-s-line text-lg" />Back
        </button>
        <h2 className="text-lg font-semibold text-text-primary">Check Out Visitor</h2>
      </div>

      <Card>
        <div className="space-y-3">
          <div>
            <p className="text-base font-semibold text-text-primary">{visitor?.name ?? 'Unknown'}</p>
            {visitor?.company && <p className="text-sm text-text-secondary">{visitor.company}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-text-tertiary">Badge</p>
              <p className="font-medium text-text-primary">{visit.badgeNumber ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Host</p>
              <p className="font-medium text-text-primary">{host?.name ?? 'Unknown'}</p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Checked In</p>
              <p className="font-medium text-text-primary">{checkInTime ? formatTime(`${checkInTime.getHours()}:${String(checkInTime.getMinutes()).padStart(2, '0')}`) : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Duration</p>
              <p className="font-medium text-on-premises">{durationStr}</p>
            </div>
          </div>
        </div>
      </Card>

      <Button fullWidth variant="danger" icon="ri-logout-box-line" onClick={handleCheckOut}>
        Check Out
      </Button>
    </div>
  )
}
