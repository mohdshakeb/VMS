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
import visitorPictureUrl from '@/assets/visitorPicture.png'
import logoBlackUrl from '@/assets/logoBlack.svg'
import {
  getPurposeLabel,
  getVisitTypeLabel,
  getBusinessSegmentLabel,
  getVisitorPriorityLabel,
  getDepartmentLabel,
  getLocalDateString,
  generateVisitId,
} from '@/utils/helpers'

// ── Constants ─────────────────────────────────────────────────────────────────

const ALL_PURPOSES: Purpose[] = ['official', 'personal', 'training', 'interview', 'delivery']
const BUSINESS_SEGMENTS: BusinessSegment[] = ['machines', 'engines', 'parts-purchased', 'service-inquiry', 'other']
const VISITOR_PRIORITIES: VisitorPriority[] = ['immediate', 'in-a-month', 'exploring']
const COMPANY_REQUIRED_TYPES: VisitType[] = ['vendor', 'contractor', 'customer', 'government-official']
const ID_PROOF_REQUIRED_TYPES: VisitType[] = ['cat-officials', 'vendor', 'contractor', 'customer', 'government-official', 'general-visitor', 'other']

const STEPS = [
  { label: 'Visitor', icon: 'ri-user-3-line', title: 'Visitor Details' },
  { label: 'Visit', icon: 'ri-calendar-check-line', title: 'Visit Details' },
  { label: 'Additional', icon: 'ri-file-list-3-line', title: 'Additional Info' },
]

// GMMCO mark path (40×40 viewBox)
const GMMCO_PATH = `M20.442 31.3571C19.4155 32.4319 18.3889 33.421 17.3177 34.3669C13.747 37.506 9.59615 39.312 4.82039 39.7419L4.69423 39.7533L4.68435 39.7542C3.3042 39.8789 1.96306 40 0.580233 40C0.0446335 40 0 40 0 39.441V27.702C0 27.4011 2.74023e-06 27.1862 0.446335 27.1C4.24016 26.4979 7.40913 24.7351 10.221 22.2411C12.6758 20.0482 14.5058 17.4252 15.6216 14.3291C15.64 14.2756 15.6606 14.222 15.6814 14.1678L15.6825 14.1649L15.6833 14.1629C15.7618 13.9571 15.8448 13.7397 15.8448 13.4692C15.6454 13.4052 15.4709 13.4127 15.2842 13.4207L15.284 13.4207C15.2199 13.4235 15.1544 13.4262 15.086 13.4262H3.92773H3.43677C3.12434 13.4262 2.99043 13.3403 3.03506 13.0391C3.11959 12.3466 3.16423 11.6152 3.20662 10.9184L3.2136 10.8032L3.88309 3.1924L4.1509 0.354497C4.1509 0.0533627 4.32943 -0.0326069 4.59723 0.0103766H4.99893H39.1878C39.4556 0.0103766 39.6787 0.0103784 39.9912 0.0533619C40.0268 0.466203 39.9483 0.879046 39.8697 1.29164L39.8697 1.29171C39.85 1.3949 39.8303 1.49808 39.8126 1.60127C39.3885 4.22419 38.9534 6.83637 38.5183 9.44855L38.5183 9.44875L38.4939 9.59481C38.0669 12.1584 37.6399 14.7221 37.2239 17.2962C36.8195 19.7695 36.4061 22.2427 35.992 24.7199L35.9649 24.8816C35.4732 27.8204 34.9808 30.7651 34.5013 33.7219L34.4217 34.2135L34.4192 34.2292C34.2228 35.4447 34.0223 36.6855 33.7871 37.8928L33.7831 37.9138C33.6979 38.3671 33.6899 38.4089 33.1623 38.4089H21.1113H21.1112C20.8627 38.4089 20.74 38.4089 20.6794 38.3474C20.6203 38.2874 20.6203 38.1692 20.6203 37.9359V37.9358V32.174C20.6203 32.122 20.6223 32.0718 20.6241 32.0221C20.6313 31.8241 20.638 31.6317 20.5313 31.3571H20.442Z`

// Staggered tile: mark (40×40) + equal spacing (40px) = 80px pitch.
// Two marks in one tile — second offset by (80, 80) — produces diagonal stagger on repeat.
const GMMCO_STAGGERED_SVG = `<svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="${GMMCO_PATH}" fill="#EB2128"/><path transform="translate(80 80)" d="${GMMCO_PATH}" fill="#EB2128"/></svg>`
const GMMCO_PATTERN_URI = `url("data:image/svg+xml,${encodeURIComponent(GMMCO_STAGGERED_SVG)}")`

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormData {
  firstName: string
  lastName: string
  mobile: string
  email: string
  purpose: Purpose | ''
  visitType: VisitType | ''
  company: string
  hostEmployeeId: string
  department: string
  scheduledDate: string
  scheduledTime: string
  duration: number | ''
  isDelegation: boolean
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

const MOBILE_REGEX = /^\+?[\d\s\-(). ]{7,20}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isMobileValid(mobile: string): boolean {
  return MOBILE_REGEX.test(mobile.trim())
}

function isEmailValid(email: string): boolean {
  return EMAIL_REGEX.test(email.trim())
}

function isStep1Valid(data: FormData): boolean {
  if (!data.firstName.trim() || !data.mobile.trim()) return false
  if (!isMobileValid(data.mobile)) return false
  if (data.email.trim() && !isEmailValid(data.email)) return false
  return true
}

function isStep2Valid(data: FormData): boolean {
  if (!data.purpose || !data.visitType || !data.hostEmployeeId) return false
  if (isCompanyRequired(data.visitType) && !data.company.trim()) return false
  return true
}

function isFormValid(data: FormData): boolean {
  return isStep1Valid(data) && isStep2Valid(data)
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
  const [currentStep, setCurrentStep] = useState(1)

  const [showPreview, setShowPreview] = useState(false)
  const [mobileTouched, setMobileTouched] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [patternOffset, setPatternOffset] = useState(0)

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

  function handleNext() {
    if (currentStep === 1 && isStep1Valid(formData)) setCurrentStep(2)
    else if (currentStep === 2 && isStep2Valid(formData)) setCurrentStep(3)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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

  // Suppress unused var warning — visitId is kept for visit creation parity
  void visitId

  return (
    <div className="flex flex-col h-full">

      {/* ── App Bar ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white border-b border-border shrink-0">
        <button
          type="button"
          onClick={() => navigate('/front-desk/dashboard')}
          className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors -ml-1 px-1 py-1 rounded-md"
        >
          <i className="ri-arrow-left-line text-lg" />
          <span className="font-medium">New Walk-in</span>
        </button>

        {/* Compact step indicator centred in the header */}
        <HeaderStepper currentStep={currentStep} />

        <button
          type="button"
          onClick={() => navigate('/front-desk/dashboard')}
          className="text-sm font-medium text-brand hover:opacity-75 transition-opacity px-1 py-1"
        >
          Cancel
        </button>
      </header>

      {/* ── Preview Modal ─────────────────────────────────────────────────────── */}
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
          <PreviewSection title="Visit Details">
            <PreviewRow label="Purpose" value={getPurposeLabel(formData.purpose as string)} />
            <PreviewRow label="Visitor Type" value={getVisitTypeLabel(formData.visitType as string)} />
            {formData.company.trim() && <PreviewRow label="Company" value={formData.company.trim()} />}
            <PreviewRow label="Host" value={selectedEmployee?.name ?? '—'} />
            {formData.department && <PreviewRow label="Department" value={getDepartmentLabel(formData.department)} />}
            {formData.duration !== '' && (
              <PreviewRow
                label="Duration"
                value={formData.duration >= 60 ? `${formData.duration / 60}h` : `${formData.duration}m`}
              />
            )}
          </PreviewSection>

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
                    label={`Group (+${delegates.filter((d) => d.name.trim()).length})`}
                    value={delegates.filter((d) => d.name.trim()).map((d) => d.name.trim()).join(', ')}
                  />
                )}
                {formData.notes.trim() && <PreviewRow label="Notes" value={formData.notes.trim()} />}
              </PreviewSection>
            )}
        </div>
      </Modal>

      {/* ── Full-width patterned background ──────────────────────────────────── */}
      <div
        className="flex-1 flex overflow-hidden min-h-0 relative"
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* Tiled GMMCO mark across the full area */}
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

        {/* ── Left branding content ────────────────────────────────────────── */}
        <div className="hidden md:flex flex-col w-[42%] shrink-0 relative z-10">

          {/* Logo — top-aligned with the form card (pt-12 matches card's top offset) */}
          <div className="pt-12 px-8">
            <img src={logoBlackUrl} alt="GMMCO — CKA Birla Group" className="h-7 w-auto" />
          </div>

          {/* Welcome headline — 48px below the logo */}
          <div className="px-8 mt-3">
            <h2 className="font-black text-[2.6rem] leading-[1.28] tracking-tight text-gray-800 uppercase">
              WE WELCOME<br />
              OUR <span className="text-brand">VISITORS &amp;</span><br />
              <span className="text-brand">GUESTS</span>
            </h2>
          </div>

          {/* Visitor picture — anchored to bottom-left */}
          <div className="mt-auto">
            <img
              src={visitorPictureUrl}
              alt="GMMCO visitors"
              className="w-full object-contain object-left-bottom max-h-[400px] block"
              draggable={false}
            />
          </div>
        </div>

        {/* ── Right: floating form card ─────────────────────────────────────── */}
        <div
          className="flex-1 flex flex-col p-12 relative z-10 overflow-y-auto"
          onScroll={(e) => setPatternOffset(e.currentTarget.scrollTop * -0.35)}
        >

          {/* White card with shadow — expands to content height */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80">

            {/* Section header */}
            <div className="px-[72px] pt-[72px] pb-4">
              <SectionHeader icon={STEPS[currentStep - 1].icon} title={STEPS[currentStep - 1].title} />
            </div>

            {/* Form content — no inner scroll */}
            <div>
              <form id="visit-form" onSubmit={handleSubmit} className="px-[72px] pb-[72px] space-y-4 w-full">

                {/* ── Step 1: Visitor Details ──────────────────────────────── */}
                {currentStep === 1 && (
                  <>
                    <Field label="Mobile Number" required>
                      <input
                        type="tel"
                        value={formData.mobile}
                        onChange={(e) => handleChange('mobile', e.target.value)}
                        onBlur={() => setMobileTouched(true)}
                        placeholder="+91 98765 43210"
                        className={`form-input ${mobileTouched && formData.mobile && !isMobileValid(formData.mobile) ? 'border-rejected focus:ring-rejected/20' : ''}`}
                        autoFocus
                      />
                      {mobileTouched && formData.mobile && !isMobileValid(formData.mobile) && (
                        <p className="text-xs text-rejected mt-1 flex items-center gap-1">
                          <i className="ri-error-warning-line" />
                          Enter a valid phone number
                        </p>
                      )}
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="First Name" required>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleChange('firstName', e.target.value)}
                          placeholder="First name"
                          className="form-input"
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

                    <Field label="Email">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        onBlur={() => setEmailTouched(true)}
                        placeholder="visitor@company.com"
                        className={`form-input ${emailTouched && formData.email && !isEmailValid(formData.email) ? 'border-rejected focus:ring-rejected/20' : ''}`}
                      />
                      {emailTouched && formData.email && !isEmailValid(formData.email) && (
                        <p className="text-xs text-rejected mt-1 flex items-center gap-1">
                          <i className="ri-error-warning-line" />
                          Enter a valid email address
                        </p>
                      )}
                    </Field>

                    <Field label="Visitor Photo">
                      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface hover:bg-surface-secondary hover:border-border transition-colors cursor-pointer py-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-border shadow-sm">
                          <i className="ri-camera-line text-xl text-brand" />
                        </div>
                        <p className="text-sm font-medium text-text-primary">Capture or upload photo</p>
                        <p className="text-xs text-text-tertiary">Camera · Gallery</p>
                      </div>
                    </Field>
                  </>
                )}

                {/* ── Step 2: Visit Details ────────────────────────────────── */}
                {currentStep === 2 && (
                  <>
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
                            className="form-input !pl-9"
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

                    <Field label="Department">
                      <div className={`form-input flex items-center gap-2 ${formData.department ? 'bg-surface-secondary text-text-secondary' : 'text-text-tertiary'}`}>
                        {formData.department
                          ? <><i className="ri-check-line text-xs text-confirmed" /><span className="text-sm">{getDepartmentLabel(formData.department)}</span></>
                          : <span className="text-sm">Auto-filled from host selection</span>
                        }
                      </div>
                    </Field>

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
                  </>
                )}

                {/* ── Step 3: Additional Info ──────────────────────────────── */}
                {currentStep === 3 && (
                  <div className="flex flex-col gap-6">

                    {/* ID Proof */}
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

                    {/* Customer Details */}
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

                    {/* Other */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">Other</p>

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

                      <Field label="Entry Temperature">
                        <input
                          type="text"
                          value={formData.visitorInTemperature}
                          onChange={(e) => handleChange('visitorInTemperature', e.target.value)}
                          placeholder="e.g. 98.4°F or 37.0°C (optional)"
                          className="form-input"
                        />
                      </Field>

                      <Field label="Remarks">
                        <textarea
                          value={formData.notes}
                          onChange={(e) => handleChange('notes', e.target.value)}
                          placeholder="Any additional details (optional)"
                          rows={2}
                          className="form-input resize-none"
                        />
                      </Field>
                    </div>
                  </div>
                )}

                {/* ── Navigation buttons ───────────────────────────────────── */}
                <div className="flex gap-3 pt-4 pb-2">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setCurrentStep((s) => s - 1)}
                    >
                      Back
                    </Button>
                  )}
                  {currentStep < 3 && (
                    <Button
                      type="button"
                      fullWidth
                      icon="ri-arrow-right-line"
                      disabled={currentStep === 1 ? !isStep1Valid(formData) : !isStep2Valid(formData)}
                      onClick={handleNext}
                    >
                      Continue
                    </Button>
                  )}
                  {currentStep === 3 && (
                    <Button
                      form="visit-form"
                      type="submit"
                      icon="ri-user-add-line"
                      fullWidth
                      disabled={!isFormValid(formData)}
                    >
                      Submit Walk-In
                    </Button>
                  )}
                </div>

              </form>
            </div>{/* /form content */}
          </div>{/* /white card */}
        </div>{/* /right column */}

      </div>{/* /patterned background */}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

// Compact stepper used in the app bar
function HeaderStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, index) => {
        const stepNum = index + 1
        const isCompleted = stepNum < currentStep
        const isActive = stepNum === currentStep
        const isLast = index === STEPS.length - 1

        return (
          <div key={step.label} className="flex items-center">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition-all duration-200 ${isCompleted
                  ? 'bg-brand text-white'
                  : isActive
                    ? 'bg-brand text-white'
                    : 'bg-transparent border border-border text-text-tertiary'
                  }`}
              >
                {isCompleted ? <i className="ri-check-line text-[10px]" /> : <span>{stepNum}</span>}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap leading-none transition-colors duration-200 ${isActive ? 'text-brand' : isCompleted ? 'text-text-secondary' : 'text-text-tertiary'
                }`}>
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {!isLast && (
              <div className={`w-20 h-px mx-2 mb-3.5 transition-colors duration-300 ${isCompleted ? 'bg-brand' : 'bg-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
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
