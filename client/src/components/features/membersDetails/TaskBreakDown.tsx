import { ProgressBar } from "@/components/features/ProgressBar";

interface TaskBreakdownProps {
  completedCount: number;
  openCount: number;
  overdueCount: number;
  totalCount: number;
}

export function TaskBreakdown({ completedCount, openCount, overdueCount, totalCount }: TaskBreakdownProps) {
  const breakdowns = [
    { label: "Completed", count: completedCount, color: "var(--c-greTexAccPri)" },
    { label: "Open", count: openCount - overdueCount, color: "var(--c-bluTexAccPri)" },
    { label: "Overdue", count: overdueCount, color: "var(--c-redTexAccPri)" },
  ];

  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--c-texPri)" }}>Task Breakdown</h3>
      {totalCount === 0 ? (
        <p className="text-xs text-center py-4" style={{ color: "var(--c-texDis)" }}>No tasks assigned yet.</p>
      ) : (
        <div className="space-y-3">
          {breakdowns.map(b => (
            <div key={b.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: "var(--c-texTer)" }}>{b.label}</span>
                <span className="text-xs font-mono" style={{ color: "var(--c-texSec)" }}>{b.count}</span>
              </div>
              <ProgressBar value={totalCount ? (b.count / totalCount) * 100 : 0} color={b.color} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}