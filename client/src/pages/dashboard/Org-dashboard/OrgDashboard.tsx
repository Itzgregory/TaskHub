import { AppLayout } from "@/components/layout/dashboard/AppLayout";
import { Link } from "@tanstack/react-router";
import {
  BarChart3, Users, FolderKanban, Activity, TrendingUp,
  CheckCircle2, Clock, AlertCircle, ArrowUpRight, ArrowDownRight,
  Plus, MoreHorizontal, Calendar, Target,
} from "lucide-react";


/* ---- mock data ---- */
const stats = [
  { label: "Active Projects", value: "12", change: "+2", up: true, icon: FolderKanban, accent: "var(--c-bluTexAccPri)", bg: "var(--c-bluBacSec)" },
  { label: "Team Members", value: "24", change: "+3", up: true, icon: Users, accent: "var(--c-greTexAccPri)", bg: "var(--c-greBacSec)" },
  { label: "Tasks Completed", value: "186", change: "+14%", up: true, icon: CheckCircle2, accent: "var(--c-yelTexAccPri)", bg: "var(--c-yelBacSec)" },
  { label: "Overdue Tasks", value: "7", change: "-3", up: false, icon: AlertCircle, accent: "var(--c-redTexAccPri)", bg: "var(--c-redBacSec)" },
];

const recentActivity = [
  { user: "Sarah Chen", avatar: "SC", action: "completed", target: "Design system audit", time: "2m ago", color: "#6366f1" },
  { user: "Marcus Johnson", avatar: "MJ", action: "commented on", target: "API integration spec", time: "15m ago", color: "#f59e0b" },
  { user: "Priya Patel", avatar: "PP", action: "created", target: "Q1 Marketing Plan", time: "1h ago", color: "#10b981" },
  { user: "Alex Kim", avatar: "AK", action: "moved", target: "Homepage redesign → In Review", time: "2h ago", color: "#3b82f6" },
  { user: "Jordan Lee", avatar: "JL", action: "assigned", target: "Bug fix #412 to DevOps", time: "3h ago", color: "#ec4899" },
];

const topProjects = [
  { name: "Product Redesign", progress: 72, tasks: 34, members: 6, color: "#6366f1" },
  { name: "Mobile App v2", progress: 45, tasks: 28, members: 4, color: "#f59e0b" },
  { name: "Marketing Campaign", progress: 89, tasks: 18, members: 3, color: "#10b981" },
  { name: "API Infrastructure", progress: 31, tasks: 42, members: 5, color: "#3b82f6" },
];

const upcomingDeadlines = [
  { task: "Design system v3 handoff", project: "Product Redesign", date: "Today", urgent: true },
  { task: "Sprint 14 review", project: "Mobile App v2", date: "Tomorrow", urgent: false },
  { task: "Campaign assets final", project: "Marketing", date: "Feb 23", urgent: false },
  { task: "Load testing report", project: "API Infrastructure", date: "Feb 25", urgent: false },
];

export default function OrgDashboard() {
  return (
    <AppLayout title="Organisation" subtitle="Dashboard overview">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div
            key={s.label}
            className="rounded-xl p-4 flex flex-col gap-3"
            style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <s.icon className="w-4 h-4" style={{ color: s.accent }} />
              </div>
              <span className="flex items-center gap-0.5 text-xs font-medium" style={{ color: s.up ? "var(--c-greTexAccPri)" : "var(--c-redTexAccPri)" }}>
                {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {s.change}
              </span>
            </div>
            <div>
              <div className="text-2xl font-semibold" style={{ color: "var(--c-texPri)" }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--c-texTer)" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column: Activity + Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* Recent Activity */}
        <div
          className="lg:col-span-3 rounded-xl p-5"
          style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: "var(--c-texPri)" }}>Recent Activity</h3>
            <Link to="/dashboard/org/activity" className="text-xs font-medium" style={{ color: "var(--c-bluTexAccPri)" }}>View all</Link>
          </div>
          <div className="space-y-4">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                  style={{ backgroundColor: a.color + "20", color: a.color }}
                >
                  {a.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: "var(--c-texPri)" }}>
                    <span className="font-medium">{a.user}</span>{" "}
                    <span style={{ color: "var(--c-texTer)" }}>{a.action}</span>{" "}
                    <span className="font-medium">{a.target}</span>
                  </p>
                  <span className="text-xs" style={{ color: "var(--c-texTer)" }}>{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div
          className="lg:col-span-2 rounded-xl p-5"
          style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: "var(--c-texPri)" }}>Upcoming Deadlines</h3>
            <Calendar className="w-4 h-4" style={{ color: "var(--c-texTer)" }} />
          </div>
          <div className="space-y-3">
            {upcomingDeadlines.map((d, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg"
                style={{ backgroundColor: "var(--c-bacTer)" }}
              >
                <Target className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: d.urgent ? "var(--c-redTexAccPri)" : "var(--c-texTer)" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--c-texPri)" }}>{d.task}</p>
                  <p className="text-xs" style={{ color: "var(--c-texTer)" }}>{d.project}</p>
                </div>
                <span
                  className="text-xs font-medium flex-shrink-0 px-2 py-0.5 rounded-full"
                  style={{
                    color: d.urgent ? "var(--c-redTexAccPri)" : "var(--c-texSec)",
                    backgroundColor: d.urgent ? "var(--c-redBacSec)" : "transparent",
                  }}
                >
                  {d.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project progress */}
      <div
        className="rounded-xl p-5"
        style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: "var(--c-texPri)" }}>Project Progress</h3>
          <Link to="/dashboard/org/projects" className="text-xs font-medium" style={{ color: "var(--c-bluTexAccPri)" }}>All projects</Link>
        </div>
        <div className="space-y-4">
          {topProjects.map(p => (
            <div key={p.name} className="flex items-center gap-4">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate" style={{ color: "var(--c-texPri)" }}>{p.name}</span>
                  <span className="text-xs font-mono" style={{ color: "var(--c-texTer)" }}>{p.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--c-bacTer)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${p.progress}%`, backgroundColor: p.color }} />
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs" style={{ color: "var(--c-texTer)" }}>{p.tasks} tasks</span>
                <div className="flex -space-x-1.5">
                  {Array.from({ length: Math.min(p.members, 3) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full border-2"
                      style={{ backgroundColor: "var(--c-bacTer)", borderColor: "var(--c-bacSec)" }}
                    />
                  ))}
                  {p.members > 3 && (
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] font-medium"
                      style={{ backgroundColor: "var(--c-bacTer)", borderColor: "var(--c-bacSec)", color: "var(--c-texTer)" }}
                    >
                      +{p.members - 3}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
