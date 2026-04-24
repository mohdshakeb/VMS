import { useState, useEffect } from 'react'
import BottomSheet from '@/components/Mobile/BottomSheet'
import Button from '@/components/Button'
import SectionLabel from '@/components/common/SectionLabel'
import { useVisitStore } from '@/store/visitStore'
import { employees } from '@/data/employees'
import { locations } from '@/data/locations'
import {
  formatDate,
  formatTime,
  getPurposeLabel,
  getDepartmentLabel,
  generateBadgeNumber,
  getLocalDateString,
} from '@/utils/helpers'

interface SuccessData {
  name: string
  company?: string
  badge: string
  time: string
}
import helmetIcon from '@/assets/safetyIcons/safetyHalmet.svg'
import gogglesIcon from '@/assets/safetyIcons/safetyGoggles.svg'
import vestIcon from '@/assets/safetyIcons/vest.svg'
import glovesIcon from '@/assets/safetyIcons/gloves.svg'
import maskIcon from '@/assets/safetyIcons/mask.svg'
import harnessIcon from '@/assets/safetyIcons/harness.svg'
import coverallIcon from '@/assets/safetyIcons/coverall.svg'

interface Props {
  visitId: string
  onClose: () => void
}

const PPE_ASSETS = [
  { id: 'helmet', label: 'Safety Helmet', icon: 'ri-hard-hat-line', svg: helmetIcon },
  { id: 'glasses', label: 'Safety Glasses', icon: 'ri-glasses-line', svg: gogglesIcon },
  { id: 'ear', label: 'Ear Plugs / Muffs', icon: 'ri-headphone-line' },
  { id: 'boots', label: 'Safety Boots', icon: 'ri-footprint-line' },
  { id: 'vest', label: 'Hi-Vis Vest', icon: 'ri-t-shirt-line', svg: vestIcon },
  { id: 'gloves', label: 'Gloves', icon: 'ri-hand-line', svg: glovesIcon },
  { id: 'respirator', label: 'Respirator / Mask', icon: 'ri-mask-line', svg: maskIcon },
  { id: 'harness', label: 'Safety Harness', icon: 'ri-anchor-line', svg: harnessIcon },
  { id: 'face-shield', label: 'Face Shield', icon: 'ri-shield-line' },
  { id: 'coveralls', label: 'Coveralls', icon: 'ri-user-clothes-line', svg: coverallIcon },
  { id: 'other', label: 'Other', icon: 'ri-more-line' },
]

export default function CheckInSheet({ visitId, onClose }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true))
    })
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 260)
  }

  const visits = useVisitStore((s) => s.visits)
  const storeVisitors = useVisitStore((s) => s.visitors)
  const checkIn = useVisitStore((s) => s.checkIn)

  const visit = visits.find((v) => v.id === visitId)

  const [badgeNumber, setBadgeNumber] = useState(() => visit?.badgeId ?? generateBadgeNumber())
  const [idProofType, setIdProofType] = useState('')
  const [idProofNumber, setIdProofNumber] = useState('')
  const [laptopDetails, setLaptopDetails] = useState('')
  const [otherDeviceDetails, setOtherDeviceDetails] = useState('')
  const [hasVehicle, setHasVehicle] = useState(false)
  const [vehicleRegistration, setVehicleRegistration] = useState('')
  const [visitorInTemperature, setVisitorInTemperature] = useState('')
  const [issueAssets, setIssueAssets] = useState<boolean | null>(null)
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set())
  const [otherAssetText, setOtherAssetText] = useState('')
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [successData, setSuccessData] = useState<SuccessData | null>(null)

  if (!visit) return null

  const visitor = storeVisitors.find((v) => v.id === visit.visitorId)
  const host = employees.find((e) => e.id === visit.hostEmployeeId)
  const location = locations.find((l) => l.id === visit.locationId)

  const isToday = visit.scheduledDate === getLocalDateString()
  const visitDateRows: [string, string][] = isToday
    ? [['Time', formatTime(visit.scheduledTime)]]
    : [['Date', `${formatDate(visit.scheduledDate)}, ${formatTime(visit.scheduledTime)}`]]
  const multiDayRow: [string, string][] =
    visit.isMultiDay && visit.endDate ? [['Valid till', formatDate(visit.endDate)]] : []

  const canCheckIn = badgeNumber.trim() && idProofType && idProofNumber.trim() && issueAssets !== null

  function toggleAsset(id: string) {
    setSelectedAssets((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleCheckIn() {
    const willIssue = issueAssets === true
    const assetLabels: string[] = PPE_ASSETS
      .filter((a) => selectedAssets.has(a.id) && a.id !== 'other')
      .map((a) => a.label)
    if (selectedAssets.has('other') && otherAssetText.trim()) {
      assetLabels.push(`Other: ${otherAssetText.trim()}`)
    }
    checkIn(visit!.id, badgeNumber, {
      idProofType: idProofType || undefined,
      idProofNumber: idProofNumber.trim() || undefined,
      laptopDetails: laptopDetails.trim() || undefined,
      otherDeviceDetails: otherDeviceDetails.trim() || undefined,
      hasVehicle: hasVehicle || undefined,
      vehicleRegistration: vehicleRegistration.trim() || undefined,
      visitorInTemperature: visitorInTemperature.trim() || undefined,
      issueAssets: willIssue,
      assetsIssued: willIssue ? assetLabels.join(', ') || undefined : undefined,
    })

    const now = new Date()
    setSuccessData({
      name: visitor?.name ?? 'Unknown',
      company: visitor?.company,
      badge: badgeNumber,
      time: formatTime(`${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`),
    })
    setStep('success')
  }

  if (step === 'success' && successData) {
    return (
      <BottomSheet
        mounted={true}
        visible={visible}
        onClose={handleClose}
        footer={
          <Button fullWidth onClick={handleClose}>Done</Button>
        }
      >
        <div className="px-5 py-6 flex flex-col items-center text-center gap-5">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-badge-green-light)' }}
          >
            <i className="ri-checkbox-circle-fill text-5xl" style={{ color: 'var(--color-badge-green-dark)' }} />
          </div>
          <div>
            <p className="text-base font-semibold text-text-primary">Visitor Checked In</p>
            <p className="text-sm text-text-secondary mt-1">{successData.name}</p>
            {successData.company && (
              <p className="text-xs text-text-tertiary mt-0.5">{successData.company}</p>
            )}
          </div>
          <div className="w-full grid grid-cols-2 gap-3">
            <div
              className="rounded-xl p-4 text-left vms-stagger-item"
              style={{ backgroundColor: 'var(--color-surface-secondary)', animationDelay: '60ms' }}
            >
              <p className="text-[10px] text-text-tertiary">Badge</p>
              <p className="text-sm font-semibold text-text-primary">{successData.badge}</p>
            </div>
            <div
              className="rounded-xl p-4 text-left vms-stagger-item"
              style={{ backgroundColor: 'var(--color-surface-secondary)', animationDelay: '120ms' }}
            >
              <p className="text-[10px] text-text-tertiary">Checked In</p>
              <p className="text-sm font-semibold text-text-primary">{successData.time}</p>
            </div>
          </div>
        </div>
      </BottomSheet>
    )
  }

  const footer = (
    <div className="flex gap-2">
      <Button variant="secondary" fullWidth onClick={handleClose}>Cancel</Button>
      <Button icon="ri-login-box-line" fullWidth onClick={handleCheckIn} disabled={!canCheckIn}>
        Check In
      </Button>
    </div>
  )

  return (
    <BottomSheet
      mounted={true}
      visible={visible}
      onClose={handleClose}
      title="Check In Visitor"
      footer={footer}
    >
      <div className="space-y-6 px-5 pt-4 pb-2">

        {/* Visitor header — photo full-width, info stacked below */}
        <div>
          {visit.entryPath === 'walk-in' && visitor?.avatar ? (
            <img
              src={visitor.avatar}
              alt={visitor.name}
              className="w-full h-52 rounded-xl object-cover border border-border"
            />
          ) : (
            <div className="w-full h-28 rounded-xl bg-surface-secondary flex items-center justify-center border border-border">
              <i className="ri-user-line text-4xl text-text-tertiary" />
            </div>
          )}
          <div className="mt-3">
            <p className="text-base font-semibold text-text-primary">{visitor?.name ?? 'Unknown'}</p>
            {visitor?.company && (
              <p className="text-sm text-text-secondary mt-0.5">{visitor.company}</p>
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
            {([
              ['Mobile', visitor?.mobile ?? '—'],
              ['Location', location?.name ?? '—'],
              ['Purpose', getPurposeLabel(visit.purpose)],
              ['Host', host?.name ?? '—'],
              ...(visit.department ? [['Dept.', getDepartmentLabel(visit.department)]] as [string, string][] : []),
              ...visitDateRows,
              ...multiDayRow,
            ] as [string, string][]).map(([label, value]) => (
              <div key={label}>
                <p className="text-[10px] text-text-tertiary">{label}</p>
                <p className="text-xs font-medium text-text-primary">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Photo capture — only for pre-scheduled visits */}
        {visit.entryPath !== 'walk-in' && (
          <div>
            <SectionLabel icon="ri-camera-line" title="Visitor Photo" />
            <div className="mt-3 flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-surface hover:bg-surface-secondary transition-colors cursor-pointer py-5">
              <i className="ri-camera-line text-xl text-brand" />
              <p className="text-xs text-text-secondary">Capture visitor photo</p>
            </div>
          </div>
        )}

        {/* ID Proof */}
        <div>
          <SectionLabel icon="ri-id-card-line" title="Visitor ID" />
          <div className="mt-3 space-y-2">
            <select
              value={idProofType}
              onChange={(e) => setIdProofType(e.target.value)}
              className="form-input"
            >
              <option value="">Select ID type *</option>
              <option value="aadhar">Aadhar Card</option>
              <option value="pan">PAN Card</option>
              <option value="passport">Passport</option>
              <option value="driving-license">Driving License</option>
              <option value="voter-id">Voter ID</option>
              <option value="other">Other</option>
            </select>
            <input
              type="text"
              value={idProofNumber}
              onChange={(e) => setIdProofNumber(e.target.value)}
              placeholder="ID Number *"
              className="form-input"
            />
            <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-surface hover:bg-surface-secondary transition-colors cursor-pointer py-4">
              <i className="ri-image-line text-lg text-brand" />
              <p className="text-xs text-text-secondary">Capture ID document <span className="text-text-tertiary">(optional)</span></p>
            </div>
          </div>
        </div>

        {/* Devices */}
        <div>
          <SectionLabel icon="ri-macbook-line" title="Devices" />
          <div className="mt-3 space-y-2">
            <textarea
              value={laptopDetails}
              onChange={(e) => setLaptopDetails(e.target.value)}
              placeholder="Laptop — brand, model, serial no. (optional)"
              rows={2}
              className="form-input resize-none"
            />
            <textarea
              value={otherDeviceDetails}
              onChange={(e) => setOtherDeviceDetails(e.target.value)}
              placeholder="Other devices — tablets, cameras, etc. (optional)"
              rows={2}
              className="form-input resize-none"
            />
          </div>
        </div>

        {/* Assets / PPE */}
        <div>
          <SectionLabel icon="ri-shield-check-line" title="Issue Assets to Visitor?" required />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {([true, false] as const).map((val) => (
              <button
                key={String(val)}
                type="button"
                onClick={() => {
                  setIssueAssets(val)
                  if (!val) setSelectedAssets(new Set())
                }}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                  issueAssets === val
                    ? val
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-rejected bg-rejected/10 text-rejected'
                    : 'border-border bg-surface text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
                }`}
              >
                {val ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
          {issueAssets === true && (
            <>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {PPE_ASSETS.map((asset) => {
                  const active = selectedAssets.has(asset.id)
                  return (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => toggleAsset(asset.id)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-center transition-colors ${
                        active
                          ? 'border-brand bg-brand/10 text-brand'
                          : 'border-border bg-surface text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
                      }`}
                    >
                      {'svg' in asset && asset.svg ? (
                        <img src={asset.svg} alt={asset.label} className="w-6 h-6 object-contain" />
                      ) : (
                        <i className={`${asset.icon} text-lg`} />
                      )}
                      <span className="text-[11px] leading-tight font-medium">{asset.label}</span>
                    </button>
                  )
                })}
              </div>
              {selectedAssets.has('other') && (
                <input
                  type="text"
                  value={otherAssetText}
                  onChange={(e) => setOtherAssetText(e.target.value)}
                  placeholder="Describe other asset(s)"
                  className="form-input mt-2"
                />
              )}
              {selectedAssets.size > 0 && (
                <p className="text-xs text-text-tertiary mt-2">
                  {selectedAssets.size} item{selectedAssets.size > 1 ? 's' : ''} selected
                </p>
              )}
            </>
          )}
        </div>

        {/* Vehicle */}
        <div>
          <SectionLabel icon="ri-car-line" title="Vehicle" />
          <div className="mt-3 rounded-lg border border-border p-3 space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasVehicle}
                onChange={(e) => setHasVehicle(e.target.checked)}
                className="w-4 h-4 rounded border-border accent-brand"
              />
              <span className="text-sm font-medium text-text-primary">Visitor has a vehicle</span>
            </label>
            {hasVehicle && (
              <input
                type="text"
                value={vehicleRegistration}
                onChange={(e) => setVehicleRegistration(e.target.value.toUpperCase())}
                placeholder="Registration number (e.g. KA 01 AB 1234)"
                className="form-input uppercase"
              />
            )}
          </div>
        </div>

        {/* Entry temperature */}
        <div>
          <SectionLabel icon="ri-temp-cold-line" title="Entry Temperature" />
          <input
            type="text"
            value={visitorInTemperature}
            onChange={(e) => setVisitorInTemperature(e.target.value)}
            placeholder="e.g. 98.4°F or 37.0°C (optional)"
            className="form-input mt-3"
          />
        </div>

        {/* Badge */}
        <div>
          <SectionLabel icon="ri-barcode-line" title="Badge Number" required />
          <input
            type="text"
            value={badgeNumber}
            onChange={(e) => setBadgeNumber(e.target.value)}
            className="form-input mt-3"
            placeholder="e.g. B-0042"
          />
          <p className="text-xs text-text-tertiary mt-1">Enter the number from the physical badge being issued.</p>
        </div>

      </div>
    </BottomSheet>
  )
}
