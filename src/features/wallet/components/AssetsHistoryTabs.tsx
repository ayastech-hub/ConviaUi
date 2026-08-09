interface AssetsHistoryTabsProps {
  activeTab: 'assets' | 'history';
  onChange: (tab: 'assets' | 'history') => void;
}

/** The "Assets" / "History" segmented toggle above the wallet list. */
export function AssetsHistoryTabs({ activeTab, onChange }: AssetsHistoryTabsProps) {
  return (
    <div className="px-5 mb-3">
      <div className="flex gap-1 p-1 rounded-[14px] glass-card" style={{ border: '1px solid var(--border)' }}>
        {(['assets', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className="flex-1 py-2 rounded-[10px] capitalize"
            style={{
              background: activeTab === tab ? 'var(--card)' : 'transparent',
              color: activeTab === tab ? 'var(--foreground)' : 'var(--muted-foreground)',
              fontSize: 13, fontWeight: 600,
              boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {tab === 'assets' ? 'Assets' : 'History'}
          </button>
        ))}
      </div>
    </div>
  );
}
