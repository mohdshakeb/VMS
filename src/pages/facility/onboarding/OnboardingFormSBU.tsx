import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import { useAuthStore } from '@/store/authStore'
import { sbuCascade, locationAdminPool } from '@/data/facilityData'
import Button from '@/components/Button'
import SectionLabel from '@/components/common/SectionLabel'
import logoBlackUrl from '@/assets/logoBlack.svg'
import buildingUrl from '@/assets/building.png'
import { GMMCO_PATTERN_URI } from '@/components/visit-form/VisitFormShared'

const FACILITY_TYPES = ['Branch Office', 'Parts Warehouse', 'CRC', 'MRC', 'Repair Center', 'Executive Office', 'HQ']

const LOCATION_FORM_STEPS = [
  { label: 'Location',   icon: 'ri-map-pin-2-line',   title: 'Location Details'  },
  { label: 'Admins',     icon: 'ri-user-star-line',    title: 'Location Admins'   },
  { label: 'Facilities', icon: 'ri-building-2-line',   title: 'Add Facilities'    },
]

function LocationStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-0">
      {LOCATION_FORM_STEPS.map((step, index) => {
        const stepNum = index + 1
        const isCompleted = stepNum < currentStep
        const isActive = stepNum === currentStep
        const isLast = index === LOCATION_FORM_STEPS.length - 1
        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition-all duration-200 ${
                  isCompleted || isActive
                    ? 'bg-brand text-white'
                    : 'bg-transparent border border-border text-text-tertiary'
                }`}
              >
                {isCompleted ? <i className="ri-check-line text-[10px]" /> : <span>{stepNum}</span>}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap leading-none transition-colors duration-200 ${
                isActive ? 'text-brand' : isCompleted ? 'text-text-secondary' : 'text-text-tertiary'
              }`}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className={`w-16 h-px mx-2 mb-3.5 transition-colors duration-300 ${isCompleted ? 'bg-brand' : 'bg-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function Field({ label, required, hint, error, children }: {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-text-primary">
        {label}
        {required && <span className="text-rejected ml-0.5">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
      {hint && !error && <p className="text-xs text-text-tertiary mt-1">{hint}</p>}
      {error && (
        <p className="text-xs text-rejected mt-1 flex items-center gap-1">
          <i className="ri-error-warning-line" />
          {error}
        </p>
      )}
    </label>
  )
}

interface FacilityRow {
  type: string
  assignedAdmin: string
}

interface FormState {
  // Step 1
  locationName: string
  state: string
  city: string
  address: string
  pinCode: string
  description: string
  // Step 2
  adminNames: string[]
  // Step 3
  facilities: FacilityRow[]
}

const defaultFacilityRow = (): FacilityRow => ({ type: '', assignedAdmin: '' })

const defaultForm: FormState = {
  locationName: '',
  state: '',
  city: '',
  address: '',
  pinCode: '',
  description: '',
  adminNames: [],
  facilities: [defaultFacilityRow()],
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function OnboardingFormSBU() {
  const navigate = useNavigate()
  const addLocationWithFacilities = useFacilityStore((s) => s.addLocationWithFacilities)
  const showToast = useFacilityStore((s) => s.showToast)
  const { currentSbu } = useAuthStore()

  const [form, setForm] = useState<FormState>(defaultForm)
  const [step, setStep] = useState(1)
  const [showConfirm, setShowConfirm] = useState(false)
  const [patternOffset, setPatternOffset] = useState(0)

  // Touch state for validation feedback
  const [touched, setTouch] = useState({
    locationName: false,
    state: false,
    city: false,
    address: false,
    pinCode: false,
  })

  const states = Object.keys(sbuCascade[currentSbu] ?? {})
  const cities = form.state ? Object.keys(sbuCascade[currentSbu]?.[form.state] ?? {}) : []

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'state') { next.city = '' }
      return next
    })
  }

  function touch(key: keyof typeof touched) {
    setTouch((t) => ({ ...t, [key]: true }))
  }

  // ── Step validation ───────────────────────────────────────────────────────
  const step1Valid = !!(form.locationName.trim() && form.state && form.city && form.address.trim() && form.pinCode.length === 6)
  const step2Valid = form.adminNames.length > 0
  const step3Valid = form.facilities.every((f) => f.type && f.assignedAdmin)

  function handleNext() {
    if (step === 1) {
      setTouch({ locationName: true, state: true, city: true, address: true, pinCode: true })
      if (step1Valid) setStep(2)
    } else if (step === 2) {
      if (step2Valid) setStep(3)
    }
  }

  // ── Admin toggle ──────────────────────────────────────────────────────────
  function toggleAdmin(name: string) {
    setForm((prev) => {
      const has = prev.adminNames.includes(name)
      const next = has ? prev.adminNames.filter((n) => n !== name) : [...prev.adminNames, name]
      // When an admin is removed, clear any facility assignments referencing them
      const facilities = prev.facilities.map((f) =>
        f.assignedAdmin === name && has ? { ...f, assignedAdmin: '' } : f
      )
      return { ...prev, adminNames: next, facilities }
    })
  }

  // ── Facility rows ─────────────────────────────────────────────────────────
  function setFacilityRow(index: number, patch: Partial<FacilityRow>) {
    setForm((prev) => ({
      ...prev,
      facilities: prev.facilities.map((f, i) => i === index ? { ...f, ...patch } : f),
    }))
  }

  function addFacilityRow() {
    setForm((prev) => ({ ...prev, facilities: [...prev.facilities, defaultFacilityRow()] }))
  }

  function removeFacilityRow(index: number) {
    setForm((prev) => ({ ...prev, facilities: prev.facilities.filter((_, i) => i !== index) }))
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  function handleSubmit() {
    addLocationWithFacilities({
      locationName: form.locationName.trim(),
      sbu: currentSbu,
      state: form.state,
      city: form.city,
      address: form.address.trim(),
      pinCode: form.pinCode,
      adminNames: form.adminNames,
      facilities: form.facilities.map((f) => ({
        type: f.type,
        name: f.type,
        assignedAdmin: f.assignedAdmin,
      })),
    })
    showToast('Location created successfully')
    navigate('/sbu/locations')
  }

  const currentStepMeta = LOCATION_FORM_STEPS[step - 1]

  // ── Shared form content per step ──────────────────────────────────────────

  function renderStep1() {
    return (
      <div className="space-y-4">
        <Field
          label="Location Name"
          required
          hint='Use the city name for a single location, or "Locality · City" for multiple.'
          error={touched.locationName && !form.locationName.trim() ? 'Location name is required' : undefined}
        >
          <input
            type="text"
            value={form.locationName}
            onChange={(e) => setField('locationName', e.target.value)}
            onBlur={() => touch('locationName')}
            placeholder='e.g. "Coimbatore" or "Anna Salai · Chennai"'
            className={`form-input ${touched.locationName && !form.locationName.trim() ? 'border-rejected focus:ring-rejected/20' : ''}`}
            autoFocus
          />
        </Field>

        <div className="flex items-center gap-2 px-3 py-2 bg-surface-secondary rounded-lg border border-border-light">
          <i className="ri-building-4-line text-sm text-text-tertiary" />
          <span className="text-xs text-text-tertiary">SBU</span>
          <span className="ml-auto text-xs font-semibold text-text-primary">{currentSbu}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="State" required error={touched.state && !form.state ? 'Select a state' : undefined}>
            <select
              value={form.state}
              onChange={(e) => setField('state', e.target.value)}
              onBlur={() => touch('state')}
              className={`form-input ${touched.state && !form.state ? 'border-rejected focus:ring-rejected/20' : ''}`}
            >
              <option value="">Select state</option>
              {states.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="City" required error={touched.city && !form.city ? 'Select a city' : undefined}>
            <select
              value={form.city}
              onChange={(e) => setField('city', e.target.value)}
              onBlur={() => touch('city')}
              disabled={!form.state}
              className={`form-input disabled:opacity-50 disabled:cursor-not-allowed ${touched.city && !form.city ? 'border-rejected focus:ring-rejected/20' : ''}`}
            >
              <option value="">Select city</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Address" required error={touched.address && !form.address.trim() ? 'Address is required' : undefined}>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setField('address', e.target.value)}
              onBlur={() => touch('address')}
              placeholder="e.g. 12 Anna Salai"
              className={`form-input ${touched.address && !form.address.trim() ? 'border-rejected focus:ring-rejected/20' : ''}`}
            />
          </Field>
          <Field label="Pin Code" required error={touched.pinCode && form.pinCode.length !== 6 ? 'Enter a valid 6-digit pin code' : undefined}>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={form.pinCode}
              onChange={(e) => setField('pinCode', e.target.value.replace(/\D/g, ''))}
              onBlur={() => touch('pinCode')}
              placeholder="e.g. 600002"
              className={`form-input ${touched.pinCode && form.pinCode.length !== 6 ? 'border-rejected focus:ring-rejected/20' : ''}`}
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            placeholder="Brief description of this location (optional)"
            rows={2}
            className="form-input resize-none"
          />
        </Field>
      </div>
    )
  }

  function renderStep2() {
    return (
      <div className="space-y-4">
        {form.adminNames.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.adminNames.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1.5 bg-brand/10 text-brand text-xs font-medium px-2.5 py-1 rounded-full"
              >
                {name}
                <button
                  type="button"
                  onClick={() => toggleAdmin(name)}
                  className="hover:opacity-60 transition-opacity"
                >
                  <i className="ri-close-line text-[11px]" />
                </button>
              </span>
            ))}
          </div>
        )}

        {form.adminNames.length === 0 && (
          <p className="text-xs text-text-tertiary">Select at least one admin to proceed.</p>
        )}

        <div className="border border-border rounded-xl overflow-hidden divide-y divide-border-light max-h-72 overflow-y-auto">
          {locationAdminPool.map((admin) => {
            const selected = form.adminNames.includes(admin.name)
            return (
              <button
                key={admin.id}
                type="button"
                onClick={() => toggleAdmin(admin.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  selected ? 'bg-brand/5' : 'hover:bg-surface-secondary'
                }`}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold select-none ${
                  selected ? 'bg-brand text-white' : 'bg-surface-secondary text-text-secondary'
                }`}>
                  {selected ? <i className="ri-check-line text-sm" /> : initials(admin.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary">{admin.name}</p>
                  <p className="text-xs text-text-tertiary truncate">{admin.email}</p>
                </div>
                {selected && <i className="ri-checkbox-circle-fill text-brand text-base shrink-0" />}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  function renderStep3() {
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          {form.facilities.map((f, i) => (
            <div key={i} className="border border-border rounded-xl p-4 space-y-3 relative">
              {form.facilities.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFacilityRow(i)}
                  className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-md text-text-tertiary hover:text-rejected hover:bg-rejected/10 transition-colors"
                >
                  <i className="ri-close-line text-sm" />
                </button>
              )}
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">Facility {i + 1}</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Facility Type" required>
                  <select
                    value={f.type}
                    onChange={(e) => setFacilityRow(i, { type: e.target.value })}
                    className="form-input"
                  >
                    <option value="">Select type</option>
                    {FACILITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Assign Admin" required>
                  <select
                    value={f.assignedAdmin}
                    onChange={(e) => setFacilityRow(i, { assignedAdmin: e.target.value })}
                    disabled={form.adminNames.length === 0}
                    className="form-input disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select admin</option>
                    {form.adminNames.map((name) => <option key={name} value={name}>{name}</option>)}
                  </select>
                </Field>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addFacilityRow}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-border rounded-xl text-sm font-medium text-text-secondary hover:border-brand hover:text-brand transition-colors"
        >
          <i className="ri-add-line" />
          Add Facility
        </button>
      </div>
    )
  }

  function renderNav(isMobile?: boolean) {
    const backBtn = step > 1 ? (
      <Button type="button" variant="secondary" onClick={() => setStep((s) => s - 1)}>
        Back
      </Button>
    ) : null

    const nextBtn = step < 3 ? (
      <Button type="button" fullWidth icon="ri-arrow-right-line" onClick={handleNext}
        disabled={step === 2 && !step2Valid}
      >
        Continue
      </Button>
    ) : (
      <Button type="button" fullWidth icon="ri-map-pin-add-line" disabled={!step3Valid}
        onClick={() => setShowConfirm(true)}
      >
        Review &amp; Create
      </Button>
    )

    if (isMobile) {
      return (
        <div className="px-4 py-3 border-t border-border-light shrink-0 flex gap-3">
          {backBtn}
          {nextBtn}
        </div>
      )
    }

    return (
      <div className="flex gap-3 pt-4 pb-2">
        {backBtn}
        {nextBtn}
      </div>
    )
  }

  return (
    <>
      {/* ── Desktop ──────────────────────────────────────────────────────── */}
      <div className="hidden md:flex flex-col h-full">
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white border-b border-border shrink-0">
          <button
            type="button"
            onClick={() => navigate('/sbu/locations')}
            className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors -ml-1 px-1 py-1 rounded-md"
          >
            <i className="ri-arrow-left-line text-lg" />
            <span className="font-medium">New Location</span>
          </button>
          <LocationStepper currentStep={step} />
          <button
            type="button"
            onClick={() => navigate('/sbu/locations')}
            className="text-sm font-medium text-brand hover:opacity-75 transition-opacity px-1 py-1"
          >
            Cancel
          </button>
        </header>

        <div className="flex-1 flex overflow-hidden min-h-0 relative bg-white">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: GMMCO_PATTERN_URI,
              backgroundRepeat: 'repeat',
              backgroundSize: '160px 160px',
              backgroundPositionY: `${patternOffset}px`,
              opacity: 0.07,
            }}
          />

          {/* Left branding */}
          <div className="flex flex-col w-[42%] shrink-0 relative z-10">
            <div className="pt-12 px-8">
              <img src={logoBlackUrl} alt="GMMCO — CKA Birla Group" className="h-7 w-auto" />
            </div>
            <div className="px-8 mt-3">
              <h2 className="font-black text-[2.6rem] leading-[1.28] tracking-tight text-gray-800 uppercase">
                Add a Location<br />
                to <span className="text-brand">manage</span><br />
                <span className="text-brand">facilities</span>
              </h2>
            </div>
            <div className="mt-auto">
              <img
                src={buildingUrl}
                alt="GMMCO building"
                className="w-full object-contain object-left-bottom max-h-[400px] block"
                draggable={false}
              />
            </div>
          </div>

          {/* Right: form card */}
          <div
            className="flex-1 flex flex-col p-12 relative z-10 overflow-y-auto"
            onScroll={(e) => setPatternOffset(e.currentTarget.scrollTop * -0.35)}
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80">
              <div className="px-[72px] pt-[72px] pb-4">
                <SectionLabel icon={currentStepMeta.icon} title={currentStepMeta.title} />
              </div>
              <div className="px-[72px] pb-[72px] space-y-4">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {renderNav()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile ───────────────────────────────────────────────────────── */}
      <div className="md:hidden flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-light">
          <button
            onClick={() => step > 1 ? setStep((s) => s - 1) : navigate('/sbu/locations')}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-text-secondary hover:bg-surface-secondary transition-colors"
          >
            <i className="ri-arrow-left-line text-lg" />
          </button>
          <div className="flex-1 flex justify-center">
            <LocationStepper currentStep={step} />
          </div>
          <span className="text-xs font-medium text-text-tertiary bg-surface-secondary rounded-full px-2.5 py-1 shrink-0">
            {currentSbu}
          </span>
        </div>

        <div className="px-4 pt-4 pb-2">
          <p className="text-sm font-semibold text-text-primary">{currentStepMeta.title}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {renderNav(true)}
      </div>

      {/* ── Confirm modal ─────────────────────────────────────────────────── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center md:p-4">
          <div className="bg-white w-full md:max-w-md rounded-t-2xl md:rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-light shrink-0">
              <h3 className="text-sm font-semibold text-text-primary">Confirm New Location</h3>
              <button
                onClick={() => setShowConfirm(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-secondary transition-colors"
              >
                <i className="ri-close-line text-base" />
              </button>
            </div>

            <div className="px-5 py-5 space-y-4 overflow-y-auto">
              <div className="border border-border-light rounded-xl p-4 space-y-3">
                <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide">Location</p>
                {[
                  { label: 'Name',     value: form.locationName },
                  { label: 'SBU',      value: currentSbu        },
                  { label: 'State',    value: form.state         },
                  { label: 'City',     value: form.city          },
                  { label: 'Address',  value: form.address       },
                  { label: 'Pin Code', value: form.pinCode       },
                  ...(form.description ? [{ label: 'Description', value: form.description }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-baseline gap-4">
                    <span className="text-xs text-text-tertiary shrink-0">{label}</span>
                    <span className="text-sm font-medium text-text-primary text-right">{value}</span>
                  </div>
                ))}
              </div>

              <div className="border border-border-light rounded-xl p-4 space-y-2">
                <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide mb-3">Admins</p>
                <div className="flex flex-wrap gap-2">
                  {form.adminNames.map((name) => (
                    <span key={name} className="inline-flex items-center gap-1.5 bg-brand/10 text-brand text-xs font-medium px-2.5 py-1 rounded-full">
                      {name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border border-border-light rounded-xl p-4 space-y-3">
                <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide">
                  Facilities ({form.facilities.length})
                </p>
                {form.facilities.map((f, i) => (
                  <div key={i} className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium text-text-primary">{f.type}</p>
                    <span className="text-xs text-text-secondary shrink-0">{f.assignedAdmin}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 px-5 pb-5 shrink-0">
              <Button type="button" variant="secondary" onClick={() => setShowConfirm(false)}>
                Edit
              </Button>
              <Button type="button" fullWidth icon="ri-check-line" onClick={handleSubmit}>
                Create Location
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
