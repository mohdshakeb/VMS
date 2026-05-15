import { useFacilityStore } from '@/store/facilityStore'
import { sbuCascade } from '@/data/facilityData'

export default function Step1Location() {
  const formData = useFacilityStore((s) => s.onboardingFormData)
  const setField = useFacilityStore((s) => s.setOnboardingField)

  const sbus = Object.keys(sbuCascade)
  const states = formData.sbu ? Object.keys(sbuCascade[formData.sbu] ?? {}) : []
  const cities = formData.sbu && formData.state ? Object.keys(sbuCascade[formData.sbu]?.[formData.state] ?? {}) : []
  const locations = formData.sbu && formData.state && formData.city
    ? (sbuCascade[formData.sbu]?.[formData.state]?.[formData.city] ?? [])
    : []

  function handleSBUChange(value: string) {
    setField('sbu', value)
    setField('state', '')
    setField('city', '')
    setField('location', '')
  }

  function handleStateChange(value: string) {
    setField('state', value)
    setField('city', '')
    setField('location', '')
  }

  function handleCityChange(value: string) {
    setField('city', value)
    setField('location', '')
  }

  return (
    <div className="space-y-4">
        {/* SBU */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            SBU <span className="text-terminal-red">*</span>
          </label>
          <select
            value={formData.sbu}
            onChange={(e) => handleSBUChange(e.target.value)}
            className="form-input"
          >
            <option value="">Select SBU</option>
            {sbus.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* State + City */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              State <span className="text-terminal-red">*</span>
            </label>
            <select
              value={formData.state}
              onChange={(e) => handleStateChange(e.target.value)}
              disabled={!formData.sbu}
              className="form-input disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select State</option>
              {states.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              City <span className="text-terminal-red">*</span>
            </label>
            <select
              value={formData.city}
              onChange={(e) => handleCityChange(e.target.value)}
              disabled={!formData.state}
              className="form-input disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select City</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Location + Store Code */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Location <span className="text-terminal-red">*</span>
            </label>
            <select
              value={formData.location}
              onChange={(e) => setField('location', e.target.value)}
              disabled={!formData.city}
              className="form-input disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select Location</option>
              {locations.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Store Code</label>
            <input
              type="text"
              value={formData.storeCode}
              onChange={(e) => setField('storeCode', e.target.value)}
              placeholder="From GMMCO portal"
              className="form-input"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Address Line 1 <span className="text-terminal-red">*</span>
          </label>
          <input
            type="text"
            value={formData.address1}
            onChange={(e) => setField('address1', e.target.value)}
            placeholder="Street address"
            className="form-input"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Address Line 2</label>
          <input
            type="text"
            value={formData.address2}
            onChange={(e) => setField('address2', e.target.value)}
            placeholder="Apt, suite, etc."
            className="form-input"
          />
        </div>

        {/* Pin Code + Coordinates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Pin Code <span className="text-terminal-red">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={formData.pinCode}
              onChange={(e) => setField('pinCode', e.target.value)}
              placeholder="6-digit pin"
              className="form-input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Coordinates</label>
            <input
              type="text"
              value={formData.latitude || formData.longitude ? `${formData.latitude}${formData.longitude ? ', ' + formData.longitude : ''}` : ''}
              onChange={(e) => {
                const [lat, lng] = e.target.value.split(',')
                setField('latitude', lat?.trim() ?? '')
                setField('longitude', lng?.trim() ?? '')
              }}
              placeholder="lat, lng"
              className="form-input"
            />
          </div>
        </div>
    </div>
  )
}
