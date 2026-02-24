import { useMemo } from "react";
import { useTodos, useOrgMembers, useAuditLog } from "@/lib/api/hooks";
import { mapTodoDtoToTask } from "@/lib/api/mappers";
import { getTodayStr } from "@/lib/utils/tasks";
import { AUDIT_ACTION_META, DEFAULT_AUDIT_META } from "@/lib/utils/org-constants";

export function useDashboardData(orgId?: string) {
  const { data: openTodos } = useTodos({
    orgId: orgId || "",
    page: 1,
    pageSize: 1,
    status: "Open",
  });

  const { data: doneTodos } = useTodos({
    orgId: orgId || "",
    page: 1,
    pageSize: 1,
    status: "Done",
  });

  const { data: overdueTodos } = useTodos({
    orgId: orgId || "",
    page: 1,
    pageSize: 1,
    status: "Open",
    isOverdue: true,
  });

  const { data: membersData } = useOrgMembers(orgId);
  const { data: auditData } = useAuditLog(
    orgId ? { orgId, page: 1, pageSize: 5 } : { orgId: "", page: 1, pageSize: 5 }
  );

  const openCount = openTodos?.todos.totalCount ?? 0;
  const doneCount = doneTodos?.todos.totalCount ?? 0;
  const overdueCount = overdueTodos?.todos.totalCount ?? 0;
  const memberCount = membersData?.members.length ?? 0;
  const totalTasks = openCount + doneCount;
  const workloadProgress = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  const memberMap = useMemo(() => {
    const map = new Map<string, string>();
    membersData?.members?.forEach(m => map.set(m.userId, m.username));
    return map;
  }, [membersData]);

  const recentActivity = useMemo(() => {
    if (!auditData?.entries.items) return [];
    return auditData.entries.items.map((entry) => {
      const meta = AUDIT_ACTION_META[entry.action] ?? DEFAULT_AUDIT_META;
      return {
        id: entry.id,
        action: entry.action,
        label: meta.label,
        entityLabel: meta.entityLabel,
        icon: meta.icon,
        color: meta.color,
        actorName: memberMap.get(entry.actorUserId) || entry.actorUserId.slice(0, 8),
        time: new Date(entry.timestamp).toLocaleString(),
        additionalInfo: entry.additionalInfo,
      };
    });
  }, [auditData, memberMap]);

  const upcoming = useMemo(() => {
    if (!openTodos?.todos.items || !orgId) return [];
    const todayStr = getTodayStr();

    return openTodos.todos.items
      .filter((t) => t.dueDate && t.dueDate.split("T")[0] >= todayStr)
      .slice(0, 4)
      .map((todo) => {
        const task = mapTodoDtoToTask(todo, orgId);
        return {
          task: task.title,
          project: "", // This would need to be fetched from somewhere
          date: todo.dueDate ? todo.dueDate.split("T")[0] : "",
        };
      });
  }, [openTodos, orgId]);

  return {
    stats: {
      openCount,
      doneCount,
      overdueCount,
      memberCount,
    },
    recentActivity,
    upcoming,
    workloadProgress,
    totalTasks,
  };
}