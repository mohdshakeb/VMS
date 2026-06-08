import { useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import { infraCategories } from '@/data/facilityData'
import type { FacilityType, InfraApplicability } from '@/types/facility'

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

function buildingIdFrom(type: string, state: string, city: string, location: string, pin: string) {
  const typeCode = TYPE_CODES[type] ?? type.slice(0, 3).toUpperCase()
  const stateCode = STATE_CODES[state] ?? state.slice(0, 2).toUpperCase()
  const cityCode = city.slice(0, 3).toUpperCase()
  const locCode = location.replace(/\s+/g, '').toUpperCase().slice(0, 12)
  return `${typeCode}_${stateCode}_${cityCode}_${locCode}_${pin}`
}

function ReadonlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-text-tertiary">{label}</p>
      <p className="text-sm font-medium text-text-primary">{value || '—'}</p>
    </div>
  )
}

interface Props {
  onClose: () => void
  onEdit: (step: 1 | 2 | 3) => void
}

export default function Step4Review({ onClose, onEdit }: Props) {
  const navigate = useNavigate()
  const formData = useFacilityStore((s) => s.onboardingFormData)
  const submitOnboarding = useFacilityStore((s) => s.submitOnboarding)
  const showToast = useFacilityStore((s) => s.showToast)

  const generatedId = buildingIdFrom(
    formData.facilityType,
    formData.state,
    formData.city,
    formData.location,
    formData.pinCode
  )

  const selectedCats = infraCategories.filter((c) => formData.selectedCategories.includes(c.id))
  const mandatoryCount = selectedCats.filter(
    (c) => c.applicability[formData.facilityType as FacilityType] === 'mandatory' as InfraApplicability
  ).length
  const optionalCount = selectedCats.length - mandatoryCount + (formData.customCategories?.length ?? 0)
  const totalCount = selectedCats.length + (formData.customCategories?.length ?? 0)

  function handleSubmit() {
    const now = new Date().toISOString()
    submitOnboarding({
      id: `onb-${Date.now()}`,
      facilityName: formData.facilityName,
      facilityType: formData.facilityType as FacilityType,
      sbu: formData.sbu,
      state: formData.state,
      city: formData.city,
      location: formData.location,
      address1: formData.address1,
      pinCode: formData.pinCode,
      floors: parseInt(formData.floors) || 0,
      categoryCount: totalCount,
      status: 'sbu-review',
      submittedAt: now,
      submittedBy: 'Ravi Anand',
      submittedById: 'EMP-4821',
      timeline: [
        { stage: 1, label: 'Request submitted', status: 'done', timestamp: now },
        { stage: 2, label: 'SBU Admin review', sublabel: `Pending — ${formData.sbu} SBU`, status: 'active' },
        { stage: 3, label: 'Facility activated', sublabel: 'Awaiting approval', status: 'pending' },
      ],
    })
    showToast('Onboarding request submitted')
    navigate('/facility/onboarding/submitted')
  }

  return (
    <div className="px-4 py-5 md:px-6 md:py-5 max-w-xl">

      {/* Generated Facility ID */}
      <div className="flex items-center gap-3 bg-surface-secondary rounded-xl px-4 py-3 mb-5">
        <i className="ri-qr-code-line text-xl text-text-secondary" />
        <div>
          <p className="text-xs text-text-tertiary">Facility ID</p>
          <p className="text-sm font-mono font-medium text-text-secondary">{generatedId}</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Section 1 */}
        <div className="border border-border-light rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-text-primary">Location & Building Details</h4>
            <button onClick={() => onEdit(2)} className="text-xs text-brand hover:text-brand-hover transition-colors font-medium">Edit</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ReadonlyRow label="SBU" value={formData.sbu} />
            <ReadonlyRow label="State" value={formData.state} />
            <ReadonlyRow label="City" value={formData.city} />
            <ReadonlyRow label="Location" value={formData.location} />
            <ReadonlyRow label="Facility Type" value={formData.facilityType} />
            <ReadonlyRow label="Facility Name" value={formData.facilityName} />
            {formData.storeCode && <ReadonlyRow label="Store Code" value={formData.storeCode} />}
            {formData.description && <ReadonlyRow label="Description" value={formData.description} />}
          </div>
        </div>

        {/* Section 2 */}
        <div className="border border-border-light rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-text-primary">Physical & Infrastructure</h4>
            <button onClick={() => onEdit(1)} className="text-xs text-brand hover:text-brand-hover transition-colors font-medium">Edit</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ReadonlyRow label="Address" value={`${formData.address1}${formData.address2 ? ', ' + formData.address2 : ''}`} />
            <ReadonlyRow label="Pin Code" value={formData.pinCode} />
            <ReadonlyRow label="Floors" value={formData.floors} />
            {formData.area && <ReadonlyRow label="Area" value={`${formData.area} sq. ft`} />}
          </div>
          <p className="text-xs text-text-tertiary mt-3">
            {totalCount} categories assigned — {mandatoryCount} mandatory, {optionalCount} optional
          </p>
        </div>

        {/* Section 3 */}
        <div className="border border-border-light rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-text-primary">Administration</h4>
            <button onClick={() => onEdit(3)} className="text-xs text-brand hover:text-brand-hover transition-colors font-medium">Edit</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ReadonlyRow label="Facility Status" value={formData.facilityStatus} />
            {formData.remarks && <ReadonlyRow label="Remarks" value={formData.remarks} />}
            {formData.layoutPlanName && <ReadonlyRow label="Layout Plan" value={formData.layoutPlanName} />}
            {formData.complianceDocName && <ReadonlyRow label="Compliance Docs" value={formData.complianceDocName} />}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-4 border-t border-border-light">
        <button
          onClick={onClose}
          className="text-sm font-medium text-text-secondary border border-border-light rounded-lg px-4 py-2 hover:bg-surface-secondary transition-colors"
        >
          Go back
        </button>
        <button
          onClick={handleSubmit}
          className="text-sm font-medium text-white bg-brand hover:bg-brand-hover rounded-lg px-5 py-2 transition-colors"
        >
          Submit request
        </button>
      </div>
    </div>
  )
}
