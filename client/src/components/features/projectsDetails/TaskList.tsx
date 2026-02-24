import { useState, useMemo } from "react";
import { Plus, Search, CheckCircle2, Circle, AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Task } from "@/lib/types";
import { getInitials } from "@/lib/utils/getInitials";
import { PRIORITY_COLOR } from "@/lib/utils/priorityColours";

interface TaskListProps {
  tasks: Task[];
  memberMap: Map<string, string>;
  today: string;
  onAddTask: () => void;
}

export function TaskList({ tasks, memberMap, today, onAddTask }: TaskListProps) {
  const [taskSearch, setTaskSearch] = useState("");

  const filteredTasks = useMemo(() => {
    if (!taskSearch.trim()) return tasks;
    
    const searchLower = taskSearch.toLowerCase();
    return tasks.filter(task => 
      task.title.toLowerCase().includes(searchLower) ||
      task.description?.toLowerCase().includes(searchLower) ||
      task.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }, [tasks, taskSearch]);

  return (
    <div
      className="lg:col-span-3 rounded-xl p-5 flex flex-col h-[600px]"
      style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}
    >
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-sm font-semibold" style={{ color: "var(--c-texPri)" }}>
          Tasks ({filteredTasks.length})
        </h3>
        <Button
          size="sm"
          onClick={onAddTask}
          style={{ backgroundColor: "var(--c-bluBacSec)", color: "var(--c-bluTexAccPri)" }}
        >
          <Plus className="w-3 h-3" /> Add Task
        </Button>
      </div>

      <div className="relative mb-3 flex-shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--c-texTer)" }} />
        <Input
          type="text"
          placeholder="Search tasks..."
          value={taskSearch}
          onChange={(e) => setTaskSearch(e.target.value)}
          className="pl-9 h-8 text-sm"
          style={{ backgroundColor: "var(--c-bacTer)", borderColor: "var(--c-borPri)" }}
        />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-1">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm" style={{ color: "var(--c-texDis)" }}>
              {taskSearch ? "No tasks match your search" : "No tasks yet. Create one to get started."}
            </p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const isDone = task.status === "done";
            const overdue = !!(task.dueDate && task.dueDate < today && !isDone); // Force boolean
            const assigneeName = task.assignedToUserId ? memberMap.get(task.assignedToUserId) : null;

            return (
              <TaskListItem
                key={task.id}
                task={task}
                isDone={isDone}
                overdue={overdue}
                assigneeName={assigneeName}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

interface TaskListItemProps {
  task: Task;
  isDone: boolean;
  overdue: boolean; // Required boolean, not optional
  assigneeName: string | null | undefined;
}

function TaskListItem({ task, isDone, overdue, assigneeName }: TaskListItemProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-[var(--c-bacTer)] cursor-pointer">
      {isDone ? (
        <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "var(--c-greTexAccPri)" }} />
      ) : overdue ? (
        <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "var(--c-redTexAccPri)" }} />
      ) : (
        <Circle className="w-4 h-4 flex-shrink-0" style={{ color: "var(--c-texDis)" }} />
      )}

      <div className="flex-1 min-w-0">
        <span
          className="text-sm font-medium truncate block"
          style={{
            color: isDone ? "var(--c-texTer)" : "var(--c-texPri)",
            textDecoration: isDone ? "line-through" : "none",
          }}
        >
          {task.title}
        </span>
      </div>

      <div className="flex items-center gap-2.5 flex-shrink-0">
        {task.priority !== "none" && (
          <span
            className="text-[10px] font-medium capitalize"
            style={{ color: PRIORITY_COLOR[task.priority] }}
          >
            {task.priority}
          </span>
        )}
        {task.dueDate && (
          <span
            className="flex items-center gap-0.5 text-[10px]"
            style={{ color: overdue ? "var(--c-redTexSec)" : "var(--c-texDis)" }}
          >
            <Calendar className="w-3 h-3" />
            {task.dueDate}
          </span>
        )}
        {assigneeName && (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
            title={assigneeName}
            style={{ backgroundColor: "var(--c-bluBacSec)", color: "var(--c-bluTexAccPri)" }}
          >
            {getInitials(assigneeName)}
          </div>
        )}
      </div>
    </div>
  );
}