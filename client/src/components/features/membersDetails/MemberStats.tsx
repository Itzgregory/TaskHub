interface MemberStatsProps {
  openCount: number;
  completedCount: number;
  overdueCount: number;
  totalCount: number;
}

export function MemberStats({ openCount, completedCount, overdueCount, totalCount }: MemberStatsProps) {
  const stats = [
    { label: "Open Tasks", value: openCount, color: "var(--c-bluTexAccPri)" },
    { label: "Completed", value: completedCount, color: "var(--c-greTexAccPri)" },
    { label: "Overdue", value: overdueCount, color: "var(--c-redTexAccPri)" },
    { label: "Total Assigned", value: totalCount, color: "var(--c-texPri)" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {stats.map(s => (
        <div
          key={s.label}
          className="rounded-xl p-4 text-center"
          style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}
        >
          <div className="text-xl font-semibold mb-0.5" style={{ color: s.color }}>{s.value}</div>
          <div className="text-[10px]" style={{ color: "var(--c-texTer)" }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}