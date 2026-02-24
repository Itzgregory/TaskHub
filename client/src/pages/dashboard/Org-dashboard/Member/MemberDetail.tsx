import { ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/layout/dashboard/AppLayout";
import { Link, useParams } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth/AuthContext";
import { useOrgMembers, useTodos } from "@/lib/api/hooks";
import { mapTodoDtoToTask } from "@/lib/api/mappers";
import { getTodayStr } from "@/lib/utils/tasks";
import { useState, useMemo } from "react";
import { MemberHeader } from "@/components/features/membersDetails/MemberHeader";
import { MemberStats } from "@/components/features/membersDetails/MemberStats";
import { TaskBreakdown } from "@/components/features/membersDetails/TaskBreakDown";
import { MemberTaskList } from "@/components/features/membersDetails/MemberTaskList";
import { LoadingState } from "@/components/features/membersDetails/LoadingState";
import { NotFoundState } from "@/components/features/membersDetails/NotFoundState";

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

  if (isLoading) return <LoadingState />;
  if (!member) return <NotFoundState />;

  return (
    <AppLayout title={member.username} subtitle="Member profile">
      <Link
        to="/dashboard/org/members"
        className="inline-flex items-center gap-1.5 text-xs font-medium mb-6 hover:underline"
        style={{ color: "var(--c-bluTexAccPri)" }}
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Members
      </Link>

      <MemberHeader member={member} isSelf={isSelf} orgName={activeOrg?.orgName} />

      <MemberStats
        openCount={memberOpen.length}
        completedCount={memberDone.length}
        overdueCount={memberOverdue.length}
        totalCount={totalTasks}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <TaskBreakdown
            completedCount={memberDone.length}
            openCount={memberOpen.length}
            overdueCount={memberOverdue.length}
            totalCount={totalTasks}
          />
        </div>

        <MemberTaskList tasks={memberTasks} today={today} />
      </div>
    </AppLayout>
  );
}