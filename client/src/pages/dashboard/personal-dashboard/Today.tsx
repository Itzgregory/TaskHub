import { useState } from "react";
import { format } from "date-fns";
import { Sun } from "lucide-react";
import { AppLayout } from "../../../components/layout/dashboard/AppLayout";
import { AddTaskButton } from "../../../components/features/AddTaskButton";
import { TaskFormModal } from "../../../components/features/TaskFormModal";
import { EmptyState } from "../../../components/features/EmptyState";
import { TaskTableRow } from "@/components/features/TaskTableRow";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTodos } from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth/AuthContext";
import { mapTodoDtoToTask } from "@/lib/api/mappers";
import { getTodayStr } from "@/lib/utils/tasks";
import { useTaskToggle } from "@/lib/hooks/useTaskToggle";
import { useOrgMemberMap } from "@/lib/hooks/useOrgMemberMap";
import type { Task } from "@/lib/types";

function TaskTable({ rows, memberMap, onEdit, onToggle, isToggling, faded }: {
  rows: Task[];
  memberMap: Map<string, string>;
  onEdit: (task: Task) => void;
  onToggle: (task: Task) => void;
  isToggling: boolean;
  faded?: boolean;
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--c-borPri)", opacity: faded ? 0.6 : 1 }}>
      <Table>
        <TableHeader>
          <TableRow style={{ backgroundColor: "var(--c-bacTer)" }}>
            <TableHead className="w-8" />
            <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Task</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Priority</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Assignee</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-right" style={{ color: "var(--c-texTer)" }}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(task => (
            <TaskTableRow key={task.id} task={task} memberMap={memberMap} onEdit={onEdit} onToggle={onToggle} isToggling={isToggling} showDueDate={false} showTags={false} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function TodayPage() {
  const { activeOrg } = useAuth();
  const [addingTask, setAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const todayStr = getTodayStr();
  const today = new Date(todayStr);

  const { data: todosData, isLoading } = useTodos({
    orgId: activeOrg?.orgId || "",
    page: 1,
    pageSize: 100,
    includeArchived: false,
    includeDeleted: false,
  });

  const memberMap = useOrgMemberMap(activeOrg?.orgId);
  const { toggle, isToggling } = useTaskToggle(activeOrg?.orgId ?? "");

  const tasks = todosData?.todos.items
    ? todosData.todos.items
        .filter(todo => todo.dueDate && todo.dueDate.split("T")[0] === todayStr)
        .map(todo => mapTodoDtoToTask(todo, activeOrg?.orgId ?? ""))
        .sort((a, b) => {
          const w: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 };
          const diff = w[a.priority] - w[b.priority];
          return diff !== 0 ? diff : (a.dueDate || "").localeCompare(b.dueDate || "");
        })
    : [];

  const doneTasks = tasks.filter(t => t.status === "done");
  const pendingTasks = tasks.filter(t => t.status !== "done");
  const progress = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

  if (!activeOrg) {
    return (
      <AppLayout title="Today" subtitle="Please select an organisation">
        <EmptyState icon={<Sun className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />} title="No organisation selected." />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={format(today, "EEEE, MMMM d")}
      subtitle={isLoading ? "Loading today's tasks..." : `${pendingTasks.length} pending · ${doneTasks.length} done`}
    >
      {tasks.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs" style={{ color: "var(--c-texTer)" }}>Today's progress</span>
            <span className="text-xs font-mono" style={{ color: "var(--c-texSec)" }}>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--c-bacTer)" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: progress === 100 ? "var(--c-greTexAccPri)" : "var(--c-bluTexAccPri)" }} />
          </div>
        </div>
      )}

      {pendingTasks.length === 0 && doneTasks.length === 0 ? (
        <EmptyState icon={<Sun className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />} title="No tasks for today" description="Add a task with today's due date to see it here" />
      ) : (
        <div className="space-y-6">
          {pendingTasks.length > 0 && <TaskTable rows={pendingTasks} memberMap={memberMap} onEdit={setEditingTask} onToggle={toggle} isToggling={isToggling} />}
          {doneTasks.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--c-texTer)" }}>Completed ({doneTasks.length})</h3>
              <TaskTable rows={doneTasks} memberMap={memberMap} onEdit={setEditingTask} onToggle={toggle} isToggling={isToggling} faded />
            </div>
          )}
        </div>
      )}

      <AddTaskButton onClick={() => setAddingTask(true)} />
      {addingTask && <TaskFormModal defaultDueDate={todayStr} onClose={() => setAddingTask(false)} />}
      {editingTask && <TaskFormModal task={editingTask} onClose={() => setEditingTask(null)} />}
    </AppLayout>
  );
}