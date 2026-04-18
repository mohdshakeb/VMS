interface Tab<T extends string> {
  label: string
  value: T
  count?: number
}

interface TabPillsProps<T extends string> {
  tabs: Tab<T>[]
  activeTab: T
  onTabChange: (value: T) => void
}

export default function TabPills<T extends string>({ tabs, activeTab, onTabChange }: TabPillsProps<T>) {
  return (
    <div className="flex gap-1 bg-surface-secondary rounded-lg p-1 overflow-x-auto scrollbar-none">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === tab.value
              ? 'bg-white text-text-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="text-xs tabular-nums text-text-tertiary">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}
