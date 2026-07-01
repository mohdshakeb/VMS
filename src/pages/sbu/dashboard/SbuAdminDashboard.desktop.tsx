import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFacilityStore } from '@/store/facilityStore'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore, getUnreadCount } from '@/store/notificationStore'
import type { FacilityComplianceStatus } from '@/types/facility'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import KpiCardV2 from '@/components/KpiCardV2'
import Modal from '@/components/Modal'
import PageHeader from '@/components/PageHeader'
import NotificationBell from '@/components/NotificationBell'
import Button from '@/components/Button'
import ComplianceHeatmap, { ComplianceLegend } from '@/components/facility/ComplianceHeatmap'
import EmptyState from '@/components/common/EmptyState'
import { CURRENT_COMPLIANCE_PERIOD } from '@/data/facilityData'
import {
  getCurrentRecord, scoreChecklist, starsFromPct, groupFacilitiesByLocation,
  MONTH_SHORT, COMPLIANCE_LABEL, COMPLIANCE_STYLE,
} from '@/utils/facilityHelpers'

const TREND_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']
const MAX_SELECTED = 5

function getRecentPeriods(current: { month: number; year: number }, count: number) {
  const periods: { month: number; year: number }[] = []
  let { month, year } = current
  for (let i = 0; i < count; i++) {
    periods.unshift({ month, year })
    if (month === 1) { month = 12; year-- } else { month-- }
  }
  return periods
}

const PERIOD_OPTIONS = [
  { value: '3m' as const, label: '3M', periods: getRecentPeriods(CURRENT_COMPLIANCE_PERIOD, 3) },
  { value: '6m' as const, label: '6M', periods: getRecentPeriods(CURRENT_COMPLIANCE_PERIOD, 6) },
  { value: '1y' as const, label: '1Y', periods: getRecentPeriods(CURRENT_COMPLIANCE_PERIOD, 12) },
]

const DEFAULT_TREND_LOCATIONS = ['Trichy', 'Coimbatore', 'Anna Salai - Chennai', 'Madurai', 'Tirunelveli']

const RATING_OPTIONS = [
  { value: 'all',    label: 'All Ratings' },
  { value: '5',      label: '5 ★' },
  { value: '4',      label: '4 ★' },
  { value: '3',      label: '3 ★' },
  { value: '2',      label: '2 ★' },
  { value: '1',      label: '1 ★' },
  { value: 'gte3',   label: '≥ 3 ★' },
  { value: 'below3', label: 'Below 3 ★' },
]

function matchesRating(stars: number | null, f: string): boolean {
  if (f === 'all') return true
  if (stars === null) return false
  if (f === 'below3') return stars < 3
  if (f === 'gte3') return stars >= 3
  return stars === parseInt(f)
}

function StarDisplay({ stars, size = 'sm' }: { stars: number | null; size?: 'sm' | 'xs' }) {
  if (stars === null) return <span className="text-xs text-text-tertiary">—</span>
  const cls = size === 'xs' ? 'text-[11px]' : 'text-sm'
  return (
    <div className="flex gap-0.5 shrink-0">
      {[1, 2, 3, 4, 5].map(s => (
        <i key={s} className={`${s <= stars ? 'ri-star-fill text-amber-400' : 'ri-star-line text-text-tertiary'} ${cls} leading-none`} />
      ))}
    </div>
  )
}

// ─── Custom tooltip for the compliance trend line chart ───────────────────────
function TrendTooltip({ active, payload, label, trendData, activePeriods }: {
  active?: boolean
  payload?: Array<{ dataKey: string; value: number; color: string }>
  label?: string
  trendData: Array<Record<string, number | string>>
  activePeriods: Array<{ month: number; year: number }>
}) {
  if (!active || !payload?.length) return null
  const monthIdx = trendData.findIndex(d => d.month === label)
  const period = activePeriods[monthIdx]
  return (
    <div className="bg-white border border-border rounded-xl shadow-lg px-3 py-2.5 min-w-[200px]">
      <p className="text-[11px] font-semibold text-text-secondary mb-2">
        {label} {period?.year ?? ''}
      </p>
      {payload.map(p => {
        const prevRaw = monthIdx > 0 ? trendData[monthIdx - 1][p.dataKey] : undefined
        const prev = typeof prevRaw === 'number' ? prevRaw : null
        const diff = prev !== null ? p.value - prev : null
        return (
          <div key={p.dataKey} className="flex items-center gap-2 mb-1 last:mb-0">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-[11px] text-text-primary flex-1 truncate max-w-[110px]">{p.dataKey}</span>
            <span className="text-[11px] font-bold tabular-nums text-text-primary">{p.value}%</span>
            {diff !== null && diff !== 0 && (
              <span className={`text-[10px] font-semibold tabular-nums ${diff > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {diff > 0 ? '+' : ''}{diff}%
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function SbuAdminDashboardDesktop() {
  const navigate = useNavigate()
  const facilities = useFacilityStore((s) => s.facilities)
  const complianceRecords = useFacilityStore((s) => s.complianceRecords)
  const { currentRole, currentSbu } = useAuthStore()
  const notifications = useNotificationStore((s) => s.notifications)
  const openNotificationsModal = useNotificationStore((s) => s.openNotificationsModal)
  const unreadCount = getUnreadCount(notifications, currentRole)

  const sbuFacilities = facilities.filter((f) => f.sbu === currentSbu)

  const overdue = sbuFacilities.filter((f) => f.complianceStatus === 'overdue').length

  const scoreByFacility = useMemo(() => {
    const map = new Map<string, number>()
    sbuFacilities.forEach((f) => {
      if (f.complianceProgress > 0) {
        const record = getCurrentRecord(complianceRecords, f.location)
        if (record) map.set(f.id, scoreChecklist(record.checklist).percentage)
      }
    })
    return map
  }, [sbuFacilities, complianceRecords])

  const avgScore = useMemo(() => {
    const scores = [...scoreByFacility.values()]
    return scores.length > 0 ? Math.round(scores.reduce((sum, p) => sum + p, 0) / scores.length) : null
  }, [scoreByFacility])

  const submittedCount = sbuFacilities.filter(
    (f) => f.complianceStatus === 'submitted' || f.complianceStatus === 'updated'
  ).length
  const compliancePct = sbuFacilities.length > 0
    ? Math.round(submittedCount / sbuFacilities.length * 100) : 0

  const avgStars = avgScore !== null ? starsFromPct(avgScore) : null
  const lowPerforming = [...scoreByFacility.values()].filter((pct) => pct < 60).length

  const prevPeriod = CURRENT_COMPLIANCE_PERIOD.month > 0
    ? { month: CURRENT_COMPLIANCE_PERIOD.month - 1, year: CURRENT_COMPLIANCE_PERIOD.year }
    : { month: 11, year: CURRENT_COMPLIANCE_PERIOD.year - 1 }
  const prevMonthRecords = complianceRecords.filter(
    (r) => r.month === prevPeriod.month && r.year === prevPeriod.year &&
      sbuFacilities.some((f) => f.location === r.locationName)
  )
  const overdueVsLastMonth = overdue - prevMonthRecords.filter((r) => r.status === 'overdue').length
  const lowPerformingVsLastMonth = lowPerforming - prevMonthRecords.filter((r) => {
    if (r.status !== 'submitted' && r.status !== 'updated') return false
    return scoreChecklist(r.checklist).percentage < 60
  }).length

  const locationGroups = useMemo(() => groupFacilitiesByLocation(sbuFacilities), [sbuFacilities])
  const heatmapSubmittedCount = locationGroups.filter((lg) => {
    const fac = lg.facilities[0]
    return fac && (fac.complianceStatus === 'submitted' || fac.complianceStatus === 'updated')
  }).length

  const [heatmapOpen, setHeatmapOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'locations' | 'states'>('locations')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [viewAllOpen, setViewAllOpen] = useState(false)
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<'3m' | '6m' | '1y'>('6m')
  const [selectionMode, setSelectionMode] = useState<'default' | 'cleared' | 'custom'>('default')
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])

  // ─── Compliance Trend ────────────────────────────────────────────────────────
  const activePeriods = PERIOD_OPTIONS.find(p => p.value === selectedPeriod)!.periods

  const locationTrendScores = useMemo(() => {
    return locationGroups.map(lg => {
      const monthScores = activePeriods.map(p => {
        const record = complianceRecords.find(r =>
          r.locationName === lg.location && r.month === p.month && r.year === p.year
        )
        if (!record || record.status === 'missed') return null
        if (record.status === 'submitted' || record.status === 'updated') {
          return scoreChecklist(record.checklist).percentage
        }
        return null
      })
      const valid = monthScores.filter(v => v !== null) as number[]
      const avg = valid.length > 0 ? Math.round(valid.reduce((s, v) => s + v, 0) / valid.length) : 0
      return { location: lg.location, scores: monthScores, avg }
    })
  }, [locationGroups, complianceRecords, activePeriods])

  const activeLocations = useMemo(() => {
    if (selectionMode === 'default') {
      return DEFAULT_TREND_LOCATIONS.filter(l => locationTrendScores.some(lt => lt.location === l))
    }
    if (selectionMode === 'cleared') return []
    return selectedLocations
  }, [selectionMode, selectedLocations, locationTrendScores])

  const trendData = useMemo(() =>
    activePeriods.map((p, i) => {
      const entry: Record<string, number | string> = { month: MONTH_SHORT[p.month - 1] }
      locationTrendScores
        .filter(l => activeLocations.includes(l.location))
        .forEach(loc => {
          const val = loc.scores[i]
          if (val !== null) entry[loc.location] = val
        })
      return entry
    }),
    [locationTrendScores, activeLocations, activePeriods]
  )

  function toggleLocation(loc: string) {
    if (selectionMode === 'default' || selectionMode === 'cleared') {
      setSelectedLocations([loc])
      setSelectionMode('custom')
      return
    }
    setSelectedLocations(prev => {
      if (prev.includes(loc)) {
        const next = prev.filter(l => l !== loc)
        if (next.length === 0) setSelectionMode('cleared')
        return next
      }
      if (prev.length >= MAX_SELECTED) return prev
      return [...prev, loc]
    })
  }

  function clearLocationSelection() {
    setSelectedLocations([])
    setSelectionMode('cleared')
  }

  function resetLocationSelection() {
    setSelectedLocations([])
    setSelectionMode('default')
  }

  // ─── Location / State rankings ───────────────────────────────────────────────
  const locationRankings = useMemo(() => {
    return locationGroups.map(lg => {
      const record = getCurrentRecord(complianceRecords, lg.location)
      const isOk = record && (record.status === 'submitted' || record.status === 'updated')
      const score = isOk ? scoreChecklist(record!.checklist).percentage : null
      const stars = score !== null ? starsFromPct(score) : null
      const status: FacilityComplianceStatus = record?.status ?? 'pending'
      return { location: lg.location, state: lg.state, score, stars, status }
    }).sort((a, b) => (b.score ?? -1) - (a.score ?? -1))
  }, [locationGroups, complianceRecords])

  const stateRankings = useMemo(() => {
    const stateMap = new Map<string, number[]>()
    locationRankings.forEach(lr => {
      if (lr.score !== null) {
        const arr = stateMap.get(lr.state) ?? []
        arr.push(lr.score)
        stateMap.set(lr.state, arr)
      }
    })
    return [...stateMap.entries()].map(([state, scores]) => {
      const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
      return { state, score: avg, stars: starsFromPct(avg), count: scores.length }
    }).sort((a, b) => b.score - a.score)
  }, [locationRankings])

  const filteredLocations = locationRankings.filter(lr => matchesRating(lr.stars, ratingFilter)).slice(0, 10)
  const filteredStates = stateRankings.filter(sr => matchesRating(sr.stars, ratingFilter)).slice(0, 10)


  return (
    <div className="hidden md:flex md:flex-col h-full bg-surface-secondary">
      <PageHeader
        title="Dashboard"
        icon={<NotificationBell unreadCount={unreadCount} onClick={openNotificationsModal} />}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon="ri-shield-check-line" onClick={() => navigate('/sbu/compliance')}>
              Review compliance
            </Button>
            <Button variant="primary" size="sm" icon="ri-add-line" onClick={() => navigate('/sbu/onboarding/new')}>
              New Location
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-6 pb-10 flex flex-col gap-5 min-h-full">

          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCardV2
              label="Compliance Rate"
              info={`${currentSbu} SBU`}
              value={`${compliancePct}%`}
              icon="ri-shield-check-line"
              color="green"
              detail={`${submittedCount} of ${sbuFacilities.length} locations`}
              onClick={() => setHeatmapOpen(true)}
              active={heatmapOpen}
            />

            {/* Average Rating — custom card with star icons */}
            <div className="h-full rounded-xl bg-white border border-border-light px-4 py-4 md:px-6 md:pt-5 md:pb-5 flex flex-col justify-between transition-all duration-150 hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center justify-between gap-2 md:gap-4">
                <div className="flex flex-col min-w-0">
                  <p className="text-xs font-semibold text-text-primary uppercase tracking-widest leading-snug">Average Rating</p>
                  <p className="text-xs mt-1 text-text-tertiary hidden md:block">based on avg. score</p>
                </div>
                <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0 bg-yellow-surface border border-yellow-border">
                  <i className="ri-star-line text-lg md:text-xl text-yellow-fg" />
                </div>
              </div>
              <div className="flex flex-col gap-1 mt-3 md:mt-4">
                {avgStars !== null ? (
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <i key={s} className={`${s <= avgStars ? 'ri-star-fill text-amber-400' : 'ri-star-line text-text-tertiary'} text-xl leading-none`} />
                    ))}
                  </div>
                ) : (
                  <p className="text-2xl font-semibold text-text-primary leading-none">—</p>
                )}
                <span className="text-xs text-text-tertiary font-medium leading-none">
                  Avg. Score: {avgScore !== null ? `${avgScore}%` : '—'}
                </span>
              </div>
            </div>

            <KpiCardV2
              label="Overdue"
              info="Past cut-off date"
              value={overdue}
              icon="ri-alarm-warning-line"
              color="red"
              trend={overdueVsLastMonth}
              trendLabel="vs last month"
              trendInverted
              onClick={() => navigate('/sbu/compliance?status=overdue')}
            />
            <KpiCardV2
              label="Low Performing"
              info="Rating below 3 stars"
              value={lowPerforming}
              icon="ri-star-off-line"
              color="yellow"
              trend={lowPerformingVsLastMonth}
              trendLabel="vs last month"
              trendInverted
              onClick={() => navigate('/sbu/locations?rating=below3')}
            />
          </div>

          {/* Charts row */}
          <div className="flex flex-col lg:grid lg:grid-cols-5 gap-5">

            {/* Compliance Trend */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border-light">
                  <i className="ri-bar-chart-line text-text-tertiary text-base shrink-0" />
                  <p className="text-sm font-semibold text-text-primary flex-1">Compliance Trend</p>
                  {/* Period selector */}
                  <div className="flex items-center bg-surface border border-border rounded-lg p-0.5 shrink-0">
                    {PERIOD_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setSelectedPeriod(opt.value)}
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors ${
                          selectedPeriod === opt.value
                            ? 'bg-white text-text-primary shadow-sm'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {/* Location selector */}
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setSelectorOpen(!selectorOpen)}
                      className={`flex items-center gap-1.5 text-[11px] font-medium border rounded-lg px-2 py-1 transition-colors ${
                        selectionMode !== 'default'
                          ? 'bg-brand-light text-brand border-brand'
                          : 'bg-surface text-text-secondary border-border hover:bg-surface-secondary'
                      }`}
                    >
                      <i className="ri-map-pin-2-line text-sm" />
                      {activeLocations.length} locations
                      <i className={`ri-arrow-down-s-line text-sm transition-transform ${selectorOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {selectorOpen && (
                      <>
                        {/* Backdrop */}
                        <div className="fixed inset-0 z-10" onClick={() => setSelectorOpen(false)} />
                        {/* Dropdown */}
                        <div className="absolute right-0 top-full mt-1.5 z-20 bg-white border border-border rounded-xl shadow-lg w-52 overflow-hidden">
                          <div className="flex items-center justify-between px-3 py-2 border-b border-border-light">
                            <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">
                              Select up to {MAX_SELECTED}
                            </span>
                            {selectionMode === 'default' ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); clearLocationSelection() }}
                                className="text-[10px] text-brand hover:text-brand-hover font-medium"
                              >
                                Clear
                              </button>
                            ) : (
                              <button
                                onClick={(e) => { e.stopPropagation(); resetLocationSelection() }}
                                className="text-[10px] text-brand hover:text-brand-hover font-medium"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                          <div className="max-h-60 overflow-y-auto py-1">
                            {locationTrendScores
                              .sort((a, b) => a.location.localeCompare(b.location))
                              .map((loc) => {
                                const checked = activeLocations.includes(loc.location)
                                const colorIdx = activeLocations.indexOf(loc.location)
                                const disabled = !checked && activeLocations.length >= MAX_SELECTED
                                return (
                                  <button
                                    key={loc.location}
                                    disabled={disabled}
                                    onClick={(e) => { e.stopPropagation(); toggleLocation(loc.location) }}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                                      disabled ? 'opacity-40 cursor-default' : 'hover:bg-surface-secondary'
                                    }`}
                                  >
                                    <span
                                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                        checked ? 'border-transparent' : 'border-border'
                                      }`}
                                      style={checked ? { backgroundColor: TREND_COLORS[colorIdx % TREND_COLORS.length] } : {}}
                                    >
                                      {checked && <i className="ri-check-line text-white text-[9px]" />}
                                    </span>
                                    <span className={`text-xs truncate flex-1 ${checked ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                                      {loc.location}
                                    </span>
                                  </button>
                                )
                              })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="px-2 py-4">
                  {activeLocations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-56 gap-2 text-text-tertiary">
                      <i className="ri-map-pin-off-line text-2xl" />
                      <p className="text-xs font-medium">Select locations to compare</p>
                      <p className="text-[11px]">Use the locations picker above</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={224}>
                      <LineChart data={trendData} margin={{ top: 18, right: 16, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          domain={[40, 100]}
                          tickFormatter={(v) => v + '%'}
                          tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<TrendTooltip trendData={trendData} activePeriods={activePeriods} />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                        {activeLocations.map((loc, i) => (
                          <Line
                            key={loc}
                            dataKey={loc}
                            stroke={TREND_COLORS[i % TREND_COLORS.length]}
                            strokeWidth={2}
                            dot={false}
                            animationDuration={400}
                            animationEasing="ease-out"
                            connectNulls={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Top Rated */}
            <div className="lg:col-span-2 lg:sticky lg:top-4 lg:self-start">
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border-light shrink-0 flex-wrap gap-y-2">
                  <i className="ri-map-pin-2-fill text-text-tertiary text-base shrink-0" />
                  <p className="text-sm font-semibold text-text-primary flex-1">Top Rated</p>
                  {/* Locations | States toggle */}
                  <div className="flex items-center bg-surface border border-border rounded-lg p-0.5 shrink-0">
                    {(['locations', 'states'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors ${
                          viewMode === mode
                            ? 'bg-white text-text-primary shadow-sm'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {mode === 'locations' ? 'Locations' : 'States'}
                      </button>
                    ))}
                  </div>
                  {/* Rating filter */}
                  <div className="relative flex items-center shrink-0">
                    <select
                      value={ratingFilter}
                      onChange={(e) => setRatingFilter(e.target.value)}
                      className="text-[11px] font-medium text-text-secondary bg-surface border border-border rounded-lg pl-2 pr-6 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-light appearance-none"
                    >
                      {RATING_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <i className="ri-arrow-down-s-line absolute right-1.5 text-text-tertiary text-sm pointer-events-none" />
                  </div>
                </div>

                {/* Ranked list */}
                <div className="divide-y divide-border-light">
                  {viewMode === 'locations' ? (
                    filteredLocations.length === 0 ? (
                      <EmptyState icon="ri-map-pin-line" title="No locations match" />
                    ) : (
                      filteredLocations.map((lr, idx) => (
                        <div key={lr.location} className="flex items-center gap-3 px-4 py-2.5">
                          <span className="text-[11px] text-text-tertiary w-5 tabular-nums shrink-0">{idx + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-text-primary truncate leading-tight">{lr.location}</p>
                            <p className="text-[10px] text-text-tertiary truncate mt-0.5">{lr.state}</p>
                          </div>
                          <StarDisplay stars={lr.stars} size="xs" />
                          <span className="text-xs font-bold tabular-nums text-text-primary shrink-0 w-9 text-right">
                            {lr.score !== null ? `${lr.score}%` : '—'}
                          </span>
                        </div>
                      ))
                    )
                  ) : (
                    filteredStates.length === 0 ? (
                      <EmptyState icon="ri-map-pin-line" title="No states match" />
                    ) : (
                      filteredStates.map((sr, idx) => (
                        <div key={sr.state} className="flex items-center gap-3 px-4 py-2.5">
                          <span className="text-[11px] text-text-tertiary w-5 tabular-nums shrink-0">{idx + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-text-primary truncate leading-tight">{sr.state}</p>
                            <p className="text-[10px] text-text-tertiary mt-0.5">{sr.count} locations</p>
                          </div>
                          <StarDisplay stars={sr.stars} size="xs" />
                          <span className="text-xs font-bold tabular-nums text-text-primary shrink-0 w-9 text-right">{sr.score}%</span>
                        </div>
                      ))
                    )
                  )}
                </div>

                {/* View All footer */}
                <div className="border-t border-border-light px-4 py-2.5">
                  <button
                    onClick={() => setViewAllOpen(true)}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-brand hover:text-brand-hover transition-colors py-1"
                  >
                    View all <i className="ri-arrow-right-s-line text-sm" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Compliance Heatmap Modal */}
      <Modal
        open={heatmapOpen}
        onClose={() => setHeatmapOpen(false)}
        title="Compliance Heatmap"
        subtitle={`${heatmapSubmittedCount} of ${locationGroups.length} locations submitted for current period`}
        actions={
          <button className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary border border-border rounded-lg px-2.5 py-1.5 hover:bg-surface-secondary transition-colors">
            <i className="ri-download-2-line text-sm" />
            Export
          </button>
        }
        size="xl"
        scrollable
        footer={<ComplianceLegend />}
      >
        <ComplianceHeatmap facilities={sbuFacilities} complianceRecords={complianceRecords} />
      </Modal>

      {/* View All — Locations / States Modal */}
      <Modal
        open={viewAllOpen}
        onClose={() => setViewAllOpen(false)}
        title={viewMode === 'locations' ? 'All Locations' : 'All States'}
        subtitle={
          viewMode === 'locations'
            ? `${locationRankings.length} locations · current period`
            : `${stateRankings.length} states · aggregated score`
        }
        size="lg"
        scrollable
      >
        <div className="divide-y divide-border-light">
          {viewMode === 'locations' ? (
            locationRankings.map((lr, idx) => (
              <div key={lr.location} className="flex items-center gap-4 px-5 py-3">
                <span className="text-sm text-text-tertiary tabular-nums w-6 shrink-0">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{lr.location}</p>
                  <p className="text-xs text-text-tertiary">{lr.state}</p>
                </div>
                <StarDisplay stars={lr.stars} />
                <span className="text-sm font-bold tabular-nums text-text-primary w-12 text-right shrink-0">
                  {lr.score !== null ? `${lr.score}%` : '—'}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${COMPLIANCE_STYLE[lr.status]}`}>
                  {COMPLIANCE_LABEL[lr.status]}
                </span>
              </div>
            ))
          ) : (
            stateRankings.map((sr, idx) => (
              <div key={sr.state} className="flex items-center gap-4 px-5 py-3">
                <span className="text-sm text-text-tertiary tabular-nums w-6 shrink-0">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary">{sr.state}</p>
                  <p className="text-xs text-text-tertiary">{sr.count} locations</p>
                </div>
                <StarDisplay stars={sr.stars} />
                <span className="text-sm font-bold tabular-nums text-text-primary w-12 text-right shrink-0">{sr.score}%</span>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  )
}
