import {
  ArrowLeft, Calendar, Clock, CheckCircle2, Circle, AlertCircle,
  Users, MoreHorizontal,
} from "lucide-react";
import { AppLayout } from "@/components/layout/dashboard/AppLayout";
import { ProgressBar } from "@/components/features/ProgressBar";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth/AuthContext";
import { useOrgMembers, useTodos } from "@/lib/api/hooks";
import { mapTodoDtoToTask } from "@/lib/api/mappers";
import { ROLE_META } from "@/lib/utils/org-constants";
import { getTodayStr } from "@/lib/utils/tasks";
import type { UserRole } from "@/lib/api/types";
import { getInitials } from "@/lib/utils/getInitials";
import { PRIORITY_COLOR } from "@/lib/utils/priorityColours";

function mapRoleToUi(role: UserRole) {
  return role === "OrgAdmin" ? "admin" : "member" as const;
}

export default function MemberDetail() {
  const { memberId } = useParams({ from: "/dashboard/org/members/$memberId" });
  const { activeOrg, user } = useAuth();
  const orgId = activeOrg?.orgId;
  const today = getTodayStr();

  const { data: membersData, isLoading: loadingMembers } = useOrgMembers(orgId);
  const { data: openData, isLoading: loadingOpen } = useTodos({ orgId: orgId ?? "", status: "Open", pageSize: 100 });
  const { data: doneData, isLoading: loadingDone } = useTodos({ orgId: orgId ?? "", status: "Done", pageSize: 100 });

  const members = membersData?.members ?? [];
  const member = members.find(m => m.userId === memberId);

  const allOpen = (openData?.todos.items ?? []).map(dto => mapTodoDtoToTask(dto, orgId ?? ""));
  const allDone = (doneData?.todos.items ?? []).map(dto => mapTodoDtoToTask(dto, orgId ?? ""));

  const memberOpen = allOpen.filter(t => t.assignedToUserId === memberId);
  const memberDone = allDone.filter(t => t.assignedToUserId === memberId);
  const memberOverdue = memberOpen.filter(t => t.dueDate && t.dueDate < today);
  const memberTasks = [...memberOpen, ...memberDone];
  const totalTasks = memberTasks.length;

  const isLoading = loadingMembers || loadingOpen || loadingDone;
  const isSelf = memberId === user?.userId;

  if (isLoading) {
    return (
      <AppLayout title="Member" subtitle="Loading...">
        <div className="flex items-center justify-center py-16">
          <span className="text-sm" style={{ color: "var(--c-texTer)" }}>Loading member…</span>
        </div>
      </AppLayout>
    );
  }

  if (!member) {
    return (
      <AppLayout title="Member not found" subtitle="">
        <Link to="/dashboard/org/members" className="inline-flex items-center gap-1.5 text-xs font-medium mb-6 hover:underline" style={{ color: "var(--c-bluTexAccPri)" }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Members
        </Link>
        <p className="text-sm" style={{ color: "var(--c-texTer)" }}>This member could not be found in the current organisation.</p>
      </AppLayout>
    );
  }

  const uiRole = mapRoleToUi(member.role);
  const roleMeta = ROLE_META[uiRole];
  const RoleIcon = roleMeta.icon;

  return (
    <AppLayout title={member.username} subtitle="Member profile">
      <Link
        to="/dashboard/org/members"
        className="inline-flex items-center gap-1.5 text-xs font-medium mb-6 hover:underline"
        style={{ color: "var(--c-bluTexAccPri)" }}
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Members
      </Link>

      {/* Profile header */}
      <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
            style={{ backgroundColor: "var(--c-bluBacSec)", color: "var(--c-bluTexAccPri)" }}
          >
            {getInitials(member.username)}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold" style={{ color: "var(--c-texPri)" }}>
                {member.username}
                {isSelf && <span className="text-sm ml-1" style={{ color: "var(--c-texTer)" }}>(you)</span>}
              </h2>
              <span
                className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "var(--c-bluBacSec)", color: roleMeta.color }}
              >
                <RoleIcon className="w-3 h-3" />{roleMeta.label}
              </span>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--c-greTexAccPri)" }} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: "var(--c-texTer)" }}>
              {member.joinedAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {activeOrg?.orgName}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 self-start">
            <MoreHorizontal className="w-4 h-4" style={{ color: "var(--c-texTer)" }} />
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Open Tasks", value: memberOpen.length, color: "var(--c-bluTexAccPri)" },
          { label: "Completed", value: memberDone.length, color: "var(--c-greTexAccPri)" },
          { label: "Overdue", value: memberOverdue.length, color: "var(--c-redTexAccPri)" },
          { label: "Total Assigned", value: totalTasks, color: "var(--c-texPri)" },
        ].map(s => (
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Task breakdown */}
        <div className="lg:col-span-2">
          <div className="rounded-xl p-5" style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--c-texPri)" }}>Task Breakdown</h3>
            {totalTasks === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: "var(--c-texDis)" }}>No tasks assigned yet.</p>
            ) : (
              <div className="space-y-3">
                {[
                  { label: "Completed", count: memberDone.length, color: "var(--c-greTexAccPri)" },
                  { label: "Open", count: memberOpen.length - memberOverdue.length, color: "var(--c-bluTexAccPri)" },
                  { label: "Overdue", count: memberOverdue.length, color: "var(--c-redTexAccPri)" },
                ].map(b => (
                  <div key={b.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs" style={{ color: "var(--c-texTer)" }}>{b.label}</span>
                      <span className="text-xs font-mono" style={{ color: "var(--c-texSec)" }}>{b.count}</span>
                    </div>
                    <ProgressBar value={totalTasks ? (b.count / totalTasks) * 100 : 0} color={b.color} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tasks list */}
        <div className="lg:col-span-3 rounded-xl p-5" style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--c-texPri)" }}>Assigned Tasks</h3>

          {memberTasks.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm" style={{ color: "var(--c-texDis)" }}>No tasks assigned to this member.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {memberTasks.map(t => {
                const isDone = t.status === "done";
                const overdue = t.dueDate && t.dueDate < today && !isDone;
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-[var(--c-bacTer)]"
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
                        <span className="text-[10px] font-medium capitalize" style={{ color: PRIORITY_COLOR[t.priority] }}>
                          {t.priority}
                        </span>
                      )}
                      {t.dueDate && (
                        <span
                          className="flex items-center gap-0.5 text-[10px]"
                          style={{ color: overdue ? "var(--c-redTexSec)" : "var(--c-texDis)" }}
                        >
                          <Clock className="w-3 h-3" />
                          {t.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}