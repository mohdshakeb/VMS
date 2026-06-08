import { useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import { dummyOnboardingRequest } from '@/data/facilityData'
import PageHeader from '@/components/PageHeader'
import { formatDate } from '@/utils/helpers'

export default function OnboardingStatus() {
  const navigate = useNavigate()
  const submittedRequest = useFacilityStore((s) => s.submittedRequest)

  // Use submitted request from store if available, else fall back to dummy data
  const request = submittedRequest ?? dummyOnboardingRequest

  function formatTimestamp(ts: string) {
    const d = new Date(ts)
    return `${formatDate(ts.split('T')[0])}, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Onboarding Request"
        breadcrumb={[{ label: 'My Facilities', path: '/facility/facilities' }]}
        onBack={() => navigate('/facility/facilities')}
      />

      {/* Mobile back header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border-light md:hidden">
        <button
          onClick={() => navigate('/facility/facilities')}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-text-secondary hover:bg-surface-secondary transition-colors"
        >
          <i className="ri-arrow-left-line text-lg" />
        </button>
        <h2 className="text-sm font-medium text-text-primary">Onboarding Request</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6">
        <div className="flex flex-col md:flex-row gap-5 max-w-3xl">

          {/* Left column — request summary */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Request Summary</h3>
            <div className="bg-white border border-border-light rounded-xl p-4 space-y-3">
              <div>
                <p className="text-xs text-text-tertiary">Building</p>
                <p className="text-sm font-semibold text-text-primary">{request.facilityName}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-text-tertiary">Type</p>
                  <p className="text-sm font-medium text-text-primary">{request.facilityType}</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">SBU</p>
                  <p className="text-sm font-medium text-text-primary">{request.sbu}</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">State</p>
                  <p className="text-sm font-medium text-text-primary">{request.state}</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">City</p>
                  <p className="text-sm font-medium text-text-primary">{request.city}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-border-light grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-text-tertiary">Submitted on</p>
                  <p className="text-sm font-medium text-text-primary">{formatTimestamp(request.submittedAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">Submitted by</p>
                  <p className="text-sm font-medium text-text-primary">{request.submittedBy}</p>
                  <p className="text-xs text-text-tertiary">{request.submittedById}</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">Infrastructure categories</p>
                  <p className="text-sm font-medium text-text-primary">{request.categoryCount} assigned</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column — approval timeline */}
          <div className="md:w-64 shrink-0">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Approval Status</h3>
            <div className="bg-white border border-border-light rounded-xl p-4">
              <div className="relative">
                {request.timeline.map((event, i) => {
                  const isDone = event.status === 'done'
                  const isActive = event.status === 'active'
                  const isRejected = event.status === 'rejected'
                  const isLast = i === request.timeline.length - 1

                  return (
                    <div key={event.stage} className="flex gap-3">
                      {/* Timeline connector + dot */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold z-10 ${
                            isDone
                              ? 'bg-terminal-green text-white'
                              : isRejected
                              ? 'bg-terminal-red text-white'
                              : isActive
                              ? 'bg-pending text-white ring-4 ring-pending/20'
                              : 'bg-surface-secondary border-2 border-border text-text-tertiary'
                          }`}
                        >
                          {isDone ? (
                            <i className="ri-check-line text-sm" />
                          ) : isRejected ? (
                            <i className="ri-close-line text-sm" />
                          ) : isActive ? (
                            <i className="ri-time-line text-sm" />
                          ) : (
                            <span>{event.stage}</span>
                          )}
                        </div>
                        {!isLast && (
                          <div
                            className={`w-px flex-1 my-1.5 ${isDone ? 'bg-terminal-green/40' : 'bg-border-light'}`}
                            style={{ minHeight: '28px' }}
                          />
                        )}
                      </div>

                      {/* Event content */}
                      <div className="pb-6">
                        <p className={`text-sm font-medium ${isDone ? 'text-text-primary' : isActive ? 'text-pending' : 'text-text-tertiary'}`}>
                          {event.label}
                        </p>
                        {event.sublabel && (
                          <p className="text-xs text-text-tertiary mt-0.5">{event.sublabel}</p>
                        )}
                        {event.timestamp && (
                          <p className="text-xs text-text-tertiary mt-0.5">{formatTimestamp(event.timestamp)}</p>
                        )}
                        {isRejected && request.rejectionReason && (
                          <p className="text-xs text-terminal-red mt-1 bg-terminal-red-surface px-2 py-1 rounded-lg">
                            {request.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Revise & resubmit if rejected */}
              {request.status === 'rejected' && (
                <button
                  onClick={() => navigate('/facility/onboarding/new')}
                  className="w-full mt-2 text-sm font-medium text-white bg-brand hover:bg-brand-hover rounded-lg py-2 transition-colors"
                >
                  Revise & resubmit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
