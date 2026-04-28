// ─────────────────────────────────────────────────────────────────────────────
// Create Walk-in — Mobile (Android screen)
// Branding block stacked above the form card. Less padding, less outer margin.
// Parallax pattern background retained. No responsive prefixes.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVisitStore } from '@/store/visitStore'
import { useAuthStore } from '@/store/authStore'
import { employees } from '@/data/employees'
import { VISIT_TYPE_BY_PURPOSE } from '@/types/visit'
import type { Purpose, VisitType, BusinessSegment, VisitorPriority } from '@/types/visit'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import SectionDivider from '@/components/Mobile/SectionDivider'
import MobilePageHeader from '@/components/Mobile/MobilePageHeader'
import FormField from '@/components/common/FormField'
import SearchAutocomplete from '@/components/common/SearchAutocomplete'
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
  formatDate,
  formatTime,
} from '@/utils/helpers'

// ── Constants ─────────────────────────────────────────────────────────────────

const ALL_PURPOSES: Purpose[] = ['official', 'personal', 'training', 'interview', 'delivery']
const BUSINESS_SEGMENTS: BusinessSegment[] = ['machines', 'engines', 'parts-purchased', 'service-inquiry', 'other']
const VISITOR_PRIORITIES: VisitorPriority[] = ['immediate', 'in-a-month', 'exploring']
const COMPANY_REQUIRED_TYPES: VisitType[] = ['vendor', 'contractor']

const STEPS = [
  { label: 'Visitor', icon: 'ri-user-3-line', title: 'Visitor Details' },
  { label: 'Visit', icon: 'ri-calendar-check-line', title: 'Visit Details' },
  { label: 'Additional', icon: 'ri-file-list-3-line', title: 'Additional Info' },
]

const GMMCO_PATH = `M20.442 31.3571C19.4155 32.4319 18.3889 33.421 17.3177 34.3669C13.747 37.506 9.59615 39.312 4.82039 39.7419L4.69423 39.7533L4.68435 39.7542C3.3042 39.8789 1.96306 40 0.580233 40C0.0446335 40 0 40 0 39.441V27.702C0 27.4011 2.74023e-06 27.1862 0.446335 27.1C4.24016 26.4979 7.40913 24.7351 10.221 22.2411C12.6758 20.0482 14.5058 17.4252 15.6216 14.3291C15.64 14.2756 15.6606 14.222 15.6814 14.1678L15.6825 14.1649L15.6833 14.1629C15.7618 13.9571 15.8448 13.7397 15.8448 13.4692C15.6454 13.4052 15.4709 13.4127 15.2842 13.4207L15.284 13.4207C15.2199 13.4235 15.1544 13.4262 15.086 13.4262H3.92773H3.43677C3.12434 13.4262 2.99043 13.3403 3.03506 13.0391C3.11959 12.3466 3.16423 11.6152 3.20662 10.9184L3.2136 10.8032L3.88309 3.1924L4.1509 0.354497C4.1509 0.0533627 4.32943 -0.0326069 4.59723 0.0103766H4.99893H39.1878C39.4556 0.0103766 39.6787 0.0103784 39.9912 0.0533619C40.0268 0.466203 39.9483 0.879046 39.8697 1.29164L39.8697 1.29171C39.85 1.3949 39.8303 1.49808 39.8126 1.60127C39.3885 4.22419 38.9534 6.83637 38.5183 9.44855L38.5183 9.44875L38.4939 9.59481C38.0669 12.1584 37.6399 14.7221 37.2239 17.2962C36.8195 19.7695 36.4061 22.2427 35.992 24.7199L35.9649 24.8816C35.4732 27.8204 34.9808 30.7651 34.5013 33.7219L34.4217 34.2135L34.4192 34.2292C34.2228 35.4447 34.0223 36.6855 33.7871 37.8928L33.7831 37.9138C33.6979 38.3671 33.6899 38.4089 33.1623 38.4089H21.1113H21.1112C20.8627 38.4089 20.74 38.4089 20.6794 38.3474C20.6203 38.2874 20.6203 38.1692 20.6203 37.9359V37.9358V32.174C20.6203 32.122 20.6223 32.0718 20.6241 32.0221C20.6313 31.8241 20.638 31.6317 20.5313 31.3571H20.442Z`
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
  isMultiDay: boolean
  endDate: string
  duration: number | ''
  guestWifi: boolean
  photo: string
  businessSegment: BusinessSegment | ''
  priority: VisitorPriority | ''
  model: string
  businessSegmentRemarks: string
  notes: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isCompanyRequired(visitType: VisitType | ''): boolean {
  return COMPANY_REQUIRED_TYPES.includes(visitType as VisitType)
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
  if (!data.firstName.trim() || !data.lastName.trim() || !data.mobile.trim()) return false
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
  isMultiDay: false,
  endDate: '',
  duration: '',
  guestWifi: false,
  photo: '',
  businessSegment: '',
  priority: '',
  model: '',
  businessSegmentRemarks: '',
  notes: '',
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CreateWalkInMobile() {
  const navigate = useNavigate()
  const createWalkIn = useVisitStore((s) => s.createWalkIn)
  const locationId = useAuthStore((s) => s.currentLocationId)

  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [visitId] = useState(() => generateVisitId())
  const [currentStep, setCurrentStep] = useState(1)

  const [showPreview, setShowPreview] = useState(false)
  const [successData, setSuccessData] = useState<{ name: string; company?: string; date: string; time: string; visitId: string } | null>(null)
  const [mobileTouched, setMobileTouched] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [firstNameTouched, setFirstNameTouched] = useState(false)
  const [lastNameTouched, setLastNameTouched] = useState(false)
  const [purposeTouched, setPurposeTouched] = useState(false)
  const [visitTypeTouched, setVisitTypeTouched] = useState(false)
  const [companyTouched, setCompanyTouched] = useState(false)
  const [hostTouched, setHostTouched] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [patternOffset, setPatternOffset] = useState(0)

  const showCustomerBlock = formData.visitType === 'customer'
  const companyRequired = isCompanyRequired(formData.visitType)

  const locationEmployees = employees.filter((e) => e.locationId === locationId)
  const selectedEmployee = employees.find((e) => e.id === formData.hostEmployeeId)
  const availableVisitTypes = formData.purpose
    ? (VISIT_TYPE_BY_PURPOSE[formData.purpose as Purpose] ?? [])
    : []

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => handleChange('photo', reader.result as string)
    reader.readAsDataURL(file)
  }

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

  function handleNext() {
    if (currentStep === 1) {
      if (isStep1Valid(formData)) {
        setCurrentStep(2)
      } else {
        setMobileTouched(true)
        setFirstNameTouched(true)
        setLastNameTouched(true)
      }
    } else if (currentStep === 2) {
      if (isStep2Valid(formData)) {
        setCurrentStep(3)
      } else {
        setPurposeTouched(true)
        setVisitTypeTouched(true)
        setCompanyTouched(true)
        setHostTouched(true)
      }
    }
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
      isMultiDay: formData.isMultiDay || undefined,
      endDate: formData.isMultiDay ? formData.endDate || undefined : undefined,
      duration: formData.duration !== '' ? formData.duration : undefined,
      guestWifi: formData.guestWifi || undefined,
      businessSegment: (formData.businessSegment as BusinessSegment) || undefined,
      priority: (formData.priority as VisitorPriority) || undefined,
      model: formData.model.trim() || undefined,
      businessSegmentRemarks: formData.businessSegmentRemarks.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      visitorAvatar: formData.photo || undefined,
    })

    useAuthStore.getState().setCurrentEmployee(formData.hostEmployeeId)
    setShowPreview(false)
    setSuccessData({
      name: visitorName,
      company: formData.company.trim() || undefined,
      date: formatDate(formData.scheduledDate),
      time: formatTime(formData.scheduledTime),
      visitId: newVisit.id,
    })
  }

  void visitId

  return (
    <>
    <div className="md:hidden h-full relative" style={{ backgroundColor: '#ffffff' }}>

      {/* Tiled GMMCO mark — absolute on root, same as desktop */}
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

      {/* ── Card: fills full area ─────────────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden flex flex-col">

        {/* ── App Bar — pinned at top of card ──────────────────────────────── */}
        <MobilePageHeader
          title="New Walk-in"
          onBack={() => navigate('/front-desk/dashboard')}
          onCancel={() => navigate('/front-desk/dashboard')}
        >
          <HeaderStepper currentStep={currentStep} />
        </MobilePageHeader>

      {/* ── Success Modal ─────────────────────────────────────────────────────── */}
      {successData && (
        <Modal open onClose={() => navigate('/front-desk/dashboard', { state: { newVisitId: successData.visitId } })} size="md">
          <div className="animate-in py-4 flex flex-col items-center text-center gap-5">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-confirmed-surface)' }}
            >
              <i className="ri-checkbox-circle-fill text-4xl" style={{ color: 'var(--color-confirmed)' }} />
            </div>
            <div>
              <p className="text-base font-semibold text-text-primary">Visitor Walk-In Request Submitted Successfully</p>
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
                <p className="text-[10px] text-text-tertiary">Date</p>
                <p className="text-sm font-semibold text-text-primary">{successData.date}</p>
              </div>
              <div
                className="rounded-xl p-3 text-left vms-stagger-item"
                style={{ backgroundColor: 'var(--color-surface-secondary)', animationDelay: '120ms' }}
              >
                <p className="text-[10px] text-text-tertiary">Time</p>
                <p className="text-sm font-semibold text-text-primary">{successData.time}</p>
              </div>
            </div>
            <Button fullWidth onClick={() => navigate('/front-desk/dashboard', { state: { newVisitId: successData.visitId } })}>
              Done
            </Button>
          </div>
        </Modal>
      )}

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
          {formData.photo ? (
            <img src={formData.photo} alt="Visitor" className="h-11 w-11 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand font-semibold text-base select-none">
              {[formData.firstName[0], formData.lastName[0]].filter(Boolean).join('').toUpperCase() || '?'}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">
              {[formData.firstName.trim(), formData.lastName.trim()].filter(Boolean).join(' ')}
            </p>
            <p className="text-xs text-text-secondary truncate">{formData.mobile}</p>
          </div>
          <span className="ml-auto shrink-0 rounded-full bg-pending-surface px-2.5 py-0.5 text-[11px] font-medium text-pending">
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
            <PreviewRow label="Date" value={formatDate(formData.scheduledDate)} />
            <PreviewRow label="Time" value={formatTime(formData.scheduledTime)} />
            {formData.duration !== '' && (
              <PreviewRow
                label="Duration"
                value={formData.duration >= 60 ? `${formData.duration / 60}h` : `${formData.duration}m`}
              />
            )}
          </PreviewSection>

          {(formData.email.trim() || formData.guestWifi || formData.isMultiDay || formData.notes.trim()) && (
            <PreviewSection title="Additional Info">
              {formData.email.trim() && <PreviewRow label="Email" value={formData.email.trim()} />}
              {formData.guestWifi && <PreviewRow label="Guest WiFi" value="Requested" />}
              {formData.isMultiDay && formData.endDate && (
                <PreviewRow label="Multi-Day Until" value={formData.endDate} />
              )}
              {formData.notes.trim() && <PreviewRow label="Remarks" value={formData.notes.trim()} />}
            </PreviewSection>
          )}
        </div>
      </Modal>

        {/* ── Scrollable content ────────────────────────────────────────────── */}
        <div
          className="flex-1 overflow-y-auto"
          onScroll={(e) => setPatternOffset(e.currentTarget.scrollTop * -0.35)}
        >

          {/* ── Logo ────────────────────────────────────────────────────────── */}
          <div className="px-5 pt-5">
            <img src={logoBlackUrl} alt="GMMCO — CKA Birla Group" className="h-5 w-auto" />
          </div>

          {/* ── Headline ────────────────────────────────────────────────────── */}
          <div className="px-5 mt-3">
            <h2 className="font-black text-[1.7rem] leading-[1.25] tracking-tight text-gray-800 uppercase">
              WE WELCOME<br />
              OUR <span className="text-brand">VISITORS &amp;</span><br />
              <span className="text-brand">GUESTS</span>
            </h2>
          </div>

          {/* ── Visitor image — sits just above the form ────────────────────── */}
          <img
            src={visitorPictureUrl}
            alt="GMMCO visitors"
            className="w-full max-h-[160px] object-contain object-bottom block mt-3"
            draggable={false}
          />

          {/* ── Form section ────────────────────────────────────────────────── */}
          <div className="relative bg-white border-t border-border">

            {/* Section header */}
            <div className="px-5 pt-5 pb-3">
              <SectionDivider icon={STEPS[currentStep - 1].icon} title={STEPS[currentStep - 1].title} />
            </div>

            {/* Form content */}
            <form id="visit-form-mobile" onSubmit={handleSubmit} className="px-5 pb-6 space-y-4">

              {/* ── Step 1: Visitor Details ────────────────────────────────── */}
              {currentStep === 1 && (
                <>
                  <FormField
                    label="Mobile Number"
                    required
                    error={
                      mobileTouched && !formData.mobile.trim()
                        ? 'Mobile number is required'
                        : mobileTouched && formData.mobile.trim() && !isMobileValid(formData.mobile)
                        ? 'Enter a valid phone number'
                        : undefined
                    }
                  >
                    <input
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => handleChange('mobile', e.target.value)}
                      onBlur={() => setMobileTouched(true)}
                      placeholder="+91 98765 43210"
                      className={`form-input ${mobileTouched && (!formData.mobile.trim() || !isMobileValid(formData.mobile)) ? 'border-rejected focus:ring-rejected/20' : ''}`}
                      autoFocus
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="First Name" required error={firstNameTouched && !formData.firstName.trim() ? 'Enter first name' : undefined}>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        onBlur={() => setFirstNameTouched(true)}
                        placeholder="First name"
                        className={`form-input ${firstNameTouched && !formData.firstName.trim() ? 'border-rejected focus:ring-rejected/20' : ''}`}
                      />
                    </FormField>
                    <FormField label="Last Name" required error={lastNameTouched && !formData.lastName.trim() ? 'Enter last name' : undefined}>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        onBlur={() => setLastNameTouched(true)}
                        placeholder="Last name"
                        className={`form-input ${lastNameTouched && !formData.lastName.trim() ? 'border-rejected focus:ring-rejected/20' : ''}`}
                      />
                    </FormField>
                  </div>

                  <FormField
                    label="Email"
                    error={emailTouched && formData.email && !isEmailValid(formData.email) ? 'Enter a valid email address' : undefined}
                  >
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => setEmailTouched(true)}
                      placeholder="visitor@company.com"
                      className={`form-input ${emailTouched && formData.email && !isEmailValid(formData.email) ? 'border-rejected focus:ring-rejected/20' : ''}`}
                    />
                  </FormField>

                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoSelect}
                  />
                  <FormField label="Visitor Photo">
                    {formData.photo ? (
                      <div
                        className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface cursor-pointer py-4"
                        onClick={() => photoInputRef.current?.click()}
                      >
                        <img src={formData.photo} alt="Visitor" className="h-20 w-20 rounded-full object-cover shadow-sm" />
                        <p className="text-xs text-text-secondary">Tap to change</p>
                      </div>
                    ) : (
                      <div
                        className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface hover:bg-surface-secondary transition-colors cursor-pointer py-7"
                        onClick={() => photoInputRef.current?.click()}
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-border shadow-sm">
                          <i className="ri-camera-line text-xl text-brand" />
                        </div>
                        <p className="text-sm font-medium text-text-primary">Capture or upload photo</p>
                        <p className="text-xs text-text-tertiary">Camera · Gallery</p>
                      </div>
                    )}
                  </FormField>
                </>
              )}

              {/* ── Step 2: Visit Details ──────────────────────────────────── */}
              {currentStep === 2 && (
                <>
                  <FormField label="Purpose of Visit" required error={purposeTouched && !formData.purpose ? 'Select a purpose' : undefined}>
                    <select
                      value={formData.purpose}
                      onChange={(e) => handleChange('purpose', e.target.value as Purpose)}
                      onBlur={() => setPurposeTouched(true)}
                      className={`form-input ${purposeTouched && !formData.purpose ? 'border-rejected focus:ring-rejected/20' : ''}`}
                    >
                      <option value="">Select purpose</option>
                      {ALL_PURPOSES.map((p) => (
                        <option key={p} value={p}>{getPurposeLabel(p)}</option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Visitor Type" required error={visitTypeTouched && !formData.visitType ? 'Select a visitor type' : undefined}>
                    <select
                      value={formData.visitType}
                      onChange={(e) => handleChange('visitType', e.target.value as VisitType)}
                      onBlur={() => setVisitTypeTouched(true)}
                      disabled={!formData.purpose}
                      className={`form-input disabled:opacity-50 ${visitTypeTouched && !formData.visitType ? 'border-rejected focus:ring-rejected/20' : ''}`}
                    >
                      <option value="">
                        {!formData.purpose ? 'Select purpose first' : 'Select visitor type'}
                      </option>
                      {availableVisitTypes.map((vt) => (
                        <option key={vt} value={vt}>{getVisitTypeLabel(vt)}</option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Visitor Company" required={companyRequired} error={companyTouched && companyRequired && !formData.company.trim() ? 'Enter company name' : undefined}>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleChange('company', e.target.value)}
                      onBlur={() => setCompanyTouched(true)}
                      placeholder={companyRequired ? 'Required for this visitor type' : 'Organization name (optional)'}
                      className={`form-input ${companyTouched && companyRequired && !formData.company.trim() ? 'border-rejected focus:ring-rejected/20' : ''}`}
                    />
                  </FormField>

                  <FormField label="Whom to Meet" required error={hostTouched && !formData.hostEmployeeId ? 'Select a person to meet' : undefined}>
                    <div
                      onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) setHostTouched(true)
                      }}
                    >
                    <SearchAutocomplete
                      items={locationEmployees}
                      selectedId={formData.hostEmployeeId}
                      onSelect={(id) => handleChange('hostEmployeeId', id)}
                      getLabel={(emp) => emp.name}
                      getSubLabel={(emp) => emp.department}
                      filterFn={(emp, search) =>
                        emp.name.toLowerCase().includes(search.toLowerCase()) ||
                        emp.department.toLowerCase().includes(search.toLowerCase())
                      }
                      placeholder="Search by name or department"
                      emptyMessage="No employees found"
                    />
                    </div>
                  </FormField>

                  <FormField label="Department">
                    <div className={`form-input flex items-center gap-2 ${formData.department ? 'bg-surface-secondary text-text-secondary' : 'text-text-tertiary'}`}>
                      {formData.department
                        ? <><i className="ri-check-line text-xs text-confirmed" /><span className="text-sm">{getDepartmentLabel(formData.department)}</span></>
                        : <span className="text-sm">Auto-filled from host selection</span>
                      }
                    </div>
                  </FormField>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Date" required>
                      <input
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) => handleChange('scheduledDate', e.target.value)}
                        className="form-input"
                      />
                    </FormField>
                    <FormField label="Time" required>
                      <input
                        type="time"
                        value={formData.scheduledTime}
                        onChange={(e) => handleChange('scheduledTime', e.target.value)}
                        className="form-input"
                      />
                    </FormField>
                  </div>

                  <div className="rounded-lg border border-border p-3 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isMultiDay}
                        onChange={(e) => handleChange('isMultiDay', e.target.checked)}
                        className="w-4 h-4 rounded border-border accent-brand"
                      />
                      <div>
                        <span className="text-sm font-medium text-text-primary">Multi-day visit</span>
                        <p className="text-xs text-text-secondary">Specify an end date for extended stays</p>
                      </div>
                    </label>
                    {formData.isMultiDay && (
                      <FormField label="End Date">
                        <input
                          type="date"
                          value={formData.endDate}
                          min={formData.scheduledDate}
                          onChange={(e) => handleChange('endDate', e.target.value)}
                          className="form-input"
                        />
                      </FormField>
                    )}
                  </div>

                  <FormField label="Duration">
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
                  </FormField>

                  <div className="rounded-lg border border-border p-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.guestWifi}
                        onChange={(e) => handleChange('guestWifi', e.target.checked)}
                        className="w-4 h-4 rounded border-border accent-brand"
                      />
                      <div>
                        <span className="text-sm font-medium text-text-primary">Guest WiFi Access</span>
                        <p className="text-xs text-text-secondary">Visitor requires temporary WiFi credentials</p>
                      </div>
                    </label>
                  </div>

                </>
              )}

              {/* ── Step 3: Additional Info ────────────────────────────────── */}
              {currentStep === 3 && (
                <div className="flex flex-col gap-5">

                  {/* Customer Details — only for customer visitor type */}
                  {showCustomerBlock && (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">Customer Details</p>

                      <FormField label="Business Segment">
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
                      </FormField>

                      <FormField label="Priority">
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
                      </FormField>

                      <FormField label="Model">
                        <input
                          type="text"
                          value={formData.model}
                          onChange={(e) => handleChange('model', e.target.value)}
                          placeholder="e.g. GCI - CAT EX - 336"
                          className="form-input"
                        />
                      </FormField>

                      <FormField label="Business Segment Remarks">
                        <textarea
                          value={formData.businessSegmentRemarks}
                          onChange={(e) => handleChange('businessSegmentRemarks', e.target.value)}
                          placeholder="Additional context about the business inquiry"
                          rows={2}
                          className="form-input resize-none"
                        />
                      </FormField>
                    </div>
                  )}

                  {/* Remarks */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">Notes</p>
                    <FormField label="Remarks">
                      <textarea
                        value={formData.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        placeholder="Any additional details (optional)"
                        rows={3}
                        className="form-input resize-none"
                      />
                    </FormField>
                  </div>

                  {!showCustomerBlock && (
                    <p className="text-xs text-text-tertiary text-center py-2">
                      ID proof, devices, and vehicle details will be captured at check-in.
                    </p>
                  )}
                </div>
              )}

              {/* ── Navigation buttons ─────────────────────────────────────── */}
              <div className="flex gap-3 pt-3 pb-1">
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
                    onClick={handleNext}
                  >
                    Continue
                  </Button>
                )}
                {currentStep === 3 && (
                  <Button
                    form="visit-form-mobile"
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
          </div>{/* /form section */}
        </div>{/* /scrollable */}
      </div>{/* /card */}
    </div>{/* /root */}
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

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

            {!isLast && (
              <div className={`w-10 h-px mx-1.5 mb-3.5 transition-colors duration-300 ${isCompleted ? 'bg-brand' : 'bg-border'}`} />
            )}
          </div>
        )
      })}
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
      <span className="text-xs text-text-secondary shrink-0">{label}</span>
      <span className="text-xs font-medium text-text-primary text-right break-words max-w-[60%]">{value}</span>
    </div>
  )
}
