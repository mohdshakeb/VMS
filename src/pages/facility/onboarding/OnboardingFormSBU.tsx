import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import { sbuCascade } from '@/data/facilityData'
import Button from '@/components/Button'
import logoBlackUrl from '@/assets/logoBlack.svg'
import buildingUrl from '@/assets/building.png'
import { GMMCO_PATTERN_URI } from '@/components/visit-form/VisitFormShared'
import type { FacilityType } from '@/types/facility'

const BUILDING_TYPES = ['Branch Office', 'Parts Warehouse', 'CRC', 'MRC', 'Repair Center', 'Executive Office', 'HQ']

const TYPE_CODES: Record<string, string> = {
  'Branch Office':    'BO',
  'Parts Warehouse':  'PW',
  'CRC':              'CRC',
  'MRC':              'MRC',
  'Repair Center':    'RC',
  'Executive Office': 'EO',
  'HQ':               'HQ',
}

const STATE_CODES: Record<string, string> = {
  'Tamil Nadu':    'TN',
  'Kerala':        'KL',
  'Karnataka':     'KA',
  'Delhi NCR':     'DL',
  'Uttar Pradesh': 'UP',
  'Rajasthan':     'RJ',
  'Maharashtra':   'MH',
  'Gujarat':       'GJ',
  'West Bengal':   'WB',
  'Odisha':        'OD',
}

function buildingIdFrom(type: string, state: string, city: string, location: string) {
  const typeCode = TYPE_CODES[type] ?? type.slice(0, 3).toUpperCase()
  const stateCode = STATE_CODES[state] ?? state.slice(0, 2).toUpperCase()
  const cityCode = city.slice(0, 3).toUpperCase()
  const locCode = location.replace(/\s+/g, '').toUpperCase().slice(0, 12)
  return `${typeCode}_${stateCode}_${cityCode}_${locCode}`
}

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
  const [patternOffset, setPatternOffset] = useState(0)
  const [showConfirm, setShowConfirm] = useState(false)

  const [form, setForm] = useState({
    businessName: '',
    businessType: '',
    sbu: '',
    state: '',
    city: '',
    location: '',
  })

  const sbus = Object.keys(sbuCascade)
  const states = form.sbu ? Object.keys(sbuCascade[form.sbu] ?? {}) : []
  const cities = form.sbu && form.state ? Object.keys(sbuCascade[form.sbu]?.[form.state] ?? {}) : []
  const locations = form.sbu && form.state && form.city
    ? (sbuCascade[form.sbu]?.[form.state]?.[form.city] ?? [])
    : []

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'sbu') { next.state = ''; next.city = ''; next.location = '' }
      if (key === 'state') { next.city = ''; next.location = '' }
      if (key === 'city') { next.location = '' }
      return next
    })
  }

  const canSubmit = !!(form.businessName && form.businessType && form.sbu && form.state && form.city && form.location)

  function handleSubmit() {
    const now = new Date().toISOString()
    submitOnboarding({
      id: `onb-${Date.now()}`,
      facilityName: form.businessName,
      facilityType: form.businessType as FacilityType,
      sbu: form.sbu,
      state: form.state,
      city: form.city,
      location: form.location,
      address1: '',
      pinCode: '',
      floors: 0,
      categoryCount: 0,
      status: 'sbu-review',
      submittedAt: now,
      submittedBy: 'SBU Admin',
      submittedById: 'SBU-001',
      timeline: [
        { stage: 1, label: 'Request submitted', status: 'done', timestamp: now },
        { stage: 2, label: 'Review', sublabel: `Pending — ${form.sbu} SBU`, status: 'active' },
        { stage: 3, label: 'Business activated', sublabel: 'Awaiting approval', status: 'pending' },
      ],
    })
    showToast('Business added successfully')
    navigate('/facility/facilities')
  }

  const generatedId = canSubmit
    ? buildingIdFrom(form.businessType, form.state, form.city, form.location)
    : null

  return (
    <>
      {/* ── Desktop ──────────────────────────────────────────────────────── */}
      <div className="hidden md:flex flex-col h-full">
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white border-b border-border shrink-0">
          <button
            type="button"
            onClick={() => navigate('/facility/facilities')}
            className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors -ml-1 px-1 py-1 rounded-md"
          >
            <i className="ri-arrow-left-line text-lg" />
            <span className="font-medium">New Business</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/facility/facilities')}
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
                <span className="text-brand">BUSINESS</span><br />
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
                  <h3 className="text-base font-semibold text-text-primary">Business Details</h3>
                </div>
                <p className="text-sm text-text-tertiary">Fill in the core details to register a new business.</p>
              </div>

              <div className="px-[72px] pb-[72px] space-y-4">
                <Field label="Business Name" required>
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(e) => set('businessName', e.target.value)}
                    placeholder="e.g. Branch Office - Chennai"
                    className="form-input"
                  />
                </Field>

                <Field label="Business Type" required>
                  <select
                    value={form.businessType}
                    onChange={(e) => set('businessType', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select type</option>
                    {BUILDING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>

                <Field label="SBU" required>
                  <select
                    value={form.sbu}
                    onChange={(e) => set('sbu', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select SBU</option>
                    {sbus.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="State" required>
                    <select
                      value={form.state}
                      onChange={(e) => set('state', e.target.value)}
                      disabled={!form.sbu}
                      className="form-input disabled:opacity-50 disabled:cursor-not-allowed"
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

                <div className="flex gap-3 pt-4 pb-2">
                  <Button
                    type="button"
                    fullWidth
                    icon="ri-building-check-line"
                    disabled={!canSubmit}
                    onClick={() => setShowConfirm(true)}
                  >
                    Review &amp; Add Business
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
            onClick={() => navigate('/facility/facilities')}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-text-secondary hover:bg-surface-secondary transition-colors"
          >
            <i className="ri-arrow-left-line text-lg" />
          </button>
          <h2 className="text-sm font-medium text-text-primary">New Business</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <Field label="Business Name" required>
            <input
              type="text"
              value={form.businessName}
              onChange={(e) => set('businessName', e.target.value)}
              placeholder="e.g. Branch Office - Chennai"
              className="form-input"
            />
          </Field>

          <Field label="Business Type" required>
            <select
              value={form.businessType}
              onChange={(e) => set('businessType', e.target.value)}
              className="form-input"
            >
              <option value="">Select type</option>
              {BUILDING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>

          <Field label="SBU" required>
            <select
              value={form.sbu}
              onChange={(e) => set('sbu', e.target.value)}
              className="form-input"
            >
              <option value="">Select SBU</option>
              {sbus.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="State" required>
            <select
              value={form.state}
              onChange={(e) => set('state', e.target.value)}
              disabled={!form.sbu}
              className="form-input disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>

        <div className="px-4 py-3 border-t border-border-light shrink-0">
          <Button
            type="button"
            fullWidth
            icon="ri-building-check-line"
            disabled={!canSubmit}
            onClick={() => setShowConfirm(true)}
          >
            Review &amp; Add Business
          </Button>
        </div>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center md:p-4">
          <div className="bg-white w-full md:max-w-md rounded-t-2xl md:rounded-2xl shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
              <h3 className="text-sm font-semibold text-text-primary">Confirm New Business</h3>
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
                    <p className="text-xs text-text-tertiary">Business ID (preview)</p>
                    <p className="text-sm font-mono font-medium text-text-secondary">{generatedId}</p>
                  </div>
                </div>
              )}

              <div className="border border-border-light rounded-xl p-4 space-y-3">
                {[
                  { label: 'Business Name', value: form.businessName },
                  { label: 'Business Type', value: form.businessType },
                  { label: 'SBU', value: form.sbu },
                  { label: 'State', value: form.state },
                  { label: 'City', value: form.city },
                  { label: 'Location', value: form.location },
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
                Add Business
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
