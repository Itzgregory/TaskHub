import { CheckCircle2, Circle, AlertCircle, Calendar, MoreHorizontal, Pencil } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils/getInitials";
import { PRIORITY_COLOR } from "@/lib/utils/priorityColours";
import { getTodayStr } from "@/lib/utils/tasks";
import type { Task } from "@/lib/types";

interface TaskTableRowProps {
  task: Task;
  memberMap: Map<string, string>;
  onEdit: (task: Task) => void;
  onToggle: (task: Task) => void;
  isToggling: boolean;
  showDueDate?: boolean;
  showTags?: boolean;
}

export function TaskTableRow({
  task,
  memberMap,
  onEdit,
  onToggle,
  isToggling,
  showDueDate = true,
  showTags = false,
}: TaskTableRowProps) {
  const today = getTodayStr();
  const isDone = task.status === "done";
  const overdue = task.dueDate && task.dueDate < today && !isDone;
  const assigneeName = task.assignedToUserId ? memberMap.get(task.assignedToUserId) : null;

  return (
    <TableRow
      style={{ backgroundColor: "var(--c-bacSec)", borderColor: "var(--c-borPri)" }}
      className="hover:bg-[var(--c-bacTer)]"
    >
      {/* Status icon */}
      <TableCell className="w-8 pr-0">
        {isDone
          ? <CheckCircle2 className="w-4 h-4" style={{ color: "var(--c-greTexAccPri)" }} />
          : overdue
            ? <AlertCircle className="w-4 h-4" style={{ color: "var(--c-redTexAccPri)" }} />
            : <Circle className="w-4 h-4" style={{ color: "var(--c-texDis)" }} />
        }
      </TableCell>

      {/* Title + description */}
      <TableCell>
        <p
          className="text-sm font-medium"
          style={{
            color: isDone ? "var(--c-texTer)" : "var(--c-texPri)",
            textDecoration: isDone ? "line-through" : "none",
          }}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs truncate max-w-xs mt-0.5" style={{ color: "var(--c-texTer)" }}>
            {task.description}
          </p>
        )}
      </TableCell>

      {/* Priority */}
      <TableCell>
        {task.priority !== "none"
          ? <span className="text-xs font-medium capitalize" style={{ color: PRIORITY_COLOR[task.priority] }}>{task.priority}</span>
          : <span className="text-xs" style={{ color: "var(--c-texDis)" }}>—</span>}
      </TableCell>

      {/* Due date (optional) */}
      {showDueDate && (
        <TableCell>
          {task.dueDate ? (
            <span className="flex items-center gap-1 text-xs" style={{ color: overdue ? "var(--c-redTexAccPri)" : "var(--c-texTer)" }}>
              <Calendar className="w-3 h-3" />
              {task.dueDate}
            </span>
          ) : <span className="text-xs" style={{ color: "var(--c-texDis)" }}>—</span>}
        </TableCell>
      )}

      {/* Assignee */}
      <TableCell>
        {assigneeName ? (
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
              style={{ backgroundColor: "var(--c-bluBacSec)", color: "var(--c-bluTexAccPri)" }}
            >
              {getInitials(assigneeName)}
            </div>
            <span className="text-xs" style={{ color: "var(--c-texTer)" }}>{assigneeName}</span>
          </div>
        ) : <span className="text-xs" style={{ color: "var(--c-texDis)" }}>—</span>}
      </TableCell>

      {/* Tags (optional) */}
      {showTags && (
        <TableCell>
          {task.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ backgroundColor: "var(--c-bacTer)", color: "var(--c-texTer)" }}>
                  #{tag}
                </span>
              ))}
            </div>
          ) : <span className="text-xs" style={{ color: "var(--c-texDis)" }}>—</span>}
        </TableCell>
      )}

      {/* Actions */}
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="w-3.5 h-3.5" style={{ color: "var(--c-texTer)" }} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" style={{ backgroundColor: "var(--c-bacEle)", borderColor: "var(--c-borPri)" }}>
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Pencil className="w-3.5 h-3.5 mr-2" /> Edit task
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onToggle(task)} disabled={isToggling}>
              {isDone
                ? <><Circle className="w-3.5 h-3.5 mr-2" /> Mark as Open</>
                : <><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Mark as Done</>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}