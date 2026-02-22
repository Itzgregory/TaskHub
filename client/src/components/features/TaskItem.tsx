import { useState } from "react";
import { Calendar, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { TaskFormModal } from "./TaskFormModal";
import type { Priority, Task } from "../../lib/types";
import { useStore } from "../../lib/store";
import { useToggleTodoStatus, useSoftDeleteTodo, useOrgMembers } from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatRelativeDate, getTodayStr } from "@/lib/utils/tasks";
import { Button } from "@/components/ui/button";

const PRIORITY_DOT: Record<Priority, string> = {
  urgent: "var(--c-redTexAccPri)",
  high: "var(--c-oraTexAccPri)",
  medium: "var(--c-yelTexAccPri)",
  low: "var(--c-greTexAccPri)",
  none: "var(--c-texDis)",
};

function formatDate(dateStr: string): string {
  return formatRelativeDate(dateStr, "MMM d");
}

function isOverdue(dateStr: string): boolean {
  return dateStr < getTodayStr();
}

/** Returns up to 2 uppercase initials from a username or userId */
function getInitials(name: string): string {
  const parts = name.trim().split(/[\s._-]+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

interface TaskItemProps {
  task: Task;
  showProject?: boolean;
}

export function TaskItem({ task, showProject }: TaskItemProps) {
  const { state } = useStore();
  const { activeOrg } = useAuth();
  const { toast } = useToast();
  const toggleMutation = useToggleTodoStatus();
  const deleteMutation = useSoftDeleteTodo();

  const { data: membersData } = useOrgMembers(activeOrg?.orgId);
  const memberMap = new Map(membersData?.members.map(m => [m.userId, m.username]) ?? []);

  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isDone = task.status === "done";
  const project = state.projects.find(p => p.id === task.projectId);

  const assigneeName = task.assignedToUserId
    ? (memberMap.get(task.assignedToUserId) ?? task.assignedToUserId.slice(0, 8))
    : null;

  const handleToggle = async () => {
    if (!activeOrg?.orgId || toggleMutation.isPending) return;

    try {
      await toggleMutation.mutateAsync({
        id: task.id,
        data: {
          id: task.id,
          orgId: activeOrg.orgId,
          expectedVersion: task.version,
        },
      });
    } catch (err) {
      toast({
        title: "Failed to update task",
        description: err instanceof Error ? err.message : "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!activeOrg?.orgId) return;

    try {
      await deleteMutation.mutateAsync({
        id: task.id,
        orgId: activeOrg.orgId,
        version: task.version,
      });
      setMenuOpen(false);
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      });
    } catch (err) {
      toast({
        title: "Failed to delete task",
        description: err instanceof Error ? err.message : "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

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

            {/* Assignee badge */}
            {assigneeName && (
              <span
                className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold flex-shrink-0"
                title={`Assigned to ${assigneeName}`}
                style={{
                  backgroundColor: "var(--c-bluBacSec)",
                  color: "var(--c-bluTexAccPri)",
                  border: "1px solid var(--c-bluTexAccPri)",
                }}
              >
                {getInitials(assigneeName)}
              </span>
            )}
          </div>
        </div>

        {/* Row actions */}
        <div className="relative flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditing(true)}
            className="h-7 w-7"
            style={{ color: "var(--c-texTer)" }}
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(m => !m)}
            className="h-7 w-7"
            style={{ color: "var(--c-texTer)" }}
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </Button>
          {menuOpen && (
            <div
              className="absolute right-0 top-7 z-20 rounded-lg py-1 w-36 animate-scale-in"
              style={{
                backgroundColor: "var(--c-bacPri)",
                border: "1px solid var(--c-borPri)",
                boxShadow: "var(--c-shaMD)",
              }}
            >
              <Button
                variant="ghost"
                onClick={() => { setEditing(true); setMenuOpen(false); }}
                className="w-full justify-start gap-2 h-auto px-3 py-2 rounded-none text-sm font-normal"
                style={{ color: "var(--c-texSec)" }}
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </Button>
              <Button
                variant="ghost"
                onClick={handleDelete}
                className="w-full justify-start gap-2 h-auto px-3 py-2 rounded-none text-sm font-normal hover:bg-[var(--c-redBacSec)]"
                style={{ color: "var(--c-redTexAccPri)" }}
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {editing && (
        <TaskFormModal
          task={task}
          defaultOrgId={activeOrg?.orgId}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}
