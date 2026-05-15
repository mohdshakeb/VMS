import { useRef } from 'react'
import { useFacilityStore } from '@/store/facilityStore'

export default function Step3Admin() {
  const formData = useFacilityStore((s) => s.onboardingFormData)
  const setField = useFacilityStore((s) => s.setOnboardingField)
  const layoutRef = useRef<HTMLInputElement>(null)
  const complianceRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-4">
        {/* Building Status */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Building Status <span className="text-terminal-red">*</span>
          </label>
          <select
            value={formData.buildingStatus}
            onChange={(e) => setField('buildingStatus', e.target.value)}
            className="form-input"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Remarks / Notes</label>
          <textarea
            value={formData.remarks}
            onChange={(e) => setField('remarks', e.target.value)}
            placeholder="Any additional notes about this building"
            rows={3}
            className="form-input resize-none"
          />
        </div>

        {/* Layout Plan upload */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Layout Plan</label>
          <input
            ref={layoutRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) setField('layoutPlanName', file.name)
            }}
          />
          {formData.layoutPlanName ? (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-brand/30 bg-brand-light">
              <i className="ri-file-pdf-line text-brand text-sm" />
              <span className="text-sm text-text-primary flex-1 truncate">{formData.layoutPlanName}</span>
              <button
                onClick={() => setField('layoutPlanName', '')}
                className="text-text-tertiary hover:text-text-secondary transition-colors"
              >
                <i className="ri-close-line text-base" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => layoutRef.current?.click()}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-border text-text-secondary hover:border-brand hover:text-brand transition-colors"
            >
              <i className="ri-upload-cloud-line text-base" />
              <span className="text-sm">Upload layout plan</span>
              <span className="ml-auto text-xs text-text-tertiary">PDF, JPG, PNG · max 10MB</span>
            </button>
          )}
        </div>

        {/* Compliance Documentation upload */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Compliance Documentation</label>
          <input
            ref={complianceRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) setField('complianceDocName', file.name)
            }}
          />
          {formData.complianceDocName ? (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-brand/30 bg-brand-light">
              <i className="ri-file-pdf-line text-brand text-sm" />
              <span className="text-sm text-text-primary flex-1 truncate">{formData.complianceDocName}</span>
              <button
                onClick={() => setField('complianceDocName', '')}
                className="text-text-tertiary hover:text-text-secondary transition-colors"
              >
                <i className="ri-close-line text-base" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => complianceRef.current?.click()}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-border text-text-secondary hover:border-brand hover:text-brand transition-colors"
            >
              <i className="ri-upload-cloud-line text-base" />
              <span className="text-sm">Upload compliance docs</span>
              <span className="ml-auto text-xs text-text-tertiary">PDF only · max 10MB</span>
            </button>
          )}
        </div>
      </div>
  )
}
