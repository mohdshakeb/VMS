// ─────────────────────────────────────────────────────────────────────────────
// Branch Admin Dashboard — Desktop
// KPI cards aggregate across selected location(s), India map shows real-time visitors.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useMemo, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { useVisitStore } from '@/store/visitStore'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore, getUnreadCount } from '@/store/notificationStore'
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import KpiCardV2 from '@/components/KpiCardV2'
import VisitCard from '@/components/VisitCard'
import PageHeader from '@/components/PageHeader'
import IndiaMap, { type IndiaMapHandle } from '@/components/IndiaMap'
import { visitors as seedVisitors } from '@/data/visitors'
import { OVERDUE_VISIT_IDS, DELAYED_VISIT_IDS } from '@/data/visits'
import { employees } from '@/data/employees'
import { locations } from '@/data/locations'
import type { Visit } from '@/types/visit'
import { getLocalDateString } from '@/utils/helpers'
import EmptyState from '@/components/common/EmptyState'
import CountBadge from '@/components/common/CountBadge'

type KpiFilter = 'all' | 'ready' | 'pending' | 'on-premises' | 'declined'
type MapPeriod = 'realtime' | 'today' | 'week' | 'month'
type ChartPeriod = 'today' | 'week' | 'month'

const DEPARTMENTS = [
  '6 SIGMA', 'Admin', 'C&L', 'Digital', 'ERP',
  'FIN / ACCTS / LEGAL', 'HQ PARTS', 'HQ SURFACE', 'HQ UG MINING', 'HRD',
  'PARTS / WAREHOUSE', 'PROJECTS', 'RUE', 'Sales', 'Service',
  'SUPPORT FUNCTIONS', 'SYSTEMS', 'TRAINING',
]

const DEPT_COLORS = [
  '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444',
  '#f97316', '#06b6d4', '#ec4899', '#84cc16', '#a78bfa',
  '#fb923c', '#34d399', '#60a5fa', '#f472b6', '#facc15',
  '#4ade80', '#38bdf8', '#94a3b8',
]

const MAP_PERIOD_LABELS: Record<MapPeriod, string> = {
  realtime: 'Realtime',
  today: 'Today',
  week: 'Last 7 days',
  month: 'Last 30 days',
}

const CHART_PERIOD_LABELS: Record<ChartPeriod, string> = {
  today: 'Today',
  week: 'Last 7 days',
  month: 'Last 30 days',
}

function PeriodDropdown<T extends string>({
  value, onChange, options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div className="relative flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="text-[11px] font-medium text-text-secondary bg-surface border border-border rounded-lg pl-2 pr-6 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-light appearance-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <i className="ri-arrow-down-s-line absolute right-1.5 text-text-tertiary text-sm pointer-events-none" />
    </div>
  )
}

const MAP_PERIOD_OPTIONS = (Object.keys(MAP_PERIOD_LABELS) as MapPeriod[]).map((v) => ({ value: v, label: MAP_PERIOD_LABELS[v] }))
const CHART_PERIOD_OPTIONS = (Object.keys(CHART_PERIOD_LABELS) as ChartPeriod[]).map((v) => ({ value: v, label: CHART_PERIOD_LABELS[v] }))

const VISIT_TYPES_CONFIG: { key: string; label: string; color: string }[] = [
  { key: 'customer',               label: 'Customer',        color: '#3b82f6' },
  { key: 'vendor',                 label: 'Vendor',          color: '#f59e0b' },
  { key: 'contractor',             label: 'Contractor',      color: '#10b981' },
  { key: 'government-official',    label: 'Govt.',           color: '#8b5cf6' },
  { key: 'cat-officials',          label: 'CAT',             color: '#ef4444' },
  { key: 'employee-other-branch',  label: 'GMMCO',          color: '#f97316' },
  { key: 'general-visitor',        label: 'General',         color: '#06b6d4' },
  { key: 'hospitality',            label: 'Hospitality',     color: '#ec4899' },
  { key: 'other',                  label: 'Other',           color: '#94a3b8' },
]

const DEPT_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Departments' },
  ...DEPARTMENTS.map((d) => ({ value: d, label: d })),
]

const KPI_LABELS: Record<KpiFilter, string> = {
  all: 'Total Visitors',
  ready: 'Expected Today',
  pending: 'Pending Approval',
  'on-premises': 'On Premises',
  declined: 'Declined Visits',
}

export default function ManagerDashboardDesktop() {
  const visits = useVisitStore((s) => s.visits)
  const storeVisitors = useVisitStore((s) => s.visitors)
  const { currentLocationId, currentRole } = useAuthStore()
  const notifications = useNotificationStore((s) => s.notifications)
  const [searchInput, setSearchInput] = useState('')
  const [kpiFilter, setKpiFilter] = useState<KpiFilter | null>(null)
  const [mapPeriod, setMapPeriod] = useState<MapPeriod>('realtime')
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('today')
  const [locationPeriod, setLocationPeriod] = useState<ChartPeriod>('today')
  const [mapDrilledState, setMapDrilledState] = useState<string | null>(null)
  const [deptFilter, setDeptFilter] = useState<string>('all')
  const [drilldownType, setDrilldownType] = useState<string | null>(null)
  const indiaMapRef = useRef<IndiaMapHandle>(null)

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

  function sliceByPeriod(source: Visit[], p: ChartPeriod | MapPeriod): Visit[] {
    if (p === 'realtime') return source.filter((v) => v.status === 'checked-in')
    if (p === 'today') return source.filter((v) => v.scheduledDate === today)
    const cutoff = new Date(now)
    cutoff.setDate(cutoff.getDate() - (p === 'week' ? 7 : 30))
    const cutoffStr = cutoff.toISOString().slice(0, 10)
    return source.filter((v) => v.scheduledDate >= cutoffStr && v.scheduledDate <= today)
  }

  const chartFilteredVisits = useMemo(
    () => sliceByPeriod(visits, chartPeriod),
    [visits, chartPeriod, today, now],
  )

  const mapFilteredVisits = useMemo(
    () => sliceByPeriod(visits, mapPeriod),
    [visits, mapPeriod, today, now],
  )

  const locationFilteredVisits = useMemo(
    () => sliceByPeriod(visits, locationPeriod),
    [visits, locationPeriod, today, now],
  )

  const topLocations = useMemo(() =>
    locations
      .map((loc) => ({
        ...loc,
        count: locationFilteredVisits.filter((v) => v.locationId === loc.id).length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    [locationFilteredVisits],
  )


  // Visit-type chart data — each bar = one visit type; optionally filtered by department
  const visitTypeChartData = useMemo(() => {
    const src = deptFilter === 'all'
      ? chartFilteredVisits
      : chartFilteredVisits.filter((v) => {
          const emp = employees.find((e) => e.id === v.hostEmployeeId)
          return emp?.department === deptFilter
        })
    return VISIT_TYPES_CONFIG.map(({ key, label, color }) => ({
      typeKey: key,
      label,
      color,
      value: src.filter((v) => v.visitType === key).length,
    }))
  }, [chartFilteredVisits, deptFilter])

  // Drilldown: department breakdown for a clicked visit-type bar
  const drilldownData = useMemo(() => {
    if (!drilldownType) return []
    const src = chartFilteredVisits.filter((v) => v.visitType === drilldownType)
    const total = src.length
    return DEPARTMENTS
      .map((dept, idx) => {
        const count = src.filter((v) => {
          const emp = employees.find((e) => e.id === v.hostEmployeeId)
          return emp?.department === dept
        }).length
        return { dept, color: DEPT_COLORS[idx % DEPT_COLORS.length], count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }
      })
      .filter((d) => d.count > 0)
  }, [drilldownType, chartFilteredVisits])

  // 3-month visit summary cards data
  const monthlyChartData = useMemo(() => {
    const result = []
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthNum = d.getMonth()
      const yearNum = d.getFullYear()
      const label = d.toLocaleString('default', { month: 'short' })
      const monthVisits = visits.filter((v) => {
        const vd = new Date(v.scheduledDate)
        return vd.getMonth() === monthNum && vd.getFullYear() === yearNum
      })
      result.push({
        month: label,
        total: monthVisits.length,
        completed: monthVisits.filter((v) => v.status === 'checked-out').length,
        cancelled: monthVisits.filter((v) => v.status === 'cancelled').length,
      })
    }
    return result
  }, [visits, now])

  const MOCK_TREND_TOTAL = 5

  const unreadCount = getUnreadCount(notifications, currentRole)

  // India map: group visits by location for the selected map period
  const visitsByLocation = useMemo(() => {
    const map: Record<string, Visit[]> = {}
    locations.forEach((loc) => { map[loc.id] = [] })
    mapFilteredVisits.forEach((v) => {
      if (map[v.locationId]) map[v.locationId].push(v)
    })
    return map
  }, [mapFilteredVisits])

  // Count for map card header — scoped to drilled state when active
  const mapVisitorCount = useMemo(() => {
    if (mapDrilledState) {
      const stateLocIds = locations
        .filter((l) => l.state === mapDrilledState)
        .map((l) => l.id)
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
        if (aWalkIn && bWalkIn) return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
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
    <div className="hidden md:flex flex-col h-full bg-surface-secondary">
      <PageHeader
        title="Branch Admin"
        titleNode={
          <div className="w-72 flex items-center gap-2 bg-surface border border-border rounded-lg px-4 h-9 focus-within:ring-2 focus-within:ring-brand-light focus-within:border-brand-light transition-shadow">
            <i className="ri-search-line text-text-tertiary shrink-0 text-base" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => { setSearchInput(e.target.value); setKpiFilter(null) }}
              placeholder="Search visitor or company…"
              className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-tertiary outline-none min-w-0"
            />
            {searchInput && (
              <button onClick={() => setSearchInput('')} className="shrink-0 text-text-tertiary hover:text-text-secondary transition-colors">
                <i className="ri-close-line text-base" />
              </button>
            )}
          </div>
        }
        actions={
          <NavLink
            to="/notifications"
            className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-surface-secondary transition-colors"
          >
            <i className="ri-notification-3-line text-xl text-text-secondary" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-semibold text-white leading-none">
                {unreadCount}
              </span>
            )}
          </NavLink>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-6 pb-10 flex flex-col gap-5 min-h-full">

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
              {/* KPI row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <KpiCardV2
                  label="Total Visitors"
                  info="Checked-in and checked-out"
                  value={kpiTotalVisited.length}
                  icon="ri-group-fill"
                  color="blue"
                  trend={MOCK_TREND_TOTAL}
                  active={kpiFilter === 'all'}
                  onClick={() => handleKpiClick('all')}
                />
                <KpiCardV2
                  label="Pending Approval"
                  info="Awaiting employee response"
                  value={pendingApproval.length}
                  icon="ri-time-fill"
                  color="yellow"
                  alertCount={delayedCount}
                  alertLabel="need follow-up"
                  alertColor="orange"
                  active={kpiFilter === 'pending'}
                  onClick={() => handleKpiClick('pending')}
                />
                <KpiCardV2
                  label="On Premises"
                  info="Currently inside the facility"
                  value={kpiOnPremises.length}
                  icon="ri-building-2-fill"
                  color="green"
                  alertCount={overdueCount}
                  alertLabel="overdue"
                  alertColor="red"
                  active={kpiFilter === 'on-premises'}
                  onClick={() => handleKpiClick('on-premises')}
                />
                <KpiCardV2
                  label="Declined Visits"
                  info="Cancelled and rejected today"
                  value={kpiDeclined.length}
                  icon="ri-close-circle-fill"
                  color="red"
                  active={kpiFilter === 'declined'}
                  onClick={() => handleKpiClick('declined')}
                />
              </div>

              {/* Main content — map + visits (left) | on-premises (right) */}
              <div className="flex flex-col lg:grid lg:grid-cols-5 gap-4 lg:gap-5">

                {/* Left col: India map card + charts */}
                <div className="lg:col-span-3 flex flex-col gap-4">

                  {/* India map card — only shown in aggregate (all-locations) view */}
                  {currentLocationId === 'all' && <div className="bg-white rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-border-light">
                      {mapDrilledState ? (
                        <button
                          onClick={() => indiaMapRef.current?.reset()}
                          className="flex items-center gap-1 text-sm font-semibold text-text-primary hover:text-text-secondary transition-colors"
                        >
                          <i className="ri-arrow-left-s-line text-base" />
                          {mapDrilledState}
                        </button>
                      ) : (
                        <>
                          <i className="ri-map-2-fill text-text-tertiary text-base shrink-0" />
                          <p className="text-sm font-semibold text-text-primary">Visitor Locations</p>
                        </>
                      )}
                      <CountBadge count={mapVisitorCount} />
                      <div className="flex-1" />
                      <PeriodDropdown value={mapPeriod} onChange={setMapPeriod} options={MAP_PERIOD_OPTIONS} />
                    </div>
                    <IndiaMap
                      ref={indiaMapRef}
                      visitsByLocation={visitsByLocation}
                      visitorMap={visitorMap}
                      activeLocationId={currentLocationId}
                      onStateChange={setMapDrilledState}
                    />
                    <div className="px-4 py-2 border-t border-border-light flex items-center gap-4 text-[11px] text-text-tertiary">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-brand inline-block" />
                        Office location
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full border-2 border-white bg-brand-light inline-block" />
                        Visitor on-site
                      </span>
                      {mapPeriod === 'realtime' && (
                        <span className="ml-auto flex items-center gap-1.5 text-green-600 font-medium">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                          </span>
                          Live
                        </span>
                      )}
                    </div>
                  </div>}

                  {/* Monthly Summary */}
                  <div className="bg-white rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border-light">
                      <i className="ri-calendar-2-fill text-text-tertiary text-base" />
                      <p className="text-sm font-semibold text-text-primary">Monthly Summary</p>
                    </div>
                    <div className="grid grid-cols-3 divide-x divide-border-light">
                      {monthlyChartData.map((m, idx) => (
                        <div key={m.month} className={`px-5 py-4 flex flex-col gap-3 ${idx === 2 ? 'bg-brand/[0.03]' : ''}`}>
                          <p className={`text-[11px] font-semibold uppercase tracking-wide ${idx === 2 ? 'text-brand' : 'text-text-tertiary'}`}>{m.month}</p>
                          <p className="text-3xl font-bold text-text-primary tabular-nums leading-none">{m.total}</p>
                          <div className="flex flex-col gap-1.5 pt-1 border-t border-border-light">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] text-text-tertiary">Pre-approved</span>
                              <span className="text-[11px] font-semibold text-emerald-600 tabular-nums">{m.completed}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] text-text-tertiary">Cancelled</span>
                              <span className="text-[11px] font-semibold text-red-500 tabular-nums">{m.cancelled}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Visits by type */}
                  <div className="bg-white rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border-light">
                      {!drilldownType && <i className="ri-bar-chart-grouped-fill text-text-tertiary text-base shrink-0" />}
                      <p className="text-sm font-semibold text-text-primary flex-1">
                        {drilldownType ? (
                          <button
                            onClick={() => setDrilldownType(null)}
                            className="flex items-center gap-1 text-sm font-semibold text-text-primary hover:text-text-secondary transition-colors"
                          >
                            <i className="ri-arrow-left-s-line text-base" />
                            {VISIT_TYPES_CONFIG.find((t) => t.key === drilldownType)?.label ?? drilldownType}
                          </button>
                        ) : 'Visits by type'}
                      </p>
                      {!drilldownType && (
                        <PeriodDropdown value={deptFilter} onChange={(v) => { setDeptFilter(v); setDrilldownType(null) }} options={DEPT_FILTER_OPTIONS} />
                      )}
                      <PeriodDropdown value={chartPeriod} onChange={setChartPeriod} options={CHART_PERIOD_OPTIONS} />
                    </div>

                    {drilldownType ? (
                      /* Drilldown — department breakdown for selected visit type */
                      <div key={drilldownType} className="px-5 py-4 vms-stagger-item">
                        <p className="text-[11px] text-text-tertiary mb-3">
                          {drilldownData.reduce((s, d) => s + d.count, 0)} visits · {chartPeriod === 'today' ? 'Today' : chartPeriod === 'week' ? 'Last 7 days' : 'Last 30 days'}
                        </p>
                        <div className="space-y-3">
                          {drilldownData.map(({ dept, color, count, pct }) => (
                            <div key={dept} className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5 w-[130px] shrink-0">
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                                <span className="text-xs text-text-secondary truncate">{dept}</span>
                              </div>
                              <div className="flex-1 h-2 bg-surface-secondary rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{ width: `${pct}%`, background: color }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-text-primary w-5 text-right tabular-nums">{count}</span>
                              <span className="text-[11px] text-text-tertiary w-8 text-right tabular-nums">{pct}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Main chart — each bar = a visit type; click to drill into dept breakdown */
                      <div key="main-chart" className="px-2 py-4 vms-stagger-item">
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart
                            key={deptFilter}
                            data={visitTypeChartData}
                            margin={{ top: 0, right: 8, left: -20, bottom: 0 }}
                            barCategoryGap="30%"
                            style={{ cursor: 'pointer' }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
                            <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip
                              contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                              cursor={{ fill: 'var(--color-surface-secondary)' }}
                            />
                            <Bar
                              dataKey="value"
                              name="Visits"
                              radius={[3, 3, 0, 0]}
                              animationBegin={0}
                              animationDuration={400}
                              animationEasing="ease-out"
                              onClick={(data) => {
                                const item = data as unknown as { typeKey?: string }
                                if (item?.typeKey) setDrilldownType(item.typeKey)
                              }}
                            >
                              {visitTypeChartData.map((entry) => (
                                <Cell key={entry.typeKey} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                </div>{/* end left col-span-3 */}

                {/* Top Locations — sticky right column */}
                <div className="lg:col-span-2 lg:sticky lg:top-4 lg:self-start">
                  <div className="bg-white rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border-light shrink-0">
                      <i className="ri-map-pin-2-fill text-text-tertiary text-base" />
                      <p className="text-sm font-semibold text-text-primary flex-1">Top Locations</p>
                      <PeriodDropdown value={locationPeriod} onChange={setLocationPeriod} options={CHART_PERIOD_OPTIONS} />
                    </div>
                    <div className="divide-y divide-border-light">
                      {topLocations.length === 0 ? (
                        <EmptyState icon="ri-map-pin-line" title="No visit data" />
                      ) : (
                        topLocations.map((loc) => {
                          const shortName = loc.name.replace('EO — ', '').replace('Branch — ', '')
                          return (
                            <div key={loc.id} className="flex items-center gap-3 px-4 py-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-text-primary truncate leading-tight">{shortName}</p>
                                <p className="text-[10px] text-text-tertiary truncate mt-0.5">{loc.address}</p>
                              </div>
                              <span className="text-sm font-bold tabular-nums text-text-primary shrink-0">{loc.count}</span>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
