import { Link } from "@tanstack/react-router";
import { ProgressBar } from "@/components/features/ProgressBar";

interface WorkloadOverviewProps {
  orgName: string;
  progress: number;
  openCount: number;
  memberCount: number;
}

export function WorkloadOverview({ orgName, progress, openCount, memberCount }: WorkloadOverviewProps) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: "var(--c-texPri)" }}>Workload Overview</h3>
        <Link to="/dashboard/org/projects" className="text-xs font-medium" style={{ color: "var(--c-bluTexAccPri)" }}>All workspaces</Link>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#6366f1" }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium truncate" style={{ color: "var(--c-texPri)" }}>{orgName}</span>
              <span className="text-xs font-mono" style={{ color: "var(--c-texTer)" }}>{progress}%</span>
            </div>
            <ProgressBar value={progress} color="#6366f1" />
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xs" style={{ color: "var(--c-texTer)" }}>{openCount} tasks</span>
            <MemberAvatars count={memberCount} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MemberAvatars({ count }: { count: number }) {
  return (
    <div className="flex -space-x-1.5">
      {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
        <div
          key={i}
          className="w-5 h-5 rounded-full border-2"
          style={{ backgroundColor: "var(--c-bacTer)", borderColor: "var(--c-bacSec)" }}
        />
      ))}
      {count > 3 && (
        <div
          className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] font-medium"
          style={{ backgroundColor: "var(--c-bacTer)", borderColor: "var(--c-bacSec)", color: "var(--c-texTer)" }}
        >
          +{count - 3}
        </div>
      )}
    </div>
  );
}