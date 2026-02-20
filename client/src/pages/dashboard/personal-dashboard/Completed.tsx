
import { CheckCircle2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { AppLayout } from "../../../components/layout/dashboard/AppLayout";
import { TaskItem } from "../../../components/features/TaskItem";
import { useStore, actions } from "../../../lib/store";
import type { Task } from "../../../lib/types";

function groupByCompletedDate(tasks: Task[]): Record<string, Task[]> {
  return tasks.reduce((acc, task) => {
    const key = task.completedAt?.slice(0, 10) ?? "unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {} as Record<string, Task[]>);
}

export default function CompletedPage() {
  const { getCompletedTasks, dispatch } = useStore();
  const tasks = getCompletedTasks();
  const grouped = groupByCompletedDate(tasks);
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const clearAll = () => tasks.forEach(t => dispatch(actions.deleteTask(t.id)));

  return (
    <AppLayout title="Completed" subtitle={`${tasks.length} completed task${tasks.length !== 1 ? "s" : ""}`}>
      {tasks.length > 0 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: "var(--c-redTexSec)" }}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = "var(--c-redBacSec)")}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = "")}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear all
          </button>
        </div>
      )}

      {sortedDates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
            style={{ backgroundColor: "var(--c-bacTer)" }}
          >
            <CheckCircle2 className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--c-texTer)" }}>No completed tasks yet</p>
          <p className="text-xs mt-1" style={{ color: "var(--c-texDis)" }}>Complete tasks to see them here</p>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {sortedDates.map(date => {
            const today = new Date().toISOString().slice(0, 10);
            const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
            let label = format(new Date(date + "T00:00:00"), "MMMM d, yyyy");
            if (date === today) label = "Today";
            if (date === yesterday) label = "Yesterday";

            return (
              <div key={date}>
                <div className="flex items-center gap-3 mb-3">
                  <h2
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--c-texSec)" }}
                  >
                    {label}
                  </h2>
                  <div className="flex-1 h-px" style={{ backgroundColor: "var(--c-borPri)" }} />
                  <span className="text-xs font-mono" style={{ color: "var(--c-texDis)" }}>
                    {grouped[date].length}
                  </span>
                </div>
                <div className="space-y-0.5" style={{ opacity: 0.75 }}>
                  {grouped[date].map(task => (
                    <TaskItem key={task.id} task={task} showProject />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
