// ─────────────────────────────────────────────────────────────────────────────
// Visit Insights — Mobile (Central Admin)
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useMemo, useEffect } from 'react'
import { useVisitStore } from '@/store/visitStore'
import { useAuthStore } from '@/store/authStore'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList, ResponsiveContainer,
} from 'recharts'
import KpiCardV2 from '@/components/KpiCardV2'
import VisitCard from '@/components/VisitCard'
import BottomSheet from '@/components/Mobile/BottomSheet'
import { visitors as seedVisitors } from '@/data/visitors'
import { OVERDUE_VISIT_IDS, DELAYED_VISIT_IDS } from '@/data/visits'
import { employees } from '@/data/employees'
import { locations } from '@/data/locations'
import type { Visit } from '@/types/visit'
import { getLocalDateString } from '@/utils/helpers'
import EmptyState from '@/components/common/EmptyState'
import CountBadge from '@/components/common/CountBadge'
import MobileSearchInput from '@/components/Mobile/MobileSearchInput'

type KpiFilter = 'all' | 'pending' | 'on-premises' | 'declined'
type ChartPeriod = 'today' | 'week' | 'month'
type FilterSheet =
  | null
  | 'loc-menu' | 'loc-period' | 'loc-type'
  | 'chart-menu' | 'chart-period' | 'chart-dept'

const KPI_LABELS: Record<KpiFilter, string> = {
  all: 'Total Visitors',
  pending: 'Pending Approval',
  'on-premises': 'On Premises',
  declined: 'Declined Visits',
}

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

const CHART_PERIOD_LABELS: Record<ChartPeriod, string> = {
  today: 'Today',
  week: 'Last 7 days',
  month: 'Last 30 days',
}

const CHART_PERIOD_OPTIONS = (Object.keys(CHART_PERIOD_LABELS) as ChartPeriod[]).map((v) => ({ value: v, label: CHART_PERIOD_LABELS[v] }))

const VISIT_TYPES_CONFIG = [
  { key: 'customer',              label: 'Customer',    color: '#3b82f6' },
  { key: 'vendor',                label: 'Vendor',      color: '#f59e0b' },
  { key: 'contractor',            label: 'Contractor',  color: '#10b981' },
  { key: 'government-official',   label: 'Govt.',       color: '#8b5cf6' },
  { key: 'cat-officials',         label: 'CAT',         color: '#ef4444' },
  { key: 'employee-other-branch', label: 'GMMCO',       color: '#f97316' },
  { key: 'general-visitor',       label: 'General',     color: '#06b6d4' },
  { key: 'hospitality',           label: 'Hospitality', color: '#ec4899' },
  { key: 'other',                 label: 'Other',       color: '#94a3b8' },
]

const DEPT_FILTER_OPTIONS = [
  { value: 'all', label: 'All Departments' },
  ...DEPARTMENTS.map((d) => ({ value: d, label: d })),
]

const LOCATION_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  ...VISIT_TYPES_CONFIG.map((t) => ({ value: t.key, label: t.label })),
]

const FILTER_SHEET_TITLES: Record<Exclude<FilterSheet, null>, string> = {
  'loc-menu':    'Top Locations',
  'loc-period':  'Period',
  'loc-type':    'Visit Type',
  'chart-menu':  'Visits by Type',
  'chart-period': 'Period',
  'chart-dept':  'Department',
}

export default function ManagerDashboardMobile() {
  const visits = useVisitStore((s) => s.visits)
  const storeVisitors = useVisitStore((s) => s.visitors)
  const { currentLocationId } = useAuthStore()

  const [searchInput, setSearchInput] = useState('')
  const [kpiFilter, setKpiFilter] = useState<KpiFilter | null>(null)
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('today')
  const [locationPeriod, setLocationPeriod] = useState<ChartPeriod>('today')
  const [locationTypeFilter, setLocationTypeFilter] = useState<string>('all')
  const [deptFilter, setDeptFilter] = useState<string>('all')
  const [drilldownType, setDrilldownType] = useState<string | null>(null)

  // Filter bottom sheet state — same pattern as VisitHistory
  const [filterSheet, setFilterSheet] = useState<FilterSheet>(null)
  const [filterSheetVisible, setFilterSheetVisible] = useState(false)

  useEffect(() => {
    if (filterSheet) {
      requestAnimationFrame(() => { requestAnimationFrame(() => setFilterSheetVisible(true)) })
    } else {
      setFilterSheetVisible(false)
    }
  }, [filterSheet])

  function openFilterSheet(sheet: Exclude<FilterSheet, null>) { setFilterSheet(sheet) }
  function closeFilterSheet() { setFilterSheetVisible(false); setTimeout(() => setFilterSheet(null), 260) }

  const now = new Date()
  const today = getLocalDateString(now)

  const visitorMap = useMemo(
    () => Object.fromEntries([...seedVisitors, ...storeVisitors].map((v) => [v.id, v])),
    [storeVisitors],
  )

  // Today + location scoped — for KPI cards
  const todaysVisits = useMemo(() =>
    visits.filter((v) => {
      const matchesDate = v.scheduledDate === today
      const matchesLoc = currentLocationId === 'all' || v.locationId === currentLocationId
      return matchesDate && matchesLoc
    }),
    [visits, today, currentLocationId],
  )

  const kpiOnPremises = todaysVisits.filter((v) => v.status === 'checked-in')
  const kpiTotalVisited = todaysVisits.filter((v) => v.status === 'checked-in' || v.status === 'checked-out')
  const pendingApproval = todaysVisits.filter((v) => v.status === 'pending-approval')
  const kpiDeclined = todaysVisits.filter((v) => v.status === 'cancelled' || v.status === 'rejected')

  const overdueCount = kpiOnPremises.filter((v) => OVERDUE_VISIT_IDS.has(v.id)).length
  const delayedCount = pendingApproval.filter((v) => DELAYED_VISIT_IDS.has(v.id)).length

  const MOCK_TREND_TOTAL = 5

  function sliceByPeriod(source: Visit[], p: ChartPeriod): Visit[] {
    if (p === 'today') return source.filter((v) => v.scheduledDate === today)
    const cutoff = new Date(now)
    cutoff.setDate(cutoff.getDate() - (p === 'week' ? 7 : 30))
    const cutoffStr = cutoff.toISOString().slice(0, 10)
    return source.filter((v) => v.scheduledDate >= cutoffStr && v.scheduledDate <= today)
  }

  const chartFilteredVisits = useMemo(
    () => sliceByPeriod(visits, chartPeriod),
    [visits, chartPeriod, today],
  )

  const locationFilteredVisits = useMemo(
    () => sliceByPeriod(visits, locationPeriod),
    [visits, locationPeriod, today],
  )

  const topLocations = useMemo(() =>
    locations
      .map((loc) => ({
        ...loc,
        count: locationFilteredVisits.filter((v) =>
          v.locationId === loc.id && (locationTypeFilter === 'all' || v.visitType === locationTypeFilter)
        ).length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    [locationFilteredVisits, locationTypeFilter],
  )

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
        isCurrent: i === 0,
      })
    }
    return result
  }, [visits, now])

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
    const sortPending = (arr: Visit[]) =>
      [...arr].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    if (kpiFilter === 'all') return [...kpiTotalVisited].sort((a, b) => (b.checkInTime ?? '').localeCompare(a.checkInTime ?? ''))
    if (kpiFilter === 'pending') return sortPending(pendingApproval)
    if (kpiFilter === 'on-premises') return [...kpiOnPremises].sort((a, b) => Number(OVERDUE_VISIT_IDS.has(b.id)) - Number(OVERDUE_VISIT_IDS.has(a.id)))
    if (kpiFilter === 'declined') return [...kpiDeclined].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return []
  }

  const resultList = getResultList()

  // Derived labels for filter sheet menu rows
  const locTypeLabel = locationTypeFilter === 'all'
    ? 'All Types'
    : VISIT_TYPES_CONFIG.find((t) => t.key === locationTypeFilter)?.label ?? locationTypeFilter
  const deptLabel = deptFilter === 'all' ? 'All Departments' : deptFilter

  // Back handler and footer for the filter sheet — derived from active sheet state
  const filterSheetOnBack: (() => void) | undefined =
    filterSheet === 'loc-period' || filterSheet === 'loc-type'
      ? () => setFilterSheet('loc-menu')
      : filterSheet === 'chart-period' || filterSheet === 'chart-dept'
        ? () => setFilterSheet('chart-menu')
        : undefined

  const exportButton = (
    <div className="flex justify-center">
      <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand/[0.08] text-brand hover:bg-brand/[0.14] transition-colors text-sm font-medium">
        <i className="ri-download-line text-base" />
        Export
      </button>
    </div>
  )
  const filterSheetFooter =
    filterSheet === 'loc-menu' || filterSheet === 'chart-menu' ? exportButton : undefined

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

              {/* Monthly Summary — vertically stacked rows */}
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border-light">
                  <i className="ri-calendar-2-fill text-text-tertiary text-base" />
                  <p className="text-sm font-semibold text-text-primary">Monthly Summary</p>
                </div>
                <div className="divide-y divide-border-light">
                  {monthlyChartData.map((m) => (
                    <div key={m.month} className={`px-4 py-3.5 flex items-center gap-4 ${m.isCurrent ? 'bg-brand/[0.03]' : ''}`}>
                      <p className={`text-[11px] font-semibold uppercase tracking-wide w-8 shrink-0 ${m.isCurrent ? 'text-brand' : 'text-text-tertiary'}`}>{m.month}</p>
                      <p className="text-2xl font-bold text-text-primary tabular-nums leading-none w-10 shrink-0">{m.total}</p>
                      <div className="flex flex-col gap-1 pl-3 border-l border-border-light flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-text-tertiary">Pre-approved</span>
                          <span className="text-[10px] font-semibold text-emerald-600 tabular-nums">{m.completed}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-text-tertiary">Cancelled</span>
                          <span className="text-[10px] font-semibold text-red-500 tabular-nums">{m.cancelled}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Locations — desktop-style divide-y list, kebab menu for filters */}
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border-light">
                  <i className="ri-map-pin-2-fill text-text-tertiary text-base shrink-0" />
                  <p className="text-sm font-semibold text-text-primary flex-1">Top Locations</p>
                  <button
                    onClick={() => openFilterSheet('loc-menu')}
                    className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-surface-secondary transition-colors"
                  >
                    <i className="ri-more-2-fill text-text-tertiary text-base" />
                  </button>
                </div>
                {topLocations.length === 0 ? (
                  <div className="p-3">
                    <EmptyState icon="ri-map-pin-line" title="No visit data" className="py-8" iconClassName="text-2xl" titleClassName="text-sm" />
                  </div>
                ) : (
                  <div className="divide-y divide-border-light">
                    {topLocations.map((loc) => {
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
                    })}
                  </div>
                )}
              </div>

              {/* Visits by Type — kebab menu for filters, bar chart + drilldown */}
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border-light">
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
                    ) : 'Visits by Type'}
                  </p>
                  <button
                    onClick={() => openFilterSheet('chart-menu')}
                    className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-surface-secondary transition-colors shrink-0"
                  >
                    <i className="ri-more-2-fill text-text-tertiary text-base" />
                  </button>
                </div>

                {drilldownType ? (
                  <div key={drilldownType} className="px-4 py-4 vms-stagger-item">
                    <p className="text-[11px] text-text-tertiary mb-3">
                      {drilldownData.reduce((s, d) => s + d.count, 0)} visits · {CHART_PERIOD_LABELS[chartPeriod]}
                    </p>
                    {drilldownData.length === 0 ? (
                      <EmptyState icon="ri-bar-chart-line" title="No department data" className="py-8" iconClassName="text-2xl" titleClassName="text-sm" />
                    ) : (
                      <div className="space-y-3">
                        {drilldownData.map(({ dept, color, count, pct }) => (
                          <div key={dept} className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                            <span className="text-xs text-text-secondary flex-1 min-w-0 truncate">{dept}</span>
                            <div className="w-20 h-1.5 bg-surface-secondary rounded-full overflow-hidden shrink-0">
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                            </div>
                            <span className="text-xs font-semibold text-text-primary w-4 text-right tabular-nums shrink-0">{count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div key="main-chart" className="px-1 py-4 vms-stagger-item">
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart
                        data={visitTypeChartData}
                        margin={{ top: 16, right: 8, left: -20, bottom: 48 }}
                        barCategoryGap="30%"
                        style={{ cursor: 'pointer' }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 9, fill: 'var(--color-text-tertiary)', angle: -40, textAnchor: 'end', dy: 4 }}
                          axisLine={false}
                          tickLine={false}
                          interval={0}
                        />
                        <YAxis tick={{ fontSize: 9, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                          cursor={{ fill: 'var(--color-surface-secondary)' }}
                        />
                        <Bar
                          dataKey="value"
                          name="Visits"
                          radius={[3, 3, 0, 0]}
                          animationDuration={400}
                          animationBegin={0}
                          onClick={(data) => {
                            const item = data as unknown as { typeKey?: string }
                            if (item?.typeKey) setDrilldownType(item.typeKey)
                          }}
                        >
                          <LabelList
                            dataKey="value"
                            position="top"
                            style={{ fontSize: 9, fontWeight: 600, fill: 'var(--color-text-secondary)' }}
                            formatter={(v: unknown) => (v as number) > 0 ? String(v) : ''}
                          />
                          {visitTypeChartData.map((entry) => (
                            <Cell key={entry.typeKey} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

            </>
          )}

        </div>
      </div>

      {/* Filter bottom sheet — shared by Top Locations and Visits by Type */}
      <BottomSheet
        mounted={!!filterSheet}
        visible={filterSheetVisible}
        onClose={closeFilterSheet}
        onBack={filterSheetOnBack}
        title={filterSheet ? FILTER_SHEET_TITLES[filterSheet] : undefined}
        footer={filterSheetFooter}
      >
        {/* ── Top Locations main menu ── */}
        {filterSheet === 'loc-menu' && (
          <div className="py-2">
            <button
              onClick={() => setFilterSheet('loc-period')}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-surface transition-colors"
            >
              <span className="text-sm font-medium text-text-primary">Period</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-text-tertiary">{CHART_PERIOD_LABELS[locationPeriod]}</span>
                <i className="ri-arrow-right-s-line text-text-tertiary text-base" />
              </div>
            </button>
            <button
              onClick={() => setFilterSheet('loc-type')}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-surface transition-colors"
            >
              <span className="text-sm font-medium text-text-primary">Visit Type</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-text-tertiary">{locTypeLabel}</span>
                <i className="ri-arrow-right-s-line text-text-tertiary text-base" />
              </div>
            </button>
          </div>
        )}

        {/* ── Top Locations → Period sub-page ── */}
        {filterSheet === 'loc-period' && (
          <div className="py-2">
            {CHART_PERIOD_OPTIONS.map((opt) => {
              const isSelected = opt.value === locationPeriod
              return (
                <button
                  key={opt.value}
                  onClick={() => { setLocationPeriod(opt.value); closeFilterSheet() }}
                  className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors ${isSelected ? 'bg-brand-light' : 'hover:bg-surface'}`}
                >
                  <span className={`text-sm font-medium ${isSelected ? 'text-brand' : 'text-text-primary'}`}>{opt.label}</span>
                  {isSelected && <i className="ri-check-line text-brand text-base" />}
                </button>
              )
            })}
          </div>
        )}

        {/* ── Top Locations → Visit Type sub-page ── */}
        {filterSheet === 'loc-type' && (
          <div className="py-2">
            {LOCATION_TYPE_OPTIONS.map((opt) => {
              const isSelected = opt.value === locationTypeFilter
              return (
                <button
                  key={opt.value}
                  onClick={() => { setLocationTypeFilter(opt.value); closeFilterSheet() }}
                  className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors ${isSelected ? 'bg-brand-light' : 'hover:bg-surface'}`}
                >
                  <span className={`text-sm font-medium ${isSelected ? 'text-brand' : 'text-text-primary'}`}>{opt.label}</span>
                  {isSelected && <i className="ri-check-line text-brand text-base" />}
                </button>
              )
            })}
          </div>
        )}

        {/* ── Visits by Type main menu ── */}
        {filterSheet === 'chart-menu' && (
          <div className="py-2">
            <button
              onClick={() => setFilterSheet('chart-period')}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-surface transition-colors"
            >
              <span className="text-sm font-medium text-text-primary">Period</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-text-tertiary">{CHART_PERIOD_LABELS[chartPeriod]}</span>
                <i className="ri-arrow-right-s-line text-text-tertiary text-base" />
              </div>
            </button>
            <button
              onClick={() => setFilterSheet('chart-dept')}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-surface transition-colors"
            >
              <span className="text-sm font-medium text-text-primary">Department</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-text-tertiary">{deptLabel}</span>
                <i className="ri-arrow-right-s-line text-text-tertiary text-base" />
              </div>
            </button>
          </div>
        )}

        {/* ── Visits by Type → Period sub-page ── */}
        {filterSheet === 'chart-period' && (
          <div className="py-2">
            {CHART_PERIOD_OPTIONS.map((opt) => {
              const isSelected = opt.value === chartPeriod
              return (
                <button
                  key={opt.value}
                  onClick={() => { setChartPeriod(opt.value); setDrilldownType(null); closeFilterSheet() }}
                  className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors ${isSelected ? 'bg-brand-light' : 'hover:bg-surface'}`}
                >
                  <span className={`text-sm font-medium ${isSelected ? 'text-brand' : 'text-text-primary'}`}>{opt.label}</span>
                  {isSelected && <i className="ri-check-line text-brand text-base" />}
                </button>
              )
            })}
          </div>
        )}

        {/* ── Visits by Type → Department sub-page ── */}
        {filterSheet === 'chart-dept' && (
          <div className="py-2">
            {DEPT_FILTER_OPTIONS.map((opt) => {
              const isSelected = opt.value === deptFilter
              return (
                <button
                  key={opt.value}
                  onClick={() => { setDeptFilter(opt.value); setDrilldownType(null); closeFilterSheet() }}
                  className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors ${isSelected ? 'bg-brand-light' : 'hover:bg-surface'}`}
                >
                  <span className={`text-sm font-medium ${isSelected ? 'text-brand' : 'text-text-primary'}`}>{opt.label}</span>
                  {isSelected && <i className="ri-check-line text-brand text-base" />}
                </button>
              )
            })}
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
