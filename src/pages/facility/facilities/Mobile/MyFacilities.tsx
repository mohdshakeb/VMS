// ─────────────────────────────────────────────────────────────────────────────
// My Facilities — Mobile
// No PageHeader — AppLayout's MobileTopBar provides the chrome.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import EmptyState from '@/components/common/EmptyState'
import Button from '@/components/Button'
import MobileSearchInput from '@/components/Mobile/MobileSearchInput'
import BottomSheet from '@/components/Mobile/BottomSheet'
import type { FacilityComplianceStatus, FacilityStatus, ComplianceRecord } from '@/types/facility'
import { getComplianceDueDate, CURRENT_COMPLIANCE_PERIOD } from '@/data/facilityData'
import { scopeToLocationAdmin } from '@/utils/facilityHelpers'

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const { month: PERIOD_MONTH, year: PERIOD_YEAR } = CURRENT_COMPLIANCE_PERIOD

const STATUS_VALUES: FacilityStatus[] = ['active', 'inactive']
const COMPLIANCE_VALUES: FacilityComplianceStatus[] = ['pending', 'draft', 'submitted', 'updated', 'overdue', 'missed']

const COMPLIANCE_LABEL: Record<FacilityComplianceStatus, string> = {
  pending: 'Pending', draft: 'Draft', submitted: 'Submitted',
  updated: 'Updated', overdue: 'Overdue', missed: 'Missed',
}
const COMPLIANCE_STYLE: Record<FacilityComplianceStatus, string> = {
  pending: 'bg-yellow-surface text-yellow-fg',
  draft: 'bg-surface-secondary text-text-secondary',
  submitted: 'bg-blue-surface text-blue-fg',
  updated: 'bg-purple-surface text-purple-fg',
  overdue: 'bg-red-surface text-red-fg',
  missed: 'bg-surface-secondary text-text-tertiary',
}

const SUBMITTED_STATUSES = ['submitted', 'updated', 'approved']

const DUE_DEADLINE = getComplianceDueDate(PERIOD_MONTH, PERIOD_YEAR)
const NEXT_PERIOD_MONTH = PERIOD_MONTH === 12 ? 1 : PERIOD_MONTH + 1
const NEXT_PERIOD_YEAR  = PERIOD_MONTH === 12 ? PERIOD_YEAR + 1 : PERIOD_YEAR
const NEXT_DEADLINE = getComplianceDueDate(NEXT_PERIOD_MONTH, NEXT_PERIOD_YEAR)

function isSubmitted(status: FacilityComplianceStatus) {
  return status === 'submitted' || status === 'updated'
}

function getLastCompliance(records: ComplianceRecord[], facilityId: string) {
  return [...records]
    .filter((r) => r.facilityId === facilityId && SUBMITTED_STATUSES.includes(r.status))
    .sort((a, b) => b.year - a.year || b.month - a.month)[0] ?? null
}

function getCurrentRecord(records: ComplianceRecord[], facilityId: string) {
  return records.find((r) => r.facilityId === facilityId && r.month === PERIOD_MONTH && r.year === PERIOD_YEAR) ?? null
}

export default function MyFacilitiesMobile() {
  const navigate = useNavigate()
  const allFacilities = useFacilityStore((s) => s.facilities)
  const facilities = useMemo(() => scopeToLocationAdmin(allFacilities), [allFacilities])
  const complianceRecords = useFacilityStore((s) => s.complianceRecords)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<FacilityStatus | ''>('')
  const [complianceFilter, setComplianceFilter] = useState<FacilityComplianceStatus | ''>('')

  const [filterSheetMounted, setFilterSheetMounted] = useState(false)
  const [filterSheetVisible, setFilterSheetVisible] = useState(false)

  function openFilterSheet() {
    setFilterSheetMounted(true)
    requestAnimationFrame(() => { requestAnimationFrame(() => setFilterSheetVisible(true)) })
  }

  function closeFilterSheet() {
    setFilterSheetVisible(false)
    setTimeout(() => setFilterSheetMounted(false), 260)
  }

  const hasActiveFilters = statusFilter !== '' || complianceFilter !== ''

  function clearFilters() {
    setStatusFilter('')
    setComplianceFilter('')
  }

  const filtered = useMemo(() => {
    let result = [...facilities]
    if (statusFilter) result = result.filter((f) => f.status === statusFilter)
    if (complianceFilter) result = result.filter((f) => f.complianceStatus === complianceFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((f) => f.name.toLowerCase().includes(q))
    }
    result.sort((a, b) => Number(isSubmitted(a.complianceStatus)) - Number(isSubmitted(b.complianceStatus)))
    return result
  }, [facilities, statusFilter, complianceFilter, search])

  return (
    <div className="md:hidden h-full flex flex-col bg-surface-secondary">
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-3 pb-10 flex flex-col gap-3">

          {/* Search + filter button */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <MobileSearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search facilities..."
              />
            </div>
            <button
              onClick={openFilterSheet}
              className={`relative flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${hasActiveFilters ? 'bg-brand-light border-brand text-brand' : 'bg-white border-border text-text-secondary'}`}
            >
              <i className="ri-filter-3-line text-base" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-brand text-[9px] font-semibold text-white flex items-center justify-center">
                  {[statusFilter, complianceFilter].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Facility cards */}
          {filtered.length === 0 ? (
            <EmptyState icon="ri-building-2-line" title="No facilities match your search" className="py-12" titleClassName="text-sm" />
          ) : (
            filtered.map((facility) => {
              const last = getLastCompliance(complianceRecords, facility.id)
              const submitted = isSubmitted(facility.complianceStatus)
              const isPending = facility.complianceStatus === 'pending'
              const isDraft = facility.complianceStatus === 'draft'
              const currentRecord = getCurrentRecord(complianceRecords, facility.id)

              return (
                <div
                  key={facility.id}
                  onClick={() => navigate(`/facility/facilities/${facility.id}`)}
                  className="bg-white border border-border-light rounded-xl p-4 cursor-pointer active:shadow-sm transition-all duration-150"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{facility.name}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{facility.location}</p>
                    </div>
                    <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${facility.status === 'active' ? 'bg-green-surface text-green-fg' : 'bg-red-surface text-red-fg'}`}>
                      {facility.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${COMPLIANCE_STYLE[facility.complianceStatus]}`}>
                      {COMPLIANCE_LABEL[facility.complianceStatus]}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs border-t border-border-light pt-3">
                    <div>
                      <p className="text-text-tertiary mb-0.5">Last Compliance</p>
                      <p className="font-medium text-text-secondary">
                        {last
                          ? last.submittedAt
                            ? new Date(last.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : `${MONTH_SHORT[last.month - 1]} ${last.year}`
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-tertiary mb-0.5">Next Due</p>
                      <p className={`font-medium ${!submitted ? 'text-pending' : 'text-text-secondary'}`}>
                        {(!submitted ? DUE_DEADLINE : NEXT_DEADLINE).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {!submitted && <span className="ml-1 text-[10px] bg-pending-surface text-pending px-1.5 py-0.5 rounded-full font-semibold">Due</span>}
                      </p>
                    </div>
                  </div>

                  {(isPending || isDraft) && currentRecord && (
                    <div className="mt-3 pt-3 border-t border-border-light" onClick={(e) => e.stopPropagation()}>
                      {isPending && (
                        <Button size="sm" variant="primary" fullWidth onClick={() => navigate(`/facility/compliance/record/${currentRecord.id}`)}>
                          Start Compliance
                        </Button>
                      )}
                      {isDraft && (
                        <Button size="sm" variant="secondary" fullWidth onClick={() => navigate(`/facility/compliance/record/${currentRecord.id}`)}>
                          Resume Compliance
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Filter sheet */}
      {filterSheetMounted && (
        <BottomSheet
          mounted={filterSheetMounted}
          visible={filterSheetVisible}
          onClose={closeFilterSheet}
          title="Filter Facilities"
          footer={
            <div className="flex gap-2">
              {hasActiveFilters && (
                <Button size="md" variant="secondary" fullWidth onClick={() => { clearFilters(); closeFilterSheet() }}>
                  Clear all
                </Button>
              )}
              <Button size="md" fullWidth onClick={closeFilterSheet}>
                Done
              </Button>
            </div>
          }
        >
          <div className="px-5 py-4 space-y-5">
            {/* Facility status */}
            <div>
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Facility Status</p>
              <div className="flex flex-wrap gap-2">
                {(['', ...STATUS_VALUES] as (FacilityStatus | '')[]).map((val) => (
                  <button
                    key={val}
                    onClick={() => setStatusFilter(val)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${statusFilter === val ? 'bg-brand-light text-brand border-brand' : 'bg-white border-border text-text-secondary'}`}
                  >
                    {val === '' ? 'All' : val.charAt(0).toUpperCase() + val.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Compliance status */}
            <div>
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Compliance Status</p>
              <div className="flex flex-wrap gap-2">
                {(['', ...COMPLIANCE_VALUES] as (FacilityComplianceStatus | '')[]).map((val) => (
                  <button
                    key={val}
                    onClick={() => setComplianceFilter(val)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${complianceFilter === val ? 'bg-brand-light text-brand border-brand' : 'bg-white border-border text-text-secondary'}`}
                  >
                    {val === '' ? 'All' : COMPLIANCE_LABEL[val]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </BottomSheet>
      )}
    </div>
  )
}
