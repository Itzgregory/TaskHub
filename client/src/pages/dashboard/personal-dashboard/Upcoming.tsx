import { useMemo, useState } from "react";
import { CalendarDays, Calendar } from "lucide-react";
import { AppLayout } from "../../../components/layout/dashboard/AppLayout";
import { AddTaskButton } from "../../../components/features/AddTaskButton";
import { TaskFormModal } from "../../../components/features/TaskFormModal";
import { EmptyState } from "../../../components/features/EmptyState";
import { TaskTableRow } from "@/components/features/TaskTableRow";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTodos } from "@/lib/api/hooks";
import { mapTodoDtoToTask } from "@/lib/api/mappers";
import { groupByDueDate, formatRelativeDate, getTodayStr } from "@/lib/utils/tasks";
import { useTaskToggle } from "@/lib/hooks/useTaskToggle";
import { useOrgMemberMap } from "@/lib/hooks/useOrgMemberMap";
import type { Task } from "@/lib/types";

export default function UpcomingPage() {
  const { activeOrg } = useAuth();
  const [addingTask, setAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { data, isLoading } = useTodos({
    orgId: activeOrg?.orgId || "",
    page: 1,
    pageSize: 100,
    status: "Open",
    sortBy: "dueDate",
    ascending: true,
  });

  const memberMap = useOrgMemberMap(activeOrg?.orgId);
  const { toggle, isToggling } = useTaskToggle(activeOrg?.orgId ?? "");

  const tasks = useMemo(() => {
    if (!data?.todos.items || !activeOrg) return [];
    const todayStr = getTodayStr();
    return data.todos.items
      .filter(todo => todo.dueDate && todo.dueDate.split("T")[0] > todayStr)
      .map(todo => mapTodoDtoToTask(todo, activeOrg.orgId));
  }, [data, activeOrg]);

  const grouped = groupByDueDate(tasks);
  const sortedDates = Object.keys(grouped).sort();

  if (!activeOrg) {
    return (
      <AppLayout title="Upcoming" subtitle="Please select an organisation">
        <EmptyState icon={<CalendarDays className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />} title="No organisation selected." />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Upcoming"
      subtitle={isLoading ? "Loading upcoming tasks..." : `${tasks.length} task${tasks.length !== 1 ? "s" : ""} with future due dates`}
    >
      {sortedDates.length === 0 ? (
        <EmptyState icon={<CalendarDays className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />} title="Nothing upcoming" description="Add tasks with future due dates" />
      ) : (
        <div className="space-y-6">
          {sortedDates.map(date => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-3.5 h-3.5" style={{ color: "var(--c-texTer)" }} />
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>
                  {date === "no-date" ? "No Date" : formatRelativeDate(date, "EEEE, MMMM d")}
                </h3>
                <span className="text-xs font-mono px-1.5 py-0.5 rounded-md" style={{ backgroundColor: "var(--c-bacTer)", color: "var(--c-texTer)" }}>
                  {grouped[date].length}
                </span>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--c-borPri)" }}>
                <Table>
                  <TableHeader>
                    <TableRow style={{ backgroundColor: "var(--c-bacTer)" }}>
                      <TableHead className="w-8" />
                      <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Task</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Priority</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Assignee</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Tags</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-right" style={{ color: "var(--c-texTer)" }}>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grouped[date].map(task => (
                      <TaskTableRow key={task.id} task={task} memberMap={memberMap} onEdit={setEditingTask} onToggle={toggle} isToggling={isToggling} showDueDate={false} showTags />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddTaskButton onClick={() => setAddingTask(true)} />
      {addingTask && <TaskFormModal onClose={() => setAddingTask(false)} />}
      {editingTask && <TaskFormModal task={editingTask} onClose={() => setEditingTask(null)} />}
    </AppLayout>
  );
}