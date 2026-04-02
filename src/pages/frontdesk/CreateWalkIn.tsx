import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVisitStore } from '@/store/visitStore'
import { useAuthStore } from '@/store/authStore'
import { employees } from '@/data/employees'
import { locations } from '@/data/locations'
import { PURPOSE_BY_LOCATION, VISIT_TYPE_BY_PURPOSE } from '@/types/visit'
import type { Purpose, VisitType, BusinessSegment, VisitorPriority, Delegate } from '@/types/visit'
import Button from '@/components/Button'
import {
  getPurposeLabel,
  getVisitTypeLabel,
  getBusinessSegmentLabel,
  getVisitorPriorityLabel,
  getDepartmentLabel,
} from '@/utils/helpers'

// ── Types ─────────────────────────────────────────────────────────────────────

interface WizardFormData {
  // Step 1
  mobile: string
  visitorName: string
  email: string
  company: string
  // Step 2
  visitType: VisitType | ''
  purpose: Purpose | ''
  hostEmployeeId: string
  department: string
  scheduledDate: string
  scheduledTime: string
  duration: number | ''
  isDelegation: boolean
  // Step 3
  laptopDetails: string
  otherDeviceDetails: string
  photo: string
  photoIdProof: string
  idProofNumber: string
  businessSegment: BusinessSegment | ''
  priority: VisitorPriority | ''
  model: string
  businessSegmentRemarks: string
  notes: string
}

const ALL_PASS_TYPES: VisitType[] = [
  'visitor',
  'interview',
  'contractor',
  'vendor',
  'customer',
  'employee-visitor',
  'general-visitor',
  'government-official',
  'employee-other-branch',
  'cat-officials',
  'other',
]

const BUSINESS_SEGMENTS: BusinessSegment[] = ['machines', 'engines', 'parts-purchased', 'service-inquiry', 'other']
const VISITOR_PRIORITIES: VisitorPriority[] = ['immediate', 'in-a-month', 'exploring']
const DEPARTMENTS = ['admin', 'hr', 'it', 'accounts'] as const

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

function getCurrentTime(): string {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

const defaultFormData: WizardFormData = {
  mobile: '',
  visitorName: '',
  email: '',
  company: '',
  visitType: '',
  purpose: '',
  hostEmployeeId: '',
  department: '',
  scheduledDate: getTodayDate(),
  scheduledTime: getCurrentTime(),
  duration: '',
  isDelegation: false,
  laptopDetails: '',
  otherDeviceDetails: '',
  photo: '',
  photoIdProof: '',
  idProofNumber: '',
  businessSegment: '',
  priority: '',
  model: '',
  businessSegmentRemarks: '',
  notes: '',
}

// ── Validation ────────────────────────────────────────────────────────────────

function isStep1Valid(data: WizardFormData): boolean {
  return data.mobile.trim().length > 0 && data.visitorName.trim().length > 0
}

function isStep2Valid(data: WizardFormData, isEO: boolean): boolean {
  const hasHost = data.hostEmployeeId.length > 0
  const hasPassType = data.visitType !== ''
  const hasPurpose = !isEO || data.purpose !== ''
  return hasHost && hasPassType && hasPurpose
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CreateWalkIn() {
  const navigate = useNavigate()
  const createWalkIn = useVisitStore((s) => s.createWalkIn)
  const locationId = useAuthStore((s) => s.currentLocationId)
  const location = locations.find((l) => l.id === locationId)

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [formData, setFormData] = useState<WizardFormData>(defaultFormData)
  const [delegates, setDelegates] = useState<Delegate[]>([])

  // Employee search state
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isEO = location?.type === 'enterprise-office'
  const showCustomerBlock = formData.visitType === 'customer'

  const locationEmployees = employees.filter((e) => e.locationId === locationId)
  const filteredEmployees = locationEmployees.filter(
    (e) =>
      e.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      e.department.toLowerCase().includes(employeeSearch.toLowerCase())
  )
  const selectedEmployee = employees.find((e) => e.id === formData.hostEmployeeId)

  const availablePurposes = location ? PURPOSE_BY_LOCATION[location.type] : []

  // Reset pass type when purpose changes (EO only)
  useEffect(() => {
    if (isEO) {
      setFormData((prev) => ({ ...prev, visitType: '' }))
    }
  }, [formData.purpose]) // eslint-disable-line react-hooks/exhaustive-deps

  // Close employee dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowEmployeeDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleChange<K extends keyof WizardFormData>(field: K, value: WizardFormData[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleNext() {
    if (step === 1 && isStep1Valid(formData)) setStep(2)
    else if (step === 2 && isStep2Valid(formData, isEO)) setStep(3)
  }

  function handleBack() {
    if (step === 2) setStep(1)
    else if (step === 3) setStep(2)
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
    if (step !== 3) return
    if (!isStep1Valid(formData) || !isStep2Valid(formData, isEO)) return

    const resolvedPurpose: Purpose = isEO && formData.purpose
      ? (formData.purpose as Purpose)
      : formData.visitType === 'customer' ? 'customer' : 'other'

    createWalkIn({
      visitorName: formData.visitorName.trim(),
      visitorMobile: formData.mobile.trim(),
      visitorEmail: formData.email.trim() || undefined,
      visitorCompany: formData.company.trim() || undefined,
      hostEmployeeId: formData.hostEmployeeId,
      locationId,
      purpose: resolvedPurpose,
      visitType: formData.visitType as VisitType,
      department: formData.department || undefined,
      scheduledDate: formData.scheduledDate,
      scheduledTime: formData.scheduledTime,
      duration: formData.duration !== '' ? formData.duration : undefined,
      delegates: delegates.filter((d) => d.name.trim() && d.mobile.trim()),
      laptopDetails: formData.laptopDetails.trim() || undefined,
      otherDeviceDetails: formData.otherDeviceDetails.trim() || undefined,
      idProofNumber: formData.idProofNumber.trim() || undefined,
      businessSegment: (formData.businessSegment as BusinessSegment) || undefined,
      priority: (formData.priority as VisitorPriority) || undefined,
      model: formData.model.trim() || undefined,
      businessSegmentRemarks: formData.businessSegmentRemarks.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    })

    // Auto-set employee to the host so demo flows naturally
    useAuthStore.getState().setCurrentEmployee(formData.hostEmployeeId)
    navigate('/front-desk/dashboard')
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

      {/* ── Scrollable Content ─────────────────────────────────────────────── */}
      <div className="flex-1 px-4 md:px-6 py-5 max-w-lg mx-auto w-full">
        {/* Step Indicator */}
        <StepIndicator step={step} />

        <form id="visit-form" onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* ── Step 1: Visitor Identity ───────────────────────────────────── */}
        {step === 1 && (
          <>
            <Field label="Mobile Number" required>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => handleChange('mobile', e.target.value)}
                placeholder="+91 98410 12345"
                className="form-input"
                autoFocus
              />
            </Field>

            <Field label="Visitor Name" required>
              <input
                type="text"
                value={formData.visitorName}
                onChange={(e) => handleChange('visitorName', e.target.value)}
                placeholder="Full name"
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

            <Field label="Visitor Company">
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                placeholder="Organization name"
                className="form-input"
              />
            </Field>
          </>
        )}

        {/* ── Step 2: Visit Details ──────────────────────────────────────── */}
        {step === 2 && (
          <>
            {/* Purpose — EO only, shown first so Pass Type can be filtered */}
            {isEO && (
              <Field label="Purpose" required>
                <select
                  value={formData.purpose}
                  onChange={(e) => handleChange('purpose', e.target.value as Purpose)}
                  className="form-input"
                >
                  <option value="">Select purpose</option>
                  {availablePurposes.map((p) => (
                    <option key={p} value={p}>{getPurposeLabel(p)}</option>
                  ))}
                </select>
              </Field>
            )}

            {/* Pass Type — filtered by purpose on EO, full list on Branch */}
            <Field label="Pass Type" required>
              <select
                value={formData.visitType}
                onChange={(e) => handleChange('visitType', e.target.value as VisitType)}
                disabled={isEO && !formData.purpose}
                className="form-input disabled:opacity-50"
              >
                <option value="">
                  {isEO && !formData.purpose ? 'Select purpose first' : 'Select pass type'}
                </option>
                {(isEO && formData.purpose
                  ? VISIT_TYPE_BY_PURPOSE[formData.purpose as Purpose] ?? []
                  : ALL_PASS_TYPES
                ).map((vt) => (
                  <option key={vt} value={vt}>{getVisitTypeLabel(vt)}</option>
                ))}
              </select>
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

            {/* Department */}
            <Field label="Department">
              <select
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                className="form-input"
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{getDepartmentLabel(d)}</option>
                ))}
              </select>
            </Field>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date">
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => handleChange('scheduledDate', e.target.value)}
                  className="form-input"
                />
              </Field>
              <Field label="Time">
                <input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => handleChange('scheduledTime', e.target.value)}
                  className="form-input"
                />
              </Field>
            </div>

            {/* Duration */}
            <Field label="Duration">
              <select
                value={formData.duration}
                onChange={(e) => handleChange('duration', e.target.value === '' ? '' : Number(e.target.value))}
                className="form-input"
              >
                <option value="">Select duration</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
                <option value={180}>3 hours</option>
                <option value={240}>Half day (4 hrs)</option>
                <option value={480}>Full day (8 hrs)</option>
              </select>
            </Field>

            {/* Delegation */}
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
                    Primary visitor details are captured in this form. Add additional delegates below.
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
          </>
        )}

        {/* ── Step 3: Additional Info ────────────────────────────────────── */}
        {step === 3 && (
          <>
            {/* Customer block — any location if pass type is Customer */}
            {showCustomerBlock && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-border">
                  <i className="ri-building-2-line text-brand text-sm" />
                  <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Customer Details</span>
                </div>

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

            {/* Device & Security */}
            <div className="space-y-4">
              {showCustomerBlock && (
                <div className="flex items-center gap-2 pb-1 border-b border-border">
                  <i className="ri-shield-check-line text-brand text-sm" />
                  <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Security & Devices</span>
                </div>
              )}

              <Field label="Laptop Details">
                <textarea
                  value={formData.laptopDetails}
                  onChange={(e) => handleChange('laptopDetails', e.target.value)}
                  placeholder="Brand, model, serial number (if any)"
                  rows={2}
                  className="form-input resize-none"
                />
              </Field>

              <Field label="Other Device Details">
                <textarea
                  value={formData.otherDeviceDetails}
                  onChange={(e) => handleChange('otherDeviceDetails', e.target.value)}
                  placeholder="Tablets, cameras, hard drives, etc."
                  rows={2}
                  className="form-input resize-none"
                />
              </Field>
            </div>

            {/* ID Proof */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-border">
                <i className="ri-id-card-line text-brand text-sm" />
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Identity</span>
              </div>

              <Field label="Photo ID Proof">
                <select
                  value={formData.photoIdProof}
                  onChange={(e) => handleChange('photoIdProof', e.target.value)}
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

              {/* ID Proof Number — EO only */}
              {isEO && (
                <Field label="ID Proof Number">
                  <input
                    type="text"
                    value={formData.idProofNumber}
                    onChange={(e) => handleChange('idProofNumber', e.target.value)}
                    placeholder="e.g. XXXX XXXX XXXX"
                    className="form-input"
                  />
                </Field>
              )}

              {/* Photo — placeholder for prototype */}
              <Field label="Visitor Photo">
                <div className="form-input flex items-center gap-3 cursor-pointer bg-surface-secondary hover:bg-surface-tertiary transition-colors">
                  <i className="ri-camera-line text-text-tertiary" />
                  <span className="text-sm text-text-tertiary">Tap to capture or upload photo</span>
                </div>
              </Field>
            </div>

            {/* Notes */}
            <Field label="Notes">
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Any additional details (optional)"
                rows={2}
                className="form-input resize-none"
              />
            </Field>
          </>
        )}

      </form>
      </div>{/* end scrollable content */}

      {/* ── Sticky Footer Navigation ───────────────────────────────────────── */}
      <footer className="sticky bottom-0 bg-white border-t border-border px-4 py-3 shrink-0">
        {step === 1 ? (
          <div className="flex justify-end">
            <Button
              type="button"
              disabled={!isStep1Valid(formData)}
              onClick={handleNext}
              iconRight="ri-arrow-right-line"
            >
              Next
            </Button>
          </div>
        ) : step === 2 ? (
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={handleBack}>
              Back
            </Button>
            <Button
              key="next-btn"
              type="button"
              disabled={!isStep2Valid(formData, isEO)}
              onClick={handleNext}
              iconRight="ri-arrow-right-line"
            >
              Next
            </Button>
          </div>
        ) : (
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={handleBack}>
              Back
            </Button>
            <Button key="submit-btn" form="visit-form" type="submit" icon="ri-user-add-line">
              Submit Walk-In
            </Button>
          </div>
        )}
      </footer>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { num: 1, label: 'Visitor' },
    { num: 2, label: 'Visit' },
    { num: 3, label: 'Details' },
  ]

  return (
    <div className="flex items-center">
      {steps.map((s, idx) => {
        const isCompleted = step > s.num
        const isActive = step === s.num

        return (
          <div key={s.num} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                  isCompleted
                    ? 'bg-confirmed text-white'
                    : isActive
                    ? 'bg-brand text-white'
                    : 'bg-surface-tertiary text-text-tertiary',
                ].join(' ')}
              >
                {isCompleted ? <i className="ri-check-line text-xs" /> : s.num}
              </div>
              <span
                className={[
                  'text-xs whitespace-nowrap',
                  isActive ? 'text-text-primary font-medium' : 'text-text-tertiary',
                ].join(' ')}
              >
                {s.label}
              </span>
            </div>

            {idx < steps.length - 1 && (
              <div
                className={[
                  'flex-1 h-px mx-2 mb-4 transition-colors',
                  step > s.num ? 'bg-confirmed' : 'bg-border',
                ].join(' ')}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-text-primary">
        {label}
        {required && <span className="text-rejected ml-0.5">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  )
}
