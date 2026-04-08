import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVisitStore } from '@/store/visitStore'
import { useAuthStore } from '@/store/authStore'
import { employees } from '@/data/employees'
import { locations } from '@/data/locations'
import { VISIT_TYPE_BY_PURPOSE } from '@/types/visit'
import type { Purpose, VisitType, BusinessSegment, VisitorPriority, Delegate } from '@/types/visit'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import {
  getPurposeLabel,
  getVisitTypeLabel,
  getBusinessSegmentLabel,
  getVisitorPriorityLabel,
  getDepartmentLabel,
  getLocalDateString,
  generateVisitId,
  formatDate,
  formatTime,
} from '@/utils/helpers'

// ── Constants ─────────────────────────────────────────────────────────────────

const ALL_PURPOSES: Purpose[] = ['official', 'personal', 'training', 'interview', 'delivery']

const BUSINESS_SEGMENTS: BusinessSegment[] = ['machines', 'engines', 'parts-purchased', 'service-inquiry', 'other']
const VISITOR_PRIORITIES: VisitorPriority[] = ['immediate', 'in-a-month', 'exploring']

const COMPANY_REQUIRED_TYPES: VisitType[] = ['vendor', 'contractor', 'customer', 'government-official']
const ID_PROOF_REQUIRED_TYPES: VisitType[] = ['cat-officials', 'vendor', 'contractor', 'customer', 'government-official', 'general-visitor', 'other']

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormData {
  // Section 1 — Visitor Identity
  firstName: string
  lastName: string
  mobile: string
  email: string
  // Section 2 — Visit Details
  purpose: Purpose | ''
  visitType: VisitType | ''
  company: string
  hostEmployeeId: string
  department: string
  scheduledDate: string
  scheduledTime: string
  duration: number | ''
  isDelegation: boolean
  // Section 3 — Additional Info
  photo: string
  idProofType: string
  idProofNumber: string
  idPhotoCapture: string
  businessSegment: BusinessSegment | ''
  priority: VisitorPriority | ''
  model: string
  businessSegmentRemarks: string
  laptopDetails: string
  otherDeviceDetails: string
  hasVehicle: boolean
  vehicleRegistration: string
  visitorInTemperature: string
  notes: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isCompanyRequired(visitType: VisitType | ''): boolean {
  return COMPANY_REQUIRED_TYPES.includes(visitType as VisitType)
}

function isIdProofRequired(visitType: VisitType | ''): boolean {
  return ID_PROOF_REQUIRED_TYPES.includes(visitType as VisitType)
}

function isFormValid(data: FormData): boolean {
  if (!data.firstName.trim() || !data.mobile.trim()) return false
  if (!data.purpose || !data.visitType || !data.hostEmployeeId) return false
  if (isCompanyRequired(data.visitType) && !data.company.trim()) return false
  return true
}

// ── Default ───────────────────────────────────────────────────────────────────

const defaultFormData: FormData = {
  firstName: '',
  lastName: '',
  mobile: '',
  email: '',
  purpose: '',
  visitType: '',
  company: '',
  hostEmployeeId: '',
  department: '',
  scheduledDate: getLocalDateString(),
  scheduledTime: (() => {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  })(),
  duration: '',
  isDelegation: false,
  photo: '',
  idProofType: '',
  idProofNumber: '',
  idPhotoCapture: '',
  businessSegment: '',
  priority: '',
  model: '',
  businessSegmentRemarks: '',
  laptopDetails: '',
  otherDeviceDetails: '',
  hasVehicle: false,
  vehicleRegistration: '',
  visitorInTemperature: '',
  notes: '',
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CreateWalkIn() {
  const navigate = useNavigate()
  const createWalkIn = useVisitStore((s) => s.createWalkIn)
  const locationId = useAuthStore((s) => s.currentLocationId)
  const location = locations.find((l) => l.id === locationId)

  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [delegates, setDelegates] = useState<Delegate[]>([])
  const [visitId] = useState(() => generateVisitId())

  const [showPreview, setShowPreview] = useState(false)
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const showCustomerBlock = formData.visitType === 'customer'
  const companyRequired = isCompanyRequired(formData.visitType)
  const idProofRequired = isIdProofRequired(formData.visitType)

  const locationEmployees = employees.filter((e) => e.locationId === locationId)
  const filteredEmployees = locationEmployees.filter(
    (e) =>
      e.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      e.department.toLowerCase().includes(employeeSearch.toLowerCase())
  )
  const selectedEmployee = employees.find((e) => e.id === formData.hostEmployeeId)
  const availableVisitTypes = formData.purpose
    ? (VISIT_TYPE_BY_PURPOSE[formData.purpose as Purpose] ?? [])
    : []

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowEmployeeDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleChange<K extends keyof FormData>(field: K, value: FormData[K]) {
    setFormData((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'purpose') next.visitType = ''
      if (field === 'hostEmployeeId') {
        const emp = employees.find((e) => e.id === (value as string))
        next.department = emp?.department ?? ''
      }
      return next
    })
  }

  function handleAddDelegate() {
    setDelegates((prev) => [...prev, { name: '', mobile: '' }])
  }

  function handleRemoveDelegate(index: number) {
    setDelegates((prev) => prev.filter((_, i) => i !== index))
  }

  function handleDelegateChange(index: number, field: keyof Delegate, value: string) {
    setDelegates((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isFormValid(formData)) return
    setShowPreview(true)
  }

  function handleConfirm() {
    const visitorName = [formData.firstName.trim(), formData.lastName.trim()].filter(Boolean).join(' ')

    const newVisit = createWalkIn({
      visitorName,
      visitorMobile: formData.mobile.trim(),
      visitorEmail: formData.email.trim() || undefined,
      visitorCompany: formData.company.trim() || undefined,
      hostEmployeeId: formData.hostEmployeeId,
      locationId,
      purpose: formData.purpose as Purpose,
      visitType: formData.visitType as VisitType,
      department: formData.department || undefined,
      scheduledDate: formData.scheduledDate,
      scheduledTime: formData.scheduledTime,
      duration: formData.duration !== '' ? formData.duration : undefined,
      delegates: delegates.filter((d) => d.name.trim() && d.mobile.trim()),
      idProofType: formData.idProofType || undefined,
      idProofNumber: formData.idProofNumber.trim() || undefined,
      laptopDetails: formData.laptopDetails.trim() || undefined,
      otherDeviceDetails: formData.otherDeviceDetails.trim() || undefined,
      hasVehicle: formData.hasVehicle || undefined,
      vehicleRegistration: formData.vehicleRegistration.trim() || undefined,
      visitorInTemperature: formData.visitorInTemperature.trim() || undefined,
      businessSegment: (formData.businessSegment as BusinessSegment) || undefined,
      priority: (formData.priority as VisitorPriority) || undefined,
      model: formData.model.trim() || undefined,
      businessSegmentRemarks: formData.businessSegmentRemarks.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    })

    useAuthStore.getState().setCurrentEmployee(formData.hostEmployeeId)
    navigate('/front-desk/dashboard', { state: { newVisitId: newVisit.id } })
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* ── App Bar ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white border-b border-border shrink-0">
        <button
          type="button"
          onClick={() => navigate('/front-desk/dashboard')}
          className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors -ml-1 px-1 py-1 rounded-md"
        >
          <i className="ri-arrow-left-line text-lg" />
          <span className="font-medium">Back</span>
        </button>

        <div className="text-center">
          <h1 className="text-sm font-semibold text-text-primary">New Walk-in</h1>
          <p className="text-xs text-text-tertiary leading-none mt-0.5">{location?.name ?? 'Current location'}</p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/front-desk/dashboard')}
          className="text-sm font-medium text-brand hover:opacity-75 transition-opacity px-1 py-1"
        >
          Cancel
        </button>
      </header>

      {/* ── Preview Modal ──────────────────────────────────────────────────── */}
      <Modal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title="Review Walk-in"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setShowPreview(false)}>
              Edit
            </Button>
            <Button icon="ri-check-line" fullWidth onClick={handleConfirm}>
              Confirm & Submit
            </Button>
          </div>
        }
      >
        {/* Visitor chip */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand font-semibold text-base select-none">
            {[formData.firstName[0], formData.lastName[0]].filter(Boolean).join('').toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">
              {[formData.firstName.trim(), formData.lastName.trim()].filter(Boolean).join(' ')}
            </p>
            <p className="text-xs text-text-secondary truncate">{formData.mobile}</p>
          </div>
          <span className="ml-auto shrink-0 rounded-full bg-pending-light px-2.5 py-0.5 text-[11px] font-medium text-pending">
            Pending Approval
          </span>
        </div>

        <div className="overflow-y-auto max-h-[52vh] -mx-5 px-5 space-y-4 pb-1">

          {/* Visit Details */}
          <PreviewSection title="Visit Details">
            <PreviewRow label="Purpose" value={getPurposeLabel(formData.purpose as string)} />
            <PreviewRow label="Visitor Type" value={getVisitTypeLabel(formData.visitType as string)} />
            {formData.company.trim() && <PreviewRow label="Company" value={formData.company.trim()} />}
            <PreviewRow label="Host" value={selectedEmployee?.name ?? '—'} />
            {formData.department && <PreviewRow label="Department" value={getDepartmentLabel(formData.department)} />}
            <PreviewRow label="Date" value={formatDate(formData.scheduledDate)} />
            <PreviewRow label="Time" value={formatTime(formData.scheduledTime)} />
            {formData.duration !== '' && (
              <PreviewRow
                label="Duration"
                value={
                  formData.duration >= 60
                    ? `${formData.duration / 60}h`
                    : `${formData.duration}m`
                }
              />
            )}
          </PreviewSection>

          {/* Additional — only render if anything is filled */}
          {(formData.email.trim() ||
            formData.idProofType ||
            formData.hasVehicle ||
            formData.laptopDetails.trim() ||
            formData.otherDeviceDetails.trim() ||
            formData.notes.trim() ||
            (formData.isDelegation && delegates.some((d) => d.name.trim()))) && (
            <PreviewSection title="Additional Info">
              {formData.email.trim() && <PreviewRow label="Email" value={formData.email.trim()} />}
              {formData.idProofType && (
                <PreviewRow
                  label="ID Proof"
                  value={[formData.idProofType, formData.idProofNumber.trim()].filter(Boolean).join(' · ')}
                />
              )}
              {formData.hasVehicle && formData.vehicleRegistration.trim() && (
                <PreviewRow label="Vehicle" value={formData.vehicleRegistration.trim()} />
              )}
              {formData.laptopDetails.trim() && <PreviewRow label="Laptop" value={formData.laptopDetails.trim()} />}
              {formData.otherDeviceDetails.trim() && <PreviewRow label="Other Devices" value={formData.otherDeviceDetails.trim()} />}
              {formData.isDelegation && delegates.filter((d) => d.name.trim()).length > 0 && (
                <PreviewRow
                  label="Delegates"
                  value={`${delegates.filter((d) => d.name.trim()).length} additional visitor${delegates.filter((d) => d.name.trim()).length > 1 ? 's' : ''}`}
                />
              )}
              {formData.notes.trim() && <PreviewRow label="Notes" value={formData.notes.trim()} />}
            </PreviewSection>
          )}

          {/* Visit ID */}
          <div className="flex items-center justify-between rounded-lg bg-surface px-3 py-2.5 border border-border">
            <span className="text-xs text-text-tertiary font-medium">Visit ID</span>
            <span className="font-mono text-xs font-medium text-secondary">{visitId}</span>
          </div>

        </div>
      </Modal>

      {/* ── Scrollable Form ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <form id="visit-form" onSubmit={handleSubmit} className="px-4 md:px-6 py-6 max-w-lg mx-auto space-y-24">

          {/* ── Section 1: Visitor Identity ─────────────────────────────── */}
          <section className="space-y-4">
            <SectionHeader icon="ri-user-3-line" title="Visitor Identity" />

            <div className="flex items-center justify-between rounded-lg bg-surface border border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <i className="ri-hashtag text-text-tertiary text-sm" />
                <span className="text-xs text-text-secondary font-medium uppercase tracking-wide">Visit ID</span>
              </div>
              <span className="font-mono text-sm font-medium text-secondary">{visitId}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="First Name" required>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="First name"
                  className="form-input"
                  autoFocus
                />
              </Field>
              <Field label="Last Name">
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Last name"
                  className="form-input"
                />
              </Field>
            </div>

            <Field label="Mobile Number" required>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => handleChange('mobile', e.target.value)}
                placeholder="+91 98410 12345"
                className="form-input"
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="visitor@company.com"
                className="form-input"
              />
            </Field>
          </section>

          {/* ── Section 2: Visit Details ────────────────────────────────── */}
          <section className="space-y-4">
            <SectionHeader icon="ri-calendar-check-line" title="Visit Details" />

            <Field label="Purpose of Visit" required>
              <select
                value={formData.purpose}
                onChange={(e) => handleChange('purpose', e.target.value as Purpose)}
                className="form-input"
              >
                <option value="">Select purpose</option>
                {ALL_PURPOSES.map((p) => (
                  <option key={p} value={p}>{getPurposeLabel(p)}</option>
                ))}
              </select>
            </Field>

            <Field label="Visitor Type" required>
              <select
                value={formData.visitType}
                onChange={(e) => handleChange('visitType', e.target.value as VisitType)}
                disabled={!formData.purpose}
                className="form-input disabled:opacity-50"
              >
                <option value="">
                  {!formData.purpose ? 'Select purpose first' : 'Select visitor type'}
                </option>
                {availableVisitTypes.map((vt) => (
                  <option key={vt} value={vt}>{getVisitTypeLabel(vt)}</option>
                ))}
              </select>
            </Field>

            <Field label="Visitor Company" required={companyRequired}>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                placeholder={companyRequired ? 'Required for this visitor type' : 'Organization name (optional)'}
                className="form-input"
              />
            </Field>

            {/* Whom to Meet */}
            <Field label="Whom to Meet" required>
              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-sm" />
                  <input
                    type="text"
                    value={selectedEmployee ? selectedEmployee.name : employeeSearch}
                    onChange={(e) => {
                      setEmployeeSearch(e.target.value)
                      handleChange('hostEmployeeId', '')
                      setShowEmployeeDropdown(true)
                    }}
                    onFocus={() => {
                      if (!formData.hostEmployeeId) setShowEmployeeDropdown(true)
                    }}
                    placeholder="Search by name or department"
                    className="form-input pl-9"
                  />
                  {formData.hostEmployeeId && (
                    <button
                      type="button"
                      onClick={() => {
                        handleChange('hostEmployeeId', '')
                        setEmployeeSearch('')
                        setShowEmployeeDropdown(true)
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-text-tertiary hover:text-text-primary"
                    >
                      <i className="ri-close-line" />
                    </button>
                  )}
                </div>

                {showEmployeeDropdown && !formData.hostEmployeeId && (
                  <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-lg bg-white border border-border shadow-lg">
                    {filteredEmployees.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-text-tertiary">No employees found</p>
                    ) : (
                      filteredEmployees.map((emp) => (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => {
                            handleChange('hostEmployeeId', emp.id)
                            setEmployeeSearch('')
                            setShowEmployeeDropdown(false)
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-surface-secondary transition-colors"
                        >
                          <p className="text-sm font-medium text-text-primary">{emp.name}</p>
                          <p className="text-xs text-text-secondary">{emp.department}</p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </Field>

            {/* Department — auto-filled */}
            <Field label="Department">
              <div className={`form-input flex items-center gap-2 ${formData.department ? 'bg-surface-secondary text-text-secondary' : 'text-text-tertiary'}`}>
                {formData.department
                  ? <><i className="ri-check-line text-xs text-confirmed" /><span className="text-sm">{getDepartmentLabel(formData.department)}</span></>
                  : <span className="text-sm">Auto-filled from host selection</span>
                }
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Date" required>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => handleChange('scheduledDate', e.target.value)}
                  className="form-input"
                />
              </Field>
              <Field label="Time" required>
                <input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => handleChange('scheduledTime', e.target.value)}
                  className="form-input"
                />
              </Field>
            </div>

            <Field label="Duration">
              <select
                value={formData.duration}
                onChange={(e) => handleChange('duration', e.target.value === '' ? '' : Number(e.target.value))}
                className="form-input"
              >
                <option value="">Select duration (optional)</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
                <option value={180}>3 hours</option>
                <option value={240}>Half day (4 hrs)</option>
                <option value={480}>Full day (8 hrs)</option>
              </select>
            </Field>

            {/* Group / Delegation */}
            <div className="rounded-lg border border-border p-4 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDelegation}
                  onChange={(e) => {
                    handleChange('isDelegation', e.target.checked)
                    if (!e.target.checked) setDelegates([])
                  }}
                  className="w-4 h-4 rounded border-border accent-brand"
                />
                <div>
                  <span className="text-sm font-medium text-text-primary">Group / Delegation Visit</span>
                  <p className="text-xs text-text-secondary">Multiple visitors arriving together</p>
                </div>
              </label>

              {formData.isDelegation && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs text-text-tertiary">
                    Primary visitor details are captured above. Add additional delegates below.
                  </p>
                  {delegates.map((delegate, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={delegate.name}
                          onChange={(e) => handleDelegateChange(index, 'name', e.target.value)}
                          placeholder="Name"
                          className="form-input text-sm"
                        />
                        <input
                          type="tel"
                          value={delegate.mobile}
                          onChange={(e) => handleDelegateChange(index, 'mobile', e.target.value)}
                          placeholder="Phone"
                          className="form-input text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDelegate(index)}
                        className="mt-1 p-2 rounded-md text-text-tertiary hover:text-rejected hover:bg-rejected-light transition-colors"
                      >
                        <i className="ri-close-line text-sm" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddDelegate}
                    className="flex items-center gap-1.5 text-sm text-brand font-medium hover:opacity-80 transition-opacity"
                  >
                    <i className="ri-add-line" />
                    Add Delegate
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* ── Section 3: Additional Info ──────────────────────────────── */}
          <section className="space-y-4">
            <SectionHeader icon="ri-file-list-3-line" title="Additional Info" />

            {/* Photo */}
            <Field label="Visitor Photo" required>
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface hover:bg-surface-secondary hover:border-border transition-colors cursor-pointer py-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-border shadow-sm">
                  <i className="ri-camera-line text-xl text-brand" />
                </div>
                <p className="text-sm font-medium text-text-primary">Capture or upload photo</p>
                <p className="text-xs text-text-tertiary">Camera · Gallery</p>
              </div>
            </Field>

            {/* Identity */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">ID Proof</p>

              <Field label="ID Proof Type" required={idProofRequired}>
                <select
                  value={formData.idProofType}
                  onChange={(e) => handleChange('idProofType', e.target.value)}
                  className="form-input"
                >
                  <option value="">Select ID type</option>
                  <option value="aadhar">Aadhar Card</option>
                  <option value="pan">PAN Card</option>
                  <option value="passport">Passport</option>
                  <option value="driving-license">Driving License</option>
                  <option value="voter-id">Voter ID</option>
                  <option value="other">Other</option>
                </select>
              </Field>

              <Field label="ID Number" required={idProofRequired}>
                <input
                  type="text"
                  value={formData.idProofNumber}
                  onChange={(e) => handleChange('idProofNumber', e.target.value)}
                  placeholder="e.g. XXXX XXXX XXXX"
                  className="form-input"
                />
              </Field>

              <Field label="ID Photo Capture">
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface hover:bg-surface-secondary hover:border-border transition-colors cursor-pointer py-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-border shadow-sm">
                    <i className="ri-image-line text-lg text-brand" />
                  </div>
                  <p className="text-sm font-medium text-text-primary">Capture ID document</p>
                  <p className="text-xs text-text-tertiary">Optional · Camera · Gallery</p>
                </div>
              </Field>
            </div>

            {/* Customer details — only for customer visitor type */}
            {showCustomerBlock && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">Customer Details</p>

                <Field label="Business Segment">
                  <select
                    value={formData.businessSegment}
                    onChange={(e) => handleChange('businessSegment', e.target.value as BusinessSegment)}
                    className="form-input"
                  >
                    <option value="">Select segment</option>
                    {BUSINESS_SEGMENTS.map((s) => (
                      <option key={s} value={s}>{getBusinessSegmentLabel(s)}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Priority">
                  <select
                    value={formData.priority}
                    onChange={(e) => handleChange('priority', e.target.value as VisitorPriority)}
                    className="form-input"
                  >
                    <option value="">Select priority</option>
                    {VISITOR_PRIORITIES.map((p) => (
                      <option key={p} value={p}>{getVisitorPriorityLabel(p)}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Model">
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => handleChange('model', e.target.value)}
                    placeholder="e.g. GCI - CAT EX - 336"
                    className="form-input"
                  />
                </Field>

                <Field label="Business Segment Remarks">
                  <textarea
                    value={formData.businessSegmentRemarks}
                    onChange={(e) => handleChange('businessSegmentRemarks', e.target.value)}
                    placeholder="Additional context about the business inquiry"
                    rows={2}
                    className="form-input resize-none"
                  />
                </Field>
              </div>
            )}

            {/* Devices */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">Devices</p>

              <Field label="Laptop Details">
                <textarea
                  value={formData.laptopDetails}
                  onChange={(e) => handleChange('laptopDetails', e.target.value)}
                  placeholder="Brand, model, serial number (if any)"
                  rows={2}
                  className="form-input resize-none"
                />
              </Field>

              <Field label="Other Devices">
                <textarea
                  value={formData.otherDeviceDetails}
                  onChange={(e) => handleChange('otherDeviceDetails', e.target.value)}
                  placeholder="Tablets, cameras, hard drives, etc."
                  rows={2}
                  className="form-input resize-none"
                />
              </Field>
            </div>

            {/* Vehicle */}
            <div className="rounded-lg border border-border p-4 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasVehicle}
                  onChange={(e) => handleChange('hasVehicle', e.target.checked)}
                  className="w-4 h-4 rounded border-border accent-brand"
                />
                <div>
                  <span className="text-sm font-medium text-text-primary">Visitor has a vehicle</span>
                  <p className="text-xs text-text-secondary">Record registration for security log</p>
                </div>
              </label>

              {formData.hasVehicle && (
                <Field label="Registration Number">
                  <input
                    type="text"
                    value={formData.vehicleRegistration}
                    onChange={(e) => handleChange('vehicleRegistration', e.target.value.toUpperCase())}
                    placeholder="e.g. KA 01 AB 1234"
                    className="form-input uppercase"
                  />
                </Field>
              )}
            </div>

            {/* Entry Temperature */}
            <Field label="Entry Temperature">
              <input
                type="text"
                value={formData.visitorInTemperature}
                onChange={(e) => handleChange('visitorInTemperature', e.target.value)}
                placeholder="e.g. 98.4°F or 37.0°C (optional)"
                className="form-input"
              />
            </Field>

            {/* Remarks */}
            <Field label="Remarks">
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Any additional details (optional)"
                rows={2}
                className="form-input resize-none"
              />
            </Field>

            {/* Submit */}
            <div className="pt-2 pb-4">
              <Button
                form="visit-form"
                type="submit"
                icon="ri-user-add-line"
                fullWidth
                disabled={!isFormValid(formData)}
              >
                Submit Walk-In
              </Button>
            </div>
          </section>

        </form>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ icon, title }: { icon: string; title: string; index?: number }) {
  return (
    <div className="flex items-center gap-3 -mx-1">
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10">
          <i className={`${icon} text-brand text-base`} />
        </div>
        <h2 className="text-base font-semibold text-text-primary tracking-tight">{title}</h2>
      </div>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide mb-2">{title}</p>
      <div className="rounded-xl border border-border divide-y divide-border-light overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-3 py-2.5">
      <span className="text-xs text-text-tertiary shrink-0">{label}</span>
      <span className="text-xs font-medium text-text-primary text-right break-words max-w-[60%]">{value}</span>
    </div>
  )
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-text-primary">
        {label}
        {required && <span className="text-rejected ml-0.5">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="text-xs text-text-tertiary mt-1">{hint}</p>}
    </label>
  )
}
