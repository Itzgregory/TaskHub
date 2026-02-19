import { CheckCircle2 } from "lucide-react";
import { TaskItem } from "./TaskItem";
import type { Task } from "../../lib/types";

interface TaskListProps {
  tasks: Task[];
  showProject?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

export function TaskList({
  tasks,
  showProject = false,
  emptyMessage = "No tasks here",
  emptyIcon,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
          style={{ backgroundColor: "var(--c-bacTer)" }}
        >
          {emptyIcon ?? (
            <CheckCircle2 className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />
          )}
        </div>
        <p className="text-sm font-medium" style={{ color: "var(--c-texTer)" }}>
          {emptyMessage}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--c-texDis)" }}>
          Add a new task to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5 animate-fade-in">
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} showProject={showProject} />
      ))}
    </div>
  );
}
