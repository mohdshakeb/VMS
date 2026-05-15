import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import PageHeader from '@/components/PageHeader'
import FacilityStatusBadge from '@/components/facility/FacilityStatusBadge'
import TabPills from '@/components/common/TabPills'
import type { ComplianceRecord } from '@/types/facility'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function ComplianceHistory() {
  const navigate = useNavigate()
  const records = useFacilityStore((s) => s.complianceRecords)
  const [selectedRecord, setSelectedRecord] = useState<ComplianceRecord | null>(null)

  // Sort by year desc, then month desc
  const sorted = [...records].sort((a, b) => b.year - a.year || b.month - a.month)

  // Only show submitted/approved/rejected records in history (not pending/draft)
  const historyRecords = sorted.filter((r) => ['submitted', 'approved', 'rejected'].includes(r.status))

  function formatSubmitted(ts?: string) {
    if (!ts) return '—'
    const d = new Date(ts)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (selectedRecord) {
    return (
      <div className="flex flex-col h-full bg-surface-secondary">
        <PageHeader
          title={`${MONTH_NAMES[selectedRecord.month - 1]} ${selectedRecord.year} — ${selectedRecord.buildingName}`}
          breadcrumb={[{ label: 'Compliance History', path: '/facility/compliance/history' }]}
          onBack={() => setSelectedRecord(null)}
        />

        {/* Mobile back */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-light md:hidden">
          <button
            onClick={() => setSelectedRecord(null)}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-text-secondary hover:bg-surface-secondary transition-colors"
          >
            <i className="ri-arrow-left-line text-lg" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-medium text-text-primary truncate">{selectedRecord.buildingName}</h2>
            <p className="text-xs text-text-tertiary">{MONTH_NAMES[selectedRecord.month - 1]} {selectedRecord.year}</p>
          </div>
          <FacilityStatusBadge status={selectedRecord.status} />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6">
          {/* Meta info */}
          <div className="bg-white border border-border-light rounded-xl p-4 mb-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-text-tertiary">Status</p>
                <div className="mt-1"><FacilityStatusBadge status={selectedRecord.status} /></div>
              </div>
              <div>
                <p className="text-xs text-text-tertiary">Submitted on</p>
                <p className="text-sm font-medium text-text-primary">{formatSubmitted(selectedRecord.submittedAt)}</p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary">Submitted by</p>
                <p className="text-sm font-medium text-text-primary">{selectedRecord.submittedBy ?? '—'}</p>
              </div>
              {selectedRecord.approvedAt && (
                <div>
                  <p className="text-xs text-text-tertiary">Approved on</p>
                  <p className="text-sm font-medium text-text-primary">{formatSubmitted(selectedRecord.approvedAt)}</p>
                </div>
              )}
              {selectedRecord.approvedBy && (
                <div>
                  <p className="text-xs text-text-tertiary">Approved by</p>
                  <p className="text-sm font-medium text-text-primary">{selectedRecord.approvedBy}</p>
                </div>
              )}
              {selectedRecord.rejectionReason && (
                <div className="col-span-2">
                  <p className="text-xs text-text-tertiary">Rejection reason</p>
                  <p className="text-sm font-medium text-terminal-red">{selectedRecord.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>

          {/* Categories with photos */}
          {selectedRecord.categories.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3">Photos</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selectedRecord.categories.map((cat) => (
                  <div key={cat.categoryId} className="rounded-xl overflow-hidden border border-border-light bg-white">
                    {cat.photoUrl ? (
                      <img src={cat.photoUrl} alt={cat.categoryName} className="w-full aspect-[4/3] object-cover" />
                    ) : (
                      <div className="w-full aspect-[4/3] bg-surface-secondary flex items-center justify-center">
                        <i className="ri-image-line text-2xl text-text-tertiary" />
                      </div>
                    )}
                    <div className="px-2.5 py-2">
                      <p className="text-xs font-medium text-text-primary truncate">{cat.categoryName}</p>
                      <p className="text-[10px] text-text-tertiary">{cat.group}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-surface-secondary">
      <PageHeader title="Compliance" />

      <div className="shrink-0 px-4 pt-3 pb-0 md:px-6">
        <TabPills
          tabs={[
            { label: 'Upload', value: 'upload' },
            { label: 'History', value: 'history' },
          ]}
          activeTab="history"
          onTabChange={(v) => { if (v === 'upload') navigate('/facility/compliance') }}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
        {historyRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <i className="ri-history-line text-4xl text-text-tertiary mb-3" />
            <p className="text-sm font-medium text-text-secondary">No history yet</p>
            <p className="text-xs text-text-tertiary mt-1">Submitted compliance records will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {historyRecords.map((record) => (
              <button
                key={record.id}
                onClick={() => setSelectedRecord(record)}
                className="w-full text-left bg-white border border-border-light rounded-xl px-4 py-3.5 hover:border-brand/30 hover:shadow-sm transition-all duration-150 group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-text-primary truncate">{record.buildingName}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs text-text-tertiary">{MONTH_NAMES[record.month - 1]} {record.year}</span>
                      <span className="text-text-tertiary text-xs">·</span>
                      <span className="text-xs text-text-tertiary">{record.categories.length} categories</span>
                      {record.submittedAt && (
                        <>
                          <span className="text-text-tertiary text-xs">·</span>
                          <span className="text-xs text-text-tertiary">Submitted {formatSubmitted(record.submittedAt)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <FacilityStatusBadge status={record.status} />
                    <i className="ri-arrow-right-s-line text-text-tertiary text-lg group-hover:text-brand transition-colors" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
