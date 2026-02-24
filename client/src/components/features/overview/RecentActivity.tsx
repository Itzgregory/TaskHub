import { Link } from "@tanstack/react-router";
import type { ElementType } from "react";

export interface ActivityItem {
  id: string;
  icon: ElementType;
  color: string;
  actorName: string;
  label: string;
  entityLabel: string;
  time: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div
      className="lg:col-span-3 rounded-xl p-5"
      style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: "var(--c-texPri)" }}>Recent Activity</h3>
        <Link to="/dashboard/org/activity" className="text-xs font-medium" style={{ color: "var(--c-bluTexAccPri)" }}>View all</Link>
      </div>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-xs" style={{ color: "var(--c-texTer)" }}>No recent activity.</p>
        ) : (
          activities.map((a) => {
            const Icon = a.icon;
            return (
              <div key={a.id} className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                  style={{ backgroundColor: a.color + "20", color: a.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: "var(--c-texPri)" }}>
                    <span className="font-medium">{a.actorName}</span>{" "}
                    <span style={{ color: "var(--c-texTer)" }}>{a.label}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--c-bacTer)", color: "var(--c-texTer)" }}>
                      {a.entityLabel}
                    </span>
                    <span className="text-xs" style={{ color: "var(--c-texTer)" }}>{a.time}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}