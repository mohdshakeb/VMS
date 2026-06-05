import { useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Button from '@/components/Button'
import SectionLabel from '@/components/common/SectionLabel'
import FacilityStatusBadge from '@/components/facility/FacilityStatusBadge'
import type { ChecklistAnswer, ComplianceChecklistEntry } from '@/types/facility'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function formatDate(ts?: string) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const ANSWER_CONFIG: Record<ChecklistAnswer, { label: string; selected: string; unselected: string }> = {
  yes:     { label: 'Yes',     selected: 'bg-brand-red-50 border-brand-red-100 text-brand font-semibold',  unselected: 'bg-white border-border text-text-secondary hover:border-brand-red-100 hover:text-brand' },
  partial: { label: 'Partial', selected: 'bg-brand-red-50 border-brand-red-100 text-brand font-semibold', unselected: 'bg-white border-border text-text-secondary hover:border-brand-red-100 hover:text-brand' },
  no:      { label: 'No',      selected: 'bg-brand-red-50 border-brand-red-100 text-brand font-semibold', unselected: 'bg-white border-border text-text-secondary hover:border-brand-red-100 hover:text-brand' },
  na:      { label: 'N/A',     selected: 'bg-brand-red-50 border-brand-red-100 text-brand font-semibold', unselected: 'bg-white border-border text-text-secondary hover:border-brand-red-100 hover:text-brand' },
}

function needsPhotos(answer?: ChecklistAnswer) {
  return answer === 'yes' || answer === 'partial'
}

function isEntryComplete(entry: ComplianceChecklistEntry) {
  if (entry.answer === undefined) return false
  if (needsPhotos(entry.answer)) return entry.photos.length >= 1
  return true
}

// ─── Editable item row ────────────────────────────────────────────────────────

function ChecklistItemRow({
  entry,
  onAnswer,
  onRemarks,
  onAddPhoto,
  onRemovePhoto,
}: {
  entry: ComplianceChecklistEntry
  onAnswer: (answer: ChecklistAnswer) => void
  onRemarks: (remarks: string) => void
  onAddPhoto: () => void
  onRemovePhoto: (index: number) => void
}) {
  const answers: ChecklistAnswer[] = entry.isMandatory
    ? ['yes', 'partial', 'no']
    : ['yes', 'partial', 'no', 'na']

  const photosRequired = needsPhotos(entry.answer)
  const photosMissing = photosRequired && entry.photos.length === 0

  return (
    <div className="py-4 border-b border-border-light last:border-0">
      <div className="flex items-start gap-1.5 mb-3">
        <p className="text-sm text-text-primary leading-snug flex-1">
          {entry.label}
          {entry.isMandatory && <span className="text-brand font-bold ml-0.5">*</span>}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {answers.map((ans) => {
          const cfg = ANSWER_CONFIG[ans]
          const selected = entry.answer === ans
          return (
            <button
              key={ans}
              type="button"
              onClick={() => onAnswer(ans)}
              className={`px-3.5 py-1.5 rounded-lg text-xs border transition-colors ${selected ? cfg.selected : cfg.unselected}`}
            >
              {cfg.label}
            </button>
          )
        })}
      </div>

      {entry.answer === 'partial' && (
        <textarea
          value={entry.remarks ?? ''}
          onChange={(e) => onRemarks(e.target.value)}
          placeholder="Describe what's partially done or missing…"
          rows={2}
          className="mt-3 w-full text-sm px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/40 focus:outline-none focus:ring-2 focus:ring-amber-300/50 focus:border-amber-400 placeholder:text-text-tertiary resize-none"
        />
      )}

      {photosRequired && (
        <div className="mt-3">
          <p className={`text-xs mb-2 ${photosMissing ? 'text-red-500 font-medium' : 'text-text-tertiary'}`}>
            {photosMissing ? 'At least 1 photo required' : `Photos (${entry.photos.length}/4)`}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {entry.photos.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border-light">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => onRemovePhoto(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
                >
                  <i className="ri-close-line text-white text-[10px]" />
                </button>
              </div>
            ))}
            {entry.photos.length < 4 && (
              <button
                type="button"
                onClick={onAddPhoto}
                className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-brand/50 bg-surface-secondary/30 hover:bg-brand-red-50/20 flex items-center justify-center transition-colors"
              >
                <i className="ri-add-line text-xl text-text-tertiary" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Read-only item row ───────────────────────────────────────────────────────

function ChecklistItemRowReadOnly({ entry }: { entry: ComplianceChecklistEntry }) {
  if (!entry.answer) return null
  const cfg = ANSWER_CONFIG[entry.answer]

  return (
    <div className="py-4 border-b border-border-light last:border-0">
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-sm text-text-primary leading-snug flex-1 min-w-0">
          {entry.label}
          {entry.isMandatory && <span className="text-brand font-bold ml-0.5">*</span>}
        </p>
        <span className={`shrink-0 text-xs px-2.5 py-1 rounded-lg border ${cfg.selected}`}>
          {cfg.label}
        </span>
      </div>

      {entry.remarks && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
          {entry.remarks}
        </p>
      )}

      {entry.photos.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-2">
          {entry.photos.map((url, i) => (
            <div key={i} className="aspect-square rounded-lg overflow-hidden border border-border-light">
              <img src={url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ComplianceDetail() {
  const { recordId } = useParams<{ recordId: string }>()
  const navigate = useNavigate()
  const records = useFacilityStore((s) => s.complianceRecords)
  const buildings = useFacilityStore((s) => s.buildings)
  const setChecklistAnswer = useFacilityStore((s) => s.setChecklistAnswer)
  const setChecklistRemarks = useFacilityStore((s) => s.setChecklistRemarks)
  const addChecklistPhoto = useFacilityStore((s) => s.addChecklistPhoto)
  const removeChecklistPhoto = useFacilityStore((s) => s.removeChecklistPhoto)
  const saveComplianceDraft = useFacilityStore((s) => s.saveComplianceDraft)
  const submitCompliance = useFacilityStore((s) => s.submitCompliance)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingItemId, setPendingItemId] = useState<string | null>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const record = records.find((r) => r.id === recordId)
  const building = record ? buildings.find((b) => b.id === record.buildingId) : undefined

  const sections = record ? [...new Set(record.checklist.map((e) => e.section))] : []
  const [activeSection, setActiveSection] = useState<string>(sections[0] ?? '')

  if (!record) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-sm text-text-secondary">Compliance record not found.</p>
      </div>
    )
  }

  const isEditable = record.status === 'pending' || record.status === 'draft'
  const period = `${MONTH_NAMES[record.month - 1]} ${record.year}`

  const totalItems = record.checklist.length
  const answeredItems = record.checklist.filter((e) => e.answer !== undefined).length
  const mandatoryEntries = record.checklist.filter((e) => e.isMandatory)
  const canSubmit = mandatoryEntries.every(isEntryComplete) && mandatoryEntries.length > 0

  function handleAddPhoto(itemId: string) {
    setPendingItemId(itemId)
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !pendingItemId || !recordId) return
    const url = URL.createObjectURL(file)
    addChecklistPhoto(recordId, pendingItemId, url)
    setPendingItemId(null)
    e.target.value = ''
  }

  function handleSaveDraft() {
    if (!recordId) return
    saveComplianceDraft(recordId)
    navigate('/facility/compliance')
  }

  function handleSubmit() {
    if (!recordId || !canSubmit) return
    submitCompliance(recordId)
    navigate('/facility/compliance')
  }

  function scrollToSection(section: string) {
    setActiveSection(section)
    sectionRefs.current[section]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Track active section as user scrolls
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const containerTop = container.getBoundingClientRect().top + 24

    let closestSection = sections[0]
    let closestDist = Infinity

    sections.forEach((s) => {
      const el = sectionRefs.current[s]
      if (!el) return
      const dist = Math.abs(el.getBoundingClientRect().top - containerTop)
      if (dist < closestDist) {
        closestDist = dist
        closestSection = s
      }
    })

    if (closestSection) setActiveSection(closestSection)
  }, [sections])

  const initials = record.buildingName.split(/[\s-]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('')

  // ─── Detail card ─────────────────────────────────────────────────────────────

  const detailCard = (
    <Card>
      <div className="flex items-center gap-3 mb-4">
        {building?.photoUrl ? (
          <img src={building.photoUrl} alt={building.name} className="h-14 w-14 rounded-full object-cover border border-border shrink-0" />
        ) : (
          <div className="h-14 w-14 rounded-full bg-brand-red-50 flex items-center justify-center text-base font-semibold text-brand border border-brand-red-100 shrink-0">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-base font-semibold text-text-primary leading-tight truncate">{record.buildingName}</p>
            {building && <p className="text-sm text-text-secondary mt-0.5">{building.location}</p>}
          </div>
          <FacilityStatusBadge status={record.status} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm pt-3 border-t border-border-light">
        <div>
          <p className="text-xs text-text-tertiary">Period</p>
          <p className="text-sm font-medium text-text-primary mt-0.5">{period}</p>
        </div>
        <div>
          <p className="text-xs text-text-tertiary">Progress</p>
          <p className="text-sm font-medium text-text-primary mt-0.5">{answeredItems} / {totalItems} answered</p>
        </div>
        {record.submittedAt && (
          <div>
            <p className="text-xs text-text-tertiary">Completed</p>
            <p className="text-sm font-medium text-text-primary mt-0.5">{formatDate(record.submittedAt)}</p>
          </div>
        )}
        {record.submittedBy && (
          <div>
            <p className="text-xs text-text-tertiary">Completed By</p>
            <p className="text-sm font-medium text-text-primary mt-0.5">{record.submittedBy}</p>
          </div>
        )}
        {record.approvedAt && (
          <div>
            <p className="text-xs text-text-tertiary">Reviewed</p>
            <p className="text-sm font-medium text-text-primary mt-0.5">{formatDate(record.approvedAt)}</p>
          </div>
        )}
        {record.approvedBy && (
          <div>
            <p className="text-xs text-text-tertiary">Reviewed By</p>
            <p className="text-sm font-medium text-text-primary mt-0.5">{record.approvedBy}</p>
          </div>
        )}
      </div>

    </Card>
  )

  // ─── Section nav ──────────────────────────────────────────────────────────────

  const sectionNav = (
    <Card padding="none">
      <div className="p-3">
        <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider px-1 mb-2">Sections</p>
        <nav className="space-y-0.5">
          {sections.map((section) => {
            const entries = record.checklist.filter((e) => e.section === section)
            const answered = isEditable
              ? entries.filter((e) => e.answer !== undefined).length
              : entries.filter(isEntryComplete).length
            const isActive = activeSection === section
            return (
              <button
                key={section}
                type="button"
                onClick={() => scrollToSection(section)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between gap-2 ${
                  isActive
                    ? 'bg-brand-red-50 text-brand font-medium'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50'
                }`}
              >
                <span className="truncate">{section}</span>
                <span className={`shrink-0 text-xs tabular-nums ${isActive ? 'text-brand' : 'text-text-tertiary'}`}>
                  {answered}/{entries.length}
                </span>
              </button>
            )
          })}
        </nav>
      </div>
    </Card>
  )

  // ─── Checklist sections (flat) ────────────────────────────────────────────────

  const checklistSections = (
    <div className="space-y-4">
      {sections.map((section) => {
        const entries = record.checklist.filter((e) => e.section === section)
        const answered = isEditable
          ? entries.filter((e) => e.answer !== undefined).length
          : entries.filter(isEntryComplete).length

        return (
          <div
            key={section}
            ref={(el) => { sectionRefs.current[section] = el }}
            data-section={section}
          >
            <Card>
              <div className="flex items-center justify-between">
                <SectionLabel icon="ri-list-check" title={section} />
                <span className="text-xs text-text-tertiary tabular-nums">{answered}/{entries.length}</span>
              </div>
              <div className="mt-1">
                {isEditable
                  ? entries.map((entry) => (
                      <ChecklistItemRow
                        key={entry.itemId}
                        entry={entry}
                        onAnswer={(ans) => setChecklistAnswer(record.id, entry.itemId, ans)}
                        onRemarks={(rem) => setChecklistRemarks(record.id, entry.itemId, rem)}
                        onAddPhoto={() => handleAddPhoto(entry.itemId)}
                        onRemovePhoto={(i) => removeChecklistPhoto(record.id, entry.itemId, i)}
                      />
                    ))
                  : entries.map((entry) => (
                      <ChecklistItemRowReadOnly key={entry.itemId} entry={entry} />
                    ))
                }
              </div>
            </Card>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={record.buildingName}
        breadcrumb={[{ label: 'Compliance', path: '/facility/compliance' }]}
        onBack={() => navigate(-1)}
        actions={isEditable ? (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={handleSaveDraft}>Save draft</Button>
            <Button size="sm" onClick={handleSubmit} disabled={!canSubmit}>Submit</Button>
          </div>
        ) : undefined}
      />

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
          <span className="font-medium text-text-primary shrink-0 truncate">{record.buildingName}</span>
        </div>
        <FacilityStatusBadge status={record.status} />
      </header>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto" onScroll={handleScroll}>
        {/* Mobile: single column */}
        <div className={`md:hidden px-4 py-5 space-y-4 max-w-lg mx-auto ${isEditable ? 'pb-24' : ''}`}>
          {detailCard}
          {checklistSections}
        </div>

        {/* Desktop: two-column with sticky left */}
        <div className="hidden md:flex gap-6 px-6 py-6 items-start">
          <div className="w-72 shrink-0 sticky top-6 self-start space-y-3">
            {detailCard}
            {sectionNav}
          </div>
          <div className={`flex-1 min-w-0 ${isEditable ? 'pb-5' : ''}`}>
            {checklistSections}
          </div>
        </div>
      </div>

      {isEditable && (
        <div className="md:hidden shrink-0 px-4 py-3 border-t border-border-light bg-white flex items-center gap-3">
          <Button size="md" variant="secondary" fullWidth onClick={handleSaveDraft}>Save draft</Button>
          <Button size="md" fullWidth onClick={handleSubmit} disabled={!canSubmit}>Submit</Button>
        </div>
      )}

      {isEditable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/heic"
          className="hidden"
          onChange={handleFileChange}
        />
      )}
    </div>
  )
}
