import { AppLayout } from "@/components/layout/dashboard/AppLayout";
import { Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { ACTIVITY_TYPE_ICON, ACTIVITY_TYPE_COLOR, type ActivityType } from "@/lib/utils/org-constants";

interface ActivityItem {
  id: string;
  user: string;
  avatar: string;
  avatarColor: string;
  action: string;
  target: string;
  project: string;
  time: string;
  type: ActivityType;
}

const ACTIVITY: ActivityItem[] = [
  { id: "1", user: "Sarah Chen", avatar: "SC", avatarColor: "#6366f1", action: "completed", target: "Design system audit", project: "Product Redesign", time: "2 minutes ago", type: "complete" },
  { id: "2", user: "Marcus Johnson", avatar: "MJ", avatarColor: "#f59e0b", action: "commented on", target: "API integration spec", project: "API Infrastructure", time: "15 minutes ago", type: "comment" },
  { id: "3", user: "Priya Patel", avatar: "PP", avatarColor: "#10b981", action: "created", target: "Q1 Marketing Plan", project: "Marketing Campaign", time: "1 hour ago", type: "create" },
  { id: "4", user: "Alex Kim", avatar: "AK", avatarColor: "#3b82f6", action: "moved", target: "Homepage redesign → In Review", project: "Product Redesign", time: "2 hours ago", type: "move" },
  { id: "5", user: "Jordan Lee", avatar: "JL", avatarColor: "#ec4899", action: "assigned", target: "Bug fix #412 to DevOps", project: "API Infrastructure", time: "3 hours ago", type: "assign" },
  { id: "6", user: "Sarah Chen", avatar: "SC", avatarColor: "#6366f1", action: "uploaded", target: "Brand guidelines v3.pdf", project: "Design System v3", time: "4 hours ago", type: "upload" },
  { id: "7", user: "Sam Nakamura", avatar: "SN", avatarColor: "#14b8a6", action: "completed", target: "Client onboarding flow", project: "Mobile App v2", time: "5 hours ago", type: "complete" },
  { id: "8", user: "Alex Johnson", avatar: "AJ", avatarColor: "#8b5cf6", action: "created", target: "Sprint 15 planning", project: "Mobile App v2", time: "6 hours ago", type: "create" },
  { id: "9", user: "Marcus Johnson", avatar: "MJ", avatarColor: "#f59e0b", action: "completed", target: "Database migration script", project: "API Infrastructure", time: "Yesterday", type: "complete" },
  { id: "10", user: "Priya Patel", avatar: "PP", avatarColor: "#10b981", action: "commented on", target: "Social media calendar review", project: "Marketing Campaign", time: "Yesterday", type: "comment" },
  { id: "11", user: "Jordan Lee", avatar: "JL", avatarColor: "#ec4899", action: "completed", target: "Penetration test report", project: "Security Audit", time: "Yesterday", type: "complete" },
  { id: "12", user: "Riley Anderson", avatar: "RA", avatarColor: "#ef4444", action: "assigned", target: "Performance benchmarks to QA", project: "API Infrastructure", time: "2 days ago", type: "assign" },
];

export default function TeamActivity() {
  // Group by rough time groups
  const today = ACTIVITY.filter(a => !a.time.includes("Yesterday") && !a.time.includes("days"));
  const yesterday = ACTIVITY.filter(a => a.time.includes("Yesterday"));
  const older = ACTIVITY.filter(a => a.time.includes("days"));

  const renderGroup = (label: string, items: ActivityItem[]) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-8">
        <h3
          className="text-xs font-semibold uppercase tracking-wider mb-3 px-1"
          style={{ color: "var(--c-texTer)" }}
        >
          {label}
        </h3>
        <div className="space-y-1">
          {items.map(a => {
            const Icon = ACTIVITY_TYPE_ICON[a.type];
            return (
              <Link
                to='/dashboard/org/activity/$activityId'
                params={{ activityId: a.id }}
                key={a.id}
                className="flex items-start gap-3 px-3 py-3 rounded-lg transition-colors cursor-pointer"
                onMouseOver={e => (e.currentTarget.style.backgroundColor = "var(--c-bacTer)")}
                onMouseOut={e => (e.currentTarget.style.backgroundColor = "")}
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: a.avatarColor + "20", color: a.avatarColor }}
                >
                  {a.avatar}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: "var(--c-texPri)" }}>
                    <span className="font-medium">{a.user}</span>{" "}
                    <span style={{ color: "var(--c-texTer)" }}>{a.action}</span>{" "}
                    <span className="font-medium">{a.target}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: "var(--c-bacTer)", color: "var(--c-texTer)" }}
                    >
                      {a.project}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--c-texDis)" }}>{a.time}</span>
                  </div>
                </div>

                {/* Type icon */}
                <Icon className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: ACTIVITY_TYPE_COLOR[a.type] }} />
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <AppLayout title="Team Activity" subtitle="Everything happening across your organisation">
      {renderGroup("Today", today)}
      {renderGroup("Yesterday", yesterday)}
      {renderGroup("Older", older)}
    </AppLayout>
  );
}
