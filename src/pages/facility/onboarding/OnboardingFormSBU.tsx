import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import { useAuthStore } from '@/store/authStore'
import { employees } from '@/data/employees'
import { sbuCascade, facilityCodeFrom } from '@/data/facilityData'
import Button from '@/components/Button'
import logoBlackUrl from '@/assets/logoBlack.svg'
import buildingUrl from '@/assets/building.png'
import { GMMCO_PATTERN_URI } from '@/components/visit-form/VisitFormShared'
import type { FacilityType } from '@/types/facility'

const FACILITY_TYPES = ['Branch Office', 'Parts Warehouse', 'CRC', 'MRC', 'Repair Center', 'Executive Office', 'HQ']

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-secondary mb-1.5">
        {label} {required && <span className="text-terminal-red">*</span>}
      </label>
      {children}
    </div>
  )
}

export default function OnboardingFormSBU() {
  const navigate = useNavigate()
  const submitOnboarding = useFacilityStore((s) => s.submitOnboarding)
  const showToast = useFacilityStore((s) => s.showToast)
  const { currentSbu, currentEmployeeId } = useAuthStore()
  const currentEmployee = employees.find((e) => e.id === currentEmployeeId)
  const [patternOffset, setPatternOffset] = useState(0)
  const [showConfirm, setShowConfirm] = useState(false)

  const [form, setForm] = useState({
    facilityName: '',
    facilityType: '',
    state: '',
    city: '',
    location: '',
    address1: '',
    pinCode: '',
  })

  const states = Object.keys(sbuCascade[currentSbu] ?? {})
  const cities = form.state ? Object.keys(sbuCascade[currentSbu]?.[form.state] ?? {}) : []
  const locations = form.state && form.city
    ? (sbuCascade[currentSbu]?.[form.state]?.[form.city] ?? [])
    : []

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'state') { next.city = ''; next.location = '' }
      if (key === 'city') { next.location = '' }
      return next
    })
  }

  const canSubmit = !!(form.facilityName && form.facilityType && form.state && form.city && form.location && form.address1 && form.pinCode)

  function handleSubmit() {
    const now = new Date().toISOString()
    submitOnboarding({
      id: `onb-${Date.now()}`,
      facilityName: form.facilityName,
      facilityType: form.facilityType as FacilityType,
      sbu: currentSbu,
      state: form.state,
      city: form.city,
      location: form.location,
      address1: form.address1,
      pinCode: form.pinCode,
      floors: 0,
      categoryCount: 0,
      status: 'sbu-review',
      submittedAt: now,
      submittedBy: currentEmployee?.name ?? 'SBU Admin',
      submittedById: currentEmployeeId,
      timeline: [
        { stage: 1, label: 'Request submitted', status: 'done', timestamp: now },
        { stage: 2, label: 'Review', sublabel: `Pending — ${currentSbu} SBU`, status: 'active' },
        { stage: 3, label: 'Facility activated', sublabel: 'Awaiting approval', status: 'pending' },
      ],
    })
    showToast('Facility added successfully')
    navigate('/sbu/locations')
  }

  const generatedId = canSubmit
    ? facilityCodeFrom(form.facilityType, form.state, form.city, form.location, form.pinCode)
    : null

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
            <span className="font-medium">New Facility</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/sbu/locations')}
            className="text-sm font-medium text-brand hover:opacity-75 transition-opacity px-1 py-1"
          >
            Cancel
          </button>
        </header>

        <div
          className="flex-1 flex overflow-hidden min-h-0 relative bg-white"
        >
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
                ADD A NEW<br />
                <span className="text-brand">FACILITY</span><br />
                <span className="text-brand">TODAY</span>
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
                <div className="flex items-center gap-2 mb-1">
                  <i className="ri-building-2-line text-brand text-xl" />
                  <h3 className="text-base font-semibold text-text-primary">Facility Details</h3>
                  <span className="ml-auto text-xs font-medium text-text-tertiary bg-surface-secondary rounded-full px-2.5 py-1">
                    {currentSbu} SBU
                  </span>
                </div>
                <p className="text-sm text-text-tertiary">Fill in the core details to register a new facility.</p>
              </div>

              <div className="px-[72px] pb-[72px] space-y-4">
                <Field label="Facility Name" required>
                  <input
                    type="text"
                    value={form.facilityName}
                    onChange={(e) => set('facilityName', e.target.value)}
                    placeholder="e.g. Branch Office - Chennai"
                    className="form-input"
                  />
                </Field>

                <Field label="Facility Type" required>
                  <select
                    value={form.facilityType}
                    onChange={(e) => set('facilityType', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select type</option>
                    {FACILITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="State" required>
                    <select
                      value={form.state}
                      onChange={(e) => set('state', e.target.value)}
                      className="form-input"
                    >
                      <option value="">Select state</option>
                      {states.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="City" required>
                    <select
                      value={form.city}
                      onChange={(e) => set('city', e.target.value)}
                      disabled={!form.state}
                      className="form-input disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select city</option>
                      {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="Location" required>
                  <select
                    value={form.location}
                    onChange={(e) => set('location', e.target.value)}
                    disabled={!form.city}
                    className="form-input disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select location</option>
                    {locations.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Address Line 1" required>
                    <input
                      type="text"
                      value={form.address1}
                      onChange={(e) => set('address1', e.target.value)}
                      placeholder="e.g. 12 Anna Salai"
                      className="form-input"
                    />
                  </Field>
                  <Field label="Pin Code" required>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={form.pinCode}
                      onChange={(e) => set('pinCode', e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 600002"
                      className="form-input"
                    />
                  </Field>
                </div>

                <div className="flex gap-3 pt-4 pb-2">
                  <Button
                    type="button"
                    fullWidth
                    icon="ri-building-check-line"
                    disabled={!canSubmit}
                    onClick={() => setShowConfirm(true)}
                  >
                    Review &amp; Add Facility
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile ───────────────────────────────────────────────────────── */}
      <div className="md:hidden flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-light">
          <button
            onClick={() => navigate('/sbu/locations')}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-text-secondary hover:bg-surface-secondary transition-colors"
          >
            <i className="ri-arrow-left-line text-lg" />
          </button>
          <h2 className="text-sm font-medium text-text-primary flex-1">New Facility</h2>
          <span className="text-xs font-medium text-text-tertiary bg-surface-secondary rounded-full px-2.5 py-1">
            {currentSbu} SBU
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <Field label="Facility Name" required>
            <input
              type="text"
              value={form.facilityName}
              onChange={(e) => set('facilityName', e.target.value)}
              placeholder="e.g. Branch Office - Chennai"
              className="form-input"
            />
          </Field>

          <Field label="Facility Type" required>
            <select
              value={form.facilityType}
              onChange={(e) => set('facilityType', e.target.value)}
              className="form-input"
            >
              <option value="">Select type</option>
              {FACILITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>

          <Field label="State" required>
            <select
              value={form.state}
              onChange={(e) => set('state', e.target.value)}
              className="form-input"
            >
              <option value="">Select state</option>
              {states.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="City" required>
            <select
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              disabled={!form.state}
              className="form-input disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select city</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Location" required>
            <select
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              disabled={!form.city}
              className="form-input disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select location</option>
              {locations.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>

          <Field label="Address Line 1" required>
            <input
              type="text"
              value={form.address1}
              onChange={(e) => set('address1', e.target.value)}
              placeholder="e.g. 12 Anna Salai"
              className="form-input"
            />
          </Field>

          <Field label="Pin Code" required>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={form.pinCode}
              onChange={(e) => set('pinCode', e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 600002"
              className="form-input"
            />
          </Field>
        </div>

        <div className="px-4 py-3 border-t border-border-light shrink-0">
          <Button
            type="button"
            fullWidth
            icon="ri-building-check-line"
            disabled={!canSubmit}
            onClick={() => setShowConfirm(true)}
          >
            Review &amp; Add Facility
          </Button>
        </div>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center md:p-4">
          <div className="bg-white w-full md:max-w-md rounded-t-2xl md:rounded-2xl shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
              <h3 className="text-sm font-semibold text-text-primary">Confirm New Facility</h3>
              <button
                onClick={() => setShowConfirm(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-secondary transition-colors"
              >
                <i className="ri-close-line text-base" />
              </button>
            </div>

            <div className="px-5 py-5 space-y-4">
              {generatedId && (
                <div className="flex items-center gap-3 bg-surface-secondary rounded-xl px-4 py-3">
                  <i className="ri-qr-code-line text-xl text-text-secondary" />
                  <div>
                    <p className="text-xs text-text-tertiary">Facility ID (preview)</p>
                    <p className="text-sm font-mono font-medium text-text-secondary">{generatedId}</p>
                  </div>
                </div>
              )}

              <div className="border border-border-light rounded-xl p-4 space-y-3">
                {[
                  { label: 'Facility Name', value: form.facilityName },
                  { label: 'Facility Type', value: form.facilityType },
                  { label: 'SBU', value: currentSbu },
                  { label: 'State', value: form.state },
                  { label: 'City', value: form.city },
                  { label: 'Location', value: form.location },
                  { label: 'Address', value: form.address1 },
                  { label: 'Pin Code', value: form.pinCode },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-baseline gap-4">
                    <span className="text-xs text-text-tertiary shrink-0">{label}</span>
                    <span className="text-sm font-medium text-text-primary text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 px-5 pb-5">
              <Button type="button" variant="secondary" onClick={() => setShowConfirm(false)}>
                Edit
              </Button>
              <Button type="button" fullWidth icon="ri-check-line" onClick={handleSubmit}>
                Add Facility
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
