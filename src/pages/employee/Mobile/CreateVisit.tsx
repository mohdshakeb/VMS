// ─────────────────────────────────────────────────────────────────────────────
// Create Visit — Mobile (Employee)
// Mirrors the visual structure of frontdesk/Mobile/CreateWalkIn.tsx:
// brand pattern bg → logo → headline → visitor image → form card.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVisitStore } from '@/store/visitStore'
import { useAuthStore } from '@/store/authStore'
import { employees } from '@/data/employees'
import { VISIT_TYPE_BY_PURPOSE } from '@/types/visit'
import type { Purpose, VisitType, BusinessSegment, VisitorPriority } from '@/types/visit'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import MobilePageHeader from '@/components/Mobile/MobilePageHeader'
import SectionDivider from '@/components/Mobile/SectionDivider'
import FormField from '@/components/common/FormField'
import visitorPictureUrl from '@/assets/visitorPicture.png'
import logoBlackUrl from '@/assets/logoBlack.svg'
import {
  getPurposeLabel,
  getVisitTypeLabel,
  getBusinessSegmentLabel,
  getVisitorPriorityLabel,
  getDepartmentLabel,
  formatDate,
  formatTime,
} from '@/utils/helpers'
import {
  type FormData,
  ALL_PURPOSES,
  BUSINESS_SEGMENTS,
  VISITOR_PRIORITIES,
  VISIT_FORM_STEPS,
  GMMCO_PATTERN_URI,
  isCompanyRequired,
  isMobileValid,
  isEmailValid,
  isStep1Valid,
  isStep2Valid,
  isFormValid,
  defaultFormData,
  PreviewSection,
  PreviewRow,
} from '@/components/visit-form/VisitFormShared'

export default function CreateVisitMobile() {
  const navigate = useNavigate()
  const createEmployeeVisit = useVisitStore((s) => s.createEmployeeVisit)
  const { currentEmployeeId, currentLocationId } = useAuthStore()

  const currentEmployee = employees.find((e) => e.id === currentEmployeeId)

  const [formData, setFormData] = useState<FormData>(() => ({
    ...defaultFormData,
    hostEmployeeId: currentEmployeeId,
    department: currentEmployee?.department ?? '',
  }))
  const [currentStep, setCurrentStep] = useState(1)
  const [showPreview, setShowPreview] = useState(false)
  const [successData, setSuccessData] = useState<{ name: string; company?: string; date: string; time: string } | null>(null)
  const [patternOffset, setPatternOffset] = useState(0)

  const [mobileTouched, setMobileTouched] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [firstNameTouched, setFirstNameTouched] = useState(false)
  const [lastNameTouched, setLastNameTouched] = useState(false)
  const [purposeTouched, setPurposeTouched] = useState(false)
  const [visitTypeTouched, setVisitTypeTouched] = useState(false)
  const [companyTouched, setCompanyTouched] = useState(false)

  const photoInputRef = useRef<HTMLInputElement>(null)

  const showCustomerBlock = formData.visitType === 'customer'
  const companyRequired = isCompanyRequired(formData.visitType)
  const availableVisitTypes = formData.purpose
    ? (VISIT_TYPE_BY_PURPOSE[formData.purpose as Purpose] ?? [])
    : []

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      hostEmployeeId: currentEmployeeId,
      department: currentEmployee?.department ?? prev.department,
    }))
  }, [currentEmployeeId, currentEmployee?.department])

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

    createEmployeeVisit({
      visitorName,
      visitorMobile: formData.mobile.trim(),
      visitorEmail: formData.email.trim() || undefined,
      visitorCompany: formData.company.trim() || undefined,
      hostEmployeeId: currentEmployeeId,
      locationId: currentLocationId,
      purpose: formData.purpose as Purpose,
      visitType: formData.visitType as VisitType,
      department: currentEmployee?.department || undefined,
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

    setShowPreview(false)
    setSuccessData({
      name: visitorName,
      company: formData.company.trim() || undefined,
      date: formatDate(formData.scheduledDate),
      time: formatTime(formData.scheduledTime),
    })
  }

  return (
    <div className="md:hidden h-full relative" style={{ backgroundColor: '#ffffff' }}>

      {/* Tiled GMMCO brand pattern — same as Walk-in */}
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

      <div className="absolute inset-0 overflow-hidden flex flex-col">

        {/* Header with stepper in second row — same structure as Walk-in */}
        <MobilePageHeader
          title="Schedule a Visit"
          onBack={() => navigate('/employee/dashboard')}
          onCancel={() => navigate('/employee/dashboard')}
        >
          <HeaderStepper currentStep={currentStep} />
        </MobilePageHeader>

        {/* Success Modal */}
        {successData && (
          <Modal open onClose={() => navigate('/employee/dashboard')} size="md">
            <div className="animate-in py-4 flex flex-col items-center text-center gap-5">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-confirmed-surface)' }}
              >
                <i className="ri-checkbox-circle-fill text-4xl" style={{ color: 'var(--color-confirmed)' }} />
              </div>
              <div>
                <p className="text-base font-semibold text-text-primary">Visit Scheduled Successfully</p>
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
              <Button fullWidth onClick={() => navigate('/employee/dashboard')}>
                Done
              </Button>
            </div>
          </Modal>
        )}

        {/* Preview Modal */}
        <Modal
          open={showPreview}
          onClose={() => setShowPreview(false)}
          title="Review Visit"
          footer={
            <div className="flex gap-2">
              <Button variant="secondary" fullWidth onClick={() => setShowPreview(false)}>
                Edit
              </Button>
              <Button icon="ri-check-line" fullWidth onClick={handleConfirm}>
                Confirm &amp; Schedule
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
            <span className="ml-auto shrink-0 rounded-full bg-confirmed-surface px-2.5 py-0.5 text-[11px] font-medium text-confirmed">
              Confirmed
            </span>
          </div>

          <div className="overflow-y-auto max-h-[52vh] -mx-5 px-5 space-y-4 pb-1">
            <PreviewSection title="Visit Details">
              <PreviewRow label="Purpose" value={getPurposeLabel(formData.purpose as string)} />
              <PreviewRow label="Visitor Type" value={getVisitTypeLabel(formData.visitType as string)} />
              {formData.company.trim() && <PreviewRow label="Company" value={formData.company.trim()} />}
              <PreviewRow label="Host" value={currentEmployee?.name ?? '—'} />
              {currentEmployee?.department && <PreviewRow label="Department" value={getDepartmentLabel(currentEmployee.department)} />}
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

        {/* Scrollable content */}
        <div
          className="flex-1 overflow-y-auto"
          onScroll={(e) => setPatternOffset(e.currentTarget.scrollTop * -0.35)}
        >

          {/* Logo */}
          <div className="px-5 pt-5">
            <img src={logoBlackUrl} alt="GMMCO — CKA Birla Group" className="h-5 w-auto" />
          </div>

          {/* Headline */}
          <div className="px-5 mt-3">
            <h2 className="font-black text-[1.7rem] leading-[1.25] tracking-tight text-gray-800 uppercase">
              WE WELCOME<br />
              OUR <span className="text-brand">VISITORS &amp;</span><br />
              <span className="text-brand">GUESTS</span>
            </h2>
          </div>

          {/* Visitor image */}
          <img
            src={visitorPictureUrl}
            alt="GMMCO visitors"
            className="w-full max-h-[160px] object-contain object-bottom block mt-3"
            draggable={false}
          />

          {/* Form section */}
          <div className="relative bg-white border-t border-border">

            <div className="px-5 pt-5 pb-3">
              <SectionDivider icon={VISIT_FORM_STEPS[currentStep - 1].icon} title={VISIT_FORM_STEPS[currentStep - 1].title} />
            </div>

            <form id="mobile-visit-form" onSubmit={handleSubmit} className="px-5 pb-6 space-y-4">

              {/* Step 1: Visitor Details */}
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

                  <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
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

              {/* Step 2: Visit Details */}
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
                      <option value="">{!formData.purpose ? 'Select purpose first' : 'Select visitor type'}</option>
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

                  <FormField label="Host (You)">
                    <div className="form-input flex items-center gap-2 bg-surface-secondary text-text-secondary pointer-events-none">
                      <i className="ri-check-line text-xs text-confirmed" />
                      <span className="text-sm">{currentEmployee?.name ?? '—'}</span>
                    </div>
                  </FormField>

                  <FormField label="Department">
                    <div className="form-input flex items-center gap-2 bg-surface-secondary text-text-secondary pointer-events-none">
                      <i className="ri-check-line text-xs text-confirmed" />
                      <span className="text-sm">{getDepartmentLabel(currentEmployee?.department ?? '')}</span>
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

              {/* Step 3: Additional Info */}
              {currentStep === 3 && (
                <div className="flex flex-col gap-5">
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

              {/* Navigation buttons — inside scroll area, same as Walk-in */}
              <div className="flex gap-3 pt-3 pb-1">
                {currentStep > 1 && (
                  <Button type="button" variant="secondary" onClick={() => setCurrentStep((s) => s - 1)}>
                    Back
                  </Button>
                )}
                {currentStep < 3 && (
                  <Button type="button" fullWidth icon="ri-arrow-right-line" onClick={handleNext}>
                    Continue
                  </Button>
                )}
                {currentStep === 3 && (
                  <Button
                    form="mobile-visit-form"
                    type="submit"
                    icon="ri-calendar-check-line"
                    fullWidth
                    disabled={!isFormValid(formData)}
                  >
                    Schedule Visit
                  </Button>
                )}
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Stepper — narrower connectors for mobile width ────────────────────────────

function HeaderStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-0">
      {VISIT_FORM_STEPS.map((step, index) => {
        const stepNum = index + 1
        const isCompleted = stepNum < currentStep
        const isActive = stepNum === currentStep
        const isLast = index === VISIT_FORM_STEPS.length - 1

        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition-all duration-200 ${
                  isCompleted || isActive ? 'bg-brand text-white' : 'bg-transparent border border-border text-text-tertiary'
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
              <div className={`w-10 h-px mx-1.5 mb-3.5 transition-colors duration-300 ${isCompleted ? 'bg-brand' : 'bg-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
