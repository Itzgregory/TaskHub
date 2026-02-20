import { useState } from "react";
import { format } from "date-fns";
import { Sun, Plus } from "lucide-react";
import { AppLayout } from "../../../components/layout/dashboard/AppLayout";
import { TaskList } from "../../../components/features/TaskList";
import { AddTaskButton } from "../../../components/features/AddTaskButton";
import { TaskFormModal } from "../../../components/features/TaskFormModal";
import { useTodos } from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth/AuthContext";
import { mapTodoDtoToTask } from "@/lib/api/mappers";
import { getTodayStr } from "@/lib/utils/tasks";

export default function TodayPage() {
  const { activeOrg } = useAuth();
  const [addingTask, setAddingTask] = useState(false);

  // Compute today's date string once — plain const since strings are immutable.
  const todayStr = getTodayStr();
  const today = new Date(todayStr); // stable Date for format() below

  // Fetch todos for today
  const { data: todosData, isLoading } = useTodos({
    orgId: activeOrg?.orgId || '',
    page: 1,
    pageSize: 100,
    includeArchived: false,
    includeDeleted: false,
  });

  const activeOrgId = activeOrg?.orgId;

  // Filter and map todos to tasks — no manual useMemo; let React Compiler optimise.
  const tasks = todosData?.todos.items
    ? todosData.todos.items
      .filter(todo => {
        if (!todo.dueDate) return false;
        const dueDateStr = todo.dueDate.split('T')[0];
        return dueDateStr === todayStr;
      })
      .map(todo => mapTodoDtoToTask(todo, activeOrgId))
      .sort((a, b) => {
        // Sort by priority weight, then by due date
        const priorityWeight = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 };
        const priorityDiff = priorityWeight[a.priority] - priorityWeight[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return (a.dueDate || '').localeCompare(b.dueDate || '');
      })
    : [];

  const doneTasks = tasks.filter(t => t.status === "done");
  const pendingTasks = tasks.filter(t => t.status !== "done");

  const progress = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

  if (!activeOrg) {
    return (
      <AppLayout title="Today" subtitle="Please select an organisation">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm" style={{ color: "var(--c-texTer)" }}>No organisation selected.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={format(today, "EEEE, MMMM d")}
      subtitle={isLoading ? "Loading today's tasks..." : `${pendingTasks.length} pending · ${doneTasks.length} done`}
    >
      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs" style={{ color: "var(--c-texTer)" }}>Today's progress</span>
            <span className="text-xs font-mono" style={{ color: "var(--c-texSec)" }}>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--c-bacTer)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                backgroundColor: progress === 100 ? "var(--c-greTexAccPri)" : "var(--c-bluTexAccPri)",
              }}
            />
          </div>
        </div>
      )}

      <TaskList
        tasks={pendingTasks}
        emptyMessage="No tasks for today"
        emptyIcon={<Sun className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />}
      />

      <AddTaskButton onClick={() => setAddingTask(true)} />

      {doneTasks.length > 0 && (
        <div className="mt-8">
          <h3
            className="text-xs font-semibold uppercase tracking-wider mb-2 px-3"
            style={{ color: "var(--c-texTer)" }}
          >
            Completed ({doneTasks.length})
          </h3>
          <div style={{ opacity: 0.6 }}>
            <TaskList tasks={doneTasks} />
          </div>
        </div>
      )}

      {addingTask && (
        <TaskFormModal
          defaultDueDate={todayStr}
          onClose={() => setAddingTask(false)}
        />
      )}
    </AppLayout>
  );
}
