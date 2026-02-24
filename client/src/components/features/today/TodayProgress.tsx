interface TodayProgressProps {
  progress: number;
}

export function TodayProgress({ progress }: TodayProgressProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs" style={{ color: "var(--c-texTer)" }}>Today's progress</span>
        <span className="text-xs font-mono" style={{ color: "var(--c-texSec)" }}>{progress}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--c-bacTer)" }}>
        <div 
          className="h-full rounded-full transition-all duration-500" 
          style={{ 
            width: `${progress}%`, 
            backgroundColor: progress === 100 ? "var(--c-greTexAccPri)" : "var(--c-bluTexAccPri)" 
          }} 
        />
      </div>
    </div>
  );
}