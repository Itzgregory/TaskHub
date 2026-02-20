import { useMemo } from "react";
import { AppLayout } from "@/components/layout/dashboard/AppLayout";
import { StatCard } from "@/components/features/StatCard";
import { ProgressBar } from "@/components/features/ProgressBar";
import { EmptyState } from "@/components/features/EmptyState";
import { Link } from "@tanstack/react-router";
import {
  Users, FolderKanban, Activity,
  CheckCircle2, AlertCircle,
  Calendar, Target, Building2,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTodos, useOrgMembers, useAuditLog } from "@/lib/api/hooks";
import { mapTodoDtoToTask } from "@/lib/api/mappers";
import { getTodayStr } from "@/lib/utils/tasks";

export default function OrgDashboard() {
  const { activeOrg } = useAuth();

  const { data: openTodos } = useTodos({
    orgId: activeOrg?.orgId || "",
    page: 1,
    pageSize: 1,
    status: "Open",
  });

  const { data: doneTodos } = useTodos({
    orgId: activeOrg?.orgId || "",
    page: 1,
    pageSize: 1,
    status: "Done",
  });

  const { data: overdueTodos } = useTodos({
    orgId: activeOrg?.orgId || "",
    page: 1,
    pageSize: 1,
    status: "Open",
    isOverdue: true,
  });

  const { data: membersData } = useOrgMembers(activeOrg?.orgId);
  const { data: auditData } = useAuditLog(
    activeOrg
      ? { orgId: activeOrg.orgId, page: 1, pageSize: 5 }
      : { orgId: "", page: 1, pageSize: 5 }
  );

  // ── Derived data ───────────────────────────────────────────────────────────

  const openCount = openTodos?.todos.totalCount ?? 0;
  const doneCount = doneTodos?.todos.totalCount ?? 0;
  const overdueCount = overdueTodos?.todos.totalCount ?? 0;
  const memberCount = membersData?.members.length ?? 0;

  const recentActivity = useMemo(() => {
    if (!auditData?.entries.items) return [];
    return auditData.entries.items.map((entry) => ({
      id: entry.id,
      action: entry.action,
      entityType: entry.entityType,
      time: new Date(entry.timestamp).toLocaleString(),
    }));
  }, [auditData]);

  const upcoming = useMemo(() => {
    if (!openTodos?.todos.items || !activeOrg) return [];
    const todayStr = getTodayStr();

    return openTodos.todos.items
      .filter((t) => t.dueDate && t.dueDate.split("T")[0] >= todayStr)
      .slice(0, 4)
      .map((todo) => {
        const task = mapTodoDtoToTask(todo, activeOrg.orgId);
        return {
          task: task.title,
          project: activeOrg.orgName,
          date: todo.dueDate ? todo.dueDate.split("T")[0] : "",
        };
      });
  }, [openTodos, activeOrg]);

  const totalTasks = openCount + doneCount;
  const workloadProgress = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  // ── Early return for no org ────────────────────────────────────────────────

  if (!activeOrg) {
    return (
      <AppLayout title="Organisation" subtitle="Select an organisation to view its dashboard">
        <EmptyState
          icon={<Building2 className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />}
          title="No organisation selected."
        />
      </AppLayout>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AppLayout title={activeOrg.orgName} subtitle="Dashboard overview">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Open Todos" value={openCount} icon={FolderKanban} accent="var(--c-bluTexAccPri)" bg="var(--c-bluBacSec)" />
        <StatCard label="Completed Todos" value={doneCount} icon={CheckCircle2} accent="var(--c-greTexAccPri)" bg="var(--c-greBacSec)" />
        <StatCard label="Overdue Todos" value={overdueCount} icon={AlertCircle} accent="var(--c-redTexAccPri)" bg="var(--c-redBacSec)" />
        <StatCard label="Team Members" value={memberCount} icon={Users} accent="var(--c-yelTexAccPri)" bg="var(--c-yelBacSec)" />
      </div>

      {/* Two-column: Activity + Upcoming Deadlines */}
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
            {recentActivity.length === 0 ? (
              <p className="text-xs" style={{ color: "var(--c-texTer)" }}>No recent activity.</p>
            ) : (
              recentActivity.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                    style={{ backgroundColor: "var(--c-bacTer)", color: "var(--c-texPri)" }}
                  >
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: "var(--c-texPri)" }}>
                      <span className="font-medium">{a.action}</span>{" "}
                      <span style={{ color: "var(--c-texTer)" }}>on</span>{" "}
                      <span className="font-medium">{a.entityType}</span>
                    </p>
                    <span className="text-xs" style={{ color: "var(--c-texTer)" }}>{a.time}</span>
                  </div>
                </div>
              ))
            )}
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
            {upcoming.length === 0 ? (
              <p className="text-xs" style={{ color: "var(--c-texTer)" }}>No upcoming deadlines.</p>
            ) : (
              upcoming.map((d, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg"
                  style={{ backgroundColor: "var(--c-bacTer)" }}
                >
                  <Target className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--c-texTer)" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--c-texPri)" }}>{d.task}</p>
                    <p className="text-xs" style={{ color: "var(--c-texTer)" }}>{d.project}</p>
                  </div>
                  <span
                    className="text-xs font-medium flex-shrink-0 px-2 py-0.5 rounded-full"
                    style={{ color: "var(--c-texSec)" }}
                  >
                    {d.date}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Workload overview */}
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
                <span className="text-sm font-medium truncate" style={{ color: "var(--c-texPri)" }}>{activeOrg.orgName}</span>
                <span className="text-xs font-mono" style={{ color: "var(--c-texTer)" }}>{workloadProgress}%</span>
              </div>
              <ProgressBar value={workloadProgress} color="#6366f1" />
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-xs" style={{ color: "var(--c-texTer)" }}>{openCount} tasks</span>
              <div className="flex -space-x-1.5">
                {Array.from({ length: Math.min(memberCount, 3) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full border-2"
                    style={{ backgroundColor: "var(--c-bacTer)", borderColor: "var(--c-bacSec)" }}
                  />
                ))}
                {memberCount > 3 && (
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] font-medium"
                    style={{ backgroundColor: "var(--c-bacTer)", borderColor: "var(--c-bacSec)", color: "var(--c-texTer)" }}
                  >
                    +{memberCount - 3}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
