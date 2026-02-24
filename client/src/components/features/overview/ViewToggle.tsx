interface ViewToggleProps {
  view: 'overview' | 'board';
  onViewChange: (view: 'overview' | 'board') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 mb-6">
      {(['overview', 'board'] as const).map(v => (
        <button
          key={v}
          onClick={() => onViewChange(v)}
          className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize"
          style={{
            backgroundColor: view === v ? "var(--c-bluTexAccPri)" : "var(--c-bacSec)",
            color: view === v ? "var(--c-bacPri)" : "var(--c-texSec)",
            border: "1px solid var(--c-borPri)",
          }}
        >
          {v === 'board' ? 'Management Board' : 'Overview'}
        </button>
      ))}
    </div>
  );
}