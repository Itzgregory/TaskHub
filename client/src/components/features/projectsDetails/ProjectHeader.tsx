import { Circle, CheckCircle2, AlertCircle, Users } from "lucide-react";

interface ProjectHeaderProps {
  orgName: string;
  orgId: string;
  memberCount: number;
  taskCount: number;
  stats: {
    open: number;
    done: number;
    overdue: number;
    members: number;
  };
}

export function ProjectHeader({ orgName, orgId, memberCount, taskCount, stats }: ProjectHeaderProps) {
  const statItems = [
    { label: "Open", value: stats.open, icon: Circle, color: "var(--c-bluTexAccPri)" },
    { label: "Done", value: stats.done, icon: CheckCircle2, color: "var(--c-greTexAccPri)" },
    { label: "Overdue", value: stats.overdue, icon: AlertCircle, color: "var(--c-redTexAccPri)" },
    { label: "Members", value: stats.members, icon: Users, color: "var(--c-texTer)" },
  ];

  return (
    <div
      className="rounded-xl p-5 mb-6"
      style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
          style={{ backgroundColor: "var(--c-bluBacSec)", color: "var(--c-bluTexAccPri)" }}
        >
          {orgName.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "var(--c-texPri)" }}>
            {orgName}
          </h2>
          <span className="text-xs" style={{ color: "var(--c-texTer)" }}>
            {memberCount} members · {taskCount} tasks total
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statItems.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-lg px-3 py-2.5 flex items-center gap-2"
            style={{ backgroundColor: "var(--c-bacTer)" }}
          >
            <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
            <div>
              <p className="text-lg font-bold leading-none" style={{ color: "var(--c-texPri)" }}>{value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--c-texTer)" }}>{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}