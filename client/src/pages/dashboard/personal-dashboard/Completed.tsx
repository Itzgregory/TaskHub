import { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { AppLayout } from "../../../components/layout/dashboard/AppLayout";
import { TaskFormModal } from "../../../components/features/TaskFormModal";
import { EmptyState } from "../../../components/features/EmptyState";
import { TaskTableRow } from "@/components/features/TaskTableRow";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTodos } from "@/lib/api/hooks";
import { mapTodoDtoToTask } from "@/lib/api/mappers";
import { groupByCompletedDate, formatRelativeDate } from "@/lib/utils/tasks";
import { useTaskToggle } from "@/lib/hooks/useTaskToggle";
import { useOrgMemberMap } from "@/lib/hooks/useOrgMemberMap";
import type { Task } from "@/lib/types";

export default function CompletedPage() {
  const { activeOrg } = useAuth();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { data, isLoading } = useTodos({
    orgId: activeOrg?.orgId || "",
    page: 1,
    pageSize: 100,
    status: "Done",
    sortBy: "updatedAt",
    ascending: false,
  });

  const memberMap = useOrgMemberMap(activeOrg?.orgId);
  const { toggle, isToggling } = useTaskToggle(activeOrg?.orgId ?? "");

  const tasks = useMemo(() => {
    if (!data?.todos.items || !activeOrg) return [];
    return data.todos.items.map(todo => mapTodoDtoToTask(todo, activeOrg.orgId));
  }, [data, activeOrg]);

  const grouped = groupByCompletedDate(tasks);
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (!activeOrg) {
    return (
      <AppLayout title="Completed" subtitle="Please select an organisation">
        <EmptyState icon={<CheckCircle2 className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />} title="No organisation selected." />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Completed"
      subtitle={isLoading ? "Loading..." : `${tasks.length} completed task${tasks.length !== 1 ? "s" : ""}`}
    >
      {sortedDates.length === 0 ? (
        <EmptyState icon={<CheckCircle2 className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />} title="No completed tasks yet" description="Complete tasks to see them here" />
      ) : (
        <div className="space-y-6">
          {sortedDates.map(date => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "var(--c-greTexAccPri)" }} />
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>
                  {formatRelativeDate(date)}
                </h3>
                <span className="text-xs font-mono px-1.5 py-0.5 rounded-md" style={{ backgroundColor: "var(--c-bacTer)", color: "var(--c-texTer)" }}>
                  {grouped[date].length}
                </span>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--c-borPri)", opacity: 0.8 }}>
                <Table>
                  <TableHeader>
                    <TableRow style={{ backgroundColor: "var(--c-bacTer)" }}>
                      <TableHead className="w-8" />
                      <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Task</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Priority</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Due Date</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Assignee</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-right" style={{ color: "var(--c-texTer)" }}>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grouped[date].map(task => (
                      <TaskTableRow key={task.id} task={task} memberMap={memberMap} onEdit={setEditingTask} onToggle={toggle} isToggling={isToggling} showDueDate showTags={false} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingTask && <TaskFormModal task={editingTask} onClose={() => setEditingTask(null)} />}
    </AppLayout>
  );
}