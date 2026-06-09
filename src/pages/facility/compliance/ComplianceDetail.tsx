import { useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import SectionLabel from '@/components/common/SectionLabel'
import FacilityStatusBadge from '@/components/facility/FacilityStatusBadge'
import type { ChecklistAnswer, ComplianceChecklistEntry } from '@/types/facility'
import FacilityIdentityCard from '@/components/facility/FacilityIdentityCard'
import { formatComplianceDueDate, getComplianceDueDate, isCurrentPeriod, PROTOTYPE_NOW } from '@/data/facilityData'

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


function isEntryComplete(entry: ComplianceChecklistEntry) {
  if (entry.answer === undefined) return false
  if (entry.isMandatory) return entry.photos.length >= 1
  return true
}

function renderLabel(label: string, isMandatory: boolean) {
  const m = label.match(/^(\d+(?:\.\d+)*)\s+(.+)/)
  if (!m) {
    return (
      <p className="text-sm text-text-primary leading-snug flex-1">
        {label}{isMandatory && <span className="text-brand font-bold ml-0.5">*</span>}
      </p>
    )
  }
  return (
    <div className="flex items-start gap-1 flex-1">
      <span className="text-sm text-text-primary font-medium shrink-0 tabular-nums">{m[1]}</span>
      <p className="text-sm text-text-primary leading-snug">
        {m[2]}{isMandatory && <span className="text-brand font-bold ml-0.5">*</span>}
      </p>
    </div>
  )
}

// ─── Editable item row ────────────────────────────────────────────────────────

function ChecklistItemRow({
  entry,
  onAnswer,
  onRemarks,
  onAddPhoto,
  onRemovePhoto,
  showValidation = false,
}: {
  entry: ComplianceChecklistEntry
  onAnswer: (answer: ChecklistAnswer) => void
  onRemarks: (remarks: string) => void
  onAddPhoto: () => void
  onRemovePhoto: (index: number) => void
  showValidation?: boolean
}) {
  const answers: ChecklistAnswer[] = entry.isMandatory
    ? ['yes', 'partial', 'no']
    : ['yes', 'partial', 'no', 'na']

  // For mandatory items, always show extras; for optional items, only after a non-NA selection
  const showExtras = entry.isMandatory || (entry.answer !== undefined && entry.answer !== 'na')
  const isIncomplete = showValidation && !isEntryComplete(entry)

  return (
    <div className={`py-4 border-b border-border-light last:border-0 transition-colors ${isIncomplete ? 'bg-red-50/50 -mx-4 px-4' : ''}`}>
      <div className="flex items-start gap-1.5 mb-3">
        {renderLabel(entry.label, entry.isMandatory)}
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

      {showExtras && (
        <div className="mt-3">
          <p className="text-xs mb-2 text-text-tertiary">
            {entry.isMandatory
              ? `Photos (${entry.photos.length}/4)`
              : `Photos (${entry.photos.length}/4) — optional`}
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

      {showExtras && entry.answer !== 'na' && (
        <textarea
          value={entry.remarks ?? ''}
          onChange={(e) => onRemarks(e.target.value)}
          placeholder="Add a comment (optional)…"
          rows={2}
          className="mt-3 w-full text-sm px-3 py-2 rounded-xl border border-border bg-surface-secondary/30 focus:outline-none focus:ring-2 focus:ring-border focus:border-border placeholder:text-text-tertiary resize-none"
        />
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
        {renderLabel(entry.label, entry.isMandatory)}
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
  const facilities = useFacilityStore((s) => s.facilities)
  const setChecklistAnswer = useFacilityStore((s) => s.setChecklistAnswer)
  const setChecklistRemarks = useFacilityStore((s) => s.setChecklistRemarks)
  const addChecklistPhoto = useFacilityStore((s) => s.addChecklistPhoto)
  const removeChecklistPhoto = useFacilityStore((s) => s.removeChecklistPhoto)
  const clearCompliance = useFacilityStore((s) => s.clearCompliance)
  const saveComplianceDraft = useFacilityStore((s) => s.saveComplianceDraft)
  const submitCompliance = useFacilityStore((s) => s.submitCompliance)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingItemId, setPendingItemId] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [pendingNav, setPendingNav] = useState<string | number | null>(null)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showSubmitSuccess, setShowSubmitSuccess] = useState(false)
  const [showDraftSaved, setShowDraftSaved] = useState(false)
  const [showOverflow, setShowOverflow] = useState(false)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const record = records.find((r) => r.id === recordId)
  const building = record ? facilities.find((f) => f.id === record.facilityId) : undefined

  const sections = record ? [...new Set(record.checklist.map((e) => e.section))] : []
  const [activeSection, setActiveSection] = useState<string>(sections[0] ?? '')

  if (!record) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-sm text-text-secondary">Compliance record not found.</p>
      </div>
    )
  }

  const isEditable = (record.status === 'pending' || record.status === 'draft' || record.status === 'submitted' || record.status === 'updated' || record.status === 'overdue') && isCurrentPeriod(record.month, record.year)
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
    setIsDirty(true)
    addChecklistPhoto(recordId, pendingItemId, url)
    setPendingItemId(null)
    e.target.value = ''
  }

  function handleClear() {
    if (!recordId) return
    clearCompliance(recordId)
    setSubmitAttempted(false)
    setIsDirty(false)
    setShowClearConfirm(false)
  }

  function handleSaveDraft() {
    if (!recordId) return
    saveComplianceDraft(recordId)
    setIsDirty(false)
    setShowDraftSaved(true)
  }

  function handleSubmit() {
    if (!recordId) return
    if (!canSubmit) {
      setSubmitAttempted(true)
      return
    }
    submitCompliance(recordId)
    setIsDirty(false)
    setShowSubmitSuccess(true)
  }

  function handleNavAway(target: string | number) {
    if (isDirty) { setPendingNav(target); return }
    navigate(target as any)
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

  // ─── Detail card ─────────────────────────────────────────────────────────────

  const dueDate = getComplianceDueDate(record.month, record.year)
  const isPastDue = PROTOTYPE_NOW > dueDate
  const isOverdueRecord = record.status === 'overdue'
  const isMissedRecord = record.status === 'missed'

  const complianceFields = [
    { label: 'Period', value: period },
    {
      label: 'Due date',
      value: (
        <span className={`text-sm font-medium ${isOverdueRecord || isMissedRecord ? 'text-red-fg' : isPastDue && record.status !== 'submitted' && record.status !== 'updated' ? 'text-red-fg' : 'text-text-primary'}`}>
          {formatComplianceDueDate(record.month, record.year)}
          {isMissedRecord && <span className="ml-1.5 text-xs font-normal">— Missed</span>}
          {isOverdueRecord && <span className="ml-1.5 text-xs font-normal">— Overdue</span>}
        </span>
      ),
    },
    { label: 'Progress', value: `${answeredItems} / ${totalItems} answered` },
    ...(record.submittedBy || record.submittedAt ? [{
      label: 'Last updated',
      value: (
        <div>
          {record.submittedBy && <p className="text-sm font-medium text-text-primary">{record.submittedBy}</p>}
          {record.submittedAt && <p className="text-xs text-text-tertiary mt-0.5">{formatDate(record.submittedAt)}</p>}
        </div>
      ),
    }] : []),
    {
      label: 'Status',
      value: <FacilityStatusBadge status={record.status} />,
    },
  ]

  const detailCard = (
    <FacilityIdentityCard
      photoUrl={building?.photoUrl}
      name={record.facilityName}
      location={building?.location}
      fields={complianceFields}
      hidePhoto
      showAvatar
    />
  )

  // ─── Section nav ──────────────────────────────────────────────────────────────

  const sectionNav = (
    <Card padding="none">
      <div className="p-3">
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

  // ─── Checklist sections (with subsections) ───────────────────────────────────

  const incompleteCount = mandatoryEntries.filter((e) => !isEntryComplete(e)).length

  const checklistSections = (
    <div className="space-y-4">
      {isOverdueRecord && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex items-start gap-2.5">
          <i className="ri-alarm-warning-line text-red-500 text-base shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">
            This compliance was due on <strong>{formatComplianceDueDate(record.month, record.year)}</strong>. It can still be submitted late — complete the checklist and submit to clear the overdue status.
          </p>
        </div>
      )}
      {isMissedRecord && (
        <div className="rounded-xl bg-surface-secondary border border-border px-4 py-3 flex items-start gap-2.5">
          <i className="ri-close-circle-line text-text-tertiary text-base shrink-0 mt-0.5" />
          <p className="text-sm text-text-secondary">
            This compliance period was <strong>missed</strong> — the due date of <strong>{formatComplianceDueDate(record.month, record.year)}</strong> has passed and no submission was made. No further action can be taken on this record.
          </p>
        </div>
      )}
      {submitAttempted && !canSubmit && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex items-start gap-2.5">
          <i className="ri-error-warning-line text-red-500 text-base shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">
            {incompleteCount} mandatory {incompleteCount === 1 ? 'item is' : 'items are'} incomplete. Each required item needs an answer and at least one photo.
          </p>
        </div>
      )}
      {sections.map((section) => {
        const entries = record.checklist.filter((e) => e.section === section)
        const answered = isEditable
          ? entries.filter((e) => e.answer !== undefined).length
          : entries.filter(isEntryComplete).length

        const subsections = [...new Set(entries.map((e) => e.subsection ?? ''))]
        const hasSubsections = subsections.some((s) => s !== '')

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
                {hasSubsections
                  ? subsections.map((sub, idx) => {
                      const subEntries = entries.filter((e) => (e.subsection ?? '') === sub)
                      return (
                        <div key={sub} className={idx > 0 ? 'mt-6 pt-4 border-t border-border-light' : ''}>
                          {sub && (
                            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider pb-2">
                              {sub}
                            </p>
                          )}
                          {isEditable
                            ? subEntries.map((entry) => (
                                <ChecklistItemRow
                                  key={entry.itemId}
                                  entry={entry}
                                  showValidation={submitAttempted}
                                  onAnswer={(ans) => { setIsDirty(true); setChecklistAnswer(record.id, entry.itemId, ans) }}
                                  onRemarks={(rem) => { setIsDirty(true); setChecklistRemarks(record.id, entry.itemId, rem) }}
                                  onAddPhoto={() => handleAddPhoto(entry.itemId)}
                                  onRemovePhoto={(i) => { setIsDirty(true); removeChecklistPhoto(record.id, entry.itemId, i) }}
                                />
                              ))
                            : subEntries.map((entry) => (
                                <ChecklistItemRowReadOnly key={entry.itemId} entry={entry} />
                              ))
                          }
                        </div>
                      )
                    })
                  : isEditable
                    ? entries.map((entry) => (
                        <ChecklistItemRow
                          key={entry.itemId}
                          entry={entry}
                          showValidation={submitAttempted}
                          onAnswer={(ans) => { setIsDirty(true); setChecklistAnswer(record.id, entry.itemId, ans) }}
                          onRemarks={(rem) => { setIsDirty(true); setChecklistRemarks(record.id, entry.itemId, rem) }}
                          onAddPhoto={() => handleAddPhoto(entry.itemId)}
                          onRemovePhoto={(i) => { setIsDirty(true); removeChecklistPhoto(record.id, entry.itemId, i) }}
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
        title={record.facilityName}
        breadcrumb={[{ label: 'Compliance' }]}
        onBack={() => handleNavAway(-1)}
        actions={isEditable ? (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={handleSaveDraft}>Save draft</Button>
            <Button size="sm" onClick={handleSubmit}>Submit</Button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowOverflow((v) => !v)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface-secondary/50 transition-colors"
              >
                <i className="ri-more-2-fill text-base" />
              </button>
              {showOverflow && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowOverflow(false)} />
                  <div className="absolute right-0 top-full mt-1.5 z-40 bg-white border border-border rounded-xl shadow-lg py-1 min-w-[140px]">
                    <button
                      type="button"
                      onClick={() => { setShowOverflow(false); setShowClearConfirm(true) }}
                      className="w-full text-left px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <i className="ri-refresh-line text-base" />
                      Clear all
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : undefined}
      />

      <header className="md:hidden shrink-0 flex items-center gap-2 px-3 py-2.5 bg-white border-b border-border">
        <button
          onClick={() => handleNavAway(-1)}
          className="flex items-center justify-center w-9 h-9 rounded-xl text-text-secondary active:bg-surface-secondary transition-colors -ml-1 shrink-0"
        >
          <i className="ri-arrow-left-line text-xl" />
        </button>
        <div className="flex-1 min-w-0 flex items-center gap-1 text-sm">
          <span className="text-text-tertiary truncate">Compliance</span>
          <span className="text-text-tertiary shrink-0">·</span>
          <span className="font-medium text-text-primary shrink-0 truncate">{record.facilityName}</span>
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
        <div className="md:hidden shrink-0 px-4 py-3 border-t border-border-light bg-white flex items-center gap-2">
          <Button size="md" variant="secondary" fullWidth onClick={handleSaveDraft}>Save draft</Button>
          <Button size="md" fullWidth onClick={handleSubmit}>Submit</Button>
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowOverflow((v) => !v)}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-border text-text-secondary hover:bg-surface-secondary/50 transition-colors"
            >
              <i className="ri-more-2-fill text-base" />
            </button>
            {showOverflow && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowOverflow(false)} />
                <div className="absolute right-0 bottom-full mb-1.5 z-40 bg-white border border-border rounded-xl shadow-lg py-1 min-w-[140px]">
                  <button
                    type="button"
                    onClick={() => { setShowOverflow(false); setShowClearConfirm(true) }}
                    className="w-full text-left px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <i className="ri-refresh-line text-base" />
                    Clear all
                  </button>
                </div>
              </>
            )}
          </div>
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

      {/* Submit success */}
      <Modal open={showSubmitSuccess} onClose={() => { setShowSubmitSuccess(false); navigate('/facility/compliance') }} size="md">
        <div className="py-4 flex flex-col items-center text-center gap-5">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-confirmed-surface)' }}
          >
            <i className="ri-shield-check-fill text-4xl" style={{ color: 'var(--color-confirmed)' }} />
          </div>
          <div>
            <p className="text-base font-semibold text-text-primary">Compliance Submitted</p>
            <p className="text-sm text-text-secondary mt-1">{record.facilityName}</p>
            <p className="text-xs text-text-tertiary mt-0.5">{period}</p>
          </div>
          <Button fullWidth onClick={() => { setShowSubmitSuccess(false); navigate('/facility/compliance') }}>Done</Button>
        </div>
      </Modal>

      {/* Draft saved */}
      <Modal open={showDraftSaved} onClose={() => setShowDraftSaved(false)} size="md">
        <div className="py-4 flex flex-col items-center text-center gap-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-surface-secondary">
            <i className="ri-save-3-fill text-4xl text-text-secondary" />
          </div>
          <div>
            <p className="text-base font-semibold text-text-primary">Draft Saved</p>
            <p className="text-sm text-text-secondary mt-1">{record.facilityName}</p>
            <p className="text-xs text-text-tertiary mt-0.5">{period}</p>
          </div>
          <Button fullWidth onClick={() => setShowDraftSaved(false)}>Done</Button>
        </div>
      </Modal>

      {/* Unsaved changes */}
      <Modal
        open={pendingNav !== null}
        onClose={() => setPendingNav(null)}
        title="Unsaved Changes"
        footer={
          <div className="flex flex-col gap-2">
            <Button
              size="md"
              fullWidth
              onClick={() => {
                if (recordId) saveComplianceDraft(recordId)
                setIsDirty(false)
                navigate(pendingNav as any)
              }}
            >
              Save draft
            </Button>
            <Button
              size="md"
              variant="secondary"
              fullWidth
              onClick={() => { setIsDirty(false); navigate(pendingNav as any) }}
            >
              Discard changes
            </Button>
          </div>
        }
      >
        <p className="text-sm text-text-secondary py-2">Save a draft to continue later, or discard your changes.</p>
      </Modal>

      {/* Clear all confirm */}
      <Modal
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="Start Over?"
        footer={
          <div className="flex gap-2">
            <Button size="md" variant="secondary" fullWidth onClick={() => setShowClearConfirm(false)}>Cancel</Button>
            <Button size="md" fullWidth onClick={handleClear}>Clear all</Button>
          </div>
        }
      >
        <p className="text-sm text-text-secondary py-2">All answers, photos, and comments will be cleared. This cannot be undone.</p>
      </Modal>
    </div>
  )
}
