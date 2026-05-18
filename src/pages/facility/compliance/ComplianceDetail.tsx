import { useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import { infraCategories } from '@/data/facilityData'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import SectionLabel from '@/components/common/SectionLabel'
import DetailItem from '@/components/common/DetailItem'
import FacilityStatusBadge from '@/components/facility/FacilityStatusBadge'
import type { BuildingType, InfraCategory } from '@/types/facility'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function formatDate(ts?: string) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function UploadTile({
  cat,
  isMandatory,
  photoUrl,
  onClick,
  onRemove,
}: {
  cat: InfraCategory
  isMandatory: boolean
  photoUrl?: string
  onClick: () => void
  onRemove?: () => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={onClick}
        className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden transition-all active:scale-[0.98] ${
          photoUrl
            ? 'border border-border-light'
            : 'border-2 border-dashed border-border hover:border-brand/50 bg-surface-secondary/40 hover:bg-brand-red-50/20'
        }`}
      >
        {photoUrl ? (
          <>
            <img src={photoUrl} alt={cat.name} className="w-full h-full object-cover" />
            {onRemove && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove() }}
                className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
              >
                <i className="ri-close-line text-white text-[10px]" />
              </button>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-border-light flex items-center justify-center">
              <i className="ri-add-line text-lg text-text-secondary" />
            </div>
          </div>
        )}
      </button>
      <div className="flex items-center gap-1 px-0.5">
        {photoUrl && <i className="ri-checkbox-circle-fill text-terminal-green text-sm shrink-0" />}
        <p className="text-[11px] font-medium text-text-primary leading-tight flex-1 min-w-0 truncate">{cat.name}</p>
        <span className={`shrink-0 mt-0.5 text-[9px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded-full leading-none ${
          isMandatory
            ? 'text-brand bg-brand-red-50'
            : 'text-text-tertiary bg-surface-secondary'
        }`}>
          {isMandatory ? 'Required' : 'Optional'}
        </span>
      </div>
    </div>
  )
}

function CustomUploadedTile({ name, url, onRemove }: { name: string; url: string; onRemove: () => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-border-light">
        <img src={url} alt={name} className="w-full h-full object-cover" />
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
        >
          <i className="ri-close-line text-white text-[10px]" />
        </button>
      </div>
      <div className="flex items-center gap-1 px-0.5">
        <i className="ri-checkbox-circle-fill text-terminal-green text-sm shrink-0" />
        <p className="text-[11px] font-medium text-text-primary leading-tight flex-1 min-w-0 truncate">{name}</p>
        <span className="shrink-0 mt-0.5 text-[9px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded-full leading-none text-brand/70 bg-brand-red-50">
          Requested
        </span>
      </div>
    </div>
  )
}

function OtherTile({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={onClick}
        className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border-2 border-dashed border-border/60 hover:border-brand/40 bg-surface-secondary/20 hover:bg-brand-red-50/10 transition-all active:scale-[0.98]"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-border-light flex items-center justify-center">
            <i className="ri-add-line text-lg text-text-tertiary" />
          </div>
        </div>
      </button>
      <div className="flex items-center gap-1.5 px-0.5">
        <p className="text-[11px] font-medium text-text-tertiary leading-tight flex-1 min-w-0">Other</p>
        <span className="shrink-0 text-[9px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded-full leading-none text-text-tertiary bg-surface-secondary">
          Optional
        </span>
      </div>
    </div>
  )
}

export default function ComplianceDetail() {
  const { recordId } = useParams<{ recordId: string }>()
  const navigate = useNavigate()
  const records = useFacilityStore((s) => s.complianceRecords)
  const buildings = useFacilityStore((s) => s.buildings)
  const complianceUploads = useFacilityStore((s) => s.complianceUploads)
  const setPhoto = useFacilityStore((s) => s.setPhoto)
  const removePhoto = useFacilityStore((s) => s.removePhoto)
  const saveComplianceDraft = useFacilityStore((s) => s.saveComplianceDraft)
  const submitCompliance = useFacilityStore((s) => s.submitCompliance)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Regular upload state
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null)

  // Custom category upload state
  const [customModal, setCustomModal] = useState<string | null>(null)
  const [customModalView, setCustomModalView] = useState<'list' | 'request'>('list')
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null)
  const [requestCatName, setRequestCatName] = useState('')
  const [pendingCustom, setPendingCustom] = useState<{ group: string; catName: string } | null>(null)
  const [customUploads, setCustomUploads] = useState<Record<string, Array<{ name: string; url: string }>>>({})

  const record = records.find((r) => r.id === recordId)
  const building = record ? buildings.find((b) => b.id === record.buildingId) : undefined

  if (!record) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-sm text-text-secondary">Compliance record not found.</p>
      </div>
    )
  }

  const buildingId = record.buildingId
  const isEditable = record.status === 'pending' || record.status === 'draft'

  const photos = isEditable ? (complianceUploads[buildingId]?.photos ?? {}) : {}

  const cats = building
    ? infraCategories.filter((c) => {
        const app = c.applicability[building.type as BuildingType]
        return app === 'mandatory' || app === 'optional'
      })
    : []

  const catGroups = [...new Set(cats.map((c) => c.group))]
  const mandatoryCats = cats.filter(
    (c) => building && c.applicability[building.type as BuildingType] === 'mandatory'
  )
  const allMandatoryUploaded = mandatoryCats.every((c) => !!photos[c.id])
  const dynamicUploadedCount =
    Object.keys(photos).length +
    Object.values(customUploads).reduce((sum, arr) => sum + arr.length, 0)

  function handleUploadClick(categoryId: string) {
    setPendingCustom(null)
    setPendingCategoryId(categoryId)
    fileInputRef.current?.click()
  }

  function handleOtherTileClick(group: string) {
    setPendingCategoryId(null)
    setSelectedCatId(null)
    setCustomModalView('list')
    setRequestCatName('')
    setCustomModal(group)
  }

  function handleSendRequest() {
    const name = requestCatName.trim()
    if (!name || !customModal) return
    setPendingCustom({ group: customModal, catName: name })
    setRequestCatName('')
    setCustomModal(null)
    setCustomModalView('list')
    setTimeout(() => fileInputRef.current?.click(), 50)
  }

  function handleCustomConfirm() {
    if (!selectedCatId || !customModal) return
    const cat = infraCategories.find((c) => c.id === selectedCatId)
    if (!cat) return
    setPendingCustom({ group: customModal, catName: cat.name })
    setCustomModal(null)
    setTimeout(() => fileInputRef.current?.click(), 50)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)

    if (pendingCategoryId) {
      setPhoto(buildingId, pendingCategoryId, url)
      setPendingCategoryId(null)
    } else if (pendingCustom) {
      const { group, catName } = pendingCustom
      setCustomUploads((prev) => ({
        ...prev,
        [group]: [...(prev[group] ?? []), { name: catName, url }],
      }))
      setPendingCustom(null)
    }

    e.target.value = ''
  }

  function handleSaveDraft() {
    saveComplianceDraft(buildingId)
    navigate('/facility/compliance')
  }

  function handleSubmit() {
    if (!allMandatoryUploaded) return
    submitCompliance(buildingId)
    navigate('/facility/compliance')
  }

  const uploadedCats = record.categories.filter((c) => c.photoUrl)
  const period = `${MONTH_NAMES[record.month - 1]} ${record.year}`
  const initials = record.buildingName.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('')

  const detailCard = (
    <Card>
      <div className="flex items-center gap-3 mb-4">
        {building?.photoUrl ? (
          <img
            src={building.photoUrl}
            alt={building.name}
            className="h-14 w-14 rounded-full object-cover border border-border shrink-0"
          />
        ) : (
          <div className="h-14 w-14 rounded-full bg-brand-red-50 flex items-center justify-center text-base font-semibold text-brand border border-brand-red-100 shrink-0">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-base font-semibold text-text-primary leading-tight">{record.buildingName}</p>
            {building && (
              <p className="text-sm text-text-secondary mt-0.5">{building.location}, {building.city}</p>
            )}
          </div>
          <FacilityStatusBadge status={record.status} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm pt-3 border-t border-border-light">
        {building && <DetailItem label="Building Type" value={building.type} />}
        {building?.floors != null && <DetailItem label="Floors" value={`${building.floors}`} />}
        <DetailItem label="Period" value={period} />
        <DetailItem
          label="Photos Uploaded"
          value={isEditable
            ? `${dynamicUploadedCount} / ${cats.length}`
            : `${uploadedCats.length} / ${record.totalMandatory + record.totalOptional}`}
        />
        {record.submittedAt && <DetailItem label="Submitted" value={formatDate(record.submittedAt)} />}
        {record.submittedBy && <DetailItem label="Submitted By" value={record.submittedBy} />}
        {record.approvedAt && <DetailItem label="Approved" value={formatDate(record.approvedAt)} />}
        {record.approvedBy && <DetailItem label="Approved By" value={record.approvedBy} />}
      </div>

      {record.rejectionReason && (
        <div className="mt-3 pt-3 border-t border-border-light">
          <p className="text-xs text-text-tertiary mb-0.5">Rejection Reason</p>
          <p className="text-sm font-medium text-red-fg">{record.rejectionReason}</p>
        </div>
      )}
    </Card>
  )

  // Upload grid for pending / draft
  const uploadSection = (
    <div className="space-y-4">
      {catGroups.map((group) => {
        const groupCats = cats.filter((c) => c.group === group)
        const groupCustom = customUploads[group] ?? []
        return (
          <Card key={group}>
            <SectionLabel icon="ri-image-line" title={group} />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
              {groupCats.map((cat) => {
                const isMandatory = building
                  ? cat.applicability[building.type as BuildingType] === 'mandatory'
                  : false
                return (
                  <UploadTile
                    key={cat.id}
                    cat={cat}
                    isMandatory={isMandatory}
                    photoUrl={photos[cat.id]}
                    onClick={() => handleUploadClick(cat.id)}
                    onRemove={photos[cat.id] ? () => removePhoto(buildingId, cat.id) : undefined}
                  />
                )
              })}

              {groupCustom.map((custom, i) => (
                <CustomUploadedTile
                  key={`custom-${i}`}
                  name={custom.name}
                  url={custom.url}
                  onRemove={() =>
                    setCustomUploads((prev) => ({
                      ...prev,
                      [group]: prev[group].filter((_, idx) => idx !== i),
                    }))
                  }
                />
              ))}

              <OtherTile onClick={() => handleOtherTileClick(group)} />
            </div>
          </Card>
        )
      })}
    </div>
  )

  // Read-only photo grid for submitted / approved / rejected
  const photoReadSection = uploadedCats.length === 0 ? (
    <Card>
      <div className="flex flex-col items-center py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-surface-secondary flex items-center justify-center mb-3">
          <i className="ri-image-off-line text-2xl text-text-tertiary" />
        </div>
        <p className="text-sm font-medium text-text-secondary">No photos included</p>
        <p className="text-xs text-text-tertiary mt-1">No photos were uploaded in this submission.</p>
      </div>
    </Card>
  ) : (
    <div className="space-y-4">
      {[...new Set(uploadedCats.map((c) => c.group))].map((group) => {
        const groupCats = uploadedCats.filter((c) => c.group === group)
        return (
          <Card key={group}>
            <SectionLabel icon="ri-image-line" title={`${group} · ${groupCats.length}`} />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
              {groupCats.map((cat) => (
                <div key={cat.categoryId} className="flex flex-col gap-1.5">
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-border-light">
                    <img
                      src={cat.photoUrl}
                      alt={cat.categoryName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-1 px-0.5">
                    <i className="ri-checkbox-circle-fill text-terminal-green text-sm shrink-0" />
                    <p className="text-[11px] font-medium text-text-primary leading-tight flex-1 min-w-0 truncate">{cat.categoryName}</p>
                    {cat.uploadedAt && (
                      <span className="shrink-0 mt-0.5 text-[9px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded-full leading-none text-text-tertiary bg-surface-secondary">
                        {formatDate(cat.uploadedAt)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )
      })}
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      {/* Desktop header — actions shown here */}
      <PageHeader
        title={record.buildingName}
        breadcrumb={[{ label: 'Compliance', path: '/facility/compliance' }]}
        onBack={() => navigate(-1)}
        actions={isEditable ? (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={handleSaveDraft}>
              Save draft
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={!allMandatoryUploaded}>
              Submit
            </Button>
          </div>
        ) : undefined}
      />

      {/* Mobile header — no actions */}
      <header className="md:hidden shrink-0 flex items-center gap-2 px-3 py-2.5 bg-white border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-9 h-9 rounded-xl text-text-secondary active:bg-surface-secondary transition-colors -ml-1 shrink-0"
        >
          <i className="ri-arrow-left-line text-xl" />
        </button>
        <div className="flex-1 min-w-0 flex items-center gap-1 text-sm">
          <span className="text-text-tertiary truncate">Compliance</span>
          <span className="text-text-tertiary shrink-0">·</span>
          <span className="font-medium text-text-primary shrink-0">Details</span>
        </div>
        <FacilityStatusBadge status={record.status} />
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className={`px-4 md:px-6 py-5 max-w-2xl mx-auto space-y-4 ${isEditable ? 'pb-24 md:pb-5' : ''}`}>
          {detailCard}
          {isEditable ? uploadSection : photoReadSection}
        </div>
      </div>

      {/* Mobile-only sticky footer for editable records */}
      {isEditable && (
        <div className="md:hidden shrink-0 px-4 py-3 border-t border-border-light bg-white flex items-center gap-3">
          <Button size="md" variant="secondary" fullWidth onClick={handleSaveDraft}>
            Save draft
          </Button>
          <Button size="md" fullWidth onClick={handleSubmit} disabled={!allMandatoryUploaded}>
            Submit
          </Button>
        </div>
      )}

      {/* Shared file input */}
      {isEditable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/heic"
          className="hidden"
          onChange={handleFileChange}
        />
      )}

      {/* Custom category modal */}
      <Modal
        open={!!customModal}
        title={customModalView === 'request' ? 'Request new category' : (customModal ?? '')}
        onClose={() => { setCustomModal(null); setCustomModalView('list') }}
        footer={
          customModalView === 'list' ? (
            <div className="flex gap-2">
              <Button size="md" variant="secondary" fullWidth onClick={() => setCustomModal(null)}>
                Cancel
              </Button>
              <Button size="md" fullWidth disabled={!selectedCatId} onClick={handleCustomConfirm}>
                Upload photo
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button size="md" variant="secondary" fullWidth onClick={() => { setCustomModalView('list'); setRequestCatName('') }}>
                Back
              </Button>
              <Button size="md" fullWidth disabled={!requestCatName.trim()} onClick={handleSendRequest}>
                Upload photo
              </Button>
            </div>
          )
        }
      >
        {customModalView === 'list' ? (
          <div className="space-y-1">
            {infraCategories
              .filter((c) => c.group === customModal)
              .map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`w-full text-left flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    selectedCatId === cat.id
                      ? 'bg-brand-red-50 text-brand font-medium'
                      : 'text-text-primary hover:bg-surface-secondary'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {selectedCatId === cat.id && (
                    <i className="ri-check-line shrink-0 text-brand" />
                  )}
                </button>
              ))}

            {/* Request new category row */}
            <button
              type="button"
              onClick={() => { setSelectedCatId(null); setCustomModalView('request') }}
              className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-text-tertiary hover:bg-surface-secondary transition-colors mt-1 border-t border-border-light pt-3"
            >
              <i className="ri-add-circle-line text-base shrink-0" />
              <span>Request a new category</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">
              Suggest a new category to be added under{' '}
              <span className="font-medium text-text-primary">{customModal}</span>. It will be reviewed by the compliance team.
            </p>
            <input
              type="text"
              value={requestCatName}
              onChange={(e) => setRequestCatName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendRequest()}
              placeholder="e.g. Rooftop Access, Server Room..."
              autoFocus
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
            />
          </div>
        )}
      </Modal>
    </div>
  )
}
