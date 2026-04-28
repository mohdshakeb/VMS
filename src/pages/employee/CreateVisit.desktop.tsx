// ─────────────────────────────────────────────────────────────────────────────
// Create Visit — Desktop (Employee)
// Host is always the logged-in employee. Visit goes straight to confirmed.
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
import SectionLabel from '@/components/common/SectionLabel'
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
  HeaderStepper,
  PreviewSection,
  PreviewRow,
  Field,
} from '@/components/visit-form/VisitFormShared'

export default function CreateVisitDesktop() {
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

  const [mobileTouched, setMobileTouched] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [firstNameTouched, setFirstNameTouched] = useState(false)
  const [lastNameTouched, setLastNameTouched] = useState(false)
  const [purposeTouched, setPurposeTouched] = useState(false)
  const [visitTypeTouched, setVisitTypeTouched] = useState(false)
  const [companyTouched, setCompanyTouched] = useState(false)

  const photoInputRef = useRef<HTMLInputElement>(null)
  const [patternOffset, setPatternOffset] = useState(0)

  const showCustomerBlock = formData.visitType === 'customer'
  const companyRequired = isCompanyRequired(formData.visitType)
  const availableVisitTypes = formData.purpose
    ? (VISIT_TYPE_BY_PURPOSE[formData.purpose as Purpose] ?? [])
    : []

  // Keep host/department locked to logged-in employee
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
    <div className="hidden md:flex flex-col h-full">

      {/* ── App Bar ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white border-b border-border shrink-0">
        <button
          type="button"
          onClick={() => navigate('/employee/dashboard')}
          className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors -ml-1 px-1 py-1 rounded-md"
        >
          <i className="ri-arrow-left-line text-lg" />
          <span className="font-medium">Schedule a Visit</span>
        </button>

        <HeaderStepper currentStep={currentStep} />

        <button
          type="button"
          onClick={() => navigate('/employee/dashboard')}
          className="text-sm font-medium text-brand hover:opacity-75 transition-opacity px-1 py-1"
        >
          Cancel
        </button>
      </header>

      {/* ── Success Modal ─────────────────────────────────────────────────────── */}
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

      {/* ── Preview Modal ─────────────────────────────────────────────────────── */}
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

      {/* ── Full-width patterned background ──────────────────────────────────── */}
      <div
        className="flex-1 flex overflow-hidden min-h-0 relative"
        style={{ backgroundColor: '#ffffff' }}
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

        {/* ── Left branding content ────────────────────────────────────────── */}
        <div className="flex flex-col w-[42%] shrink-0 relative z-10">
          <div className="pt-12 px-8">
            <img src={logoBlackUrl} alt="GMMCO — CKA Birla Group" className="h-7 w-auto" />
          </div>
          <div className="px-8 mt-3">
            <h2 className="font-black text-[2.6rem] leading-[1.28] tracking-tight text-gray-800 uppercase">
              WE WELCOME<br />
              OUR <span className="text-brand">VISITORS &amp;</span><br />
              <span className="text-brand">GUESTS</span>
            </h2>
          </div>
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
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80">

            <div className="px-[72px] pt-[72px] pb-4">
              <SectionLabel icon={VISIT_FORM_STEPS[currentStep - 1].icon} title={VISIT_FORM_STEPS[currentStep - 1].title} />
            </div>

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
                        className={`form-input ${mobileTouched && (!formData.mobile.trim() || !isMobileValid(formData.mobile)) ? 'border-rejected focus:ring-rejected/20' : ''}`}
                        autoFocus
                      />
                      {mobileTouched && !formData.mobile.trim() && (
                        <p className="text-xs text-rejected mt-1 flex items-center gap-1">
                          <i className="ri-error-warning-line" />
                          Mobile number is required
                        </p>
                      )}
                      {mobileTouched && formData.mobile.trim() && !isMobileValid(formData.mobile) && (
                        <p className="text-xs text-rejected mt-1 flex items-center gap-1">
                          <i className="ri-error-warning-line" />
                          Enter a valid phone number
                        </p>
                      )}
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="First Name" required error={firstNameTouched && !formData.firstName.trim() ? 'Enter first name' : undefined}>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleChange('firstName', e.target.value)}
                          onBlur={() => setFirstNameTouched(true)}
                          placeholder="First name"
                          className={`form-input ${firstNameTouched && !formData.firstName.trim() ? 'border-rejected focus:ring-rejected/20' : ''}`}
                        />
                      </Field>
                      <Field label="Last Name" required error={lastNameTouched && !formData.lastName.trim() ? 'Enter last name' : undefined}>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => handleChange('lastName', e.target.value)}
                          onBlur={() => setLastNameTouched(true)}
                          placeholder="Last name"
                          className={`form-input ${lastNameTouched && !formData.lastName.trim() ? 'border-rejected focus:ring-rejected/20' : ''}`}
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

                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoSelect}
                    />
                    <Field label="Visitor Photo">
                      {formData.photo ? (
                        <div
                          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface cursor-pointer py-5"
                          onClick={() => photoInputRef.current?.click()}
                        >
                          <img src={formData.photo} alt="Visitor" className="h-20 w-20 rounded-full object-cover shadow-sm" />
                          <p className="text-xs text-text-secondary">Click to change</p>
                        </div>
                      ) : (
                        <div
                          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface hover:bg-surface-secondary transition-colors cursor-pointer py-8"
                          onClick={() => photoInputRef.current?.click()}
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-border shadow-sm">
                            <i className="ri-camera-line text-xl text-brand" />
                          </div>
                          <p className="text-sm font-medium text-text-primary">Capture or upload photo</p>
                          <p className="text-xs text-text-tertiary">Camera · Gallery</p>
                        </div>
                      )}
                    </Field>
                  </>
                )}

                {/* ── Step 2: Visit Details ────────────────────────────────── */}
                {currentStep === 2 && (
                  <>
                    <Field label="Purpose of Visit" required error={purposeTouched && !formData.purpose ? 'Select a purpose' : undefined}>
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
                    </Field>

                    <Field label="Visitor Type" required error={visitTypeTouched && !formData.visitType ? 'Select a visitor type' : undefined}>
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
                    </Field>

                    <Field label="Visitor Company" required={companyRequired} error={companyTouched && companyRequired && !formData.company.trim() ? 'Enter company name' : undefined}>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                        onBlur={() => setCompanyTouched(true)}
                        placeholder={companyRequired ? 'Required for this visitor type' : 'Organization name (optional)'}
                        className={`form-input ${companyTouched && companyRequired && !formData.company.trim() ? 'border-rejected focus:ring-rejected/20' : ''}`}
                      />
                    </Field>

                    {/* Host is always the logged-in employee — read-only */}
                    <Field label="Host (You)">
                      <div className="form-input flex items-center gap-2 bg-surface-secondary text-text-secondary pointer-events-none">
                        <i className="ri-check-line text-xs text-confirmed" />
                        <span className="text-sm">{currentEmployee?.name ?? '—'}</span>
                      </div>
                    </Field>

                    <Field label="Department">
                      <div className="form-input flex items-center gap-2 bg-surface-secondary text-text-secondary pointer-events-none">
                        <i className="ri-check-line text-xs text-confirmed" />
                        <span className="text-sm">{getDepartmentLabel(currentEmployee?.department ?? '')}</span>
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
                        <Field label="End Date">
                          <input
                            type="date"
                            value={formData.endDate}
                            min={formData.scheduledDate}
                            onChange={(e) => handleChange('endDate', e.target.value)}
                            className="form-input"
                          />
                        </Field>
                      )}
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

                {/* ── Step 3: Additional Info ──────────────────────────────── */}
                {currentStep === 3 && (
                  <div className="flex flex-col gap-6">
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

                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">Notes</p>
                      <Field label="Remarks">
                        <textarea
                          value={formData.notes}
                          onChange={(e) => handleChange('notes', e.target.value)}
                          placeholder="Any additional details (optional)"
                          rows={3}
                          className="form-input resize-none"
                        />
                      </Field>
                    </div>

                    {!showCustomerBlock && (
                      <p className="text-xs text-text-tertiary text-center py-4">
                        ID proof, devices, and vehicle details will be captured at check-in.
                      </p>
                    )}
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
                      onClick={handleNext}
                    >
                      Continue
                    </Button>
                  )}
                  {currentStep === 3 && (
                    <Button
                      form="visit-form"
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
    </div>
  )
}
