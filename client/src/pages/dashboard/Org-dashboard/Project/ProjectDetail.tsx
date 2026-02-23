import { AppLayout } from "@/components/layout/dashboard/AppLayout";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft, Users, CheckCircle2, Clock, Circle, Plus,
  AlertCircle, Calendar,
} from "lucide-react";
import { useTodos, useOrgMembers } from "@/lib/api/hooks";
import { mapTodoDtoToTask } from "@/lib/api/mappers";
import { TaskFormModal } from "@/components/features/TaskFormModal";
import { useState } from "react";
import { getTodayStr } from "@/lib/utils/tasks";
import { useAuth } from "@/lib/auth/AuthContext";
import { getInitials } from "@/lib/utils/getInitials";
import { PRIORITY_COLOR } from "@/lib/utils/priorityColours";


export default function ProjectDetail() {
  const { projectId: orgId } = useParams({ from: "/dashboard/org/projects/$projectId" });
  const { organisations } = useAuth();
  const [addingTask, setAddingTask] = useState(false);

  const org = organisations.find(o => o.orgId === orgId);

  const { data: openData, isLoading: loadingOpen } = useTodos({ orgId, status: "Open", pageSize: 50 });
  const { data: doneData, isLoading: loadingDone } = useTodos({ orgId, status: "Done", pageSize: 50 });
  const { data: membersData, isLoading: loadingMembers } = useOrgMembers(orgId);

  const members = membersData?.members ?? [];
  const memberMap = new Map(members.map(m => [m.userId, m.username]));

  const openTasks = (openData?.todos.items ?? []).map(dto => mapTodoDtoToTask(dto, orgId));
  const doneTasks = (doneData?.todos.items ?? []).map(dto => mapTodoDtoToTask(dto, orgId));
  const allTasks = [...openTasks, ...doneTasks];

  const today = getTodayStr();
  const overdueTasks = openTasks.filter(t => t.dueDate && t.dueDate < today);

  const isLoading = loadingOpen || loadingDone || loadingMembers;

  return (
    <AppLayout title={org?.orgName ?? "Project"} subtitle="Project overview">
      <Link
        to="/dashboard/org/projects"
        className="inline-flex items-center gap-1.5 text-xs font-medium mb-6 hover:underline"
        style={{ color: "var(--c-bluTexAccPri)" }}
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects
      </Link>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <span className="text-sm" style={{ color: "var(--c-texTer)" }}>Loading project…</span>
        </div>
      ) : (
        <>
          {/* Header card */}
          <div
            className="rounded-xl p-5 mb-6"
            style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: "var(--c-bluBacSec)", color: "var(--c-bluTexAccPri)" }}
              >
                {(org?.orgName ?? "??").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: "var(--c-texPri)" }}>
                  {org?.orgName ?? orgId}
                </h2>
                <span className="text-xs" style={{ color: "var(--c-texTer)" }}>
                  {members.length} members · {allTasks.length} tasks total
                </span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Open", value: openTasks.length, icon: Circle, color: "var(--c-bluTexAccPri)" },
                { label: "Done", value: doneTasks.length, icon: CheckCircle2, color: "var(--c-greTexAccPri)" },
                { label: "Overdue", value: overdueTasks.length, icon: AlertCircle, color: "var(--c-redTexAccPri)" },
                { label: "Members", value: members.length, icon: Users, color: "var(--c-texTer)" },
              ].map(({ label, value, icon: Icon, color }) => (
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

          {/* Two col: Tasks + Members */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Tasks */}
            <div
              className="lg:col-span-3 rounded-xl p-5"
              style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold" style={{ color: "var(--c-texPri)" }}>
                  Tasks
                </h3>
                <Button
                  size="sm"
                  onClick={() => setAddingTask(true)}
                  style={{ backgroundColor: "var(--c-bluBacSec)", color: "var(--c-bluTexAccPri)" }}
                >
                  <Plus className="w-3 h-3" /> Add Task
                </Button>
              </div>

              {allTasks.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm" style={{ color: "var(--c-texDis)" }}>No tasks yet. Create one to get started.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {allTasks.map(t => {
                    const isDone = t.status === "done";
                    const overdue = t.dueDate && t.dueDate < today && !isDone;
                    const assigneeName = t.assignedToUserId ? memberMap.get(t.assignedToUserId) : null;

                    return (
                      <div
                        key={t.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-[var(--c-bacTer)] cursor-pointer"
                      >
                        {isDone
                          ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "var(--c-greTexAccPri)" }} />
                          : overdue
                            ? <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "var(--c-redTexAccPri)" }} />
                            : <Circle className="w-4 h-4 flex-shrink-0" style={{ color: "var(--c-texDis)" }} />
                        }

                        <div className="flex-1 min-w-0">
                          <span
                            className="text-sm font-medium truncate block"
                            style={{
                              color: isDone ? "var(--c-texTer)" : "var(--c-texPri)",
                              textDecoration: isDone ? "line-through" : "none",
                            }}
                          >
                            {t.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 flex-shrink-0">
                          {t.priority !== "none" && (
                            <span
                              className="text-[10px] font-medium capitalize"
                              style={{ color: PRIORITY_COLOR[t.priority] }}
                            >
                              {t.priority}
                            </span>
                          )}
                          {t.dueDate && (
                            <span
                              className="flex items-center gap-0.5 text-[10px]"
                              style={{ color: overdue ? "var(--c-redTexSec)" : "var(--c-texDis)" }}
                            >
                              <Calendar className="w-3 h-3" />
                              {t.dueDate}
                            </span>
                          )}
                          {assigneeName && (
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                              title={assigneeName}
                              style={{ backgroundColor: "var(--c-bluBacSec)", color: "var(--c-bluTexAccPri)" }}
                            >
                              {getInitials(assigneeName)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Members */}
            <div
              className="lg:col-span-2 rounded-xl p-5"
              style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}
            >
              <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--c-texPri)" }}>
                Members
              </h3>

              {members.length === 0 ? (
                <p className="text-xs text-center py-6" style={{ color: "var(--c-texDis)" }}>No members found.</p>
              ) : (
                <div className="space-y-2">
                  {members.map(m => {
                    const memberOpenCount = openTasks.filter(t => t.assignedToUserId === m.userId).length;
                    return (
                      <div
                        key={m.userId}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                        style={{ backgroundColor: "var(--c-bacTer)" }}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: "var(--c-bluBacSec)", color: "var(--c-bluTexAccPri)" }}
                        >
                          {getInitials(m.username)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: "var(--c-texPri)" }}>
                            {m.username}
                          </p>
                          <p className="text-[10px]" style={{ color: "var(--c-texTer)" }}>
                            {m.role === "OrgAdmin" ? "Admin" : "Member"}
                          </p>
                        </div>
                        {memberOpenCount > 0 && (
                          <span
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: "var(--c-bluBacSec)", color: "var(--c-bluTexAccPri)" }}
                          >
                            {memberOpenCount} open
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quick link to full members page */}
              <Link
                to="/dashboard/org/members"
                className="mt-4 flex items-center gap-1.5 text-xs hover:underline"
                style={{ color: "var(--c-bluTexAccPri)" }}
              >
                <Users className="w-3.5 h-3.5" /> Manage team members
              </Link>
            </div>
          </div>
        </>
      )}

      {addingTask && (
        <TaskFormModal
          defaultOrgId={orgId}
          onClose={() => setAddingTask(false)}
        />
      )}
    </AppLayout>
  );
}