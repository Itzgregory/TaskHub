import { useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import { format } from "date-fns";
import { AppLayout } from "../../../components/layout/dashboard/AppLayout";
import { TaskItem } from "../../../components/features/TaskItem";
import { TaskFormModal } from "../../../components/features/TaskFormModal";
import { useStore } from "../../../lib/store";
import type { Task } from "../../../lib/types";

function groupByDate(tasks: Task[]): Record<string, Task[]> {
  return tasks.reduce((acc, task) => {
    const key = task.dueDate ?? "no-date";
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {} as Record<string, Task[]>);
}

function formatGroupDate(dateStr: string): string {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  if (dateStr === tomorrow) return "Tomorrow";
  const d = new Date(dateStr + "T00:00:00");
  return format(d, "EEEE, MMMM d");
}

export default function UpcomingPage() {
  const { getUpcomingTasks } = useStore();
  const [addingTask, setAddingTask] = useState(false);

  const tasks = getUpcomingTasks();
  const grouped = groupByDate(tasks);
  const sortedDates = Object.keys(grouped).sort();

  return (
    <AppLayout title="Upcoming" subtitle="Future tasks with due dates">
      {sortedDates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
            style={{ backgroundColor: "var(--c-bacTer)" }}
          >
            <CalendarDays className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--c-texTer)" }}>Nothing upcoming</p>
          <p className="text-xs mt-1" style={{ color: "var(--c-texDis)" }}>Add tasks with future due dates</p>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {sortedDates.map(date => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <h2
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--c-texSec)" }}
                >
                  {date === "no-date" ? "No Date" : formatGroupDate(date)}
                </h2>
                <div className="flex-1 h-px" style={{ backgroundColor: "var(--c-borPri)" }} />
                <span
                  className="text-xs font-mono"
                  style={{ color: "var(--c-texDis)" }}
                >
                  {grouped[date].length}
                </span>
              </div>
              <div className="space-y-0.5">
                {grouped[date].map(task => (
                  <TaskItem key={task.id} task={task} showProject />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setAddingTask(true)}
        className="flex items-center gap-2 mt-4 px-3 py-2 text-sm rounded-lg transition-colors w-full"
        style={{ color: "var(--c-texTer)" }}
        onMouseOver={e => (e.currentTarget.style.backgroundColor = "var(--c-bacTer)")}
        onMouseOut={e => (e.currentTarget.style.backgroundColor = "")}
      >
        <Plus className="w-4 h-4" style={{ color: "var(--c-texDis)" }} />
        Add task
      </button>

      {addingTask && <TaskFormModal onClose={() => setAddingTask(false)} />}
    </AppLayout>
  );
}
