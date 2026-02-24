import { useTodos, useOrgMembers } from "@/lib/api/hooks";
import { mapTodoDtoToTask } from "@/lib/api/mappers";
import { getTodayStr } from "@/lib/utils/tasks";
import { useMemo } from "react";

export function useProjectData(orgId: string) {
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

  const stats = {
    open: openTasks.length,
    done: doneTasks.length,
    overdue: overdueTasks.length,
    members: members.length,
  };

  return {
    members,
    memberMap,
    openTasks,
    doneTasks,
    allTasks,
    overdueTasks,
    stats,
    isLoading: loadingOpen || loadingDone || loadingMembers,
    today,
  };
}