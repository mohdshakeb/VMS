// ─────────────────────────────────────────────────────────────────────────────
// Branch Admin Dashboard — Mobile
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useMemo, useRef } from 'react'
import { useVisitStore } from '@/store/visitStore'
import { useAuthStore } from '@/store/authStore'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import KpiCardV2 from '@/components/KpiCardV2'
import VisitCard from '@/components/VisitCard'
import IndiaMap, { type IndiaMapHandle } from '@/components/IndiaMap'
import { visitors as seedVisitors } from '@/data/visitors'
import { OVERDUE_VISIT_IDS, DELAYED_VISIT_IDS } from '@/data/visits'
import { locations } from '@/data/locations'
import { employees } from '@/data/employees'
import type { Visit } from '@/types/visit'
import { getLocalDateString } from '@/utils/helpers'
import EmptyState from '@/components/common/EmptyState'
import CountBadge from '@/components/common/CountBadge'
import MobileSearchInput from '@/components/Mobile/MobileSearchInput'

type KpiFilter = 'all' | 'ready' | 'pending' | 'on-premises' | 'declined'
type ActiveTab = 'map' | 'charts' | 'locations'
type MapMode = 'realtime' | 'today' | 'week' | 'month'

const MAP_MODE_LABELS: Record<MapMode, string> = {
  realtime: 'Live',
  today: 'Today',
  week: 'Last week',
  month: 'Month',
}

const KPI_LABELS: Record<KpiFilter, string> = {
  all: 'Total Visitors',
  ready: 'Expected Today',
  pending: 'Pending Approval',
  'on-premises': 'On Premises',
  declined: 'Declined Visits',
}

export default function ManagerDashboardMobile() {
  const visits = useVisitStore((s) => s.visits)
  const storeVisitors = useVisitStore((s) => s.visitors)
  const { currentLocationId } = useAuthStore()

  const [searchInput, setSearchInput] = useState('')
  const [kpiFilter, setKpiFilter] = useState<KpiFilter | null>(null)
  const [activeTab, setActiveTab] = useState<ActiveTab>('map')
  const [mapMode, setMapMode] = useState<MapMode>('realtime')
  const [mapDrilledState, setMapDrilledState] = useState<string | null>(null)
  const mobileMapRef = useRef<IndiaMapHandle>(null)

  const now = new Date()
  const today = getLocalDateString(now)

  const visitorMap = useMemo(
    () => Object.fromEntries([...seedVisitors, ...storeVisitors].map((v) => [v.id, v])),
    [storeVisitors],
  )

  const todaysVisits = useMemo(() =>
    visits.filter((v) => {
      const matchesDate = v.scheduledDate === today
      const matchesLoc = currentLocationId === 'all' || v.locationId === currentLocationId
      return matchesDate && matchesLoc
    }),
    [visits, today, currentLocationId],
  )

  const kpiExpected = todaysVisits.filter((v) => v.status === 'confirmed' || v.status === 'scheduled')
  const kpiExpectedByEmployee = kpiExpected.filter(
    (v) => v.entryPath === 'employee-request' || v.entryPath === 'pre-scheduled',
  )
  const kpiOnPremises = todaysVisits.filter((v) => v.status === 'checked-in')
  const kpiTotalVisited = todaysVisits.filter((v) => v.status === 'checked-in' || v.status === 'checked-out')
  const pendingApproval = todaysVisits.filter((v) => v.status === 'pending-approval')
  const kpiDeclined = todaysVisits.filter((v) => v.status === 'cancelled' || v.status === 'rejected')

  const overdueCount = kpiOnPremises.filter((v) => OVERDUE_VISIT_IDS.has(v.id)).length
  const delayedCount = pendingApproval.filter((v) => DELAYED_VISIT_IDS.has(v.id)).length

  const topLocations = useMemo(() =>
    locations
      .map((loc) => ({
        ...loc,
        count: visits.filter((v) => v.locationId === loc.id).length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    [visits],
  )
  const maxLocationCount = topLocations[0]?.count ?? 0

  const deptChartData = useMemo(() => {
    const depts = ['Sales', 'Service', 'Parts', 'Finance', 'HR', 'IT', 'Admin']
    return depts.map((dept) => {
      const empIds = new Set(employees.filter((e) => e.department === dept).map((e) => e.id))
      const dv = visits.filter((v) => empIds.has(v.hostEmployeeId))
      return {
        dept,
        Customer:   dv.filter((v) => v.visitType === 'customer').length,
        Vendor:     dv.filter((v) => v.visitType === 'vendor').length,
        Contractor: dv.filter((v) => v.visitType === 'contractor').length,
        'Govt.':    dv.filter((v) => v.visitType === 'government-official').length,
        CAT:        dv.filter((v) => v.visitType === 'cat-officials').length,
      }
    })
  }, [visits])

  const monthlyChartData = useMemo(() => {
    const result = []
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthNum = d.getMonth()
      const yearNum = d.getFullYear()
      result.push({
        month: d.toLocaleString('default', { month: 'short' }),
        Visits: visits.filter((v) => {
          const vd = new Date(v.scheduledDate)
          return vd.getMonth() === monthNum && vd.getFullYear() === yearNum
        }).length,
      })
    }
    return result
  }, [visits, now])

  const MOCK_TREND_TOTAL = 5

  const visitsByLocation = useMemo(() => {
    let source: Visit[]
    if (mapMode === 'realtime') {
      source = visits.filter((v) => v.status === 'checked-in')
    } else if (mapMode === 'today') {
      source = visits.filter((v) => v.scheduledDate === today)
    } else if (mapMode === 'week') {
      const cutoff = new Date(now)
      cutoff.setDate(cutoff.getDate() - 7)
      const cutoffStr = cutoff.toISOString().slice(0, 10)
      source = visits.filter((v) => v.scheduledDate >= cutoffStr && v.scheduledDate <= today)
    } else {
      const cutoff = new Date(now)
      cutoff.setDate(cutoff.getDate() - 30)
      const cutoffStr = cutoff.toISOString().slice(0, 10)
      source = visits.filter((v) => v.scheduledDate >= cutoffStr && v.scheduledDate <= today)
    }
    const map: Record<string, Visit[]> = {}
    locations.forEach((loc) => { map[loc.id] = [] })
    source.forEach((v) => { if (map[v.locationId]) map[v.locationId].push(v) })
    return map
  }, [visits, today, mapMode, now])

  const mapVisitorCount = useMemo(() => {
    if (mapDrilledState) {
      const stateLocIds = locations.filter((l) => l.state === mapDrilledState).map((l) => l.id)
      return stateLocIds.reduce((sum, id) => sum + (visitsByLocation[id]?.length ?? 0), 0)
    }
    return Object.values(visitsByLocation).reduce((sum, arr) => sum + arr.length, 0)
  }, [visitsByLocation, mapDrilledState])

  function handleKpiClick(filter: KpiFilter) {
    setKpiFilter((prev) => (prev === filter ? null : filter))
    setSearchInput('')
  }

  function getResultList(): Visit[] {
    const q = searchInput.trim().toLowerCase()
    if (q) {
      return todaysVisits.filter((v) => {
        const visitor = visitorMap[v.visitorId]
        return (
          (visitor?.name?.toLowerCase() ?? '').includes(q) ||
          (visitor?.company?.toLowerCase() ?? '').includes(q)
        )
      })
    }
    const sortReady = (arr: Visit[]) =>
      [...arr].sort((a, b) => {
        const aWalkIn = a.entryPath === 'walk-in'
        const bWalkIn = b.entryPath === 'walk-in'
        if (aWalkIn !== bWalkIn) return aWalkIn ? -1 : 1
        return a.scheduledTime.localeCompare(b.scheduledTime)
      })
    const sortPending = (arr: Visit[]) =>
      [...arr].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    if (kpiFilter === 'all') return [...kpiTotalVisited].sort((a, b) => (b.checkInTime ?? '').localeCompare(a.checkInTime ?? ''))
    if (kpiFilter === 'ready') return sortReady(kpiExpectedByEmployee)
    if (kpiFilter === 'pending') return sortPending(pendingApproval)
    if (kpiFilter === 'on-premises') return [...kpiOnPremises].sort((a, b) => Number(OVERDUE_VISIT_IDS.has(b.id)) - Number(OVERDUE_VISIT_IDS.has(a.id)))
    if (kpiFilter === 'declined') return [...kpiDeclined].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return []
  }

  const resultList = getResultList()

  return (
    <div className="md:hidden h-full flex flex-col bg-surface-secondary">
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-3 pb-10 flex flex-col gap-3 min-h-full">

          <MobileSearchInput
            value={searchInput}
            onChange={(v) => { setSearchInput(v); setKpiFilter(null) }}
            placeholder="Search visitor name or company…"
          />

          {(searchInput.trim() || kpiFilter !== null) ? (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border-light">
                <p className="text-sm font-semibold text-text-primary flex-1">
                  {kpiFilter && !searchInput.trim() ? KPI_LABELS[kpiFilter] : 'Search results'}
                </p>
                <CountBadge count={resultList.length} />
                {kpiFilter && !searchInput.trim() && (
                  <button onClick={() => setKpiFilter(null)} className="shrink-0 text-text-tertiary hover:text-text-secondary transition-colors ml-1">
                    <i className="ri-close-line text-base" />
                  </button>
                )}
              </div>
              <div className="p-3 space-y-2">
                {resultList.length === 0 ? (
                  <EmptyState icon="ri-search-2-line" title="No visits match your search" className="py-16" />
                ) : (
                  resultList.map((visit, idx) => {
                    const visitor = visitorMap[visit.visitorId]
                    return (
                      <div key={visit.id} className="vms-stagger-item" style={{ animationDelay: `${Math.min(idx * 35, 210)}ms` }}>
                        <VisitCard
                          visit={visit}
                          visitorName={visitor?.name ?? 'Unknown Visitor'}
                          visitorPhone={visitor?.mobile}
                          visitorAvatar={visitor?.avatar}
                          role="front-desk"
                        />
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          ) : (
            <>
              {/* KPI cards — horizontal scroll */}
              <div className="-mx-4 px-4 flex items-stretch gap-2.5 overflow-x-auto scrollbar-none">
                <div className="w-[40vw] shrink-0">
                  <KpiCardV2 label="Total Visitors" info="Checked-in and checked-out" value={kpiTotalVisited.length} icon="ri-group-fill" color="blue" trend={MOCK_TREND_TOTAL} active={kpiFilter === 'all'} onClick={() => handleKpiClick('all')} />
                </div>
                <div className="w-[40vw] shrink-0">
                  <KpiCardV2 label="Pending Approval" info="Awaiting employee response" value={pendingApproval.length} icon="ri-time-fill" color="yellow" alertCount={delayedCount} alertLabel="need follow-up" alertColor="orange" active={kpiFilter === 'pending'} onClick={() => handleKpiClick('pending')} />
                </div>
                <div className="w-[40vw] shrink-0">
                  <KpiCardV2 label="On Premises" info="Currently inside the facility" value={kpiOnPremises.length} icon="ri-building-2-fill" color="green" alertCount={overdueCount} alertLabel="overdue" alertColor="red" active={kpiFilter === 'on-premises'} onClick={() => handleKpiClick('on-premises')} />
                </div>
                <div className="w-[40vw] shrink-0">
                  <KpiCardV2 label="Declined Visits" info="Cancelled and rejected today" value={kpiDeclined.length} icon="ri-close-circle-fill" color="red" active={kpiFilter === 'declined'} onClick={() => handleKpiClick('declined')} />
                </div>
                <div className="w-4 shrink-0" />
              </div>

              {/* Tab segmented control */}
              <div className="flex p-1 bg-white rounded-full mt-2">
                {([
                  { id: 'map' as const, label: 'Map' },
                  { id: 'charts' as const, label: 'Charts' },
                  { id: 'locations' as const, label: 'Locations' },
                ]).map(({ id, label }) => {
                  const isActive = activeTab === id
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-full ${isActive ? 'text-brand' : 'text-text-tertiary'}`}
                      style={{
                        backgroundColor: isActive ? 'var(--color-brand-red-50)' : 'transparent',
                        boxShadow: isActive ? '0 1px 4px 0 rgb(0 0 0 / 0.10)' : 'none',
                        transition: 'background-color 150ms ease, box-shadow 150ms ease',
                      }}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>

              {/* Map tab */}
              {activeTab === 'map' && (
                <div className="bg-white rounded-xl border border-border overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border-light">
                    {mapDrilledState ? (
                      <button
                        onClick={() => mobileMapRef.current?.reset()}
                        className="flex items-center gap-1 text-xs font-semibold text-text-primary hover:text-text-secondary transition-colors flex-1 min-w-0"
                      >
                        <i className="ri-arrow-left-s-line text-sm shrink-0" />
                        <span className="truncate">{mapDrilledState}</span>
                      </button>
                    ) : (
                      <>
                        <i className="ri-map-2-line text-text-tertiary text-sm shrink-0" />
                        <p className="text-xs font-semibold text-text-primary flex-1">Visitor Locations</p>
                      </>
                    )}
                    <CountBadge count={mapVisitorCount} />
                    <div className="flex p-0.5 bg-surface-secondary rounded-full border border-border">
                      {(Object.keys(MAP_MODE_LABELS) as MapMode[]).map((m) => (
                        <button
                          key={m}
                          onClick={() => setMapMode(m)}
                          className={`px-2 py-0.5 text-[10px] font-medium rounded-full transition-colors whitespace-nowrap ${
                            mapMode === m
                              ? 'bg-white text-text-primary shadow-sm'
                              : 'text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          {m === 'realtime' ? (
                            <span className="flex items-center gap-1">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                              </span>
                              Live
                            </span>
                          ) : MAP_MODE_LABELS[m]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <IndiaMap
                    ref={mobileMapRef}
                    visitsByLocation={visitsByLocation}
                    visitorMap={visitorMap}
                    activeLocationId={currentLocationId}
                    onStateChange={setMapDrilledState}
                  />
                </div>
              )}

              {/* Charts tab */}
              {activeTab === 'charts' && (
                <div className="flex flex-col gap-3 mt-1">
                  {/* Department × Visit Type */}
                  <div className="bg-white rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-border-light">
                      <i className="ri-bar-chart-grouped-line text-text-tertiary text-base" />
                      <p className="text-sm font-semibold text-text-primary">Visit Types by Department</p>
                    </div>
                    <div className="px-1 py-4">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart
                          data={deptChartData}
                          layout="vertical"
                          margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
                          barCategoryGap="25%"
                          barGap={1}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 9, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <YAxis type="category" dataKey="dept" tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} width={52} />
                          <Tooltip
                            contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                            cursor={{ fill: 'var(--color-surface-secondary)' }}
                          />
                          <Legend iconSize={7} iconType="circle" wrapperStyle={{ fontSize: 9, paddingTop: 8 }} />
                          <Bar dataKey="Customer"   fill="#3b82f6" radius={[0, 3, 3, 0]} />
                          <Bar dataKey="Vendor"     fill="#f59e0b" radius={[0, 3, 3, 0]} />
                          <Bar dataKey="Contractor" fill="#10b981" radius={[0, 3, 3, 0]} />
                          <Bar dataKey="Govt."      fill="#8b5cf6" radius={[0, 3, 3, 0]} />
                          <Bar dataKey="CAT"        fill="#ef4444" radius={[0, 3, 3, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* 3-Month Visit Comparison */}
                  <div className="bg-white rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-border-light">
                      <i className="ri-bar-chart-2-line text-text-tertiary text-base" />
                      <p className="text-sm font-semibold text-text-primary">3-Month Visit Comparison</p>
                    </div>
                    <div className="px-2 py-4">
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart
                          data={monthlyChartData}
                          margin={{ top: 0, right: 8, left: -20, bottom: 0 }}
                          barCategoryGap="40%"
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
                          <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip
                            contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                            cursor={{ fill: 'var(--color-surface-secondary)' }}
                          />
                          <Bar dataKey="Visits" fill="var(--color-brand)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* Top Locations tab */}
              {activeTab === 'locations' && (
                <div className="bg-white rounded-xl border border-border overflow-hidden mt-1">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border-light">
                    <i className="ri-bar-chart-2-line text-text-tertiary text-base" />
                    <p className="text-sm font-semibold text-text-primary flex-1">Top Locations</p>
                    <span className="text-xs text-text-tertiary">by total visits</span>
                  </div>
                  {topLocations.length === 0 ? (
                    <div className="p-3">
                      <EmptyState icon="ri-map-pin-line" title="No visit data" className="py-8" iconClassName="text-2xl" titleClassName="text-sm" />
                    </div>
                  ) : (
                    <div className="px-2 py-1">
                      {topLocations.map((loc, idx) => {
                        const pct = maxLocationCount > 0 ? (loc.count / maxLocationCount) * 100 : 0
                        const shortName = loc.name.replace('EO — ', '').replace('Branch — ', '')
                        return (
                          <div key={loc.id} className="flex items-center gap-3 px-2 py-3">
                            <span className="text-xs font-bold tabular-nums text-text-tertiary w-4 shrink-0 text-center">{idx + 1}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <p className="text-xs font-semibold text-text-primary truncate">{shortName}</p>
                                <span className="text-xs font-bold tabular-nums text-text-secondary shrink-0">{loc.count}</span>
                              </div>
                              <div className="h-1 bg-surface-secondary rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-brand/70 transition-all duration-700"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <p className="text-[10px] text-text-tertiary mt-1 truncate">{loc.address}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}
