import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useVisitStore } from '@/store/visitStore'
import { employees } from '@/data/employees'
import Card from '@/components/Card'
import Button from '@/components/Button'
import PageHeader from '@/components/PageHeader'
import DetailItem from '@/components/common/DetailItem'
import SectionLabel from '@/components/common/SectionLabel'
import { formatTime } from '@/utils/helpers'

export default function CheckOut() {
  const [now, setNow] = useState(0)
  useEffect(() => {
    const r = requestAnimationFrame(() => setNow(Date.now()))
    return () => cancelAnimationFrame(r)
  }, [])
  const { visitId } = useParams<{ visitId: string }>()
  const navigate = useNavigate()
  const visits = useVisitStore((s) => s.visits)
  const storeVisitors = useVisitStore((s) => s.visitors)
  const checkOut = useVisitStore((s) => s.checkOut)

  const checkOutDelegate = useVisitStore((s) => s.checkOutDelegate)

  const [outTemperature, setOutTemperature] = useState('')

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

  const checkInTime = visit?.checkInTime ? new Date(visit.checkInTime) : null
  const durationMin = (now > 0 && checkInTime) ? Math.floor((now - checkInTime.getTime()) / 60000) : 0
  const hours = Math.floor(durationMin / 60)
  const mins = durationMin % 60
  const durationStr = (now > 0 && checkInTime) ? (hours > 0 ? `${hours}h ${mins}m` : `${mins}m`) : '—'

  function handleCheckOut() {
    checkOut(visit!.id, outTemperature.trim() || undefined)
    navigate('/front-desk/dashboard')
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Check Out Visitor"
        breadcrumb={[{ label: 'Dashboard', path: '/front-desk/dashboard' }]}
        onBack={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto">
      <div className="px-4 md:px-6 py-5 max-w-lg mx-auto space-y-4">
        <Card>
          <div className="mb-4">
            <p className="text-base font-medium text-text-primary">{visitor?.name ?? 'Unknown'}</p>
            {visitor?.company && <p className="text-sm text-text-secondary">{visitor.company}</p>}
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <DetailItem label="Badge" value={visit.badgeNumber ?? '—'} />
            <DetailItem label="Host" value={host?.name ?? '—'} />
            <DetailItem label="Checked In" value={checkInTime ? formatTime(`${checkInTime.getHours()}:${String(checkInTime.getMinutes()).padStart(2, '0')}`) : '—'} />
            <div>
              <p className="text-xs text-text-tertiary">Duration</p>
              <p className="text-sm font-medium text-on-premises">{durationStr}</p>
            </div>
          </div>
        </Card>

        {/* Companions */}
        {visit.delegates && visit.delegates.length > 0 && (
          <Card>
            <div className="mb-3">
              <SectionLabel icon="ri-group-line" title={`Companions (${visit.delegates.length})`} />
            </div>
            <div className="space-y-2.5">
              {visit.delegates.map((d, i) => {
                const coTime = d.checkOutTime ? new Date(d.checkOutTime) : null
                return (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-text-primary truncate">{d.name}</p>
                      <p className="text-xs text-text-secondary">{d.mobile}</p>
                    </div>
                    {coTime ? (
                      <span className="text-xs text-text-tertiary whitespace-nowrap">
                        Left {formatTime(`${coTime.getHours()}:${String(coTime.getMinutes()).padStart(2, '0')}`)}
                      </span>
                    ) : (
                      <Button size="sm" variant="secondary" icon="ri-logout-box-line"
                        onClick={() => checkOutDelegate(visit!.id, i)}>
                        Check Out
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {/* Out Temperature */}
        <Card>
          <label className="block">
            <div className="mb-3">
              <SectionLabel icon="ri-temp-cold-line" title="Exit Temperature" />
            </div>
            <input
              type="text"
              value={outTemperature}
              onChange={(e) => setOutTemperature(e.target.value)}
              placeholder="e.g. 98.4°F or 37.0°C (optional)"
              className="form-input"
            />
          </label>
        </Card>

        <Button fullWidth variant="danger" icon="ri-logout-box-line" onClick={handleCheckOut}>
          Check Out
        </Button>
      </div>
      </div>
    </div>
  )
}

