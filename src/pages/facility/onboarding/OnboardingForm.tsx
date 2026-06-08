import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import { infraCategories } from '@/data/facilityData'
import { GMMCO_PATTERN_URI } from '@/components/visit-form/VisitFormShared'
import SectionLabel from '@/components/common/SectionLabel'
import Button from '@/components/Button'
import logoBlackUrl from '@/assets/logoBlack.svg'
import buildingUrl from '@/assets/building.png'
import type { FacilityType } from '@/types/facility'
import Step1Location from './Step1Location'
import Step2Physical from './Step2Physical'
import Step3Admin from './Step3Admin'
import Step4Review from './Step4Review'

const ONBOARDING_STEPS = [
  { label: 'Infrastructure', icon: 'ri-building-2-line', title: 'Infrastructure Details' },
  { label: 'Location', icon: 'ri-map-pin-2-line', title: 'Location & Address' },
  { label: 'Admin', icon: 'ri-shield-check-line', title: 'Administration & Documents' },
]

function OnboardingHeaderStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-0">
      {ONBOARDING_STEPS.map((step, index) => {
        const stepNum = index + 1
        const isCompleted = stepNum < currentStep
        const isActive = stepNum === currentStep
        const isLast = index === ONBOARDING_STEPS.length - 1
        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition-all duration-200 ${
                  isCompleted || isActive
                    ? 'bg-brand text-white'
                    : 'bg-transparent border border-border text-text-tertiary'
                }`}
              >
                {isCompleted ? <i className="ri-check-line text-[10px]" /> : <span>{stepNum}</span>}
              </div>
              <span
                className={`text-[10px] font-medium whitespace-nowrap leading-none transition-colors duration-200 ${
                  isActive ? 'text-brand' : isCompleted ? 'text-text-secondary' : 'text-text-tertiary'
                }`}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={`w-20 h-px mx-2 mb-3.5 transition-colors duration-300 ${isCompleted ? 'bg-brand' : 'bg-border'}`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function OnboardingForm() {
  const navigate = useNavigate()
  const currentStep = useFacilityStore((s) => s.onboardingCurrentStep)
  const setStep = useFacilityStore((s) => s.setOnboardingStep)
  const formData = useFacilityStore((s) => s.onboardingFormData)
  const setField = useFacilityStore((s) => s.setOnboardingField)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [patternOffset, setPatternOffset] = useState(0)

  const canProceed1 = !!(formData.facilityName && formData.facilityType && formData.floors)
  const canProceed2 = !!(formData.sbu && formData.state && formData.city && formData.location && formData.address1 && formData.pinCode)
  const canProceed3 = !!formData.facilityStatus
  const canProceed = currentStep === 1 ? canProceed1 : currentStep === 2 ? canProceed2 : canProceed3

  function handleBack() {
    if (currentStep === 1) navigate('/facility/facilities')
    else setStep((currentStep - 1) as 1 | 2 | 3)
  }

  function handleNext() {
    if (currentStep === 1) {
      const mandatoryIds = infraCategories
        .filter((c) => (c.applicability[formData.facilityType as FacilityType] ?? 'not-applicable') === 'mandatory')
        .map((c) => c.id)
      const optionalIds = infraCategories
        .filter((c) => (c.applicability[formData.facilityType as FacilityType] ?? 'not-applicable') === 'optional')
        .map((c) => c.id)
      const resolved =
        formData.selectedCategories.length > 0
          ? formData.selectedCategories
          : formData.facilityType
          ? [...mandatoryIds, ...optionalIds]
          : []
      setField('selectedCategories', resolved)
      setStep(2)
    } else if (currentStep === 2) {
      setStep(3)
    } else {
      setShowReviewModal(true)
    }
  }

  function handleEditFromReview(step: 1 | 2 | 3) {
    setShowReviewModal(false)
    setStep(step)
  }

  const stepInfo = ONBOARDING_STEPS[currentStep - 1]

  return (
    <>
      {/* ── Desktop Layout ────────────────────────────────────────────────────── */}
      <div className="hidden md:flex flex-col h-full">

        {/* App Bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white border-b border-border shrink-0">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors -ml-1 px-1 py-1 rounded-md"
          >
            <i className="ri-arrow-left-line text-lg" />
            <span className="font-medium">New Facility</span>
          </button>

          <OnboardingHeaderStepper currentStep={currentStep} />

          <button
            type="button"
            onClick={() => navigate('/facility/facilities')}
            className="text-sm font-medium text-brand hover:opacity-75 transition-opacity px-1 py-1"
          >
            Cancel
          </button>
        </header>

        {/* Full-width patterned background */}
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

          {/* Left branding */}
          <div className="flex flex-col w-[42%] shrink-0 relative z-10">
            <div className="pt-12 px-8">
              <img src={logoBlackUrl} alt="GMMCO — CKA Birla Group" className="h-7 w-auto" />
            </div>
            <div className="px-8 mt-3">
              <h2 className="font-black text-[2.6rem] leading-[1.28] tracking-tight text-gray-800 uppercase">
                ONBOARD<br />
                A NEW <span className="text-brand">BUILDING</span><br />
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

          {/* Right: floating form card */}
          <div
            className="flex-1 flex flex-col p-12 relative z-10 overflow-y-auto"
            onScroll={(e) => setPatternOffset(e.currentTarget.scrollTop * -0.35)}
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80">

              {/* Section header */}
              <div className="px-[72px] pt-[72px] pb-4">
                <SectionLabel icon={stepInfo.icon} title={stepInfo.title} />
              </div>

              {/* Step content + nav */}
              <div className="px-[72px] pb-[72px] space-y-4 w-full">
                {currentStep === 1 && <Step2Physical />}
                {currentStep === 2 && <Step1Location />}
                {currentStep === 3 && <Step3Admin />}

                <div className="flex gap-3 pt-4 pb-2">
                  {currentStep > 1 && (
                    <Button type="button" variant="secondary" onClick={handleBack}>
                      Back
                    </Button>
                  )}
                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      fullWidth
                      icon="ri-arrow-right-line"
                      onClick={handleNext}
                      disabled={!canProceed}
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      icon="ri-building-check-line"
                      fullWidth
                      disabled={!canProceed}
                      onClick={handleNext}
                    >
                      Review &amp; Submit
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Layout ─────────────────────────────────────────────────────── */}
      <div className="md:hidden flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-light">
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-text-secondary hover:bg-surface-secondary transition-colors"
          >
            <i className="ri-arrow-left-line text-lg" />
          </button>
          <h2 className="text-sm font-medium text-text-primary">New Facility Onboarding</h2>
        </div>

        <div className="px-4 py-3 border-b border-border-light">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-text-tertiary">Step {currentStep} of {ONBOARDING_STEPS.length}</span>
            <span className="text-xs font-medium text-text-primary">{stepInfo.label}</span>
          </div>
          <div className="flex gap-1">
            {ONBOARDING_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < currentStep ? 'bg-brand' : 'bg-surface-secondary'}`}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          {currentStep === 1 && <Step2Physical />}
          {currentStep === 2 && <Step1Location />}
          {currentStep === 3 && <Step3Admin />}
        </div>

        <div className="px-4 py-3 border-t border-border-light flex gap-2 shrink-0">
          {currentStep > 1 && (
            <Button type="button" variant="secondary" onClick={handleBack}>
              Back
            </Button>
          )}
          {currentStep < 3 ? (
            <Button type="button" fullWidth icon="ri-arrow-right-line" onClick={handleNext} disabled={!canProceed}>
              Continue
            </Button>
          ) : (
            <Button type="button" icon="ri-building-check-line" fullWidth disabled={!canProceed} onClick={handleNext}>
              Review &amp; Submit
            </Button>
          )}
        </div>
      </div>

      {/* Review modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center md:p-4">
          <div className="bg-white w-full md:max-w-xl rounded-t-2xl md:rounded-2xl max-h-[92vh] flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-light shrink-0">
              <h3 className="text-sm font-semibold text-text-primary">Review & Confirm</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-secondary transition-colors"
              >
                <i className="ri-close-line text-base" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <Step4Review onClose={() => setShowReviewModal(false)} onEdit={handleEditFromReview} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
