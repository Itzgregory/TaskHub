import { useState } from "react";
import { format } from "date-fns";
import { Sun, Plus } from "lucide-react";
import { AppLayout } from "../../../components/layout/dashboard/AppLayout";
import { TaskList } from "../../../components/features/TaskList";
import { TaskFormModal } from "../../../components/features/TaskFormModal";
import { useStore } from "../../../lib/store";

export default function TodayPage() {
  const { getTodayTasks } = useStore();
  const [addingTask, setAddingTask] = useState(false);

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const tasks = getTodayTasks();
  const doneTasks = tasks.filter(t => t.status === "done");
  const pendingTasks = tasks.filter(t => t.status !== "done");

  return (
    <AppLayout
      title="Today"
      subtitle={`${format(today, "EEEE")}, ${format(today, "MMMM d, yyyy")}`}
    >
      {tasks.length > 0 && (
        <div className="mb-6 flex items-center gap-3">
          <div
            className="flex-1 h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: "var(--c-bacTer)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${tasks.length ? (doneTasks.length / tasks.length) * 100 : 0}%`,
                backgroundColor: "var(--c-greTexAccPri)",
              }}
            />
          </div>
          <span
            className="text-xs font-mono flex-shrink-0"
            style={{ color: "var(--c-texTer)" }}
          >
            {doneTasks.length}/{tasks.length}
          </span>
        </div>
      )}

      <TaskList
        tasks={pendingTasks}
        showProject
        emptyMessage="All done for today! 🎉"
        emptyIcon={<Sun className="w-6 h-6" style={{ color: "var(--c-yelTexAccPri)" }} />}
      />

      <button
        onClick={() => setAddingTask(true)}
        className="flex items-center gap-2 mt-3 px-3 py-2 text-sm rounded-lg transition-colors w-full group"
        style={{ color: "var(--c-texTer)" }}
        onMouseOver={e => (e.currentTarget.style.backgroundColor = "var(--c-bacTer)")}
        onMouseOut={e => (e.currentTarget.style.backgroundColor = "")}
      >
        <Plus className="w-4 h-4" style={{ color: "var(--c-texDis)" }} />
        Add task
      </button>

      {doneTasks.length > 0 && (
        <div className="mt-8">
          <h3
            className="text-xs font-semibold uppercase tracking-wider mb-2 px-3"
            style={{ color: "var(--c-texTer)" }}
          >
            Completed ({doneTasks.length})
          </h3>
          <TaskList tasks={doneTasks} showProject />
        </div>
      )}

      {addingTask && (
        <TaskFormModal defaultDueDate={todayStr} onClose={() => setAddingTask(false)} />
      )}
    </AppLayout>
  );
}
