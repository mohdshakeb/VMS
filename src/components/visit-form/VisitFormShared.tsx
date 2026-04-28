// ─────────────────────────────────────────────────────────────────────────────
// Shared building blocks for walk-in and employee visit forms
// ─────────────────────────────────────────────────────────────────────────────
import type { Purpose, VisitType, BusinessSegment, VisitorPriority } from '@/types/visit'
import { getLocalDateString } from '@/utils/helpers'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FormData {
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

// ── Constants ─────────────────────────────────────────────────────────────────

export const ALL_PURPOSES: Purpose[] = ['official', 'personal', 'training', 'interview', 'delivery']
export const BUSINESS_SEGMENTS: BusinessSegment[] = ['machines', 'engines', 'parts-purchased', 'service-inquiry', 'other']
export const VISITOR_PRIORITIES: VisitorPriority[] = ['immediate', 'in-a-month', 'exploring']
export const COMPANY_REQUIRED_TYPES: VisitType[] = ['vendor', 'contractor']

export const VISIT_FORM_STEPS = [
  { label: 'Visitor', icon: 'ri-user-3-line', title: 'Visitor Details' },
  { label: 'Visit', icon: 'ri-calendar-check-line', title: 'Visit Details' },
  { label: 'Additional', icon: 'ri-file-list-3-line', title: 'Additional Info' },
]

// ── GMMCO Pattern ─────────────────────────────────────────────────────────────

const GMMCO_PATH = `M20.442 31.3571C19.4155 32.4319 18.3889 33.421 17.3177 34.3669C13.747 37.506 9.59615 39.312 4.82039 39.7419L4.69423 39.7533L4.68435 39.7542C3.3042 39.8789 1.96306 40 0.580233 40C0.0446335 40 0 40 0 39.441V27.702C0 27.4011 2.74023e-06 27.1862 0.446335 27.1C4.24016 26.4979 7.40913 24.7351 10.221 22.2411C12.6758 20.0482 14.5058 17.4252 15.6216 14.3291C15.64 14.2756 15.6606 14.222 15.6814 14.1678L15.6825 14.1649L15.6833 14.1629C15.7618 13.9571 15.8448 13.7397 15.8448 13.4692C15.6454 13.4052 15.4709 13.4127 15.2842 13.4207L15.284 13.4207C15.2199 13.4235 15.1544 13.4262 15.086 13.4262H3.92773H3.43677C3.12434 13.4262 2.99043 13.3403 3.03506 13.0391C3.11959 12.3466 3.16423 11.6152 3.20662 10.9184L3.2136 10.8032L3.88309 3.1924L4.1509 0.354497C4.1509 0.0533627 4.32943 -0.0326069 4.59723 0.0103766H4.99893H39.1878C39.4556 0.0103766 39.6787 0.0103784 39.9912 0.0533619C40.0268 0.466203 39.9483 0.879046 39.8697 1.29164L39.8697 1.29171C39.85 1.3949 39.8303 1.49808 39.8126 1.60127C39.3885 4.22419 38.9534 6.83637 38.5183 9.44855L38.5183 9.44875L38.4939 9.59481C38.0669 12.1584 37.6399 14.7221 37.2239 17.2962C36.8195 19.7695 36.4061 22.2427 35.992 24.7199L35.9649 24.8816C35.4732 27.8204 34.9808 30.7651 34.5013 33.7219L34.4217 34.2135L34.4192 34.2292C34.2228 35.4447 34.0223 36.6855 33.7871 37.8928L33.7831 37.9138C33.6979 38.3671 33.6899 38.4089 33.1623 38.4089H21.1113H21.1112C20.8627 38.4089 20.74 38.4089 20.6794 38.3474C20.6203 38.2874 20.6203 38.1692 20.6203 37.9359V37.9358V32.174C20.6203 32.122 20.6223 32.0718 20.6241 32.0221C20.6313 31.8241 20.638 31.6317 20.5313 31.3571H20.442Z`
const GMMCO_STAGGERED_SVG = `<svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="${GMMCO_PATH}" fill="#EB2128"/><path transform="translate(80 80)" d="${GMMCO_PATH}" fill="#EB2128"/></svg>`
export const GMMCO_PATTERN_URI = `url("data:image/svg+xml,${encodeURIComponent(GMMCO_STAGGERED_SVG)}")`

// ── Validation ────────────────────────────────────────────────────────────────

export function isCompanyRequired(visitType: VisitType | ''): boolean {
  return COMPANY_REQUIRED_TYPES.includes(visitType as VisitType)
}

const MOBILE_REGEX = /^\+?[\d\s\-(). ]{7,20}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isMobileValid(mobile: string): boolean {
  return MOBILE_REGEX.test(mobile.trim())
}

export function isEmailValid(email: string): boolean {
  return EMAIL_REGEX.test(email.trim())
}

export function isStep1Valid(data: FormData): boolean {
  if (!data.firstName.trim() || !data.lastName.trim() || !data.mobile.trim()) return false
  if (!isMobileValid(data.mobile)) return false
  if (data.email.trim() && !isEmailValid(data.email)) return false
  return true
}

export function isStep2Valid(data: FormData): boolean {
  if (!data.purpose || !data.visitType || !data.hostEmployeeId) return false
  if (isCompanyRequired(data.visitType) && !data.company.trim()) return false
  return true
}

export function isFormValid(data: FormData): boolean {
  return isStep1Valid(data) && isStep2Valid(data)
}

// ── Default ───────────────────────────────────────────────────────────────────

export const defaultFormData: FormData = {
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

// ── Sub-components ────────────────────────────────────────────────────────────

export function HeaderStepper({ currentStep }: { currentStep: number }) {
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
              <div className={`w-20 h-px mx-2 mb-3.5 transition-colors duration-300 ${isCompleted ? 'bg-brand' : 'bg-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide mb-2">{title}</p>
      <div className="rounded-xl border border-border divide-y divide-border-light overflow-hidden">
        {children}
      </div>
    </div>
  )
}

export function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-3 py-2.5">
      <span className="text-xs text-text-secondary shrink-0">{label}</span>
      <span className="text-xs font-medium text-text-primary text-right break-words max-w-[60%]">{value}</span>
    </div>
  )
}

export function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-text-primary">
        {label}
        {required && <span className="text-rejected ml-0.5">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
      {error && (
        <p className="text-xs text-rejected mt-1 flex items-center gap-1">
          <i className="ri-error-warning-line" />
          {error}
        </p>
      )}
      {hint && !error && <p className="text-xs text-text-tertiary mt-1">{hint}</p>}
    </label>
  )
}
