import { useState, useEffect } from 'react'
import Modal from '@/components/Modal'
import Button from '@/components/Button'
import SectionLabel from '@/components/common/SectionLabel'
import { useVisitStore } from '@/store/visitStore'
import { employees } from '@/data/employees'
import { locations } from '@/data/locations'
import { formatDate, formatTime, getDepartmentLabel } from '@/utils/helpers'
import { parseIssuedAssets } from '@/data/assets'

interface Props {
  visitId: string
  onClose: () => void
}

interface SuccessData {
  name: string
  company?: string
  duration: string
  time: string
}

export default function CheckOutModal({ visitId, onClose }: Props) {
  const [now, setNow] = useState(0)
  useEffect(() => {
    const r = requestAnimationFrame(() => setNow(Date.now()))
    return () => cancelAnimationFrame(r)
  }, [])

  const visits = useVisitStore((s) => s.visits)
  const storeVisitors = useVisitStore((s) => s.visitors)
  const checkOut = useVisitStore((s) => s.checkOut)

  const [outTemperature, setOutTemperature] = useState('')
  const [returnedSet, setReturnedSet] = useState<Set<string>>(new Set())
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [successData, setSuccessData] = useState<SuccessData | null>(null)

  const visit = visits.find((v) => v.id === visitId)
  if (!visit) return null

  const visitor = storeVisitors.find((v) => v.id === visit.visitorId)
  const host = employees.find((e) => e.id === visit.hostEmployeeId)
  const location = locations.find((l) => l.id === visit.locationId)

  const checkInTime = visit.checkInTime ? new Date(visit.checkInTime) : null
  const durationMin = (now > 0 && checkInTime) ? Math.floor((now - checkInTime.getTime()) / 60000) : 0
  const h = Math.floor(durationMin / 60)
  const m = durationMin % 60
  const durationStr = (now > 0 && checkInTime) ? (h > 0 ? `${h}h ${m}m` : `${m}m`) : '—'
  const checkInTimeStr = checkInTime
    ? formatTime(`${checkInTime.getHours()}:${String(checkInTime.getMinutes()).padStart(2, '0')}`)
    : '—'

  const issuedAssets = parseIssuedAssets(visit.issueAssets ? visit.assetsIssued : undefined)
  const allReturned = issuedAssets.length === 0 || returnedSet.size === issuedAssets.length
  const assetsBlocking = visit.issueAssets && !allReturned
  const canCheckOut = !assetsBlocking

  function toggleReturned(label: string) {
    setReturnedSet((prev) => {
      const next = new Set(prev)
      next.has(label) ? next.delete(label) : next.add(label)
      return next
    })
  }

  function handleCheckOut() {
    checkOut(visit!.id, outTemperature.trim() || undefined, visit!.issueAssets ? allReturned : undefined)

    const now = new Date()
    setSuccessData({
      name: visitor?.name ?? 'Unknown',
      company: visitor?.company,
      duration: durationStr,
      time: formatTime(`${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`),
    })
    setStep('success')
  }

  if (step === 'success' && successData) {
    return (
      <Modal open onClose={onClose} size="md">
        <div className="animate-in py-4 flex flex-col items-center text-center gap-5">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-badge-violet-light)' }}
          >
            <i className="ri-logout-box-r-fill text-4xl" style={{ color: 'var(--color-on-premises)' }} />
          </div>
          <div>
            <p className="text-base font-semibold text-text-primary">Visitor Checked Out</p>
            <p className="text-sm text-text-secondary mt-1">{successData.name}</p>
            {successData.company && (
              <p className="text-xs text-text-tertiary mt-0.5">{successData.company}</p>
            )}
          </div>
          <div className="w-full grid grid-cols-2 gap-3">
            <div
              className="rounded-xl p-3 text-left vms-stagger-item"
              style={{ backgroundColor: 'var(--color-surface-secondary)', animationDelay: '60ms' }}
            >
              <p className="text-[10px] text-text-tertiary">Checked Out</p>
              <p className="text-sm font-semibold text-text-primary">{successData.time}</p>
            </div>
            <div
              className="rounded-xl p-3 text-left vms-stagger-item"
              style={{ backgroundColor: 'var(--color-surface-secondary)', animationDelay: '120ms' }}
            >
              <p className="text-[10px] text-text-tertiary">Time on Premises</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-on-premises)' }}>
                {successData.duration}
              </p>
            </div>
          </div>
          <Button fullWidth onClick={onClose}>Done</Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Check Out Visitor"
      size="lg"
      footer={
        <div className="space-y-2">
          {assetsBlocking && (
            <p className="text-xs text-rejected text-center">Confirm all issued assets are returned before checking out.</p>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
            <Button variant="danger" icon="ri-logout-box-line" fullWidth onClick={handleCheckOut} disabled={!canCheckOut}>
              Check Out
            </Button>
          </div>
        </div>
      }
    >
      <div className="max-h-[65vh] overflow-y-auto space-y-8 -mx-5 px-5 pb-1">

        {/* Visitor summary */}
        <div className="flex items-start gap-4">
          {visitor?.avatar ? (
            <img
              src={visitor.avatar}
              alt={visitor.name}
              className="w-40 h-48 rounded-xl object-cover flex-shrink-0 border border-border"
            />
          ) : (
            <div className="w-32 h-40 rounded-xl bg-surface-secondary flex items-center justify-center flex-shrink-0 border border-border">
              <i className="ri-user-line text-4xl text-text-tertiary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-base font-semibold text-text-primary truncate">{visitor?.name ?? 'Unknown'}</p>
            </div>
            {visitor?.company && (
              <p className="text-sm text-text-secondary mt-0.5 truncate">{visitor.company}</p>
            )}
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
              {[
                ['Badge', visit.badgeNumber ?? '—'],
                ['Mobile', visitor?.mobile ?? '—'],
                ['Location', location?.name ?? '—'],
                ['Host', host?.name ?? '—'],
                ...(visit.department ? [['Dept.', getDepartmentLabel(visit.department)]] : []),
                ['Scheduled', `${formatDate(visit.scheduledDate)}, ${formatTime(visit.scheduledTime)}`],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[10px] text-text-tertiary">{label}</p>
                  <p className="text-xs font-medium text-text-primary">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Check-in summary */}
        <div>
          <SectionLabel icon="ri-time-line" title="Check-In Summary" />
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <p className="text-[10px] text-text-tertiary">Checked In</p>
              <p className="text-xs font-medium text-text-primary">{checkInTimeStr}</p>
            </div>
            <div>
              <p className="text-[10px] text-text-tertiary">Time on Premises</p>
              <p className="text-xs font-medium text-on-premises">{durationStr}</p>
            </div>
          </div>
        </div>

        {/* Devices — read-only */}
        {(visit.laptopDetails || visit.otherDeviceDetails) && (
          <div>
            <SectionLabel icon="ri-macbook-line" title="Devices Declared" />
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
              {visit.laptopDetails && (
                <div>
                  <p className="text-[10px] text-text-tertiary">Laptop</p>
                  <p className="text-xs font-medium text-text-primary">{visit.laptopDetails}</p>
                </div>
              )}
              {visit.otherDeviceDetails && (
                <div>
                  <p className="text-[10px] text-text-tertiary">Other Devices</p>
                  <p className="text-xs font-medium text-text-primary">{visit.otherDeviceDetails}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assets */}
        <div>
          <SectionLabel icon="ri-shield-check-line" title="Assets Issued" />
          {!visit.issueAssets || issuedAssets.length === 0 ? (
            <p className="mt-3 text-xs font-medium text-text-primary">None</p>
          ) : (
            <div className="mt-3 space-y-2">
              {issuedAssets.map((asset) => {
                const checked = returnedSet.has(asset.label)
                return (
                  <label
                    key={asset.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors ${
                      checked ? 'border-brand bg-brand/5' : 'border-border bg-surface hover:bg-surface-secondary'
                    }`}
                  >
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-white border border-border-light flex items-center justify-center">
                      {asset.svg ? (
                        <img src={asset.svg} alt={asset.label} className="w-5 h-5 object-contain" />
                      ) : (
                        <i className={`${asset.icon} text-base text-text-secondary`} />
                      )}
                    </div>
                    <span className="flex-1 text-sm font-medium text-text-primary">{asset.label}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleReturned(asset.label)}
                      className="w-4 h-4 rounded border-border accent-brand"
                    />
                  </label>
                )
              })}
              {!allReturned && (
                <p className="text-xs text-text-tertiary pt-1">
                  Check each item to confirm it has been returned.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Vehicle — shown only when the field was captured at check-in */}
        {visit.hasVehicle !== undefined && (
          <div>
            <SectionLabel icon="ri-car-line" title="Vehicle" />
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <p className="text-[10px] text-text-tertiary">Has Vehicle</p>
                <p className="text-xs font-medium text-text-primary">{visit.hasVehicle ? 'Yes' : 'No'}</p>
              </div>
              {visit.hasVehicle && visit.vehicleRegistration && (
                <div>
                  <p className="text-[10px] text-text-tertiary">Registration</p>
                  <p className="text-xs font-medium text-text-primary">{visit.vehicleRegistration}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Temperature */}
        <div>
          <SectionLabel icon="ri-temp-cold-line" title="Temperature" />
          <div className="mt-3 space-y-3">
            {visit.visitorInTemperature && (
              <div>
                <p className="text-[10px] text-text-tertiary">Entry Temperature</p>
                <p className="text-xs font-medium text-text-primary">{visit.visitorInTemperature}</p>
              </div>
            )}
            <input
              type="text"
              value={outTemperature}
              onChange={(e) => setOutTemperature(e.target.value)}
              placeholder="Exit temperature — e.g. 98.4°F or 37.0°C (optional)"
              className="form-input"
            />
          </div>
        </div>

      </div>
    </Modal>
  )
}
