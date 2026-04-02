interface Tab {
  label: string
  value: string
  count?: number
}

interface TabBarProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (value: string) => void
}

export default function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="flex border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors duration-150 ${
            activeTab === tab.value
              ? 'text-brand'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                activeTab === tab.value
                  ? 'bg-brand-light text-brand'
                  : 'bg-surface-tertiary text-text-secondary'
              }`}
            >
              {tab.count}
            </span>
          )}
          {activeTab === tab.value && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-brand rounded-full" />
          )}
        </button>
      ))}
    </div>
  )
}
