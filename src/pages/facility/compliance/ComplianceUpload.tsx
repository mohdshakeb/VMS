import { useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import { infraCategories } from '@/data/facilityData'
import PageHeader from '@/components/PageHeader'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import type { BuildingType, InfraApplicability } from '@/types/facility'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getDraftAgeDays(savedAt?: string): number {
  if (!savedAt) return 0
  const diff = Date.now() - new Date(savedAt).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export default function ComplianceUpload() {
  const { buildingId } = useParams<{ buildingId: string }>()
  const navigate = useNavigate()
  const buildings = useFacilityStore((s) => s.buildings)
  const uploads = useFacilityStore((s) => s.complianceUploads)
  const setPhoto = useFacilityStore((s) => s.setPhoto)
  const saveComplianceDraft = useFacilityStore((s) => s.saveComplianceDraft)
  const submitCompliance = useFacilityStore((s) => s.submitCompliance)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const building = buildings.find((b) => b.id === buildingId)
  const uploadState = buildingId ? uploads[buildingId] : undefined
  const photos = uploadState?.photos ?? {}
  const draftAgeDays = getDraftAgeDays(uploadState?.savedAt)
  const isExpired = draftAgeDays >= 30
  const isOld = draftAgeDays >= 7 && draftAgeDays < 30

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null)

  if (!building || !buildingId) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-sm text-text-secondary">Building not found.</p>
      </div>
    )
  }

  const cats = infraCategories.filter((c) => {
    const app = c.applicability[building.type as BuildingType] as InfraApplicability | undefined
    return app === 'mandatory' || app === 'optional'
  })

  const mandatoryCats = cats.filter((c) => c.applicability[building.type as BuildingType] === 'mandatory')
  const uploadedCount = cats.filter((c) => !!photos[c.id]).length
  const totalCount = cats.length
  const allMandatoryUploaded = mandatoryCats.every((c) => !!photos[c.id])
  const hasEmptyOptionals = cats.some((c) => c.applicability[building.type as BuildingType] === 'optional' && !photos[c.id])

  const groups = [...new Set(cats.map((c) => c.group))]

  function handleUploadClick(categoryId: string) {
    if (isExpired) return
    setPendingCategoryId(categoryId)
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !pendingCategoryId || !buildingId) return
    const url = URL.createObjectURL(file)
    setPhoto(buildingId, pendingCategoryId, url)
    e.target.value = ''
  }

  function handleSaveDraft() {
    if (buildingId) saveComplianceDraft(buildingId)
    navigate('/facility/dashboard')
  }

  function handleSubmit() {
    if (!allMandatoryUploaded) return
    if (hasEmptyOptionals) {
      setShowConfirmModal(true)
    } else {
      doSubmit()
    }
  }

  function doSubmit() {
    if (buildingId) submitCompliance(buildingId)
    setShowConfirmModal(false)
    navigate('/facility/dashboard')
  }

  const expiryDate = uploadState?.savedAt
    ? new Date(new Date(uploadState.savedAt).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })
    : ''

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={building.name}
        breadcrumb={[{ label: 'Compliance', path: '/facility/compliance' }]}
        onBack={() => navigate('/facility/compliance')}
        actions={
          <span className="text-xs text-text-tertiary">
            {uploadedCount} of {totalCount} categories uploaded
          </span>
        }
      />

      {/* Mobile back header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border-light md:hidden">
        <button
          onClick={() => navigate('/facility/compliance')}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-text-secondary hover:bg-surface-secondary transition-colors"
        >
          <i className="ri-arrow-left-line text-lg" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-medium text-text-primary truncate">{building.name}</h2>
          <p className="text-xs text-text-tertiary">May 2026 · {uploadedCount} / {totalCount} uploaded</p>
        </div>
      </div>

      {/* Banners */}
      {isExpired && (
        <div className="mx-4 mt-3 md:mx-6 px-4 py-3 rounded-xl bg-terminal-red-surface border border-terminal-red/20">
          <div className="flex gap-2">
            <i className="ri-error-warning-fill text-terminal-red text-base shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-terminal-red">This draft has expired</p>
              <p className="text-xs text-terminal-red/80 mt-0.5">Please start a fresh upload for this building.</p>
            </div>
          </div>
        </div>
      )}
      {isOld && !isExpired && (
        <div className="mx-4 mt-3 md:mx-6 px-4 py-3 rounded-xl bg-pending-surface border border-pending/20">
          <div className="flex gap-2">
            <i className="ri-alarm-warning-line text-pending text-base shrink-0 mt-0.5" />
            <p className="text-sm text-pending">
              This draft is {draftAgeDays} days old. Submit before {expiryDate} to avoid losing your progress.
            </p>
          </div>
        </div>
      )}

      {/* Category list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5 pb-24">
        {groups.map((group) => {
          const groupCats = cats.filter((c) => c.group === group)
          return (
            <div key={group} className="mb-5">
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">{group}</p>
              <div className="space-y-2">
                {groupCats.map((cat) => {
                  const isMandatory = cat.applicability[building.type as BuildingType] === 'mandatory'
                  const photoUrl = photos[cat.id]
                  return (
                    <div
                      key={cat.id}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl border ${isExpired ? 'opacity-50' : ''} ${photoUrl ? 'border-terminal-green/30 bg-terminal-green-surface/30' : 'border-border-light bg-white'}`}
                    >
                      {/* Thumbnail or placeholder */}
                      <div className="w-12 h-10 shrink-0 rounded-lg overflow-hidden bg-surface-secondary flex items-center justify-center">
                        {photoUrl ? (
                          <img src={photoUrl} alt={cat.name} className="w-full h-full object-cover" />
                        ) : (
                          <i className="ri-image-line text-text-tertiary text-lg" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-text-primary truncate">{cat.name}</p>
                          {isMandatory && (
                            <span className="text-[10px] font-medium text-terminal-red/70 bg-terminal-red/10 px-1.5 py-0.5 rounded-full shrink-0">Required</span>
                          )}
                        </div>
                        {photoUrl ? (
                          <p className="text-xs text-terminal-green mt-0.5 flex items-center gap-1">
                            <i className="ri-checkbox-circle-fill text-sm" />
                            Uploaded
                          </p>
                        ) : (
                          <p className="text-xs text-text-tertiary mt-0.5">Not uploaded</p>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant={photoUrl ? 'secondary' : 'primary'}
                        onClick={() => handleUploadClick(cat.id)}
                        disabled={isExpired}
                      >
                        {photoUrl ? 'Replace' : 'Upload'}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/heic"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Footer actions */}
      <div className="shrink-0 px-4 py-3 md:px-6 border-t border-border-light bg-white flex items-center gap-3">
        <Button size="md" variant="secondary" fullWidth onClick={handleSaveDraft}>
          Save as draft
        </Button>
        <Button size="md" fullWidth onClick={handleSubmit} disabled={!allMandatoryUploaded || isExpired}>
          Submit
        </Button>
      </div>

      {/* Confirm modal for empty optionals */}
      <Modal
        open={showConfirmModal}
        title="Submit with missing photos?"
        onClose={() => setShowConfirmModal(false)}
        footer={
          <div className="flex gap-2">
            <Button size="md" variant="secondary" fullWidth onClick={() => setShowConfirmModal(false)}>
              Go back
            </Button>
            <Button size="md" fullWidth onClick={doSubmit}>
              Submit anyway
            </Button>
          </div>
        }
      >
        <p className="text-sm text-text-secondary">
          Some optional categories have no photo uploaded. You can still submit — optional categories can be left empty.
        </p>
      </Modal>
    </div>
  )
}
