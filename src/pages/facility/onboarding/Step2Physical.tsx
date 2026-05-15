import { useState } from 'react'
import { useFacilityStore } from '@/store/facilityStore'
import { infraCategories } from '@/data/facilityData'
import Modal from '@/components/Modal'
import type { BuildingType, InfraApplicability } from '@/types/facility'


const BUILDING_TYPES = ['Branch Office', 'Parts Warehouse', 'CRC', 'MRC', 'Repair Center', 'Executive Office', 'HQ']
const ALL_GROUPS = ['External', 'Office', 'Workshop', 'Warehouse', 'Electrical', 'Fire & Safety', 'Environment', 'Security', 'Utilities']

function getApplicability(cat: typeof infraCategories[0], buildingType: string): InfraApplicability {
  return cat.applicability[buildingType as BuildingType] ?? 'not-applicable'
}

export default function Step2Physical() {
  const formData = useFacilityStore((s) => s.onboardingFormData)
  const setField = useFacilityStore((s) => s.setOnboardingField)
  const [showEditModal, setShowEditModal] = useState(false)
  const [activeGroup, setActiveGroup] = useState('External')
  const [newCategoryName, setNewCategoryName] = useState('')

  const buildingType = formData.buildingType

  const mandatoryIds = buildingType
    ? infraCategories.filter((c) => getApplicability(c, buildingType) === 'mandatory').map((c) => c.id)
    : []

  const optionalIds = buildingType
    ? infraCategories.filter((c) => getApplicability(c, buildingType) === 'optional').map((c) => c.id)
    : infraCategories.map((c) => c.id)

  const selected: string[] = formData.selectedCategories.length > 0
    ? formData.selectedCategories
    : buildingType ? [...mandatoryIds, ...optionalIds] : []

  function toggleOptional(id: string) {
    if (mandatoryIds.includes(id)) return
    const next = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]
    setField('selectedCategories', next)
  }

  function addCustomCategory() {
    const name = newCategoryName.trim()
    if (!name) return
    const customs = Array.isArray(formData.customCategories) ? formData.customCategories : []
    if (!customs.includes(name)) {
      setField('customCategories', [...customs, name])
    }
    setNewCategoryName('')
  }

  const applicableCats = buildingType
    ? infraCategories.filter((c) => getApplicability(c, buildingType) !== 'not-applicable')
    : []

  const customCats = (formData.customCategories ?? []).map((name, i) => ({
    id: `custom-${i}`,
    name,
    group: 'Custom',
    applicability: {} as Record<BuildingType, InfraApplicability>,
  }))

  const mandatoryCount = mandatoryIds.length
  const selectedOptionalCount = selected.filter((id) => optionalIds.includes(id)).length

  return (
    <>
      <div className="space-y-4 mb-6">
        {/* Building Name */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Building Name <span className="text-terminal-red">*</span>
          </label>
          <input
            type="text"
            value={formData.buildingName}
            onChange={(e) => setField('buildingName', e.target.value)}
            placeholder="Unique within location"
            className="form-input"
          />
        </div>

        {/* Building Type */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Building Type <span className="text-terminal-red">*</span>
          </label>
          <select
            value={formData.buildingType}
            onChange={(e) => setField('buildingType', e.target.value)}
            className="form-input"
          >
            <option value="">Select building type</option>
            {BUILDING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Building Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setField('description', e.target.value)}
            placeholder="Additional details"
            rows={3}
            className="form-input resize-none"
          />
        </div>

        {/* Physical dimensions */}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-text-secondary mb-1.5">No. of Floors <span className="text-terminal-red">*</span></label>
            <input type="number" value={formData.floors} onChange={(e) => setField('floors', e.target.value)} placeholder="e.g. 3" className="form-input" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Total Area (sq. ft)</label>
            <input type="number" value={formData.area} onChange={(e) => setField('area', e.target.value)} placeholder="e.g. 6200" className="form-input" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Year of Construction</label>
            <input type="number" value={formData.yearOfConstruction} onChange={(e) => setField('yearOfConstruction', e.target.value)} placeholder="e.g. 2010" className="form-input" />
          </div>
        </div>
      </div>

      {/* Infrastructure categories */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-semibold text-text-primary">Infrastructure Categories</h4>
            {buildingType && (
              <p className="text-xs text-text-tertiary mt-0.5">
                {mandatoryCount} required · {selectedOptionalCount} optional selected
                {customCats.length > 0 && ` · ${customCats.length} custom`}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="text-xs font-medium text-brand hover:text-brand-hover transition-colors flex items-center gap-1"
          >
            <i className="ri-pencil-line text-sm" />
            Edit categories
          </button>
        </div>

        {!buildingType ? (
          <p className="text-xs text-text-tertiary">Select a building type above to see applicable categories.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {/* Mandatory pills — disabled look, no interaction */}
            {applicableCats.filter((c) => mandatoryIds.includes(c.id)).map((cat) => (
              <span
                key={cat.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-secondary border border-border-light text-[11px] font-medium text-text-tertiary select-none cursor-default"
              >
                <i className="ri-lock-2-line text-xs text-text-tertiary" />
                {cat.name}
              </span>
            ))}

            {/* Optional selected pills — brand tint, × on right to deselect */}
            {applicableCats.filter((c) => !mandatoryIds.includes(c.id) && selected.includes(c.id)).map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleOptional(cat.id)}
                title="Remove"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand/10 border border-brand/25 text-[11px] font-medium text-brand hover:bg-brand/20 transition-colors"
              >
                {cat.name}
                <i className="ri-close-line text-xs text-brand" />
              </button>
            ))}

            {/* Optional not-selected pills — + before text, prominent */}
            {applicableCats.filter((c) => !mandatoryIds.includes(c.id) && !selected.includes(c.id)).map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleOptional(cat.id)}
                title="Add"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-secondary border border-border-light text-[11px] font-medium text-text-secondary hover:bg-surface hover:border-border transition-colors"
              >
                <i className="ri-add-line text-xs text-text-secondary" />
                {cat.name}
              </button>
            ))}

            {/* Custom (requested) pills */}
            {customCats.map((cat) => (
              <span
                key={cat.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pending-surface border border-pending/20 text-[11px] font-medium text-pending select-none"
              >
                <i className="ri-time-line text-xs" />
                {cat.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Edit categories modal */}
      <Modal
        open={showEditModal}
        title="Edit Categories"
        size="lg"
        onClose={() => setShowEditModal(false)}
      >
        <div className="space-y-4">
          {/* Group tabs */}
          <div className="flex gap-1.5 flex-wrap pb-3 border-b border-border-light">
            {ALL_GROUPS.map((group) => (
              <button
                key={group}
                onClick={() => setActiveGroup(group)}
                className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                  activeGroup === group
                    ? 'bg-brand text-white'
                    : 'text-text-secondary bg-surface-secondary hover:bg-surface'
                }`}
              >
                {group}
              </button>
            ))}
          </div>

          {/* Category list for active group */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto">
            {infraCategories.filter((c) => c.group === activeGroup).map((cat) => {
              const app = buildingType ? getApplicability(cat, buildingType) : 'optional'
              const isMandatory = app === 'mandatory'
              const isNotApplicable = app === 'not-applicable'
              const isSelected = selected.includes(cat.id)

              return (
                <div
                  key={cat.id}
                  onClick={() => !isMandatory && !isNotApplicable && toggleOptional(cat.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                    isMandatory
                      ? 'bg-terminal-red-surface border-terminal-red/20 cursor-default'
                      : isNotApplicable
                      ? 'bg-surface-secondary border-border-light cursor-default opacity-50'
                      : 'border-border-light bg-white cursor-pointer hover:bg-surface-secondary'
                  }`}
                >
                  {isMandatory ? (
                    <i className="ri-lock-2-line text-terminal-red text-sm shrink-0" />
                  ) : (
                    <div className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
                      isNotApplicable
                        ? 'border-border bg-surface-secondary'
                        : isSelected
                        ? 'bg-brand border-brand'
                        : 'border-border bg-white'
                    }`}>
                      {isSelected && !isNotApplicable && <i className="ri-check-line text-white text-[10px]" />}
                    </div>
                  )}
                  <span className={`text-xs flex-1 ${
                    isMandatory ? 'text-terminal-red font-medium' : isNotApplicable ? 'text-text-tertiary' : 'text-text-secondary'
                  }`}>
                    {cat.name}
                  </span>
                  {isMandatory && (
                    <span className="text-[10px] font-medium text-terminal-red/70 bg-terminal-red/10 px-1.5 py-0.5 rounded-full shrink-0">Mandatory</span>
                  )}
                  {isNotApplicable && (
                    <span className="text-[10px] font-medium text-text-tertiary bg-surface px-1.5 py-0.5 rounded-full shrink-0">N/A</span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Request new category */}
          <div className="pt-3 border-t border-border-light">
            <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Request new category</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                className="form-input flex-1"
                onKeyDown={(e) => { if (e.key === 'Enter') addCustomCategory() }}
              />
              <button
                onClick={addCustomCategory}
                disabled={!newCategoryName.trim()}
                className="text-sm font-medium text-white bg-brand hover:bg-brand-hover disabled:opacity-50 rounded-lg px-4 py-2 transition-colors shrink-0"
              >
                Request
              </button>
            </div>
            <p className="text-xs text-text-tertiary mt-1.5">New categories are flagged for App Admin review.</p>
          </div>
        </div>
      </Modal>
    </>
  )
}
