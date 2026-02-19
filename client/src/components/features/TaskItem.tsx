import { useState } from "react";
import { Calendar, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { TaskFormModal } from "./TaskFormModal";
import type { Priority, Task } from "../../lib/types";
import { actions, useStore } from "../../lib/store";

const PRIORITY_DOT: Record<Priority, string> = {
  urgent: "var(--c-redTexAccPri)",
  high: "var(--c-oraTexAccPri)",
  medium: "var(--c-yelTexAccPri)",
  low: "var(--c-greTexAccPri)",
  none: "var(--c-texDis)",
};

function formatDate(dateStr: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  if (dateStr === today) return "Today";
  if (dateStr === tomorrow) return "Tomorrow";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isOverdue(dateStr: string): boolean {
  return dateStr < new Date().toISOString().slice(0, 10);
}

interface TaskItemProps {
  task: Task;
  showProject?: boolean;
}

export function TaskItem({ task, showProject }: TaskItemProps) {
  const { state, dispatch } = useStore();
  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isDone = task.status === "done";
  const project = state.projects.find(p => p.id === task.projectId);

  const handleToggle = () => dispatch(actions.toggleTask(task.id));
  const handleDelete = () => { dispatch(actions.deleteTask(task.id)); setMenuOpen(false); };

  return (
    <>
      <div className={`task-row group ${isDone ? "completed" : ""}`}>
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className={`task-checkbox ${isDone ? "checked" : ""}`}
          aria-label={isDone ? "Mark incomplete" : "Mark complete"}
        >
          {isDone && (
            <svg className="w-2.5 h-2.5 animate-check-bounce" fill="none" viewBox="0 0 10 10" style={{ color: "white" }}>
              <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <span
              className="task-title text-sm leading-relaxed flex-1"
              style={{ color: isDone ? "var(--c-texTer)" : "var(--c-texPri)" }}
            >
              {task.title}
            </span>
          </div>
          {task.description && !isDone && (
            <p
              className="text-xs mt-0.5 line-clamp-1"
              style={{ color: "var(--c-texTer)" }}
            >
              {task.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {task.priority !== "none" && (
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: PRIORITY_DOT[task.priority] }}
                title={task.priority}
              />
            )}

            {task.dueDate && (
              <span
                className="flex items-center gap-0.5 text-[11px] font-medium"
                style={{
                  color: isOverdue(task.dueDate) && !isDone
                    ? "var(--c-redTexSec)"
                    : "var(--c-texTer)"
                }}
              >
                <Calendar className="w-3 h-3" />
                {formatDate(task.dueDate)}
              </span>
            )}

            {showProject && project && (
              <span
                className="text-[11px] font-medium px-1.5 py-0.5 rounded-md"
                style={{
                  color: project.color,
                  backgroundColor: project.color + "22",
                }}
              >
                {project.name}
              </span>
            )}

            {task.tags.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="text-[11px]"
                style={{ color: "var(--c-texDis)" }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Row actions */}
        <div className="relative flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditing(true)}
            className="p-1 rounded transition-colors"
            style={{ color: "var(--c-texTer)" }}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = "var(--c-bacTer)")}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = "")}
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setMenuOpen(m => !m)}
            className="p-1 rounded transition-colors"
            style={{ color: "var(--c-texTer)" }}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = "var(--c-bacTer)")}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = "")}
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-7 z-20 rounded-lg py-1 w-36 animate-scale-in"
              style={{
                backgroundColor: "var(--c-bacPri)",
                border: "1px solid var(--c-borPri)",
                boxShadow: "var(--c-shaMD)",
              }}
            >
              <button
                onClick={() => { setEditing(true); setMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2"
                style={{ color: "var(--c-texSec)" }}
                onMouseOver={e => (e.currentTarget.style.backgroundColor = "var(--c-bacTer)")}
                onMouseOut={e => (e.currentTarget.style.backgroundColor = "")}
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={handleDelete}
                className="w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2"
                style={{ color: "var(--c-redTexAccPri)" }}
                onMouseOver={e => (e.currentTarget.style.backgroundColor = "var(--c-redBacSec)")}
                onMouseOut={e => (e.currentTarget.style.backgroundColor = "")}
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {editing && <TaskFormModal task={task} onClose={() => setEditing(false)} />}
    </>
  );
}
